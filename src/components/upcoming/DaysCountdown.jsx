import { Hourglass } from 'lucide-react'
import { getDaysRemaining } from '../../services/titleService.js'

/**
 * Days-only per-title countdown. Computed at render from the item's exact
 * release/air date — the value only changes at midnight, so no timer,
 * interval, or re-render machinery is needed. Renders nothing unless the
 * title has a valid future exact date.
 */
export default function DaysCountdown({ item }) {
  const days = getDaysRemaining(item)
  if (days === null) return null

  return (
    <p
      className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold dark:bg-white/10"
      aria-label={`${days} ${days === 1 ? 'day' : 'days'} remaining`}
    >
      <Hourglass size={14} aria-hidden="true" />
      {days} {days === 1 ? 'day' : 'days'} left
    </p>
  )
}
