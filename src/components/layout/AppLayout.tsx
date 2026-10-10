import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutGrid,
  FileText,
  Calendar,
  Moon,
  Sun,
  Bell,
  User,
  LogOut,
  Shield,
  Layers,
  Inbox,
  CheckSquare,
  Search,
  ChevronDown,
  TrendingUp,
  Award,
  Truck,
  Receipt,
  CreditCard,
  Package,
  Sliders,
  FileCheck,
  Building2,
  DollarSign,
  AlertCircle,
  HelpCircle,
} from 'lucide-react'
import { useAuth, type EnterpriseRole } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { apiRequest } from '../../lib/api'

export const AppLayout: React.FC = () => {
  const { user, logout, activeRole, setActiveRole } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showRoleMenu, setShowRoleMenu] = useState(false)
  const [showMastersMenu, setShowMastersMenu] = useState(false)
  const [showAdminMenu, setShowAdminMenu] = useState(false)
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(1)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [paletteQuery, setPaletteQuery] = useState('')

  // Fetch live pending approvals count
  useEffect(() => {
    const fetchBadge = async () => {
      try {
        const res = await apiRequest<{ success: boolean; count: number }>('/approvals?status=PENDING')
        if (res.success) {
          setPendingApprovalsCount(res.count)
        }
      } catch (e) {
        // silent fallback
      }
    }
    fetchBadge()
    const interval = setInterval(fetchBadge, 30000)
    return () => clearInterval(interval)
  }, [])

  // Keyboard shortcut: Ctrl+K for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setShowCommandPalette((prev) => !prev)
      } else if (e.key === 'Escape') {
        setShowCommandPalette(false)
        setShowMastersMenu(false)
        setShowAdminMenu(false)
        setShowRoleMenu(false)
        setShowUserMenu(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Top Horizontal Navigation Tabs (matching Screenshots 2, 3, 4, 5)
  const topNavTabs = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Requisitions', path: '/requisitions' },
    { name: 'Inquiry', path: '/inquiries' },
    { name: 'RFQ & Quotes', path: '/rfqs' },
    { name: 'Purchase Orders', path: '/purchase-orders' },
    { name: 'Goods Receipt', path: '/goods-receipts' },
    { name: 'Billing', path: '/invoices' },
    { name: 'Payments', path: '/payments' },
    { name: 'Vendors', path: '/vendors' },
  ]

  // Left Icon Rail Navigation Items (matching Screenshots 2, 3, 4, 5)
  const leftRailItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutGrid },
    { name: 'Requisitions', path: '/requisitions', icon: FileText },
    { name: 'Inquiry Management', path: '/inquiries', icon: HelpCircle },
    { name: 'RFQ Comparison', path: '/rfqs', icon: Award },
    { name: 'Purchase Orders', path: '/purchase-orders', icon: CheckSquare },
    { name: 'Approval Inbox', path: '/approvals', icon: Inbox, badge: pendingApprovalsCount },
    { name: 'Goods Receipts', path: '/goods-receipts', icon: Truck },
    { name: 'Billing & Invoices', path: '/invoices', icon: Receipt },
    { name: 'Payments & AP', path: '/payments', icon: CreditCard },
    { name: 'Vendors Directory', path: '/vendors', icon: Building2 },
    { name: 'Spend Analytics', path: '/spend-analytics', icon: TrendingUp },
  ]

  const enterpriseRoles: EnterpriseRole[] = [
    'Management',
    'Purchase Manager',
    'Purchase Executive',
    'Quality',
    'Stores',
    'Accounts',
  ]

  const commandItems = [
    { name: 'Dashboard / Control Tower', path: '/dashboard', cat: 'Overview' },
    { name: 'Approval Inbox', path: '/approvals', cat: 'Overview' },
    { name: 'Purchase Requisitions (PR)', path: '/requisitions', cat: 'Source to Order' },
    { name: 'Inquiry Management (RFQ Requests)', path: '/inquiries', cat: 'Source to Order' },
    { name: 'RFQ & Quotation Comparison', path: '/rfqs', cat: 'Source to Order' },
    { name: 'Purchase Orders (PO)', path: '/purchase-orders', cat: 'Source to Order' },
    { name: 'Goods Receipts (GRN)', path: '/goods-receipts', cat: 'Receive to Pay' },
    { name: 'Supplier Billing & 3-Way Match', path: '/invoices', cat: 'Receive to Pay' },
    { name: 'Payments & Accounts Payable', path: '/payments', cat: 'Receive to Pay' },
    { name: 'Vendor Directory & 360', path: '/vendors', cat: 'Vendors' },
    { name: 'Vendor Audit & Qualification', path: '/vendor-qualification', cat: 'Vendors' },
    { name: 'Item Master & Catalogs', path: '/items', cat: 'Masters & Control' },
    { name: 'Budget Control & Cost Centers', path: '/budgets', cat: 'Masters & Control' },
    { name: 'Rate Contracts', path: '/rate-contracts', cat: 'Masters & Control' },
    { name: 'Spend Analytics & Pareto', path: '/spend-analytics', cat: 'Insight' },
    { name: 'Reports & Document Search', path: '/reports', cat: 'Insight' },
    { name: 'System Settings & DOA', path: '/settings', cat: 'Insight' },
  ]

  const isMastersActive = ['/items', '/budgets', '/rate-contracts'].some((p) => location.pathname.startsWith(p))
  const isAdminActive = ['/settings', '/reports', '/approvals', '/vendor-qualification'].some((p) =>
    location.pathname.startsWith(p)
  )

  return (
    <div className="min-h-screen bg-white dark:bg-[#000000] flex font-sans text-slate-800 dark:text-zinc-100 antialiased transition-colors">
      {/* 1. LEFT NARROW ICON RAIL SIDEBAR (Matching Screenshots 2, 3, 4, 5) */}
      <aside className="w-13 sm:w-14 bg-white dark:bg-[#0c0c0e] flex flex-col justify-between shrink-0 select-none z-30 border-r border-slate-200 dark:border-zinc-800/80 sticky top-0 h-screen transition-colors">
        {/* Top: SLT Emblem Logo */}
        <div className="flex flex-col items-center">
          <div
            onClick={() => navigate('/dashboard')}
            className="h-13 w-full flex items-center justify-center cursor-pointer border-b border-slate-100 dark:border-zinc-800/80 group"
            title="SLT Procurement Suite"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center font-black text-xs shadow-2xs group-hover:scale-105 transition-transform">
              <span className="font-mono tracking-tighter">SLT</span>
            </div>
          </div>

          {/* Icon Navigation Column matching Screenshot 2/3 */}
          <div className="py-3 flex flex-col items-center gap-1.5 w-full">
            {leftRailItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path)
              const Icon = item.icon

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  title={item.name}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer relative group ${
                    isActive
                      ? 'bg-purple-50 text-purple-700 dark:bg-[#1c1328] dark:text-[#c084fc] font-bold shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/70'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
                  )}
                  {/* Tooltip on hover */}
                  <span className="absolute left-13 px-2 py-1 bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-[10px] rounded font-medium opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap shadow-md z-50 transition-opacity">
                    {item.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Bottom: User Avatar Circular Button matching Screenshot 2, 3, 4, 5 */}
        <div className="p-2 border-t border-slate-100 dark:border-zinc-800/80 flex flex-col items-center">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 flex items-center justify-center text-slate-700 dark:text-zinc-200 hover:ring-2 hover:ring-slate-300 dark:hover:ring-zinc-600 transition-all cursor-pointer"
            title={`${user?.fullName || 'User'} (${activeRole})`}
          >
            <User className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
          </button>
        </div>
      </aside>

      {/* 2. MAIN APPLICATION WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP HORIZONTAL NAVIGATION BAR (Matching Screenshots 2, 3, 4, 5) */}
        <header className="h-13 bg-white dark:bg-[#0c0c0e] border-b border-slate-200 dark:border-zinc-800/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 transition-colors">
          {/* Horizontal Navigation Tabs */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto select-none py-1.5 scrollbar-none">
            {topNavTabs.map((tab) => {
              const isActive = location.pathname.startsWith(tab.path)

              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className={`px-3 py-1 text-xs whitespace-nowrap cursor-pointer transition-all ${
                    isActive
                      ? 'border border-slate-200 dark:border-zinc-700 rounded-md font-semibold text-slate-900 dark:text-white bg-white dark:bg-[#18181b] shadow-2xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white font-medium hover:bg-slate-50 dark:hover:bg-zinc-800/60 rounded-md'
                  }`}
                >
                  {tab.name}
                </button>
              )
            })}

            {/* Masters Dropdown Tab */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowMastersMenu(!showMastersMenu)
                  setShowAdminMenu(false)
                }}
                className={`px-3 py-1 text-xs whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 ${
                  isMastersActive
                    ? 'border border-slate-200 dark:border-zinc-700 rounded-md font-semibold text-slate-900 dark:text-white bg-white dark:bg-[#18181b] shadow-2xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white font-medium hover:bg-slate-50 dark:hover:bg-zinc-800/60 rounded-md'
                }`}
              >
                <span>Masters</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showMastersMenu && (
                <div className="absolute left-0 mt-1.5 w-44 bg-white dark:bg-[#121214] rounded-lg shadow-xl border border-slate-200 dark:border-zinc-800 py-1.5 z-50 text-xs animate-in fade-in">
                  <button
                    onClick={() => {
                      navigate('/items')
                      setShowMastersMenu(false)
                    }}
                    className="w-full text-left px-3 py-1.5 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    Item Master
                  </button>
                  <button
                    onClick={() => {
                      navigate('/budgets')
                      setShowMastersMenu(false)
                    }}
                    className="w-full text-left px-3 py-1.5 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    Budget Control
                  </button>
                  <button
                    onClick={() => {
                      navigate('/rate-contracts')
                      setShowMastersMenu(false)
                    }}
                    className="w-full text-left px-3 py-1.5 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    Rate Contracts
                  </button>
                </div>
              )}
            </div>

            {/* Admin Dropdown Tab */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowAdminMenu(!showAdminMenu)
                  setShowMastersMenu(false)
                }}
                className={`px-3 py-1 text-xs whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 ${
                  isAdminActive
                    ? 'border border-slate-200 dark:border-zinc-700 rounded-md font-semibold text-slate-900 dark:text-white bg-white dark:bg-[#18181b] shadow-2xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white font-medium hover:bg-slate-50 dark:hover:bg-zinc-800/60 rounded-md'
                }`}
              >
                <span>Admin</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showAdminMenu && (
                <div className="absolute left-0 mt-1.5 w-48 bg-white dark:bg-[#121214] rounded-lg shadow-xl border border-slate-200 dark:border-zinc-800 py-1.5 z-50 text-xs animate-in fade-in">
                  <button
                    onClick={() => {
                      navigate('/approvals')
                      setShowAdminMenu(false)
                    }}
                    className="w-full text-left px-3 py-1.5 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center justify-between cursor-pointer"
                  >
                    <span>Approval Inbox</span>
                    {pendingApprovalsCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                        {pendingApprovalsCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      navigate('/vendor-qualification')
                      setShowAdminMenu(false)
                    }}
                    className="w-full text-left px-3 py-1.5 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    Vendor Audit
                  </button>
                  <button
                    onClick={() => {
                      navigate('/reports')
                      setShowAdminMenu(false)
                    }}
                    className="w-full text-left px-3 py-1.5 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    Reports & Audit Trail
                  </button>
                  <button
                    onClick={() => {
                      navigate('/settings')
                      setShowAdminMenu(false)
                    }}
                    className="w-full text-left px-3 py-1.5 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    Settings & DOA
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Controls: Role Badge, Command Palette, Theme, Bell */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick Command Palette Button */}
            <button
              onClick={() => setShowCommandPalette(true)}
              className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Search / Command Palette (Ctrl+K)"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Active Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                title="Active Role"
              >
                <span>{activeRole}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-[#121214] rounded-lg shadow-xl border border-slate-200 dark:border-zinc-800 py-1.5 z-50 text-xs animate-in fade-in">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Role
                  </div>
                  {enterpriseRoles.map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setActiveRole(r)
                        setShowRoleMenu(false)
                      }}
                      className={`w-full text-left px-3 py-1.5 transition-colors flex items-center justify-between cursor-pointer ${
                        activeRole === r
                          ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold'
                          : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <span>{r}</span>
                      {activeRole === r && <span className="text-purple-600">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-1.5 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notification Bell Icon with Badge */}
            <button
              onClick={() => navigate('/approvals')}
              title="Notifications / Pending Decisions"
              className="p-1.5 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-md transition-colors cursor-pointer relative"
            >
              <Bell className="w-4 h-4" />
              {pendingApprovalsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>
          </div>
        </header>

        {/* MAIN VIEWPORT */}
        <main className="flex-1 overflow-y-auto p-5 sm:p-7 bg-[#fcfdfe] dark:bg-[#000000] transition-colors">
          <Outlet />
        </main>
      </div>

      {/* USER PROFILE MODAL / POPUP */}
      {showUserMenu && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-2xs flex items-end sm:items-start justify-start p-4 sm:pt-16 sm:pl-16">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#121214] rounded-xl shadow-2xl border border-slate-200 dark:border-zinc-800 w-64 p-3 text-xs space-y-2 animate-in fade-in"
          >
            <div className="pb-2 border-b border-slate-100 dark:border-zinc-800">
              <div className="font-bold text-slate-900 dark:text-white">{user?.fullName || 'User'}</div>
              <div className="text-[11px] text-slate-400 dark:text-zinc-500">{user?.email}</div>
              <div className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold mt-0.5">
                Role: {activeRole}
              </div>
            </div>

            <button
              onClick={() => {
                setShowUserMenu(false)
                navigate('/settings')
              }}
              className="w-full text-left px-2.5 py-1.5 rounded text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
            >
              Company Settings & DOA
            </button>

            <button
              onClick={() => {
                setShowUserMenu(false)
                logout()
              }}
              className="w-full text-left px-2.5 py-1.5 rounded text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* COMMAND PALETTE MODAL (Ctrl+K) */}
      {showCommandPalette && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
          <div className="bg-white dark:bg-[#121214] rounded-xl border border-slate-200 dark:border-zinc-800 w-full max-w-lg shadow-2xl overflow-hidden text-xs animate-in zoom-in-95">
            <div className="p-3 border-b border-slate-200 dark:border-zinc-800 flex items-center gap-2.5">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Type a module name or action (e.g. PO, Requisition, Scorecard)..."
                value={paletteQuery}
                onChange={(e) => setPaletteQuery(e.target.value)}
                className="w-full bg-transparent text-slate-900 dark:text-white text-xs focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400 border px-1.5 py-0.5 rounded">ESC</span>
            </div>

            <div className="max-h-72 overflow-y-auto p-2 space-y-1">
              {commandItems
                .filter((item) => !paletteQuery || item.name.toLowerCase().includes(paletteQuery.toLowerCase()))
                .map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path)
                      setShowCommandPalette(false)
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-between text-slate-800 dark:text-zinc-200 cursor-pointer"
                  >
                    <span className="font-medium">{item.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.cat}</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
