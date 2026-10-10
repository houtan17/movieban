# Data

Phase 2 local dataset lives here.

- `titles.js` — `TITLES` array plus the `Title` typedef (id, mediaType,
  title, overview, poster, genres, rating, releaseDate/firstAirDate,
  datePrecision). Fictional demo entries; some fields are intentionally null.
- UI must not import from `data/` directly — use `services/titleService.js`.
- V2 may add API mappers/schemas alongside without changing the `Title` shape.
