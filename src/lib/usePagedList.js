import { useCallback, useRef, useState } from 'react'

/**
 * Page-aware remote list state shared by search results, trending rails,
 * and the Upcoming list. Statuses:
 * idle (nothing requested), loading (first page), ready (usable items),
 * loading-more (appending while items stay visible), error (failed request).
 * On failure with items already on screen the error is non-fatal: the
 * button stays so the same page can be retried.
 */
export default function usePagedList() {
  const [state, setState] = useState({ status: 'idle', items: [], page: 0, totalPages: 0 })
  const requestId = useRef(0)

  const reset = useCallback(() => {
    requestId.current += 1
    setState({ status: 'idle', items: [], page: 0, totalPages: 0 })
  }, [])

  const loadPage = useCallback((page, loader) => {
    const id = requestId.current + 1
    requestId.current = id
    setState((prev) => ({ ...prev, status: prev.items.length > 0 ? 'loading-more' : 'loading' }))
    loader(page).then((result) => {
      if (requestId.current !== id) return
      if (!result) {
        setState((prev) => ({ ...prev, status: 'error' }))
        return
      }
      setState((prev) => {
        const seen = new Set(prev.items.map((item) => item.id))
        const merged = [...prev.items, ...result.items.filter((item) => !seen.has(item.id))]
        return { status: 'ready', items: merged, page, totalPages: result.totalPages }
      })
    })
  }, [])

  const canLoadMore =
    state.page < state.totalPages &&
    (state.status === 'ready' || (state.status === 'error' && state.items.length > 0))
  const showEndNote =
    state.items.length > 0 && state.totalPages > 1 && state.page >= state.totalPages && state.status === 'ready'

  return { ...state, canLoadMore, showEndNote, loadPage, reset }
}

/**
 * Windowed view over loaded items: 20 titles initially, +20 per Load More
 * click. Pure helper so the batching contract is unit-testable.
 */
export const PAGE_WINDOW = 20

export function getVisibleWindow(items, visibleCount) {
  return {
    visible: items.slice(0, visibleCount),
    hasMoreBuffered: visibleCount < items.length,
  }
}

/** True when revealing the next window exhausts (or already exhausted) the buffer. */
export function needsMoreBuffered(visibleCount, loadedCount) {
  return visibleCount + PAGE_WINDOW >= loadedCount
}
