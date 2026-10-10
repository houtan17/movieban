import { Bookmark, CalendarDays, Clapperboard, House } from 'lucide-react'

/**
 * Central navigation definition.
 * Phase 4: Home (catalog), Upcoming (future dates), Watchlist (saved titles).
 */
export const NAVIGATION = [
  { label: 'Home', href: '#/', icon: House, matchHref: '#/' },
  { label: 'Upcoming', href: '#/upcoming', icon: CalendarDays, matchHref: '#/upcoming' },
  { label: 'Watchlist', href: '#/watchlist', icon: Bookmark, matchHref: '#/watchlist' },
]

export const APP_LOGO_ICON = Clapperboard
