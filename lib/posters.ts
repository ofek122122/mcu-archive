/**
 * Poster artwork, keyed by movie id.
 *
 * Paths point at TMDB's public image CDN. They are kept in their own module
 * rather than inlined into `lib/movies.ts` because they are externally sourced
 * and change independently of the film slate: a poster can be re-pointed here
 * without touching the canonical data.
 *
 * Every path below was verified to return a real image (HTTP 200, >5KB) from
 * `https://image.tmdb.org/t/p/w500<path>`.
 *
 * These are the **English-language** poster variants. TMDB serves localised
 * artwork by default based on request locale, which produced Hebrew posters
 * against an English UI — they were re-sourced with `?language=en-US`. If you
 * would rather have localised artwork, re-run that lookup with a different
 * language code and swap the paths here; nothing else needs to change.
 *
 * ── Changing a poster ───────────────────────────────────────────────────────
 * Point the entry at any URL on a host allow-listed in `next.config.ts`, or
 * drop a file in `public/posters/` and set an absolute path there instead. A
 * movie with no entry — or whose image fails to load — falls back to the
 * generated key art, so this map is always safe to edit.
 *
 * Artwork is courtesy of TMDB. This product uses the TMDB API but is not
 * endorsed or certified by TMDB.
 */

/** w500 is the sweet spot for a 2:3 card: sharp on retina, ~100KB each. */
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

export const POSTER_PATHS: Readonly<Record<string, string>> = {
  // Phase One
  "iron-man": "/78lPtwv72eTNqFW9COBYI0dWDJa.jpg",
  "the-incredible-hulk": "/gKzYx79y0AQTL4UAk1cBQJ3nvrm.jpg",
  "iron-man-2": "/6WBeq4fCfn7AN0o21W9qNcRF2l9.jpg",
  thor: "/prSfAi1xGrhLQNxVSUFh61xQ4Qy.jpg",
  "captain-america-the-first-avenger": "/vSNxAJTlD0r02V9sPYpOjqDZXUK.jpg",
  "the-avengers": "/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg",

  // Phase Two
  "iron-man-3": "/qhPtAc1TKbMPqNvcdXSOn9Bn7hZ.jpg",
  "thor-the-dark-world": "/wp6OxE4poJ4G7c0U2ZIXasTSMR7.jpg",
  "captain-america-the-winter-soldier": "/tVFRpFw3xTedgPGqxW0AOI8Qhh0.jpg",
  "guardians-of-the-galaxy": "/r7vmZjiyZw9rpJMQJdXpjgiCOk9.jpg",
  "avengers-age-of-ultron": "/4ssDuvEDkSArWEdyBl2X5EHvYKU.jpg",
  "ant-man": "/rQRnQfUl3kfp78nCWq8Ks04vnq1.jpg",

  // Phase Three
  "captain-america-civil-war": "/rAGiXaUfPzY7CDEyNKUofk3Kw2e.jpg",
  "doctor-strange": "/uGBVj3bEbCoZbDjjl9wTxcygko1.jpg",
  "guardians-of-the-galaxy-vol-2": "/y4MBh0EjBlMuOzv9axM4qJlmhzz.jpg",
  "spider-man-homecoming": "/c24sv2weTHPsmDa7jEMN0m2P3RT.jpg",
  "thor-ragnarok": "/rzRwTcFvttcN1ZpX2xv4j3tSdJu.jpg",
  "black-panther": "/uxzzxijgPIY7slzFvMotPv8wjKA.jpg",
  "avengers-infinity-war": "/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
  "ant-man-and-the-wasp": "/cFQEO687n1K6umXbInzocxcnAQz.jpg",
  "captain-marvel": "/AtsgWhDnHTq68L0lLsUrCnM7TjG.jpg",
  "avengers-endgame": "/ulzhLuWrPK07P1YkdWQLZnQh1JL.jpg",
  "spider-man-far-from-home": "/4q2NNj4S5dG2RLF9CpXsej7yXl.jpg",

  // Phase Four
  "black-widow": "/qAZ0pzat24kLdO3o8ejmbLxyOac.jpg",
  "shang-chi-and-the-legend-of-the-ten-rings": "/9f2Q0U3IOsLgrI2HkvldwSABZy5.jpg",
  eternals: "/lFByFSLV5WDJEv3KabbdAF959F2.jpg",
  "spider-man-no-way-home": "/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
  "doctor-strange-in-the-multiverse-of-madness": "/ddJcSKbcp4rKZTmuyWaMhuwcfMz.jpg",
  "thor-love-and-thunder": "/pIkRyD18kl4FhoCNQuWxWu5cBLM.jpg",
  "black-panther-wakanda-forever": "/sv1xJUazXeYqALzczSZ3O6nkH75.jpg",

  // Phase Five
  "ant-man-and-the-wasp-quantumania": "/qnqGbB22YJ7dSs4o6M7exTpNxPz.jpg",
  "guardians-of-the-galaxy-vol-3": "/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg",
  "the-marvels": "/9GBhzXMFjgcZ3FdR9w3bUMMTps5.jpg",
  "deadpool-and-wolverine": "/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
  "captain-america-brave-new-world": "/pzIddUEMWhWzfvLI3TwxUG2wGoi.jpg",
  thunderbolts: "/hqcexYHbiTBfDIdDWxrxPtVndBX.jpg",

  // Phase Six
  "the-fantastic-four-first-steps": "/nf5qaSEvyYSNeFH0YhSs5EsBLX9.jpg",
  "spider-man-brand-new-day": "/iPOn6DinuVyLY17YM9mKuPofV08.jpg",
  "avengers-doomsday": "/bh2OuKvq19jBHsloUVCfPSZZw81.jpg",
  "avengers-secret-wars": "/f0YBuh4hyiAheXhh4JnJWoKi9g5.jpg",
};

/** Absolute poster URL for a film, or undefined to fall back to generated art. */
export function posterFor(movieId: string): string | undefined {
  const path = POSTER_PATHS[movieId];
  return path ? `${TMDB_IMAGE_BASE}${path}` : undefined;
}
