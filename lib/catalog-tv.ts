import type { Movie } from "@/lib/types";

/**
 * Marvel Television — the ABC, Netflix, Hulu and Freeform shows made before
 * Marvel Studios took television in-house.
 *
 * ── Why these sit in their own universe ────────────────────────────────────
 * Their canonicity is genuinely contested. The ABC shows (Agents of S.H.I.E.L.D.,
 * Agent Carter) referenced the films constantly but were never acknowledged in
 * return; the Netflix shows were later pulled in explicitly, with Charlie Cox's
 * Matt Murdock and Vincent D'Onofrio's Kingpin carried straight into
 * She-Hulk, Echo and Daredevil: Born Again.
 *
 * Rather than rule on that, they get `universe: "tv"` — visible in All Marvel,
 * excluded from the MCU Timeline, and filterable on their own. They carry no
 * `phase` or chronological position.
 *
 * Episode counts and runtime totals are approximations; episode lengths vary.
 */
export const MARVEL_TV: Movie[] = [
  {
    id: "agents-of-shield", kind: "series", title: "Agents of S.H.I.E.L.D.", year: 2013,
    releaseDate: "2013-09-24", director: "Joss Whedon, Jed Whedon & Maurissa Tancharoen",
    runtime: 5848, seasons: 7, episodes: 136,
    synopsis: "Coulson's team runs the missions too strange or too small for the Avengers to notice.",
    initials: "AOS", imdbId: "tt2364582", imdbRating: 7.5,
    universe: "tv", studio: "ABC", franchise: "S.H.I.E.L.D.",
    characters: [], villains: ["HYDRA", "The Clairvoyant", "Hive"],
  },
  {
    id: "agent-carter", kind: "series", title: "Agent Carter", year: 2015,
    releaseDate: "2015-01-06", director: "Christopher Markus & Stephen McFeely",
    runtime: 774, seasons: 2, episodes: 18,
    synopsis: "In 1946, Peggy Carter is handed the filing while secretly clearing Howard Stark of treason.",
    initials: "AC", imdbId: "tt3475734", imdbRating: 7.8,
    universe: "tv", studio: "ABC", franchise: "S.H.I.E.L.D.",
    characters: ["captain-america"], villains: ["Dottie Underwood", "Whitney Frost"],
  },
  {
    id: "daredevil-netflix", kind: "series", title: "Daredevil", year: 2015,
    releaseDate: "2015-04-10", director: "Drew Goddard", runtime: 2106, seasons: 3, episodes: 39,
    synopsis: "A blind lawyer defends Hell's Kitchen in court by day and in a mask by night.",
    initials: "DD", imdbId: "tt3322312", imdbRating: 8.6,
    universe: "tv", studio: "Netflix", franchise: "Marvel Netflix",
    characters: ["daredevil", "punisher"], villains: ["Kingpin", "Bullseye", "The Hand"],
  },
  {
    id: "jessica-jones", kind: "series", title: "Jessica Jones", year: 2015,
    releaseDate: "2015-11-20", director: "Melissa Rosenberg", runtime: 2184, seasons: 3, episodes: 39,
    synopsis: "A private investigator with super strength and worse coping mechanisms hunts the man who controlled her.",
    initials: "JJ", imdbId: "tt2357547", imdbRating: 7.9,
    universe: "tv", studio: "Netflix", franchise: "Marvel Netflix",
    characters: [], villains: ["Kilgrave", "Trish Walker"],
  },
  {
    id: "luke-cage", kind: "series", title: "Luke Cage", year: 2016,
    releaseDate: "2016-09-30", director: "Cheo Hodari Coker", runtime: 1430, seasons: 2, episodes: 26,
    synopsis: "An unbreakable ex-convict becomes Harlem's reluctant, very public protector.",
    initials: "LC", imdbId: "tt3322314", imdbRating: 7.2,
    universe: "tv", studio: "Netflix", franchise: "Marvel Netflix",
    characters: [], villains: ["Cottonmouth", "Mariah Dillard", "Bushmaster"],
  },
  {
    id: "iron-fist", kind: "series", title: "Iron Fist", year: 2017,
    releaseDate: "2017-03-17", director: "Scott Buck", runtime: 1265, seasons: 2, episodes: 23,
    synopsis: "Danny Rand returns from a lost monastery to reclaim his company and a mystical living weapon.",
    initials: "IF", imdbId: "tt3322310", imdbRating: 6.4,
    universe: "tv", studio: "Netflix", franchise: "Marvel Netflix",
    characters: [], villains: ["The Hand", "Davos", "Harold Meachum"],
  },
  {
    id: "the-defenders", kind: "series", title: "The Defenders", year: 2017,
    releaseDate: "2017-08-18", director: "Douglas Petrie & Marco Ramirez", runtime: 416, seasons: 1, episodes: 8,
    synopsis: "Four New York vigilantes who cannot stand each other are forced into the same fight.",
    initials: "DEF", imdbId: "tt4230076", imdbRating: 7.2,
    universe: "tv", studio: "Netflix", franchise: "Marvel Netflix",
    characters: ["daredevil"], villains: ["Alexandra Reid", "The Hand", "Elektra"],
  },
  {
    id: "inhumans", kind: "series", title: "Inhumans", year: 2017,
    releaseDate: "2017-09-29", director: "Scott Buck", runtime: 344, seasons: 1, episodes: 8,
    synopsis: "The royal family of an isolated superhuman society is scattered to Hawaii by a coup.",
    initials: "INH", imdbId: "tt4154858", imdbRating: 4.9,
    universe: "tv", studio: "ABC", franchise: "Inhumans",
    characters: [], villains: ["Maximus"],
  },
  {
    id: "the-punisher", kind: "series", title: "The Punisher", year: 2017,
    releaseDate: "2017-11-17", director: "Steve Lightfoot", runtime: 1430, seasons: 2, episodes: 26,
    synopsis: "Frank Castle finishes avenging his family and discovers the conspiracy that took them.",
    initials: "PUN", imdbId: "tt5675620", imdbRating: 8.0,
    universe: "tv", studio: "Netflix", franchise: "Marvel Netflix",
    characters: ["punisher"], villains: ["Billy Russo / Jigsaw", "William Rawlins"],
  },
  {
    id: "runaways", kind: "series", title: "Runaways", year: 2017,
    releaseDate: "2017-11-21", director: "Josh Schwartz & Stephanie Savage", runtime: 1485, seasons: 3, episodes: 33,
    synopsis: "Six Los Angeles teenagers discover their parents belong to a murderous cult and run.",
    initials: "RUN", imdbId: "tt1236246", imdbRating: 7.0,
    universe: "tv", studio: "Hulu", franchise: "Runaways",
    characters: [], villains: ["The Pride", "Jonah"],
  },
  {
    id: "cloak-and-dagger", kind: "series", title: "Cloak & Dagger", year: 2018,
    releaseDate: "2018-06-07", director: "Joe Pokaski", runtime: 860, seasons: 2, episodes: 20,
    synopsis: "Two New Orleans teenagers wake with linked powers of light and darkness they cannot separate.",
    initials: "CD", imdbId: "tt5614844", imdbRating: 6.6,
    universe: "tv", studio: "Freeform", franchise: "Cloak & Dagger",
    characters: [], villains: ["Roxxon", "Detective Connors"],
  },
];
