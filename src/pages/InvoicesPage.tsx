import React, { useState, useEffect } from 'react'
import {
  Receipt,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CreditCard,
  Loader2,
  FileSpreadsheet,
  MoreVertical,
  Filter,
} from 'lucide-react'
import { apiRequest } from '../lib/api'
import { formatCurrency, formatDate } from '../lib/utils'
import { ExcelImportModal } from '../components/common/ExcelImportModal'

export const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const res = await apiRequest('/supplier-invoices')
      if (res.success) {
        setInvoices(res.data)
      }
    } catch (err) {
      console.error('Failed to load supplier invoices', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  const filtered = invoices.filter((inv) => {
    if (!searchTerm) return true
    const q = searchTerm.toLowerCase()
    return (
      inv.invoiceNumber?.toLowerCase().includes(q) ||
      inv.vendor?.name?.toLowerCase().includes(q) ||
      inv.purchaseOrder?.poNumber?.toLowerCase().includes(q) ||
      inv.supplierInvoiceRef?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-[#1c1328] text-purple-600 dark:text-[#c084fc] flex items-center justify-center border border-purple-100/60 dark:border-purple-900/30">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Supplier Billing & 3-Way Match</h1>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
              Automated reconciliation between Purchase Orders (PO), Goods Receipts (GRN), and Supplier Invoices.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsImportModalOpen(true)}
          className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121214] hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-lg px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Import Excel</span>
        </button>
      </div>

      {/* 3-Way Matching Information Banner */}
      <div className="bg-slate-50 dark:bg-[#121214] p-4 rounded-lg border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <div>
            <span className="font-semibold text-slate-800 dark:text-zinc-200">Tolerance Engine Active:</span>
            <span className="text-slate-500 dark:text-zinc-400 ml-1.5">
              3-way match verifies PO rate against GRN received quantity without manual invoice re-entry.
            </span>
          </div>
        </div>
        <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-[#052e16]/80 dark:text-[#4ade80]">
          100% Tolerance Checked
        </span>
      </div>

      {/* Search Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Search code or invoice..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-lg border border-dashed border-slate-200 dark:border-zinc-800 text-xs w-52 bg-white dark:bg-[#121214] text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-zinc-600 placeholder:text-slate-400 dark:placeholder:text-zinc-500 transition-colors"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-[#0c0c0e] rounded-lg border border-slate-200 dark:border-zinc-800/80 shadow-2xs overflow-hidden transition-colors">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-zinc-500">
            <Loader2 className="w-5 h-5 animate-spin text-slate-600 dark:text-zinc-400" />
            <span className="text-xs">Loading billing ledger...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 dark:text-zinc-500 text-xs">No invoices registered.</div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-zinc-800 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                    <th className="py-3 px-4">CODE</th>
                    <th className="py-3 px-4">SUPPLIER</th>
                    <th className="py-3 px-4">PO REFERENCE</th>
                    <th className="py-3 px-4">MATCH STATUS</th>
                    <th className="py-3 px-4">DUE DATE</th>
                    <th className="py-3 px-4 text-right">TOTAL AMOUNT</th>
                    <th className="py-3 px-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                  {filtered.map((inv) => {
                    const isMatched = inv.matchStatus === 'MATCHED_3_WAY'

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-[#18181c]/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-zinc-300">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800 dark:text-white">
                          <div>{inv.vendor?.name}</div>
                          <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                            Ref: {inv.supplierInvoiceRef}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600 dark:text-zinc-400">
                          {inv.purchaseOrder?.poNumber}
                        </td>
                        <td className="py-3 px-4">
                          {isMatched ? (
                            <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-emerald-50 dark:bg-[#052e16]/80 text-emerald-700 dark:text-[#4ade80] border border-emerald-100/60 dark:border-[#16a34a]/40">
                              3-Way Matched
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-rose-50 dark:bg-[#450a0a]/80 text-rose-600 dark:text-[#f87171] border border-rose-100/60 dark:border-[#dc2626]/40">
                              Variance Exception
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-zinc-400">{formatDate(inv.dueDate)}</td>
                        <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(Number(inv.totalAmount))}
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

            <div className="px-4 py-3 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-400 dark:text-zinc-500 font-medium flex items-center justify-between">
              <div>
                1-{filtered.length} of {filtered.length} invoices
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
        moduleKey="INVOICES"
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          fetchInvoices()
        }}
      />
    </div>
  )
}
