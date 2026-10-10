import { useCallback, useEffect, useState } from 'react'
import { isAuthConfigured } from './appConfig.js'
import { getSupabaseClient } from './supabaseClient.js'

function friendlyError(error) {
  const message = String(error?.message || '')
  if (/invalid login credentials/i.test(message)) return 'Email or password is incorrect.'
  if (/already registered|already exists|duplicate/i.test(message)) return 'This email is already registered. Try signing in.'
  if (/password/i.test(message) && /weak|short|length|6/i.test(message)) return 'Password must be at least 6 characters.'
  if (/email/i.test(message) && /invalid/i.test(message)) return 'Enter a valid email address.'
  if (/network|fetch|failed/i.test(message)) return 'Network error. Check your connection and try again.'
  return message || 'Something went wrong. Try again.'
}

/**
 * Supabase Auth state. Own once (in App) and pass down.
 * When auth is unconfigured (no VITE_ keys), everything is a safe no-op and
 * `configured` is false — the app stays fully usable offline.
 */
export default function useAuth() {
  const [configured] = useState(() => isAuthConfigured())
  const [user, setUser] = useState(null)
  // Unconfigured installs are usable from first paint; configured installs
  // resolve the session asynchronously below.
  const [loaded, setLoaded] = useState(() => !isAuthConfigured())
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!configured) return undefined
    let active = true
    let unsubscribe = null
    getSupabaseClient().then((client) => {
      if (!active) return
      if (!client) {
        setLoaded(true)
        return
      }
      client.auth.getSession().then(({ data }) => {
        if (active) {
          setUser(data?.session?.user ?? null)
          setLoaded(true)
        }
      })
      const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
        if (active) setUser(session?.user ?? null)
      })
      unsubscribe = () => listener?.subscription?.unsubscribe()
    })
    return () => {
      active = false
      if (unsubscribe) unsubscribe()
    }
  }, [configured])

  const run = useCallback(
    async (action) => {
      if (!configured) {
        setError('Sign-in is not configured on this install.')
        return { ok: false }
      }
      setPending(true)
      setError(null)
      try {
        const client = await getSupabaseClient()
        const { error: authError, confirmationPending } = await action(client)
        if (authError) {
          setError(friendlyError(authError))
          return { ok: false }
        }
        // Only sign-up sets this; sign-in/out actions leave it undefined.
        return { ok: true, confirmationPending: confirmationPending === true }
      } catch (err) {
        setError(friendlyError(err))
        return { ok: false }
      } finally {
        setPending(false)
      }
    },
    [configured],
  )

  const signUp = useCallback(
    (email, password) =>
      run(async (client) => {
        const result = await client.auth.signUp({ email, password })
        // Supabase returns no session when email confirmation is pending.
        // Surface that distinction so the UI can say "check your inbox".
        return {
          error: result.error,
          confirmationPending: !result.error && !result.data?.session,
        }
      }),
    [run],
  );
  const signIn = useCallback(
    (email, password) => run((client) => client.auth.signInWithPassword({ email, password })),
    [run],
  )
  const signOut = useCallback(() => run((client) => client.auth.signOut()), [run])
  const requestPasswordReset = useCallback(
    (email) =>
      run((client) =>
        client.auth.resetPasswordForEmail(email, {
          // Dynamic origin: works for localhost dev and any deployed host
          // without hardcoding URLs. Each origin must be allowlisted in
          // Supabase Auth → URL Configuration → Redirect URLs.
          redirectTo: `${window.location.origin}/`,
        }),
      ),
    [run],
  )
  const updatePassword = useCallback(
    (password) => run((client) => client.auth.updateUser({ password })),
    [run],
  )
  const clearError = useCallback(() => setError(null), [])

  return { configured, user, loaded, pending, error, clearError, signUp, signIn, signOut, requestPasswordReset, updatePassword }
}
