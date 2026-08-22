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
 * -- Modelling --------------------------------------------------------------
 * One entry per *season*, not per show. These are long runs -- Agents of
 * S.H.I.E.L.D. alone is seven seasons and 136 episodes -- and a single tick
 * covering all of it is not a useful thing to record. Each season carries
 * `season` and a shared `showId`, with TMDB's per-season art. Single-season
 * shows (The Defenders, Inhumans) stay as one entry.
 *
 * Splitting preserves each show's totals: the runtime is divided across its
 * seasons by episode count and sums back to the original, so watch-time stats
 * are unchanged by the split.
 *
 * Episode counts and runtime totals are approximations; episode lengths vary.
 */
export const MARVEL_TV: Movie[] = [
  {
    id: "agents-of-shield-season-1", kind: "series", title: "Agents of S.H.I.E.L.D.: Season 1", year: 2013,
    season: 1, showId: "agents-of-shield",
    releaseDate: "2013-09-24", director: "Joss Whedon, Jed Whedon & Maurissa Tancharoen", runtime: 946, seasons: 1, episodes: 22,
    synopsis: "Coulson's team runs the missions too strange or too small for the Avengers to notice.",
    initials: "AS1", imdbId: "tt2364582", imdbRating: 7.5,
    universe: "tv", studio: "ABC", franchise: "S.H.I.E.L.D.",
    characters: [], villains: ["HYDRA", "The Clairvoyant"],
  },
  {
    id: "agents-of-shield-season-2", kind: "series", title: "Agents of S.H.I.E.L.D.: Season 2", year: 2014,
    season: 2, showId: "agents-of-shield",
    releaseDate: "2014-09-23", director: "Joss Whedon, Jed Whedon & Maurissa Tancharoen", runtime: 946, seasons: 1, episodes: 22,
    synopsis: "S.H.I.E.L.D. is rubble after HYDRA, and the thing in Skye's blood is older than the agency.",
    initials: "AS2", imdbId: "tt2364582", imdbRating: 7.5,
    universe: "tv", studio: "ABC", franchise: "S.H.I.E.L.D.",
    characters: [], villains: ["HYDRA", "Daniel Whitehall", "Jiaying"],
  },
  {
    id: "agents-of-shield-season-3", kind: "series", title: "Agents of S.H.I.E.L.D.: Season 3", year: 2015,
    season: 3, showId: "agents-of-shield",
    releaseDate: "2015-09-29", director: "Joss Whedon, Jed Whedon & Maurissa Tancharoen", runtime: 946, seasons: 1, episodes: 22,
    synopsis: "Inhumans are surfacing worldwide, and something very old comes back wearing Will's face.",
    initials: "AS3", imdbId: "tt2364582", imdbRating: 7.5,
    universe: "tv", studio: "ABC", franchise: "S.H.I.E.L.D.",
    characters: [], villains: ["Hive", "Lash"],
  },
  {
    id: "agents-of-shield-season-4", kind: "series", title: "Agents of S.H.I.E.L.D.: Season 4", year: 2016,
    season: 4, showId: "agents-of-shield",
    releaseDate: "2016-09-20", director: "Joss Whedon, Jed Whedon & Maurissa Tancharoen", runtime: 946, seasons: 1, episodes: 22,
    synopsis: "A vengeance-driven rider, a synthetic woman building herself a body, and a world made of lies.",
    initials: "AS4", imdbId: "tt2364582", imdbRating: 7.5,
    universe: "tv", studio: "ABC", franchise: "S.H.I.E.L.D.",
    characters: [], villains: ["Aida", "Anton Ivanov"],
  },
  {
    id: "agents-of-shield-season-5", kind: "series", title: "Agents of S.H.I.E.L.D.: Season 5", year: 2017,
    season: 5, showId: "agents-of-shield",
    releaseDate: "2017-12-01", director: "Joss Whedon, Jed Whedon & Maurissa Tancharoen", runtime: 946, seasons: 1, episodes: 22,
    synopsis: "The team wakes up in a future where the Earth is already broken, and one of them broke it.",
    initials: "AS5", imdbId: "tt2364582", imdbRating: 7.5,
    universe: "tv", studio: "ABC", franchise: "S.H.I.E.L.D.",
    characters: [], villains: ["Kasius", "Graviton"],
  },
  {
    id: "agents-of-shield-season-6", kind: "series", title: "Agents of S.H.I.E.L.D.: Season 6", year: 2019,
    season: 6, showId: "agents-of-shield",
    releaseDate: "2019-05-10", director: "Joss Whedon, Jed Whedon & Maurissa Tancharoen", runtime: 559, seasons: 1, episodes: 13,
    synopsis: "A man wearing Coulson's face lands on Earth with a crew and a grudge nobody can place.",
    initials: "AS6", imdbId: "tt2364582", imdbRating: 7.5,
    universe: "tv", studio: "ABC", franchise: "S.H.I.E.L.D.",
    characters: [], villains: ["Sarge", "Izel"],
  },
  {
    id: "agents-of-shield-season-7", kind: "series", title: "Agents of S.H.I.E.L.D.: Season 7", year: 2020,
    season: 7, showId: "agents-of-shield",
    releaseDate: "2020-05-27", director: "Joss Whedon, Jed Whedon & Maurissa Tancharoen", runtime: 559, seasons: 1, episodes: 13,
    synopsis: "Chased backwards through the twentieth century by an enemy rewriting S.H.I.E.L.D. out of history.",
    initials: "AS7", imdbId: "tt2364582", imdbRating: 7.5,
    universe: "tv", studio: "ABC", franchise: "S.H.I.E.L.D.",
    characters: [], villains: ["Chronicoms", "Nathaniel Malick"],
  },
  {
    id: "agent-carter-season-1", kind: "series", title: "Agent Carter: Season 1", year: 2015,
    season: 1, showId: "agent-carter",
    releaseDate: "2015-01-06", director: "Christopher Markus & Stephen McFeely", runtime: 344, seasons: 1, episodes: 8,
    synopsis: "In 1946, Peggy Carter is handed the filing while secretly clearing Howard Stark of treason.",
    initials: "AC1", imdbId: "tt3475734", imdbRating: 7.8,
    universe: "tv", studio: "ABC", franchise: "S.H.I.E.L.D.",
    characters: ["captain-america"], villains: ["Dottie Underwood", "Leviathan"],
  },
  {
    id: "agent-carter-season-2", kind: "series", title: "Agent Carter: Season 2", year: 2016,
    season: 2, showId: "agent-carter",
    releaseDate: "2016-01-19", director: "Christopher Markus & Stephen McFeely", runtime: 430, seasons: 1, episodes: 10,
    synopsis: "Los Angeles, 1947: a substance that should not exist, and an actress who has learned to use it.",
    initials: "AC2", imdbId: "tt3475734", imdbRating: 7.8,
    universe: "tv", studio: "ABC", franchise: "S.H.I.E.L.D.",
    characters: ["captain-america"], villains: ["Whitney Frost", "Zero Matter"],
  },
  {
    id: "daredevil-netflix-season-1", kind: "series", title: "Daredevil: Season 1", year: 2015,
    season: 1, showId: "daredevil-netflix",
    releaseDate: "2015-04-10", director: "Drew Goddard", runtime: 702, seasons: 1, episodes: 13,
    synopsis: "A blind lawyer defends Hell's Kitchen in court by day and in a mask by night.",
    initials: "DD1", imdbId: "tt3322312", imdbRating: 8.6,
    universe: "tv", studio: "Netflix", franchise: "Marvel Netflix",
    characters: ["daredevil"], villains: ["Kingpin", "Nobu Yoshioka", "The Hand"],
  },
  {
    id: "daredevil-netflix-season-2", kind: "series", title: "Daredevil: Season 2", year: 2016,
    season: 2, showId: "daredevil-netflix",
    releaseDate: "2016-03-18", director: "Drew Goddard", runtime: 702, seasons: 1, episodes: 13,
    synopsis: "A man with a gun and a woman with a sai each argue, differently, that Matt's line is drawn wrong.",
    initials: "DD2", imdbId: "tt3322312", imdbRating: 8.6,
    universe: "tv", studio: "Netflix", franchise: "Marvel Netflix",
    characters: ["daredevil", "punisher"], villains: ["The Hand", "Nobu Yoshioka"],
  },
  {
    id: "daredevil-netflix-season-3", kind: "series", title: "Daredevil: Season 3", year: 2018,
    season: 3, showId: "daredevil-netflix",
    releaseDate: "2018-10-19", director: "Drew Goddard", runtime: 702, seasons: 1, episodes: 13,
    synopsis: "Fisk trades his way out of prison and takes Matt's name, his friends and his faith apart.",
    initials: "DD3", imdbId: "tt3322312", imdbRating: 8.6,
    universe: "tv", studio: "Netflix", franchise: "Marvel Netflix",
    characters: ["daredevil"], villains: ["Kingpin", "Bullseye"],
  },
  {
    id: "jessica-jones-season-1", kind: "series", title: "Jessica Jones: Season 1", year: 2015,
    season: 1, showId: "jessica-jones",
    releaseDate: "2015-11-20", director: "Melissa Rosenberg", runtime: 728, seasons: 1, episodes: 13,
    synopsis: "A private investigator with super strength and worse coping mechanisms hunts the man who controlled her.",
    initials: "JJ1", imdbId: "tt2357547", imdbRating: 7.9,
    universe: "tv", studio: "Netflix", franchise: "Marvel Netflix",
    characters: [], villains: ["Kilgrave"],
  },
  {
    id: "jessica-jones-season-2", kind: "series", title: "Jessica Jones: Season 2", year: 2018,
    season: 2, showId: "jessica-jones",
    releaseDate: "2018-03-08", director: "Melissa Rosenberg", runtime: 728, seasons: 1, episodes: 13,
    synopsis: "Chasing the people who saved her life without asking, and what else they left in her.",
    initials: "JJ2", imdbId: "tt2357547", imdbRating: 7.9,
    universe: "tv", studio: "Netflix", franchise: "Marvel Netflix",
    characters: [], villains: ["Alisa Jones", "IGH"],
  },
  {
    id: "jessica-jones-season-3", kind: "series", title: "Jessica Jones: Season 3", year: 2019,
    season: 3, showId: "jessica-jones",
    releaseDate: "2019-06-14", director: "Melissa Rosenberg", runtime: 728, seasons: 1, episodes: 13,
    synopsis: "A meticulous killer who believes he is the only honest man alive, and a best friend going the other way.",
    initials: "JJ3", imdbId: "tt2357547", imdbRating: 7.9,
    universe: "tv", studio: "Netflix", franchise: "Marvel Netflix",
    characters: [], villains: ["Gregory Sallinger", "Trish Walker"],
  },
  {
    id: "luke-cage-season-1", kind: "series", title: "Luke Cage: Season 1", year: 2016,
    season: 1, showId: "luke-cage",
    releaseDate: "2016-09-30", director: "Cheo Hodari Coker", runtime: 715, seasons: 1, episodes: 13,
    synopsis: "An unbreakable ex-convict becomes Harlem's reluctant, very public protector.",
    initials: "LC1", imdbId: "tt3322314", imdbRating: 7.2,
    universe: "tv", studio: "Netflix", franchise: "Marvel Netflix",
    characters: [], villains: ["Cottonmouth", "Mariah Dillard", "Diamondback"],
  },
  {
    id: "luke-cage-season-2", kind: "series", title: "Luke Cage: Season 2", year: 2018,
    season: 2, showId: "luke-cage",
    releaseDate: "2018-06-22", director: "Cheo Hodari Coker", runtime: 715, seasons: 1, episodes: 13,
    synopsis: "A Jamaican with an old family claim arrives to take Harlem from everyone holding it.",
    initials: "LC2", imdbId: "tt3322314", imdbRating: 7.2,
    universe: "tv", studio: "Netflix", franchise: "Marvel Netflix",
    characters: [], villains: ["Bushmaster", "Mariah Dillard"],
  },
  {
    id: "iron-fist-season-1", kind: "series", title: "Iron Fist: Season 1", year: 2017,
    season: 1, showId: "iron-fist",
    releaseDate: "2017-03-17", director: "Scott Buck", runtime: 715, seasons: 1, episodes: 13,
    synopsis: "Danny Rand returns from a lost monastery to reclaim his company and a mystical living weapon.",
    initials: "IF1", imdbId: "tt3322310", imdbRating: 6.4,
    universe: "tv", studio: "Netflix", franchise: "Marvel Netflix",
    characters: [], villains: ["The Hand", "Harold Meachum"],
  },
  {
    id: "iron-fist-season-2", kind: "series", title: "Iron Fist: Season 2", year: 2018,
    season: 2, showId: "iron-fist",
    releaseDate: "2018-09-07", director: "Scott Buck", runtime: 550, seasons: 1, episodes: 10,
    synopsis: "The brother Danny left behind in K'un-Lun comes to take the fist he believes was stolen.",
    initials: "IF2", imdbId: "tt3322310", imdbRating: 6.4,
    universe: "tv", studio: "Netflix", franchise: "Marvel Netflix",
    characters: [], villains: ["Davos", "Mary Walker"],
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
    id: "the-punisher-season-1", kind: "series", title: "The Punisher: Season 1", year: 2017,
    season: 1, showId: "the-punisher",
    releaseDate: "2017-11-17", director: "Steve Lightfoot", runtime: 715, seasons: 1, episodes: 13,
    synopsis: "Frank Castle finishes avenging his family and discovers the conspiracy that took them.",
    initials: "PN1", imdbId: "tt5675620", imdbRating: 8.0,
    universe: "tv", studio: "Netflix", franchise: "Marvel Netflix",
    characters: ["punisher"], villains: ["William Rawlins", "Billy Russo"],
  },
  {
    id: "the-punisher-season-2", kind: "series", title: "The Punisher: Season 2", year: 2019,
    season: 2, showId: "the-punisher",
    releaseDate: "2019-01-18", director: "Steve Lightfoot", runtime: 715, seasons: 1, episodes: 13,
    synopsis: "A girl who saw something she should not have, and a friend who no longer remembers what he did.",
    initials: "PN2", imdbId: "tt5675620", imdbRating: 8.0,
    universe: "tv", studio: "Netflix", franchise: "Marvel Netflix",
    characters: ["punisher"], villains: ["Billy Russo / Jigsaw", "John Pilgrim"],
  },
  {
    id: "runaways-season-1", kind: "series", title: "Runaways: Season 1", year: 2017,
    season: 1, showId: "runaways",
    releaseDate: "2017-11-21", director: "Josh Schwartz & Stephanie Savage", runtime: 450, seasons: 1, episodes: 10,
    synopsis: "Six Los Angeles teenagers discover their parents belong to a murderous cult and run.",
    initials: "RN1", imdbId: "tt1236246", imdbRating: 7.0,
    universe: "tv", studio: "Hulu", franchise: "Runaways",
    characters: [], villains: ["The Pride", "Jonah"],
  },
  {
    id: "runaways-season-2", kind: "series", title: "Runaways: Season 2", year: 2018,
    season: 2, showId: "runaways",
    releaseDate: "2018-12-21", director: "Josh Schwartz & Stephanie Savage", runtime: 585, seasons: 1, episodes: 13,
    synopsis: "Living rough in a hidden mansion while their parents run the city looking for them.",
    initials: "RN2", imdbId: "tt1236246", imdbRating: 7.0,
    universe: "tv", studio: "Hulu", franchise: "Runaways",
    characters: [], villains: ["Jonah", "The Pride"],
  },
  {
    id: "runaways-season-3", kind: "series", title: "Runaways: Season 3", year: 2019,
    season: 3, showId: "runaways",
    releaseDate: "2019-12-13", director: "Josh Schwartz & Stephanie Savage", runtime: 450, seasons: 1, episodes: 10,
    synopsis: "Rescuing their own from something wearing their friends, with a sorceress waiting behind it.",
    initials: "RN3", imdbId: "tt1236246", imdbRating: 7.0,
    universe: "tv", studio: "Hulu", franchise: "Runaways",
    characters: [], villains: ["Morgan le Fay", "Gibborim"],
  },
  {
    id: "cloak-and-dagger-season-1", kind: "series", title: "Cloak & Dagger: Season 1", year: 2018,
    season: 1, showId: "cloak-and-dagger",
    releaseDate: "2018-06-07", director: "Joe Pokaski", runtime: 430, seasons: 1, episodes: 10,
    synopsis: "Two New Orleans teenagers wake with linked powers of light and darkness they cannot separate.",
    initials: "CD1", imdbId: "tt5614844", imdbRating: 6.6,
    universe: "tv", studio: "Freeform", franchise: "Cloak & Dagger",
    characters: [], villains: ["Roxxon", "Detective Connors"],
  },
  {
    id: "cloak-and-dagger-season-2", kind: "series", title: "Cloak & Dagger: Season 2", year: 2019,
    season: 2, showId: "cloak-and-dagger",
    releaseDate: "2019-04-04", director: "Joe Pokaski", runtime: 430, seasons: 1, episodes: 10,
    synopsis: "A trafficking ring working New Orleans, and the piece of Tandy that broke off and walks alone.",
    initials: "CD2", imdbId: "tt5614844", imdbRating: 6.6,
    universe: "tv", studio: "Freeform", franchise: "Cloak & Dagger",
    characters: [], villains: ["Mayhem", "Andre Deschaine"],
  },
];
