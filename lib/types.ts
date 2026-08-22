/** Shared domain types for the Marvel catalog. */

export type PhaseId = 1 | 2 | 3 | 4 | 5 | 6;

/** Top-level rights-holder grouping, used by the studio multi-select. */
export type UniverseId = "mcu" | "fox" | "sony" | "legacy" | "tv";

/** Films vs. television. Entries with no `kind` are films. */
export type TitleKind = "movie" | "series";

/** Heroes that get a quick-select pill in the filter bar. */
export type HeroId =
  | "spider-man"
  | "iron-man"
  | "wolverine"
  | "deadpool"
  | "ghost-rider"
  | "thor"
  | "captain-america"
  | "hulk"
  | "doctor-strange"
  | "daredevil"
  | "blade"
  | "fantastic-four"
  | "guardians";

/** Extra character tags that are searchable but have no pill of their own. */
export type CharacterTag = HeroId | "punisher" | "black-panther" | "ant-man" | "captain-marvel";

export type Movie = {
  /** Stable slug — this is what gets written into the Redis set. */
  id: string;
  /** Omitted means "movie", so the 79 film entries need no extra field. */
  kind?: TitleKind;
  title: string;
  year: number;
  /** ISO release date (US theatrical). */
  releaseDate: string;
  director: string;
  /**
   * Minutes. For a series this is the **total** across every episode, so watch
   * time and the runtime sort work the same for both kinds. `null` when the
   * title has not been released yet.
   */
  runtime: number | null;
  /** Short one-line premise. */
  synopsis: string;
  /** Monogram drawn on the generated key art. */
  initials: string;
  imdbId: string;
  /** IMDb user rating out of 10, or null if unreleased/unrated. */
  imdbRating: number | null;
  /** Optional explicit artwork; otherwise resolved from lib/posters.ts. */
  posterUrl?: string;

  universe: UniverseId;
  /** Distributing studio, shown on cards and in the compact list. */
  studio: string;
  /** Grouping for "mark franchise watched" — e.g. "X-Men", "Venom". */
  franchise: string;
  /** MCU only. */
  phase?: PhaseId;
  /** MCU only: 1-based position in in-universe chronological order. */
  chronoOrder?: number;

  /** Series only: number of seasons this entry covers (1 for a single season). */
  seasons?: number;
  /** Series only: episode count for this entry. */
  episodes?: number;
  /**
   * Series only: which season this entry is.
   *
   * Shows whose seasons are separated by films in story order are split into
   * one entry per season — Loki S1 lands right after Endgame, then eight films
   * pass before S2. A single entry could only sit at one point on the timeline,
   * which would be a lie about half of it.
   */
  season?: number;
  /** Groups the seasons of one show together. */
  showId?: string;

  characters: CharacterTag[];
  villains: string[];
};

/** A movie plus server-resolved extras. */
export type TrackedMovie = Movie & { upcoming: boolean };

/** Colour story applied to a card, chapter header and glow. */
export type Theme = {
  key: string;
  label: string;
  /** Short badge text — a phase numeral or franchise code. */
  short: string;
  accent: string;
  secondary: string;
  deep: string;
};
