import { CalendarDays, Film } from 'lucide-react'
import {
  getDateSortKey,
  getDateStatus,
  getDisplayDate,
  getMediaTypeLabel,
} from '../../services/titleService.js'
import DaysCountdown from './DaysCountdown.jsx'
import WatchlistButton from '../watchlist/WatchlistButton.jsx'

/**
 * Card for one upcoming/announced title. Exact-day items show a live
 * countdown; partially-known dates show the known part only (no countdown).
 */
export default function UpcomingCard({ item, watchlist, signedIn = false }) {
  const status = getDateStatus(item)
  const displayDate = getDisplayDate(item)
  const sortKey = getDateSortKey(item)
  const showCountdown = status === 'upcoming' && sortKey !== null

  return (
    <article className="glass relative rounded-2xl" aria-label={item.title}>
      <a href={`#/title/${item.id}`} className="flex gap-4 p-4" aria-label={`${item.title} — view details`}>
        <div className="w-20 shrink-0 self-start overflow-hidden rounded-xl bg-slate-900/5 sm:w-24 dark:bg-white/5">
          {item.poster ? (
            <img
              src={item.poster}
              alt=""
              loading="lazy"
              className="aspect-[2/3] h-auto w-full object-cover"
            />
          ) : (
            <div
              className="flex aspect-[2/3] w-full flex-col items-center justify-center gap-1 text-slate-400 dark:text-slate-500"
              role="img"
              aria-label={`No poster available for ${item.title}`}
            >
              <Film size={24} strokeWidth={1.5} aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            {getMediaTypeLabel(item)}
          </p>
          <h2 className="mt-0.5 truncate text-base font-semibold">{item.title}</h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
            <CalendarDays size={14} strokeWidth={2} aria-hidden="true" className="shrink-0" />
            {displayDate ?? 'Date TBA'}
            {item.datePrecision === 'year' && displayDate ? ' (year only)' : ''}
            {item.datePrecision === 'month' && displayDate ? ' (month only)' : ''}
          </p>
          {showCountdown && (
            <div className="mt-2">
              <DaysCountdown item={item} />
            </div>
          )}
        </div>
      </a>
      {watchlist && (
        <div className="absolute right-2 top-2">
          <WatchlistButton id={item.id} title={item.title} watchlist={watchlist} signedIn={signedIn} />
        </div>
      )}
    </article>
  )
}
