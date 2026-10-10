const OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'movie', label: 'Movies' },
  { value: 'tv', label: 'TV Shows' },
]

export default function MediaTypeFilter({ value, onChange }) {
  return (
    <div role="group" aria-label="Filter by type" className="flex gap-2">
      {OPTIONS.map((option) => {
        const active = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={[
              'rounded-full px-4 py-1.5 text-sm font-medium',
              active
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'glass text-slate-600 hover:bg-white/80 dark:text-slate-300',
            ].join(' ')}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
