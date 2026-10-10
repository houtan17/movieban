# Online Foundation Plan (V2 preparation)

Status: **approved stack changed in Phase 7 to Cloudflare Workers + Hono
(frontend hosting TBD), Supabase PG + Auth (email/password), TMDB, GitHub.
This supersedes the Phase 6 Option A (Vercel + Express) recommendation.
Backend foundation implemented in `worker/` + `supabase/migrations/`;
no implementation yet.**
Baseline: V1 `1.0.0` (stable offline release). This plan changes no runtime code.

## 1. Versioning approach

- `package.json` `version` is the single source of truth. Current: `1.0.0`.
- Follow SemVer: patch = fixes, minor = backward-compatible features,
  major = breaking changes (e.g. dropping the offline-only mode).
- Do not bump the version during development; bump once per release.
- Service-worker cache names track releases (`movieban-shell-vN` →
  `movieban-<semver>` from the next release) so clients never serve stale
  assets after an update. The web manifest has no version field.

## 2. Minimal online architecture (proposed: Option A)

```
Browser (unchanged React UI)
  │  HTTPS, same origin (/api/*)
  ▼
Express API (Node.js) — thin backend, no secrets in the bundle
  ├─ /api/tmdb/*   → TMDB provider (server-side key, attribution, ~40 r/s guard)
  ├─ /api/watchlist → Supabase Postgres via service-role key (server only)
  └─ JWT verification on every user-scoped request
        ▼
Supabase: Postgres (RLS) + Auth (50k MAU free)
```

Boundaries:

- **Frontend** — UI only. `titleService.js` keeps its signatures; its
  internals switch from `TITLES` to an `apiClient.js` (fetch `/api/*`).
  `watchlistStore.js` keeps its signatures; internals switch from
  `localStorage` to authenticated `/api/watchlist` calls with the local
  list as offline fallback/queue.
- **Backend** — Express routes: TMDB proxy (search, details), watchlist
  CRUD. Input validation on every route; CORS allowlist = app origin only.
- **Auth** — Supabase Auth (email/password; OAuth optional). Client holds
  the user JWT (`anon` key only in the bundle) and sends it as
  `Authorization: Bearer`. Server verifies the JWT and derives `user_id`
  from the token — never from client-supplied parameters.
- **Database** — Supabase Postgres with Row Level Security; owner-only
  policies on user rows.
- **Movie data** — TMDB v3 (free non-commercial key, server-side only).
  Local `TITLES` dataset stays as offline fallback and seed data.

Hosting (verified free tiers, Oct 2026):

- **Option A (recommended):** frontend + Express on **Vercel Hobby**
  (Express runs as a single Function, zero config; free for personal
  non-commercial use) + **Supabase free** (PG + Auth).
- **Option B:** Express on **Render free** (750 hrs/mo, sleeps after
  15 min idle, ~1 min wake) + Supabase free. Extra moving part and
  wake latency; use only if serverless limits bite.
- Rejected for free tier: Fly.io (no free allowance since Oct 2024),
  Railway ($5 trial then ~$1/mo credit), Render free Postgres (expires
  after 30 days — Supabase covers Postgres instead).

Verified limits constraining the design: Supabase free = 2 projects,
500 MB DB, 5 GB egress/mo, 50k MAU, 7-day-inactivity pause (10–30 s
cold start), no auto backups; TMDB free = non-commercial, ~40 req/s
per IP, attribution required, 6-month cache cap, commercial use needs a
written agreement.

## 3. Database schema (proposed)

```sql
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz default now()
);

create table user_watchlist (
  user_id uuid references profiles (id) on delete cascade,
  title_id text not null,          -- TMDB-backed id once online (see migration)
  media_type text not null check (media_type in ('movie', 'tv')),
  added_at timestamptz default now(),
  primary key (user_id, title_id)
);

alter table user_watchlist enable row level security;
create policy "owner only" on user_watchlist
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

RLS on `profiles` likewise (users read/insert own row only).

## 4. Authentication flow (proposed)

1. User signs in via Supabase Auth (client, `anon` key).
2. Client stores the session JWT, sends `Authorization: Bearer <jwt>`.
3. Express middleware verifies the JWT (Supabase JWKS) → `req.userId`.
4. Watchlist routes operate strictly on `req.userId`; any `userId` in the
   request body/query is ignored (never trust client-supplied ids).
5. TMDB routes need no user session but stay server-side so the API key
   never reaches the browser.

## 5. Migration of local data and Watchlist

- Local `TITLES` (fictional demo ids like `m-salt-meridian`) do **not**
  map to TMDB ids. On first login, offer a one-time import: union local
  ids into `user_watchlist` flagged `source = 'local'`; unmatched ids
  remain usable offline but are hidden from cloud views until remapped.
  (Requires a `source` column or a remap table — decision point.)
- Until login, the app behaves exactly as V1 (localStorage watchlist).
- TMDB responses mapped into the existing `Title` shape
  (`titleService` mappers); date precision rules from Phase 3 apply
  (exact/month/year/unknown — never invent).

## 6. Environment variables and secrets

Server-only (never `VITE_*`, never in the bundle, never committed):
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `TMDB_API_KEY`,
`CLIENT_ORIGIN`, `PORT`.

Client-safe (`VITE_*`, publishable): `VITE_SUPABASE_URL`,
`VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`.

Rules: `.env` files git-ignored; CI/hosting dashboards hold production
values; service-role key used only in Express; rotate on any suspected
exposure; validate all inputs server-side (ids, enums, lengths) before
touching the DB or TMDB.

## 7. Existing files that would need modification (V2, after approval)

- `src/services/titleService.js` — swap internals to `apiClient`
  (signatures unchanged).
- `src/services/watchlistStore.js` — swap internals to authenticated
  API calls (signatures unchanged); localStorage becomes offline cache.
- `src/data/titles.js` — retained as offline fallback/seed (no deletion).
- `src/lib/useWatchlist.js` — add signed-in state handling (no API change).
- `index.html` — no change expected. `public/sw.js` — cache-name bump
  per release only. `package.json` — add `express`, `@supabase/supabase-js`
  (server), `cors` (or equivalent); version bump at release time only.
- New (after approval): `server/` (Express app, routes, auth middleware,
  TMDB provider), `.env.example` (names only), Supabase migration SQL.

## 8. Decisions requiring approval (not decided here)

1. Hosting: Option A (Vercel + Supabase) vs B (Render + Supabase).
2. Auth providers: email/password only, or also Google OAuth?
3. Local-id remap strategy for first-login watchlist import.
4. Confirmation the app qualifies as TMDB non-commercial use.
5. Who creates the Supabase project/TMDB key and where secrets live.
