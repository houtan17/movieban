/**
 * Local title catalog (Phase 2 demo data).
 *
 * Fictional entries with realistic shapes. Some fields are intentionally
 * incomplete (null poster / overview / rating / date) to exercise graceful
 * UI handling. Do not fill gaps with invented data in the UI — render
 * "Not available" states instead.
 *
 * @typedef {'movie' | 'tv'} MediaType
 * @typedef {'day' | 'month' | 'year' | 'unknown'} DatePrecision
 *
 * @typedef {object} Title
 * @property {string} id - Stable unique id, prefixed by media type.
 * @property {MediaType} mediaType - 'movie' or 'tv'.
 * @property {string} title - Display title.
 * @property {string | null} overview - Short synopsis, or null when unavailable.
 * @property {string | null} poster - Local poster path (e.g. '/posters/x.svg'), or null.
 * @property {string[]} genres - Genre labels (may be empty).
 * @property {number | null} rating - Local sample rating 0–10, or null.
 * @property {string | null} releaseDate - Movies: 'YYYY-MM-DD', 'YYYY-MM' or 'YYYY', or null.
 * @property {string | null} firstAirDate - TV: 'YYYY-MM-DD', 'YYYY-MM' or 'YYYY', or null.
 * @property {DatePrecision} datePrecision - Precision of the date above.
 */

/** @type {Title[]} */
export const TITLES = [
  {
    id: 'm-salt-meridian',
    mediaType: 'movie',
    title: 'The Salt Meridian',
    overview:
      'A cartographer and a lighthouse keeper cross a dried seabed to redraw a disputed border.',
    poster: '/posters/salt-meridian.svg',
    genres: ['Drama', 'Adventure'],
    rating: 7.8,
    releaseDate: '2024-03-15',
    firstAirDate: null,
    datePrecision: 'day',
  },
  {
    id: 'm-harbor-lights',
    mediaType: 'movie',
    title: 'Harbor Lights',
    overview:
      'Two estranged siblings reunite to save their family ferry business over one winter.',
    poster: '/posters/harbor-lights.svg',
    genres: ['Romance', 'Drama'],
    rating: 7.1,
    releaseDate: '2022',
    firstAirDate: null,
    datePrecision: 'year',
  },
  {
    id: 'm-iron-collision',
    mediaType: 'movie',
    title: 'Iron Collision',
    overview:
      'A retired crash-test engineer is pulled back for one last high-speed investigation.',
    poster: null,
    genres: ['Action', 'Sci-Fi'],
    rating: 6.9,
    releaseDate: '2023-07-04',
    firstAirDate: null,
    datePrecision: 'day',
  },
  {
    id: 'm-paper-garden',
    mediaType: 'movie',
    title: 'Paper Garden',
    overview:
      'A quiet drama about a bookbinder who plants a garden made entirely of paper flowers.',
    poster: '/posters/paper-garden.svg',
    genres: ['Drama'],
    rating: null,
    releaseDate: null,
    firstAirDate: null,
    datePrecision: 'unknown',
  },
  {
    id: 'm-night-cartographer',
    mediaType: 'movie',
    title: 'The Night Cartographer',
    overview: null,
    poster: '/posters/night-cartographer.svg',
    genres: ['Mystery', 'Fantasy'],
    rating: 8.2,
    releaseDate: '2021-11-19',
    firstAirDate: null,
    datePrecision: 'day',
  },
  {
    id: 'm-copper-sky',
    mediaType: 'movie',
    title: 'Copper Sky',
    overview:
      'A small-town pilot takes one final mail route across the desert before the airstrip closes.',
    poster: '/posters/copper-sky.svg',
    genres: ['Western', 'Drama'],
    rating: 7.4,
    releaseDate: '2020-09-02',
    firstAirDate: null,
    datePrecision: 'day',
  },
  {
    id: 't-station-nine',
    mediaType: 'tv',
    title: 'Station Nine',
    overview:
      'The crew of a remote orbital relay station pieces together a signal that should not exist.',
    poster: '/posters/station-nine.svg',
    genres: ['Sci-Fi', 'Drama'],
    rating: 8.5,
    releaseDate: null,
    firstAirDate: '2023-01-22',
    datePrecision: 'day',
  },
  {
    id: 't-glass-orchard',
    mediaType: 'tv',
    title: 'The Glass Orchard',
    overview:
      'Three generations of a family confront old secrets during harvest season at their greenhouse estate.',
    poster: null,
    genres: ['Drama', 'Mystery'],
    rating: 7.9,
    releaseDate: null,
    firstAirDate: '2019',
    datePrecision: 'year',
  },
  {
    id: 't-lantern-row',
    mediaType: 'tv',
    title: 'Lantern Row',
    overview:
      'Shopkeepers on a single city block compete, scheme, and celebrate through a year of festivals.',
    poster: '/posters/lantern-row.svg',
    genres: ['Comedy', 'Drama'],
    rating: 7.6,
    releaseDate: null,
    firstAirDate: '2021-04-10',
    datePrecision: 'day',
  },
  {
    id: 't-archipelago',
    mediaType: 'tv',
    title: 'Archipelago',
    overview: null,
    poster: '/posters/archipelago.svg',
    genres: ['Documentary'],
    rating: null,
    releaseDate: null,
    firstAirDate: null,
    datePrecision: 'unknown',
  },
  {
    id: 'm-ember-atlas',
    mediaType: 'movie',
    title: 'The Ember Atlas',
    overview:
      'A wildfire mapper charts a burning valley to guide the last evacuation convoy out.',
    poster: '/posters/ember-atlas.svg',
    genres: ['Action', 'Adventure'],
    rating: null,
    releaseDate: '2026-12-18',
    firstAirDate: null,
    datePrecision: 'day',
  },
  {
    id: 'm-winter-signal',
    mediaType: 'movie',
    title: 'Winter Signal',
    overview:
      'An Antarctic radio operator picks up a broadcast that repeats every polar night.',
    poster: '/posters/winter-signal.svg',
    genres: ['Sci-Fi', 'Mystery'],
    rating: null,
    releaseDate: '2027-02',
    firstAirDate: null,
    datePrecision: 'month',
  },
  {
    id: 'm-glass-tide',
    mediaType: 'movie',
    title: 'Glass Tide',
    overview:
      'A marine biologist returns to her tidal hometown as the bay turns strangely clear.',
    poster: '/posters/glass-tide.svg',
    genres: ['Drama', 'Romance'],
    rating: null,
    releaseDate: '2027',
    firstAirDate: null,
    datePrecision: 'year',
  },
  {
    id: 't-long-harbor',
    mediaType: 'tv',
    title: 'The Long Harbor',
    overview:
      'Dockworkers and shipwrights hold a fading port together across one decisive season.',
    poster: '/posters/long-harbor.svg',
    genres: ['Drama'],
    rating: null,
    releaseDate: null,
    firstAirDate: '2027-04-09',
    datePrecision: 'day',
  },
  {
    id: 't-foxglove',
    mediaType: 'tv',
    title: 'Foxglove',
    overview: null,
    poster: '/posters/foxglove.svg',
    genres: ['Fantasy', 'Drama'],
    rating: null,
    releaseDate: null,
    firstAirDate: '2027-10',
    datePrecision: 'month',
  },
]
