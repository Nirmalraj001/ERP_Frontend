import React from 'react'
import { FileText, Sparkles, Plus, Search, ShieldCheck } from 'lucide-react'

interface GenericModuleProps {
  title: string
  subtitle: string
  moduleGroup: string
  emptyMessage?: string
}

export const GenericModulePage: React.FC<GenericModuleProps> = ({
  title,
  subtitle,
  moduleGroup,
  emptyMessage = 'Records are automatically synchronized from connected S2P workflows.',
}) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-[#1c1328] text-purple-600 dark:text-[#c084fc] flex items-center justify-center border border-purple-100/60 dark:border-purple-900/30">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-[#c084fc] bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-900/40">
                {moduleGroup}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h1>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0c0c0e] rounded-xl border border-slate-200 dark:border-zinc-800/80 shadow-2xs p-10 flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-4 transition-colors">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-[#1c1328] text-purple-600 dark:text-[#c084fc] flex items-center justify-center border border-purple-100/60 dark:border-purple-900/30 shadow-2xs">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{title} Workspace Active</h3>
          <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-md mt-1 leading-relaxed">{emptyMessage}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-zinc-300 font-semibold bg-slate-50 dark:bg-zinc-800/60 px-3 py-1.5 rounded-full border border-slate-200 dark:border-zinc-700">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Integrated with Centralized Source-to-Pay Database</span>
        </div>
      </div>
    </div>
  )
}
