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
 *
 * -- Seasons are placed individually ----------------------------------------
 * A show whose seasons are separated by films in story order cannot be one
 * entry here, because one entry can only occupy one position. Loki is the clear
 * case: season 1 opens the moment Endgame's time heist ends, then eight films
 * pass before season 2 picks up the Kang thread that Quantumania sets running.
 * Those shows are split into per-season titles in the catalog (`season` and
 * `showId` on each), and each season is placed where it actually belongs.
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
  // Both seasons of the shorts are the same baby-Groot era, so they stay
  // together -- split for tracking, not because films separate them.
  "i-am-groot-season-1",
  "i-am-groot-season-2",
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
  // Loki season 1 begins seconds after the Endgame time heist.
  "loki-season-1",
  "what-if-season-1",
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
  // ...and season 2 lands here, eight films later, taking up the Kang problem
  // Quantumania leaves open.
  "loki-season-2",
  "what-if-season-2",
  "secret-invasion",
  "guardians-of-the-galaxy-vol-3",
  "echo",
  "daredevil-born-again",
  "the-marvels",
  "what-if-season-3",
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

/**
 * ── Eras ───────────────────────────────────────────────────────────────────
 * Story order cannot be chaptered by phase. A phase is a release-order bucket,
 * and once the list is sorted by story the phases interleave badly: walking the
 * order above, the phase number changes 19 times across 64 titles, and Phase
 * Four alone comes round five separate times. Chapters built that way would say
 * "Phase Four" five times over and mean a different stretch each time.
 *
 * So the chapters here are eras of the story instead. Each opens on the title
 * that starts it and runs until the next one opens, which keeps this array the
 * only thing to edit — reorder the chronology and the chapters follow.
 *
 * The phase is still shown, as a tag on every card. That is where it reads
 * correctly: per title, not per stretch of timeline.
 */
export type ChronoEra = {
  key: string;
  label: string;
  /** Where the era sits in story time. */
  sub: string;
  /** The title the era opens on; it runs until the next era's opener. */
  startsAt: string;
};

export const CHRONO_ERAS: readonly ChronoEra[] = [
  {
    key: "before",
    label: "Before the Age of Heroes",
    sub: "Ancient Wakanda · 1943 · 1995",
    startsAt: "eyes-of-wakanda",
  },
  {
    key: "rise",
    label: "The Age of Heroes",
    sub: "Stark builds the suit, and the Avengers assemble",
    startsAt: "iron-man",
  },
  {
    key: "after-new-york",
    label: "After New York",
    sub: "A world that has seen what came through the portal",
    startsAt: "iron-man-3",
  },
  {
    key: "accords",
    label: "The Accords and the Snap",
    sub: "The Avengers split, and half of everything goes",
    startsAt: "ant-man",
  },
  {
    key: "blip",
    label: "After the Blip",
    sub: "Five years returned, and nobody left unchanged",
    startsAt: "loki-season-1",
  },
  {
    key: "multiverse",
    label: "The Multiverse Unravels",
    sub: "Incursions, variants, and the road to Secret Wars",
    startsAt: "loki-season-2",
  },
];

/**
 * id → era key, derived by walking the chronology. An era claims every title
 * from its opener up to the next opener.
 *
 * A missing opener throws rather than folding silently into the era before it:
 * the data is static, so this can only fire when someone renames or removes a
 * title above, and it should fire at build time rather than ship a timeline
 * with a chapter quietly swallowed.
 */
export const ERA_BY_ID: ReadonlyMap<string, string> = (() => {
  const opens = new Map<string, string>();
  for (const era of CHRONO_ERAS) {
    if (!CHRONO_INDEX.has(era.startsAt)) {
      throw new Error(
        `Era "${era.key}" opens on "${era.startsAt}", which is not in MCU_CHRONOLOGY.`,
      );
    }
    opens.set(era.startsAt, era.key);
  }

  const byId = new Map<string, string>();
  let current = CHRONO_ERAS[0].key;
  for (const id of MCU_CHRONOLOGY) {
    current = opens.get(id) ?? current;
    byId.set(id, current);
  }
  return byId;
})();
