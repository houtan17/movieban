import { LoaderCircle, Plus } from 'lucide-react'

/**
 * Load More control: spinner button while appending, plain button when more
 * pages remain, quiet end-of-list note once exhausted. Renders nothing for
 * single-page results. Respects reduced motion via global CSS guards.
 */
export default function LoadMoreButton({ canLoadMore, loading, showEnd, onClick, label = 'Load more' }) {
  if (loading) {
    return (
      <div className="flex justify-center" role="status" aria-live="polite">
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/5 px-4 py-2 text-sm font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300">
          <LoaderCircle size={16} strokeWidth={2} aria-hidden="true" className="animate-spin" />
          Loading more…
        </span>
      </div>
    )
  }
  if (canLoadMore) {
    return (
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onClick}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white transition-transform duration-150 hover:scale-[1.03] active:scale-95 dark:bg-white dark:text-slate-900"
        >
          <Plus size={16} strokeWidth={2} aria-hidden="true" />
          {label}
        </button>
      </div>
    )
  }
  if (showEnd) {
    return (
      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
        You&apos;ve reached the end of the results.
      </p>
    )
  }
  return null
}
