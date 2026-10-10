import React, { useState, useEffect } from 'react'
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Upload,
  Lock,
  Unlock,
  Check,
  Search,
  Sliders,
  Award,
  ChevronRight,
  AlertCircle,
  FileCheck,
} from 'lucide-react'
import { apiRequest } from '../lib/api'

interface QualificationRecord {
  vendorId: string
  vendorCode: string
  vendorName: string
  capabilities?: string
  auditScore: number | null
  openNcCount: number
  liveRank: number
  qualificationStatus: 'QUALIFIED' | 'PENDING_AUDIT' | 'CONDITIONAL' | 'BLOCKED' | string
  poEligibility: string
  isEligible: boolean
  eligibilityReason: string
  isBlocked: boolean
  blockedReason?: string
  latestAuditDate?: string | null
  latestAuditAttachment?: string | null
  openNcs: Array<{
    id: string
    ncNumber: string
    description: string
    severity: string
    targetDate: string
    status: string
  }>
}

export const VendorAuditPage: React.FC = () => {
  const [register, setRegister] = useState<QualificationRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Conduct Audit Modal
  const [showAuditModal, setShowAuditModal] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<QualificationRecord | null>(null)
  const [auditScores, setAuditScores] = useState({
    qms: 85, // 20%
    process: 82, // 20%
    infrastructure: 80, // 15%
    traceability: 84, // 15%
    delivery: 80, // 15%
    documentation: 82, // 15%
  })
  const [auditType, setAuditType] = useState('ON_SITE')
  const [attachmentName, setAttachmentName] = useState('Audit-Report-2026.pdf')
  const [hasNc, setHasNc] = useState(false)
  const [ncDescription, setNcDescription] = useState('')
  const [ncSeverity, setNcSeverity] = useState('MINOR')
  const [ncTargetDate, setNcTargetDate] = useState(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0])
  const [auditRemarks, setAuditRemarks] = useState('')

  // Close NC Modal
  const [selectedNc, setSelectedNc] = useState<any | null>(null)
  const [capaDetails, setCapaDetails] = useState('')

  // Block Modal
  const [blockTargetVendor, setBlockTargetVendor] = useState<QualificationRecord | null>(null)
  const [blockReason, setBlockReason] = useState('')

  useEffect(() => {
    fetchRegister()
  }, [])

  const fetchRegister = async () => {
    setIsLoading(true)
    try {
      const res = await apiRequest<{ success: boolean; data: QualificationRecord[] }>('/vendor-audits')
      if (res.success) setRegister(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  // Live Score Gauge Calculation (weighted to 100 per §12, Page 18, 19)
  const liveTotalScore = Math.round(
    auditScores.qms * 0.20 +
    auditScores.process * 0.20 +
    auditScores.infrastructure * 0.15 +
    auditScores.traceability * 0.15 +
    auditScores.delivery * 0.15 +
    auditScores.documentation * 0.15
  )

  const meetsMinimum = liveTotalScore >= 70

  const handleOpenAuditModal = (vendor: QualificationRecord) => {
    setSelectedVendor(vendor)
    setAttachmentName(`${vendor.vendorCode}_Audit_Report_${new Date().toISOString().split('T')[0]}.pdf`)
    setHasNc(false)
    setNcDescription('')
    setShowAuditModal(true)
  }

  const handleSaveAudit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVendor) return

    try {
      const payload: any = {
        vendorId: selectedVendor.vendorId,
        auditType,
        qmsScore: auditScores.qms,
        processScore: auditScores.process,
        infrastructureScore: auditScores.infrastructure,
        traceabilityScore: auditScores.traceability,
        deliveryScore: auditScores.delivery,
        documentationScore: auditScores.documentation,
        attachmentName,
        remarks: auditRemarks,
      }

      if (hasNc && ncDescription.trim()) {
        payload.nonConformances = [
          {
            description: ncDescription,
            severity: ncSeverity,
            targetDate: ncTargetDate,
          },
        ]
      }

      const res = await apiRequest('/vendor-audits', {
        method: 'POST',
        body: payload,
      })

      if (res.success) {
        setShowAuditModal(false)
        fetchRegister()
      }
    } catch (e) {
      alert('Failed to record audit')
    }
  }

  const handleCloseNc = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedNc) return

    try {
      const res = await apiRequest(`/vendor-audits/non-conformances/${selectedNc.id}/close`, {
        method: 'POST',
        body: { capaDetails },
      })

      if (res.success) {
        setSelectedNc(null)
        setCapaDetails('')
        fetchRegister()
      }
    } catch (e) {
      alert('Failed to close NC')
    }
  }

  const handleBlockVendor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!blockTargetVendor) return

    try {
      const res = await apiRequest(`/vendor-audits/block/${blockTargetVendor.vendorId}`, {
        method: 'POST',
        body: { reason: blockReason },
      })

      if (res.success) {
        setBlockTargetVendor(null)
        setBlockReason('')
        fetchRegister()
      }
    } catch (e) {
      alert('Failed to block vendor')
    }
  }

  const handleUnblockVendor = async (vendorId: string) => {
    try {
      const res = await apiRequest(`/vendor-audits/unblock/${vendorId}`, {
        method: 'POST',
      })
      if (res.success) fetchRegister()
    } catch (e) {
      alert('Failed to unblock vendor')
    }
  }

  // Stat Strip Counts (§12, Page 18)
  const qualifiedCount = register.filter((v) => v.qualificationStatus === 'QUALIFIED').length
  const pendingAuditCount = register.filter((v) => v.qualificationStatus === 'PENDING_AUDIT').length
  const conditionalCount = register.filter((v) => v.qualificationStatus === 'CONDITIONAL').length
  const blockedCount = register.filter((v) => v.isBlocked || v.qualificationStatus === 'BLOCKED').length
  const totalOpenNcs = register.reduce((sum, v) => sum + v.openNcCount, 0)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Bar matching Screenshots 3 & 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-[#1c1328] text-purple-600 dark:text-[#c084fc] flex items-center justify-center border border-purple-100/60 dark:border-purple-900/30">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Vendor Audit & Qualification
            </h1>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
              A vendor can be ordered only when audited, scored ≥ 70 and free of open non-conformances
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const firstPending = register.find((r) => r.qualificationStatus === 'PENDING_AUDIT') || register[0]
            if (firstPending) handleOpenAuditModal(firstPending)
          }}
          className="flex items-center gap-1.5 bg-black text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 px-4 py-2 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
        >
          <Shield className="w-3.5 h-3.5" />
          <span>New Audit</span>
        </button>
      </div>

      {/* 2. Stat Strip per Screenshot Page 18 */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
            QUALIFIED
          </span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{qualifiedCount}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
            PENDING AUDIT
          </span>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{pendingAuditCount}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
            CONDITIONAL
          </span>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{conditionalCount}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-lg border border-rose-200 dark:border-rose-950/60 shadow-2xs">
          <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
            BLOCKED / NOT QUAL
          </span>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{blockedCount}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-lg border border-rose-200 dark:border-rose-950/60 shadow-2xs">
          <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
            OPEN NCS
          </span>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{totalOpenNcs}</div>
        </div>
      </div>

      {/* 3. SUPPLIER QUALIFICATION REGISTER TABLE (Page 18) */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-2xs">
        <div className="p-3.5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/40 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
            Supplier Qualification Register
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
                <th className="py-3 px-4">VENDOR</th>
                <th className="py-3 px-4 text-center">SCORE</th>
                <th className="py-3 px-4 text-center">OPEN NC</th>
                <th className="py-3 px-4 text-center">RANK</th>
                <th className="py-3 px-4">QUALIFICATION</th>
                <th className="py-3 px-4">PO ELIGIBILITY</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/70">
              {register
                .filter((r) => !searchQuery || r.vendorName.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((row) => (
                  <tr key={row.vendorId} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{row.vendorName}</div>
                      <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                        {row.vendorCode} · {row.capabilities || 'Supplier'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-900 dark:text-white">
                      {row.auditScore !== null ? `${row.auditScore}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {row.openNcCount > 0 ? (
                        <button
                          onClick={() => setSelectedNc(row.openNcs[0])}
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 hover:underline"
                        >
                          {row.openNcCount} (Resolve)
                        </button>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-700 dark:text-zinc-300">
                      {row.auditScore !== null ? row.liveRank : '—'}
                    </td>
                    <td className="py-3 px-4">
                      {row.qualificationStatus === 'QUALIFIED' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Qualified
                        </span>
                      ) : row.qualificationStatus === 'CONDITIONAL' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Conditional
                        </span>
                      ) : row.qualificationStatus === 'PENDING_AUDIT' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Pending Audit
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Blocked
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {row.isEligible ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          Can raise PO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400" title={row.eligibilityReason}>
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          Blocked
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenAuditModal(row)}
                          className="px-2.5 py-1 rounded bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-[11px] font-medium"
                        >
                          Audit →
                        </button>
                        {row.isBlocked ? (
                          <button
                            onClick={() => handleUnblockVendor(row.vendorId)}
                            className="px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-medium hover:bg-emerald-100"
                          >
                            Unblock
                          </button>
                        ) : (
                          <button
                            onClick={() => setBlockTargetVendor(row)}
                            className="px-2 py-1 rounded bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-medium hover:bg-rose-100"
                          >
                            Block
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. CONDUCT AUDIT MODAL (§12, Screenshot Page 19) */}
      {showAuditModal && selectedVendor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 w-full max-w-xl shadow-2xl overflow-hidden text-xs max-h-[92vh] flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-800/50">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Vendor Qualification Audit
              </h3>
              <button onClick={() => setShowAuditModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveAudit} className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Vendor & Type header */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-lg">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500">VENDOR</label>
                  <div className="font-semibold text-slate-900 dark:text-white">{selectedVendor.vendorName}</div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500">AUDIT TYPE</label>
                  <select
                    value={auditType}
                    onChange={(e) => setAuditType(e.target.value)}
                    className="w-full mt-0.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded px-2 py-1"
                  >
                    <option value="ON_SITE">On-site</option>
                    <option value="DESK_REVIEW">Desk Review</option>
                    <option value="SURVEILLANCE">Surveillance</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500">AUDIT DATE</label>
                  <div className="font-medium text-slate-900 dark:text-white mt-0.5">
                    {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* 6 Weighted Parameters (§12, Page 18, 19) */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  ASSESSMENT PARAMETERS (WEIGHTED TO 100)
                </label>

                {[
                  { key: 'qms', label: 'Quality Management System', wt: 'wt 20%', val: auditScores.qms },
                  { key: 'process', label: 'Process Capability & Controls', wt: 'wt 20%', val: auditScores.process },
                  { key: 'infrastructure', label: 'Infrastructure & Equipment', wt: 'wt 15%', val: auditScores.infrastructure },
                  { key: 'traceability', label: 'Material & Traceability', wt: 'wt 15%', val: auditScores.traceability },
                  { key: 'delivery', label: 'Delivery & Capacity', wt: 'wt 15%', val: auditScores.delivery },
                  { key: 'documentation', label: 'Documentation & Certifications', wt: 'wt 15%', val: auditScores.documentation },
                ].map((item) => (
                  <div key={item.key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 dark:text-zinc-300">
                        {item.label} <span className="text-slate-400 font-mono text-[10px]">{item.wt}</span>
                      </span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{item.val}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={item.val}
                      onChange={(e) =>
                        setAuditScores({ ...auditScores, [item.key]: Number(e.target.value) })
                      }
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              {/* Live Score Gauge (Page 19) */}
              <div className="p-4 bg-slate-50 dark:bg-zinc-800/70 rounded-xl border border-slate-200 dark:border-zinc-700 flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center font-mono font-bold text-lg border-3 ${
                    meetsMinimum
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                      : 'border-rose-500 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40'
                  }`}
                >
                  {liveTotalScore}
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    {meetsMinimum ? 'Meets minimum — qualifies' : 'Below minimum — Not Qualified'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Minimum score to raise a PO is 70. Any open NC keeps the vendor on hold.
                  </div>
                </div>
              </div>

              {/* Non-Conformances Section */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                  <span>NON-CONFORMANCES</span>
                  <label className="flex items-center gap-1.5 font-normal normal-case text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasNc}
                      onChange={(e) => setHasNc(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>Log an audit Non-Conformance (NC)</span>
                  </label>
                </label>

                {hasNc && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded space-y-2.5">
                    <div className="space-y-1">
                      <label className="font-semibold text-rose-800 dark:text-rose-300">NC Description</label>
                      <input
                        type="text"
                        required
                        value={ncDescription}
                        onChange={(e) => setNcDescription(e.target.value)}
                        placeholder="e.g. Calibration certificates expired on CNC Coordinate Measuring Machine"
                        className="w-full px-2.5 py-1.5 rounded border border-rose-300 dark:border-rose-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-rose-800 dark:text-rose-300">Severity</label>
                        <select
                          value={ncSeverity}
                          onChange={(e) => setNcSeverity(e.target.value)}
                          className="w-full mt-1 bg-white dark:bg-zinc-900 border border-rose-300 dark:border-rose-800 rounded px-2 py-1"
                        >
                          <option value="MINOR">Minor</option>
                          <option value="MAJOR">Major</option>
                          <option value="CRITICAL">Critical</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-semibold text-rose-800 dark:text-rose-300">CAPA Target Date</label>
                        <input
                          type="date"
                          value={ncTargetDate}
                          onChange={(e) => setNcTargetDate(e.target.value)}
                          className="w-full mt-1 bg-white dark:bg-zinc-900 border border-rose-300 dark:border-rose-800 rounded px-2 py-1"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mandatory Audit Result Attachment (§12, Page 19) */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  AUDIT RESULT ATTACHMENT (MANDATORY PER §12)
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-2 bg-slate-50 dark:bg-zinc-800 rounded border border-slate-200 dark:border-zinc-700 font-mono text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>{attachmentName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const name = prompt('Enter audit report document name / path:', attachmentName)
                      if (name) setAttachmentName(name)
                    }}
                    className="px-3 py-2 rounded bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 text-slate-800 dark:text-white"
                  >
                    Change
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAuditModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-black text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  Record Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. NC CLOSURE & CAPA MODAL */}
      {selectedNc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 w-full max-w-md shadow-2xl p-5 space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Close Audit Non-Conformance: {selectedNc.ncNumber}
            </h3>
            <p className="text-slate-600 dark:text-zinc-400">{selectedNc.description}</p>

            <form onSubmit={handleCloseNc} className="space-y-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-zinc-300">
                  Corrective & Preventive Action (CAPA) Details *
                </label>
                <textarea
                  required
                  value={capaDetails}
                  onChange={(e) => setCapaDetails(e.target.value)}
                  placeholder="State verified actions taken by the vendor to eliminate the non-conformance..."
                  className="w-full px-3 py-2 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                  rows={4}
                />
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-[11px]">
                Upon CAPA verification by Quality, if all NCs are resolved and audit score ≥ 70, the vendor will be automatically re-qualified to raise POs (§12).
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedNc(null)}
                  className="px-3 py-1.5 rounded border border-slate-300 dark:border-zinc-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                  Verify CAPA & Close NC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. BLOCK VENDOR MODAL */}
      {blockTargetVendor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 w-full max-w-md shadow-2xl p-5 space-y-4 text-xs">
            <h3 className="font-bold text-rose-600 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Block Supplier: {blockTargetVendor.vendorName}
            </h3>
            <p className="text-slate-600 dark:text-zinc-400">
              Blocking drops this supplier out of ordering, recommendations, and live ranking until explicitly unblocked by Quality.
            </p>

            <form onSubmit={handleBlockVendor} className="space-y-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-zinc-300">Reason for Blocking *</label>
                <textarea
                  required
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="State reason (e.g. Repeated dimensional non-conformance, delivery failure, safety breach)..."
                  className="w-full px-3 py-2 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBlockTargetVendor(null)}
                  className="px-3 py-1.5 rounded border border-slate-300 dark:border-zinc-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold">
                  Confirm Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
