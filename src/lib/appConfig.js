/**
 * Public runtime config. Reads Vite env safely (works outside Vite too).
 * Only publishable values live here — never secrets.
 */
export function getPublicEnv() {
  const fromGlobal =
    typeof globalThis !== 'undefined' && globalThis.__MOVIEBAN_ENV__ ? globalThis.__MOVIEBAN_ENV__ : null
  let fromVite = null
  try {
    fromVite = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : null
  } catch {
    fromVite = null
  }
  return { ...(fromVite || {}), ...(fromGlobal || {}) }
}

function cleanEnv(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

/** Supabase project URL + anon key, or nulls when online mode is unconfigured. */
export function getSupabaseConfig() {
  const env = getPublicEnv()
  return {
    url: cleanEnv(env.VITE_SUPABASE_URL),
    anonKey: cleanEnv(env.VITE_SUPABASE_ANON_KEY),
  }
}

/** True when sign-in can work (both publishable values present). */
export function isAuthConfigured() {
  const { url, anonKey } = getSupabaseConfig()
  return Boolean(url && anonKey)
}

/** API base URL ('' = same origin). Always defined — the app works offline regardless. */
export function getApiBaseUrl() {
  const env = getPublicEnv()
  const raw = cleanEnv(env.VITE_API_URL) || ''
  return raw.endsWith('/') ? raw.slice(0, -1) : raw
}
