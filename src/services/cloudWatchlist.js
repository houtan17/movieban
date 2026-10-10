import { createApiClient } from './apiClient.js'
import { getApiBaseUrl } from '../lib/appConfig.js'

/**
 * Cloud watchlist through the movieban-api worker.
 * All functions need a session token supplier; they throw ApiError when
 * offline/unauthorized so callers can keep the local copy authoritative.
 */
export function createCloudWatchlist({ getToken }) {
  const api = createApiClient({ baseUrl: getApiBaseUrl(), getToken })

  return {
    /** @returns {Promise<Array<{title_id: string, media_type: string}>>} */
    async list() {
      const data = await api.get('/api/watchlist')
      const entries = Array.isArray(data?.entries) ? data.entries : []
      return entries.filter(
        (entry) =>
          typeof entry?.title_id === 'string' &&
          (entry?.media_type === 'movie' || entry?.media_type === 'tv'),
      )
    },
    async add(titleId, mediaType) {
      await api.post('/api/watchlist', { title_id: titleId, media_type: mediaType })
    },
    async remove(titleId) {
      await api.del(`/api/watchlist/${encodeURIComponent(titleId)}`)
    },
  }
}
