import { CloudOff, Film } from 'lucide-react'

/**
 * Placeholder for a saved id that cannot be resolved right now
 * (transient fetch failure). Never deletes data — offers an explicit
 * remove button instead.
 */
export default function UnresolvedCard({ id, onRemove }) {
  return (
    <article className="glass relative overflow-hidden rounded-2xl p-3" aria-label={`Saved item ${id} unavailable`}>
      <div className="flex aspect-[2/3] w-full flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500">
        <Film size={32} strokeWidth={1.5} aria-hidden="true" />
        <span className="px-4 text-center text-xs">Saved title unavailable</span>
      </div>
      <p className="mt-2 flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
        <CloudOff size={14} aria-hidden="true" className="shrink-0" />
        Check your connection to view details
      </p>
      <button
        type="button"
        onClick={() => onRemove(id)}
        className="mt-2 rounded-full px-3 py-1 text-xs font-medium hover:bg-slate-900/5 dark:hover:bg-white/10"
      >
        Remove
      </button>
    </article>
  )
}
