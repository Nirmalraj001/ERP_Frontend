import React, { useState, useEffect } from 'react'
import {
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  ChevronDown,
  ArrowLeft,
  User,
  Layers,
  MapPin,
  CreditCard,
  Receipt,
  History,
  MoreVertical,
  Loader2,
  Trash2,
  LayoutGrid,
  List,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  X,
  Sparkles,
  Building,
  ExternalLink,
} from 'lucide-react'
import { apiRequest } from '../lib/api'
import { formatCurrency, formatDate } from '../lib/utils'
import { ExcelImportModal } from '../components/common/ExcelImportModal'

export const RequisitionsPage: React.FC = () => {
  const [requisitions, setRequisitions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [viewMode, setViewMode] = useState<'LIST' | 'CREATE'>('LIST')
  const [displayMode, setDisplayMode] = useState<'BOARD' | 'LIST'>('BOARD')
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [selectedPR, setSelectedPR] = useState<any | null>(null)
  const [suggestedSources, setSuggestedSources] = useState<any | null>(null)
  const [loadingSources, setLoadingSources] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Form Tabs matching Screenshot 4
  const [activeTab, setActiveTab] = useState<'General' | 'Line Items' | 'Cost Center' | 'Terms' | 'Timeline'>('General')

  // Form Fields matching Screenshot 4
  const [formData, setFormData] = useState({
    title: '',
    type: 'Standard',
    category: 'Direct Materials',
    priority: 1,
    contactPerson: 'David Sterling',
    phone: '+91-98000-12345',
    department: 'Manufacturing Operations',
  })

  const [items, setItems] = useState([
    { description: 'Grade 5 Aerospace Titanium Billet (100mm)', quantity: 25, estimatedUnitPrice: 450, uom: 'EA' },
  ])

  const [submitting, setSubmitting] = useState(false)

  const fetchPRs = async () => {
    setLoading(true)
    try {
      let url = '/requisitions?'
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`
      if (statusFilter !== 'ALL') url += `status=${statusFilter}`

      const res = await apiRequest(url)
      if (res.success) {
        setRequisitions(res.data)
      }
    } catch (err) {
      console.error('Failed to load requisitions', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPRs()
  }, [searchTerm, statusFilter])

  const openPRDetail = async (pr: any) => {
    setSelectedPR(pr)
    setSuggestedSources(null)
    setLoadingSources(true)
    try {
      const res = await apiRequest(`/requisitions/${pr.id}/suggested-sources`)
      if (res.success) {
        setSuggestedSources(res.data)
      }
    } catch (err) {
      console.error('Failed to fetch suggested sources', err)
    } finally {
      setLoadingSources(false)
    }
  }

  const handleApprovePR = async (prId: string) => {
    setActionLoading(true)
    try {
      const res = await apiRequest(`/requisitions/${prId}/status`, {
        method: 'PATCH',
        body: { status: 'APPROVED' },
      })
      if (res.success) {
        await fetchPRs()
        if (selectedPR && selectedPR.id === prId) {
          setSelectedPR({ ...selectedPR, status: 'APPROVED' })
        }
      }
    } catch (err) {
      alert('Failed to approve PR: ' + err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleIssueRFQ = async (prId: string) => {
    setActionLoading(true)
    try {
      const res = await apiRequest(`/requisitions/${prId}/issue-rfq`, {
        method: 'POST',
      })
      if (res.success) {
        alert(res.message || 'RFQ issued successfully!')
        await fetchPRs()
        if (selectedPR && selectedPR.id === prId) {
          setSelectedPR({ ...selectedPR, status: 'INQUIRY_CREATED' })
        }
      }
    } catch (err) {
      alert('Failed to issue RFQ: ' + err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleConvertToPO = async (prId: string, vendorId?: string) => {
    setActionLoading(true)
    try {
      const res = await apiRequest(`/requisitions/${prId}/convert-to-po`, {
        method: 'POST',
        body: { vendorId },
      })
      if (res.success) {
        alert(res.message || 'Purchase Order converted successfully!')
        await fetchPRs()
        if (selectedPR && selectedPR.id === prId) {
          setSelectedPR({ ...selectedPR, status: 'PO_CREATED' })
        }
      }
    } catch (err: any) {
      alert('Conversion Error: ' + (err.message || err))
    } finally {
      setActionLoading(false)
    }
  }

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, estimatedUnitPrice: 100, uom: 'EA' }])
  }

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  const calculateTotal = () => {
    return items.reduce((acc, it) => acc + (Number(it.quantity) || 0) * (Number(it.estimatedUnitPrice) || 0), 0)
  }

  const handleCreatePR = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await apiRequest('/requisitions', {
        method: 'POST',
        body: {
          title: formData.title,
          department: formData.department,
          priority: formData.priority >= 2 ? 'HIGH' : 'MEDIUM',
          items: items.map((it) => ({
            description: it.description,
            quantity: Number(it.quantity),
            estimatedUnitPrice: Number(it.estimatedUnitPrice),
            uom: it.uom,
          })),
        },
      })

      if (res.success) {
        setViewMode('LIST')
        fetchPRs()
      }
    } catch (err) {
      console.error('Failed to submit PR', err)
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-700 dark:bg-[#052e16]/80 dark:text-[#4ade80] dark:border dark:border-[#16a34a]/40">
            Approved
          </span>
        )
      case 'DRAFT':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-sky-50 text-sky-600 dark:bg-[#082f49]/80 dark:text-[#38bdf8] dark:border dark:border-[#0284c7]/40">
            Draft
          </span>
        )
      case 'PENDING_APPROVAL':
      case 'SUBMITTED':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-800 dark:bg-[#451a03]/80 dark:text-[#fbbf24] dark:border dark:border-[#d97706]/40">
            Pending Approval
          </span>
        )
      case 'INQUIRY_CREATED':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-100 text-indigo-700 dark:bg-[#1e1b4b]/80 dark:text-[#818cf8] dark:border dark:border-[#4f46e5]/40">
            RFQ Issued
          </span>
        )
      case 'PO_CREATED':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-100 text-purple-700 dark:bg-[#2e1065]/80 dark:text-[#c084fc] dark:border dark:border-[#7c3aed]/40">
            Converted to PO
          </span>
        )
      case 'REJECTED':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-100 text-rose-700 dark:bg-[#450a0a]/80 dark:text-[#f87171] dark:border dark:border-[#dc2626]/40">
            Rejected
          </span>
        )
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-[#18181b] dark:text-[#a1a1aa] dark:border dark:border-[#27272a]">
            {status}
          </span>
        )
    }
  }

  // Stat Strip Calculations (§7)
  const openPRCount = requisitions.filter((r) => r.status !== 'PO_CREATED' && r.status !== 'REJECTED').length
  const pendingApprovalCount = requisitions.filter((r) => r.status === 'PENDING_APPROVAL' || r.status === 'SUBMITTED').length
  const urgentCount = requisitions.filter((r) => r.priority === 'URGENT' || r.priority === 'HIGH').length
  const totalIndentedValue = requisitions.reduce((acc, r) => acc + (Number(r.totalEstimatedAmount) || 0), 0)

  // Kanban Columns Mapping (§7 & Screenshot Page 9)
  const kanbanColumns = [
    {
      id: 'DRAFT',
      title: 'DRAFT',
      filter: (r: any) => r.status === 'DRAFT',
    },
    {
      id: 'PENDING_APPROVAL',
      title: 'PENDING APPROVAL',
      filter: (r: any) => r.status === 'PENDING_APPROVAL' || r.status === 'SUBMITTED',
    },
    {
      id: 'APPROVED',
      title: 'APPROVED',
      filter: (r: any) => r.status === 'APPROVED',
    },
    {
      id: 'RFQ_ISSUED',
      title: 'RFQ ISSUED',
      filter: (r: any) => r.status === 'INQUIRY_CREATED',
    },
    {
      id: 'CONVERTED_TO_PO',
      title: 'CONVERTED TO PO',
      filter: (r: any) => r.status === 'PO_CREATED',
    },
  ]

  // RENDER SCREENSHOT 4 FORM
  if (viewMode === 'CREATE') {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Form Header matching Screenshot 4 */}
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => setViewMode('LIST')}
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-[#1c1328] text-purple-600 dark:text-[#c084fc] flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">New Purchase Requisition</h1>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">Demand origination · budget check and approval routing</p>
          </div>
        </div>

        {/* Form Tabs */}
        <div className="border-b border-slate-200 dark:border-zinc-800 flex items-center gap-6 overflow-x-auto select-none">
          {[
            { name: 'General', icon: User },
            { name: 'Line Items', icon: Layers },
            { name: 'Cost Center', icon: MapPin },
            { name: 'Terms', icon: CreditCard },
            { name: 'Timeline', icon: History },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.name

            return (
              <button
                key={tab.name}
                type="button"
                onClick={() => setActiveTab(tab.name as any)}
                className={`flex items-center gap-2 pb-2.5 text-xs font-semibold cursor-pointer transition-colors relative whitespace-nowrap ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.name}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}
              </button>
            )
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleCreatePR} className="space-y-5 bg-white dark:bg-[#0c0c0e] p-6 rounded-lg border border-slate-200 dark:border-zinc-800/80 transition-colors">
          {activeTab === 'General' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Requisition Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Critical Replacement Spares for Line 3"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121214] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-zinc-600 placeholder:text-slate-400 dark:placeholder:text-zinc-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-[#121214] text-slate-800 dark:text-zinc-100"
                  >
                    <option value="Single">Single Item Delivery</option>
                    <option value="Multi">Multi-Shipment Batch</option>
                    <option value="Blanket">Blanket Annual Order</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-[#121214] text-slate-800 dark:text-zinc-100"
                  >
                    <option value="Production">Production</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="EHS">EHS</option>
                    <option value="Despatch">Despatch</option>
                    <option value="Quality">Quality</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-[#121214] text-slate-800 dark:text-zinc-100"
                  >
                    <option value={0}>Low</option>
                    <option value={1}>Normal</option>
                    <option value={2}>High</option>
                    <option value={3}>Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Requester Contact
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121214] text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Line Items' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">Materials & Quantities</span>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-semibold rounded-lg text-slate-700 dark:text-zinc-200 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line</span>
                </button>
              </div>

              <div className="space-y-3">
                {items.map((it, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#121214] rounded-lg border border-slate-100 dark:border-zinc-800">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Item Description / Specification"
                        value={it.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0e] text-xs text-slate-800 dark:text-zinc-100"
                      />
                    </div>
                    <div className="w-20">
                      <input
                        type="number"
                        placeholder="Qty"
                        value={it.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0e] text-xs text-slate-800 dark:text-zinc-100"
                      />
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        placeholder="Est. Rate"
                        value={it.estimatedUnitPrice}
                        onChange={(e) => handleItemChange(idx, 'estimatedUnitPrice', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0e] text-xs text-slate-800 dark:text-zinc-100"
                      />
                    </div>
                    <div className="w-20 text-right font-mono font-bold text-xs text-slate-800 dark:text-zinc-100">
                      ₹{((Number(it.quantity) || 0) * (Number(it.estimatedUnitPrice) || 0)).toLocaleString()}
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-red-500 hover:text-red-700 cursor-pointer p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2 text-xs font-bold text-slate-800 dark:text-zinc-200">
                Total Est. Value: ₹{calculateTotal().toLocaleString()}
              </div>
            </div>
          )}

          {activeTab === 'Cost Center' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-lg">
                <div className="font-bold text-emerald-800 dark:text-emerald-300">Department Budget Check</div>
                <div className="text-emerald-700 dark:text-emerald-400 text-[11px] mt-1">
                  Budget is checked against the originating department's balance. Requisition value: ₹{calculateTotal().toLocaleString()}. Available balance is sufficient.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Terms' && (
            <div className="space-y-3 text-xs">
              <label className="block font-semibold text-slate-700 dark:text-zinc-300">Purchase Justification & Terms</label>
              <textarea
                rows={3}
                placeholder="Required operational justification for audit..."
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121214] text-xs text-slate-800 dark:text-zinc-200"
              />
            </div>
          )}

          {activeTab === 'Timeline' && (
            <div className="text-xs text-slate-500 dark:text-zinc-400 py-4">
              Creation timestamp will be recorded automatically in the audit trail.
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setViewMode('LIST')}
              className="px-4 py-2 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Requisition'}
            </button>
          </div>
        </form>
      </div>
    )
  }

  // RENDER REQUISITIONS REGISTER (Board / List views per §7 & Screenshot Page 9)
  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header matching Screenshots 3 & 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-[#1c1328] text-purple-600 dark:text-[#c084fc] flex items-center justify-center border border-purple-100/60 dark:border-purple-900/30">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Purchase Requisitions</h1>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
              Demand origination · budget-checked, approval routed; converts to RFQ or directly to PO
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121214] hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Import</span>
          </button>

          {/* Board | List Toggle Button matching Screenshot 3 */}
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121214] p-0.5 shadow-2xs">
            <button
              onClick={() => setDisplayMode('BOARD')}
              className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                displayMode === 'BOARD'
                  ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setDisplayMode('LIST')}
              className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                displayMode === 'LIST'
                  ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          <button
            onClick={() => setViewMode('CREATE')}
            className="bg-black text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 rounded-lg px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Requisition</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Strip matching §7 and Screenshot Page 9 */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-[#0c0c0e] rounded-lg border border-slate-200 dark:border-zinc-800/80 p-3 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">OPEN REQUISITIONS</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{openPRCount}</div>
        </div>
        <div className="bg-white dark:bg-[#0c0c0e] rounded-lg border border-slate-200 dark:border-zinc-800/80 p-3 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">PENDING APPROVAL</div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{pendingApprovalCount}</div>
        </div>
        <div className="bg-white dark:bg-[#0c0c0e] rounded-lg border border-slate-200 dark:border-zinc-800/80 p-3 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">URGENT / HIGH</div>
          <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">{urgentCount}</div>
        </div>
        <div className="bg-white dark:bg-[#0c0c0e] rounded-lg border border-slate-200 dark:border-zinc-800/80 p-3 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">INDENTED VALUE</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">₹{(totalIndentedValue / 100000).toFixed(1)}L</div>
        </div>
        <div className="bg-white dark:bg-[#0c0c0e] rounded-lg border border-slate-200 dark:border-zinc-800/80 p-3 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">AVG PR → PO</div>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">6.4 days</div>
        </div>
      </div>

      {/* Filter Toolbar matching Screenshots 3 & 5 */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search PR No, title, dept..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-lg border border-dashed border-slate-200 dark:border-zinc-800 text-xs w-56 bg-white dark:bg-[#121214] text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-slate-400 placeholder:text-slate-400 transition-colors"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className="px-3 py-1.5 rounded-lg border border-dashed border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121214] text-xs text-slate-700 dark:text-zinc-300 flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Filter className="w-3 h-3 text-slate-400" />
            <span>Status: {statusFilter}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
          {showStatusMenu && (
            <div className="absolute top-9 left-0 bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800 rounded-lg shadow-lg py-1 w-44 z-30 text-xs">
              {['ALL', 'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'INQUIRY_CREATED', 'PO_CREATED', 'REJECTED'].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatusFilter(s)
                    setShowStatusMenu(false)
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 cursor-pointer"
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content: BOARD VIEW (Kanban) or LIST VIEW */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-zinc-500 bg-white dark:bg-[#0c0c0e] rounded-lg border border-slate-200 dark:border-zinc-800/80">
          <Loader2 className="w-5 h-5 animate-spin text-slate-600 dark:text-zinc-400" />
          <span className="text-xs">Loading requisitions...</span>
        </div>
      ) : displayMode === 'BOARD' ? (
        /* KANBAN BOARD VIEW (§7 & Screenshot Page 9) */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 items-start">
          {kanbanColumns.map((col) => {
            const colItems = requisitions.filter(col.filter)

            return (
              <div
                key={col.id}
                className="bg-slate-50/70 dark:bg-[#0c0c0e]/80 rounded-lg border border-slate-200 dark:border-zinc-800/80 p-2.5 flex flex-col min-h-[460px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80 dark:border-zinc-800">
                  <div className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 tracking-wide">
                    {col.title}
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                    {colItems.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="space-y-2 flex-1">
                  {colItems.length === 0 ? (
                    <div className="h-32 flex items-center justify-center text-[11px] text-slate-400 dark:text-zinc-600 border border-dashed border-slate-200 dark:border-zinc-800/80 rounded-md">
                      No requisitions
                    </div>
                  ) : (
                    colItems.map((pr) => {
                      const isUrgent = pr.priority === 'URGENT'
                      const isHigh = pr.priority === 'HIGH'
                      const isNormal = pr.priority === 'MEDIUM' || pr.priority === 'NORMAL'

                      return (
                        <div
                          key={pr.id}
                          onClick={() => openPRDetail(pr)}
                          className="bg-white dark:bg-[#121214] p-3 rounded-lg border border-slate-200/80 dark:border-zinc-800 shadow-2xs hover:border-blue-400 dark:hover:border-blue-500/50 hover:shadow-xs transition-all cursor-pointer space-y-2 group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                              {pr.prNumber}
                            </span>
                            <span className="text-[10px] font-bold text-slate-800 dark:text-zinc-200">
                              ₹{(Number(pr.totalEstimatedAmount) / 100000).toFixed(1)}L
                            </span>
                          </div>

                          <div>
                            <div className="text-xs font-semibold text-slate-800 dark:text-zinc-100 line-clamp-1">
                              {pr.title}
                            </div>
                            <div className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                              {pr.department} · {pr.requester?.fullName || 'Requester'}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-zinc-800/60">
                            {/* Priority Dot */}
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  isUrgent
                                    ? 'bg-rose-500'
                                    : isHigh
                                    ? 'bg-amber-500'
                                    : isNormal
                                    ? 'bg-blue-500'
                                    : 'bg-slate-400'
                                }`}
                              />
                              <span className="text-[10px] font-medium text-slate-500 dark:text-zinc-400">
                                {isUrgent ? 'Urgent' : isHigh ? 'High' : isNormal ? 'Normal' : 'Low'}
                              </span>
                            </div>

                            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                              {formatDate(pr.createdAt)}
                            </span>
                          </div>

                          {/* Quick Actions per Column */}
                          {col.id === 'APPROVED' && (
                            <div className="pt-1 flex items-center gap-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleIssueRFQ(pr.id)
                                }}
                                className="flex-1 py-1 rounded bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-semibold text-center cursor-pointer transition-colors"
                              >
                                Issue RFQ
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleConvertToPO(pr.id)
                                }}
                                className="flex-1 py-1 rounded bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold text-center cursor-pointer transition-colors"
                              >
                                Convert PO
                              </button>
                            </div>
                          )}

                          {col.id === 'PENDING_APPROVAL' && (
                            <div className="pt-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleApprovePR(pr.id)
                                }}
                                className="w-full py-1 rounded bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px] font-semibold text-center cursor-pointer transition-colors"
                              >
                                Approve PR
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* LIST VIEW TABLE */
        <div className="bg-white dark:bg-[#0c0c0e] rounded-lg border border-slate-200 dark:border-zinc-800/80 shadow-2xs overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  <th className="py-3 px-4">CODE</th>
                  <th className="py-3 px-4">TITLE & DESCRIPTION</th>
                  <th className="py-3 px-4">DEPARTMENT</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4">ORDER DATE</th>
                  <th className="py-3 px-4">EST. AMOUNT</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                {requisitions.map((pr, idx) => (
                  <tr
                    key={pr.id || idx}
                    onClick={() => openPRDetail(pr)}
                    className="hover:bg-slate-50/60 dark:hover:bg-[#18181c]/70 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-zinc-300">{pr.prNumber}</td>
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-white">
                      <div>{pr.title}</div>
                      <div className="text-[11px] text-slate-400 dark:text-zinc-500">{pr.requester?.fullName || 'Requester'}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-zinc-400">{pr.department}</td>
                    <td className="py-3 px-4">{getStatusBadge(pr.status)}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-zinc-400">{formatDate(pr.createdAt)}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(Number(pr.totalEstimatedAmount))}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openPRDetail(pr)
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-semibold text-xs cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
            1-{requisitions.length} of {requisitions.length} requisitions
          </div>
        </div>
      )}

      {/* PR DETAIL MODAL (§7 - pipeline, budget check, justification, suggested sources) */}
      {selectedPR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#0c0c0e] rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">{selectedPR.prNumber}</span>
                <span className="text-xs text-slate-400 dark:text-zinc-500">·</span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedPR.title}</h3>
              </div>
              <button
                onClick={() => setSelectedPR(null)}
                className="text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Pipeline Stage Bar (§7) */}
            <div className="p-3 bg-slate-50 dark:bg-[#121214] rounded-lg border border-slate-200 dark:border-zinc-800/80">
              <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                WORKFLOW PIPELINE
              </div>
              <div className="flex items-center justify-between text-xs">
                {['Draft', 'Pending Approval', 'Approved', 'RFQ Issued', 'Converted to PO'].map((step, idx) => {
                  const currentIdx =
                    selectedPR.status === 'DRAFT'
                      ? 0
                      : selectedPR.status === 'PENDING_APPROVAL' || selectedPR.status === 'SUBMITTED'
                      ? 1
                      : selectedPR.status === 'APPROVED'
                      ? 2
                      : selectedPR.status === 'INQUIRY_CREATED'
                      ? 3
                      : 4

                  const isPassed = idx <= currentIdx
                  const isCurrent = idx === currentIdx

                  return (
                    <div key={step} className="flex items-center gap-1.5 flex-1">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isPassed
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <span
                        className={`text-[10px] font-medium hidden sm:inline ${
                          isCurrent
                            ? 'text-blue-600 dark:text-blue-400 font-bold'
                            : isPassed
                            ? 'text-slate-700 dark:text-zinc-300'
                            : 'text-slate-400 dark:text-zinc-600'
                        }`}
                      >
                        {step}
                      </span>
                      {idx < 4 && <div className="h-0.5 flex-1 bg-slate-200 dark:bg-zinc-800 mx-1" />}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Department, Budget Check & Value */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#121214]">
                <div className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold">DEPARTMENT</div>
                <div className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedPR.department}</div>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#121214]">
                <div className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold">ESTIMATED VALUE</div>
                <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                  ₹{Number(selectedPR.totalEstimatedAmount).toLocaleString()}
                </div>
              </div>
              <div className="p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-950/20">
                <div className="text-emerald-700 dark:text-emerald-400 text-[10px] uppercase font-bold">BUDGET CHECK</div>
                <div className="font-bold text-emerald-800 dark:text-emerald-300 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approved & Committed</span>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 dark:text-zinc-300">Requisition Items</div>
              <div className="border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-[#121214] border-b border-slate-200 dark:border-zinc-800 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">
                    <tr>
                      <th className="py-2 px-3">Item / Description</th>
                      <th className="py-2 px-3 text-center">Qty</th>
                      <th className="py-2 px-3 text-right">Est. Rate</th>
                      <th className="py-2 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                    {selectedPR.items?.map((it: any, idx: number) => (
                      <tr key={it.id || idx}>
                        <td className="py-2 px-3 text-slate-800 dark:text-zinc-200 font-medium">{it.description}</td>
                        <td className="py-2 px-3 text-center text-slate-600 dark:text-zinc-400 font-mono">
                          {it.quantity} {it.uom || 'EA'}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-600 dark:text-zinc-400 font-mono">
                          ₹{Number(it.estimatedUnitPrice).toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-slate-800 dark:text-zinc-100 font-mono">
                          ₹{Number(it.estimatedTotalPrice || it.quantity * it.estimatedUnitPrice).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Suggested Sources (§7 "Suggested sources combine active rate contracts and top-scoring vendors") */}
            <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200/80 dark:border-blue-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-300">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Suggested Sources (Contracts & Top Qualified Vendors)</span>
                </div>
                {loadingSources && <Loader2 className="w-3 h-3 animate-spin text-blue-600" />}
              </div>

              {suggestedSources?.rateContracts?.length > 0 ? (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300">Active Rate Contracts:</div>
                  {suggestedSources.rateContracts.map((c: any) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between text-xs bg-white dark:bg-[#121214] p-2 rounded border border-blue-100 dark:border-blue-900/30"
                    >
                      <div>
                        <span className="font-bold text-slate-800 dark:text-zinc-200">{c.vendor?.name}</span>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 ml-1.5">({c.contractNumber})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 text-[11px]">Contracted Rate</span>
                        {selectedPR.status === 'APPROVED' && (
                          <button
                            onClick={() => handleConvertToPO(selectedPR.id, c.vendorId)}
                            className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-semibold hover:bg-blue-700 cursor-pointer"
                          >
                            Order on Contract
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {suggestedSources?.qualifiedVendors?.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300">Audited Qualified Suppliers:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {suggestedSources.qualifiedVendors.map((v: any) => (
                      <div
                        key={v.id}
                        className="bg-white dark:bg-[#121214] p-2 rounded border border-slate-200 dark:border-zinc-800 text-xs flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-zinc-200">{v.name}</div>
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400">Score: {v.rating} ⭐ · Qualified</div>
                        </div>
                        {selectedPR.status === 'APPROVED' && (
                          <button
                            onClick={() => handleConvertToPO(selectedPR.id, v.id)}
                            className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-black rounded text-[10px] font-semibold cursor-pointer"
                          >
                            Select
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800">
              <button
                onClick={() => setSelectedPR(null)}
                className="px-3 py-1.5 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {selectedPR.status === 'PENDING_APPROVAL' && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleApprovePR(selectedPR.id)}
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading ? 'Processing...' : 'Approve Requisition'}
                  </button>
                )}

                {selectedPR.status === 'APPROVED' && (
                  <>
                    <button
                      disabled={actionLoading}
                      onClick={() => handleIssueRFQ(selectedPR.id)}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
                    >
                      {actionLoading ? 'Processing...' : 'Issue RFQ'}
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={() => handleConvertToPO(selectedPR.id)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
                    >
                      {actionLoading ? 'Processing...' : 'Convert to PO'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Excel Bulk Import Modal */}
      <ExcelImportModal
        moduleKey="REQUISITIONS"
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          fetchPRs()
        }}
      />
    </div>
  )
}
