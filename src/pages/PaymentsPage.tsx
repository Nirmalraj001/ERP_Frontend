import React, { useState, useEffect } from 'react'
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Search,
  Building,
  DollarSign,
  FileText,
  Lock,
  ShieldCheck,
  Check,
  Calendar,
} from 'lucide-react'
import { apiRequest } from '../lib/api'

interface PayableItem {
  id: string
  invoiceNumber: string
  supplierInvoiceRef: string
  poNumber: string
  vendorId: string
  vendorName: string
  vendorCode: string
  bankName: string
  bankAccount: string
  totalAmount: number
  dueDate: string
  daysOverdue: number
  agingCategory: string
  status: string
  matchStatus: string
  hasException: boolean
}

interface PaymentRecord {
  id: string
  paymentNumber: string
  amount: number
  paymentDate: string
  paymentMethod: string
  referenceNumber: string // UTR
  status: string
  vendor: { name: string; vendorCode: string; bankName?: string }
  invoice: { invoiceNumber: string; totalAmount: number }
  processedBy: { fullName: string }
}

interface PaymentSummary {
  totalOutstanding: number
  totalPaid: number
  agingBuckets: {
    current: number
    days30: number
    days60: number
    days90Plus: number
  }
}

export const PaymentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'payables' | 'history'>('payables')
  const [payables, setPayables] = useState<PayableItem[]>([])
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [summary, setSummary] = useState<PaymentSummary>({
    totalOutstanding: 0,
    totalPaid: 0,
    agingBuckets: { current: 0, days30: 0, days60: 0, days90Plus: 0 },
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Payment Release Modal
  const [selectedPayable, setSelectedPayable] = useState<PayableItem | null>(null)
  const [releaseForm, setReleaseForm] = useState({
    amount: '',
    paymentMethod: 'RTGS',
    referenceNumber: '',
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [releaseError, setReleaseError] = useState('')

  useEffect(() => {
    fetchPaymentsData()
  }, [])

  const fetchPaymentsData = async () => {
    setIsLoading(true)
    try {
      const res = await apiRequest<{
        success: boolean
        data: {
          payments: PaymentRecord[]
          payables: PayableItem[]
          summary: PaymentSummary
        }
      }>('/payments')

      if (res.success) {
        setPayables(res.data.payables)
        setPayments(res.data.payments)
        setSummary(res.data.summary)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenReleaseModal = (item: PayableItem) => {
    setSelectedPayable(item)
    // Generate a sample realistic bank UTR format (e.g. HDFC202610100098)
    const sampleUTR = `HDFC${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(1000 + Math.random() * 9000)}`
    setReleaseForm({
      amount: String(item.totalAmount),
      paymentMethod: item.totalAmount >= 200000 ? 'RTGS' : 'NEFT',
      referenceNumber: sampleUTR,
      notes: `Electronic settlement for ${item.supplierInvoiceRef}`,
    })
    setReleaseError('')
  }

  const handleReleasePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPayable) return

    if (!releaseForm.referenceNumber || releaseForm.referenceNumber.trim().length < 6) {
      setReleaseError('Mandatory bank UTR / reference number is required (min 6 characters).')
      return
    }

    setIsSubmitting(true)
    setReleaseError('')

    try {
      const res = await apiRequest<{ success: boolean; message: string }>('/payments/release', {
        method: 'POST',
        body: {
          invoiceId: selectedPayable.id,
          amount: Number(releaseForm.amount),
          paymentMethod: releaseForm.paymentMethod,
          referenceNumber: releaseForm.referenceNumber.trim().toUpperCase(),
          notes: releaseForm.notes,
        },
      })

      if (res.success) {
        alert(res.message)
        setSelectedPayable(null)
        fetchPaymentsData()
      }
    } catch (err: any) {
      setReleaseError(err.message || 'Payment release failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Bar matching Screenshots 3 & 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-[#1c1328] text-purple-600 dark:text-[#c084fc] flex items-center justify-center border border-purple-100/60 dark:border-purple-900/30">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Payments & Accounts Payable
            </h1>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
              Manual electronic payment release with UTR, AP aging analysis, and invoice settlement locks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 sm:border-none">
          <button
            onClick={() => setActiveTab('payables')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'payables'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-2xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            Outstanding Payables ({payables.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-2xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            Disbursement History ({payments.length})
          </button>
        </div>
      </div>

      {/* 2. AP Aging & Summary Strip (§11) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
            TOTAL OUTSTANDING AP
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            ₹{summary.totalOutstanding.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
            CURRENT (&lt;30 DAYS)
          </span>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{summary.agingBuckets.current.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
            31–60 DAYS
          </span>
          <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            ₹{summary.agingBuckets.days30.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-lg border border-rose-200 dark:border-rose-950/60 shadow-2xs">
          <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
            61–90+ DAYS OVERDUE
          </span>
          <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
            ₹{(summary.agingBuckets.days60 + summary.agingBuckets.days90Plus).toLocaleString('en-IN')}
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-lg border border-blue-200 dark:border-blue-950/60 shadow-2xs">
          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
            SETTLED TO DATE
          </span>
          <div className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
            ₹{summary.totalPaid.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* 3. TAB 1: OUTSTANDING PAYABLES LEDGER */}
      {activeTab === 'payables' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-2xs">
            <div className="p-3.5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/40 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                Pending Supplier Invoices (Approved for Payment)
              </h2>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search code or vendor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-dashed border-slate-200 dark:border-zinc-800 text-xs w-64 bg-white dark:bg-[#121214] text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-slate-400 placeholder:text-slate-400 transition-colors"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-semibold text-slate-600 dark:text-zinc-400">
                    <th className="py-3 px-4">INVOICE #</th>
                    <th className="py-3 px-4">SUPPLIER REF</th>
                    <th className="py-3 px-4">PO #</th>
                    <th className="py-3 px-4">VENDOR</th>
                    <th className="py-3 px-4">DUE DATE</th>
                    <th className="py-3 px-4">AGING BUCKET</th>
                    <th className="py-3 px-4">3-WAY MATCH</th>
                    <th className="py-3 px-4 text-right">TOTAL (₹)</th>
                    <th className="py-3 px-4 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/70">
                  {payables
                    .filter((p) => {
                      if (!searchQuery) return true
                      const q = searchQuery.toLowerCase()
                      return (
                        p.invoiceNumber.toLowerCase().includes(q) ||
                        p.vendorName.toLowerCase().includes(q) ||
                        p.supplierInvoiceRef.toLowerCase().includes(q)
                      )
                    })
                    .map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {row.invoiceNumber}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700 dark:text-zinc-300">
                          {row.supplierInvoiceRef}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600 dark:text-zinc-400">
                          {row.poNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 dark:text-white">{row.vendorName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {row.bankName} · {row.bankAccount}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-zinc-300">
                          {new Date(row.dueDate).toLocaleDateString('en-GB')}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              row.agingCategory === 'Current'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : row.agingCategory === '31-60 Days'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            }`}
                          >
                            {row.agingCategory} {row.daysOverdue > 0 ? `(${row.daysOverdue}d over)` : ''}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {row.matchStatus === 'MATCHED_3_WAY' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                              3-Way Matched
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                              <AlertTriangle className="w-3 h-3" />
                              {row.matchStatus}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white text-sm">
                          ₹{row.totalAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleOpenReleaseModal(row)}
                            disabled={row.hasException}
                            className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold text-xs transition-colors cursor-pointer"
                          >
                            Release Pay →
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2: DISBURSEMENT HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-semibold text-slate-600 dark:text-zinc-400">
                  <th className="py-3 px-4">PAYMENT #</th>
                  <th className="py-3 px-4">INVOICE #</th>
                  <th className="py-3 px-4">VENDOR</th>
                  <th className="py-3 px-4 text-right">AMOUNT (₹)</th>
                  <th className="py-3 px-4">DATE</th>
                  <th className="py-3 px-4">METHOD</th>
                  <th className="py-3 px-4 font-mono">UTR / REFERENCE #</th>
                  <th className="py-3 px-4">PROCESSED BY</th>
                  <th className="py-3 px-4">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/70">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">{p.paymentNumber}</td>
                    <td className="py-3 px-4 font-mono text-blue-600 dark:text-blue-400">{p.invoice.invoiceNumber}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{p.vendor.name}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      ₹{p.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-zinc-300">
                      {new Date(p.paymentDate).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3 px-4 font-medium">{p.paymentMethod}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-zinc-800 px-2 py-1 rounded">
                      {p.referenceNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-zinc-400">{p.processedBy.fullName}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        <Check className="w-3 h-3" />
                        Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. MANUAL PAYMENT RELEASE MODAL (§11) */}
      {selectedPayable && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 w-full max-w-lg shadow-2xl overflow-hidden text-xs">
            <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-800/50">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                Manual Payment Authorization & UTR Release
              </h3>
              <button onClick={() => setSelectedPayable(null)}>✕</button>
            </div>

            <form onSubmit={handleReleasePayment} className="p-5 space-y-4">
              {releaseError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded text-rose-700 dark:text-rose-300">
                  {releaseError}
                </div>
              )}

              {/* Vendor & Bank details */}
              <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/70 rounded-lg space-y-2 border border-slate-200 dark:border-zinc-700">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Beneficiary Vendor:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedPayable.vendorName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Bank & Account:</span>
                  <span className="font-mono text-slate-800 dark:text-zinc-200">
                    {selectedPayable.bankName} · {selectedPayable.bankAccount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Invoice Ref / PO:</span>
                  <span className="font-mono text-slate-800 dark:text-zinc-200">
                    {selectedPayable.supplierInvoiceRef} (PO: {selectedPayable.poNumber})
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Disbursement Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={releaseForm.amount}
                    onChange={(e) => setReleaseForm({ ...releaseForm, amount: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono font-bold text-slate-900 dark:text-white text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Payment Mode</label>
                  <select
                    value={releaseForm.paymentMethod}
                    onChange={(e) => setReleaseForm({ ...releaseForm, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
                  >
                    <option value="RTGS">RTGS (Real Time Gross Settlement)</option>
                    <option value="NEFT">NEFT (National Electronic Fund Transfer)</option>
                    <option value="BANK_TRANSFER">Direct Bank Transfer</option>
                    <option value="IMPS">IMPS Immediate Payment</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  MANDATORY BANK UTR / TRANSACTION REFERENCE * (§11)
                </label>
                <input
                  type="text"
                  required
                  value={releaseForm.referenceNumber}
                  onChange={(e) => setReleaseForm({ ...releaseForm, referenceNumber: e.target.value.toUpperCase() })}
                  placeholder="e.g. HDFC202610100098"
                  className="w-full px-3 py-2 rounded border-2 border-blue-400 dark:border-blue-600 bg-blue-50/20 dark:bg-blue-950/20 font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-zinc-300">Remittance Remarks</label>
                <input
                  type="text"
                  value={releaseForm.notes}
                  onChange={(e) => setReleaseForm({ ...releaseForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <Lock className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  <strong>System Rule (§11, §15):</strong> Invoices lock permanently once settled with a UTR. This action cannot be undone.
                </span>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPayable(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-black text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Processing...' : 'Authorize Disbursement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
