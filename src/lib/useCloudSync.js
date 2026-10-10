import { useEffect, useRef } from 'react'
import { getTitleById } from '../services/titleService.js'
import { createCloudWatchlist } from '../services/cloudWatchlist.js'
import { loadWatchlist, saveTitle } from '../services/watchlistStore.js'

function mediaTypeOf(id) {
  const local = getTitleById(id)
  if (local) return local.mediaType
  const match = typeof id === 'string' && id.match(/^tmdb-(movie|tv)-\d+$/)
  return match ? match[1] : null
}

/**
 * Two-way cloud sync. Local storage stays authoritative for rendering
 * (instant + offline); the cloud mirrors it when signed in and reachable.
 * Merge is union-only on sign-in: local ids upload, cloud ids download.
 * Nothing is ever deleted by sync — removal only happens via explicit
 * user action (which then mirrors to the cloud best-effort).
 */
export default function useCloudSync({ user, getToken, watchlist }) {
  const lastSynced = useRef(null)

  // Initial merge on sign-in. Set-based reconciliation so mid-merge user
  // edits converge instead of diverging:
  // - ids in the final local list but not remote are uploaded,
  // - remote ids never seen locally are downloaded,
  // - remote ids the user removed mid-merge are deleted from the cloud.
  // lastSynced tracks only ids confirmed on both sides, so interrupted
  // uploads retry on the next change instead of going silent.
  useEffect(() => {
    if (!user || !getToken) {
      lastSynced.current = null
      return undefined
    }
    let cancelled = false
    const cloud = createCloudWatchlist({ getToken })
    cloud
      .list()
      .then(async (remote) => {
        if (cancelled) return
        const remoteIds = remote.map((entry) => entry.title_id)
        const initialLocal = loadWatchlist().ids
        const synced = new Set(remoteIds)
        const finalLocal = () => loadWatchlist().ids
        for (const id of finalLocal()) {
          if (cancelled) return
          if (!remoteIds.includes(id)) {
            const mediaType = mediaTypeOf(id)
            if (mediaType) {
              try {
                await cloud.add(id, mediaType)
                synced.add(id)
              } catch {
                // Offline or unauthorized: local copy is preserved; retry later.
              }
            }
          }
        }
        for (const id of remoteIds) {
          if (cancelled) return
          if (!finalLocal().includes(id)) {
            if (initialLocal.includes(id)) {
              try {
                await cloud.remove(id)
                synced.delete(id)
              } catch {
                // Retry on the next change/sign-in.
              }
            } else if (!loadWatchlist().ids.includes(id)) {
              saveTitle(id)
            }
          }
        }
        if (!cancelled) lastSynced.current = finalLocal().filter((id) => synced.has(id))
      })
      .catch(() => {
        // Stay local when the backend is unreachable.
      })
    return () => {
      cancelled = true
    }
  }, [user, getToken])

  // Mirror subsequent local changes to the cloud while signed in.
  useEffect(() => {
    if (!user || !getToken || lastSynced.current === null) return undefined
    const cloud = createCloudWatchlist({ getToken })
    const previous = lastSynced.current
    const current = watchlist.ids
    const added = current.filter((id) => !previous.includes(id))
    const removed = previous.filter((id) => !current.includes(id))
    if (added.length === 0 && removed.length === 0) return undefined
    let cancelled = false
    ;(async () => {
      try {
        for (const id of added) {
          const mediaType = mediaTypeOf(id)
          if (mediaType) await cloud.add(id, mediaType)
        }
        for (const id of removed) await cloud.remove(id)
        if (!cancelled) lastSynced.current = [...current]
      } catch {
        // Keep lastSynced stale so the diff retries on the next change/sign-in.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user, getToken, watchlist.ids])
}
