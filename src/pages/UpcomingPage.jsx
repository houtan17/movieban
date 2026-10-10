import { useEffect, useState } from 'react'
import LoadMoreButton from '../components/catalog/LoadMoreButton.jsx'
import MediaTypeFilter from '../components/catalog/MediaTypeFilter.jsx'
import UpcomingCard from '../components/upcoming/UpcomingCard.jsx'
import LiveMessage from '../components/ui/LiveMessage.jsx'
import { fetchUpcomingPage } from '../services/remoteCatalog.js'
import { getDateSortKey } from '../services/titleService.js'
import usePagedList, { getVisibleWindow, needsMoreBuffered, PAGE_WINDOW } from '../lib/usePagedList.js'

function kindsFor(mediaType) {
  return mediaType === 'all' ? ['movie', 'tv'] : [mediaType]
}

function byDateAsc(a, b) {
  return (
    (getDateSortKey(a) ?? Number.MAX_SAFE_INTEGER) -
    (getDateSortKey(b) ?? Number.MAX_SAFE_INTEGER)
  )
}

/** Merged, date-sorted page across the selected kinds. Null when all fail. */
async function loadUpcomingPage(kinds, page) {
  const settled = await Promise.all(kinds.map((kind) => fetchUpcomingPage(kind, page)))
  const usable = settled.filter((entry) => entry !== null)
  if (usable.length === 0) return null
  const seen = new Set()
  const items = usable
    .flatMap((entry) => entry.items)
    .sort(byDateAsc)
    .filter((item) => (seen.has(item.id) ? false : (seen.add(item.id), true)))
  return { items, totalPages: Math.max(...usable.map((entry) => entry.totalPages)) }
}

export default function UpcomingPage({ watchlist, signedIn = false }) {
  const [mediaType, setMediaType] = useState('all')
  const list = usePagedList()
  // Visible window into the loaded items: 20 titles initially, +20 per
  // Load More click. Previously loaded titles stay visible; fetching only
  // tops up the buffer when the window outgrows it.
  const [visibleCount, setVisibleCount] = useState(PAGE_WINDOW)

  // Online upcoming releases (TMDB-backed), nearest first across the
  // selected kinds. Filter changes reset to page one.
  useEffect(() => {
    list.loadPage(1, (page) => loadUpcomingPage(kindsFor(mediaType), page))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaType])

  function handleMediaTypeChange(value) {
    setMediaType(value)
    setVisibleCount(20)
    list.reset()
  }

  function retryOnline() {
    list.loadPage(list.page + 1, (page) => loadUpcomingPage(kindsFor(mediaType), page))
  }

  function handleLoadMore() {
    setVisibleCount((count) => count + PAGE_WINDOW)
    if (needsMoreBuffered(visibleCount, list.items.length) && list.canLoadMore) {
      list.loadPage(list.page + 1, (page) => loadUpcomingPage(kindsFor(mediaType), page))
    }
  }

  const { visible: visibleItems, hasMoreBuffered } = getVisibleWindow(list.items, visibleCount)
  const canLoadMore = hasMoreBuffered || list.canLoadMore
  const showEnd = !hasMoreBuffered && list.showEndNote
  const onlineOk = list.status === 'ready' && visibleItems.length > 0
  const showEmpty = list.status === 'ready' && list.items.length === 0
  const showError = list.status === 'error' && list.items.length === 0

  return (
    <div className="flex flex-col gap-6">
      {watchlist && <LiveMessage text={watchlist.message.text} messageKey={watchlist.message.key} />}
      {watchlist?.actionError && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {watchlist.actionError}
        </p>
      )}
      <section className="glass rounded-2xl p-6 sm:p-8" aria-labelledby="upcoming-heading">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Release dates · Online catalog
        </p>
        <h1 id="upcoming-heading" className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Upcoming
        </h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
          Future releases with known dates, nearest first. Live countdowns appear
          only for exact dates. An internet connection is required.
        </p>
        <div className="mt-4">
          <MediaTypeFilter value={mediaType} onChange={handleMediaTypeChange} />
        </div>
      </section>

      {(list.status === 'loading' || list.status === 'idle') && (
        <p className="text-sm text-slate-500 dark:text-slate-400" role="status">
          Loading upcoming releases…
        </p>
      )}

      {onlineOk && (
        <>
          <ul className="grid list-none grid-cols-1 gap-4 p-0 lg:grid-cols-2" aria-label="Upcoming releases">
            {visibleItems.map((item) => (
              <li key={item.id}>
                <UpcomingCard item={item} watchlist={watchlist} signedIn={signedIn} />
              </li>
            ))}
          </ul>
          <LoadMoreButton
            canLoadMore={canLoadMore}
            loading={list.status === 'loading-more' || list.status === 'loading'}
            showEnd={showEnd}
            onClick={handleLoadMore}
          />
          {list.status === 'error' && (
            <p className="text-center text-xs text-slate-500 dark:text-slate-400">
              Couldn&apos;t load more. Check your connection.
            </p>
          )}
        </>
      )}

      {showEmpty && (
        <section className="glass rounded-2xl p-8 text-center" aria-labelledby="upcoming-empty-heading">
          <h2 id="upcoming-empty-heading" className="mt-3 text-base font-semibold">
            Nothing scheduled
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-600 dark:text-slate-300">
            No upcoming releases found. Try a different filter.
          </p>
        </section>
      )}

      {showError && (
        <section className="glass rounded-2xl p-5" aria-labelledby="upcoming-error-heading">
          <h2 id="upcoming-error-heading" className="text-base font-semibold">
            Upcoming releases unavailable
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Fresh releases could not be loaded. Check your connection and try again.
          </p>
          <button
            type="button"
            onClick={retryOnline}
            className="mt-3 rounded-full bg-slate-900 px-4 py-1.5 text-sm font-medium text-white dark:bg-white dark:text-slate-900"
          >
            Retry
          </button>
        </section>
      )}
    </div>
  )
}
