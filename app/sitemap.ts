import type { MetadataRoute } from "next";

import { MOVIES } from "@/lib/movies";
import { SITE_URL } from "@/lib/site";

/**
 * There is one page, so there is one entry.
 *
 * `lastModified` is the newest *released* title rather than the build clock: a
 * rebuild that changed nothing should not claim the page changed, and a film
 * actually coming out should. Released only — the catalog carries titles dated
 * years ahead, and a sitemap that says it was modified in 2027 is one Google is
 * entitled to ignore.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date().toISOString().slice(0, 10);
  const newest = MOVIES.reduce(
    (latest, movie) =>
      movie.releaseDate <= today && movie.releaseDate > latest ? movie.releaseDate : latest,
    MOVIES[0].releaseDate,
  );

  return [
    {
      url: SITE_URL,
      lastModified: new Date(newest),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
