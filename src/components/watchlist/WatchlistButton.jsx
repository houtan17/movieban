import { Bookmark } from 'lucide-react'

/**
 * Save/remove toggle for one title.
 * `icon` variant overlays poster cards; `full` variant sits on details pages.
 */
export default function WatchlistButton({ id, title, watchlist, variant = 'icon', signedIn = false }) {
  // Online-only: saving requires an account. Signed-out users get a
  // sign-in link instead of a toggle so nothing is saved purely locally.
  if (!signedIn) {
    const label = `Sign in to save ${title} to your watchlist`
    if (variant === 'full') {
      return (
        <a
          href="#/account"
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-900"
        >
          <Bookmark size={16} strokeWidth={2} aria-hidden="true" />
          Sign in to save
        </a>
      )
    }
    return (
      <a
        href="#/account"
        aria-label={label}
        title="Sign in to save to watchlist"
        className="glass flex h-9 w-9 items-center justify-center rounded-full text-slate-700 dark:text-slate-200"
      >
        <Bookmark size={18} strokeWidth={2} aria-hidden="true" />
      </a>
    )
  }

  const saved = watchlist.isSaved(id)
  const pending = watchlist.isPending ? watchlist.isPending(id) : false
  const handleToggle = () => {
    if (!pending) watchlist.toggle(id)
  }

  if (variant === 'full') {
    return (
      <button
        type="button"
        aria-pressed={saved}
        disabled={pending}
        onClick={handleToggle}
        className={[
          'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium disabled:opacity-60',
          saved
            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
            : 'glass text-slate-700 dark:text-slate-200',
        ].join(' ')}
      >
        <Bookmark size={16} strokeWidth={2} aria-hidden="true" fill={saved ? 'currentColor' : 'none'} />
        {pending ? 'Saving…' : saved ? 'Saved to watchlist' : 'Save to watchlist'}
      </button>
    )
  }

  return (
    <button
      type="button"
      aria-pressed={saved}
      disabled={pending}
      aria-label={
        pending
          ? `Saving ${title}…`
          : saved
            ? `Remove ${title} from watchlist`
            : `Save ${title} to watchlist`
      }
      title={saved ? 'Remove from watchlist' : 'Save to watchlist'}
      onClick={handleToggle}
      className="glass flex h-9 w-9 items-center justify-center rounded-full text-slate-700 disabled:opacity-60 dark:text-slate-200"
    >
      <Bookmark size={18} strokeWidth={2} aria-hidden="true" fill={saved ? 'currentColor' : 'none'} />
    </button>
  )
}
