import { useState } from 'react'
import { LogIn, LogOut, UserPlus } from 'lucide-react'
import PasswordField from '../components/auth/PasswordField.jsx'

/**
 * Sign-up / sign-in / sign-out. Rendered on the #/account route.
 * When auth is unconfigured, explains that the app works offline instead.
 */
export default function AccountPage({ auth, recovery = false }) {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [notice, setNotice] = useState(null)
  const [forgotMode, setForgotMode] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [recoveryDone, setRecoveryDone] = useState(false)
  const [recoveryMismatch, setRecoveryMismatch] = useState(false)

  if (!auth.configured) {
    return (
      <div className="flex flex-col gap-6">
        <section className="glass rounded-2xl p-6 sm:p-8" aria-labelledby="account-heading">
          <h1 id="account-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
            Account
          </h1>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
            Online sign-in is not configured on this install. Connect the
            backend configuration to enable accounts and watchlist sync.
          </p>
        </section>
      </div>
    )
  }

  if (auth.loaded && auth.user) {
    return (
      <div className="flex flex-col gap-6">
        <section className="glass rounded-2xl p-6 sm:p-8" aria-labelledby="account-heading">
          <h1 id="account-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
            Account
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Signed in as <strong>{auth.user.email}</strong>. Your watchlist
            syncs to your account when you are online; it always stays on
            this device too.
          </p>
          <button
            type="button"
            onClick={auth.signOut}
            disabled={auth.pending}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-slate-900"
          >
            <LogOut size={16} aria-hidden="true" />
            {auth.pending ? 'Signing out…' : 'Sign out'}
          </button>
          {auth.error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
              {auth.error}
            </p>
          )}
        </section>
      </div>
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setNotice(null)
    if (mode === 'signin') {
      await auth.signIn(email.trim(), password)
      return
    }
    const result = await auth.signUp(email.trim(), password)
    if (result.ok && result.confirmationPending) {
      setNotice(
        'Account created. Check your inbox for a confirmation email — you can sign in after confirming.',
      )
    }
  }

  async function handleForgotSubmit(event) {
    event.preventDefault()
    setNotice(null)
    const result = await auth.requestPasswordReset(email.trim())
    if (result.ok) {
      // Neutral wording: never reveal whether the email is registered.
      setNotice('If an account exists for that email, a reset link is on its way.')
    }
  }

  async function handleRecoverySubmit(event) {
    event.preventDefault()
    setNotice(null)
    if (newPassword !== confirmPassword) {
      setNotice(null)
      auth.clearError()
      setRecoveryMismatch(true)
      return
    }
    setRecoveryMismatch(false)
    const result = await auth.updatePassword(newPassword)
    if (result.ok) {
      setRecoveryDone(true)
      // Drop the single-use tokens from the URL without reloading.
      window.history.replaceState(null, '', '#/account')
    }
  }

  if (recovery) {
    return (
      <div className="flex flex-col gap-6">
        <section className="glass rounded-2xl p-6 sm:p-8" aria-labelledby="recovery-heading">
          <h1 id="recovery-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
            Choose a new password
          </h1>
          {recoveryDone ? (
            <div>
              <p className="mt-2 text-sm text-slate-600 sm:text-base dark:text-slate-300">
                Password updated. You are signed in — your watchlist is syncing.
              </p>
              <a
                href="#/"
                className="mt-4 inline-block rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-900"
              >
                Back to browse
              </a>
            </div>
          ) : !auth.loaded ? (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300" role="status">
              Verifying your reset link…
            </p>
          ) : !auth.user ? (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300" role="alert">
              This reset link is invalid or has expired. Request a new one from the sign-in page.
            </p>
          ) : (
            <form onSubmit={handleRecoverySubmit} className="mt-4 flex max-w-sm flex-col gap-3">
              <div>
                <PasswordField
                  id="recovery-password"
                  label="New password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
              </div>
              <div>
                <PasswordField
                  id="recovery-confirm"
                  label="Confirm new password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </div>
              {recoveryMismatch && (
                <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                  Passwords do not match.
                </p>
              )}
              {auth.error && (
                <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                  {auth.error}
                </p>
              )}
              <button
                type="submit"
                disabled={auth.pending}
                className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-slate-900"
              >
                {auth.pending ? 'Please wait…' : 'Update password'}
              </button>
            </form>
          )}
          {notice && <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{notice}</p>}
        </section>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="glass rounded-2xl p-6 sm:p-8" aria-labelledby="account-heading">
        <h1 id="account-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
          {mode === 'signin' ? 'Sign in' : 'Create account'}
        </h1>
        <p className="mt-2 max-w-prose text-sm text-slate-600 sm:text-base dark:text-slate-300">
          Sync your watchlist across devices. Your saved titles stay on this
          device regardless.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 flex max-w-sm flex-col gap-3">
          <div>
            <label htmlFor="account-email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="account-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="glass w-full rounded-xl px-3 py-2 text-sm outline-none"
            />
          </div>
          <div>
            <PasswordField
              id="account-password"
              label="Password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          {auth.error && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {auth.error}
            </p>
          )}
          {notice && (
            <p className="text-sm text-slate-600 dark:text-slate-300" role="status">
              {notice}
            </p>
          )}
          <button
            type="submit"
            disabled={auth.pending}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-slate-900"
          >
            {mode === 'signin' ? <LogIn size={16} aria-hidden="true" /> : <UserPlus size={16} aria-hidden="true" />}
            {auth.pending ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        {mode === 'signin' && (
          <div className="mt-3">
            {!forgotMode ? (
              <button
                type="button"
                onClick={() => {
                  setForgotMode(true)
                  auth.clearError()
                }}
                className="text-sm font-medium underline underline-offset-2"
              >
                Forgot your password?
              </button>
            ) : (
              <form onSubmit={handleForgotSubmit} className="flex max-w-sm flex-col gap-2">
                <label htmlFor="forgot-email" className="text-sm font-medium">
                  Email for the reset link
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="glass w-full rounded-xl px-3 py-2 text-sm outline-none"
                />
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={auth.pending}
                    className="inline-flex w-fit items-center rounded-full bg-slate-900 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-slate-900"
                  >
                    {auth.pending ? 'Please wait…' : 'Send reset link'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotMode(false)
                      auth.clearError()
                    }}
                    className="text-sm font-medium underline underline-offset-2"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin')
            setForgotMode(false)
            setNotice(null)
            auth.clearError()
          }}
          className="mt-3 text-sm font-medium underline underline-offset-2"
        >
          {mode === 'signin' ? 'Need an account? Create one' : 'Have an account? Sign in'}
        </button>
      </section>
    </div>
  )
}
