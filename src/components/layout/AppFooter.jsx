export default function AppFooter() {
  return (
    <footer className="mx-auto w-full max-w-5xl px-4 pb-6 sm:px-6">
      <div className="flex flex-col items-center justify-between gap-1 sm:flex-row">
        <p className="text-xs text-slate-500 dark:text-slate-400">v1.2.0</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Made with <span aria-hidden="true">❤️</span> for you
        </p>
      </div>
    </footer>
  )
}
