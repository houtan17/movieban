/**
 * Supabase auth-callback helpers.
 *
 * Supabase returns email-confirmation and password-recovery sessions by
 * redirecting to `origin + '/'`, appending tokens to the URL hash, e.g.
 * `#access_token=…&refresh_token=…&type=recovery`. This app uses hash
 * routing, so the router treats such hashes as first-class routes (see
 * App.jsx) instead of dropping them. supabase-js itself (`detectSessionInUrl`,
 * default on) consumes the same hash to establish the session.
 */

/** Token type carried by a Supabase auth callback hash, or null. */
export function getCallbackType(hash) {
  if (typeof hash !== 'string') return null
  const match = hash.match(/(?:^|[#&])type=([A-Za-z_]+)/)
  return match ? match[1] : null
}

/**
 * Parse a Supabase auth callback hash.
 * @returns {{ accessToken: string, refreshToken: string, type: string } | null}
 */
export function parseAuthCallback(hash) {
  if (typeof hash !== 'string' || !hash) return null
  const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash)
  const accessToken = params.get('access_token')
  const refreshToken = params.get('refresh_token')
  const type = params.get('type')
  if (!accessToken || !refreshToken || !type) return null
  return { accessToken, refreshToken, type }
}

/** True when the hash is a password-recovery callback needing a new password. */
export function isRecoveryCallback(hash) {
  return getCallbackType(hash) === 'recovery'
}
