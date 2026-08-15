/**
 * The complete Marvel Cinematic Universe theatrical slate, Phase One → Phase Six.
 *
 * This file is the app's only "data source" — nothing is fetched at runtime.
 *
 * ── Poster artwork ─────────────────────────────────────────────────────────
 * `posterUrl` is optional. When it is absent the card renders generated key art
 * (a phase-themed gradient with the film's monogram in hollow display type).
 * To use real posters, set `posterUrl` to any absolute URL on an allow-listed
 * host (see `next.config.ts`) or a local file under `/public/posters/`:
 *
 *   posterUrl: "https://image.tmdb.org/t/p/w500/<path>.jpg"
 *   posterUrl: "/posters/iron-man.jpg"
 *
 * If the image 404s the card silently falls back to the generated art, so a bad
 * URL degrades instead of breaking the layout.
 *
 * ── IMDb ratings ───────────────────────────────────────────────────────────
 * Ratings are a point-in-time snapshot and drift by a tenth or two over time.
 * `imdbRating` is null for films that have not screened yet.
 */

export type PhaseId = 1 | 2 | 3 | 4 | 5 | 6;

export type Movie = {
  /** Stable slug — this is what gets written into the Redis set. */
  id: string;
  title: string;
  year: number;
  phase: PhaseId;
  /** ISO release date (US theatrical). */
  releaseDate: string;
  director: string;
  /** Minutes. `null` for films that have not screened yet. */
  runtime: number | null;
  /** Short one-line premise. */
  synopsis: string;
  /** Placeholder monogram drawn on the generated poster tile. */
  initials: string;
  /** IMDb title id, e.g. "tt0371746". Builds the canonical title URL. */
  imdbId: string;
  /** IMDb user rating out of 10, or null if unreleased/unrated. */
  imdbRating: number | null;
  /** Optional real artwork. Leave undefined to use the generated placeholder. */
  posterUrl?: string;
};

export type Phase = {
  id: PhaseId;
  label: string;
  roman: string;
  saga: string;
  years: string;
  /** Human-readable name for the phase's colour story. */
  theme: string;
  /** Primary accent. */
  accent: string;
  /** Supporting accent, used for gradient borders and secondary glow. */
  secondary: string;
  /** Deep tone used as the base of poster and panel gradients. */
  deep: string;
};

/**
 * Phase colour stories:
 *   1–2  Stark arc-reactor cyan against industrial steel
 *   3    Cosmic infinity purple shot through with gold
 *   4–6  Quantum red with a shifting dimensional-rift secondary
 */
export const PHASES: Phase[] = [
  {
    id: 1,
    label: "Phase One",
    roman: "I",
    saga: "The Infinity Saga",
    years: "2008 – 2012",
    theme: "Arc Reactor / Steel",
    accent: "#5ad2f4",
    secondary: "#8ea3b5",
    deep: "#07222e",
  },
  {
    id: 2,
    label: "Phase Two",
    roman: "II",
    saga: "The Infinity Saga",
    years: "2013 – 2015",
    theme: "Arc Reactor / Titanium",
    accent: "#3fdfd4",
    secondary: "#9fb3c4",
    deep: "#062a2c",
  },
  {
    id: 3,
    label: "Phase Three",
    roman: "III",
    saga: "The Infinity Saga",
    years: "2016 – 2019",
    theme: "Infinity Purple / Gold",
    accent: "#a970ff",
    secondary: "#f5c518",
    deep: "#1d0b3d",
  },
  {
    id: 4,
    label: "Phase Four",
    roman: "IV",
    saga: "The Multiverse Saga",
    years: "2021 – 2022",
    theme: "Quantum Red / Rift Amber",
    accent: "#ff3d5e",
    secondary: "#ff9d4d",
    deep: "#33081a",
  },
  {
    id: 5,
    label: "Phase Five",
    roman: "V",
    saga: "The Multiverse Saga",
    years: "2023 – 2025",
    theme: "Quantum Red / Rift Magenta",
    accent: "#ff2d55",
    secondary: "#d946ef",
    deep: "#340a24",
  },
  {
    id: 6,
    label: "Phase Six",
    roman: "VI",
    saga: "The Multiverse Saga",
    years: "2025 – 2027",
    theme: "Quantum Red / Rift Ember",
    accent: "#ff4f2a",
    secondary: "#ffb02e",
    deep: "#351106",
  },
];

export const MOVIES: Movie[] = [
  // ── Phase One ──────────────────────────────────────────────────────────────
  {
    id: "iron-man",
    title: "Iron Man",
    year: 2008,
    phase: 1,
    releaseDate: "2008-05-02",
    director: "Jon Favreau",
    runtime: 126,
    synopsis:
      "A captive weapons magnate builds a powered suit of armour and rebuilds himself with it.",
    initials: "IM",
    imdbId: "tt0371746",
    imdbRating: 7.9,
  },
  {
    id: "the-incredible-hulk",
    title: "The Incredible Hulk",
    year: 2008,
    phase: 1,
    releaseDate: "2008-06-13",
    director: "Louis Leterrier",
    runtime: 112,
    synopsis:
      "Bruce Banner hunts a cure on the run while the army hunts the monster inside him.",
    initials: "TIH",
    imdbId: "tt0800080",
    imdbRating: 6.6,
  },
  {
    id: "iron-man-2",
    title: "Iron Man 2",
    year: 2010,
    phase: 1,
    releaseDate: "2010-05-07",
    director: "Jon Favreau",
    runtime: 124,
    synopsis:
      "Tony Stark is dying of his own power source as a Russian physicist comes to collect a debt.",
    initials: "IM2",
    imdbId: "tt1228705",
    imdbRating: 6.9,
  },
  {
    id: "thor",
    title: "Thor",
    year: 2011,
    phase: 1,
    releaseDate: "2011-05-06",
    director: "Kenneth Branagh",
    runtime: 115,
    synopsis:
      "An arrogant Asgardian prince is stripped of his hammer and exiled to Earth to earn it back.",
    initials: "TH",
    imdbId: "tt0800369",
    imdbRating: 7.0,
  },
  {
    id: "captain-america-the-first-avenger",
    title: "Captain America: The First Avenger",
    year: 2011,
    phase: 1,
    releaseDate: "2011-07-22",
    director: "Joe Johnston",
    runtime: 124,
    synopsis:
      "A frail volunteer becomes a super-soldier and takes on HYDRA in the Second World War.",
    initials: "CA",
    imdbId: "tt0458339",
    imdbRating: 6.9,
  },
  {
    id: "the-avengers",
    title: "The Avengers",
    year: 2012,
    phase: 1,
    releaseDate: "2012-05-04",
    director: "Joss Whedon",
    runtime: 143,
    synopsis:
      "Earth's mightiest heroes are assembled to stop Loki's Chitauri invasion of New York.",
    initials: "AV",
    imdbId: "tt0848228",
    imdbRating: 8.0,
  },

  // ── Phase Two ──────────────────────────────────────────────────────────────
  {
    id: "iron-man-3",
    title: "Iron Man 3",
    year: 2013,
    phase: 2,
    releaseDate: "2013-05-03",
    director: "Shane Black",
    runtime: 130,
    synopsis:
      "Stripped of his armoury and rattled by New York, Stark hunts a terrorist called the Mandarin.",
    initials: "IM3",
    imdbId: "tt1300854",
    imdbRating: 7.1,
  },
  {
    id: "thor-the-dark-world",
    title: "Thor: The Dark World",
    year: 2013,
    phase: 2,
    releaseDate: "2013-11-08",
    director: "Alan Taylor",
    runtime: 112,
    synopsis:
      "Thor allies with Loki against Malekith, who would return the Nine Realms to darkness.",
    initials: "TDW",
    imdbId: "tt1981115",
    imdbRating: 6.8,
  },
  {
    id: "captain-america-the-winter-soldier",
    title: "Captain America: The Winter Soldier",
    year: 2014,
    phase: 2,
    releaseDate: "2014-04-04",
    director: "Anthony & Joe Russo",
    runtime: 136,
    synopsis: "Rogers uncovers HYDRA inside S.H.I.E.L.D. and faces a ghost from his own past.",
    initials: "TWS",
    imdbId: "tt1843866",
    imdbRating: 7.7,
  },
  {
    id: "guardians-of-the-galaxy",
    title: "Guardians of the Galaxy",
    year: 2014,
    phase: 2,
    releaseDate: "2014-08-01",
    director: "James Gunn",
    runtime: 121,
    synopsis:
      "A band of cosmic criminals reluctantly bands together over a stolen orb worth the galaxy.",
    initials: "GG",
    imdbId: "tt2015381",
    imdbRating: 8.0,
  },
  {
    id: "avengers-age-of-ultron",
    title: "Avengers: Age of Ultron",
    year: 2015,
    phase: 2,
    releaseDate: "2015-05-01",
    director: "Joss Whedon",
    runtime: 141,
    synopsis: "Stark's peacekeeping AI decides that peace on Earth requires no Earth at all.",
    initials: "AOU",
    imdbId: "tt2395427",
    imdbRating: 7.3,
  },
  {
    id: "ant-man",
    title: "Ant-Man",
    year: 2015,
    phase: 2,
    releaseDate: "2015-07-17",
    director: "Peyton Reed",
    runtime: 117,
    synopsis:
      "A cat burglar inherits a shrinking suit and pulls a heist to keep the technology buried.",
    initials: "AM",
    imdbId: "tt0478970",
    imdbRating: 7.3,
  },

  // ── Phase Three ────────────────────────────────────────────────────────────
  {
    id: "captain-america-civil-war",
    title: "Captain America: Civil War",
    year: 2016,
    phase: 3,
    releaseDate: "2016-05-06",
    director: "Anthony & Joe Russo",
    runtime: 147,
    synopsis:
      "Government oversight splits the Avengers into two camps, and the split turns personal.",
    initials: "CW",
    imdbId: "tt3498820",
    imdbRating: 7.8,
  },
  {
    id: "doctor-strange",
    title: "Doctor Strange",
    year: 2016,
    phase: 3,
    releaseDate: "2016-11-04",
    director: "Scott Derrickson",
    runtime: 115,
    synopsis: "A ruined surgeon seeks healing in Kamar-Taj and finds the mystic arts instead.",
    initials: "DS",
    imdbId: "tt1211837",
    imdbRating: 7.5,
  },
  {
    id: "guardians-of-the-galaxy-vol-2",
    title: "Guardians of the Galaxy Vol. 2",
    year: 2017,
    phase: 3,
    releaseDate: "2017-05-05",
    director: "James Gunn",
    runtime: 136,
    synopsis: "Peter Quill meets his father and learns what a living planet wants from a son.",
    initials: "GG2",
    imdbId: "tt3896198",
    imdbRating: 7.6,
  },
  {
    id: "spider-man-homecoming",
    title: "Spider-Man: Homecoming",
    year: 2017,
    phase: 3,
    releaseDate: "2017-07-07",
    director: "Jon Watts",
    runtime: 133,
    synopsis:
      "Peter Parker juggles high school and an arms dealer flying on salvaged Chitauri tech.",
    initials: "SMH",
    imdbId: "tt2250912",
    imdbRating: 7.4,
  },
  {
    id: "thor-ragnarok",
    title: "Thor: Ragnarok",
    year: 2017,
    phase: 3,
    releaseDate: "2017-11-03",
    director: "Taika Waititi",
    runtime: 130,
    synopsis: "Hammerless and marooned on Sakaar, Thor must escape a gladiator pit to stop Hela.",
    initials: "RAG",
    imdbId: "tt3501632",
    imdbRating: 7.9,
  },
  {
    id: "black-panther",
    title: "Black Panther",
    year: 2018,
    phase: 3,
    releaseDate: "2018-02-16",
    director: "Ryan Coogler",
    runtime: 134,
    synopsis: "T'Challa takes Wakanda's throne and is challenged by an exile with a rightful claim.",
    initials: "BP",
    imdbId: "tt1825683",
    imdbRating: 7.3,
  },
  {
    id: "avengers-infinity-war",
    title: "Avengers: Infinity War",
    year: 2018,
    phase: 3,
    releaseDate: "2018-04-27",
    director: "Anthony & Joe Russo",
    runtime: 149,
    synopsis: "Thanos comes for the Infinity Stones, and every hero in the galaxy is too late.",
    initials: "IW",
    imdbId: "tt4154756",
    imdbRating: 8.4,
  },
  {
    id: "ant-man-and-the-wasp",
    title: "Ant-Man and the Wasp",
    year: 2018,
    phase: 3,
    releaseDate: "2018-07-06",
    director: "Peyton Reed",
    runtime: 118,
    synopsis: "Scott Lang and Hope van Dyne race to pull Janet out of the Quantum Realm.",
    initials: "AMW",
    imdbId: "tt5095030",
    imdbRating: 7.0,
  },
  {
    id: "captain-marvel",
    title: "Captain Marvel",
    year: 2019,
    phase: 3,
    releaseDate: "2019-03-08",
    director: "Anna Boden & Ryan Fleck",
    runtime: 123,
    synopsis:
      "A Kree soldier crash-lands in 1995 and recovers the human life that was taken from her.",
    initials: "CM",
    imdbId: "tt4154664",
    imdbRating: 6.8,
  },
  {
    id: "avengers-endgame",
    title: "Avengers: Endgame",
    year: 2019,
    phase: 3,
    releaseDate: "2019-04-26",
    director: "Anthony & Joe Russo",
    runtime: 181,
    synopsis: "The survivors of the Snap gamble on a time heist to undo five years of loss.",
    initials: "EG",
    imdbId: "tt4154796",
    imdbRating: 8.4,
  },
  {
    id: "spider-man-far-from-home",
    title: "Spider-Man: Far From Home",
    year: 2019,
    phase: 3,
    releaseDate: "2019-07-02",
    director: "Jon Watts",
    runtime: 129,
    synopsis:
      "A European school trip goes sideways when a man claiming to be from another Earth arrives.",
    initials: "FFH",
    imdbId: "tt6320628",
    imdbRating: 7.4,
  },

  // ── Phase Four ─────────────────────────────────────────────────────────────
  {
    id: "black-widow",
    title: "Black Widow",
    year: 2021,
    phase: 4,
    releaseDate: "2021-07-09",
    director: "Cate Shortland",
    runtime: 134,
    synopsis: "Natasha Romanoff reunites with her fake family to burn down the Red Room for good.",
    initials: "BW",
    imdbId: "tt3480822",
    imdbRating: 6.7,
  },
  {
    id: "shang-chi-and-the-legend-of-the-ten-rings",
    title: "Shang-Chi and the Legend of the Ten Rings",
    year: 2021,
    phase: 4,
    releaseDate: "2021-09-03",
    director: "Destin Daniel Cretton",
    runtime: 132,
    synopsis: "A San Francisco valet is dragged back into his father's thousand-year-old empire.",
    initials: "SC",
    imdbId: "tt9376612",
    imdbRating: 7.4,
  },
  {
    id: "eternals",
    title: "Eternals",
    year: 2021,
    phase: 4,
    releaseDate: "2021-11-05",
    director: "Chloé Zhao",
    runtime: 156,
    synopsis: "Immortals who watched humanity for millennia must finally choose a side.",
    initials: "ET",
    imdbId: "tt9032400",
    imdbRating: 6.3,
  },
  {
    id: "spider-man-no-way-home",
    title: "Spider-Man: No Way Home",
    year: 2021,
    phase: 4,
    releaseDate: "2021-12-17",
    director: "Jon Watts",
    runtime: 148,
    synopsis: "A botched memory spell cracks the multiverse open and lets old enemies through.",
    initials: "NWH",
    imdbId: "tt10872600",
    imdbRating: 8.2,
  },
  {
    id: "doctor-strange-in-the-multiverse-of-madness",
    title: "Doctor Strange in the Multiverse of Madness",
    year: 2022,
    phase: 4,
    releaseDate: "2022-05-06",
    director: "Sam Raimi",
    runtime: 126,
    synopsis: "Strange protects a girl who can punch holes between realities from a grieving witch.",
    initials: "MOM",
    imdbId: "tt9419884",
    imdbRating: 6.9,
  },
  {
    id: "thor-love-and-thunder",
    title: "Thor: Love and Thunder",
    year: 2022,
    phase: 4,
    releaseDate: "2022-07-08",
    director: "Taika Waititi",
    runtime: 118,
    synopsis: "Thor's retirement ends when a god butcher starts working his way down the pantheon.",
    initials: "LT",
    imdbId: "tt10648342",
    imdbRating: 6.2,
  },
  {
    id: "black-panther-wakanda-forever",
    title: "Black Panther: Wakanda Forever",
    year: 2022,
    phase: 4,
    releaseDate: "2022-11-11",
    director: "Ryan Coogler",
    runtime: 161,
    synopsis:
      "A grieving Wakanda defends its throne and its vibranium against the undersea kingdom of Talokan.",
    initials: "WF",
    imdbId: "tt9114286",
    imdbRating: 6.7,
  },

  // ── Phase Five ─────────────────────────────────────────────────────────────
  {
    id: "ant-man-and-the-wasp-quantumania",
    title: "Ant-Man and the Wasp: Quantumania",
    year: 2023,
    phase: 5,
    releaseDate: "2023-02-17",
    director: "Peyton Reed",
    runtime: 124,
    synopsis: "The Lang family falls into the Quantum Realm and meets the exile who rules it.",
    initials: "QM",
    imdbId: "tt10954600",
    imdbRating: 6.1,
  },
  {
    id: "guardians-of-the-galaxy-vol-3",
    title: "Guardians of the Galaxy Vol. 3",
    year: 2023,
    phase: 5,
    releaseDate: "2023-05-05",
    director: "James Gunn",
    runtime: 150,
    synopsis: "The Guardians risk everything to save Rocket and confront the man who made him.",
    initials: "GG3",
    imdbId: "tt6791350",
    imdbRating: 7.9,
  },
  {
    id: "the-marvels",
    title: "The Marvels",
    year: 2023,
    phase: 5,
    releaseDate: "2023-11-10",
    director: "Nia DaCosta",
    runtime: 105,
    synopsis:
      "Three heroes swap places every time they use their powers, and have to learn to fight as one.",
    initials: "TM",
    imdbId: "tt10676048",
    imdbRating: 5.6,
  },
  {
    id: "deadpool-and-wolverine",
    title: "Deadpool & Wolverine",
    year: 2024,
    phase: 5,
    releaseDate: "2024-07-26",
    director: "Shawn Levy",
    runtime: 128,
    synopsis: "Wade Wilson is conscripted by the TVA and drags the worst possible Wolverine along.",
    initials: "DW",
    imdbId: "tt6263850",
    imdbRating: 7.7,
  },
  {
    id: "captain-america-brave-new-world",
    title: "Captain America: Brave New World",
    year: 2025,
    phase: 5,
    releaseDate: "2025-02-14",
    director: "Julius Onah",
    runtime: 118,
    synopsis: "Sam Wilson's first mission as Captain America collides with a new President's agenda.",
    initials: "BNW",
    imdbId: "tt14513804",
    imdbRating: 5.7,
  },
  {
    id: "thunderbolts",
    title: "Thunderbolts*",
    year: 2025,
    phase: 5,
    releaseDate: "2025-05-02",
    director: "Jake Schreier",
    runtime: 127,
    synopsis: "A group of disposable antiheroes is set up to die and decides not to oblige.",
    initials: "TB",
    imdbId: "tt20969586",
    imdbRating: 7.2,
  },

  // ── Phase Six ──────────────────────────────────────────────────────────────
  {
    id: "the-fantastic-four-first-steps",
    title: "The Fantastic Four: First Steps",
    year: 2025,
    phase: 6,
    releaseDate: "2025-07-25",
    director: "Matt Shakman",
    runtime: 115,
    synopsis: "A retro-futurist first family defends their Earth from a world-eater and his herald.",
    initials: "F4",
    imdbId: "tt10676052",
    imdbRating: 7.1,
  },
  // The three films below had not screened at time of writing. Their IMDb ids
  // are provisional listings and are worth re-checking before you rely on them.
  {
    id: "spider-man-brand-new-day",
    title: "Spider-Man: Brand New Day",
    year: 2026,
    phase: 6,
    releaseDate: "2026-07-31",
    director: "Destin Daniel Cretton",
    runtime: null,
    synopsis: "A Peter Parker nobody remembers starts over from nothing in a changed New York.",
    initials: "BND",
    imdbId: "tt11388926",
    imdbRating: null,
  },
  {
    id: "avengers-doomsday",
    title: "Avengers: Doomsday",
    year: 2026,
    phase: 6,
    releaseDate: "2026-12-18",
    director: "Anthony & Joe Russo",
    runtime: null,
    synopsis: "Heroes from across the multiverse are drawn together against Doctor Doom.",
    initials: "AD",
    imdbId: "tt22801226",
    imdbRating: null,
  },
  {
    id: "avengers-secret-wars",
    title: "Avengers: Secret Wars",
    year: 2027,
    phase: 6,
    releaseDate: "2027-12-17",
    director: "Anthony & Joe Russo",
    runtime: null,
    synopsis: "The final incursion collapses the multiverse into one battleworld.",
    initials: "SW",
    imdbId: "tt29657002",
    imdbRating: null,
  },
];

/** A movie plus release status, resolved on the server so the client stays deterministic. */
export type TrackedMovie = Movie & { upcoming: boolean };

/** Fast membership check so Server Actions never write an unknown key. */
export const MOVIE_IDS: ReadonlySet<string> = new Set(MOVIES.map((m) => m.id));

export const TOTAL_MOVIES = MOVIES.length;

/** Canonical IMDb title URL for a film. */
export function imdbUrl(movie: Pick<Movie, "imdbId">): string {
  return `https://www.imdb.com/title/${movie.imdbId}/`;
}

/**
 * Stamp each film with whether it has screened yet. Called from the server on
 * every request so the client component never has to read the clock.
 */
export function withReleaseStatus(): TrackedMovie[] {
  const now = Date.now();
  return MOVIES.map((movie) => ({
    ...movie,
    upcoming: new Date(movie.releaseDate).getTime() > now,
  }));
}

export function getPhase(id: PhaseId): Phase {
  // PHASES is exhaustive over PhaseId, so this is always defined.
  return PHASES.find((p) => p.id === id) as Phase;
}
