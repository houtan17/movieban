import { Moon, Sun } from 'lucide-react'

/**
 * Light/dark theme toggle. Shows the icon of the mode switching TO
 * (sun in dark mode, moon in light mode), persisted by useTheme.
 */
export default function ThemeToggle({ theme, onToggle }) {
  const dark = theme === 'dark'
  const Icon = dark ? Sun : Moon

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={dark}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 transition-transform duration-150 hover:scale-105 hover:bg-slate-900/5 active:scale-95 dark:text-slate-200 dark:hover:bg-white/10"
    >
      <Icon size={22} strokeWidth={2} aria-hidden="true" />
    </button>
  )
}
