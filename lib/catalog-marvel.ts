import type { Movie } from "@/lib/types";

/**
 * Marvel theatrical films made outside Marvel Studios — the Fox X-Men and
 * Fantastic Four runs, Sony's Spider-Man and SSU films, and the older
 * Universal / New Line / Lionsgate adaptations.
 *
 * These carry no `phase` or `chronoOrder`: they are grouped by franchise
 * instead, which is also what drives their colour story (see lib/universes.ts).
 */
export const OTHER_MOVIES: Movie[] = [
  // ── New Line — Blade ───────────────────────────────────────────────────────
  {
    id: "blade", title: "Blade", year: 1998,
    releaseDate: "1998-08-21", director: "Stephen Norrington", runtime: 120,
    synopsis: "A half-vampire daywalker wages a one-man war on the bloodline that made him.",
    initials: "BL", imdbId: "tt0120611", imdbRating: 7.1,
    universe: "legacy", studio: "New Line Cinema", franchise: "Blade",
    characters: ["blade"], villains: ["Deacon Frost"],
  },
  {
    id: "blade-ii", title: "Blade II", year: 2002,
    releaseDate: "2002-03-22", director: "Guillermo del Toro", runtime: 117,
    synopsis: "Blade allies with the vampires he hunts against a mutation that feeds on them both.",
    initials: "BL2", imdbId: "tt0187738", imdbRating: 6.7,
    universe: "legacy", studio: "New Line Cinema", franchise: "Blade",
    characters: ["blade"], villains: ["Jared Nomak", "Damaskinos"],
  },
  {
    id: "blade-trinity", title: "Blade: Trinity", year: 2004,
    releaseDate: "2004-12-08", director: "David S. Goyer", runtime: 113,
    synopsis: "Framed for murder, Blade joins the Nightstalkers against the first vampire.",
    initials: "BL3", imdbId: "tt0359013", imdbRating: 5.9,
    universe: "legacy", studio: "New Line Cinema", franchise: "Blade",
    characters: ["blade"], villains: ["Drake / Dracula", "Danica Talos"],
  },

  // ── Universal — Hulk ───────────────────────────────────────────────────────
  {
    id: "hulk-2003", title: "Hulk", year: 2003,
    releaseDate: "2003-06-20", director: "Ang Lee", runtime: 138,
    synopsis: "A gamma accident unlocks the rage Bruce Banner's father buried in his blood.",
    initials: "HK", imdbId: "tt0286716", imdbRating: 5.7,
    universe: "legacy", studio: "Universal Pictures", franchise: "Hulk",
    characters: ["hulk"], villains: ["David Banner", "Absorbing Man"],
  },

  // ── Lionsgate — Punisher ───────────────────────────────────────────────────
  {
    id: "the-punisher-2004", title: "The Punisher", year: 2004,
    releaseDate: "2004-04-16", director: "Jonathan Hensleigh", runtime: 124,
    synopsis: "An FBI agent whose family is slaughtered turns himself into an instrument of revenge.",
    initials: "PN", imdbId: "tt0330793", imdbRating: 6.4,
    universe: "legacy", studio: "Lionsgate", franchise: "Punisher",
    characters: ["punisher"], villains: ["Howard Saint"],
  },
  {
    id: "punisher-war-zone", title: "Punisher: War Zone", year: 2008,
    releaseDate: "2008-12-05", director: "Lexi Alexander", runtime: 103,
    synopsis: "Frank Castle's war on the mob creates a disfigured gangster who wants him dead.",
    initials: "PWZ", imdbId: "tt0450314", imdbRating: 6.0,
    universe: "legacy", studio: "Lionsgate", franchise: "Punisher",
    characters: ["punisher"], villains: ["Jigsaw", "Loony Bin Jim"],
  },

  // ── Fox — X-Men ────────────────────────────────────────────────────────────
  {
    id: "x-men", title: "X-Men", year: 2000,
    releaseDate: "2000-07-14", director: "Bryan Singer", runtime: 104,
    synopsis: "Two mutant factions split over whether humanity can be lived with or must be remade.",
    initials: "XM", imdbId: "tt0120903", imdbRating: 7.4,
    universe: "fox", studio: "20th Century Fox", franchise: "X-Men",
    characters: ["wolverine"], villains: ["Magneto", "Sabretooth", "Mystique"],
  },
  {
    id: "x2", title: "X2: X-Men United", year: 2003,
    releaseDate: "2003-05-02", director: "Bryan Singer", runtime: 134,
    synopsis: "A military scientist's assault on the mansion forces mutants and Magneto into alliance.",
    initials: "X2", imdbId: "tt0290334", imdbRating: 7.4,
    universe: "fox", studio: "20th Century Fox", franchise: "X-Men",
    characters: ["wolverine"], villains: ["William Stryker", "Lady Deathstrike"],
  },
  {
    id: "x-men-the-last-stand", title: "X-Men: The Last Stand", year: 2006,
    releaseDate: "2006-05-26", director: "Brett Ratner", runtime: 104,
    synopsis: "A mutant cure fractures both sides just as Jean Grey returns as something worse.",
    initials: "X3", imdbId: "tt0376994", imdbRating: 6.7,
    universe: "fox", studio: "20th Century Fox", franchise: "X-Men",
    characters: ["wolverine"], villains: ["Magneto", "Dark Phoenix", "Juggernaut"],
  },
  {
    id: "x-men-origins-wolverine", title: "X-Men Origins: Wolverine", year: 2009,
    releaseDate: "2009-05-01", director: "Gavin Hood", runtime: 107,
    synopsis: "Logan submits to the Weapon X programme and loses everything it promised to protect.",
    initials: "XOW", imdbId: "tt0458525", imdbRating: 6.6,
    universe: "fox", studio: "20th Century Fox", franchise: "X-Men",
    characters: ["wolverine", "deadpool"], villains: ["Victor Creed", "Weapon XI", "William Stryker"],
  },
  {
    id: "x-men-first-class", title: "X-Men: First Class", year: 2011,
    releaseDate: "2011-06-03", director: "Matthew Vaughn", runtime: 132,
    synopsis: "Charles Xavier and Erik Lehnsherr build a team, and a rift, during the Cuban missile crisis.",
    initials: "XFC", imdbId: "tt1270798", imdbRating: 7.7,
    universe: "fox", studio: "20th Century Fox", franchise: "X-Men",
    characters: ["wolverine"], villains: ["Sebastian Shaw", "Emma Frost"],
  },
  {
    id: "the-wolverine", title: "The Wolverine", year: 2013,
    releaseDate: "2013-07-26", director: "James Mangold", runtime: 126,
    synopsis: "Summoned to Japan by a man he once saved, Logan is offered the mortality he craves.",
    initials: "TW", imdbId: "tt1430132", imdbRating: 6.7,
    universe: "fox", studio: "20th Century Fox", franchise: "X-Men",
    characters: ["wolverine"], villains: ["Silver Samurai", "Viper"],
  },
  {
    id: "x-men-days-of-future-past", title: "X-Men: Days of Future Past", year: 2014,
    releaseDate: "2014-05-23", director: "Bryan Singer", runtime: 132,
    synopsis: "Logan is sent back to 1973 to stop the assassination that dooms every mutant.",
    initials: "DOFP", imdbId: "tt1877832", imdbRating: 7.9,
    universe: "fox", studio: "20th Century Fox", franchise: "X-Men",
    characters: ["wolverine"], villains: ["Bolivar Trask", "Sentinels"],
  },
  {
    id: "x-men-apocalypse", title: "X-Men: Apocalypse", year: 2016,
    releaseDate: "2016-05-27", director: "Bryan Singer", runtime: 144,
    synopsis: "The world's first mutant wakes after millennia and recruits four horsemen to end it.",
    initials: "XA", imdbId: "tt3385516", imdbRating: 6.9,
    universe: "fox", studio: "20th Century Fox", franchise: "X-Men",
    characters: ["wolverine"], villains: ["Apocalypse", "Four Horsemen"],
  },
  {
    id: "logan", title: "Logan", year: 2017,
    releaseDate: "2017-03-03", director: "James Mangold", runtime: 137,
    synopsis: "A dying Wolverine shepherds a feral girl north while the world that made them closes in.",
    initials: "LG", imdbId: "tt3315342", imdbRating: 8.1,
    universe: "fox", studio: "20th Century Fox", franchise: "X-Men",
    characters: ["wolverine"], villains: ["Donald Pierce", "X-24"],
  },
  {
    id: "dark-phoenix", title: "Dark Phoenix", year: 2019,
    releaseDate: "2019-06-07", director: "Simon Kinberg", runtime: 113,
    synopsis: "A cosmic force rewrites Jean Grey, and the X-Men fracture over what to do about it.",
    initials: "DPX", imdbId: "tt6565702", imdbRating: 5.7,
    universe: "fox", studio: "20th Century Fox", franchise: "X-Men",
    characters: ["wolverine"], villains: ["Vuk", "Dark Phoenix"],
  },
  {
    id: "the-new-mutants", title: "The New Mutants", year: 2020,
    releaseDate: "2020-08-28", director: "Josh Boone", runtime: 94,
    synopsis: "Five young mutants are held in a facility that turns their traumas against them.",
    initials: "NM", imdbId: "tt4682266", imdbRating: 5.2,
    universe: "fox", studio: "20th Century Fox", franchise: "X-Men",
    characters: ["wolverine"], villains: ["Dr. Cecilia Reyes", "Demon Bear"],
  },

  // ── Fox — Deadpool ─────────────────────────────────────────────────────────
  {
    id: "deadpool", title: "Deadpool", year: 2016,
    releaseDate: "2016-02-12", director: "Tim Miller", runtime: 108,
    synopsis: "A terminal mercenary is tortured into immortality and goes hunting for the man who did it.",
    initials: "DP", imdbId: "tt1431045", imdbRating: 8.0,
    universe: "fox", studio: "20th Century Fox", franchise: "Deadpool",
    characters: ["deadpool"], villains: ["Ajax", "Angel Dust"],
  },
  {
    id: "deadpool-2", title: "Deadpool 2", year: 2018,
    releaseDate: "2018-05-18", director: "David Leitch", runtime: 119,
    synopsis: "Wade assembles X-Force to protect a boy a soldier from the future has come to kill.",
    initials: "DP2", imdbId: "tt5463162", imdbRating: 7.6,
    universe: "fox", studio: "20th Century Fox", franchise: "Deadpool",
    characters: ["deadpool"], villains: ["Cable", "Juggernaut"],
  },

  // ── Fox — Fantastic Four ───────────────────────────────────────────────────
  {
    id: "fantastic-four-2005", title: "Fantastic Four", year: 2005,
    releaseDate: "2005-07-08", director: "Tim Story", runtime: 106,
    synopsis: "A cosmic storm rewrites four astronauts and the rival who funded their flight.",
    initials: "FF", imdbId: "tt0120667", imdbRating: 5.7,
    universe: "fox", studio: "20th Century Fox", franchise: "Fantastic Four",
    characters: ["fantastic-four"], villains: ["Doctor Doom"],
  },
  {
    id: "fantastic-four-rise-of-the-silver-surfer", title: "Fantastic Four: Rise of the Silver Surfer", year: 2007,
    releaseDate: "2007-06-15", director: "Tim Story", runtime: 92,
    synopsis: "A silver herald circles the Earth, and whatever sent him is close behind.",
    initials: "FF2", imdbId: "tt0486576", imdbRating: 5.6,
    universe: "fox", studio: "20th Century Fox", franchise: "Fantastic Four",
    characters: ["fantastic-four"], villains: ["Silver Surfer", "Galactus", "Doctor Doom"],
  },
  {
    id: "fantastic-four-2015", title: "Fantastic Four", year: 2015,
    releaseDate: "2015-08-07", director: "Josh Trank", runtime: 100,
    synopsis: "Four young scientists return from another dimension changed in ways they cannot undo.",
    initials: "FF15", imdbId: "tt1502712", imdbRating: 4.3,
    universe: "fox", studio: "20th Century Fox", franchise: "Fantastic Four",
    characters: ["fantastic-four"], villains: ["Doctor Doom"],
  },

  // ── Fox — Daredevil ────────────────────────────────────────────────────────
  {
    id: "daredevil", title: "Daredevil", year: 2003,
    releaseDate: "2003-02-14", director: "Mark Steven Johnson", runtime: 103,
    synopsis: "A blind lawyer prosecutes by day and sentences by night in Hell's Kitchen.",
    initials: "DD", imdbId: "tt0287978", imdbRating: 5.3,
    universe: "fox", studio: "20th Century Fox", franchise: "Daredevil",
    characters: ["daredevil"], villains: ["Kingpin", "Bullseye"],
  },
  {
    id: "elektra", title: "Elektra", year: 2005,
    releaseDate: "2005-01-14", director: "Rob Bowman", runtime: 97,
    synopsis: "A resurrected assassin is hired to kill a target she decides to protect instead.",
    initials: "EL", imdbId: "tt0357277", imdbRating: 4.8,
    universe: "fox", studio: "20th Century Fox", franchise: "Daredevil",
    characters: ["daredevil"], villains: ["The Hand", "Kirigi"],
  },

  // ── Sony — Spider-Man (Raimi) ──────────────────────────────────────────────
  {
    id: "spider-man-2002", title: "Spider-Man", year: 2002,
    releaseDate: "2002-05-03", director: "Sam Raimi", runtime: 121,
    synopsis: "A bitten teenager learns what power costs when he lets a thief walk past him.",
    initials: "SM", imdbId: "tt0145487", imdbRating: 7.4,
    universe: "sony", studio: "Sony Pictures", franchise: "Spider-Man",
    characters: ["spider-man"], villains: ["Green Goblin"],
  },
  {
    id: "spider-man-2", title: "Spider-Man 2", year: 2004,
    releaseDate: "2004-06-30", director: "Sam Raimi", runtime: 127,
    synopsis: "Peter's powers fail as a fusion accident turns his hero into a four-armed menace.",
    initials: "SM2", imdbId: "tt0316654", imdbRating: 7.5,
    universe: "sony", studio: "Sony Pictures", franchise: "Spider-Man",
    characters: ["spider-man"], villains: ["Doctor Octopus"],
  },
  {
    id: "spider-man-3", title: "Spider-Man 3", year: 2007,
    releaseDate: "2007-05-04", director: "Sam Raimi", runtime: 139,
    synopsis: "An alien symbiote amplifies everything in Peter he has been trying not to be.",
    initials: "SM3", imdbId: "tt0413300", imdbRating: 6.3,
    universe: "sony", studio: "Sony Pictures", franchise: "Spider-Man",
    characters: ["spider-man"], villains: ["Venom", "Sandman", "New Goblin"],
  },

  // ── Sony — The Amazing Spider-Man ──────────────────────────────────────────
  {
    id: "the-amazing-spider-man", title: "The Amazing Spider-Man", year: 2012,
    releaseDate: "2012-07-03", director: "Marc Webb", runtime: 136,
    synopsis: "Chasing his father's research, Peter helps a scientist become the thing he must stop.",
    initials: "ASM", imdbId: "tt0948470", imdbRating: 6.9,
    universe: "sony", studio: "Sony Pictures", franchise: "The Amazing Spider-Man",
    characters: ["spider-man"], villains: ["The Lizard"],
  },
  {
    id: "the-amazing-spider-man-2", title: "The Amazing Spider-Man 2", year: 2014,
    releaseDate: "2014-05-02", director: "Marc Webb", runtime: 142,
    synopsis: "Oscorp's secrets produce a man made of lightning and cost Peter everything.",
    initials: "ASM2", imdbId: "tt1872181", imdbRating: 6.6,
    universe: "sony", studio: "Sony Pictures", franchise: "The Amazing Spider-Man",
    characters: ["spider-man"], villains: ["Electro", "Green Goblin", "Rhino"],
  },

  // ── Sony — Spider-Verse ────────────────────────────────────────────────────
  {
    id: "spider-man-into-the-spider-verse", title: "Spider-Man: Into the Spider-Verse", year: 2018,
    releaseDate: "2018-12-14", director: "Bob Persichetti, Peter Ramsey & Rodney Rothman", runtime: 117,
    synopsis: "Miles Morales meets the other Spider-People a collider has torn into his Brooklyn.",
    initials: "ITSV", imdbId: "tt4633694", imdbRating: 8.4,
    universe: "sony", studio: "Sony Pictures Animation", franchise: "Spider-Verse",
    characters: ["spider-man"], villains: ["Kingpin", "Prowler", "Doctor Octopus"],
  },
  {
    id: "spider-man-across-the-spider-verse", title: "Spider-Man: Across the Spider-Verse", year: 2023,
    releaseDate: "2023-06-02", director: "Joaquim Dos Santos, Kemp Powers & Justin K. Thompson", runtime: 140,
    synopsis: "Miles defies a multiversal Spider-Society that insists his father has to die.",
    initials: "ATSV", imdbId: "tt9362722", imdbRating: 8.5,
    universe: "sony", studio: "Sony Pictures Animation", franchise: "Spider-Verse",
    characters: ["spider-man"], villains: ["The Spot", "Miguel O'Hara"],
  },

  // ── Sony — Venom & SSU ─────────────────────────────────────────────────────
  {
    id: "venom", title: "Venom", year: 2018,
    releaseDate: "2018-10-05", director: "Ruben Fleischer", runtime: 112,
    synopsis: "A disgraced reporter is bonded to an alien that finds him a perfect match.",
    initials: "VN", imdbId: "tt1270797", imdbRating: 6.7,
    universe: "sony", studio: "Sony Pictures", franchise: "Venom",
    characters: [], villains: ["Riot", "Carlton Drake"],
  },
  {
    id: "venom-let-there-be-carnage", title: "Venom: Let There Be Carnage", year: 2021,
    releaseDate: "2021-10-01", director: "Andy Serkis", runtime: 97,
    synopsis: "A serial killer gets a symbiote of his own, and it is far worse than Eddie's.",
    initials: "VN2", imdbId: "tt7097896", imdbRating: 5.9,
    universe: "sony", studio: "Sony Pictures", franchise: "Venom",
    characters: [], villains: ["Carnage", "Shriek"],
  },
  {
    id: "venom-the-last-dance", title: "Venom: The Last Dance", year: 2024,
    releaseDate: "2024-10-25", director: "Kelly Marcel", runtime: 109,
    synopsis: "Eddie and Venom run from both their worlds as the symbiote god hunts them.",
    initials: "VN3", imdbId: "tt16366836", imdbRating: 6.0,
    universe: "sony", studio: "Sony Pictures", franchise: "Venom",
    characters: [], villains: ["Knull", "Xenophages"],
  },
  {
    id: "morbius", title: "Morbius", year: 2022,
    releaseDate: "2022-04-01", director: "Daniel Espinosa", runtime: 104,
    synopsis: "A biochemist cures his blood disease and becomes something that needs blood.",
    initials: "MB", imdbId: "tt5108870", imdbRating: 5.2,
    universe: "sony", studio: "Sony Pictures", franchise: "Sony Marvel",
    characters: [], villains: ["Milo"],
  },
  {
    id: "madame-web", title: "Madame Web", year: 2024,
    releaseDate: "2024-02-14", director: "S.J. Clarkson", runtime: 116,
    synopsis: "A paramedic who sees the future protects three women a stranger is hunting.",
    initials: "MW", imdbId: "tt11057302", imdbRating: 3.8,
    universe: "sony", studio: "Sony Pictures", franchise: "Sony Marvel",
    characters: [], villains: ["Ezekiel Sims"],
  },
  {
    id: "kraven-the-hunter", title: "Kraven the Hunter", year: 2024,
    releaseDate: "2024-12-13", director: "J.C. Chandor", runtime: 127,
    synopsis: "Sergei Kravinoff turns his father's brutality into a code of his own hunting.",
    initials: "KV", imdbId: "tt8790086", imdbRating: 5.4,
    universe: "sony", studio: "Sony Pictures", franchise: "Sony Marvel",
    characters: [], villains: ["Rhino", "The Foreigner"],
  },

  // ── Sony — Ghost Rider ─────────────────────────────────────────────────────
  {
    id: "ghost-rider", title: "Ghost Rider", year: 2007,
    releaseDate: "2007-02-16", director: "Mark Steven Johnson", runtime: 114,
    synopsis: "A stunt rider who sold his soul becomes the devil's bounty hunter.",
    initials: "GR", imdbId: "tt0259324", imdbRating: 5.3,
    universe: "sony", studio: "Sony Pictures", franchise: "Ghost Rider",
    characters: ["ghost-rider"], villains: ["Blackheart", "Mephistopheles"],
  },
  {
    id: "ghost-rider-spirit-of-vengeance", title: "Ghost Rider: Spirit of Vengeance", year: 2011,
    releaseDate: "2011-12-17", director: "Mark Neveldine & Brian Taylor", runtime: 95,
    synopsis: "Johnny Blaze is offered his curse lifted if he protects a boy the devil wants.",
    initials: "GR2", imdbId: "tt1071875", imdbRating: 4.3,
    universe: "sony", studio: "Sony Pictures", franchise: "Ghost Rider",
    characters: ["ghost-rider"], villains: ["Roarke", "Blackout"],
  },
];
