import React, { useState, useEffect } from 'react'
import {
  Building2,
  Shield,
  Lock,
  Users,
  CheckCircle2,
  Save,
  Layers,
  Key,
  Globe,
  Database,
  FileText,
} from 'lucide-react'
import { apiRequest } from '../lib/api'

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'doa' | 'roles' | 'controls'>('profile')
  const [companyProfile, setCompanyProfile] = useState<any>({
    companyName: 'SLT Engineering Ltd.',
    brandTitle: 'SLT Procurement Suite',
    gstin: '29AABCS1429B1Z2',
    pan: 'AABCS1429B',
    cin: 'L29100KA1998PLC024112',
    address: 'Plot 42, Electronic City Phase II, Hosur Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560100',
    country: 'India',
    phone: '+91 (80) 4192-8000',
    email: 'procurement@slt-engineering.com',
    currentFiscalYear: 'FY 2026-27',
  })

  const [doaMatrix, setDoaMatrix] = useState<any[]>([])
  const [rolePermissions, setRolePermissions] = useState<any[]>([])
  const [lockedControls, setLockedControls] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const res = await apiRequest<{ success: boolean; data: any }>('/settings')
      if (res.success && res.data) {
        if (res.data.companyProfile) setCompanyProfile(res.data.companyProfile)
        if (res.data.delegationOfAuthority) {
          const rawDoa = res.data.delegationOfAuthority
          const formattedDoa = Array.isArray(rawDoa)
            ? rawDoa
            : typeof rawDoa === 'object' && rawDoa !== null
              ? Object.entries(rawDoa).map(([key, val]: [string, any]) => ({
                  valueBand: val.description || val.valueBand || key,
                  maxLimit: val.maxAmount !== undefined ? val.maxAmount : val.maxLimit,
                  authority: val.authority || 'Management',
                  description: val.description || val.workflow || '',
                }))
              : []
          setDoaMatrix(formattedDoa)
        }
        if (res.data.rolePermissions && Array.isArray(res.data.rolePermissions)) {
          setRolePermissions(res.data.rolePermissions)
        }
        if (res.data.lockedControls && Array.isArray(res.data.lockedControls)) {
          setLockedControls(res.data.lockedControls)
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveSuccess(false)
    try {
      const res = await apiRequest('/settings/COMPANY_PROFILE', {
        method: 'PATCH',
        body: {
          value: companyProfile,
          description: 'Company enterprise legal and procurement entity profile',
        },
      })
      if (res.success) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch (e) {
      alert('Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Bar matching Screenshots 3 & 5 */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-[#1c1328] text-purple-600 dark:text-[#c084fc] flex items-center justify-center border border-purple-100/60 dark:border-purple-900/30">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            System Settings & Governance
          </h1>
          <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
            Configure company legal entity, Delegation of Authority (DOA) value bands, and locked system controls
          </p>
        </div>
      </div>

      {/* Tabs matching Screenshot 4 */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800">
        {[
          { key: 'profile', label: 'Company Profile' },
          { key: 'doa', label: 'DOA Value Bands' },
          { key: 'roles', label: 'Role Matrix' },
          { key: 'controls', label: 'Locked Controls' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer border-b-2 -mb-px ${activeTab === tab.key
                ? 'border-purple-600 text-purple-600 dark:border-[#c084fc] dark:text-[#c084fc]'
                : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 2. TAB 1: COMPANY PROFILE */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-6 space-y-5 shadow-2xs text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Legal Entity & Tax Information</h3>
              <p className="text-slate-500 text-[11px]">Details appear on all printable Purchase Orders and RFQ letterheads.</p>
            </div>
            {saveSuccess && (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Saved Successfully!
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-zinc-300">Company Legal Name</label>
              <input
                type="text"
                value={companyProfile.companyName}
                onChange={(e) => setCompanyProfile({ ...companyProfile, companyName: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-zinc-300">Brand Title</label>
              <input
                type="text"
                value={companyProfile.brandTitle}
                onChange={(e) => setCompanyProfile({ ...companyProfile, brandTitle: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-zinc-300">GSTIN Number</label>
              <input
                type="text"
                value={companyProfile.gstin}
                onChange={(e) => setCompanyProfile({ ...companyProfile, gstin: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-zinc-300">PAN Number</label>
              <input
                type="text"
                value={companyProfile.pan}
                onChange={(e) => setCompanyProfile({ ...companyProfile, pan: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-zinc-300">CIN Number</label>
              <input
                type="text"
                value={companyProfile.cin}
                onChange={(e) => setCompanyProfile({ ...companyProfile, cin: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-zinc-300">Registered Office Address</label>
            <input
              type="text"
              value={companyProfile.address}
              onChange={(e) => setCompanyProfile({ ...companyProfile, address: e.target.value })}
              className="w-full px-3 py-2 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-zinc-300">City</label>
              <input
                type="text"
                value={companyProfile.city}
                onChange={(e) => setCompanyProfile({ ...companyProfile, city: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-zinc-300">State</label>
              <input
                type="text"
                value={companyProfile.state}
                onChange={(e) => setCompanyProfile({ ...companyProfile, state: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-zinc-300">Pincode</label>
              <input
                type="text"
                value={companyProfile.pincode}
                onChange={(e) => setCompanyProfile({ ...companyProfile, pincode: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-zinc-300">Fiscal Year</label>
              <input
                type="text"
                value={companyProfile.currentFiscalYear}
                onChange={(e) => setCompanyProfile({ ...companyProfile, currentFiscalYear: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-semibold"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-black text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      )}

      {/* 3. TAB 2: DELEGATION OF AUTHORITY (DOA) VALUE BANDS (§2.3, Page 4) */}
      {activeTab === 'doa' && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/40">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              Delegation of Authority (DOA) Thresholds (§2.3, §6)
            </h3>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Approval tasks for Requisitions and Purchase Orders are routed based on estimated value bands.
            </p>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-semibold text-slate-600 dark:text-zinc-400">
                  <th className="py-3 px-4">VALUE BAND</th>
                  <th className="py-3 px-4 text-right">MAX THRESHOLD (₹)</th>
                  <th className="py-3 px-4">APPROVING AUTHORITY</th>
                  <th className="py-3 px-4">DESCRIPTION / WORKFLOW</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/70">
                {(Array.isArray(doaMatrix) ? doaMatrix : []).map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white font-mono">{row.valueBand}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-700 dark:text-zinc-300">
                      {row.maxLimit ? `₹${Number(row.maxLimit).toLocaleString('en-IN')}` : 'No Ceiling'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-[#c084fc]">
                        {row.authority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-zinc-400">{row.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. TAB 3: ROLE CAPABILITIES MATRIX (§2.3, Page 3, 4) */}
      {activeTab === 'roles' && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/40">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              Role Matrix & Delegation of Authority (§2.3)
            </h3>
            <p className="text-slate-500 text-[11px] mt-0.5">
              The application is role-aware. Unauthorized actions are disabled (not hidden) so the workflow stays visible.
            </p>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-semibold text-slate-600 dark:text-zinc-400">
                  <th className="py-3 px-4 w-48">ROLE</th>
                  <th className="py-3 px-4">PRIMARY CAPABILITIES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/70">
                {(Array.isArray(rolePermissions) ? rolePermissions : []).map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{row.role}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(row.capabilities) ? row.capabilities : []).map((cap: string, j: number) => (
                          <span
                            key={j}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {cap}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TAB 4: LOCKED SYSTEM CONTROLS (§15, Page 24) */}
      {activeTab === 'controls' && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/40">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-600" />
              Locked System Controls (§15 Enterprise Procurement Governance)
            </h3>
            <p className="text-slate-500 text-[11px] mt-0.5">
              These eight non-negotiable security controls cannot be modified or bypassed.
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
            {(Array.isArray(lockedControls) ? lockedControls : []).map((ctrl) => (
              <div key={ctrl.code} className="p-4 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{ctrl.code}</span>
                    <h4 className="font-bold text-slate-900 dark:text-white">{ctrl.name}</h4>
                  </div>
                  <p className="text-slate-600 dark:text-zinc-400">{ctrl.rule}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shrink-0 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  {ctrl.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
