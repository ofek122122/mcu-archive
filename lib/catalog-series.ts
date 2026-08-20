import type { Movie } from "@/lib/types";

/**
 * Marvel Studios television — the Disney+ series and Special Presentations that
 * share continuity with the films, Phase Four onward.
 *
 * ── Modelling ──────────────────────────────────────────────────────────────
 * One entry per *series*, not per season: Loki covers both its seasons and
 * What If...? all three. `runtime` is the total across every episode, so watch
 * time and the runtime sort behave the same for films and series alike.
 * Episode counts and totals are close approximations — episode lengths vary
 * within a season, so treat the watch-time figures as indicative, not exact.
 *
 * Specials (Werewolf by Night, the Holiday Special) are single-episode entries.
 */
const STUDIO = "Marvel Studios";

export const MCU_SERIES: Movie[] = [
  // ── Phase Four ─────────────────────────────────────────────────────────────
  {
    id: "wandavision", kind: "series", title: "WandaVision", year: 2021, phase: 4,
    releaseDate: "2021-01-15", director: "Jac Schaeffer", runtime: 335, seasons: 1, episodes: 9,
    synopsis: "Two super-powered beings live an idyllic sitcom life that keeps changing decade, and cracking.",
    initials: "WV", imdbId: "tt9140560", imdbRating: 7.9,
    universe: "mcu", studio: STUDIO, franchise: "WandaVision",
    characters: [], villains: ["Agatha Harkness", "Tyler Hayward"],
  },
  {
    id: "the-falcon-and-the-winter-soldier", kind: "series", title: "The Falcon and the Winter Soldier", year: 2021, phase: 4,
    releaseDate: "2021-03-19", director: "Malcolm Spellman", runtime: 300, seasons: 1, episodes: 6,
    synopsis: "Sam Wilson and Bucky Barnes are thrown together against a stateless army, and against the shield.",
    initials: "FWS", imdbId: "tt9208876", imdbRating: 7.1,
    universe: "mcu", studio: STUDIO, franchise: "Captain America",
    characters: ["captain-america"], villains: ["Flag Smashers", "John Walker", "Baron Zemo"],
  },
  {
    id: "loki", kind: "series", title: "Loki", year: 2021, phase: 4,
    releaseDate: "2021-06-09", director: "Michael Waldron", runtime: 600, seasons: 2, episodes: 12,
    synopsis: "A stray Loki is conscripted by the Time Variance Authority to hunt a version of himself.",
    initials: "LK", imdbId: "tt9140554", imdbRating: 8.2,
    universe: "mcu", studio: STUDIO, franchise: "Loki",
    characters: ["thor"], villains: ["He Who Remains", "Ravonna Renslayer"],
  },
  {
    id: "what-if", kind: "series", title: "What If...?", year: 2021, phase: 4,
    releaseDate: "2021-08-11", director: "A.C. Bradley", runtime: 800, seasons: 3, episodes: 26,
    synopsis: "The Watcher observes the branching realities where single moments of the MCU went differently.",
    initials: "WI", imdbId: "tt10168312", imdbRating: 7.3,
    universe: "mcu", studio: STUDIO, franchise: "What If...?",
    characters: ["captain-america", "iron-man", "thor", "doctor-strange", "guardians"],
    villains: ["Infinity Ultron", "Strange Supreme"],
  },
  {
    id: "hawkeye", kind: "series", title: "Hawkeye", year: 2021, phase: 4,
    releaseDate: "2021-11-24", director: "Jonathan Igla", runtime: 288, seasons: 1, episodes: 6,
    synopsis: "Clint Barton wants to be home for Christmas; his years as Ronin have other plans.",
    initials: "HK", imdbId: "tt10160804", imdbRating: 7.4,
    universe: "mcu", studio: STUDIO, franchise: "Hawkeye",
    characters: [], villains: ["Kingpin", "Yelena Belova", "Tracksuit Mafia"],
  },
  {
    id: "moon-knight", kind: "series", title: "Moon Knight", year: 2022, phase: 4,
    releaseDate: "2022-03-30", director: "Jeremy Slater", runtime: 285, seasons: 1, episodes: 6,
    synopsis: "A gift-shop clerk with dissociative identity disorder is also an Egyptian god's fist.",
    initials: "MK", imdbId: "tt10234724", imdbRating: 7.3,
    universe: "mcu", studio: STUDIO, franchise: "Moon Knight",
    characters: [], villains: ["Arthur Harrow", "Ammit"],
  },
  {
    id: "ms-marvel", kind: "series", title: "Ms. Marvel", year: 2022, phase: 4,
    releaseDate: "2022-06-08", director: "Bisha K. Ali", runtime: 275, seasons: 1, episodes: 6,
    synopsis: "A Jersey City teenager and Captain Marvel superfan gets the powers she has been daydreaming about.",
    initials: "MM", imdbId: "tt10857164", imdbRating: 6.2,
    universe: "mcu", studio: STUDIO, franchise: "Captain Marvel",
    characters: ["captain-marvel"], villains: ["Clandestines", "Damage Control"],
  },
  {
    id: "i-am-groot", kind: "series", title: "I Am Groot", year: 2022, phase: 4,
    releaseDate: "2022-08-10", director: "Kirsten Lepore", runtime: 45, seasons: 2, episodes: 10,
    synopsis: "Baby Groot causes small, wordless catastrophes aboard and around the Milano.",
    initials: "IAG", imdbId: "tt13623148", imdbRating: 6.7,
    universe: "mcu", studio: STUDIO, franchise: "Guardians of the Galaxy",
    characters: ["guardians"], villains: [],
  },
  {
    id: "she-hulk-attorney-at-law", kind: "series", title: "She-Hulk: Attorney at Law", year: 2022, phase: 4,
    releaseDate: "2022-08-18", director: "Jessica Gao", runtime: 290, seasons: 1, episodes: 9,
    synopsis: "Jennifer Walters inherits her cousin's gamma blood and a superhuman law practice she never wanted.",
    initials: "SH", imdbId: "tt10857160", imdbRating: 5.2,
    universe: "mcu", studio: STUDIO, franchise: "She-Hulk",
    characters: ["hulk", "daredevil"], villains: ["Titania", "Intelligencia", "Abomination"],
  },
  {
    id: "werewolf-by-night", kind: "series", title: "Werewolf by Night", year: 2022, phase: 4,
    releaseDate: "2022-10-07", director: "Michael Giacchino", runtime: 53, seasons: 1, episodes: 1,
    synopsis: "Monster hunters gather by torchlight to compete for a relic, and one of them is the monster.",
    initials: "WBN", imdbId: "tt15318872", imdbRating: 7.1,
    universe: "mcu", studio: STUDIO, franchise: "Marvel Specials",
    characters: [], villains: ["Verussa Bloodstone"],
  },
  {
    id: "guardians-of-the-galaxy-holiday-special", kind: "series", title: "The Guardians of the Galaxy Holiday Special", year: 2022, phase: 4,
    releaseDate: "2022-11-25", director: "James Gunn", runtime: 44, seasons: 1, episodes: 1,
    synopsis: "Mantis and Drax go to Earth to kidnap Kevin Bacon as a Christmas present for Peter Quill.",
    initials: "GHS", imdbId: "tt13623136", imdbRating: 6.9,
    universe: "mcu", studio: STUDIO, franchise: "Guardians of the Galaxy",
    characters: ["guardians"], villains: [],
  },

  // ── Phase Five ─────────────────────────────────────────────────────────────
  {
    id: "secret-invasion", kind: "series", title: "Secret Invasion", year: 2023, phase: 5,
    releaseDate: "2023-06-21", director: "Kyle Bradstreet", runtime: 300, seasons: 1, episodes: 6,
    synopsis: "Nick Fury returns to Earth to find shapeshifting Skrulls rooted at every level of power.",
    initials: "SI", imdbId: "tt13157618", imdbRating: 5.8,
    universe: "mcu", studio: STUDIO, franchise: "Secret Invasion",
    characters: [], villains: ["Gravik", "Skrulls"],
  },
  {
    id: "echo", kind: "series", title: "Echo", year: 2024, phase: 5,
    releaseDate: "2024-01-09", director: "Marion Dayre", runtime: 220, seasons: 1, episodes: 5,
    synopsis: "Maya Lopez goes home to Oklahoma with Kingpin's criminal empire following her.",
    initials: "EC", imdbId: "tt13966962", imdbRating: 5.9,
    universe: "mcu", studio: STUDIO, franchise: "Daredevil (MCU)",
    characters: ["daredevil"], villains: ["Kingpin"],
  },
  {
    id: "agatha-all-along", kind: "series", title: "Agatha All Along", year: 2024, phase: 5,
    releaseDate: "2024-09-18", director: "Jac Schaeffer", runtime: 320, seasons: 1, episodes: 9,
    synopsis: "A powerless Agatha Harkness assembles a desperate coven to walk the Witches' Road.",
    initials: "AAA", imdbId: "tt15571732", imdbRating: 7.2,
    universe: "mcu", studio: STUDIO, franchise: "WandaVision",
    characters: [], villains: ["Rio Vidal", "The Salem Seven"],
  },
  {
    id: "your-friendly-neighborhood-spider-man", kind: "series", title: "Your Friendly Neighborhood Spider-Man", year: 2025, phase: 5,
    releaseDate: "2025-01-29", director: "Jeff Trammell", runtime: 280, seasons: 1, episodes: 10,
    synopsis: "A retro-styled retelling of Peter Parker's first year, mentored by Norman Osborn instead of Stark.",
    initials: "YFN", imdbId: "tt16027074", imdbRating: 7.5,
    universe: "mcu", studio: STUDIO, franchise: "Spider-Man (MCU)",
    characters: ["spider-man", "doctor-strange"], villains: ["Norman Osborn", "Scorpion", "Tarantula"],
  },
  {
    id: "daredevil-born-again", kind: "series", title: "Daredevil: Born Again", year: 2025, phase: 5,
    releaseDate: "2025-03-04", director: "Dario Scardapane", runtime: 450, seasons: 1, episodes: 9,
    synopsis: "Matt Murdock has hung up the horns and Wilson Fisk is running for mayor. Neither lasts.",
    initials: "DBA", imdbId: "tt18923754", imdbRating: 8.2,
    universe: "mcu", studio: STUDIO, franchise: "Daredevil (MCU)",
    characters: ["daredevil", "punisher"], villains: ["Kingpin", "Muse", "Bullseye"],
  },
  {
    id: "ironheart", kind: "series", title: "Ironheart", year: 2025, phase: 5,
    releaseDate: "2025-06-24", director: "Chinaka Hodge", runtime: 300, seasons: 1, episodes: 6,
    synopsis: "Riri Williams builds the best armour since Stark and falls in with a man wearing a magic hood.",
    initials: "IH", imdbId: "tt13623126", imdbRating: 4.5,
    universe: "mcu", studio: STUDIO, franchise: "Iron Man",
    characters: ["iron-man"], villains: ["The Hood", "Mephisto"],
  },
  {
    id: "eyes-of-wakanda", kind: "series", title: "Eyes of Wakanda", year: 2025, phase: 5,
    releaseDate: "2025-08-01", director: "Todd Harris", runtime: 110, seasons: 1, episodes: 4,
    synopsis: "Across centuries, Wakandan War Dogs are sent into the world to reclaim stolen vibranium.",
    initials: "EOW", imdbId: "tt13968252", imdbRating: 6.2,
    universe: "mcu", studio: STUDIO, franchise: "Black Panther",
    characters: ["black-panther"], villains: ["The Lion"],
  },
  {
    id: "marvel-zombies", kind: "series", title: "Marvel Zombies", year: 2025, phase: 5,
    releaseDate: "2025-09-24", director: "Zeb Wells", runtime: 130, seasons: 1, episodes: 4,
    synopsis: "In a reality the Watcher would rather not discuss, the survivors hunt a cure for the undead.",
    initials: "MZ", imdbId: "tt16027014", imdbRating: 7.0,
    universe: "mcu", studio: STUDIO, franchise: "What If...?",
    characters: ["captain-marvel", "ant-man"], villains: ["Zombie Scarlet Witch", "Zombie Avengers"],
  },

  // ── Phase Six ──────────────────────────────────────────────────────────────
  {
    id: "wonder-man", kind: "series", title: "Wonder Man", year: 2026, phase: 6,
    releaseDate: "2026-01-27", director: "Andrew Guest", runtime: 240, seasons: 1, episodes: 8,
    synopsis: "A jobbing actor with superpowers chases the one role that might finally make him somebody.",
    initials: "WM", imdbId: "tt21066182", imdbRating: 7.5,
    universe: "mcu", studio: STUDIO, franchise: "Wonder Man",
    characters: [], villains: ["Trevor Slattery"],
  },
];
