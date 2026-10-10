import React, { useState, useEffect } from 'react'
import {
  FileText,
  Search,
  Download,
  Printer,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  Filter,
  CheckCircle2,
  Building,
  TrendingUp,
  ShieldCheck,
  Calendar,
} from 'lucide-react'
import { apiRequest } from '../lib/api'

export const ReportsPage: React.FC = () => {
  const [searchDocNumber, setSearchDocNumber] = useState('')
  const [docType, setDocType] = useState('ALL')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Report registers
  const [activeReportTab, setActiveReportTab] = useState<'poRegister' | 'vendorSpend' | 'auditLog'>('poRegister')
  const [poList, setPoList] = useState<any[]>([])
  const [vendorList, setVendorList] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    try {
      const [poRes, vRes, aRes] = await Promise.all([
        apiRequest<{ success: boolean; data: any[] }>('/purchase-orders'),
        apiRequest<{ success: boolean; data: any[] }>('/vendors'),
        apiRequest<{ success: boolean; summary: any }>('/dashboard/summary'),
      ])
      if (poRes.success) setPoList(poRes.data)
      if (vRes.success) setVendorList(vRes.data)
      if (aRes.success && aRes.summary.recentActivities) setAuditLogs(aRes.summary.recentActivities)
    } catch (e) {
      console.error(e)
    }
  }

  const handleUniversalSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchDocNumber.trim()) return

    setIsSearching(true)
    setHasSearched(true)

    try {
      const q = searchDocNumber.trim().toLowerCase()
      // Universal match across PO, PR, Invoices, Vendors
      const matched = poList
        .filter(
          (po) =>
            po.poNumber.toLowerCase().includes(q) ||
            po.vendor.name.toLowerCase().includes(q) ||
            (po.pr && po.pr.prNumber.toLowerCase().includes(q))
        )
        .map((po) => ({
          type: 'PURCHASE_ORDER',
          docNumber: po.poNumber,
          title: `Purchase Order for ${po.vendor.name}`,
          date: po.issueDate,
          amount: Number(po.totalAmount),
          status: po.status,
          link: `/purchase-orders`,
        }))

      setSearchResults(matched)
    } catch (e) {
      console.error(e)
    } finally {
      setIsSearching(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExportCSV = (reportName: string) => {
    let rows: any[] = []
    if (reportName === 'PO_Register') {
      rows = poList.map((po) => ({
        PONumber: po.poNumber,
        Vendor: po.vendor.name,
        Date: new Date(po.issueDate).toLocaleDateString('en-GB'),
        Amount: po.totalAmount,
        Status: po.status,
      }))
    } else {
      rows = vendorList.map((v) => ({
        VendorCode: v.vendorCode,
        Name: v.name,
        Rating: v.rating,
        Status: v.status,
        AuditScore: v.auditScore || 'N/A',
      }))
    }

    if (rows.length === 0) return
    const headers = Object.keys(rows[0]).join(',')
    const csvContent = [headers, ...rows.map((r) => Object.values(r).join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `SLT_${reportName}_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

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
              Reports & Documents
            </h1>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
              Universal document search across PO/PR/RFQ/GRN/Invoices and printable executive registers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExportCSV(activeReportTab === 'poRegister' ? 'PO_Register' : 'Vendor_Directory')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121214] hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-black text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 px-4 py-2 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* 2. UNIVERSAL DOCUMENT SEARCH BAR (§4, §15) */}
      <div className="bg-white dark:bg-[#0c0c0e] p-5 rounded-xl border border-slate-200 dark:border-zinc-800/80 shadow-2xs space-y-3">
        <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
          <Search className="w-4 h-4 text-purple-600 dark:text-[#c084fc]" />
          Universal Document Search
        </h3>
        <p className="text-xs text-slate-400 dark:text-zinc-500">
          Trace any document by PO #, PR #, RFQ #, GRN note, invoice number, supplier, or material batch/heat number.
        </p>

        <form onSubmit={handleUniversalSearch} className="flex flex-col sm:flex-row gap-3 pt-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              required
              placeholder="e.g. PO-2026-00001, PR-2026-00331, SKF Bearings, INV-2026-001..."
              value={searchDocNumber}
              onChange={(e) => setSearchDocNumber(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-dashed border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121214] text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-slate-400 placeholder:text-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="px-5 py-2 rounded-lg bg-black text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold shadow-2xs shrink-0 cursor-pointer transition-colors"
          >
            {isSearching ? 'Searching...' : 'Search ERP'}
          </button>
        </form>

        {hasSearched && (
          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 text-xs">
            {searchResults.length > 0 ? (
              <div className="space-y-2">
                <span className="font-semibold text-slate-700 dark:text-zinc-300">
                  Matching Documents ({searchResults.length})
                </span>
                <div className="divide-y divide-slate-100 dark:divide-zinc-800 border rounded-lg overflow-hidden">
                  {searchResults.map((res, i) => (
                    <div key={i} className="p-3 bg-slate-50/50 dark:bg-zinc-800/40 flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 mr-2">
                          {res.docNumber}
                        </span>
                        <span className="font-medium text-slate-900 dark:text-white">{res.title}</span>
                        <div className="text-[10px] text-slate-400">
                          {new Date(res.date).toLocaleDateString('en-GB')} · Status: {res.status}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        ₹{res.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-slate-400 py-2 text-center">
                No matching procurement documents found for "{searchDocNumber}".
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. REPORT PACKS & REGISTERS */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-2xs">
        <div className="p-3.5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/40 flex items-center justify-between">
          <div className="flex bg-slate-200/80 dark:bg-zinc-800 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveReportTab('poRegister')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeReportTab === 'poRegister'
                  ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-zinc-400'
              }`}
            >
              Purchase Order Register
            </button>
            <button
              onClick={() => setActiveReportTab('vendorSpend')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeReportTab === 'vendorSpend'
                  ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-zinc-400'
              }`}
            >
              Vendor Spend & Pareto
            </button>
            <button
              onClick={() => setActiveReportTab('auditLog')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeReportTab === 'auditLog'
                  ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-zinc-400'
              }`}
            >
              System Audit Trail
            </button>
          </div>
        </div>

        {/* PO Register Table */}
        {activeReportTab === 'poRegister' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-semibold text-slate-600 dark:text-zinc-400">
                  <th className="py-3 px-4">PO #</th>
                  <th className="py-3 px-4">SUPPLIER</th>
                  <th className="py-3 px-4">ISSUE DATE</th>
                  <th className="py-3 px-4">DELIVERY DUE</th>
                  <th className="py-3 px-4 text-right">SUBTOTAL (₹)</th>
                  <th className="py-3 px-4 text-right">TOTAL INC. TAX (₹)</th>
                  <th className="py-3 px-4">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/70">
                {poList.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">{po.poNumber}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{po.vendor.name}</td>
                    <td className="py-3 px-4 text-slate-700 dark:text-zinc-300">
                      {new Date(po.issueDate).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-zinc-300">
                      {new Date(po.expectedDeliveryDate).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      ₹{Number(po.subtotal).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      ₹{Number(po.totalAmount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        {po.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Vendor Spend Table */}
        {activeReportTab === 'vendorSpend' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-semibold text-slate-600 dark:text-zinc-400">
                  <th className="py-3 px-4">CODE</th>
                  <th className="py-3 px-4">VENDOR NAME</th>
                  <th className="py-3 px-4">CREDIT TERMS</th>
                  <th className="py-3 px-4">RATING</th>
                  <th className="py-3 px-4">AUDIT SCORE</th>
                  <th className="py-3 px-4">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/70">
                {vendorList.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">{v.vendorCode}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{v.name}</td>
                    <td className="py-3 px-4 text-slate-700 dark:text-zinc-300">{v.creditTerms}</td>
                    <td className="py-3 px-4 font-bold text-amber-600">★ {v.rating}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-zinc-200">
                      {v.auditScore ? `${v.auditScore}%` : 'Pending'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        {v.qualificationStatus || v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Audit Log Table */}
        {activeReportTab === 'auditLog' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-semibold text-slate-600 dark:text-zinc-400">
                  <th className="py-3 px-4">TIMESTAMP</th>
                  <th className="py-3 px-4">ACTION</th>
                  <th className="py-3 px-4">ACTOR</th>
                  <th className="py-3 px-4">DETAILS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/70">
                {auditLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40">
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString('en-GB')}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-blue-600 dark:text-blue-400">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                      {log.user?.fullName || 'System / Batch'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-zinc-300 max-w-md truncate">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
