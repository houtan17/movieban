# Services

Repository/service layer. UI imports from here, never from `data/` directly.

- `titleService.js` — `getAllTitles`, `getTitleById`, `searchTitles`,
  plus display helpers (`getYear`, `getDisplayDate`, `getMediaTypeLabel`,
  `formatRating`). Phase 2 reads the local dataset; V2 can swap the
  implementations for an online API keeping the same signatures.
- `watchlistStore.js` — watchlist persistence behind a small repository
  interface (`loadWatchlist`, `getWatchlistIds`, `isSaved`, `saveTitle`,
  `removeTitle`, `toggleTitle`, `subscribe`). Phase 4 stores id lists in
  localStorage with sanitizing reads; V2 can swap in cloud storage keeping
  the same signatures. Components should use `lib/useWatchlist.js` instead
  of calling the store directly.
