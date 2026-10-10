import React, { useState, useEffect } from 'react'
import {
  Inbox,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  User,
  Loader2,
  Check,
  X,
} from 'lucide-react'
import { apiRequest } from '../lib/api'
import { formatDate } from '../lib/utils'

export const ApprovalsPage: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')

  // Decision Modal State
  const [selectedTask, setSelectedTask] = useState<any | null>(null)
  const [decision, setDecision] = useState<'APPROVE' | 'REJECT'>('APPROVE')
  const [comments, setComments] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const res = await apiRequest(`/approvals?status=${statusFilter}`)
      if (res.success) {
        setTasks(res.data)
      }
    } catch (err) {
      console.error('Failed to load approval tasks', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [statusFilter])

  const openDecisionModal = (task: any, dec: 'APPROVE' | 'REJECT') => {
    setSelectedTask(task)
    setDecision(dec)
    setComments(dec === 'APPROVE' ? 'Approved in accordance with Q1 operational budget guidelines.' : 'Requires specification clarification before sign-off.')
    setActionError(null)
  }

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comments.trim()) {
      setActionError('Comments are required for audit trail governance.')
      return
    }

    setSubmitting(true)
    try {
      const res = await apiRequest(`/approvals/${selectedTask.id}/decide`, {
        method: 'POST',
        body: JSON.stringify({ decision, comments }),
      })

      if (res.success) {
        setSelectedTask(null)
        fetchTasks()
      } else {
        setActionError(res.message || 'Failed to process decision')
      }
    } catch (err: any) {
      setActionError(err.message || 'Server error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header matching Screenshots 3 & 5 */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-[#1c1328] text-purple-600 dark:text-[#c084fc] flex items-center justify-center border border-purple-100/60 dark:border-purple-900/30">
          <Inbox className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Approval Inbox & Governance</h1>
          <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
            Review, approve, or reject operational requisitions, purchase orders, and invoices according to financial authority limits
          </p>
        </div>
      </div>

      {/* Tabs matching Screenshot 4 */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800">
        {(['PENDING', 'APPROVED', 'REJECTED'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 border-b-2 -mb-px ${
              statusFilter === st
                ? 'border-purple-600 text-purple-600 dark:border-[#c084fc] dark:text-[#c084fc]'
                : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            {st === 'PENDING' && <Clock className="w-3.5 h-3.5 text-amber-500" />}
            {st === 'APPROVED' && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
            {st === 'REJECTED' && <XCircle className="w-3.5 h-3.5 text-rose-500" />}
            <span>{st.charAt(0) + st.slice(1).toLowerCase()} Tasks</span>
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 bg-white dark:bg-[#0c0c0e] rounded-xl border border-slate-200 dark:border-zinc-800/80 flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-zinc-500 transition-colors">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-700 dark:text-emerald-400" />
            <span className="text-xs">Checking approval queue...</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-12 bg-white dark:bg-[#0c0c0e] rounded-xl border border-slate-200 dark:border-zinc-800/80 flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-zinc-500 transition-colors">
            <Inbox className="w-8 h-8 text-slate-300 dark:text-zinc-600" />
            <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">No {statusFilter.toLowerCase()} tasks</p>
            <p className="text-xs text-slate-400 dark:text-zinc-500">Your queue is fully cleared.</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white dark:bg-[#0c0c0e] p-5 rounded-xl border border-slate-200 dark:border-zinc-800/80 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 px-2 py-0.5 rounded uppercase">
                    {task.entityType.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">Level {task.currentLevel}</span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500">• {formatDate(task.createdAt)}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{task.title}</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">{task.comments || 'No submission comments.'}</p>
              </div>

              {/* Actions */}
              {statusFilter === 'PENDING' ? (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openDecisionModal(task, 'REJECT')}
                    className="px-3 py-2 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-[#450a0a]/60 text-red-700 dark:text-[#f87171] hover:bg-red-100 dark:hover:bg-[#450a0a]/90 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => openDecisionModal(task, 'APPROVE')}
                    className="px-4 py-2 rounded-lg bg-emerald-700 dark:bg-white text-white dark:text-black hover:bg-emerald-800 dark:hover:bg-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                </div>
              ) : (
                <div className="text-xs text-right">
                  <span
                    className={`inline-block px-2.5 py-1 rounded text-[10px] font-bold ${
                      task.status === 'APPROVED'
                        ? 'bg-emerald-100 dark:bg-[#052e16]/80 text-emerald-800 dark:text-[#4ade80] border border-transparent dark:border-[#16a34a]/40'
                        : 'bg-red-100 dark:bg-[#450a0a]/80 text-red-800 dark:text-[#f87171] border border-transparent dark:border-[#dc2626]/40'
                    }`}
                  >
                    {task.status}
                  </span>
                  <div className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">Processed: {formatDate(task.approvedAt)}</div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Decision Governance Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#0c0c0e] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {decision === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Document governance reasoning for regulatory audit.</p>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-1 rounded-lg text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 bg-red-50 dark:bg-rose-950/40 border border-red-200 dark:border-rose-900/60 text-red-700 dark:text-rose-400 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-rose-400" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="bg-slate-50 dark:bg-[#121214] p-3 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs">
              <span className="font-semibold text-slate-700 dark:text-zinc-300">Target Item:</span> <span className="text-slate-900 dark:text-white">{selectedTask.title}</span>
            </div>

            <form onSubmit={handleDecisionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Governance Audit Comments *
                </label>
                <textarea
                  rows={3}
                  required
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="State the justification, cost code verification, or rejection rationale..."
                  className="w-full p-3 rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-[#121214] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-2xs transition-colors ${
                    decision === 'APPROVE'
                      ? 'bg-black text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200'
                      : 'bg-rose-600 hover:bg-rose-700 text-white'
                  }`}
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm {decision === 'APPROVE' ? 'Approval' : 'Rejection'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
