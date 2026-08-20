/**
 * The combined Marvel catalog — nothing is fetched from a third party at
 * runtime. Titles live in four data modules and are merged here:
 *
 *   lib/catalog-mcu.ts     Marvel Studios films, Phase One → Six
 *   lib/catalog-series.ts  Marvel Studios series and specials, Disney+
 *   lib/catalog-marvel.ts  Fox, Sony, Universal, New Line, Lionsgate films
 *   lib/catalog-tv.ts      Marvel Television — ABC, Netflix, Hulu, Freeform
 *
 * ── Films and series ───────────────────────────────────────────────────────
 * A title with `kind: "series"` carries `seasons` and `episodes`, and its
 * `runtime` is the total across every episode. Everything downstream — watch
 * time, the runtime sort, progress counts — therefore treats both kinds the
 * same, and the UI can filter to one or the other.
 *
 * ── Poster artwork ─────────────────────────────────────────────────────────
 * Posters live in `lib/posters.ts`, keyed by id, and are attached by
 * `withReleaseStatus()`. Setting `posterUrl` directly on a title overrides that
 * map. If an image fails to load the card falls back to generated key art, so a
 * bad URL degrades instead of breaking the layout.
 *
 * ── IMDb ratings ───────────────────────────────────────────────────────────
 * Ratings are a point-in-time snapshot and drift by a tenth or two over time.
 * `imdbRating` is null for titles that have not been released yet.
 */
import { MCU_MOVIES } from "@/lib/catalog-mcu";
import { MCU_SERIES } from "@/lib/catalog-series";
import { OTHER_MOVIES } from "@/lib/catalog-marvel";
import { MARVEL_TV } from "@/lib/catalog-tv";
import { CHRONO_INDEX } from "@/lib/chronology";
import { posterFor } from "@/lib/posters";
import type { Movie, TrackedMovie } from "@/lib/types";

export type {
  Movie,
  TrackedMovie,
  PhaseId,
  UniverseId,
  HeroId,
  CharacterTag,
  Theme,
  TitleKind,
} from "@/lib/types";
export { PHASES, UNIVERSES, getPhase, themeFor, UNIVERSE_BY_ID } from "@/lib/universes";
export type { Phase, Universe } from "@/lib/universes";

/**
 * Every Marvel title, sorted by release date, with chronological position
 * stamped on from the canonical ordering in lib/chronology.ts.
 */
export const MOVIES: Movie[] = [...MCU_MOVIES, ...MCU_SERIES, ...OTHER_MOVIES, ...MARVEL_TV]
  .map((movie) => {
    const chronoOrder = CHRONO_INDEX.get(movie.id);
    return chronoOrder ? { ...movie, chronoOrder } : movie;
  })
  .sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));

/** Fast membership check so Server Actions never write an unknown key. */
export const MOVIE_IDS: ReadonlySet<string> = new Set(MOVIES.map((movie) => movie.id));

export const TOTAL_MOVIES = MOVIES.length;

/** True when the title is a television series rather than a film. */
export function isSeries(movie: Pick<Movie, "kind">): boolean {
  return movie.kind === "series";
}

/** Franchise groupings, in first-release order — drives batch actions. */
export const FRANCHISES: string[] = [...new Set(MOVIES.map((movie) => movie.franchise))];

/** Canonical IMDb title URL. */
export function imdbUrl(movie: Pick<Movie, "imdbId">): string {
  return `https://www.imdb.com/title/${movie.imdbId}/`;
}

/**
 * Stamp each title with its poster and whether it has been released. Called
 * from the server on every request so the client never has to read the clock.
 */
export function withReleaseStatus(): TrackedMovie[] {
  const now = Date.now();
  return MOVIES.map((movie) => ({
    ...movie,
    posterUrl: movie.posterUrl ?? posterFor(movie.id),
    upcoming: new Date(movie.releaseDate).getTime() > now,
  }));
}
