/**
 * Renders one navigation link.
 * Upcoming pages render as disabled placeholders (aria-disabled + tooltip).
 * Active state is driven by `active` (derived from the current route).
 */
export default function NavLink({ item, active, onNavigate }) {
  const Icon = item.icon

  const className = [
    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium',
    active
      ? 'bg-slate-900/5 text-slate-900 dark:bg-white/10 dark:text-white'
      : 'text-slate-600 hover:bg-slate-900/5 dark:text-slate-300 dark:hover:bg-white/5',
  ].join(' ')

  if (item.upcoming) {
    return (
      <span
        className={`${className} cursor-not-allowed opacity-60`}
        aria-disabled="true"
        title={`${item.label} — coming soon`}
      >
        <Icon size={18} strokeWidth={2} aria-hidden="true" />
        {item.label}
      </span>
    )
  }

  return (
    <a href={item.href} className={className} aria-current={active ? 'page' : undefined} onClick={onNavigate}>
      <Icon size={18} strokeWidth={2} aria-hidden="true" />
      {item.label}
    </a>
  )
}
