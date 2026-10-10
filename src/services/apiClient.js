/**
 * Minimal API client for the movieban-api worker.
 * Same-origin by default; base URL and token are injected so this stays
 * testable without network access. Timeouts keep offline use snappy.
 */
export class ApiError extends Error {
  constructor(status, code, message) {
    super(message)
    this.status = status
    this.code = code
  }
}

export function createApiClient({ baseUrl = '', getToken = null, fetchFn = fetch, timeoutMs = 8000 } = {}) {
  async function request(path, { method = 'GET', body } = {}) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const headers = { accept: 'application/json' }
      let payload
      if (body !== undefined) {
        headers['content-type'] = 'application/json'
        payload = JSON.stringify(body)
      }
      if (getToken) {
        const token = await getToken()
        if (token) headers.authorization = `Bearer ${token}`
      }
      const response = await fetchFn(`${baseUrl}${path}`, {
        method,
        headers,
        body: payload,
        signal: controller.signal,
      })
      if (response.status === 204) return null
      let data = null
      try {
        data = await response.json()
      } catch {
        data = null
      }
      if (!response.ok) {
        const code = data?.error?.code || 'request_failed'
        const message = data?.error?.message || `Request failed (${response.status}).`
        throw new ApiError(response.status, code, message)
      }
      return data
    } catch (err) {
      if (err instanceof ApiError) throw err
      if (err?.name === 'AbortError') {
        throw new ApiError(0, 'timeout', 'The request timed out. You may be offline.')
      }
      throw new ApiError(0, 'network_error', 'Network error. Check your connection.')
    } finally {
      clearTimeout(timer)
    }
  }

  return {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: 'POST', body }),
    del: (path) => request(path, { method: 'DELETE' }),
  }
}
