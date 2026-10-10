import React, { useState, useEffect } from 'react'
import {
  Award,
  CheckCircle2,
  TrendingDown,
  Layers,
  ArrowRight,
  Plus,
  AlertCircle,
  FileText,
  DollarSign,
  ShieldCheck,
  Check,
  Building,
  Info,
} from 'lucide-react'
import { apiRequest } from '../lib/api'

interface RfqSummary {
  id: string
  rfqNumber: string
  title: string
  status: string
  quotesCount: number
  lowestQuote: number | null
  highestQuote: number | null
  spread: number
  awardedVendor?: { id: string; name: string; vendorCode: string }
  pr?: { id: string; prNumber: string; department: string }
  inquiry?: { id: string; inquiryNumber: string; fgPartName: string }
}

interface CompareData {
  rfq: {
    id: string
    rfqNumber: string
    title: string
    deadline: string
    status: string
    createdAt: string
    pr?: { id: string; prNumber: string; department: string }
    inquiry?: { id: string; inquiryNumber: string; fgPartName: string }
  }
  lines: Array<{
    itemKey: string
    description: string
    quantity: number
    uom: string
    lastPrice: number
    minPrice: number | null
    l1VendorCode: string
    vendorQuotes: Array<{
      vendorId: string
      vendorCode: string
      vendorName: string
      unitPrice: number | null
      totalPrice: number | null
      leadTimeDays: number
    }>
  }>
  quotes: Array<{
    id: string
    quoteNumber: string
    vendorId: string
    vendorName: string
    vendorCode: string
    totalAmount: number
    paymentTerms: string
    deliveryDays: number
    techScore: number
    commercialScore: number
    weightedScore: number
    isL1: boolean
    status: string
  }>
  summary: {
    highestQuote: number
    l1Quote: number
    spread: number
    spreadPct: number
    savingsVsLastPrice: number
  }
}

export const RfqComparisonPage: React.FC = () => {
  const [rfqs, setRfqs] = useState<RfqSummary[]>([])
  const [selectedRfqId, setSelectedRfqId] = useState<string>('')
  const [compareData, setCompareData] = useState<CompareData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Award Modal
  const [showAwardModal, setShowAwardModal] = useState(false)
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>('')
  const [awardJustification, setAwardJustification] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [awardError, setAwardError] = useState('')

  useEffect(() => {
    fetchRfqs()
  }, [])

  const fetchRfqs = async () => {
    setIsLoading(true)
    try {
      const res = await apiRequest<{ success: boolean; data: RfqSummary[] }>('/rfqs')
      if (res.success && res.data.length > 0) {
        setRfqs(res.data)
        const targetId = res.data[0].id
        setSelectedRfqId(targetId)
        fetchComparison(targetId)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchComparison = async (rfqId: string) => {
    try {
      const res = await apiRequest<{ success: boolean; data: CompareData }>(`/rfqs/${rfqId}/compare`)
      if (res.success) {
        setCompareData(res.data)
        const l1 = res.data.quotes.find((q) => q.isL1)
        if (l1) setSelectedQuoteId(l1.id)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleSelectRfq = (id: string) => {
    setSelectedRfqId(id)
    fetchComparison(id)
  }

  const handleAward = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!compareData || !selectedQuoteId) return

    const quote = compareData.quotes.find((q) => q.id === selectedQuoteId)
    if (!quote) return

    if (!quote.isL1 && (!awardJustification || awardJustification.trim().length < 5)) {
      setAwardError('Written justification is mandatory when awarding to a vendor other than L1.')
      return
    }

    setIsSubmitting(true)
    setAwardError('')

    try {
      const res = await apiRequest<{ success: boolean; message: string }>(`/rfqs/${compareData.rfq.id}/award`, {
        method: 'POST',
        body: {
          quoteId: quote.id,
          vendorId: quote.vendorId,
          awardJustification,
          autoCreatePO: true,
        },
      })

      if (res.success) {
        alert(res.message)
        setShowAwardModal(false)
        fetchRfqs()
      }
    } catch (err: any) {
      setAwardError(err.message || 'Award failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Bar with RFQ Selector & Info matching Screenshots 3 & 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-[#1c1328] text-purple-600 dark:text-[#c084fc] flex items-center justify-center border border-purple-100/60 dark:border-purple-900/30">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
                {compareData ? compareData.rfq.rfqNumber : 'RFQ Comparison & Commercial Evaluation'}
              </h1>
              {compareData && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
                  {compareData.rfq.status}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
              {compareData?.rfq.pr ? (
                <span>Against Requisition <strong className="text-slate-800 dark:text-zinc-200">{compareData.rfq.pr.prNumber}</strong> ({compareData.rfq.pr.department})</span>
              ) : (
                'Formal multi-vendor commercial bid comparison and L1 award.'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* RFQ Switcher */}
          <select
            value={selectedRfqId}
            onChange={(e) => handleSelectRfq(e.target.value)}
            className="text-xs bg-white dark:bg-[#121214] border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-slate-800 dark:text-zinc-200 font-mono shadow-2xs"
          >
            {rfqs.map((r) => (
              <option key={r.id} value={r.id}>
                {r.rfqNumber} — {r.title} ({r.quotesCount} quotes)
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowAwardModal(true)}
            disabled={compareData?.rfq.status === 'AWARDED'}
            className="flex items-center gap-1.5 bg-black text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 disabled:opacity-40 px-4 py-2 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Award & Create PO</span>
          </button>
        </div>
      </div>

      {compareData && (
        <div className="space-y-6">
          {/* 2. COMPARATIVE STATEMENT TABLE (§9, Screenshot Page 15) */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-2xs">
            <div className="p-3.5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/40 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                Comparative Statement
              </h2>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                [ L1 Highlighted per line · pre-GST landed value ]
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-semibold text-slate-600 dark:text-zinc-400">
                    <th className="py-3 px-4 w-64">ITEM</th>
                    <th className="py-3 px-4 text-center w-24">QTY</th>
                    {compareData.quotes.map((q) => (
                      <th key={q.id} className="py-3 px-4 text-right">
                        <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                          {q.vendorName}
                        </div>
                        <div className="text-[10px] font-mono font-normal text-slate-400">{q.vendorCode}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/70 font-sans">
                  {compareData.lines.map((line) => (
                    <tr key={line.itemKey} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40">
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                        {line.description}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-700 dark:text-zinc-300">
                        {line.quantity} {line.uom}
                      </td>
                      {line.vendorQuotes.map((vq, idx) => {
                        const isLineL1 = vq.unitPrice !== null && vq.unitPrice === line.minPrice
                        return (
                          <td key={idx} className="py-3 px-4 text-right font-mono">
                            {vq.unitPrice !== null ? (
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold ${
                                  isLineL1
                                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold'
                                    : 'text-slate-800 dark:text-zinc-200'
                                }`}
                              >
                                ₹{vq.unitPrice}
                                {isLineL1 && (
                                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                                    L1
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className="text-slate-400 dark:text-zinc-500 italic text-[11px]">No quote</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}

                  {/* Total Basic Value Row */}
                  <tr className="bg-slate-50/80 dark:bg-zinc-800/70 font-bold border-t-2 border-slate-200 dark:border-zinc-700">
                    <td className="py-3.5 px-4 text-slate-900 dark:text-white uppercase tracking-wider text-xs">
                      Total Basic Value
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-400">—</td>
                    {compareData.quotes.map((q) => (
                      <td key={q.id} className="py-3.5 px-4 text-right font-mono text-sm">
                        <span className={q.isL1 ? 'text-emerald-600 dark:text-emerald-400 underline font-bold' : 'text-slate-900 dark:text-white'}>
                          ₹{q.totalAmount.toLocaleString('en-IN')}
                        </span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Weighted Evaluation & Savings Insight (Screenshot Page 15) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weighted Evaluation Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                  Weighted Evaluation (Tech 40% · Commercial 60%)
                </h3>
              </div>

              <div className="space-y-4">
                {compareData.quotes.map((q, rank) => (
                  <div key={q.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-slate-500">{rank + 1}</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{q.vendorName}</span>
                        {q.isL1 && (
                          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                            L1 Price
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{q.weightedScore}</span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${q.weightedScore}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Tech: {q.techScore}/100 (wt 40%)</span>
                      <span>Commercial: {q.commercialScore}/100 (wt 60%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Savings & Negotiation Insight Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                  Savings & Negotiation Insight
                </h3>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-600 dark:text-zinc-400">Highest quote</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    ₹{compareData.summary.highestQuote.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-600 dark:text-zinc-400">L1 quote</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{compareData.summary.l1Quote.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-600 dark:text-zinc-400">Spread captured</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    ₹{compareData.summary.spread.toLocaleString('en-IN')} ({compareData.summary.spreadPct}%)
                  </span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-600 dark:text-zinc-400">Saving vs last price</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{compareData.summary.savingsVsLastPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-lg border border-slate-200 dark:border-zinc-700/60 text-[11px] text-slate-600 dark:text-zinc-400">
                L1 procurement ensures maximum budgetary conservation. Awarding non-L1 enforces written justification on the PO and audit log.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. AWARD MODAL */}
      {showAwardModal && compareData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 w-full max-w-lg shadow-2xl overflow-hidden text-xs">
            <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-800/50">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Award RFQ & Generate Purchase Order
              </h3>
              <button onClick={() => setShowAwardModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAward} className="p-5 space-y-4">
              {awardError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded text-rose-700 dark:text-rose-300">
                  {awardError}
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-zinc-300">Select Awardee Quotation</label>
                <div className="space-y-2">
                  {compareData.quotes.map((q) => (
                    <label
                      key={q.id}
                      className={`flex items-center justify-between p-3 rounded border cursor-pointer ${
                        selectedQuoteId === q.id
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                          : 'border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="awardQuote"
                          value={q.id}
                          checked={selectedQuoteId === q.id}
                          onChange={() => setSelectedQuoteId(q.id)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{q.vendorName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {q.quoteNumber} · Terms: {q.paymentTerms} · Delivery: {q.deliveryDays}d
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">
                          ₹{q.totalAmount.toLocaleString('en-IN')}
                        </div>
                        {q.isL1 && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            ★ L1 Lowest Bid
                          </span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Justification needed if not L1 */}
              {selectedQuoteId && !compareData.quotes.find((q) => q.id === selectedQuoteId)?.isL1 && (
                <div className="space-y-1 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded">
                  <label className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Mandatory Non-L1 Justification (§9, §18 R9)
                  </label>
                  <p className="text-[10px] text-amber-700 dark:text-amber-400">
                    Awarding a bidder other than L1 requires formal justification recorded on the PO and audit trail.
                  </p>
                  <textarea
                    required
                    value={awardJustification}
                    onChange={(e) => setAwardJustification(e.target.value)}
                    placeholder="State technical justification (e.g. Superior delivery lead time, approved OEM specification, higher technical score)..."
                    className="w-full mt-1.5 px-3 py-2 rounded border border-amber-300 dark:border-amber-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
                    rows={3}
                  />
                </div>
              )}

              <div className="p-3 bg-slate-50 dark:bg-zinc-800 rounded text-slate-600 dark:text-zinc-400 text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>
                  The Purchase Order will be generated with quoted rates, terms and subject to Quality Gate qualification check (§12).
                </span>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAwardModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-black text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Award & Create PO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
