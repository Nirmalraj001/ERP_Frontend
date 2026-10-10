import React, { useState, useEffect } from 'react'
import {
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Plus,
  Shield,
  Layers,
  Search,
  Calendar,
  Building,
  DollarSign,
  TrendingUp,
} from 'lucide-react'
import { apiRequest } from '../lib/api'

interface ContractItem {
  id: string
  itemId: string
  contractedPrice: number
  minQuantity: number
  item: { itemCode: string; name: string; uom: string; standardPrice: number }
}

interface RateContract {
  id: string
  contractNumber: string
  title: string
  startDate: string
  endDate: string
  totalValue: number
  spentAmount: number
  drawdownPct: number
  remainingBalance: number
  daysRemaining: number
  validityStatus: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | string
  terms?: string
  vendor: { id: string; vendorCode: string; name: string; rating: number }
  items: ContractItem[]
}

export const RateContractsPage: React.FC = () => {
  const [contracts, setContracts] = useState<RateContract[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Maverick check state
  const [checkItem, setCheckItem] = useState('')
  const [checkVendor, setCheckVendor] = useState('')
  const [checkPrice, setCheckPrice] = useState('')
  const [maverickResult, setMaverickResult] = useState<any | null>(null)
  const [isCheckingMaverick, setIsCheckingMaverick] = useState(false)

  // Master Items & Vendors
  const [masterItems, setMasterItems] = useState<any[]>([])
  const [vendors, setVendors] = useState<any[]>([])

  // Create Contract Modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newContractForm, setNewContractForm] = useState({
    vendorId: '',
    title: 'FY27 Annual Rate Agreement',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    totalValue: '1500000',
    itemId: '',
    contractedPrice: '195',
    minQuantity: '50',
    terms: 'Fixed rates with 30-day payment terms',
  })

  useEffect(() => {
    fetchContracts()
    fetchMasters()
  }, [])

  const fetchContracts = async () => {
    setIsLoading(true)
    try {
      const res = await apiRequest<{ success: boolean; data: RateContract[] }>('/rate-contracts')
      if (res.success) setContracts(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMasters = async () => {
    try {
      const [itemsRes, vendorsRes] = await Promise.all([
        apiRequest<{ success: boolean; data: any[] }>('/items'),
        apiRequest<{ success: boolean; data: any[] }>('/vendors'),
      ])
      if (itemsRes.success) {
        setMasterItems(itemsRes.data)
        if (itemsRes.data.length > 0) {
          setCheckItem(itemsRes.data[0].id)
          setNewContractForm((prev) => ({ ...prev, itemId: itemsRes.data[0].id }))
        }
      }
      if (vendorsRes.success) {
        setVendors(vendorsRes.data)
        if (vendorsRes.data.length > 0) {
          setCheckVendor(vendorsRes.data[0].id)
          setNewContractForm((prev) => ({ ...prev, vendorId: vendorsRes.data[0].id }))
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleTestMaverick = async () => {
    if (!checkItem) return
    setIsCheckingMaverick(true)
    try {
      const res = await apiRequest<{ success: boolean; isMaverick: boolean; warningMessage?: string; contractDetails?: any }>(
        `/rate-contracts/check-maverick?itemId=${checkItem}&vendorId=${checkVendor}&proposedUnitPrice=${checkPrice}`
      )
      if (res.success) {
        setMaverickResult(res)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsCheckingMaverick(false)
    }
  }

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await apiRequest('/rate-contracts', {
        method: 'POST',
        body: {
          vendorId: newContractForm.vendorId,
          title: newContractForm.title,
          startDate: newContractForm.startDate,
          endDate: newContractForm.endDate,
          totalValue: Number(newContractForm.totalValue),
          terms: newContractForm.terms,
          items: [
            {
              itemId: newContractForm.itemId,
              contractedPrice: Number(newContractForm.contractedPrice),
              minQuantity: Number(newContractForm.minQuantity),
            },
          ],
        },
      })
      if (res.success) {
        setShowCreateModal(false)
        fetchContracts()
      }
    } catch (e) {
      alert('Failed to establish rate contract')
    }
  }

  const totalContractValue = contracts.reduce((sum, c) => sum + c.totalValue, 0)
  const totalDrawdown = contracts.reduce((sum, c) => sum + c.spentAmount, 0)
  const expiringCount = contracts.filter((c) => c.validityStatus === 'EXPIRING_SOON').length

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Bar matching Screenshots 3 & 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-[#1c1328] text-purple-600 dark:text-[#c084fc] flex items-center justify-center border border-purple-100/60 dark:border-purple-900/30">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Rate Contracts Repository
            </h1>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
              Fixed volume pricing agreements, drawdown tracking, maverick-spend detection, and renewal calendar
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 bg-black text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 px-4 py-2 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Rate Contract</span>
        </button>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
            ACTIVE CONTRACT VALUE
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            ₹{totalContractValue.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
            DRAWN DOWN TO DATE
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{totalDrawdown.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
            AVERAGE DRAWDOWN
          </span>
          <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
            {totalContractValue > 0 ? `${((totalDrawdown / totalContractValue) * 100).toFixed(1)}%` : '0%'}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-amber-200 dark:border-amber-950/60 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
            RENEWALS DUE (30 DAYS)
          </span>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            {expiringCount} Contracts
          </div>
        </div>
      </div>

      {/* 3. MAVERICK SPEND DETECTION SIMULATOR (§14) */}
      <div className="bg-gradient-to-r from-blue-50/50 via-slate-50 to-indigo-50/50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800/80 p-5 rounded-xl border border-blue-200 dark:border-zinc-700 shadow-2xs space-y-3 text-xs">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="font-bold text-slate-900 dark:text-white">
            Maverick-Spend (Off-Contract Buying) Detection Engine (§14)
          </h3>
        </div>
        <p className="text-slate-600 dark:text-zinc-400">
          Simulate a procurement purchase to verify if an active Rate Contract exists and prevent rogue spending.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500">Item</label>
            <select
              value={checkItem}
              onChange={(e) => setCheckItem(e.target.value)}
              className="w-full mt-1 px-2.5 py-1.5 rounded border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white"
            >
              {masterItems.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.itemCode} - {it.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500">Proposed Vendor</label>
            <select
              value={checkVendor}
              onChange={(e) => setCheckVendor(e.target.value)}
              className="w-full mt-1 px-2.5 py-1.5 rounded border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white"
            >
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.vendorCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500">Proposed Rate (₹)</label>
            <input
              type="number"
              placeholder="e.g. 215"
              value={checkPrice}
              onChange={(e) => setCheckPrice(e.target.value)}
              className="w-full mt-1 px-2.5 py-1.5 rounded border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleTestMaverick}
              disabled={isCheckingMaverick}
              className="w-full py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
            >
              {isCheckingMaverick ? 'Checking...' : 'Check Compliance'}
            </button>
          </div>
        </div>

        {maverickResult && (
          <div
            className={`p-3 rounded-lg border text-xs mt-2 ${
              maverickResult.isMaverick
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900 text-rose-800 dark:text-rose-300'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300'
            }`}
          >
            {maverickResult.isMaverick ? (
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <strong>{maverickResult.warningMessage}</strong>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Compliant Procurement: {maverickResult.message}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. RATE CONTRACTS TABLE (§14) */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-2xs">
        <div className="p-3.5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/40 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
            Active Rate Contracts Repository
          </h2>
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search contract # or vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-3 py-1 text-xs rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-semibold text-slate-600 dark:text-zinc-400">
                <th className="py-3 px-4">CONTRACT #</th>
                <th className="py-3 px-4">TITLE & VENDOR</th>
                <th className="py-3 px-4">VALIDITY PERIOD</th>
                <th className="py-3 px-4 text-right">CONTRACT VALUE (₹)</th>
                <th className="py-3 px-4 text-right">DRAWDOWN (SPENT)</th>
                <th className="py-3 px-4 w-40">DRAWDOWN PROGRESS</th>
                <th className="py-3 px-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/70">
              {contracts
                .filter((c) => {
                  if (!searchQuery) return true
                  const q = searchQuery.toLowerCase()
                  return (
                    c.contractNumber.toLowerCase().includes(q) ||
                    c.vendor.name.toLowerCase().includes(q) ||
                    c.title.toLowerCase().includes(q)
                  )
                })
                .map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {row.contractNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{row.title}</div>
                      <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                        {row.vendor.name} ({row.vendor.vendorCode})
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-zinc-300">
                      <div>
                        {new Date(row.startDate).toLocaleDateString('en-GB')} –{' '}
                        {new Date(row.endDate).toLocaleDateString('en-GB')}
                      </div>
                      <div className="text-[10px] text-slate-400">{row.daysRemaining} days remaining</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      ₹{row.totalValue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{row.spentAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-slate-500">
                          <span>{row.drawdownPct}%</span>
                          <span>₹{(row.remainingBalance / 100000).toFixed(1)}L left</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              row.drawdownPct > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, row.drawdownPct)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {row.validityStatus === 'ACTIVE' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          Active
                        </span>
                      ) : row.validityStatus === 'EXPIRING_SOON' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                          Expiring Soon
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                          Expired
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. CREATE CONTRACT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 w-full max-w-lg shadow-2xl overflow-hidden text-xs">
            <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-800/50">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Establish Rate Contract (§14)
              </h3>
              <button onClick={() => setShowCreateModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateContract} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-zinc-300">Contract Title *</label>
                <input
                  type="text"
                  required
                  value={newContractForm.title}
                  onChange={(e) => setNewContractForm({ ...newContractForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Vendor *</label>
                  <select
                    value={newContractForm.vendorId}
                    onChange={(e) => setNewContractForm({ ...newContractForm, vendorId: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
                  >
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Total Contract Value (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newContractForm.totalValue}
                    onChange={(e) => setNewContractForm({ ...newContractForm, totalValue: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Start Date</label>
                  <input
                    type="date"
                    value={newContractForm.startDate}
                    onChange={(e) => setNewContractForm({ ...newContractForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">End Date</label>
                  <input
                    type="date"
                    value={newContractForm.endDate}
                    onChange={(e) => setNewContractForm({ ...newContractForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Item Line */}
              <div className="p-3 bg-slate-50 dark:bg-zinc-800 rounded border border-slate-200 dark:border-zinc-700 space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-500">Contracted Item & Rate</label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <select
                      value={newContractForm.itemId}
                      onChange={(e) => setNewContractForm({ ...newContractForm, itemId: e.target.value })}
                      className="w-full px-2 py-1.5 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
                    >
                      {masterItems.map((it) => (
                        <option key={it.id} value={it.id}>
                          {it.itemCode}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Contracted Rate (₹)"
                      value={newContractForm.contractedPrice}
                      onChange={(e) => setNewContractForm({ ...newContractForm, contractedPrice: e.target.value })}
                      className="w-full px-2 py-1.5 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Min Qty"
                      value={newContractForm.minQuantity}
                      onChange={(e) => setNewContractForm({ ...newContractForm, minQuantity: e.target.value })}
                      className="w-full px-2 py-1.5 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-black text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  Establish Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
