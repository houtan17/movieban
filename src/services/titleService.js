/**
 * Title repository / service layer (Phase 2: local data source).
 *
 * UI components must import from here — never from `../data/*` directly.
 * A future online API (V2) can replace these implementations without
 * changing component code, as long as the function signatures and the
 * `Title` shape are preserved.
 */
import { TITLES } from '../data/titles.js'

/** @typedef {import('../data/titles.js').Title} Title */

/** All titles in catalog order. Returns a copy. @returns {Title[]} */
export function getAllTitles() {
  return [...TITLES]
}

/**
 * Find one title by id.
 * @param {string} id
 * @returns {Title | null}
 */
export function getTitleById(id) {
  return TITLES.find((item) => item.id === id) ?? null
}

/**
 * Local title search: case-insensitive substring match on title.
 * Empty/blank query returns the (optionally type-filtered) full list.
 *
 * @param {string} [query='']
 * @param {'all' | 'movie' | 'tv'} [mediaType='all']
 * @returns {Title[]}
 */
export function searchTitles(query = '', mediaType = 'all') {
  const q = query.trim().toLowerCase()
  return TITLES.filter((item) => {
    if (mediaType !== 'all' && item.mediaType !== mediaType) return false
    if (!q) return true
    return item.title.toLowerCase().includes(q)
  })
}

/** Raw date string for an item (release or first-air date). @param {Title} item */
function rawDate(item) {
  return item.mediaType === 'movie' ? item.releaseDate : item.firstAirDate
}

/**
 * Four-digit year, or null when unavailable.
 * @param {Title} item
 * @returns {string | null}
 */
export function getYear(item) {
  const date = rawDate(item)
  if (!date) return null
  const match = date.match(/^(\d{4})/)
  return match ? match[1] : null
}

/**
 * Human-readable date honoring precision. Never invents missing parts:
 * year-precision renders as just the year, month-precision as month + year,
 * unknown renders as null.
 * @param {Title} item
 * @returns {string | null}
 */
export function getDisplayDate(item) {
  const date = rawDate(item)
  if (!date || item.datePrecision === 'unknown') return null
  if (item.datePrecision === 'year') return getYear(item)
  if (item.datePrecision === 'month') {
    const parsed = parseYearMonth(date)
    if (!parsed) return getYear(item)
    return new Date(parsed.year, parsed.month - 1, 1).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    })
  }
  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return getYear(item)
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Strictly validate a 'YYYY-MM' string.
 * @param {string | null} value
 * @returns {{ year: number, month: number } | null}
 */
function parseYearMonth(value) {
  if (typeof value !== 'string') return null
  const match = value.match(/^(\d{4})-(\d{2})$/)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  if (month < 1 || month > 12) return null
  return { year, month }
}

/**
 * Strictly validate a 'YYYY-MM-DD' calendar date (rejects e.g. Feb 30).
 * @param {string | null} value
 * @returns {{ year: number, month: number, day: number } | null}
 */
function parseYearMonthDay(value) {
  if (typeof value !== 'string') return null
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  const check = new Date(year, month - 1, day)
  if (check.getFullYear() !== year || check.getMonth() !== month - 1 || check.getDate() !== day) {
    return null
  }
  return { year, month, day }
}

/**
 * Sort key for an item's date: start of the known period in local time.
 * Day precision starts at that day; month at the 1st; year at Jan 1.
 * Returns null when the date is missing, imprecise-unknown, or invalid —
 * never invent a timestamp from bad input.
 * @param {Title} item
 * @returns {number | null} Local-time milliseconds, or null.
 */
export function getDateSortKey(item) {
  const date = rawDate(item)
  if (!date) return null
  if (item.datePrecision === 'day') {
    const parsed = parseYearMonthDay(date)
    if (!parsed) return null
    return new Date(parsed.year, parsed.month - 1, parsed.day).getTime()
  }
  if (item.datePrecision === 'month') {
    const parsed = parseYearMonth(date)
    if (!parsed) return null
    return new Date(parsed.year, parsed.month - 1, 1).getTime()
  }
  if (item.datePrecision === 'year') {
    const year = getYear(item)
    if (!year) return null
    return new Date(Number(year), 0, 1).getTime()
  }
  return null
}

/**
 * Release status of an item at a given moment.
 * - 'upcoming': exact-day date still in the future (countdown allowed).
 * - 'released': exact-day date reached or passed.
 * - 'announced': partially known date (month/year precision only).
 * - 'tba': missing, unknown-precision, or invalid date.
 * @param {Title} item
 * @param {number} [nowMs=Date.now()]
 * @returns {'upcoming' | 'released' | 'announced' | 'tba'}
 */
export function getDateStatus(item, nowMs = Date.now()) {
  const sortKey = getDateSortKey(item)
  if (sortKey === null) return 'tba'
  if (item.datePrecision === 'day') {
    return sortKey > nowMs ? 'upcoming' : 'released'
  }
  return 'announced'
}

/** @param {'upcoming' | 'released' | 'announced' | 'tba'} status */
export function getDateStatusLabel(status) {
  if (status === 'upcoming') return 'Upcoming'
  if (status === 'released') return 'Released'
  if (status === 'announced') return 'Announced'
  return 'Date TBA'
}

/**
 * Upcoming items (exact future dates plus partially-known future periods),
 * nearest first. Type-filterable. Past and unknown dates are excluded.
 * @param {'all' | 'movie' | 'tv'} [mediaType='all']
 * @param {number} [nowMs=Date.now()]
 * @returns {Title[]}
 */
export function getUpcomingTitles(mediaType = 'all', nowMs = Date.now()) {
  return TITLES.filter((item) => {
    if (mediaType !== 'all' && item.mediaType !== mediaType) return false
    const sortKey = getDateSortKey(item)
    if (sortKey === null || sortKey <= nowMs) return false
    const status = getDateStatus(item, nowMs)
    return status === 'upcoming' || status === 'announced'
  }).sort((a, b) => getDateSortKey(a) - getDateSortKey(b))
}

/**
 * Items with no usable date (missing, unknown, or invalid).
 * @param {'all' | 'movie' | 'tv'} [mediaType='all']
 * @param {number} [nowMs=Date.now()]
 * @returns {Title[]}
 */
export function getTbaTitles(mediaType = 'all', nowMs = Date.now()) {
  return TITLES.filter((item) => {
    if (mediaType !== 'all' && item.mediaType !== mediaType) return false
    return getDateStatus(item, nowMs) === 'tba'
  })
}

/**
 * Countdown parts between now and a target. Clamped at zero — never negative.
 * @param {number} targetMs - Future timestamp in milliseconds.
 * @param {number} [nowMs=Date.now()]
 * @returns {{ days: number, hours: number, minutes: number, seconds: number, totalSeconds: number }}
 */
export function getCountdownParts(targetMs, nowMs = Date.now()) {
  const totalSeconds = Math.max(0, Math.floor((targetMs - nowMs) / 1000))
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return { days, hours, minutes, seconds, totalSeconds }
}

/**
 * Whole days remaining until an upcoming exact-day release/air date.
 * Both endpoints are local midnights (see getDateSortKey), so the count
 * cannot shift with time zones and no exact time is ever fabricated.
 * Returns null unless the item has a valid future exact date — callers
 * render nothing in that case (past, unknown, partial, and invalid dates
 * never show a countdown).
 * @param {Title} item
 * @param {number} [nowMs=Date.now()]
 * @returns {number | null}
 */
export function getDaysRemaining(item, nowMs = Date.now()) {
  if (getDateStatus(item, nowMs) !== 'upcoming') return null
  const sortKey = getDateSortKey(item)
  if (sortKey === null) return null
  const today = new Date(nowMs)
  today.setHours(0, 0, 0, 0)
  const days = Math.ceil((sortKey - today.getTime()) / 86400000)
  return days > 0 ? days : null
}

/** 'Movie' or 'TV Show'. @param {Title} item */
export function getMediaTypeLabel(item) {
  return item.mediaType === 'movie' ? 'Movie' : 'TV Show'
}

/**
 * Rating formatted to one decimal (e.g. '7.8'), or null when unavailable.
 * @param {Title} item
 * @returns {string | null}
 */
export function formatRating(item) {
  return typeof item.rating === 'number' ? item.rating.toFixed(1) : null
}

/**
 * Provenance of an item's rating for display labels. TMDB-backed ids carry
 * genuine live vote averages; bundled catalog entries carry local sample
 * data. Returns null when there is no rating to label.
 * @param {Title} item
 * @returns {'tmdb' | 'local' | null}
 */
export function getRatingSource(item) {
  if (typeof item?.rating !== 'number') return null
  return typeof item.id === 'string' && item.id.startsWith('tmdb-') ? 'tmdb' : 'local'
}
