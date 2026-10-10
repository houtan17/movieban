# Movieban (V1)

Personal movie companion. Browse a local catalog of movies and TV shows,
track upcoming release dates with live countdowns, and keep a watchlist.
Fully usable offline after the first visit. No accounts, no backend.

Stack: React + JavaScript (Vite), Tailwind CSS, Lucide icons.

## Setup (Windows 11)

Requires Node.js 20+.

```powershell
cd E:\programing\movieban
npm install
```

## Commands

```powershell
npm run dev      # local dev server with hot reload
npm run lint     # oxlint, must report 0 warnings and 0 errors
npm run test     # headless checks: catalog, dates/countdowns, watchlist storage, PWA/offline
npm run build    # production build into dist/
npm run preview  # serve the production build locally (http://localhost:4173/)
```

> Opening `index.html` directly from the folder (double-click) is not
> supported and shows an explanatory notice instead of the app: browsers
> block ES-module scripts on `file://`, and asset URLs are root-absolute.
> Always run the app through `npm run dev` or `npm run preview`.

## PWA testing

The app is installable: web manifest, icons (192/512 + maskable + Apple
touch), and a service worker (`public/sw.js`) precaching the app shell,
posters, and icons. The worker is registered only in production builds.

Manual browser checks (not covered by `npm run test`):

1. `npm run build`, then `npm run preview`.
2. Open DevTools → Application → Manifest: no errors, icons listed,
   display `standalone`, theme color shown.
3. Install the app (address-bar install icon or DevTools → "Install").
4. With the app open, go offline (DevTools → Network → Offline, or stop
   the server) and reload: Home search/filter, details pages, Upcoming
   countdowns, and the Watchlist must all keep working.
5. Rebuild and reload online: the versioned cache (`movieban-shell-v3`)
   replaces the old one on activation, so no stale assets remain.

## Offline design

- Catalog, search, dates, and countdowns are bundled local data.
- Posters are local SVGs precached by the service worker.
- The watchlist lives in `localStorage` (key `movieban:watchlist:v1`);
  corrupted or outdated entries are sanitized and repaired automatically.
- No network requests exist in `src/` — verified by `scripts/pwa-check.mjs`.

## Project layout

- `src/pages/` — Home (browse/search), Upcoming, Watchlist, Details.
- `src/components/` — layout, catalog, upcoming, watchlist, ui primitives.
- `src/services/` — `titleService.js` (catalog repository),
  `watchlistStore.js` (persistence repository, swappable for a V2 backend).
- `src/data/` — local `titles.js` dataset (V2 can add API mappers alongside).
- `src/lib/` — constants, `useNow`, `useWatchlist` hooks.
- `scripts/` — `generate-icons.mjs`, `phase2/3/4-check.mjs`, `pwa-check.mjs`.

## Versioning

- V1 stable offline baseline: `1.0.0` (`package.json` is the source of truth).
- SemVer going forward; bump once per release, never during development.
- Service-worker cache names track releases so updates never serve stale assets.
- Online-transition proposal: `docs/online-foundation-plan.md` (hosting:
  Cloudflare Workers + Hono approved; auth: email/password approved).

## Online mode (Phase 8 — works offline without it)

The UI runs fully offline by default. To enable sign-in, cloud watchlist
sync, and TMDB-backed results:

1. Complete the backend setup in `worker/README.md` (Supabase project,
   both migrations, `wrangler secret put` for the 3 server secrets, deploy).
2. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL`,
   `VITE_SUPABASE_ANON_KEY` (publishable only), and `VITE_API_URL`
   (local dev: your worker URL, e.g. `http://localhost:8787`; production:
   leave empty for same-origin `/api`).
3. Run the worker locally (`npm run dev` in `worker/`, `CLIENT_ORIGIN`
   must include the frontend origin) alongside `npm run dev` here.

Without these values the account page explains online mode is
unconfigured, and every feature keeps working on local data.

Supabase dashboard prerequisites for auth emails (confirmation +
password reset): Auth → URL Configuration must allowlist every origin
the app runs on, each with a trailing slash — e.g. `http://localhost:5173/`
for `npm run dev` and your production origin later. The app sends
`redirectTo: <current-origin>/`, so unlisted origins will have their
auth emails rejected by Supabase.

## Online backend (Phase 7+)

- `worker/` — Hono API on Cloudflare Workers (health, TMDB proxy,
  authenticated watchlist). See `worker/README.md`.
- `supabase/migrations/` — watchlist schema + RLS. Apply manually.
- The UI still uses local data only; no secrets exist in this repo.
