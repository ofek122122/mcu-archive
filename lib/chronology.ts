/**
 * MCU in-universe chronological order — the single source of truth for the
 * "Story order" toggle on the MCU Timeline.
 *
 * Films and Marvel Studios series are interleaved here; `chronoOrder` on each
 * title is derived from this array's index in `lib/movies.ts`, so there is one
 * place to reorder rather than several dozen hand-maintained numbers.
 *
 * ── A caveat worth reading ─────────────────────────────────────────────────
 * Chronological placement is genuinely contested past a certain point. Series
 * span months or years of story time, several overlap outright, and a few sit
 * outside the main timeline entirely — What If...? and Marvel Zombies are other
 * realities, Your Friendly Neighborhood Spider-Man is an alternate branch, and
 * Eyes of Wakanda ranges over centuries and is placed at its earliest story.
 * This ordering follows Marvel's own published timeline where one exists and
 * makes a judgement call where it does not.
 */
export const MCU_CHRONOLOGY: readonly string[] = [
  // Ancient history through the Second World War
  "eyes-of-wakanda",
  "captain-america-the-first-avenger",
  "captain-marvel",

  // The Infinity Saga
  "iron-man",
  "iron-man-2",
  "the-incredible-hulk",
  "thor",
  "the-avengers",
  "iron-man-3",
  "thor-the-dark-world",
  "captain-america-the-winter-soldier",
  "guardians-of-the-galaxy",
  "i-am-groot",
  "guardians-of-the-galaxy-vol-2",
  "avengers-age-of-ultron",
  "ant-man",
  "captain-america-civil-war",
  "black-widow",
  "black-panther",
  "spider-man-homecoming",
  "doctor-strange",
  "thor-ragnarok",
  "ant-man-and-the-wasp",
  "avengers-infinity-war",
  "avengers-endgame",

  // The Multiverse Saga
  "loki",
  "what-if",
  "marvel-zombies",
  "wandavision",
  "the-falcon-and-the-winter-soldier",
  "shang-chi-and-the-legend-of-the-ten-rings",
  "eternals",
  "spider-man-far-from-home",
  "hawkeye",
  "spider-man-no-way-home",
  "moon-knight",
  "ms-marvel",
  "she-hulk-attorney-at-law",
  "doctor-strange-in-the-multiverse-of-madness",
  "thor-love-and-thunder",
  "werewolf-by-night",
  "black-panther-wakanda-forever",
  "guardians-of-the-galaxy-holiday-special",
  "ant-man-and-the-wasp-quantumania",
  "secret-invasion",
  "guardians-of-the-galaxy-vol-3",
  "echo",
  "daredevil-born-again",
  "the-marvels",
  "agatha-all-along",
  "your-friendly-neighborhood-spider-man",
  "ironheart",
  "deadpool-and-wolverine",
  "captain-america-brave-new-world",
  "thunderbolts",
  "wonder-man",
  "the-fantastic-four-first-steps",
  "spider-man-brand-new-day",
  "avengers-doomsday",
  "avengers-secret-wars",
];

/** id → 1-based chronological position. */
export const CHRONO_INDEX: ReadonlyMap<string, number> = new Map(
  MCU_CHRONOLOGY.map((id, index) => [id, index + 1]),
);
