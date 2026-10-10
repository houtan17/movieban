import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'movieban-theme'

/** Pure resolution (unit-testable): stored choice wins, else OS preference. */
export function resolveInitialTheme(stored, prefersDark) {
  if (stored === 'light' || stored === 'dark') return stored
  return prefersDark ? 'dark' : 'light'
}

function readStored() {
  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function prefersDarkOS() {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return false
  }
}

function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.style.colorScheme = theme
}

/**
 * Manual light/dark theme with persistence. Defaults to the OS setting on
 * first visit; the choice survives reloads. An inline script in index.html
 * applies the same resolution pre-paint to avoid flashing the wrong theme.
 */
export default function useTheme() {
  const [theme, setTheme] = useState(() => resolveInitialTheme(readStored(), prefersDarkOS()))

  useEffect(() => {
    applyTheme(theme)
    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Private mode etc: theme still applies for this session.
    }
  }, [theme])

  const toggle = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggle }
}
