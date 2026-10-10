import { Search } from 'lucide-react'

export default function SearchBar({ value, onChange, resultCount }) {
  return (
    <div>
      <label htmlFor="title-search" className="sr-only">
        Search by title
      </label>
      <div className="glass flex items-center gap-2 rounded-xl px-3 py-2">
        <Search size={18} strokeWidth={2} aria-hidden="true" className="shrink-0 text-slate-500 dark:text-slate-400" />
        <input
          id="title-search"
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search movies and TV shows…"
          autoComplete="off"
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400" role="status" aria-live="polite">
        {resultCount === 1 ? '1 result' : `${resultCount} results`}
      </p>
    </div>
  )
}
