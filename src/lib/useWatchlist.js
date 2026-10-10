import { useCallback, useEffect, useState } from 'react'
import { getTitleById } from '../services/titleService.js'
import { getTitleOnline } from '../services/remoteCatalog.js'
import { loadWatchlist, removeTitle, saveTitle, subscribe } from '../services/watchlistStore.js'

const REPAIR_NOTICE = 'Some saved items could not be restored and were removed.'

/**
 * Watchlist state hook. Own once (in App) and pass down — never create
 * multiple instances per page. Storage reads are synchronous, so the list
 * is available on first paint (no artificial loading state). Handles
 * cross-tab updates, repair notices, and screen-reader announcements.
 */
export default function useWatchlist() {
  const [initial] = useState(() => loadWatchlist())
  const [ids, setIds] = useState(initial.ids)
  const [notice, setNotice] = useState(initial.repaired ? REPAIR_NOTICE : null)
  const [message, setMessage] = useState({ text: '', key: 0 })
  const [pendingIds, setPendingIds] = useState([])
  const [actionError, setActionError] = useState(null)

  useEffect(() => subscribe(setIds), [])

  const announce = useCallback((text) => {
    setMessage((prev) => ({ text, key: prev.key + 1 }))
  }, [])

  const toggle = useCallback(
    async (id) => {
      // Removal works for any saved id (including cloud ids the local
      // catalog cannot resolve). Adding resolves the title locally first,
      // then remotely, so TMDB-backed cards save exactly like local ones.
      // Cloud persistence for signed-in users happens through the
      // useCloudSync mirror, which observes these same local writes.
      setActionError(null)
      if (ids.includes(id)) {
        setPendingIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
        try {
          removeTitle(id)
          const item = getTitleById(id)
          announce(`Removed ${item ? item.title : 'title'} from your watchlist.`)
          return false
        } finally {
          setPendingIds((prev) => prev.filter((pending) => pending !== id))
        }
      }
      setPendingIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
      try {
        const item = getTitleById(id) || (await getTitleOnline(id))
        if (!item) {
          setActionError('Could not save this title. Check your connection and try again.')
          return false
        }
        saveTitle(id)
        announce(`Saved ${item.title} to your watchlist.`)
        return true
      } catch {
        setActionError('Could not save this title. Check your connection and try again.')
        return false
      } finally {
        setPendingIds((prev) => prev.filter((pending) => pending !== id))
      }
    },
    [ids, announce],
  )

  const isSaved = useCallback((id) => ids.includes(id), [ids])
  const isPending = useCallback((id) => pendingIds.includes(id), [pendingIds])
  const clearActionError = useCallback(() => setActionError(null), [])

  const dismissNotice = useCallback(() => setNotice(null), [])

  return { ids, notice, dismissNotice, message, toggle, isSaved, isPending, actionError, clearActionError }
}
