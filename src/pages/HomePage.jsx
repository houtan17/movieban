import { useEffect, useState } from 'react'
import { SearchX } from 'lucide-react'
import LoadMoreButton from '../components/catalog/LoadMoreButton.jsx'
import MediaTypeFilter from '../components/catalog/MediaTypeFilter.jsx'
import PosterCard from '../components/catalog/PosterCard.jsx'
import SearchBar from '../components/catalog/SearchBar.jsx'
import LiveMessage from '../components/ui/LiveMessage.jsx'
import { fetchSearchPage, fetchTrendingPage } from '../services/remoteCatalog.js'
import { getVisibleSections } from '../lib/homeSections.js'
import usePagedList from '../lib/usePagedList.js'

const CONNECTION_NOTICE = 'No connection. Connect to the internet and retry.'

function TrendingRail({ headingId, title, rail, onLoadMore, onRetry, watchlist, signedIn = false }) {
  const { status, items } = rail
  if (status === 'loading' && items.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400" role="status">
        Loading {title.toLowerCase()}…
      </p>
    )
  }
  if (status === 'error' && items.length === 0) {
    return (
      <section aria-labelledby={headingId} className="glass rounded-2xl p-5">
        <h2 id={headingId} className="text-base font-semibold">
          {title} unavailable
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Fresh {title.toLowerCase()} could not be loaded. Check your connection and try again.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-full bg-slate-900 px-4 py-1.5 text-sm font-medium text-white dark:bg-white dark:text-slate-900"
        >
          Retry
        </button>
      </section>
    )
  }
  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className="text-base font-semibold">
        {title}
      </h2>
      <ul
        className="mt-3 grid list-none grid-cols-2 gap-4 p-0 sm:grid-cols-3 lg:grid-cols-4"
        aria-label={title}
      >
        {items.map((item) => (
          <li key={item.id}>
            <PosterCard item={item} watchlist={watchlist} signedIn={signedIn} />
          </li>
        ))}
      </ul>
      <div className="mt-4">
        {status === 'error' && (
          <p className="mb-2 text-center text-xs text-slate-500 dark:text-slate-400">
            Couldn&apos;t load more. Check your connection.
          </p>
        )}
        <LoadMoreButton
          canLoadMore={rail.canLoadMore}
          loading={status === 'loading-more'}
          showEnd={rail.showEndNote}
          onClick={onLoadMore}
        />
      </div>
    </section>
  )
}

export default function HomePage({ watchlist, signedIn = false }) {
  const [query, setQuery] = useState('')
  const [mediaType, setMediaType] = useState('all')
  const search = usePagedList()
  const moviesRail = usePagedList()
  const tvRail = usePagedList()

  const blankQuery = !query.trim()

  // Daily trending rails (online mode), scoped to the media-type filter:
  // Movies shows only the movies rail, TV Shows only the TV rail.
  // Unselected kinds are never fetched; loaded rails are reused on filter
  // switches instead of refetching page one.
  useEffect(() => {
    const kinds = mediaType === 'all' ? ['movie', 'tv'] : [mediaType]
    const rails = { movie: moviesRail, tv: tvRail }
    for (const kind of kinds) {
      if (rails[kind].status === 'idle') {
        rails[kind].loadPage(1, (page) => fetchTrendingPage(kind, page))
      }
    }
    // Rails persist for the HomePage lifetime; refetch only on filter change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaType])

  function loadMoreTrending(kind) {
    const rail = kind === 'movie' ? moviesRail : tvRail
    rail.loadPage(rail.page + 1, (page) => fetchTrendingPage(kind, page))
  }

  // Rail visibility follows the media-type filter; the fallback notice
  // appears only when no selected rail carries usable items.
  const { showMoviesRail, showTvRail, fullFallback } = getVisibleSections({
    blankQuery,
    mediaType,
    movie: { status: moviesRail.status, count: moviesRail.items.length },
    tv: { status: tvRail.status, count: tvRail.items.length },
  })
  const trendingTotal =
    (mediaType !== 'tv' ? moviesRail.items.length : 0) +
    (mediaType !== 'movie' ? tvRail.items.length : 0)

  // Search results come from the online catalog only. The genuine empty
  // state renders only after the online search has finished; failures get
  // an error state with retry instead of masquerading as "no results".
  // The merged-query behavior is unchanged; only paging was added.
  const searching = !blankQuery
  const combined = searching ? search.items : []
  const searchPending = searching && search.status !== 'ready' && search.status !== 'error'
  const searchFailed = searching && search.status === 'error'
  const showSearchEmpty = searching && !searchPending && !searchFailed && combined.length === 0
  const showSearchError = searching && searchFailed && combined.length === 0

  // Debounced online search; Load More appends further pages below.
  // Unchanged debounce, error, and empty-state behavior — paging only adds.
  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) return undefined
    const timer = setTimeout(() => {
      search.loadPage(1, (page) => fetchSearchPage(trimmed, mediaType, page))
    }, 350)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, mediaType])

  function retryOnlineSearch() {
    const trimmed = query.trim()
    if (!trimmed) return
    search.loadPage(search.page + 1, (page) => fetchSearchPage(trimmed, mediaType, page))
  }

  function handleQueryChange(value) {
    setQuery(value)
    // Reset result state in the event handler (not the effect) so blank
    // queries clear instantly without a set-state-in-effect warning.
    if (!value.trim()) search.reset()
  }

  function handleMediaTypeChange(value) {
    setMediaType(value)
    search.reset()
  }

  function clearSearch() {
    setQuery('')
    setMediaType('all')
  }

  return (
    <div className="flex flex-col gap-6">
      {watchlist && <LiveMessage text={watchlist.message.text} messageKey={watchlist.message.key} />}
      {watchlist?.actionError && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {watchlist.actionError}
        </p>
      )}
      <section className="glass rounded-2xl p-6 sm:p-8" aria-labelledby="home-heading">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Browse · Online catalog
        </p>
        <h1 id="home-heading" className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Movies & TV Shows
        </h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
          Search fresh movies and TV shows online. An internet connection is required.
        </p>
        <div className="mt-4 flex max-w-xl flex-col gap-3">
          <SearchBar value={query} onChange={handleQueryChange} resultCount={searching ? combined.length : trendingTotal} />
          <MediaTypeFilter value={mediaType} onChange={handleMediaTypeChange} />
        </div>
      </section>

      {searching ? (
        <>
          {combined.length > 0 && (
            <ul
              className="grid list-none grid-cols-2 gap-4 p-0 sm:grid-cols-3 lg:grid-cols-4"
              aria-label="Search results"
            >
              {combined.map((item) => (
                <li key={item.id}>
                  <PosterCard item={item} watchlist={watchlist} signedIn={signedIn} />
                </li>
              ))}
            </ul>
          )}
          {searchPending && (
            <p className="text-sm text-slate-500 dark:text-slate-400" role="status">
              {combined.length > 0 ? 'Searching online…' : 'Searching…'}
            </p>
          )}
          {searching && combined.length > 0 && (
            <LoadMoreButton
              canLoadMore={search.canLoadMore}
              loading={search.status === 'loading-more'}
              showEnd={search.showEndNote}
              onClick={() => {
                const trimmed = query.trim()
                search.loadPage(search.page + 1, (page) => fetchSearchPage(trimmed, mediaType, page))
              }}
            />
          )}
          {showSearchError && (
            <section className="glass rounded-2xl p-8 text-center" aria-labelledby="search-error-heading">
              <SearchX size={32} strokeWidth={1.5} aria-hidden="true" className="mx-auto text-slate-400" />
              <h2 id="search-error-heading" className="mt-3 text-base font-semibold">
                Search failed
              </h2>
              <p className="mx-auto mt-1 max-w-sm text-sm text-slate-600 dark:text-slate-300">
                The online search could not be completed. Check your connection and try again.
              </p>
              <button
                type="button"
                onClick={retryOnlineSearch}
                className="mt-4 rounded-full bg-slate-900 px-4 py-1.5 text-sm font-medium text-white dark:bg-white dark:text-slate-900"
              >
                Retry
              </button>
            </section>
          )}
          {showSearchEmpty && (
            <section className="glass rounded-2xl p-8 text-center" aria-labelledby="empty-heading">
              <SearchX size={32} strokeWidth={1.5} aria-hidden="true" className="mx-auto text-slate-400" />
              <h2 id="empty-heading" className="mt-3 text-base font-semibold">
                No titles found
              </h2>
              <p className="mx-auto mt-1 max-w-sm text-sm text-slate-600 dark:text-slate-300">
                Nothing matches your search. Try a different title or clear the filters.
              </p>
              <button
                type="button"
                onClick={clearSearch}
                className="mt-4 rounded-full bg-slate-900 px-4 py-1.5 text-sm font-medium text-white dark:bg-white dark:text-slate-900"
              >
                Clear search
              </button>
            </section>
          )}
        </>
      ) : null}

      {showMoviesRail && (
        <TrendingRail
          headingId="trending-movies-heading"
          title="Trending Movies"
          rail={moviesRail}
          onLoadMore={() => loadMoreTrending('movie')}
          onRetry={() => loadMoreTrending('movie')}
          watchlist={watchlist}
          signedIn={signedIn}
        />
      )}
      {showTvRail && (
        <TrendingRail
          headingId="trending-tv-heading"
          title="Trending TV Shows"
          rail={tvRail}
          onLoadMore={() => loadMoreTrending('tv')}
          onRetry={() => loadMoreTrending('tv')}
          watchlist={watchlist}
          signedIn={signedIn}
        />
      )}
      {fullFallback && (
        <p className="text-sm text-slate-500 dark:text-slate-400" role="status">
          {CONNECTION_NOTICE}
        </p>
      )}

    </div>
  )
}
