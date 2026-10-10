import { getApiBaseUrl } from '../lib/appConfig.js'
import { ApiError, createApiClient } from './apiClient.js'

/**
 * Remote catalog through the movieban-api worker (TMDB-backed).
 * Throws ApiError on failure — callers fall back to the local dataset.
 * Local shape validation: only accept items that look like Titles.
 */
function client() {
  return createApiClient({ baseUrl: getApiBaseUrl() })
}

function isTitleLike(item) {
  return (
    item &&
    typeof item.id === 'string' &&
    (item.mediaType === 'movie' || item.mediaType === 'tv') &&
    typeof item.title === 'string'
  )
}

/**
 * Online search. Returns null when the backend is unreachable so callers
 * can silently keep local results (offline-first).
 */
export async function searchCatalogOnline(query, mediaType = 'all', { signal } = {}) {
  if (signal?.aborted) return null
  const kinds = mediaType === 'all' ? ['movie', 'tv'] : [mediaType]
  try {
    const settled = await Promise.all(
      kinds.map((kind) =>
        client()
          .get(`/api/tmdb/search?query=${encodeURIComponent(query)}&type=${kind}`)
          .then((data) => ({
            ok: true,
            items: Array.isArray(data?.results) ? data.results.filter(isTitleLike) : [],
          }))
          .catch(() => ({ ok: false, items: [] })),
      ),
    )
    const merged = settled.flatMap((entry) => entry.items)
    // Every kind failed (offline, down): signal it so callers keep local results
    // and can say why, instead of showing a misleading empty online section.
    if (merged.length === 0 && settled.some((entry) => !entry.ok)) return null
    return merged
  } catch (err) {
    if (err instanceof ApiError) return null
    return null
  }
}

/** Online details for TMDB-backed ids (`tmdb-*`). Null when unavailable. */
export async function getTitleOnline(id) {
  const match = typeof id === 'string' && id.match(/^tmdb-(movie|tv)-(\d+)$/)
  if (!match) return null
  try {
    const data = await client().get(`/api/tmdb/${match[1]}/${match[2]}`)
    return isTitleLike(data?.item) ? data.item : null
  } catch {
    return null
  }
}

const LIST_TTL_MS = 15 * 60 * 1000
const listCache = new Map()
const listInflight = new Map()

/**
 * Cached list fetch with in-flight deduplication: concurrent callers share
 * one request, and successes are reused for 15 minutes so remounts and
 * retries never fan out into duplicate API calls. Resolves null when the
 * backend is unreachable or yields no usable items — callers fall back
 * to the local dataset.
 */
async function fetchCachedList(key, loader, { signal } = {}) {
  if (signal?.aborted) return null
  const cached = listCache.get(key)
  if (cached && cached.expires > Date.now()) return cached.items
  if (listInflight.has(key)) return listInflight.get(key)
  const pending = (async () => {
    try {
      const items = await loader()
      if (items.length === 0) return null
      listCache.set(key, { expires: Date.now() + LIST_TTL_MS, items })
      return items
    } catch {
      return null
    } finally {
      listInflight.delete(key)
    }
  })()
  listInflight.set(key, pending)
  return pending
}

async function fetchTitleList(path) {
  const data = await client().get(path)
  return Array.isArray(data?.results) ? data.results.filter(isTitleLike) : []
}

/** Merge lists without duplicating ids (first occurrence wins). */
export function mergeUnique(existing, incoming) {
  const seen = new Set(existing.map((item) => item.id))
  return [...existing, ...incoming.filter((item) => !seen.has(item.id))]
}

const MAX_CACHED_PAGES = 200

function rememberPage(key, value) {
  if (listCache.size >= MAX_CACHED_PAGES) {
    const oldest = listCache.keys().next()
    if (!oldest.done) listCache.delete(oldest.value)
  }
  listCache.set(key, { expires: Date.now() + LIST_TTL_MS, items: value })
}

/**
 * One page of a remote list endpoint. Returns `{ items, totalPages }` —
 * `items` may be legitimately empty at the end of a catalog. Returns null
 * only when the backend is unreachable or the response is unusable, so
 * callers can tell "no more results" apart from failure.
 * Successful pages are cached (bounded) and shared between concurrent
 * callers, so Load More never refetches a page it already holds.
 */
export async function fetchListPage(path, { signal } = {}) {
  if (signal?.aborted) return null
  const cached = listCache.get(path)
  if (cached && cached.expires > Date.now()) return cached.items
  if (listInflight.has(path)) return listInflight.get(path)
  const pending = (async () => {
    try {
      const data = await client().get(path)
      if (!Array.isArray(data?.results)) return null
      const page = {
        items: data.results.filter(isTitleLike),
        totalPages:
          Number.isInteger(data?.totalPages) && data.totalPages > 0 ? data.totalPages : 1,
      }
      rememberPage(path, page)
      return page
    } catch {
      return null
    } finally {
      listInflight.delete(path)
    }
  })()
  listInflight.set(path, pending)
  return pending
}

/** Paged online search. `mediaType: 'all'` merges both kinds, movies first. */
export async function fetchSearchPage(query, mediaType = 'all', page = 1, { signal } = {}) {
  const kinds = mediaType === 'all' ? ['movie', 'tv'] : [mediaType]
  if (!kinds.every((kind) => kind === 'movie' || kind === 'tv')) return null
  if (!Number.isInteger(page) || page < 1) return null
  const pages = await Promise.all(
    kinds.map((kind) =>
      fetchListPage(`/api/tmdb/search?query=${encodeURIComponent(query)}&type=${kind}&page=${page}`, { signal }),
    ),
  )
  const usable = pages.filter((entry) => entry !== null)
  if (usable.length === 0) return null
  return {
    items: mergeUnique(usable[0].items, usable[1]?.items ?? []),
    totalPages: Math.max(...usable.map((entry) => entry.totalPages)),
  }
}

/** Paged daily trending for one media type. */
export async function fetchTrendingPage(kind, page = 1, { signal } = {}) {
  if (kind !== 'movie' && kind !== 'tv') return null
  if (!Number.isInteger(page) || page < 1) return null
  return fetchListPage(`/api/tmdb/trending?type=${kind}&page=${page}`, { signal })
}

/** Paged upcoming releases for one media type. */
export async function fetchUpcomingPage(kind, page = 1, { signal } = {}) {
  if (kind !== 'movie' && kind !== 'tv') return null
  if (!Number.isInteger(page) || page < 1) return null
  return fetchListPage(`/api/tmdb/upcoming?type=${kind}&page=${page}`, { signal })
}

/**
 * Daily trending for one media type. Returns null when the backend is
 * unreachable or yields no usable items — callers fall back to the
 * local dataset.
 */
export async function getTrendingOnline(kind, { signal } = {}) {
  if (kind !== 'movie' && kind !== 'tv') return null
  return fetchCachedList(`trending:${kind}`, () => fetchTitleList(`/api/tmdb/trending?type=${kind}`), { signal })
}

/**
 * Upcoming releases for one media type, nearest first. Same caching and
 * null-on-failure contract as trending.
 */
export async function getUpcomingOnline(kind, { signal } = {}) {
  if (kind !== 'movie' && kind !== 'tv') return null
  return fetchCachedList(`upcoming:${kind}`, () => fetchTitleList(`/api/tmdb/upcoming?type=${kind}`), { signal })
}

/** For tests: drop cached and in-flight list state. */
export function clearTrendingCacheForTests() {
  listCache.clear()
  listInflight.clear()
}
