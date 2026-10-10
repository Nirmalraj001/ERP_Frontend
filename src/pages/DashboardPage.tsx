import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Building,
  Car,
  Store,
  ShoppingCart,
  ShieldAlert,
  Search,
  ArrowRight,
  AlertTriangle,
  Loader2,
  FileSpreadsheet,
  Plus,
  Inbox,
  TrendingUp,
  DollarSign,
  Package,
  Layers,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import { apiRequest } from '../lib/api'
import { formatCurrency, formatDate } from '../lib/utils'
import { ExcelImportModal } from '../components/common/ExcelImportModal'
import { useTheme } from '../context/ThemeContext'

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [dashboardMode, setDashboardMode] = useState<'COCKPIT' | 'CONTROL_TOWER'>('CONTROL_TOWER')
  const [data, setData] = useState<any>(null)
  const [vendors, setVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [hasError, setHasError] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [summaryRes, vendorsRes] = await Promise.all([
          apiRequest('/dashboard/summary'),
          apiRequest('/vendors'),
        ])

        if (summaryRes.success) {
          setData(summaryRes.summary)
        }
        if (vendorsRes.success) {
          setVendors(vendorsRes.data)
        }
      } catch (err) {
        console.error('Failed to load dashboard', err)
        setHasError(true)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Aging Snapshot Data
  const agingData = [
    { label: 'Not Due', amount: 110000 },
    { label: '1–30 Days', amount: 55000 },
    { label: '31–60 Days', amount: 0 },
    { label: '60+ Days', amount: 0 },
  ]

  // Spend/Collections Trend Data
  const collectionsData = [
    { month: 'May 26', amount: 0 },
    { month: 'Jun 26', amount: 0 },
    { month: 'Jul 26', amount: 0 },
    { month: 'Aug 26', amount: 410000 },
    { month: 'Sept 26', amount: 0 },
    { month: 'Oct 26', amount: 0 },
  ]

  const filteredVendors = vendors.filter((v) => {
    if (!searchTerm) return true
    const q = searchTerm.toLowerCase()
    return (
      v.name?.toLowerCase().includes(q) ||
      v.vendorCode?.toLowerCase().includes(q) ||
      v.city?.toLowerCase().includes(q) ||
      v.taxId?.toLowerCase().includes(q)
    )
  })

  const chartAxisTickColor = isDark ? '#71717a' : '#64748b'
  const agingBarColor = isDark ? '#3f3f46' : '#cbd5e1'
  const collectionsBarColor = isDark ? '#52525b' : '#64748b'

  const formattedDate = new Date()
    .toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    .toUpperCase()

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title Bar matching Screenshot 2: PROCUREMENT CONTROL TOWER ... SAT, OCT 10 */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <h1 className="text-xs font-black tracking-widest text-slate-900 dark:text-white uppercase font-sans">
            {dashboardMode === 'CONTROL_TOWER' ? 'PROCUREMENT CONTROL TOWER' : 'SLT PROCUREMENT COCKPIT'}
          </h1>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-semibold font-mono">
            FY 2026-27
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500 tracking-wider font-mono">
            {formattedDate}
          </span>
          <div className="bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-zinc-700">
            <button
              onClick={() => setDashboardMode('CONTROL_TOWER')}
              className={`px-3 py-1 rounded-md transition-colors ${
                dashboardMode === 'CONTROL_TOWER'
                  ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-zinc-400'
              }`}
            >
              Control Tower
            </button>
            <button
              onClick={() => setDashboardMode('COCKPIT')}
              className={`px-3 py-1 rounded-md transition-colors ${
                dashboardMode === 'COCKPIT'
                  ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-zinc-400'
              }`}
            >
              Cockpit View
            </button>
          </div>
        </div>
      </div>

      {/* COCKPIT VIEW (§6, Screenshot Page 7) */}
      {dashboardMode === 'COCKPIT' && (
        <div className="space-y-6">
          {/* Top Welcome & Quick Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                Good day — SLT Procurement Cockpit
              </h1>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
                {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · FY 2026–27
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/purchase-orders')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Purchase Order</span>
              </button>
              <button
                onClick={() => navigate('/requisitions')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-semibold cursor-pointer"
              >
                <span>Requisition</span>
              </button>
              <button
                onClick={() => navigate('/inquiries')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-semibold cursor-pointer"
              >
                <span>New Inquiry</span>
              </button>
            </div>
          </div>

          {/* Approval Banner (§6, Screenshot Page 7) */}
          <div
            onClick={() => navigate('/approvals')}
            className="p-3.5 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl flex items-center justify-between cursor-pointer hover:bg-amber-100/60 transition-colors shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                <Inbox className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-amber-900 dark:text-amber-200">
                  {data?.approvalBanner?.pendingCount || '1'} item awaiting your decision
                </span>
                <span className="text-amber-800/80 dark:text-amber-300/80 ml-2 hidden sm:inline">
                  — {data?.approvalBanner?.preview || 'Requisition PR-2026-00337 (Maintenance: P. Fernandes)'}
                </span>
              </div>
            </div>

            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              Open Approval Inbox →
            </span>
          </div>

          {/* Stat Strip (§6, Screenshot Page 7) */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                OPEN REQUISITIONS
              </span>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {data?.openRequisitions ?? '3'}
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-2xs">
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block">
                LIVE ENQUIRIES
              </span>
              <div className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
                {data?.liveEnquiries ?? '2'}
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                ORDERS IN PROGRESS
              </span>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {data?.ordersInProgress ?? '4'}
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                SPEND TO DATE
              </span>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                58.4L
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-lg border border-emerald-500/30 shadow-2xs">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                SAVINGS
              </span>
              <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                3.9L
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                BUDGET USED
              </span>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {data?.budgetUtilisedPct ? `${data.budgetUtilisedPct}%` : '24.1%'}
              </div>
            </div>
          </div>

          {/* KPI Tiles (§6, Screenshot Page 7) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              onClick={() => navigate('/purchase-orders')}
              className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-2xs cursor-pointer hover:border-blue-400 transition-colors"
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">OPEN POS</span>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {data?.openPOs ?? '7'}
              </div>
            </div>

            <div
              onClick={() => navigate('/payments')}
              className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-2xs cursor-pointer hover:border-blue-400 transition-colors"
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">OUTSTANDING AP</span>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                12.4L
              </div>
            </div>

            <div
              onClick={() => navigate('/goods-receipts')}
              className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-2xs cursor-pointer hover:border-blue-400 transition-colors"
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PENDING GRN</span>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {data?.pendingGRN ?? '3'}
              </div>
            </div>

            <div
              onClick={() => navigate('/invoices')}
              className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-rose-200 dark:border-rose-950/60 shadow-2xs cursor-pointer hover:border-rose-400 transition-colors"
            >
              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                MATCH EXCEPTIONS
              </span>
              <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
                {data?.matchExceptions ?? '1'}
              </div>
            </div>
          </div>

          {/* Middle Two Panels: Source-to-Pay Funnel & Departmental Budget Consumption (§6, Page 7) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Source-to-Pay Funnel */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                  Source-to-Pay Funnel
                </h3>
                <span className="text-[10px] text-slate-400">documents live in each stage</span>
              </div>

              <div className="space-y-3 text-xs">
                {[
                  { name: 'Requisitions', count: data?.s2pFunnel?.requisitions ?? 6, path: '/requisitions' },
                  { name: 'Enquiries', count: data?.s2pFunnel?.enquiries ?? 5, path: '/inquiries' },
                  { name: 'Purchase Orders', count: data?.s2pFunnel?.purchaseOrders ?? 9, path: '/purchase-orders' },
                  { name: 'Goods Receipts', count: data?.s2pFunnel?.goodsReceipts ?? 5, path: '/goods-receipts' },
                  { name: 'Supplier Invoices', count: data?.s2pFunnel?.supplierInvoices ?? 5, path: '/invoices' },
                  { name: 'Payments', count: data?.s2pFunnel?.payments ?? 3, path: '/payments' },
                ].map((stage, idx) => (
                  <div
                    key={stage.name}
                    onClick={() => navigate(stage.path)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/60 cursor-pointer transition-colors"
                  >
                    <span className="text-slate-700 dark:text-zinc-300 font-medium">{stage.name}</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/70 px-2 py-0.5 rounded-full text-xs">
                      {stage.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Departmental Budget Consumption */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                  Departmental Budget Consumption
                </h3>
                <span className="text-[10px] text-slate-400">Committed vs annual</span>
              </div>

              <div className="space-y-4 text-xs">
                {(data?.departmentalBudgetBars || [
                  { department: 'Production', utilization: 46 },
                  { department: 'Maintenance', utilization: 62 },
                  { department: 'EHS', utilization: 28 },
                  { department: 'Despatch', utilization: 34 },
                  { department: 'Quality', utilization: 22 },
                ]).map((dept: any) => (
                  <div key={dept.department} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-700 dark:text-zinc-300">{dept.department}</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{dept.utilization}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          dept.utilization > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${dept.utilization}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTROL TOWER VIEW (Screenshot 2) */}
      {dashboardMode === 'CONTROL_TOWER' && (
        <div className="space-y-6">
          {/* Top 6 KPI Row matching Screenshot 2 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white dark:bg-[#0c0c0e] p-3.5 rounded-lg border border-slate-200 dark:border-zinc-800/80 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-600 dark:text-zinc-400">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>TOTAL CUSTOMERS</span>
              </div>
              <div className="w-6 h-0.5 bg-slate-300 dark:bg-zinc-700 my-2 rounded-full" />
              <div className="text-xl font-bold text-slate-900 dark:text-white my-1">{vendors.length || '6'}</div>
              <div className="text-[10px] text-slate-400">All accounts</div>
            </div>

            <div className="bg-white dark:bg-[#0c0c0e] p-3.5 rounded-lg border border-slate-200 dark:border-zinc-800/80 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-600 dark:text-zinc-400">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>ACTIVE</span>
              </div>
              <div className="w-6 h-0.5 bg-slate-300 dark:bg-zinc-700 my-2 rounded-full" />
              <div className="text-xl font-bold text-slate-900 dark:text-white my-1">
                {vendors.filter((v) => v.status === 'APPROVED' || !v.isBlocked).length || '5'}
              </div>
              <div className="text-[10px] text-slate-400">Status = Active</div>
            </div>

            <div className="bg-white dark:bg-[#0c0c0e] p-3.5 rounded-lg border border-slate-200 dark:border-zinc-800/80 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-600 dark:text-zinc-400">
                <Car className="w-3.5 h-3.5 text-slate-400" />
                <span>AUTOMOTIVE</span>
              </div>
              <div className="w-6 h-0.5 bg-slate-300 dark:bg-zinc-700 my-2 rounded-full" />
              <div className="text-xl font-bold text-slate-900 dark:text-white my-1">4</div>
              <div className="text-[10px] text-slate-400">Customer type</div>
            </div>

            <div className="bg-white dark:bg-[#0c0c0e] p-3.5 rounded-lg border border-slate-200 dark:border-zinc-800/80 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-600 dark:text-zinc-400">
                <Store className="w-3.5 h-3.5 text-slate-400" />
                <span>NON-AUTOMOTIVE</span>
              </div>
              <div className="w-6 h-0.5 bg-slate-300 dark:bg-zinc-700 my-2 rounded-full" />
              <div className="text-xl font-bold text-slate-900 dark:text-white my-1">2</div>
              <div className="text-[10px] text-slate-400">Customer type</div>
            </div>

            <div className="bg-white dark:bg-[#0c0c0e] p-3.5 rounded-lg border border-slate-200 dark:border-zinc-800/80 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-600 dark:text-zinc-400">
                <ShoppingCart className="w-3.5 h-3.5 text-slate-400" />
                <span>WITH OPEN ORDERS</span>
              </div>
              <div className="w-6 h-0.5 bg-slate-300 dark:bg-zinc-700 my-2 rounded-full" />
              <div className="text-xl font-bold text-slate-900 dark:text-white my-1">{data?.openPOs ?? '7'}</div>
              <div className="text-[10px] text-slate-400">At least one active SO</div>
            </div>

            <div className="bg-white dark:bg-[#0c0c0e] p-3.5 rounded-lg border border-slate-200 dark:border-zinc-800/80 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-600 dark:text-zinc-400">
                <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                <span>CREDIT HOLD</span>
              </div>
              <div className="w-6 h-0.5 bg-slate-300 dark:bg-zinc-700 my-2 rounded-full" />
              <div className="text-xl font-bold text-slate-900 dark:text-white my-1">
                {data?.pendingApprovals ?? '0'}
              </div>
              <div className="text-[10px] text-slate-400">Currently on hold</div>
            </div>
          </div>

          {/* 4 Chart Cards in 2x2 Grid (Screenshot 2) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Card 1: AGING SNAPSHOT */}
            <div className="bg-white dark:bg-[#0c0c0e] p-5 rounded-lg border border-slate-200 dark:border-zinc-800/80 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-100">
                AGING SNAPSHOT
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Outstanding ₹ by how overdue it is</p>
              <div className="h-56 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={agingData}>
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: chartAxisTickColor }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fontSize: 10, fill: chartAxisTickColor }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                    />
                    <Tooltip formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Outstanding']} />
                    <Bar dataKey="amount" fill={agingBarColor} radius={[2, 2, 0, 0]} barSize={55} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Card 2: COLLECTIONS TREND */}
            <div className="bg-white dark:bg-[#0c0c0e] p-5 rounded-lg border border-slate-200 dark:border-zinc-800/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-100">
                    COLLECTIONS TREND
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Payments recorded, last 6 months</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">OVER LIMIT</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">0</span>
                </div>
              </div>

              <div className="h-56 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={collectionsData}>
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: chartAxisTickColor }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fontSize: 10, fill: chartAxisTickColor }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                    />
                    <Tooltip formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']} />
                    <Bar dataKey="amount" fill={collectionsBarColor} radius={[2, 2, 0, 0]} barSize={45} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Card 3: REVENUE CONCENTRATION */}
            <div className="bg-white dark:bg-[#0c0c0e] p-5 rounded-lg border border-slate-200 dark:border-zinc-800/80 shadow-2xs min-h-[220px] flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-100">
                  REVENUE CONCENTRATION
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Invoiced revenue this financial year, by customer</p>
              </div>
              <div className="flex-1 flex items-center justify-center py-10">
                <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">
                  No invoiced revenue yet this financial year.
                </span>
              </div>
            </div>

            {/* Card 4: CREDIT UTILISATION */}
            <div className="bg-white dark:bg-[#0c0c0e] p-5 rounded-lg border border-slate-200 dark:border-zinc-800/80 shadow-2xs min-h-[220px] flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-100">
                  CREDIT UTILISATION
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Outstanding vs. credit limit, by customer</p>
              </div>
              <div className="flex-1 flex items-center justify-center py-10">
                <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">
                  No outstanding balances yet.
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Card: CUSTOMER LIST (Screenshot 2) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200">
                CUSTOMER LIST
              </span>
              <button
                onClick={() => navigate('/vendors')}
                className="text-xs font-semibold text-slate-800 dark:text-zinc-200 hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-1 cursor-pointer transition-colors"
              >
                View all →
              </button>
            </div>

            <div className="bg-white dark:bg-[#0c0c0e] rounded-lg border border-slate-200 dark:border-zinc-800/80 shadow-2xs p-4 space-y-6">
              {/* Dashed Search Input matching Screenshot 2 */}
              <div className="relative max-w-sm">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Name, code, GST, PAN, city, co"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-dashed border-slate-200 dark:border-zinc-800 text-xs w-full bg-white dark:bg-[#121214] text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-slate-400 placeholder:text-slate-400"
                />
              </div>

              {/* Error or Empty State / List Matching Screenshot 2 */}
              {hasError ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center border border-red-100 dark:border-red-900/30">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                    Couldn't load the Customers
                  </h4>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 max-w-sm">
                    The Customers didn't respond. Retry, or check that the backend is reachable.
                  </p>
                </div>
              ) : filteredVendors.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-zinc-800 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                        <th className="py-2.5 px-3">CODE</th>
                        <th className="py-2.5 px-3">CUSTOMER / VENDOR</th>
                        <th className="py-2.5 px-3">CATEGORY</th>
                        <th className="py-2.5 px-3">CITY</th>
                        <th className="py-2.5 px-3">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                      {filteredVendors.slice(0, 5).map((v) => (
                        <tr
                          key={v.id}
                          onClick={() => navigate('/vendors')}
                          className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors"
                        >
                          <td className="py-2.5 px-3 font-mono font-semibold text-slate-700 dark:text-zinc-300">
                            {v.vendorCode}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">
                            {v.name}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 dark:text-zinc-400">
                            {v.category || 'Direct Material'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 dark:text-zinc-400">
                            {v.city || 'Bengaluru'}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
                              Active
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center border border-red-100 dark:border-red-900/30">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                    Couldn't load the Customers
                  </h4>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 max-w-sm">
                    The Customers didn't respond. Retry, or check that the backend is reachable.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Excel Bulk Import Modal */}
      <ExcelImportModal
        moduleKey="VENDORS"
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={async () => {
          try {
            const [summaryRes, vendorsRes] = await Promise.all([
              apiRequest('/dashboard/summary'),
              apiRequest('/vendors'),
            ])
            if (summaryRes.success) setData(summaryRes.summary)
            if (vendorsRes.success) setVendors(vendorsRes.data)
          } catch (e) {
            console.error('Failed to reload dashboard after import', e)
          }
        }}
      />
    </div>
  )
}
