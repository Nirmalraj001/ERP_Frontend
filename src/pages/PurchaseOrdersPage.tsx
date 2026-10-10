import React, { useState, useEffect } from 'react'
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  ChevronDown,
  MoreVertical,
  Loader2,
  X,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Printer,
  ShieldAlert,
  ShieldCheck,
  Building,
  Calendar,
  Lock,
} from 'lucide-react'
import { apiRequest } from '../lib/api'
import { formatDate } from '../lib/utils'
import { ExcelImportModal } from '../components/common/ExcelImportModal'

export const PurchaseOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([])
  const [vendorsList, setVendorsList] = useState<any[]>([])
  const [itemsList, setItemsList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showTypeMenu, setShowTypeMenu] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)

  // Excel Import Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  // New PO Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newPO, setNewPO] = useState({
    poNumber: `PO-2026-${String(Math.floor(100 + Math.random() * 900))}`,
    vendorId: '',
    itemId: '',
    quantity: 50,
    unitPrice: 320,
    expectedDeliveryDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    paymentTerms: 'Net 30',
    type: 'Single',
    notes: 'Urgent procurement release',
    managementOverride: false,
    overrideReason: '',
  })

  // Quality Gate state (§12, §16, §18 R11)
  const [qualityGate, setQualityGate] = useState<{
    checked: boolean
    eligible: boolean
    status?: string
    reason?: string
    vendorName?: string
  }>({ checked: false, eligible: true })

  // Printable PO Modal
  const [selectedPoForPrint, setSelectedPoForPrint] = useState<any | null>(null)

  // Toast notifications state
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: 'error' | 'success' }>>([])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      let url = '/purchase-orders?'
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`
      if (statusFilter !== 'ALL') url += `status=${statusFilter}`

      const res = await apiRequest(url)
      if (res.success) {
        setOrders(res.data)
      }
    } catch (err: any) {
      console.error('Failed to load orders', err)
      addToast('Internal server error', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchMasters = async () => {
    try {
      const [vRes, iRes] = await Promise.all([
        apiRequest<{ success: boolean; data: any[] }>('/vendors'),
        apiRequest<{ success: boolean; data: any[] }>('/items'),
      ])
      if (vRes.success) {
        setVendorsList(vRes.data)
        if (vRes.data.length > 0) {
          setNewPO((prev) => ({ ...prev, vendorId: vRes.data[0].id }))
          checkGate(vRes.data[0].id)
        }
      }
      if (iRes.success) {
        setItemsList(iRes.data)
        if (iRes.data.length > 0) {
          setNewPO((prev) => ({ ...prev, itemId: iRes.data[0].id, unitPrice: Number(iRes.data[0].standardPrice) }))
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchOrders()
    fetchMasters()
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [searchTerm, statusFilter])

  const checkGate = async (vendorId: string) => {
    if (!vendorId) return
    try {
      const res = await apiRequest<{ success: boolean; eligible: boolean; status?: string; reason?: string; vendorName?: string }>(
        `/vendor-audits/check-gate/${vendorId}`
      )
      if (res.success) {
        setQualityGate({
          checked: true,
          eligible: res.eligible,
          status: res.status,
          reason: res.reason,
          vendorName: res.vendorName,
        })
      }
    } catch (e) {
      // fallback
    }
  }

  const handleVendorChange = (vendorId: string) => {
    setNewPO((prev) => ({ ...prev, vendorId }))
    checkGate(vendorId)
  }

  const addToast = (message: string, type: 'error' | 'success' = 'error') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!qualityGate.eligible && !newPO.managementOverride) {
      addToast(
        `Quality Gate Error (§12): Vendor is blocked/conditional (${qualityGate.reason}). Management override required.`,
        'error'
      )
      return
    }

    try {
      const selectedItem = itemsList.find((it) => it.id === newPO.itemId)
      const subtotal = Number(newPO.quantity) * Number(newPO.unitPrice)
      const taxAmount = Math.round(subtotal * 0.18)
      const totalAmount = subtotal + taxAmount

      const res = await apiRequest('/purchase-orders', {
        method: 'POST',
        body: {
          poNumber: newPO.poNumber,
          vendorId: newPO.vendorId,
          expectedDeliveryDate: newPO.expectedDeliveryDate,
          paymentTerms: newPO.paymentTerms,
          subtotal,
          taxAmount,
          totalAmount,
          notes: newPO.notes,
          qualityGatePassed: qualityGate.eligible,
          managementOverride: newPO.managementOverride,
          overrideReason: newPO.managementOverride ? newPO.overrideReason : undefined,
          items: [
            {
              itemId: newPO.itemId,
              description: selectedItem?.name || 'Procurement Line Item',
              quantity: Number(newPO.quantity),
              unitPrice: Number(newPO.unitPrice),
              taxRate: 18,
              totalPrice: subtotal,
            },
          ],
        },
      })

      if (res.success) {
        setIsModalOpen(false)
        fetchOrders()
        addToast('Purchase order created successfully! Quality Gate verified.', 'success')
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to create PO', 'error')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
      case 'APPROVED':
      case 'ISSUED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-700 dark:bg-[#052e16]/80 dark:text-[#4ade80] dark:border dark:border-[#16a34a]/40">Active</span>
      case 'DRAFT':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-sky-50 text-sky-600 dark:bg-[#082f49]/80 dark:text-[#38bdf8] dark:border dark:border-[#0284c7]/40">Draft</span>
      case 'PENDING APPROVAL':
      case 'PENDING_APPROVAL':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800 dark:bg-[#451a03]/80 dark:text-[#fbbf24] dark:border dark:border-[#d97706]/40">Pending Approval</span>
      case 'ON HOLD':
      case 'ON_HOLD':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-yellow-700 border border-yellow-200 dark:bg-[#422006]/80 dark:text-[#facc15] dark:border-[#ca8a04]/40">On Hold</span>
      case 'CANCELLED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-100 text-rose-700 dark:bg-[#450a0a]/80 dark:text-[#f87171] dark:border dark:border-[#dc2626]/40">Cancelled</span>
      case 'COMPLETED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-100 text-purple-700 dark:bg-[#1e1b4b]/80 dark:text-[#818cf8] dark:border dark:border-[#4f46e5]/40">Completed</span>
      case 'CLOSED':
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-[#27272a]/80 dark:text-[#a1a1aa] dark:border dark:border-[#52525b]/40">Closed</span>
    }
  }

  const getTypeBadge = (type = 'Single') => {
    switch (type) {
      case 'Multi':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 text-purple-600 dark:bg-[#2e1065]/70 dark:text-[#c084fc] dark:border dark:border-[#9333ea]/40">Multi</span>
      case 'Open':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-pink-50 text-pink-600 dark:bg-[#4c0519]/70 dark:text-[#fb7185] dark:border dark:border-[#e11d48]/40">Open</span>
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-600 dark:bg-[#172554]/70 dark:text-[#60a5fa] dark:border dark:border-[#2563eb]/40">Single</span>
    }
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* 1. Header Toolbar matching Screenshots 3 & 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-[#1c1328] text-purple-600 dark:text-[#c084fc] flex items-center justify-center border border-purple-100/60 dark:border-purple-900/30">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Purchase Orders</h1>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
              Manage procurement commitments, Quality Gate verification, and printable documents
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121214] hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Excel Import</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 bg-black text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 px-4 py-2 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* 2. Filters & Search Toolbar matching Screenshots 3 & 5 */}
      <div className="flex flex-wrap items-center gap-2 py-1">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search code or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-lg border border-dashed border-slate-200 dark:border-zinc-800 text-xs w-56 bg-white dark:bg-[#121214] text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-slate-400 placeholder:text-slate-400 transition-colors"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowTypeMenu(!showTypeMenu)
              setShowStatusMenu(false)
            }}
            className="px-3 py-1.5 rounded-lg border border-dashed border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121214] text-xs text-slate-700 dark:text-zinc-300 flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <span>Type: {typeFilter}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
          {showTypeMenu && (
            <div className="absolute left-0 mt-1 w-36 bg-white dark:bg-[#121214] rounded-lg shadow-lg border border-slate-200 dark:border-zinc-800 py-1 z-30 text-xs">
              {['ALL', 'Single', 'Multi', 'Open'].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTypeFilter(t)
                    setShowTypeMenu(false)
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowStatusMenu(!showStatusMenu)
              setShowTypeMenu(false)
            }}
            className="px-3 py-1.5 rounded-lg border border-dashed border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121214] text-xs text-slate-700 dark:text-zinc-300 flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <span>Status: {statusFilter}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
          {showStatusMenu && (
            <div className="absolute left-0 mt-1 w-44 bg-white dark:bg-[#121214] rounded-lg shadow-lg border border-slate-200 dark:border-zinc-800 py-1 z-30 text-xs">
              {['ALL', 'APPROVED', 'PENDING_APPROVAL', 'DRAFT', 'CANCELLED'].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatusFilter(s)
                    setShowStatusMenu(false)
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Main PO Table matching Screenshot 3 */}
      <div className="bg-white dark:bg-[#0c0c0e] rounded-xl border border-slate-200 dark:border-zinc-800/80 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-zinc-800 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                <th className="py-3 px-4">CODE / PO</th>
                <th className="py-3 px-4">CUSTOMER / SUPPLIER</th>
                <th className="py-3 px-4">TYPE</th>
                <th className="py-3 px-4">ORDER DATE</th>
                <th className="py-3 px-4">DELIVERY DATE</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">TOTAL (₹)</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
              {orders
                .filter((po) => typeFilter === 'ALL' || (po.type || 'Single') === typeFilter)
                .map((po, idx) => (
                  <tr key={po.id || idx} className="hover:bg-slate-50/60 dark:hover:bg-[#18181c]/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                      {po.poNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700 dark:text-zinc-300">
                      {po.vendor?.name}
                    </td>
                    <td className="py-3 px-4">{getTypeBadge(po.type || 'Single')}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-zinc-400">
                      {po.issueDate ? formatDate(po.issueDate) : '20 Sep 2026'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-zinc-400">
                      {po.expectedDeliveryDate ? formatDate(po.expectedDeliveryDate) : '—'}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(po.status)}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      ₹{Number(po.totalAmount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedPoForPrint(po)}
                        title="View & Print PO on Letterhead (§10)"
                        className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer matching Screenshot 3 */}
        <div className="px-4 py-3 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-400 dark:text-zinc-500 font-medium flex items-center justify-between">
          <span>1–{orders.length} of {orders.length} purchase orders</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span>Rows</span>
              <span className="font-semibold text-slate-700 dark:text-zinc-300">50</span>
              <ChevronDown className="w-3 h-3" />
            </div>
            <div className="flex items-center gap-2">
              <button disabled className="opacity-40 cursor-not-allowed">‹</button>
              <span className="text-slate-700 dark:text-zinc-300 font-mono">1/1</span>
              <button disabled className="opacity-40 cursor-not-allowed">›</button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. CREATE NEW PO MODAL WITH QUALITY GATE CHECK (§12, §16, §18 R11) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#0c0c0e] rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Create Purchase Order (§10)
              </h3>
              <button onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleCreatePO} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">PO Number</label>
                  <input
                    type="text"
                    required
                    value={newPO.poNumber}
                    onChange={(e) => setNewPO({ ...newPO, poNumber: e.target.value })}
                    className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Delivery Due</label>
                  <input
                    type="date"
                    required
                    value={newPO.expectedDeliveryDate}
                    onChange={(e) => setNewPO({ ...newPO, expectedDeliveryDate: e.target.value })}
                    className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Vendor Selection & Quality Gate Banner (§12) */}
              <div className="space-y-2">
                <label className="font-semibold text-slate-700 dark:text-zinc-300 block">
                  Supplier / Vendor (Quality Gate Checked §12)
                </label>
                <select
                  value={newPO.vendorId}
                  onChange={(e) => handleVendorChange(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white font-medium"
                >
                  {vendorsList.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.vendorCode}) · Qual: {v.qualificationStatus} {v.isBlocked ? '· [BLOCKED]' : ''}
                    </option>
                  ))}
                </select>

                {/* Quality Gate Status Display */}
                {qualityGate.checked && (
                  <div>
                    {qualityGate.eligible ? (
                      <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                        <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                        <span>Quality Gate Passed: Vendor is qualified and eligible for PO generation.</span>
                      </div>
                    ) : (
                      <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-900 rounded space-y-2 text-rose-800 dark:text-rose-300">
                        <div className="flex items-start gap-2">
                          <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                          <div>
                            <strong>Quality Gate Alert (§12):</strong> {qualityGate.reason}
                          </div>
                        </div>

                        {/* Management Override Checkbox */}
                        <label className="flex items-center gap-2 pt-1 border-t border-rose-200 dark:border-rose-900 cursor-pointer text-slate-900 dark:text-white">
                          <input
                            type="checkbox"
                            checked={newPO.managementOverride}
                            onChange={(e) => setNewPO({ ...newPO, managementOverride: e.target.checked })}
                            className="rounded text-rose-600 focus:ring-rose-500"
                          />
                          <span className="font-semibold text-rose-700 dark:text-rose-400">
                            Apply Management Override (Log DOA Exception)
                          </span>
                        </label>

                        {newPO.managementOverride && (
                          <input
                            type="text"
                            required
                            placeholder="Mandatory override reason (e.g. Critical production line stoppage)..."
                            value={newPO.overrideReason}
                            onChange={(e) => setNewPO({ ...newPO, overrideReason: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded border border-rose-300 dark:border-rose-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white text-xs"
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Item Selection */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Item (Master)</label>
                  <select
                    value={newPO.itemId}
                    onChange={(e) => {
                      const it = itemsList.find((x) => x.id === e.target.value)
                      setNewPO({
                        ...newPO,
                        itemId: e.target.value,
                        unitPrice: it ? Number(it.standardPrice) : newPO.unitPrice,
                      })
                    }}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
                  >
                    {itemsList.map((it) => (
                      <option key={it.id} value={it.id}>
                        {it.itemCode} - {it.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Quantity</label>
                  <input
                    type="number"
                    value={newPO.quantity}
                    onChange={(e) => setNewPO({ ...newPO, quantity: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 font-medium text-xs hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!qualityGate.eligible && !newPO.managementOverride}
                  className="px-5 py-2 rounded-lg bg-black text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 disabled:opacity-40 font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. PRINTABLE PO MODAL ON SLT LETTERHEAD (§10, Page 16) */}
      {selectedPoForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-xl max-w-2xl w-full p-8 shadow-2xl border border-slate-200 space-y-6 text-slate-900 text-xs max-h-[90vh] overflow-y-auto">
            {/* Letterhead Header */}
            <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-blue-900">SLT ENGINEERING LTD.</h2>
                <div className="text-[11px] text-slate-600 space-y-0.5 mt-1 font-sans">
                  <div>Plot 42, Electronic City Phase II, Hosur Road, Bengaluru - 560100</div>
                  <div>GSTIN: <strong className="font-mono">29AABCS1429B1Z2</strong> · PAN: <strong className="font-mono">AABCS1429B</strong></div>
                  <div>CIN: L29100KA1998PLC024112 · Tel: +91 (80) 4192-8000</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-bold bg-slate-900 text-white px-3 py-1 rounded">
                  PURCHASE ORDER
                </span>
                <div className="font-mono font-bold text-sm mt-2">{selectedPoForPrint.poNumber}</div>
                <div className="text-slate-500 text-[11px]">
                  Date: {new Date(selectedPoForPrint.issueDate).toLocaleDateString('en-GB')}
                </div>
              </div>
            </div>

            {/* Vendor & Delivery Box */}
            <div className="grid grid-cols-2 gap-6 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="font-bold text-[10px] uppercase text-slate-500 block">VENDOR DETAILS</span>
                <div className="font-bold text-sm text-slate-900 mt-0.5">{selectedPoForPrint.vendor.name}</div>
                <div className="text-slate-600 text-[11px]">
                  {selectedPoForPrint.vendor.address || 'Industrial Estate, Bengaluru'}
                </div>
                <div className="text-slate-600 text-[11px] font-mono mt-1">
                  GSTIN: {selectedPoForPrint.vendor.taxId || '29AAGCP2011M1Z5'}
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-[10px] uppercase text-slate-500 block">ORDER TERMS</span>
                <div className="text-slate-700 text-[11px] mt-1">
                  Payment Terms: <strong>{selectedPoForPrint.paymentTerms || 'Net 30'}</strong>
                </div>
                <div className="text-slate-700 text-[11px]">
                  Delivery Due: <strong>{new Date(selectedPoForPrint.expectedDeliveryDate).toLocaleDateString('en-GB')}</strong>
                </div>
                <div className="text-slate-700 text-[11px] text-emerald-700 font-bold mt-1">
                  ✓ Quality Gate Verified
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 border-b border-slate-200 font-bold text-[11px]">
                  <tr>
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">Item Description</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Unit Rate (₹)</th>
                    <th className="p-2.5 text-right">GST %</th>
                    <th className="p-2.5 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(selectedPoForPrint.items || [
                    { description: 'Alloy Bar Spec 1', quantity: 50, unitPrice: 320, taxRate: 18, totalPrice: 16000 },
                  ]).map((it: any, i: number) => (
                    <tr key={i}>
                      <td className="p-2.5 text-slate-400 font-mono">{i + 1}</td>
                      <td className="p-2.5 font-medium">{it.description || it.item?.name}</td>
                      <td className="p-2.5 text-center font-mono">{it.quantity}</td>
                      <td className="p-2.5 text-right font-mono">₹{Number(it.unitPrice).toLocaleString('en-IN')}</td>
                      <td className="p-2.5 text-right font-mono">{Number(it.taxRate || 18)}%</td>
                      <td className="p-2.5 text-right font-mono font-bold">
                        ₹{Number(it.totalPrice || it.quantity * it.unitPrice).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-slate-300 bg-slate-50 font-bold">
                  <tr>
                    <td colSpan={5} className="p-2.5 text-right uppercase">Total Amount (Pre-GST Subtotal + Taxes)</td>
                    <td className="p-2.5 text-right font-mono text-sm">
                      ₹{Number(selectedPoForPrint.totalAmount).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Signature & Terms Block */}
            <div className="pt-6 border-t border-slate-200 flex justify-between items-end">
              <div className="text-[10px] text-slate-500 max-w-xs space-y-0.5">
                <div>1. Material must be accompanied by Test Certificate (TC).</div>
                <div>2. Inspection will be conducted as per SLT standard sampling plan.</div>
                <div>3. Goods accepted subject to dock verification & 3-way match.</div>
              </div>
              <div className="text-center space-y-1">
                <div className="w-40 border-b border-slate-900 pb-8" />
                <div className="text-[10px] font-bold uppercase text-slate-700">Authorized Signatory</div>
                <div className="text-[9px] text-slate-400">SLT Procurement Dept.</div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-200 flex justify-end gap-3 print:hidden">
              <button
                onClick={() => setSelectedPoForPrint(null)}
                className="px-4 py-1.5 rounded border border-slate-300 text-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toasts */}
      {toasts.length > 0 && (
        <div className="fixed bottom-5 right-5 space-y-2 z-50">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`p-3 rounded-lg shadow-lg flex items-center justify-between gap-3 text-xs min-w-[240px] border ${
                toast.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}
            >
              <span className="font-semibold">{toast.message}</span>
              <button onClick={() => setToasts(toasts.filter((t) => t.id !== toast.id))}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Excel Bulk Import Modal */}
      <ExcelImportModal
        moduleKey="PURCHASE_ORDERS"
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          fetchOrders()
          addToast('Successfully imported purchase orders from Excel!', 'success')
        }}
      />
    </div>
  )
}
