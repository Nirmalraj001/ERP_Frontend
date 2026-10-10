import React, { useState, useEffect } from 'react'
import {
  Search,
  Plus,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileText,
  Filter,
  Send,
  UserCheck,
  Check,
  ChevronRight,
  TrendingUp,
  Award,
  Layers,
  ArrowRight,
  ExternalLink,
  Phone,
  MessageSquare,
  Users,
} from 'lucide-react'
import { apiRequest } from '../lib/api'

interface Inquiry {
  id: string
  inquiryNumber: string
  title: string
  fgPartName?: string
  fgPartNo?: string
  customer?: string
  customerTargetPrice?: number
  requestType?: string
  quantity?: number
  dueDate: string
  status: string
  item?: { id: string; name: string; itemCode: string; uom: string }
  vendorsSentCount: number
  quotesReceivedCount: number
  lowestQuote: number | null
  vendors: any[]
}

interface RfqRequestLine {
  id: string
  inquiryId: string
  inquiryNumber: string
  fgPartName: string
  fgPartNo: string
  customer: string
  item: { id: string; name: string; itemCode: string; uom: string } | null
  itemName: string
  itemCode: string
  requestType: string
  vendorId: string
  vendorName: string
  vendorCode: string
  vendorRating: number
  vendorQualification: string
  isBlocked: boolean
  mailSent: boolean
  sentDate: string | null
  custTargetPrice: number | null
  offeredPrice: number | null
  status: 'AWAITING' | 'QUOTED' | 'NO_RESPONSE' | 'NOT_INTERESTED' | 'NOT_FEASIBLE' | string
  quotedDate: string | null
  leadTimeDays: number | null
  moq: number | null
  paymentTerms: string | null
  quantity: number
  dueDate: string
  followupsCount: number
  nextFollowupDate: string | null
  isOverdue: boolean
  followups: Array<{ id: string; followupDate: string; mode: string; notes: string; nextFollowupDate: string | null }>
}

interface VendorScorecard {
  vendorId: string
  vendorCode: string
  vendorName: string
  capabilities: string
  rfqsReceived: number
  quotesSubmitted: number
  ordersAwarded: number
  orderValue: number
  quoteResponseRate: number
  avgResponseDays: number
  onTimeDelivery: number
  rejectionPct: number
  ppm: number
  openNcCount: number
  auditScore: number
  compositeScore: number
  rankingBand: string
  bandColor: string
  isBlocked: boolean
  qualificationStatus: string
}

export const InquiryManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inquiries' | 'rfqRequests' | 'scorecard' | 'findVendor'>('rfqRequests')
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [rfqRequests, setRfqRequests] = useState<RfqRequestLine[]>([])
  const [scorecard, setScorecard] = useState<VendorScorecard[]>([])
  const [smartVendors, setSmartVendors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [capabilityFilter, setCapabilityFilter] = useState('')

  // Modals
  const [showNewWizard, setShowNewWizard] = useState(false)
  const [selectedMailRequest, setSelectedMailRequest] = useState<RfqRequestLine | null>(null)
  const [selectedStatusRequest, setSelectedStatusRequest] = useState<RfqRequestLine | null>(null)
  const [selectedFollowupRequest, setSelectedFollowupRequest] = useState<RfqRequestLine | null>(null)

  // Status form state
  const [statusForm, setStatusForm] = useState({
    status: 'QUOTED',
    offeredPrice: '',
    leadTimeDays: '7',
    moq: '50',
    paymentTerms: 'Net 30',
    notes: '',
  })

  // Followup form state
  const [followupForm, setFollowupForm] = useState({
    mode: 'PHONE',
    notes: '',
    nextFollowupDate: '',
  })

  // New Wizard state
  const [masterItems, setMasterItems] = useState<any[]>([])
  const [availableVendors, setAvailableVendors] = useState<any[]>([])
  const [wizardForm, setWizardForm] = useState({
    fgPartName: 'Gear Housing GH-220',
    fgPartNo: 'GH-220',
    customer: 'Ashok Leyland',
    customerTargetPrice: '1200',
    requestType: 'Subcontracting',
    itemId: '',
    quantity: '200',
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    drawingSpec: 'DRG-GH-220 R1',
    selectedVendorIds: [] as string[],
    notes: 'Urgent pilot batch inquiry',
  })

  useEffect(() => {
    fetchData()
    fetchMasterData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [inqRes, rfqRes, scoreRes] = await Promise.all([
        apiRequest<{ success: boolean; data: Inquiry[] }>('/inquiries'),
        apiRequest<{ success: boolean; data: RfqRequestLine[] }>('/inquiries/rfq-requests'),
        apiRequest<{ success: boolean; data: VendorScorecard[] }>('/inquiries/scorecard'),
      ])

      if (inqRes.success) setInquiries(inqRes.data)
      if (rfqRes.success) setRfqRequests(rfqRes.data)
      if (scoreRes.success) setScorecard(scoreRes.data)
    } catch (e) {
      console.error('Failed to fetch inquiry data', e)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMasterData = async () => {
    try {
      const [itemsRes, vendorsRes] = await Promise.all([
        apiRequest<{ success: boolean; data: any[] }>('/items'),
        apiRequest<{ success: boolean; data: any[] }>('/inquiries/smart-search'),
      ])
      if (itemsRes.success) {
        setMasterItems(itemsRes.data)
        if (itemsRes.data.length > 0) {
          setWizardForm((prev) => ({ ...prev, itemId: itemsRes.data[0].id }))
        }
      }
      if (vendorsRes.success) {
        setAvailableVendors(vendorsRes.data)
        setSmartVendors(vendorsRes.data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleSmartSearch = async (cap: string) => {
    setCapabilityFilter(cap)
    try {
      const res = await apiRequest<{ success: boolean; data: any[] }>(`/inquiries/smart-search?capability=${encodeURIComponent(cap)}`)
      if (res.success) setSmartVendors(res.data)
    } catch (e) {
      console.error(e)
    }
  }

  const handleSendMail = async (reqLine: RfqRequestLine) => {
    try {
      const res = await apiRequest<{ success: boolean }>(`/inquiries/rfq-requests/${reqLine.id}/send-mail`, { method: 'POST' })
      if (res.success) {
        setSelectedMailRequest(null)
        fetchData()
      }
    } catch (e) {
      alert('Failed to mark mail as sent')
    }
  }

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStatusRequest) return
    try {
      const payload: any = {
        status: statusForm.status,
        notes: statusForm.notes,
      }
      if (statusForm.status === 'QUOTED') {
        payload.offeredPrice = Number(statusForm.offeredPrice)
        payload.leadTimeDays = Number(statusForm.leadTimeDays)
        payload.moq = Number(statusForm.moq)
        payload.paymentTerms = statusForm.paymentTerms
      }

      const res = await apiRequest(`/inquiries/rfq-requests/${selectedStatusRequest.id}/status`, {
        method: 'PATCH',
        body: payload,
      })
      if (res.success) {
        setSelectedStatusRequest(null)
        fetchData()
      }
    } catch (e) {
      alert('Failed to update status')
    }
  }

  const handleSaveFollowup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFollowupRequest) return
    try {
      const res = await apiRequest(`/inquiries/rfq-requests/${selectedFollowupRequest.id}/followups`, {
        method: 'POST',
        body: followupForm,
      })
      if (res.success) {
        setSelectedFollowupRequest(null)
        setFollowupForm({ mode: 'PHONE', notes: '', nextFollowupDate: '' })
        fetchData()
      }
    } catch (e) {
      alert('Failed to log follow-up')
    }
  }

  const handleCreateInquiry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (wizardForm.selectedVendorIds.length === 0) {
      alert('Please select at least one vendor for this RFQ inquiry.')
      return
    }

    try {
      const res = await apiRequest('/inquiries', {
        method: 'POST',
        body: {
          fgPartName: wizardForm.fgPartName,
          fgPartNo: wizardForm.fgPartNo,
          customer: wizardForm.customer,
          customerTargetPrice: Number(wizardForm.customerTargetPrice),
          requestType: wizardForm.requestType,
          itemId: wizardForm.itemId,
          quantity: Number(wizardForm.quantity),
          dueDate: wizardForm.dueDate,
          drawingSpec: wizardForm.drawingSpec,
          vendorIds: wizardForm.selectedVendorIds,
          notes: wizardForm.notes,
        },
      })

      if (res.success) {
        setShowNewWizard(false)
        fetchData()
      }
    } catch (e) {
      alert('Failed to create inquiry')
    }
  }

  // Metrics for §8.1 KPI strip
  const totalSent = rfqRequests.length
  const awaitingCount = rfqRequests.filter((r) => r.status === 'AWAITING' || r.status === 'INVITED').length
  const quotedCount = rfqRequests.filter((r) => r.status === 'QUOTED').length
  const noRespCount = rfqRequests.filter((r) => r.status === 'NO_RESPONSE' || r.status === 'NOT_INTERESTED' || r.status === 'NOT_FEASIBLE').length
  const followupsDueCount = rfqRequests.filter((r) => r.isOverdue || (r.nextFollowupDate && new Date(r.nextFollowupDate) <= new Date())).length

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Bar matching Screenshots 3 & 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-[#1c1328] text-purple-600 dark:text-[#c084fc] flex items-center justify-center border border-purple-100/60 dark:border-purple-900/30">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Inquiry Management
            </h1>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
              RFQ requests, quote comparison, follow-ups and sourcing decisions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Submodule Tabs */}
          <div className="flex items-center gap-1 border-b border-slate-200 dark:border-zinc-800 sm:border-none">
            {[
              { key: 'inquiries', label: 'Inquiries' },
              { key: 'rfqRequests', label: 'RFQ Requests' },
              { key: 'scorecard', label: 'Scorecard' },
              { key: 'findVendor', label: 'Find Vendor' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === tab.key
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-2xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowNewWizard(true)}
            className="flex items-center gap-1.5 bg-black text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 px-4 py-2 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Inquiry</span>
          </button>
        </div>
      </div>

      {/* 2. Submodule 1: RFQ REQUESTS TRACKER (§8.1, Screenshot Page 11) */}
      {activeTab === 'rfqRequests' && (
        <div className="space-y-4">
          {/* Top KPI Stat Strip (§8.1) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                Requests Sent
              </span>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{totalSent}</div>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-2xs">
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                Awaiting
              </span>
              <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{awaitingCount}</div>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-2xs">
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                Quoted
              </span>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{quotedCount}</div>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                No Resp / Declined
              </span>
              <div className="text-xl font-bold text-slate-600 dark:text-zinc-300 mt-1">{noRespCount}</div>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-rose-200 dark:border-rose-950/60 shadow-2xs">
              <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                Follow-ups Due
              </span>
              <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">{followupsDueCount}</div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 rounded-lg border border-slate-200 dark:border-zinc-800">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search code, item, or vendor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-dashed border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121214] text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-slate-400 placeholder:text-slate-400 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-md px-2.5 py-1.5 text-slate-700 dark:text-zinc-300"
              >
                <option value="ALL">All Statuses</option>
                <option value="AWAITING">Awaiting</option>
                <option value="QUOTED">Quoted</option>
                <option value="NO_RESPONSE">No Response</option>
                <option value="NOT_INTERESTED">Not Interested</option>
              </select>
            </div>
          </div>

          {/* Flattened RFQ Requests Table (§8.1, Page 11) */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-semibold text-slate-600 dark:text-zinc-400">
                    <th className="py-2.5 px-3">FG Part</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Vendor</th>
                    <th className="py-2.5 px-3">Sent</th>
                    <th className="py-2.5 px-3 text-right">Cust Tgt (₹)</th>
                    <th className="py-2.5 px-3 text-right">Offered (₹)</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Follow-ups</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/70">
                  {rfqRequests
                    .filter((r) => {
                      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false
                      if (searchQuery) {
                        const q = searchQuery.toLowerCase()
                        return (
                          r.fgPartName.toLowerCase().includes(q) ||
                          r.vendorName.toLowerCase().includes(q) ||
                          r.itemName.toLowerCase().includes(q)
                        )
                      }
                      return true
                    })
                    .map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">
                          <div>{row.fgPartName}</div>
                          <div className="text-[10px] text-slate-400 dark:text-zinc-500">{row.fgPartNo}</div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-300">{row.customer}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-mono text-slate-800 dark:text-zinc-200">{row.itemName}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                            • {row.requestType}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-slate-900 dark:text-white">{row.vendorName}</div>
                          <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">{row.vendorCode}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          {row.mailSent ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>{row.sentDate ? new Date(row.sentDate).toLocaleDateString('en-GB') : 'Sent'}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-zinc-500">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-zinc-400">
                          {row.custTargetPrice ? `₹${row.custTargetPrice}` : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {row.offeredPrice ? (
                            <span className={row.custTargetPrice && row.offeredPrice <= row.custTargetPrice ? 'text-emerald-600 dark:text-emerald-400' : ''}>
                              ₹{row.offeredPrice}
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-zinc-500 font-normal">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          {row.status === 'QUOTED' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Quoted
                            </span>
                          ) : row.status === 'AWAITING' || row.status === 'INVITED' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              Awaiting
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                              {row.status}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-600 dark:text-zinc-400">{row.followupsCount}</span>
                            {row.nextFollowupDate && (
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded ${
                                  row.isOverdue
                                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold'
                                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                                }`}
                              >
                                next {new Date(row.nextFollowupDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedMailRequest(row)}
                              title="Generate RFQ Email"
                              className="p-1 rounded bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-[10px] font-medium"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedStatusRequest(row)
                                setStatusForm({
                                  status: row.status === 'INVITED' ? 'AWAITING' : row.status,
                                  offeredPrice: row.offeredPrice ? String(row.offeredPrice) : '',
                                  leadTimeDays: String(row.leadTimeDays || 7),
                                  moq: String(row.moq || 50),
                                  paymentTerms: row.paymentTerms || 'Net 30',
                                  notes: '',
                                })
                              }}
                              title="Mark Status & Price"
                              className="px-2 py-1 rounded bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-[10px] font-medium"
                            >
                              Status
                            </button>
                            <button
                              onClick={() => {
                                setSelectedFollowupRequest(row)
                                setFollowupForm({
                                  mode: 'PHONE',
                                  notes: '',
                                  nextFollowupDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
                                })
                              }}
                              title="Log Follow-up"
                              className="px-2 py-1 rounded bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-[10px] font-medium"
                            >
                              Log F/U
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. Submodule 2: INQUIRIES REGISTER */}
      {activeTab === 'inquiries' && (
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-semibold text-slate-600 dark:text-zinc-400">
                  <th className="py-2.5 px-3">Inquiry #</th>
                  <th className="py-2.5 px-3">FG Part / Title</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Item Sourced</th>
                  <th className="py-2.5 px-3 text-right">Target Price</th>
                  <th className="py-2.5 px-3 text-center">Vendors Sent</th>
                  <th className="py-2.5 px-3 text-center">Quotes Recv</th>
                  <th className="py-2.5 px-3 text-right">Lowest Quote</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/70">
                {inquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40">
                    <td className="py-2.5 px-3 font-mono font-semibold text-blue-600 dark:text-blue-400">{inq.inquiryNumber}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">
                      <div>{inq.fgPartName || inq.title}</div>
                      <div className="text-[10px] text-slate-400 dark:text-zinc-500">{inq.fgPartNo}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-300">{inq.customer || 'Internal'}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-800 dark:text-zinc-200">{inq.item?.name || 'Raw Material'}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-zinc-400">
                      {inq.customerTargetPrice ? `₹${inq.customerTargetPrice}` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-800 dark:text-zinc-200">{inq.vendorsSentCount}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">{inq.quotesReceivedCount}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {inq.lowestQuote ? `₹${inq.lowestQuote}` : '—'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        {inq.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setActiveTab('rfqRequests')}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        View Lines →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Submodule 3: SCORECARD (§8.4 & §16 Live Score Model) */}
      {activeTab === 'scorecard' && (
        <div className="space-y-4">
          <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 p-3 rounded-lg flex items-center justify-between text-xs">
            <span className="text-slate-700 dark:text-zinc-300">
              <strong>§16 Live Score Formula:</strong> (Operational Sourcing Score × 70%) + (Quality Audit Score × 30%) - Open NC Penalty (5 pts each). Blocked vendors receive score 0.
            </span>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-semibold text-slate-600 dark:text-zinc-400">
                    <th className="py-2.5 px-3">Rank / Vendor</th>
                    <th className="py-2.5 px-3">Capabilities</th>
                    <th className="py-2.5 px-3 text-center">RFQs Recv</th>
                    <th className="py-2.5 px-3 text-center">Quotes Sub</th>
                    <th className="py-2.5 px-3 text-center">Response Rate</th>
                    <th className="py-2.5 px-3 text-center">OTD %</th>
                    <th className="py-2.5 px-3 text-center">Rejection %</th>
                    <th className="py-2.5 px-3 text-center">Audit Score</th>
                    <th className="py-2.5 px-3 text-center">Open NCs</th>
                    <th className="py-2.5 px-3 text-center">Live Score</th>
                    <th className="py-2.5 px-3">Band</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/70">
                  {scorecard.map((v, idx) => (
                    <tr key={v.vendorId} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40">
                      <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center font-mono text-[10px] font-bold text-slate-600 dark:text-zinc-400">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="font-semibold">{v.vendorName}</div>
                          <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">{v.vendorCode}</div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-300 max-w-xs truncate">{v.capabilities || 'General'}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{v.rfqsReceived}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-medium text-blue-600 dark:text-blue-400">{v.quotesSubmitted}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{v.quoteResponseRate}%</td>
                      <td className="py-2.5 px-3 text-center font-mono text-emerald-600 dark:text-emerald-400 font-medium">{v.onTimeDelivery}%</td>
                      <td className="py-2.5 px-3 text-center font-mono text-rose-600 dark:text-rose-400">{v.rejectionPct}%</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">{v.auditScore}%</td>
                      <td className="py-2.5 px-3 text-center font-mono">
                        {v.openNcCount > 0 ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold">
                            {v.openNcCount} Open
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400">0</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="text-sm font-bold font-mono text-slate-900 dark:text-white px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800">
                          {v.compositeScore}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            v.bandColor === 'green'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : v.bandColor === 'blue'
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                              : v.bandColor === 'amber'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {v.rankingBand}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. Submodule 4: FIND VENDOR (§8.4 Smart Capability Search) */}
      {activeTab === 'findVendor' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Smart Capability Matching</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Filter registered capabilities and view suppliers ranked best-first. Blocked suppliers are excluded automatically.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {['SS304 Coil', 'CNC', 'Heat Treatment', 'Subcontracting', 'Tooling', 'Packaging', 'Raw Material'].map((cap) => (
                <button
                  key={cap}
                  onClick={() => handleSmartSearch(cap)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    capabilityFilter === cap
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {cap}
                </button>
              ))}
              {capabilityFilter && (
                <button
                  onClick={() => handleSmartSearch('')}
                  className="px-2 py-1 text-xs text-rose-600 dark:text-rose-400 hover:underline"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {smartVendors.map((v) => (
              <div
                key={v.id}
                className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-3 shadow-2xs hover:border-blue-500/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{v.name}</h4>
                    <span className="font-mono text-[10px] text-slate-400 dark:text-zinc-500">{v.vendorCode}</span>
                  </div>
                  <span className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center font-mono">
                    {v.compositeScore}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-zinc-400">
                  <div><strong>Capabilities:</strong> {v.capabilities || 'General'}</div>
                  <div className="flex items-center gap-3">
                    <span>Audit Score: <strong className="text-slate-900 dark:text-white">{v.auditScore}%</strong></span>
                    <span>Rating: <strong className="text-amber-600">★ {v.rating}</strong></span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  {v.canRaisePO ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Can raise PO
                    </span>
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Gated / Blocked
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setWizardForm((prev) => ({
                        ...prev,
                        selectedVendorIds: prev.selectedVendorIds.includes(v.id)
                          ? prev.selectedVendorIds
                          : [...prev.selectedVendorIds, v.id],
                      }))
                      setShowNewWizard(true)
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Select for RFQ +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. MODAL: GENERATE RFQ EMAIL (§8.2, Screenshot Page 12) */}
      {selectedMailRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 w-full max-w-xl shadow-2xl overflow-hidden text-xs">
            <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-800/50">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Generate RFQ Mail — {selectedMailRequest.vendorName}
              </h3>
              <button
                onClick={() => setSelectedMailRequest(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase text-slate-500">TO</label>
                <div className="p-2 bg-slate-50 dark:bg-zinc-800 rounded font-mono text-slate-800 dark:text-zinc-200">
                  N. Gowda — Purchase ({selectedMailRequest.vendorName})
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase text-slate-500">SUBJECT</label>
                <div className="p-2 bg-slate-50 dark:bg-zinc-800 rounded font-semibold text-slate-900 dark:text-white">
                  RFQ: {selectedMailRequest.requestType} - {selectedMailRequest.fgPartName} ({selectedMailRequest.fgPartNo})
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase text-slate-500">MESSAGE</label>
                <div className="p-3 bg-slate-50 dark:bg-zinc-800/90 rounded border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 space-y-2.5 font-sans leading-relaxed">
                  <p>Dear {selectedMailRequest.vendorName},</p>
                  <p>
                    {selectedMailRequest.requestType === 'Subcontracting'
                      ? 'We wish to place the following job-work / subcontracting requirement and request your best processing charges:'
                      : selectedMailRequest.requestType === 'Equipment'
                      ? 'We invite your technical and commercial proposal for supply and commissioning of the following equipment:'
                      : 'We request your competitive quotation for supply of the following materials:'}
                  </p>
                  <div className="pl-3 border-l-2 border-blue-500 font-mono space-y-1 text-[11px]">
                    <div>Inquiry No : {selectedMailRequest.inquiryNumber}</div>
                    <div>FG Part    : {selectedMailRequest.fgPartName} ({selectedMailRequest.fgPartNo})</div>
                    <div>Item       : {selectedMailRequest.itemName} ({selectedMailRequest.itemCode})</div>
                    <div>Category   : {selectedMailRequest.requestType}</div>
                    <div>Quantity   : {selectedMailRequest.quantity} NOS</div>
                    <div>Required By: {new Date(selectedMailRequest.dueDate).toLocaleDateString('en-GB')}</div>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                    Please share unit price, lead time, MOQ, payment terms and validity. Kindly quote GST separately.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-3 bg-slate-50 dark:bg-zinc-800/50">
              <button
                type="button"
                onClick={() => setSelectedMailRequest(null)}
                className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`RFQ: ${selectedMailRequest.inquiryNumber} - ${selectedMailRequest.fgPartName}`)
                  alert('Email content copied to clipboard')
                }}
                className="px-3 py-1.5 rounded-md bg-slate-200 dark:bg-zinc-700 text-slate-800 dark:text-white hover:bg-slate-300 font-medium"
              >
                Copy
              </button>
              <button
                type="button"
                onClick={() => handleSendMail(selectedMailRequest)}
                className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                Mark as Sent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: MARK STATUS & PRICE OFFERED (§8.1) */}
      {selectedStatusRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 w-full max-w-md shadow-2xl overflow-hidden text-xs">
            <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Record Vendor Response — {selectedStatusRequest.vendorName}
              </h3>
              <button onClick={() => setSelectedStatusRequest(null)}>✕</button>
            </div>

            <form onSubmit={handleSaveStatus} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-zinc-300">Status Marking</label>
                <select
                  value={statusForm.status}
                  onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                >
                  <option value="QUOTED">Quoted (Record Offered Price)</option>
                  <option value="AWAITING">Awaiting Response</option>
                  <option value="NO_RESPONSE">No Response (Timed out)</option>
                  <option value="NOT_INTERESTED">Not Interested (Supplier declined)</option>
                  <option value="NOT_FEASIBLE">Not Feasible (Technical constraint)</option>
                </select>
              </div>

              {statusForm.status === 'QUOTED' && (
                <>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-zinc-300">Offered Price (₹ / unit)</label>
                    <input
                      type="number"
                      required
                      value={statusForm.offeredPrice}
                      onChange={(e) => setStatusForm({ ...statusForm, offeredPrice: e.target.value })}
                      placeholder="e.g. 214"
                      className="w-full px-3 py-2 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-zinc-300">Lead Time (Days)</label>
                      <input
                        type="number"
                        value={statusForm.leadTimeDays}
                        onChange={(e) => setStatusForm({ ...statusForm, leadTimeDays: e.target.value })}
                        className="w-full px-3 py-2 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-zinc-300">MOQ</label>
                      <input
                        type="number"
                        value={statusForm.moq}
                        onChange={(e) => setStatusForm({ ...statusForm, moq: e.target.value })}
                        className="w-full px-3 py-2 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-zinc-300">Notes / Remarks</label>
                <textarea
                  value={statusForm.notes}
                  onChange={(e) => setStatusForm({ ...statusForm, notes: e.target.value })}
                  placeholder="e.g. Quoted per drawing rev 1 with 30 days payment terms"
                  className="w-full px-3 py-2 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                  rows={2}
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStatusRequest(null)}
                  className="px-3 py-1.5 rounded border border-slate-300 dark:border-zinc-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium">
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL: LOG FOLLOW-UP (§8.1, §8.2) */}
      {selectedFollowupRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 w-full max-w-md shadow-2xl overflow-hidden text-xs">
            <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Log RFQ Follow-up — {selectedFollowupRequest.vendorName}
              </h3>
              <button onClick={() => setSelectedFollowupRequest(null)}>✕</button>
            </div>

            <form onSubmit={handleSaveFollowup} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-zinc-300">Contact Mode</label>
                <select
                  value={followupForm.mode}
                  onChange={(e) => setFollowupForm({ ...followupForm, mode: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                >
                  <option value="PHONE">Phone Call</option>
                  <option value="EMAIL">Email Follow-up</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="MEETING">In-Person Meeting</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-zinc-300">Follow-up Notes</label>
                <textarea
                  required
                  value={followupForm.notes}
                  onChange={(e) => setFollowupForm({ ...followupForm, notes: e.target.value })}
                  placeholder="e.g. Spoke with Sales Head. Quote will be emailed by tomorrow 4 PM."
                  className="w-full px-3 py-2 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                  rows={3}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-zinc-300">Next Follow-up Date</label>
                <input
                  type="date"
                  value={followupForm.nextFollowupDate}
                  onChange={(e) => setFollowupForm({ ...followupForm, nextFollowupDate: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedFollowupRequest(null)}
                  className="px-3 py-1.5 rounded border border-slate-300 dark:border-zinc-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium">
                  Record Follow-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. MODAL: NEW INQUIRY WIZARD (§8.3, Screenshot Page 13) */}
      {showNewWizard && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 w-full max-w-2xl shadow-2xl overflow-hidden text-xs max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-800/50">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">New Inquiry</h3>
              <button onClick={() => setShowNewWizard(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateInquiry} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">FG PART NAME *</label>
                  <input
                    type="text"
                    required
                    value={wizardForm.fgPartName}
                    onChange={(e) => setWizardForm({ ...wizardForm, fgPartName: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">FG PART NO *</label>
                  <input
                    type="text"
                    required
                    value={wizardForm.fgPartNo}
                    onChange={(e) => setWizardForm({ ...wizardForm, fgPartNo: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">CUSTOMER *</label>
                  <input
                    type="text"
                    required
                    value={wizardForm.customer}
                    onChange={(e) => setWizardForm({ ...wizardForm, customer: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">CUSTOMER TARGET PRICE (₹)</label>
                  <input
                    type="number"
                    value={wizardForm.customerTargetPrice}
                    onChange={(e) => setWizardForm({ ...wizardForm, customerTargetPrice: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">REQUEST TYPE</label>
                  <select
                    value={wizardForm.requestType}
                    onChange={(e) => setWizardForm({ ...wizardForm, requestType: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                  >
                    <option value="Subcontracting">Subcontracting</option>
                    <option value="Raw Material">Raw Material</option>
                    <option value="Child Part">Child Part</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Tooling">Tooling</option>
                    <option value="Consumable">Consumable</option>
                    <option value="Packaging">Packaging</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">ITEM (FROM MASTER)</label>
                  <select
                    value={wizardForm.itemId}
                    onChange={(e) => setWizardForm({ ...wizardForm, itemId: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                  >
                    {masterItems.map((it) => (
                      <option key={it.id} value={it.id}>
                        {it.itemCode} — {it.name} ({it.uom})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">REQUIRED QTY</label>
                  <input
                    type="number"
                    value={wizardForm.quantity}
                    onChange={(e) => setWizardForm({ ...wizardForm, quantity: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">DUE DATE</label>
                  <input
                    type="date"
                    value={wizardForm.dueDate}
                    onChange={(e) => setWizardForm({ ...wizardForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">DRAWING / SPEC</label>
                  <input
                    type="text"
                    value={wizardForm.drawingSpec}
                    onChange={(e) => setWizardForm({ ...wizardForm, drawingSpec: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Vendor Selection (§8.3) */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                <label className="text-[10px] font-bold uppercase text-slate-500">
                  SEND RFQ TO — capability-matched, ranked; blocked excluded
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto p-2 bg-slate-50 dark:bg-zinc-800/50 rounded border border-slate-200 dark:border-zinc-700">
                  {availableVendors
                    .filter((v) => !v.isBlocked)
                    .map((vendor) => {
                      const isSelected = wizardForm.selectedVendorIds.includes(vendor.id)
                      return (
                        <label
                          key={vendor.id}
                          className="flex items-center justify-between p-2 rounded hover:bg-slate-100 dark:hover:bg-zinc-700/60 cursor-pointer border border-transparent has-checked:border-blue-400 has-checked:bg-blue-50/50 dark:has-checked:bg-blue-950/30"
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setWizardForm({
                                    ...wizardForm,
                                    selectedVendorIds: [...wizardForm.selectedVendorIds, vendor.id],
                                  })
                                } else {
                                  setWizardForm({
                                    ...wizardForm,
                                    selectedVendorIds: wizardForm.selectedVendorIds.filter((id) => id !== vendor.id),
                                  })
                                }
                              }}
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white">{vendor.name}</div>
                              <div className="text-[10px] text-slate-500 dark:text-zinc-400">{vendor.capabilities || 'Supplier'}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                              ★ {vendor.compositeScore}
                            </span>
                          </div>
                        </label>
                      )
                    })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewWizard(false)}
                  className="px-4 py-1.5 rounded-md border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs"
                >
                  Create & Send RFQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
