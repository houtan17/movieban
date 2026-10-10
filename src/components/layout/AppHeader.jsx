import { useState } from 'react'
import { Menu, User, X } from 'lucide-react'
import { NAVIGATION, APP_LOGO_ICON } from '../../config/navigation.js'
import { APP_NAME } from '../../lib/constants.js'
import NavLink from './NavLink.jsx'
import ThemeToggle from './ThemeToggle.jsx'

export default function AppHeader({ activeHref = '#/', theme = 'light', onToggleTheme = () => {} }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const LogoIcon = APP_LOGO_ICON

  return (
    <header className="glass sticky top-0 z-10">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#/" className="flex items-center gap-2" aria-label={`${APP_NAME} home`}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
            <LogoIcon size={20} strokeWidth={2} aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-tight">{APP_NAME}</span>
        </a>

        {/* Desktop navigation */}
        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAVIGATION.map((item) => (
            <NavLink
              key={item.label}
              item={item}
              active={!item.upcoming && item.matchHref === activeHref}
            />
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <a
            href="#/account"
            aria-label="Account and sign-in"
            title="Account and sign-in"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-900/5 dark:text-slate-200 dark:hover:bg-white/10"
          >
            <User size={22} aria-hidden="true" />
          </a>
          {/* Mobile menu toggle */}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-900/5 md:hidden dark:text-slate-200 dark:hover:bg-white/10"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      {menuOpen && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-white/20 px-4 py-3 md:hidden">
          <ul className="flex flex-col gap-1">
            {NAVIGATION.map((item) => (
              <li key={item.label}>
                <NavLink
                  item={item}
                  active={!item.upcoming && item.matchHref === activeHref}
                  onNavigate={item.upcoming ? undefined : () => setMenuOpen(false)}
                />
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
