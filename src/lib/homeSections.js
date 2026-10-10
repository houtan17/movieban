/**
 * Homepage rail visibility derived from filter + fetch state.
 * Pure function so the default-state matrix is unit-testable without React:
 * each rail (and its retry panel) appears only for the selected media type,
 * rails keep showing while appending or after a recoverable page failure,
 * and the fallback notice appears only when no selected rail is usable.
 * Each entry: { status, count } with status in
 * idle | loading | ready | loading-more | error.
 */
export function getVisibleSections({ blankQuery, mediaType, movie, tv }) {
  const movieRelevant = mediaType !== 'tv'
  const tvRelevant = mediaType !== 'movie'
  const usable = (relevant, entry) =>
    relevant && entry.status === 'ready' && entry.count > 0
  const hidden = (relevant, entry) =>
    !relevant || ((entry.status === 'ready' || entry.status === 'error') && entry.count === 0)
  const settled = (relevant, entry) =>
    !relevant || entry.status === 'ready' || entry.status === 'error'
  const moviesUsable = usable(movieRelevant, movie)
  const tvUsable = usable(tvRelevant, tv)
  const settledAll = settled(movieRelevant, movie) && settled(tvRelevant, tv)
  const fullFallback = blankQuery && settledAll && !moviesUsable && !tvUsable
  return {
    showMoviesRail: blankQuery && !hidden(movieRelevant, movie),
    showTvRail: blankQuery && !hidden(tvRelevant, tv),
    fullFallback,
    showMovieRetry:
      blankQuery && movieRelevant && hidden(movieRelevant, movie) && settledAll && (tvUsable || fullFallback),
    showTvRetry:
      blankQuery && tvRelevant && hidden(tvRelevant, tv) && settledAll && (moviesUsable || fullFallback),
  }
}
