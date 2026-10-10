import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Settings,
  ShoppingCart,
  Truck,
  RotateCcw,
  Wallet,
  User,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  Sun,
  Moon,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { apiRequest } from '../lib/api'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const [email, setEmail] = useState('admin@sltprocure.com')
  const [password, setPassword] = useState('Admin@123')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setIsLoading(true)

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      if (data.success && data.token) {
        login(data.token, data.user)
        navigate('/dashboard')
      } else {
        setErrorMessage(data.message || 'Authentication failed')
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not connect to authentication server')
    } finally {
      setIsLoading(false)
    }
  }

  const setDemoCredentials = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail)
    setPassword(rolePass)
    setErrorMessage(null)
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white dark:bg-[#000000] font-sans antialiased transition-colors duration-200">
      {/* LEFT PANEL: Exact Match to Screenshot 1 */}
      <div className="lg:w-1/2 bg-gradient-to-br from-[#084b3c] via-[#063f33] to-[#042d24] text-white p-8 lg:p-14 flex flex-col justify-between select-none">
        {/* Top Logo / App Branding */}
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
              <Settings className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="text-base font-bold text-white tracking-tight">SLT Procurement</div>
              <div className="text-xs text-emerald-300/80 font-medium">Source-to-Pay Platform</div>
            </div>
          </div>
        </div>

        {/* Center Hero Content */}
        <div className="my-10 lg:my-12 max-w-xl">
          <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
            Requisition. Inquire.<br />
            <span className="text-[#34d399]">Order. Settle.</span>
          </h1>

          <p className="mt-5 text-emerald-100/80 text-sm leading-relaxed">
            A single workspace for procurement officers, approvers, and accounts to run the vendor order lifecycle — from PR to payment — with a permanent audit trail.
          </p>

          {/* 4 Feature Cards (2x2 Grid) matching Screenshot 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-8">
            {/* Card 1 */}
            <div className="bg-white/[0.08] backdrop-blur-xs border border-white/10 rounded-xl p-3.5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0 mt-0.5 text-emerald-200">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Purchase Requisitions</h4>
                <p className="text-[11px] text-emerald-200/70 mt-0.5 leading-snug">PR to approval, live totals</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white/[0.08] backdrop-blur-xs border border-white/10 rounded-xl p-3.5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0 mt-0.5 text-emerald-200">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Goods Receipt & GRN</h4>
                <p className="text-[11px] text-emerald-200/70 mt-0.5 leading-snug">Challan, physical receipt, QA</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white/[0.08] backdrop-blur-xs border border-white/10 rounded-xl p-3.5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0 mt-0.5 text-emerald-200">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Purchase Orders & RFQ</h4>
                <p className="text-[11px] text-emerald-200/70 mt-0.5 leading-snug">Vendor compare, line pricing</p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white/[0.08] backdrop-blur-xs border border-white/10 rounded-xl p-3.5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0 mt-0.5 text-emerald-200">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Payments & AP</h4>
                <p className="text-[11px] text-emerald-200/70 mt-0.5 leading-snug">Ageing, remittances & receipts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Tagline */}
        <div className="text-[11px] text-emerald-200/50 font-medium">
          Requisition • Inquiry • Order • Settlement
        </div>
      </div>

      {/* RIGHT PANEL: Exact Match to Screenshot 1 with Dark Mode */}
      <div className="lg:w-1/2 bg-white dark:bg-[#09090b] flex flex-col justify-between p-8 sm:p-14 lg:p-20 relative transition-colors duration-200">
        {/* Top Right Theme Toggle */}
        <div className="flex justify-end w-full">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        <div className="max-w-sm w-full mx-auto my-auto">
          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Welcome back</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2">Enter your credentials to access the dashboard</p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sltprocure.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121214] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-zinc-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121214] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-[#00875a] hover:bg-[#00704a] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Pill Selector */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 tracking-wider block mb-2">
              Quick Role Test (Click to Autofill):
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDemoCredentials('admin@sltprocure.com', 'Admin@123')}
                className="p-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#121214] hover:bg-emerald-50 dark:hover:bg-zinc-800 hover:border-emerald-300 dark:hover:border-zinc-700 text-left cursor-pointer transition-colors"
              >
                <div className="font-semibold text-slate-800 dark:text-zinc-200 text-[11px]">System Admin</div>
                <div className="text-[10px] text-slate-500 dark:text-zinc-400">Rajesh Sharma</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('approver@sltprocure.com', 'Approver@123')}
                className="p-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#121214] hover:bg-emerald-50 dark:hover:bg-zinc-800 hover:border-emerald-300 dark:hover:border-zinc-700 text-left cursor-pointer transition-colors"
              >
                <div className="font-semibold text-slate-800 dark:text-zinc-200 text-[11px]">Executive Approver</div>
                <div className="text-[10px] text-slate-500 dark:text-zinc-400">Vikram Malhotra</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('officer@sltprocure.com', 'Officer@123')}
                className="p-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#121214] hover:bg-emerald-50 dark:hover:bg-zinc-800 hover:border-emerald-300 dark:hover:border-zinc-700 text-left cursor-pointer transition-colors"
              >
                <div className="font-semibold text-slate-800 dark:text-zinc-200 text-[11px]">Procurement Officer</div>
                <div className="text-[10px] text-slate-500 dark:text-zinc-400">Amit Patel</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('finance@sltprocure.com', 'Finance@123')}
                className="p-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#121214] hover:bg-emerald-50 dark:hover:bg-zinc-800 hover:border-emerald-300 dark:hover:border-zinc-700 text-left cursor-pointer transition-colors"
              >
                <div className="font-semibold text-slate-800 dark:text-zinc-200 text-[11px]">Finance Officer (AP)</div>
                <div className="text-[10px] text-slate-500 dark:text-zinc-400">Priya Sundaram</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer row matching Screenshot 1 */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-zinc-500 font-medium pt-8">
          <span>SLT Procurement v1.0</span>
          <span>Source-to-Pay</span>
        </div>
      </div>
    </div>
  )
}
