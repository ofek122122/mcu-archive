/**
 * The combined Marvel catalog — nothing is fetched from a third party at
 * runtime. Films live in two data modules and are merged here:
 *
 *   lib/catalog-mcu.ts     Marvel Studios, Phase One → Six
 *   lib/catalog-marvel.ts  Fox, Sony, Universal, New Line, Lionsgate
 *
 * ── Poster artwork ─────────────────────────────────────────────────────────
 * Posters live in `lib/posters.ts`, keyed by movie id, and are attached by
 * `withReleaseStatus()`. Setting `posterUrl` directly on a film overrides that
 * map. If an image fails to load the card falls back to generated key art, so a
 * bad URL degrades instead of breaking the layout.
 *
 * ── IMDb ratings ───────────────────────────────────────────────────────────
 * Ratings are a point-in-time snapshot and drift by a tenth or two over time.
 * `imdbRating` is null for films that have not screened yet.
 */
import { MCU_MOVIES } from "@/lib/catalog-mcu";
import { OTHER_MOVIES } from "@/lib/catalog-marvel";
import { posterFor } from "@/lib/posters";
import type { Movie, TrackedMovie } from "@/lib/types";

export type { Movie, TrackedMovie, PhaseId, UniverseId, HeroId, CharacterTag, Theme } from "@/lib/types";
export { PHASES, UNIVERSES, getPhase, themeFor, UNIVERSE_BY_ID } from "@/lib/universes";
export type { Phase, Universe } from "@/lib/universes";

/** Every Marvel film, sorted by release date. */
export const MOVIES: Movie[] = [...MCU_MOVIES, ...OTHER_MOVIES].sort((a, b) =>
  a.releaseDate.localeCompare(b.releaseDate),
);

/** Fast membership check so Server Actions never write an unknown key. */
export const MOVIE_IDS: ReadonlySet<string> = new Set(MOVIES.map((movie) => movie.id));

export const TOTAL_MOVIES = MOVIES.length;

/** Franchise groupings, in first-release order — drives batch actions. */
export const FRANCHISES: string[] = [...new Set(MOVIES.map((movie) => movie.franchise))];

/** Canonical IMDb title URL for a film. */
export function imdbUrl(movie: Pick<Movie, "imdbId">): string {
  return `https://www.imdb.com/title/${movie.imdbId}/`;
}

/**
 * Stamp each film with its poster and whether it has screened yet. Called from
 * the server on every request so the client never has to read the clock.
 */
export function withReleaseStatus(): TrackedMovie[] {
  const now = Date.now();
  return MOVIES.map((movie) => ({
    ...movie,
    posterUrl: movie.posterUrl ?? posterFor(movie.id),
    upcoming: new Date(movie.releaseDate).getTime() > now,
  }));
}
