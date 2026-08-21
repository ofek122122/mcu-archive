import "server-only";

import { MOVIES } from "@/lib/movies";
import { getClient } from "@/lib/redis";

/**
 * "Where to watch", via TMDB's watch/providers endpoint.
 *
 * The data is TMDB's partnership with JustWatch. **TMDB requires the source to
 * be attributed as JustWatch on each media item**, not once somewhere in the
 * app — see the note in `components/watch-providers.tsx`, which renders it
 * beside every result. They revoke API access over this.
 *
 * ── Why it is fetched at request time ──────────────────────────────────────
 * Everything else in this app is a hardcoded constant, deliberately. Streaming
 * rights are the exception: they change weekly, per territory, with no warning.
 * Baking them into the bundle would mean shipping stale answers.
 *
 * So it is fetched on demand and cached in Redis:
 *
 *   tmdb:id:<imdbId>            permanent — TMDB ids never change
 *   watch:<kind>:<id>:<region>  6 hours — availability does change
 *
 * Without a `TMDB_API_TOKEN` every function here returns null and the UI simply
 * omits the section. Nothing else in the app depends on it.
 */

const API = "https://api.themoviedb.org/3";
const ID_TTL_SECONDS = 60 * 60 * 24 * 180;
const PROVIDER_TTL_SECONDS = 60 * 60 * 6;
/** A slow third party must not hold a page hostage. */
const TIMEOUT_MS = 6000;

export type Provider = {
  id: number;
  name: string;
  logoPath: string | null;
};

export type WatchAvailability = {
  region: string;
  /** Included with a subscription. */
  stream: Provider[];
  /** Free with adverts. */
  free: Provider[];
  rent: Provider[];
  buy: Provider[];
  /** TMDB's own watch page for this title and region. */
  link: string | null;
};

function token(): string | null {
  return process.env.TMDB_API_TOKEN ?? null;
}

export function watchProvidersConfigured(): boolean {
  return token() !== null;
}

async function tmdb<T>(path: string): Promise<T | null> {
  const bearer = token();
  if (!bearer) return null;

  try {
    const response = await fetch(`${API}${path}`, {
      headers: { Authorization: `Bearer ${bearer}`, accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      // Redis is the cache of record here; Next's fetch cache would be a
      // second, differently-expiring copy of the same data.
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("[watch] TMDB responded", response.status, path);
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error("[watch] TMDB request failed:", error);
    return null;
  }
}

type FindResponse = {
  movie_results?: { id: number }[];
  tv_results?: { id: number }[];
};

/**
 * Map an IMDb id to a TMDB id.
 *
 * The catalog stores IMDb ids because those are what the "View on IMDb" links
 * need; TMDB's own ids are only required here, so they are resolved lazily and
 * cached rather than being a second hand-maintained column in the data files.
 */
async function resolveTmdbId(
  imdbId: string,
  isSeries: boolean,
): Promise<number | null> {
  const redis = getClient();
  const cacheKey = `tmdb:id:${imdbId}`;

  if (redis) {
    try {
      const cached = await redis.get<number>(cacheKey);
      if (cached) return cached;
    } catch {
      // Fall through to a live lookup.
    }
  }

  const found = await tmdb<FindResponse>(
    `/find/${imdbId}?external_source=imdb_id`,
  );
  if (!found) return null;

  const id = isSeries ? found.tv_results?.[0]?.id : found.movie_results?.[0]?.id;
  if (!id) return null;

  if (redis) {
    try {
      await redis.set(cacheKey, id, { ex: ID_TTL_SECONDS });
    } catch {
      // Caching is an optimisation, not a requirement.
    }
  }

  return id;
}

type ProvidersResponse = {
  results?: Record<
    string,
    {
      link?: string;
      flatrate?: RawProvider[];
      free?: RawProvider[];
      ads?: RawProvider[];
      rent?: RawProvider[];
      buy?: RawProvider[];
    }
  >;
};

type RawProvider = {
  provider_id: number;
  provider_name: string;
  logo_path?: string | null;
  display_priority?: number;
};

function normalise(list: RawProvider[] | undefined): Provider[] {
  if (!list) return [];
  return [...list]
    .sort((a, b) => (a.display_priority ?? 99) - (b.display_priority ?? 99))
    .map((entry) => ({
      id: entry.provider_id,
      name: entry.provider_name,
      logoPath: entry.logo_path ?? null,
    }));
}

/** Where a title can be watched in one region, or null if unknown. */
export async function getWatchAvailability(
  movieId: string,
  region: string,
): Promise<WatchAvailability | null> {
  if (!watchProvidersConfigured()) return null;

  const movie = MOVIES.find((entry) => entry.id === movieId);
  if (!movie) return null;

  const isSeries = movie.kind === "series";
  const redis = getClient();
  const cacheKey = `watch:${isSeries ? "tv" : "movie"}:${movie.id}:${region}`;

  if (redis) {
    try {
      const cached = await redis.get<WatchAvailability>(cacheKey);
      if (cached) return cached;
    } catch {
      // Fall through to a live lookup.
    }
  }

  const tmdbId = await resolveTmdbId(movie.imdbId, isSeries);
  if (!tmdbId) return null;

  const data = await tmdb<ProvidersResponse>(
    `/${isSeries ? "tv" : "movie"}/${tmdbId}/watch/providers`,
  );
  if (!data) return null;

  const forRegion = data.results?.[region];

  const availability: WatchAvailability = {
    region,
    stream: normalise(forRegion?.flatrate),
    // TMDB splits genuinely-free from ad-supported; for a viewer they are the
    // same offer, so they are merged and labelled "free".
    free: [...normalise(forRegion?.free), ...normalise(forRegion?.ads)],
    rent: normalise(forRegion?.rent),
    buy: normalise(forRegion?.buy),
    link: forRegion?.link ?? null,
  };

  if (redis) {
    try {
      // Cached even when empty — "not available here" is a real answer, and
      // re-asking TMDB for it on every modal open would be wasteful.
      await redis.set(cacheKey, availability, { ex: PROVIDER_TTL_SECONDS });
    } catch {
      // Non-fatal.
    }
  }

  return availability;
}

export function hasAnyProvider(availability: WatchAvailability | null): boolean {
  if (!availability) return false;
  return (
    availability.stream.length > 0 ||
    availability.free.length > 0 ||
    availability.rent.length > 0 ||
    availability.buy.length > 0
  );
}
