import { useEffect, useMemo, useState } from 'react'
import { Bookmark, TriangleAlert } from 'lucide-react'
import MediaTypeFilter from '../components/catalog/MediaTypeFilter.jsx'
import PosterCard from '../components/catalog/PosterCard.jsx'
import LiveMessage from '../components/ui/LiveMessage.jsx'
import UnresolvedCard from '../components/watchlist/UnresolvedCard.jsx'
import { getTitleOnline } from '../services/remoteCatalog.js'
import { getTitleById } from '../services/titleService.js'

export default function WatchlistPage({ watchlist, signedIn = false }) {
  const [mediaType, setMediaType] = useState('all')
  const [remoteItems, setRemoteItems] = useState({})
  const [failedIds, setFailedIds] = useState([])

  // Cloud (tmdb-*) ids resolve through the API worker; local ids resolve
  // instantly. Unresolvable ids keep an explicit placeholder — never dropped.
  // Coming back online retries failed resolutions.
  useEffect(() => {
    const onOnline = () => setFailedIds([])
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [])

  useEffect(() => {
    const pending = watchlist.ids.filter(
      (id) => !getTitleById(id) && !(id in remoteItems) && !failedIds.includes(id),
    )
    if (pending.length === 0) return undefined
    let cancelled = false
    Promise.all(pending.map((id) => getTitleOnline(id).then((item) => [id, item]))).then((pairs) => {
      if (cancelled) return
      const found = {}
      const failed = []
      for (const [id, item] of pairs) {
        if (item) found[id] = item
        else failed.push(id)
      }
      setRemoteItems((prev) => ({ ...prev, ...found }))
      setFailedIds((prev) => [...prev, ...failed.filter((id) => !prev.includes(id))])
    })
    return () => {
      cancelled = true
    }
  }, [watchlist.ids, remoteItems, failedIds])

  const items = useMemo(() => {
    return watchlist.ids.map((id) => {
      const local = getTitleById(id)
      if (local) return { id, item: local, pending: false, unresolved: false }
      if (remoteItems[id]) return { id, item: remoteItems[id], pending: false, unresolved: false }
      if (failedIds.includes(id)) return { id, item: null, pending: false, unresolved: true }
      return { id, item: null, pending: true, unresolved: false }
    })
  }, [watchlist.ids, remoteItems, failedIds])

  const visible = items.filter(
    (entry) =>
      !entry.pending &&
      (entry.unresolved || mediaType === 'all' || entry.item.mediaType === mediaType),
  )
  const anyPending = items.some((entry) => entry.pending)

  return (
    <div className="flex flex-col gap-6">
      <LiveMessage text={watchlist.message.text} messageKey={watchlist.message.key} />
      {watchlist.actionError && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {watchlist.actionError}
        </p>
      )}
      <section className="glass rounded-2xl p-6 sm:p-8" aria-labelledby="watchlist-heading">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Saved · Your account
        </p>
        <h1 id="watchlist-heading" className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Watchlist
        </h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
          {`${watchlist.ids.length === 1 ? '1 title' : `${watchlist.ids.length} titles`} saved. Your watchlist syncs with your account when you are online.`}
        </p>
        <div className="mt-4">
          <MediaTypeFilter value={mediaType} onChange={setMediaType} />
        </div>
      </section>

      {watchlist.notice && (
        <section
          className="glass flex items-start gap-3 rounded-2xl p-4"
          role="alert"
          aria-label="Watchlist notice"
        >
          <TriangleAlert size={18} strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm">{watchlist.notice}</p>
          </div>
          <button
            type="button"
            onClick={watchlist.dismissNotice}
            className="rounded-full px-3 py-1 text-sm font-medium hover:bg-slate-900/5 dark:hover:bg-white/10"
          >
            Dismiss
          </button>
        </section>
      )}

      {watchlist.ids.length === 0 ? (
        !signedIn ? (
          <section className="glass rounded-2xl p-8 text-center" aria-labelledby="watchlist-signin-heading">
            <Bookmark size={32} strokeWidth={1.5} aria-hidden="true" className="mx-auto text-slate-400" />
            <h2 id="watchlist-signin-heading" className="mt-3 text-base font-semibold">
              Sign in to use your watchlist
            </h2>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-600 dark:text-slate-300">
              Your watchlist lives in your account and syncs across devices. Sign in to save titles.
            </p>
            <a
              href="#/account"
              className="mt-4 inline-block rounded-full bg-slate-900 px-4 py-1.5 text-sm font-medium text-white dark:bg-white dark:text-slate-900"
            >
              Go to account
            </a>
          </section>
        ) : (
        <section className="glass rounded-2xl p-8 text-center" aria-labelledby="watchlist-empty-heading">
          <Bookmark size={32} strokeWidth={1.5} aria-hidden="true" className="mx-auto text-slate-400" />
          <h2 id="watchlist-empty-heading" className="mt-3 text-base font-semibold">
            Your watchlist is empty
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-600 dark:text-slate-300">
            Save movies and TV shows with the bookmark button to find them here later.
          </p>
          <a
            href="#/"
            className="mt-4 inline-block rounded-full bg-slate-900 px-4 py-1.5 text-sm font-medium text-white dark:bg-white dark:text-slate-900"
          >
            Browse titles
          </a>
        </section>
        )
      ) : visible.length === 0 && !anyPending ? (
        <section className="glass rounded-2xl p-8 text-center" aria-labelledby="watchlist-filter-empty-heading">
          <Bookmark size={32} strokeWidth={1.5} aria-hidden="true" className="mx-auto text-slate-400" />
          <h2 id="watchlist-filter-empty-heading" className="mt-3 text-base font-semibold">
            Nothing saved in this section
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-600 dark:text-slate-300">
            Try a different filter to see the rest of your watchlist.
          </p>
        </section>
      ) : (
        <>
          {anyPending && (
            <p className="text-sm text-slate-500 dark:text-slate-400" role="status">
              Syncing saved titles…
            </p>
          )}
          <ul
            className="grid list-none grid-cols-2 gap-4 p-0 sm:grid-cols-3 lg:grid-cols-4"
            aria-label="Watchlist results"
          >
            {visible.map((entry) => (
              <li key={entry.id}>
                {entry.unresolved ? (
                  <UnresolvedCard id={entry.id} onRemove={(id) => watchlist.toggle(id)} />
                ) : (
                  <PosterCard item={entry.item} watchlist={watchlist} signedIn={signedIn} />
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
