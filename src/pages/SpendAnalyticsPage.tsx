import React, { useState, useEffect } from 'react'
import { LineChart, History, Activity, ShieldCheck, Loader2 } from 'lucide-react'
import { apiRequest } from '../lib/api'
import { formatDate } from '../lib/utils'

export const SpendAnalyticsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await apiRequest('/reports/audit-trail')
        if (res.success) {
          setLogs(res.data)
        }
      } catch (err) {
        console.error('Failed to load audit trail', err)
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header matching Screenshots 3 & 5 */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-[#1c1328] text-purple-600 dark:text-[#c084fc] flex items-center justify-center border border-purple-100/60 dark:border-purple-900/30">
          <History className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Audit Trail & Spend Analytics</h1>
          <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
            Immutable forensic log of all user transactions, approval decisions, and lifecycle state changes
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0c0c0e] rounded-xl border border-slate-200 dark:border-zinc-800/80 shadow-2xs overflow-hidden transition-colors">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-zinc-500">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600 dark:text-[#c084fc]" />
            <span className="text-xs">Loading audit ledger...</span>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/50 dark:bg-zinc-900/50 text-slate-400 dark:text-zinc-500 font-bold border-b border-slate-100 dark:border-zinc-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">TIMESTAMP</th>
                    <th className="py-3 px-4">ACTION</th>
                    <th className="py-3 px-4">ENTITY</th>
                    <th className="py-3 px-4">ACTOR</th>
                    <th className="py-3 px-4">IP ADDRESS</th>
                    <th className="py-3 px-4">AUDIT DETAILS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-[#18181c]/70 transition-colors">
                      <td className="py-3 px-4 text-slate-500 dark:text-zinc-400 font-mono text-[11px] whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-purple-600 dark:text-[#c084fc]">{log.action}</td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 px-2 py-0.5 rounded font-mono text-[10px]">
                          {log.entity}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-white">{log.user?.fullName || 'System Event'}</td>
                      <td className="py-3 px-4 text-slate-400 dark:text-zinc-500 font-mono">{log.ipAddress || '127.0.0.1'}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-zinc-300 max-w-md">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer matching Screenshot 3 */}
            <div className="px-4 py-3 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-400 dark:text-zinc-500 font-medium flex items-center justify-between">
              <span>1–{logs.length} of {logs.length} audit entries</span>
              <div className="flex items-center gap-4">
                <span className="text-slate-700 dark:text-zinc-300 font-mono">1/1</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
