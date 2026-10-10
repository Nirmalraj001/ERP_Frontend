import React, { useState, useEffect } from 'react'
import { PieChart, DollarSign, AlertCircle, Loader2 } from 'lucide-react'
import { apiRequest } from '../lib/api'
import { formatCurrency } from '../lib/utils'

export const BudgetControlPage: React.FC = () => {
  const [budgets, setBudgets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBudgets() {
      try {
        const res = await apiRequest('/items/budgets')
        if (res.success) {
          setBudgets(res.data)
        }
      } catch (err) {
        console.error('Failed to load budgets', err)
      } finally {
        setLoading(false)
      }
    }
    fetchBudgets()
  }, [])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header matching Screenshots 3 & 5 */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-[#1c1328] text-purple-600 dark:text-[#c084fc] flex items-center justify-center border border-purple-100/60 dark:border-purple-900/30">
          <PieChart className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Cost Center & Budget Control</h1>
          <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
            Monitor allocated fiscal budgets, committed purchase obligations, and remaining budget ceilings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 p-12 text-center text-slate-400 dark:text-zinc-500">Loading cost centers...</div>
        ) : (
          budgets.map((b) => {
            const allocated = Number(b.allocatedAmount)
            const committed = Number(b.committedAmount)
            const spent = Number(b.spentAmount)
            const remaining = allocated - committed - spent
            const percentUsed = Math.min(100, Math.round(((committed + spent) / allocated) * 100))

            return (
              <div key={b.id} className="bg-white dark:bg-[#0c0c0e] p-5 rounded-xl border border-slate-200 dark:border-zinc-800/80 shadow-xs space-y-4 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-300 px-2 py-0.5 rounded">
                    {b.costCenterCode}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase">{b.fiscalYear}</span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{b.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">{b.department}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">Allocated Budget:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(allocated)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">Committed (POs in flight):</span>
                    <span className="font-semibold text-blue-700 dark:text-[#38bdf8]">{formatCurrency(committed)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">Settled Spent:</span>
                    <span className="font-semibold text-emerald-700 dark:text-[#4ade80]">{formatCurrency(spent)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-100 dark:border-zinc-800">
                    <span className="font-semibold text-slate-700 dark:text-zinc-300">Remaining Available:</span>
                    <span className="font-bold text-emerald-800 dark:text-[#4ade80]">{formatCurrency(remaining)}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1 font-semibold text-slate-600 dark:text-zinc-400">
                    <span>Utilization</span>
                    <span>{percentUsed}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        percentUsed > 85 ? 'bg-red-500' : percentUsed > 60 ? 'bg-amber-500' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${percentUsed}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
