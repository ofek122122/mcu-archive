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

  // ── Fox — X-Men ──────────────────────────────────────────────────────────
  "x-men": "/bRDAc4GogyS9ci3ow7UnInOcriN.jpg",
  x2: "/bst4alFUXCxISwdRUKSMhhkrX1M.jpg",
  "x-men-the-last-stand": "/a2xicU8DpKtRizOHjQLC1JyCSRS.jpg",
  "x-men-origins-wolverine": "/yj8LbTju1p7CUJg7US2unSBk33s.jpg",
  "x-men-first-class": "/hNEokmUke0dazoBhttFN0o3L7Xv.jpg",
  "the-wolverine": "/t2wVAcoRlKvEIVSbiYDb8d0QqqS.jpg",
  "x-men-days-of-future-past": "/tYfijzolzgoMOtegh1Y7j2Enorg.jpg",
  "x-men-apocalypse": "/ikA8UhYdTGpqbatFa93nIf6noSr.jpg",
  logan: "/fnbjcRDYn6YviCcePDnGdyAkYsB.jpg",
  "dark-phoenix": "/cCTJPelKGLhALq3r51A9uMonxKj.jpg",
  "the-new-mutants": "/xiDGcXJTvu1lazFRYip6g1eLt9c.jpg",

  // ── Fox — Deadpool ───────────────────────────────────────────────────────
  deadpool: "/3E53WEZJqP6aM84D8CckXx4pIHw.jpg",
  "deadpool-2": "/to0spRl1CMDvyUbOnbb4fTk3VAd.jpg",

  // ── Fox — Fantastic Four & Daredevil ─────────────────────────────────────
  "fantastic-four-2005": "/4YMcYEFS8sFuW3soP1HVmgR3cSm.jpg",
  "fantastic-four-rise-of-the-silver-surfer": "/9wRfzTcMyyzkQxVDqBHv8RwuZOv.jpg",
  "fantastic-four-2015": "/cDroz5qSlP8xZ6tOpeYoPkBvKyL.jpg",
  daredevil: "/oCDBwSkntYamuw8VJIxMRCtDBmi.jpg",
  elektra: "/gC6s6NKHneSrOKyQZnUMb443RKU.jpg",

  // ── Sony — Spider-Man ────────────────────────────────────────────────────
  "spider-man-2002": "/or6XJBVpcEbIkma0V9zshnbEtx4.jpg",
  "spider-man-2": "/aGuvNAaaZuWXYQQ6N2v7DeuP6mB.jpg",
  "spider-man-3": "/sJMTTGjtjvrMZ7G0oP9D13wNUum.jpg",
  "the-amazing-spider-man": "/jexoNYnPd6vVrmygwF6QZmWPFdu.jpg",
  "the-amazing-spider-man-2": "/dGjoPttcbKR5VWg1jQuNFB247KL.jpg",
  "spider-man-into-the-spider-verse": "/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg",
  "spider-man-across-the-spider-verse": "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",

  // ── Sony — Venom, SSU & Ghost Rider ──────────────────────────────────────
  venom: "/2uNW4WbgBXL25BAbXGLnLqX71Sw.jpg",
  "venom-let-there-be-carnage": "/pzKsRuKLFmYrW5Q0q8E8G78Tcgo.jpg",
  "venom-the-last-dance": "/vGXptEdgZIhPg3cGlc7e8sNPC2e.jpg",
  morbius: "/Av8Z2jZhEm1FLkFzMThzz9hndJF.jpg",
  "madame-web": "/rULWuutDcN5NvtiZi4FRPzRYWSh.jpg",
  "kraven-the-hunter": "/1GvBhRxY6MELDfxFrete6BNhBB5.jpg",
  "ghost-rider": "/4quwR1VwZouD0YF9AaD72kQAjxH.jpg",
  "ghost-rider-spirit-of-vengeance": "/xEoBT6lYfQNpSpTm8gJMTrQytiw.jpg",

  // ── Legacy — Blade, Hulk, Punisher ───────────────────────────────────────
  blade: "/oWT70TvbsmQaqyphCZpsnQR7R32.jpg",
  "blade-ii": "/yDHwo3eWcMiy5LnnEnlGV9iLu9k.jpg",
  "blade-trinity": "/6f7iXvPOnf83MaLB1JmPzUor1rr.jpg",
  "hulk-2003": "/UllIft2jLSBaay3zQyMV4GNdfy.jpg",
  "the-punisher-2004": "/7rmA1HwYp2GKM85BL0cVwCaosGr.jpg",
  "punisher-war-zone": "/oOvKJgYUIpfswGHAdW6159bPbvM.jpg",

  // ── Marvel Studios series & specials (Disney+) ───────────────────────────
  wandavision: "/ijWWwINc8h71NQ8j1LTJMFSj5wr.jpg",
  "the-falcon-and-the-winter-soldier": "/6kbAMLteGO8yyewYau6bJ683sw7.jpg",
  // Split shows use TMDB's per-season art, not the show poster -- two identical
  // tiles sitting at different points on the timeline would read as a bug.
  "loki-season-1": "/8uVqe9ThcuYVNdh4O0kuijIWMLL.jpg",
  "loki-season-2": "/oJdVHUYrjdS2IqiNztVIP4GPB1p.jpg",
  "what-if-season-1": "/lztz5XBMG1x6Y5ubz7CxfPFsAcW.jpg",
  "what-if-season-2": "/3yhoq5LVMgKy9rEriH6ytq9BoJV.jpg",
  "what-if-season-3": "/bbGeKXKoualYRYqvFYiv8fPZK0d.jpg",
  hawkeye: "/ct5pNE5dDHryHLDnxyZPYcqO1sz.jpg",
  "moon-knight": "/x6FsYvt33846IQnDSFxla9j0RX8.jpg",
  "ms-marvel": "/3HWWh92kZbD7odwJX7nKmXNZsYo.jpg",
  "i-am-groot-season-1": "/oZmqHnWJVQLOKOibDa34W4iGBZU.jpg",
  "i-am-groot-season-2": "/7b4qBnExIjuANVDKWyVN8gVVOXS.jpg",
  "she-hulk-attorney-at-law": "/5xz2orV8f0usyrfGNshcoXHmiaV.jpg",
  "werewolf-by-night": "/mvIvNKRIJPPS7WSFarFhOAGIVnU.jpg",
  "guardians-of-the-galaxy-holiday-special": "/8dqXyslZ2hv49Oiob9UjlGSHSTR.jpg",
  "secret-invasion": "/3rINdUPSy9AklJg74jWHOyUXuZd.jpg",
  echo: "/vFyJH630cF68LohVYjQW49074Sy.jpg",
  "agatha-all-along": "/mGsxKwXUjojitRv2E9qMTbxbBRd.jpg",
  "your-friendly-neighborhood-spider-man": "/kjcsNeqF52YUQ2rUBGLMHwLkxvR.jpg",
  "daredevil-born-again": "/xDUoAsU8lQHOOoRkFiBuarmACDN.jpg",
  ironheart: "/dOh6MJpdlQhYpLBhzhNQeYGKTZ5.jpg",
  "eyes-of-wakanda": "/yuOfb1MgnaGPa4guzV0n1IFYVGN.jpg",
  "marvel-zombies": "/mwKj9ERGFXsWot0nXgQ5yMQf9I7.jpg",
  "wonder-man": "/6yy9nQlFt2l6UVWzrfhszFCaZ5C.jpg",

  // ── Marvel Television (ABC / Netflix / Hulu / Freeform) ──────────────────
  "agents-of-shield": "/gHUCCMy1vvj58tzE3dZqeC9SXus.jpg",
  "agent-carter": "/fe79VYyLp5ZBstpJ4oukpuUT3B.jpg",
  "daredevil-netflix": "/QWbPaDxiB6LW2LjASknzYBvjMj.jpg",
  "jessica-jones": "/oxnWofiE9fHOgUfs9NJa6nG6NTR.jpg",
  "luke-cage": "/yzM1hMB3PUJqbISX0f421b3xOjB.jpg",
  "iron-fist": "/4l6KD9HhtD6nCDEfg10Lp6C6zah.jpg",
  "the-defenders": "/49XzINhH4LFsgz7cx6TOPcHUJUL.jpg",
  inhumans: "/zKfGip55oJ9tdzhyd9ayGyFFhuo.jpg",
  "the-punisher": "/tM6xqRKXoloH9UchaJEyyRE9O1w.jpg",
  runaways: "/hnHEhbzh0F7kN3Ah1lzRjtQuW16.jpg",
  "cloak-and-dagger": "/pYnRJuBPEqZO1o4fcxBTgmKNHfy.jpg",
};

/** Absolute poster URL for a film, or undefined to fall back to generated art. */
export function posterFor(movieId: string): string | undefined {
  const path = POSTER_PATHS[movieId];
  return path ? `${TMDB_IMAGE_BASE}${path}` : undefined;
}
