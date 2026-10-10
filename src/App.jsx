import { useCallback, useEffect, useState } from 'react'
import AppHeader from './components/layout/AppHeader.jsx'
import AppMain from './components/layout/AppMain.jsx'
import AppFooter from './components/layout/AppFooter.jsx'
import AccountPage from './pages/AccountPage.jsx'
import DetailsPage from './pages/DetailsPage.jsx'
import HomePage from './pages/HomePage.jsx'
import UpcomingPage from './pages/UpcomingPage.jsx'
import WatchlistPage from './pages/WatchlistPage.jsx'
import useAuth from './lib/useAuth.js'
import useCloudSync from './lib/useCloudSync.js'
import useTheme from './lib/useTheme.js'
import useWatchlist from './lib/useWatchlist.js'
import { isRecoveryCallback } from './lib/authCallback.js'
import { getSupabaseClient } from './lib/supabaseClient.js'

function parseHash() {
  const hash = window.location.hash || '#/'
  // Supabase auth callbacks (email confirmation, password recovery) land on
  // '#' + token params. supabase-js consumes the same hash to establish the
  // session; the router sends recovery flows to the account page.
  if (isRecoveryCallback(hash)) return { view: 'account', id: null, recovery: true }
  if (hash === '#/upcoming' || hash === '#/upcoming/') return { view: 'upcoming', id: null }
  if (hash === '#/watchlist' || hash === '#/watchlist/') return { view: 'watchlist', id: null }
  if (hash === '#/account' || hash === '#/account/') return { view: 'account', id: null }
  const detailsMatch = hash.match(/^#\/title\/([\w-]+)\/?$/)
  if (detailsMatch) return { view: 'details', id: decodeURIComponent(detailsMatch[1]) }
  return { view: 'home', id: null }
}

function activeHrefFor(route) {
  if (route.view === 'upcoming') return '#/upcoming'
  if (route.view === 'watchlist') return '#/watchlist'
  return '#/'
}

export default function App() {
  const [route, setRoute] = useState(() => (typeof window === 'undefined' ? { view: 'home', id: null } : parseHash()))
  const watchlist = useWatchlist()
  const auth = useAuth()
  const { theme, toggle: toggleTheme } = useTheme()

  const getToken = useCallback(async () => {
    if (!auth.user) return null
    const client = await getSupabaseClient()
    if (!client) return null
    const { data } = await client.auth.getSession()
    return data?.session?.access_token ?? null
  }, [auth.user])

  useCloudSync({ user: auth.user, getToken: auth.user ? getToken : null, watchlist })

  const handleHashChange = useCallback(() => {
    setRoute(parseHash())
    window.scrollTo({ top: 0 })
  }, [])

  useEffect(() => {
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [handleHashChange])

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>
      <AppHeader activeHref={activeHrefFor(route)} theme={theme} onToggleTheme={toggleTheme} />
      <AppMain key={route.view + (route.id ?? '')}>
        <span id="content" className="sr-only" tabIndex={-1}>
          Main content
        </span>
        {route.view === 'details' ? (
          <DetailsPage key={route.id} id={route.id} watchlist={watchlist} signedIn={Boolean(auth.user)} />
        ) : route.view === 'upcoming' ? (
          <UpcomingPage watchlist={watchlist} signedIn={Boolean(auth.user)} />
        ) : route.view === 'watchlist' ? (
          <WatchlistPage watchlist={watchlist} signedIn={Boolean(auth.user)} />
        ) : route.view === 'account' ? (
          <AccountPage key={route.recovery ? 'recovery' : 'account'} auth={auth} recovery={Boolean(route.recovery)} />
        ) : (
          <HomePage watchlist={watchlist} signedIn={Boolean(auth.user)} />
        )}
      </AppMain>
      <AppFooter />
    </div>
  )
}
