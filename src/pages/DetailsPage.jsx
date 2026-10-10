import { ArrowLeft, CalendarDays, Film, Star, Tags, Tv } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  formatRating,
  getDateSortKey,
  getDateStatus,
  getDateStatusLabel,
  getDisplayDate,
  getMediaTypeLabel,
  getRatingSource,
  getTitleById,
  getYear,
} from '../services/titleService.js'
import { getTitleOnline } from '../services/remoteCatalog.js'
import DaysCountdown from '../components/upcoming/DaysCountdown.jsx'
import LiveMessage from '../components/ui/LiveMessage.jsx'
import WatchlistButton from '../components/watchlist/WatchlistButton.jsx'

const NOT_AVAILABLE = 'Not available'

function MetadataRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900/5 text-slate-600 dark:bg-white/10 dark:text-slate-300">
        <Icon size={16} strokeWidth={2} aria-hidden="true" />
      </span>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          {label}
        </dt>
        <dd className="mt-0.5 text-sm">{children}</dd>
      </div>
    </div>
  )
}

export default function DetailsPage({ id, watchlist, signedIn = false }) {
  const localItem = getTitleById(id)
  const needsRemote = !localItem && /^tmdb-(movie|tv)-\d+$/.test(id)
  const [remoteItem, setRemoteItem] = useState(null)
  // DetailsPage remounts per id (key), so the initial state is per title.
  const [remoteState, setRemoteState] = useState(needsRemote ? 'loading' : 'idle')

  // TMDB-backed ids resolve through the API worker; local ids never fetch.
  useEffect(() => {
    if (!needsRemote) return undefined
    let cancelled = false
    getTitleOnline(id).then((item) => {
      if (cancelled) return
      setRemoteItem(item)
      setRemoteState(item ? 'ready' : 'error')
    })
    return () => {
      cancelled = true
    }
  }, [id, needsRemote])

  const item = localItem || remoteItem

  if (!item) {
    if (remoteState === 'loading') {
      return (
        <div className="flex flex-col gap-4">
          <a href="#/" className="inline-flex w-fit items-center gap-2 text-sm font-medium">
            <ArrowLeft size={16} aria-hidden="true" /> Back to browse
          </a>
          <section className="glass rounded-2xl p-6" aria-labelledby="loading-heading" aria-busy="true">
            <h1 id="loading-heading" className="text-xl font-bold">
              Loading title…
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Fetching details. This needs a network connection.
            </p>
          </section>
        </div>
      )
    }
    return (
      <div className="flex flex-col gap-4">
        <a href="#/" className="inline-flex w-fit items-center gap-2 text-sm font-medium">
          <ArrowLeft size={16} aria-hidden="true" /> Back to browse
        </a>
        <section className="glass rounded-2xl p-6" aria-labelledby="not-found-heading">
          <h1 id="not-found-heading" className="text-xl font-bold">
            Title not found
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            This item is not in the local catalog and could not be fetched
            online. It may have been removed, or you may be offline.
          </p>
        </section>
      </div>
    )
  }

  const TypeIcon = item.mediaType === 'movie' ? Film : Tv
  const year = getYear(item)
  const displayDate = getDisplayDate(item)
  const rating = formatRating(item)
  // Ratings sourced live from TMDB (tmdb-* ids) are genuine vote averages;
  // bundled catalog entries carry local sample data instead. Never present
  // a sample value as a live rating.
  const ratingSource = getRatingSource(item)
  const dateLabel = item.mediaType === 'movie' ? 'Release date' : 'First air date'
  const dateStatus = getDateStatus(item)
  const sortKey = getDateSortKey(item)
  const showCountdown = dateStatus === 'upcoming' && sortKey !== null

  return (
    <div className="flex flex-col gap-4">
      {watchlist && <LiveMessage text={watchlist.message.text} messageKey={watchlist.message.key} />}
      {watchlist?.actionError && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {watchlist.actionError}
        </p>
      )}
      <a href="#/" className="inline-flex w-fit items-center gap-2 text-sm font-medium">
        <ArrowLeft size={16} aria-hidden="true" /> Back to browse
      </a>

      <article className="glass rounded-2xl p-5 sm:p-6" aria-labelledby="details-heading">
        <div className="flex flex-col gap-5 sm:flex-row">
          <div className="w-full shrink-0 overflow-hidden rounded-xl bg-slate-900/5 sm:w-48 dark:bg-white/5">
            {item.poster ? (
              <img
                src={item.poster}
                alt={`${item.title} poster`}
                className="aspect-[2/3] h-auto w-full object-cover"
              />
            ) : (
              <div
                className="flex aspect-[2/3] w-full flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500"
                role="img"
                aria-label={`No poster available for ${item.title}`}
              >
                <Film size={32} strokeWidth={1.5} aria-hidden="true" />
                <span className="px-4 text-center text-xs">No poster available</span>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold dark:bg-white/10">
              <TypeIcon size={14} aria-hidden="true" />
              {getMediaTypeLabel(item)}
              {year ? ` · ${year}` : ''}
            </p>
            <h1 id="details-heading" className="mt-2 text-2xl font-bold tracking-tight">
              {item.title}
            </h1>
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold dark:bg-white/10">
              <CalendarDays size={14} aria-hidden="true" />
              {getDateStatusLabel(dateStatus)}
            </p>
            {showCountdown && (
              <div className="mt-3">
                <DaysCountdown item={item} />
              </div>
            )}
            {watchlist && (
              <div className="mt-3">
                <WatchlistButton id={item.id} title={item.title} watchlist={watchlist} variant="full" signedIn={signedIn} />
              </div>
            )}

            <dl className="mt-5 flex flex-col gap-4">
              <MetadataRow icon={Star} label="Rating">
                {rating ? `${rating} / 10 (${ratingSource === 'tmdb' ? 'TMDB' : 'local sample'})` : NOT_AVAILABLE}
              </MetadataRow>
              <MetadataRow icon={CalendarDays} label={dateLabel}>
                {displayDate ?? NOT_AVAILABLE}
                {item.datePrecision === 'year' && displayDate ? ' (year only)' : ''}
                {item.datePrecision === 'month' && displayDate ? ' (month only)' : ''}
              </MetadataRow>
              <MetadataRow icon={Tags} label="Genres">
                {item.genres.length > 0 ? item.genres.join(', ') : NOT_AVAILABLE}
              </MetadataRow>
            </dl>
          </div>
        </div>

        <section className="mt-6" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className="text-base font-semibold">
            Overview
          </h2>
          <p className="mt-1 max-w-prose text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {item.overview ?? 'No synopsis available.'}
          </p>
        </section>
      </article>
    </div>
  )
}
