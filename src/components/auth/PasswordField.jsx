import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

/**
 * Password input with an accessible show/hide toggle. The toggle is a
 * plain button (never submits, never clears the field) and works with
 * keyboard and touch input like any other button.
 */
export default function PasswordField({ id, label, value, onChange, autoComplete = 'current-password' }) {
  const [visible, setVisible] = useState(false)
  const VisibleIcon = visible ? EyeOff : Eye

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          required
          minLength={6}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          className="glass w-full rounded-xl px-3 py-2 pr-11 text-sm outline-none"
        />
        <button
          type="button"
          onClick={() => setVisible((shown) => !shown)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={visible}
          title={visible ? 'Hide password' : 'Show password'}
          className="absolute right-1 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-900/5 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <VisibleIcon size={18} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
