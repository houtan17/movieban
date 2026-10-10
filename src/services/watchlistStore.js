/**
 * Watchlist storage repository (Phase 4: localStorage persistence).
 *
 * UI must go through `../lib/useWatchlist.js`, never touch this module's
 * storage directly. A future cloud backend (V2) can replace this file with
 * the same function signatures without changing component code.
 *
 * Stored shape: JSON array of title-id strings under a versioned key.
 * Reads are defensive: corrupted, non-array, or outdated payloads are
 * sanitized (unknown ids dropped, duplicates removed) and repaired on write.
 */
import { getTitleById } from './titleService.js'

const STORAGE_KEY = 'movieban:watchlist:v1'

/** In-memory fallback when persistent storage is unavailable. */
let memoryIds = []

function getStorage() {
  try {
    if (typeof globalThis.localStorage !== 'undefined') return globalThis.localStorage
  } catch {
    return null
  }
  return null
}

function isKnownId(id) {
  if (typeof id !== 'string' || id.length === 0) return false
  if (getTitleById(id) !== null) return true
  // Cloud-backed TMDB ids resolve through the API worker, not the local catalog.
  return /^tmdb-(movie|tv)-\d+$/.test(id)
}

/**
 * Sanitize a raw stored value into a clean id list.
 * @param {unknown} raw
 * @returns {{ ids: string[], repaired: boolean }}
 */
function sanitize(raw) {
  if (!Array.isArray(raw)) return { ids: [], repaired: raw !== undefined && raw !== null }
  const seen = new Set()
  const ids = []
  for (const entry of raw) {
    const id = typeof entry === 'string' ? entry : entry?.id
    if (!isKnownId(id) || seen.has(id)) continue
    seen.add(id)
    ids.push(id)
  }
  return { ids, repaired: ids.length !== raw.length }
}

function persist(ids) {
  memoryIds = [...ids]
  const storage = getStorage()
  if (!storage) return false
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(ids))
    return true
  } catch {
    return false
  }
}

/**
 * Load sanitized ids. Repairs corrupted/outdated payloads on write.
 * @returns {{ ids: string[], repaired: boolean }}
 */
export function loadWatchlist() {
  const storage = getStorage()
  if (!storage) return { ids: [...memoryIds], repaired: false }
  let rawText = null
  try {
    rawText = storage.getItem(STORAGE_KEY)
  } catch {
    return { ids: [...memoryIds], repaired: false }
  }
  if (rawText === null) return { ids: [], repaired: false }
  let raw
  try {
    raw = JSON.parse(rawText)
  } catch {
    persist([])
    return { ids: [], repaired: true }
  }
  const { ids, repaired } = sanitize(raw)
  if (repaired) persist(ids)
  return { ids, repaired }
}

/** @returns {string[]} Sanitized saved ids, oldest first. */
export function getWatchlistIds() {
  return loadWatchlist().ids
}

/** @param {string} id @returns {boolean} */
export function isSaved(id) {
  return getWatchlistIds().includes(id)
}

/**
 * Save a title. Unknown ids and duplicates are ignored.
 * @param {string} id
 * @returns {boolean} True when the title is now saved.
 */
export function saveTitle(id) {
  if (!isKnownId(id)) return false
  const { ids } = loadWatchlist()
  if (ids.includes(id)) return true
  const next = [...ids, id]
  persist(next)
  notify(next)
  return true
}

/**
 * Remove a title. Unknown ids are ignored.
 * @param {string} id
 * @returns {boolean} True when the title is now absent.
 */
export function removeTitle(id) {
  if (typeof id !== 'string' || id.length === 0) return true
  const { ids } = loadWatchlist()
  if (!ids.includes(id)) return true
  const next = ids.filter((saved) => saved !== id)
  persist(next)
  notify(next)
  return true
}

/**
 * Toggle saved state.
 * @param {string} id
 * @returns {boolean} New saved state (false for invalid ids).
 */
export function toggleTitle(id) {
  if (!isKnownId(id)) return false
  if (isSaved(id)) {
    removeTitle(id)
    return false
  }
  saveTitle(id)
  return true
}

const listeners = new Set()

function notify(ids) {
  for (const listener of listeners) {
    try {
      listener([...ids])
    } catch {
      // Listener errors must not break persistence.
    }
  }
}

/**
 * Subscribe to watchlist changes (including other tabs via storage events).
 * @param {(ids: string[]) => void} listener
 * @returns {() => void} Unsubscribe function.
 */
export function subscribe(listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) {
      notify(loadWatchlist().ids)
    }
  })
}
