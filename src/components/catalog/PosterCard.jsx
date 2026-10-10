import { Film, Star } from 'lucide-react'
import { useState } from 'react'
import { formatRating, getMediaTypeLabel, getYear } from '../../services/titleService.js'
import WatchlistButton from '../watchlist/WatchlistButton.jsx'

export default function PosterCard({ item, watchlist, signedIn = false }) {
  const year = getYear(item)
  const rating = formatRating(item)
  // Remote posters can fail offline or be removed upstream — fall back to the
  // placeholder instead of a broken-image icon. Resets per item via key.
  const [imgError, setImgError] = useState(false)

  return (
    <article className="glass group relative overflow-hidden rounded-2xl" aria-label={item.title}>
      <a href={`#/title/${item.id}`} className="block" aria-label={`${item.title} — view details`}>
        <div className="aspect-[2/3] w-full overflow-hidden bg-slate-900/5 dark:bg-white/5">
          {item.poster && !imgError ? (
            <img
              src={item.poster}
              alt={`${item.title} poster`}
              loading="lazy"
              onError={() => setImgError(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500"
              role="img"
              aria-label={`No poster available for ${item.title}`}
            >
              <Film size={32} strokeWidth={1.5} aria-hidden="true" />
              <span className="px-4 text-center text-xs">No poster available</span>
            </div>
          )}
        </div>
        <div className="p-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            {getMediaTypeLabel(item)}
            {year ? ` · ${year}` : ''}
          </p>
          <h2 className="mt-1 truncate text-sm font-semibold">{item.title}</h2>
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
            <Star size={14} strokeWidth={2} aria-hidden="true" className="shrink-0" />
            {rating ?? 'Not rated'}
          </p>
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
