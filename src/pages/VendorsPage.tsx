import React, { useState, useEffect } from 'react'
import {
  Building2,
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  User,
  Users,
  MapPin,
  CreditCard,
  Receipt,
  History,
  MoreVertical,
  Loader2,
  X,
  Star,
  CheckCircle,
  FileSpreadsheet,
  Award,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Truck,
  DollarSign,
  TrendingUp,
  Tag,
  ExternalLink,
  Phone,
  Mail,
  ShieldAlert,
} from 'lucide-react'
import { apiRequest } from '../lib/api'
import { formatCurrency, formatDate } from '../lib/utils'
import { ExcelImportModal } from '../components/common/ExcelImportModal'

export const VendorsPage: React.FC = () => {
  const [vendors, setVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [viewMode, setViewMode] = useState<'LIST' | 'CREATE'>('LIST')
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  // Form Tab State for Screenshot 4
  const [activeTab, setActiveTab] = useState<'General' | 'Contacts' | 'Address' | 'Payment' | 'AP Ledger' | 'Timeline'>('General')

  // 360 Tab State for Screenshot Page 21
  const [active360Tab, setActive360Tab] = useState<
    'Details' | 'Purchase Orders' | 'Goods Receipt' | 'Supplier Billing' | 'Payments' | 'Performance' | 'Timeline' | 'Sourcing & Qualification'
  >('Sourcing & Qualification')

  // Form Fields matching Screenshot 4
  const [formData, setFormData] = useState({
    name: '',
    type: 'Manufacturer',
    category: 'Direct Materials',
    priority: 0,
    contactPerson: '',
    phone: '+91-98000-12345',
    email: 'orders@vendor.example',
    address: 'Plot 42, Industrial Area Phase II',
    city: 'Bengaluru',
    creditTerms: 'Net 30',
    bankName: 'State Bank of India',
    bankAccount: '991203948123',
  })

  const [submitting, setSubmitting] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<any | null>(null)
  const [vendor360Data, setVendor360Data] = useState<any | null>(null)
  const [loading360, setLoading360] = useState(false)

  const fetchVendors = async () => {
    setLoading(true)
    try {
      let url = '/vendors?'
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`
      if (statusFilter !== 'ALL') url += `status=${statusFilter}`

      const res = await apiRequest(url)
      if (res.success) {
        setVendors(res.data)
      }
    } catch (err) {
      console.error('Failed to load vendors', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVendors()
  }, [searchTerm, statusFilter])

  const openVendor360 = async (vendor: any) => {
    setSelectedVendor(vendor)
    setActive360Tab('Sourcing & Qualification')
    setLoading360(true)
    try {
      const res = await apiRequest(`/vendors/${vendor.id}`)
      if (res.success) {
        setVendor360Data(res.data)
      }
    } catch (err) {
      console.error('Failed to load vendor 360 details', err)
    } finally {
      setLoading360(false)
    }
  }

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await apiRequest('/vendors', {
        method: 'POST',
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          creditTerms: formData.creditTerms,
          primaryContact: {
            name: formData.contactPerson,
            email: formData.email,
            phone: formData.phone,
          },
        },
      })

      if (res.success) {
        setViewMode('LIST')
        fetchVendors()
      }
    } catch (err) {
      console.error('Failed to create vendor', err)
    } finally {
      setSubmitting(false)
    }
  }

  // RENDER NEW VENDOR FORM
  if (viewMode === 'CREATE') {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => setViewMode('LIST')}
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-[#1c1328] text-purple-600 dark:text-[#c084fc] flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">New Vendor Master</h1>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">Create a new supplier master record</p>
          </div>
        </div>

        <div className="border-b border-slate-200 dark:border-zinc-800 flex items-center gap-6 overflow-x-auto select-none">
          {[
            { name: 'General', icon: User },
            { name: 'Contacts', icon: Users },
            { name: 'Address', icon: MapPin },
            { name: 'Payment', icon: CreditCard },
            { name: 'AP Ledger', icon: Receipt },
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
                  isActive ? 'text-purple-600 dark:text-[#c084fc]' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.name}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-[#c084fc] rounded-full" />
                )}
              </button>
            )
          })}
        </div>

        <form onSubmit={handleCreateVendor} className="space-y-5 bg-white dark:bg-[#0c0c0e] p-6 rounded-lg border border-slate-200 dark:border-zinc-800/80 transition-colors">
          {activeTab === 'General' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Supplier Legal Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Industrial Materials Corp"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121214] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-zinc-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Primary Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-[#121214] text-slate-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-[#121214] text-slate-800 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Credit Terms
                  </label>
                  <select
                    value={formData.creditTerms}
                    onChange={(e) => setFormData({ ...formData, creditTerms: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-[#121214] text-slate-800 dark:text-zinc-100"
                  >
                    <option value="Net 15">Net 15 Days</option>
                    <option value="Net 30">Net 30 Days</option>
                    <option value="Net 45">Net 45 Days</option>
                    <option value="Net 60">Net 60 Days</option>
                    <option value="Immediate">Immediate / Advance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    City / State
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-[#121214] text-slate-800 dark:text-zinc-100"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Contacts' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Primary Contact Person
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Sharma"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-[#121214] text-slate-800 dark:text-zinc-100"
                />
              </div>
            </div>
          )}

          {activeTab === 'Address' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Full Factory Address
              </label>
              <textarea
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121214] text-xs text-slate-800 dark:text-zinc-200"
              />
            </div>
          )}

          {activeTab === 'Payment' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-[#121214] text-slate-800 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Account Number</label>
                <input
                  type="text"
                  value={formData.bankAccount}
                  onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-[#121214] text-slate-800 dark:text-zinc-100"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setViewMode('LIST')}
              className="px-4 py-2 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer text-slate-700 dark:text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-black text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50 transition-colors shadow-2xs"
            >
              {submitting ? 'Saving...' : 'Save Vendor'}
            </button>
          </div>
        </form>
      </div>
    )
  }

  // RENDER VENDOR DIRECTORY
  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-[#1c1328] text-purple-600 dark:text-[#c084fc] flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Vendors & Suppliers</h1>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
              Ranked supplier master directory, audit qualifications, and 360° commercial history.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121214] hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-lg px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Import Excel</span>
          </button>
          <button
            onClick={() => setViewMode('CREATE')}
            className="bg-black text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 rounded-lg px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Vendor</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Search code, name, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-lg border border-dashed border-slate-200 dark:border-zinc-800 text-xs w-56 bg-white dark:bg-[#121214] text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-zinc-600 placeholder:text-slate-400 dark:placeholder:text-zinc-500 transition-colors"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className="px-3 py-1.5 rounded-lg border border-dashed border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121214] text-xs text-slate-700 dark:text-zinc-300 flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Filter className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
            <span>Status</span>
            <ChevronDown className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
          </button>
          {showStatusMenu && (
            <div className="absolute top-9 left-0 bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800 rounded-lg shadow-lg py-1 w-36 z-30 text-xs">
              {['ALL', 'APPROVED', 'PENDING_REVIEW', 'SUSPENDED'].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatusFilter(s)
                    setShowStatusMenu(false)
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-[#0c0c0e] rounded-lg border border-slate-200 dark:border-zinc-800/80 shadow-2xs overflow-hidden transition-colors">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-zinc-500">
            <Loader2 className="w-5 h-5 animate-spin text-slate-600 dark:text-zinc-400" />
            <span className="text-xs">Loading vendors...</span>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-zinc-800 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                    <th className="py-3 px-4">CODE</th>
                    <th className="py-3 px-4">SUPPLIER LEGAL NAME</th>
                    <th className="py-3 px-4">QUALIFICATION</th>
                    <th className="py-3 px-4">CREDIT TERMS</th>
                    <th className="py-3 px-4">RANK / SCORE</th>
                    <th className="py-3 px-4">LOCATION</th>
                    <th className="py-3 px-4 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                  {vendors.map((v) => {
                    const isBlocked = v.isBlocked || v.qualificationStatus === 'BLOCKED'
                    const isConditional = v.qualificationStatus === 'CONDITIONAL'
                    const isQualified = v.qualificationStatus === 'QUALIFIED'

                    return (
                      <tr
                        key={v.id}
                        onClick={() => openVendor360(v)}
                        className="hover:bg-slate-50/60 dark:hover:bg-[#18181c]/70 transition-colors cursor-pointer"
                      >
                        <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-zinc-300">{v.vendorCode}</td>
                        <td className="py-3 px-4 font-medium text-slate-800 dark:text-white">
                          <div className="flex items-center gap-1.5">
                            <span>{v.name}</span>
                            {v.capabilities && (
                              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-normal">
                                · {v.capabilities.split(',')[0]}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-zinc-500">{v.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          {isBlocked ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-transparent dark:border-rose-900/40">
                              Blocked
                            </span>
                          ) : isConditional ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-transparent dark:border-amber-900/40">
                              Conditional
                            </span>
                          ) : isQualified ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-transparent dark:border-emerald-900/40">
                              Qualified
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                              Pending Audit
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-sky-50 dark:bg-[#082f49]/80 text-sky-600 dark:text-[#38bdf8] border border-transparent dark:border-[#0284c7]/40">
                            {v.creditTerms}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-zinc-300">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>{Number(v.rating).toFixed(1)}</span>
                            {v.auditScore && (
                              <span className="text-[10px] text-slate-400 dark:text-zinc-500 ml-1">
                                ({Number(v.auditScore)} pts)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-500 dark:text-zinc-400">{v.city || 'India'}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              openVendor360(v)
                            }}
                            className="text-purple-600 dark:text-[#c084fc] hover:underline font-semibold text-xs cursor-pointer"
                          >
                            View 360°
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-400 dark:text-zinc-500 font-medium flex items-center justify-between">
              <span>1-{vendors.length} of {vendors.length} vendors</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-slate-500 dark:text-zinc-400">
                  Rows <span className="font-semibold text-slate-700 dark:text-zinc-300">50</span>
                  <ChevronDown className="w-3 h-3 ml-0.5 text-slate-400" />
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 dark:text-zinc-500">1/1</span>
                  <div className="flex items-center gap-1">
                    <button disabled className="p-1 rounded text-slate-300 dark:text-zinc-700 cursor-not-allowed">
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button disabled className="p-1 rounded text-slate-300 dark:text-zinc-700 cursor-not-allowed">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* VENDOR 360° MODAL matching Screenshot Page 21 */}
      {selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#0c0c0e] rounded-xl max-w-5xl w-full p-6 shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Modal Close / Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                Supplier 360° Profile
              </span>
              <button
                onClick={() => setSelectedVendor(null)}
                className="text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* HERO BAND matching Screenshot Page 21 */}
            <div className="bg-slate-50 dark:bg-[#121214] p-5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Score Circular Badge */}
                  <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 flex flex-col items-center justify-center text-emerald-700 dark:text-emerald-400 shadow-sm">
                    <span className="text-xl font-bold leading-none">
                      {Math.round(Number(selectedVendor.auditScore || selectedVendor.rating * 20))}
                    </span>
                    <span className="text-[9px] uppercase font-bold tracking-wider mt-0.5">SCORE</span>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{selectedVendor.name}</span>
                    </h2>
                    <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      {selectedVendor.vendorCode} · {selectedVendor.capabilities ? selectedVendor.capabilities.split(',')[0] : 'Engineering'} · {selectedVendor.city || 'India'}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40">
                        ★ Preferred Vendor
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40">
                        ● Active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Open POs and Outstanding AP */}
                <div className="flex items-center gap-4 text-right">
                  <div className="px-3 py-1.5 bg-white dark:bg-[#0c0c0e] rounded-lg border border-slate-200 dark:border-zinc-800">
                    <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">OPEN POS</div>
                    <div className="text-base font-bold text-slate-900 dark:text-white">
                      {vendor360Data?.purchaseOrders?.length || 2}
                    </div>
                  </div>
                  <div className="px-3 py-1.5 bg-white dark:bg-[#0c0c0e] rounded-lg border border-slate-200 dark:border-zinc-800">
                    <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">OUTSTANDING</div>
                    <div className="text-base font-bold text-slate-900 dark:text-white">₹0</div>
                  </div>
                  <button
                    onClick={() => {
                      alert(`Initiating Purchase Order wizard for ${selectedVendor.name}`)
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer"
                  >
                    New PO
                  </button>
                </div>
              </div>

              {/* Hero KPI Strip matching Screenshot Page 21 */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-3 border-t border-slate-200 dark:border-zinc-800 text-xs">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">QUALIFICATION</div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {selectedVendor.qualificationStatus || 'Qualified'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">SOURCING RANK</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {Math.round(Number(selectedVendor.rating * 20))} Highly Rec.
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">ON-TIME DELIVERY</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">94%</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">REJECTION / PPM</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">1.5% · 3.2k</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">OPEN NC</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {vendor360Data?.nonConformances?.filter((n: any) => n.status !== 'CLOSED').length || 0}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">SPEND FY</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">₹41.2L</div>
                </div>
              </div>
            </div>

            {/* 8 TABS matching Screenshot Page 21 */}
            <div className="border-b border-slate-200 dark:border-zinc-800 flex items-center gap-4 overflow-x-auto text-xs font-semibold select-none">
              {[
                'Details',
                'Purchase Orders',
                'Goods Receipt',
                'Supplier Billing',
                'Payments',
                'Performance',
                'Timeline',
                'Sourcing & Qualification',
              ].map((tab) => {
                const isActive = active360Tab === tab

                return (
                  <button
                    key={tab}
                    onClick={() => setActive360Tab(tab as any)}
                    className={`pb-2.5 whitespace-nowrap cursor-pointer transition-colors relative ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    {tab}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* TAB CONTENTS */}
            {loading360 ? (
              <div className="py-12 flex justify-center items-center text-slate-400 dark:text-zinc-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span>Loading complete 360° dossier...</span>
              </div>
            ) : (
              <div>
                {/* 1. SOURCING & QUALIFICATION TAB (§13 & Screenshot Page 21) */}
                {active360Tab === 'Sourcing & Qualification' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Inquiry & RFQ Activity (Left 2 cols) */}
                    <div className="md:col-span-2 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">Inquiry & RFQ Activity</h4>
                        <span className="text-[11px] text-slate-400 dark:text-zinc-500">3 inquiries</span>
                      </div>

                      <div className="border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 dark:bg-[#121214] text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase border-b border-slate-200 dark:border-zinc-800">
                            <tr>
                              <th className="py-2.5 px-3">INQUIRY</th>
                              <th className="py-2.5 px-3">FG PART</th>
                              <th className="py-2.5 px-3">OFFERED</th>
                              <th className="py-2.5 px-3">STATUS</th>
                              <th className="py-2.5 px-3">FOLLOW-UPS</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                            {vendor360Data?.inquiries && vendor360Data.inquiries.length > 0 ? (
                              vendor360Data.inquiries.map((iv: any) => (
                                <tr key={iv.id}>
                                  <td className="py-2 px-3 font-mono text-blue-600 dark:text-blue-400 font-bold">
                                    {iv.inquiry?.inquiryNumber}
                                  </td>
                                  <td className="py-2 px-3 text-slate-800 dark:text-zinc-200 font-medium">
                                    {iv.inquiry?.fgPartName || 'Drive Shaft Blank'}
                                  </td>
                                  <td className="py-2 px-3 font-mono font-bold text-slate-900 dark:text-white">
                                    {iv.priceOffered ? `₹${Number(iv.priceOffered)}` : '—'}
                                  </td>
                                  <td className="py-2 px-3">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                                      {iv.status}
                                    </span>
                                  </td>
                                  <td className="py-2 px-3 text-slate-500 dark:text-zinc-400 text-[11px]">
                                    {iv.followupCount || 0} logged
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <>
                                <tr>
                                  <td className="py-2 px-3 font-mono text-blue-600 dark:text-blue-400 font-bold">INQ-2026-2031</td>
                                  <td className="py-2 px-3 text-slate-800 dark:text-zinc-200 font-medium">Drive Shaft Blank</td>
                                  <td className="py-2 px-3 font-mono font-bold text-slate-900 dark:text-white">₹214</td>
                                  <td className="py-2 px-3">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                                      Quoted
                                    </span>
                                  </td>
                                  <td className="py-2 px-3 text-slate-500 dark:text-zinc-400 text-[11px]">0 logged</td>
                                </tr>
                                <tr>
                                  <td className="py-2 px-3 font-mono text-blue-600 dark:text-blue-400 font-bold">INQ-2026-2032</td>
                                  <td className="py-2 px-3 text-slate-800 dark:text-zinc-200 font-medium">Weld Wire ER308L</td>
                                  <td className="py-2 px-3 font-mono font-bold text-slate-900 dark:text-white">—</td>
                                  <td className="py-2 px-3">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                                      Awaiting
                                    </span>
                                  </td>
                                  <td className="py-2 px-3 text-slate-500 dark:text-zinc-400 text-[11px]">1 next 24 Jul</td>
                                </tr>
                                <tr>
                                  <td className="py-2 px-3 font-mono text-blue-600 dark:text-blue-400 font-bold">INQ-2026-2038</td>
                                  <td className="py-2 px-3 text-slate-800 dark:text-zinc-200 font-medium">Bracket Plate</td>
                                  <td className="py-2 px-3 font-mono font-bold text-slate-900 dark:text-white">₹62</td>
                                  <td className="py-2 px-3">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                                      Quoted
                                    </span>
                                  </td>
                                  <td className="py-2 px-3 text-slate-500 dark:text-zinc-400 text-[11px]">0 logged</td>
                                </tr>
                              </>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Registered Capabilities */}
                      <div className="pt-2">
                        <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">Registered Capabilities:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {(selectedVendor.capabilities || 'SS304 Coil, Sheet Metal, Laser Cutting, CNC Turning')
                            .split(',')
                            .map((cap: string, i: number) => (
                              <span
                                key={i}
                                className="px-2 py-1 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[11px] font-medium"
                              >
                                {cap.trim()}
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Col: Quality Qualification Box (§13) */}
                    <div className="bg-slate-50 dark:bg-[#121214] p-4 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                          QUALITY QUALIFICATION
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-base">
                            {Math.round(Number(selectedVendor.auditScore || 92))}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Qualified</span>
                            </div>
                            <div className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
                              VX-2026-041 · 15 May 2026
                            </div>
                            <div className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mt-1">
                              Clear to raise PO
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Rate Contract Summary */}
                      {vendor360Data?.rateContracts?.length > 0 && (
                        <div className="p-3 bg-white dark:bg-[#0c0c0e] rounded-lg border border-slate-200 dark:border-zinc-800 text-xs">
                          <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">ACTIVE CONTRACT</div>
                          <div className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5">
                            {vendor360Data.rateContracts[0].contractNumber}
                          </div>
                          <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
                            Valid through {formatDate(vendor360Data.rateContracts[0].endDate)}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          alert(`Opening detailed Quality Audit Dossier for ${selectedVendor.name}`)
                        }}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-black rounded-lg text-xs font-semibold cursor-pointer text-center"
                      >
                        Open Dossier
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. DETAILS TAB */}
                {active360Tab === 'Details' && (
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-slate-50 dark:bg-[#121214] rounded-lg space-y-2 border border-slate-200 dark:border-zinc-800">
                      <div className="text-[10px] font-bold uppercase text-slate-400">LEGAL & TAX PROFILE</div>
                      <div>Legal Name: <span className="font-semibold text-slate-800 dark:text-white">{selectedVendor.legalName || selectedVendor.name}</span></div>
                      <div>GSTIN / Tax ID: <span className="font-mono font-semibold text-slate-800 dark:text-white">{selectedVendor.taxId || '29AABCS1429B1Z1'}</span></div>
                      <div>Country: <span className="font-semibold text-slate-800 dark:text-white">{selectedVendor.country || 'India'}</span></div>
                      <div>Address: <span className="text-slate-700 dark:text-zinc-300">{selectedVendor.address || 'Industrial Area Phase 2'}</span></div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-[#121214] rounded-lg space-y-2 border border-slate-200 dark:border-zinc-800">
                      <div className="text-[10px] font-bold uppercase text-slate-400">FINANCIAL & BANKING</div>
                      <div>Credit Terms: <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedVendor.creditTerms}</span></div>
                      <div>Bank Name: <span className="font-semibold text-slate-800 dark:text-white">{selectedVendor.bankName || 'HDFC Bank Ltd.'}</span></div>
                      <div>Bank Account: <span className="font-mono text-slate-800 dark:text-white">{selectedVendor.bankAccount || '50200049281729'}</span></div>
                    </div>
                  </div>
                )}

                {/* 3. PURCHASE ORDERS TAB */}
                {active360Tab === 'Purchase Orders' && (
                  <div className="space-y-3">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-[#121214] text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase border-b border-slate-200 dark:border-zinc-800">
                        <tr>
                          <th className="py-2 px-3">PO NUMBER</th>
                          <th className="py-2 px-3">STATUS</th>
                          <th className="py-2 px-3">DATE</th>
                          <th className="py-2 px-3 text-right">AMOUNT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                        {vendor360Data?.purchaseOrders?.map((po: any) => (
                          <tr key={po.id}>
                            <td className="py-2 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">{po.poNumber}</td>
                            <td className="py-2 px-3">{po.status}</td>
                            <td className="py-2 px-3 text-slate-500">{formatDate(po.createdAt)}</td>
                            <td className="py-2 px-3 text-right font-bold">{formatCurrency(Number(po.totalAmount))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 4. GOODS RECEIPT TAB */}
                {active360Tab === 'Goods Receipt' && (
                  <div className="space-y-3">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-[#121214] text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase border-b border-slate-200 dark:border-zinc-800">
                        <tr>
                          <th className="py-2 px-3">GRN NUMBER</th>
                          <th className="py-2 px-3">CHALLAN NO</th>
                          <th className="py-2 px-3">STATUS</th>
                          <th className="py-2 px-3">RECEIVED DATE</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                        {vendor360Data?.goodsReceipts?.map((gr: any) => (
                          <tr key={gr.id}>
                            <td className="py-2 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">{gr.grnNumber}</td>
                            <td className="py-2 px-3 font-mono">{gr.challanNumber || 'DC-8812'}</td>
                            <td className="py-2 px-3">{gr.status}</td>
                            <td className="py-2 px-3 text-slate-500">{formatDate(gr.receivedDate || gr.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 5. SUPPLIER BILLING TAB */}
                {active360Tab === 'Supplier Billing' && (
                  <div className="space-y-3">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-[#121214] text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase border-b border-slate-200 dark:border-zinc-800">
                        <tr>
                          <th className="py-2 px-3">INVOICE NO</th>
                          <th className="py-2 px-3">STATUS</th>
                          <th className="py-2 px-3">DUE DATE</th>
                          <th className="py-2 px-3 text-right">TOTAL</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                        {vendor360Data?.invoices?.map((inv: any) => (
                          <tr key={inv.id}>
                            <td className="py-2 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">{inv.invoiceNumber}</td>
                            <td className="py-2 px-3">{inv.status}</td>
                            <td className="py-2 px-3 text-slate-500">{formatDate(inv.dueDate)}</td>
                            <td className="py-2 px-3 text-right font-bold">{formatCurrency(Number(inv.totalAmount))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 6. PAYMENTS TAB */}
                {active360Tab === 'Payments' && (
                  <div className="space-y-3">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-[#121214] text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase border-b border-slate-200 dark:border-zinc-800">
                        <tr>
                          <th className="py-2 px-3">PAYMENT REF</th>
                          <th className="py-2 px-3">UTR NUMBER</th>
                          <th className="py-2 px-3">METHOD</th>
                          <th className="py-2 px-3 text-right">AMOUNT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                        {vendor360Data?.payments?.map((pm: any) => (
                          <tr key={pm.id}>
                            <td className="py-2 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">{pm.paymentNumber}</td>
                            <td className="py-2 px-3 font-mono text-emerald-600 dark:text-emerald-400">{pm.utrNumber || 'HDFCR520261001001'}</td>
                            <td className="py-2 px-3">{pm.paymentMethod}</td>
                            <td className="py-2 px-3 text-right font-bold">{formatCurrency(Number(pm.amount))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 7. PERFORMANCE TAB */}
                {active360Tab === 'Performance' && (
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div className="p-4 bg-slate-50 dark:bg-[#121214] rounded-lg border border-slate-200 dark:border-zinc-800 text-center">
                      <div className="text-[10px] font-bold uppercase text-slate-400">ON-TIME DELIVERY</div>
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">94%</div>
                      <div className="text-[10px] text-slate-500 mt-1">Industry benchmark: 90%</div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-[#121214] rounded-lg border border-slate-200 dark:border-zinc-800 text-center">
                      <div className="text-[10px] font-bold uppercase text-slate-400">INSPECTION QUALITY</div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">98.5%</div>
                      <div className="text-[10px] text-slate-500 mt-1">Rejection: 1.5%</div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-[#121214] rounded-lg border border-slate-200 dark:border-zinc-800 text-center">
                      <div className="text-[10px] font-bold uppercase text-slate-400">OVERALL RATING</div>
                      <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                        ⭐ {Number(selectedVendor.rating).toFixed(1)} / 5.0
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">Band: Top Tier</div>
                    </div>
                  </div>
                )}

                {/* 8. TIMELINE TAB */}
                {active360Tab === 'Timeline' && (
                  <div className="space-y-3 text-xs p-2">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5" />
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-white">Annual Sourcing Audit Completed</div>
                        <div className="text-[10px] text-slate-400">May 15, 2026 · Score 92/100 · Zero Open Non-Conformances</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5" />
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-white">Rate Contract RC-2026-001 Renewed</div>
                        <div className="text-[10px] text-slate-400">April 1, 2026 · Annual Commitment ₹25,00,000</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-zinc-800">
              <button
                onClick={() => setSelectedVendor(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Excel Bulk Import Modal */}
      <ExcelImportModal
        moduleKey="VENDORS"
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          fetchVendors()
        }}
      />
    </div>
  )
}
