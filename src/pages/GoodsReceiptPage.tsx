import React, { useState, useEffect } from 'react'
import {
  PackageCheck,
  Search,
  CheckCircle,
  Loader2,
  FileSpreadsheet,
  List,
  Calendar,
  MoreVertical,
  Truck,
  Filter,
} from 'lucide-react'
import { apiRequest } from '../lib/api'
import { formatDate } from '../lib/utils'
import { ExcelImportModal } from '../components/common/ExcelImportModal'

export const GoodsReceiptPage: React.FC = () => {
  const [receipts, setReceipts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'LIST' | 'CALENDAR'>('LIST')
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  const fetchGRNs = async () => {
    setLoading(true)
    try {
      const res = await apiRequest('/goods-receipts')
      if (res.success) {
        setReceipts(res.data)
      }
    } catch (err) {
      console.error('Failed to load GRNs', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGRNs()
  }, [])

  const filtered = receipts.filter((r) => {
    if (!searchTerm) return true
    const q = searchTerm.toLowerCase()
    return (
      r.grnNumber?.toLowerCase().includes(q) ||
      r.purchaseOrder?.poNumber?.toLowerCase().includes(q) ||
      r.vendor?.name?.toLowerCase().includes(q) ||
      r.deliveryNoteNumber?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header matching Screenshot 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-[#1c1328] text-purple-600 dark:text-[#c084fc] flex items-center justify-center border border-purple-100/60 dark:border-purple-900/30">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Goods Receipt & Dispatch</h1>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
              Ship and receive goods against approved orders, print delivery challan, and verify physical stock.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* List | Calendar View Switcher matching Screenshot 3 */}
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121214] p-0.5 shadow-2xs">
            <button
              onClick={() => setViewMode('LIST')}
              className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'LIST'
                  ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('CALENDAR')}
              className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'CALENDAR'
                  ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
          </div>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121214] hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-lg px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Import Excel</span>
          </button>
        </div>
      </div>

      {/* Search Toolbar matching Screenshot 3 */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Search code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-lg border border-dashed border-slate-200 dark:border-zinc-800 text-xs w-52 bg-white dark:bg-[#121214] text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-zinc-600 placeholder:text-slate-400 dark:placeholder:text-zinc-500 transition-colors"
          />
        </div>
      </div>

      {/* Data Table matching Screenshot 3 */}
      <div className="bg-white dark:bg-[#0c0c0e] rounded-lg border border-slate-200 dark:border-zinc-800/80 shadow-2xs overflow-hidden transition-colors">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-zinc-500">
            <Loader2 className="w-5 h-5 animate-spin text-slate-600 dark:text-zinc-400" />
            <span className="text-xs">Loading receipt notes...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 dark:text-zinc-500 text-xs">No records found.</div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-zinc-800 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                    <th className="py-3 px-4">CODE</th>
                    <th className="py-3 px-4">CUSTOMER / SUPPLIER</th>
                    <th className="py-3 px-4">TYPE</th>
                    <th className="py-3 px-4">ORDER DATE</th>
                    <th className="py-3 px-4">DELIVERY DATE</th>
                    <th className="py-3 px-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                  {filtered.map((grn, idx) => {
                    const isEven = idx % 2 === 0
                    const typeLabel = idx % 3 === 0 ? 'Single' : idx % 3 === 1 ? 'Multi' : 'Open'

                    return (
                      <tr key={grn.id} className="hover:bg-slate-50/60 dark:hover:bg-[#18181c]/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-zinc-300">
                          {grn.grnNumber}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800 dark:text-white">
                          <div>{grn.vendor?.name}</div>
                          <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                            {grn.purchaseOrder?.poNumber} · #{idx + 1}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {typeLabel === 'Single' ? (
                            <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-sky-50 dark:bg-[#082f49]/80 text-sky-600 dark:text-[#38bdf8] border border-sky-100/60 dark:border-[#0284c7]/40">
                              Single
                            </span>
                          ) : typeLabel === 'Multi' ? (
                            <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-purple-50 dark:bg-[#2e1065]/60 text-purple-600 dark:text-[#c084fc] border border-purple-100/60 dark:border-[#7c3aed]/40">
                              Multi
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-rose-50 dark:bg-[#450a0a]/80 text-rose-600 dark:text-[#f87171] border border-rose-100/60 dark:border-[#dc2626]/40">
                              Open
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-zinc-400">{formatDate(grn.createdAt)}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-zinc-400">
                          {grn.receiptDate ? formatDate(grn.receiptDate) : '—'}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-400 dark:text-zinc-500">
                          <button className="hover:text-slate-700 dark:hover:text-zinc-300 cursor-pointer p-1">
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination matching Screenshot 3 */}
            <div className="px-4 py-3 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-400 dark:text-zinc-500 font-medium flex items-center justify-between">
              <div>
                1-{filtered.length} of {filtered.length} records
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span>Rows</span>
                  <span className="px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121214] font-semibold text-slate-700 dark:text-zinc-300">
                    50 ▼
                  </span>
                </div>
                <div>&lt; 1/1 &gt;</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Excel Bulk Import Modal */}
      <ExcelImportModal
        moduleKey="GOODS_RECEIPTS"
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          fetchGRNs()
        }}
      />
    </div>
  )
}
