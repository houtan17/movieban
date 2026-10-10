import { getSupabaseConfig, isAuthConfigured } from './appConfig.js'

let clientPromise = null

/**
 * Lazily create the Supabase browser client. Dynamic import keeps
 * @supabase/supabase-js out of the initial bundle, so unconfigured/offline
 * users never download it. Returns null when online auth is unconfigured.
 */
export function getSupabaseClient() {
  if (!isAuthConfigured()) return Promise.resolve(null)
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) => {
      const { url, anonKey } = getSupabaseConfig()
      return createClient(url, anonKey)
    })
  }
  return clientPromise
}

/** For tests: drop the cached client. */
export function resetSupabaseClientForTests() {
  clientPromise = null
}
