import "server-only";

import { clerkClient } from "@clerk/nextjs/server";

import { countActiveUsers, readDailySeries, type DailyPoint } from "@/lib/activity";
import { getWatchedMovies } from "@/lib/kv";
import { listUsers as listLegacyProfiles } from "@/lib/legacy-users";
import { MOVIES, TOTAL_MOVIES } from "@/lib/movies";
import { isAllowlisted } from "@/lib/admin";
import { getClient } from "@/lib/redis";
import { PHASES, UNIVERSES } from "@/lib/universes";
import { POSTER_PATHS } from "@/lib/posters";

/**
 * Read models for the admin dashboard.
 *
 * Everything is derived on demand from Clerk plus Redis rather than kept in a
 * denormalised table — the catalog is 131 titles and the user count is small,
 * so a handful of round trips is cheaper than the correctness risk of a cache
 * that can drift from the sets it summarises.
 */

export type AdminUserRow = {
  id: string;
  email: string;
  name: string;
  imageUrl: string;
  createdAt: number;
  lastSignInAt: number | null;
  /** Preformatted on the server: Date.now() in render is impure and the
   *  React Compiler lint rejects it — and it would risk a hydration mismatch. */
  joinedAgo: string;
  lastSeenAgo: string;
  watched: number;
  watchedIds: string[];
  percent: number;
  isAdmin: boolean;
  /** Allowlisted admins cannot be demoted from the panel. */
  lockedAdmin: boolean;
  banned: boolean;
};

/** Human-readable age of a timestamp, computed on the server. */
export function relativeTime(timestamp: number): string {
  const seconds = Math.round((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.round(days / 30)}mo ago`;
}

export async function listAdminUsers(): Promise<AdminUserRow[]> {
  const client = await clerkClient();
  const { data } = await client.users.getUserList({ limit: 200, orderBy: "-created_at" });

  const rows = await Promise.all(
    data.map(async (user) => {
      const primary = user.emailAddresses.find((a) => a.id === user.primaryEmailAddressId);
      const email = primary?.emailAddress ?? "—";
      const watchedIds = await getWatchedMovies(user.id);
      const lockedAdmin = isAllowlisted(
        primary?.verification?.status === "verified" ? email : undefined,
      );

      return {
        id: user.id,
        email,
        name: user.firstName ?? user.username ?? email.split("@")[0],
        imageUrl: user.imageUrl,
        createdAt: user.createdAt,
        lastSignInAt: user.lastSignInAt,
        joinedAgo: relativeTime(user.createdAt),
        lastSeenAgo: user.lastSignInAt ? relativeTime(user.lastSignInAt) : "never",
        watched: watchedIds.length,
        watchedIds,
        percent: TOTAL_MOVIES === 0 ? 0 : (watchedIds.length / TOTAL_MOVIES) * 100,
        isAdmin:
          lockedAdmin || (user.publicMetadata as { role?: string } | null)?.role === "admin",
        lockedAdmin,
        banned: user.banned,
      };
    }),
  );

  return rows;
}

export type UserDetail = {
  id: string;
  watchedIds: string[];
  minutes: number;
};

export async function getUserDetail(userId: string): Promise<UserDetail> {
  const watchedIds = await getWatchedMovies(userId);
  const known = new Set(watchedIds);
  const minutes = MOVIES.filter((movie) => known.has(movie.id)).reduce(
    (sum, movie) => sum + (movie.runtime ?? 0),
    0,
  );
  return { id: userId, watchedIds, minutes };
}

export type TitleStat = {
  id: string;
  title: string;
  year: number;
  universe: string;
  kind: "movie" | "series";
  imdbRating: number | null;
  watchers: number;
  percentOfUsers: number;
};

export type Overview = {
  totalUsers: number;
  totalTicks: number;
  totalMinutes: number;
  adminCount: number;
  newUsers7d: number;
  activeToday: number;
  active7d: number;
  series: DailyPoint[];
  titleStats: TitleStat[];
  unseen: TitleStat[];
  universeRows: { id: string; label: string; accent: string; chartAccent: string; watched: number; total: number; percent: number }[];
  phaseRows: { id: number; roman: string; accent: string; watched: number; total: number; percent: number }[];
  legacyRemaining: number;
};

/**
 * The dashboard's main query.
 *
 * Users' lists are fetched once and reused for every aggregate below, so the
 * per-title tallies cost no extra round trips.
 */
export async function buildOverview(users: AdminUserRow[]): Promise<Overview> {
  const lists = await Promise.all(
    users.map(async (user) => new Set(await getWatchedMovies(user.id))),
  );

  const totalTicks = lists.reduce((sum, set) => sum + set.size, 0);
  const totalMinutes = lists.reduce(
    (sum, set) =>
      sum + MOVIES.filter((movie) => set.has(movie.id)).reduce((m, movie) => m + (movie.runtime ?? 0), 0),
    0,
  );

  const titleStats: TitleStat[] = MOVIES.map((movie) => {
    const watchers = lists.filter((set) => set.has(movie.id)).length;
    return {
      id: movie.id,
      title: movie.title,
      year: movie.year,
      universe: movie.universe,
      kind: (movie.kind === "series" ? "series" : "movie") as TitleStat["kind"],
      imdbRating: movie.imdbRating,
      watchers,
      percentOfUsers: users.length === 0 ? 0 : (watchers / users.length) * 100,
    };
  }).sort((a, b) => b.watchers - a.watchers || a.title.localeCompare(b.title));

  const universeRows = UNIVERSES.map((universe) => {
    const inUniverse = MOVIES.filter((movie) => movie.universe === universe.id);
    const ids = new Set(inUniverse.map((movie) => movie.id));
    const watched = lists.reduce(
      (sum, set) => sum + [...set].filter((id) => ids.has(id)).length,
      0,
    );
    const capacity = inUniverse.length * Math.max(users.length, 1);
    return {
      id: universe.id,
      label: universe.label,
      accent: universe.accent,
      chartAccent: universe.chartAccent,
      watched,
      total: capacity,
      percent: capacity === 0 ? 0 : (watched / capacity) * 100,
    };
  });

  const phaseRows = PHASES.map((phase) => {
    const inPhase = MOVIES.filter((movie) => movie.phase === phase.id);
    const ids = new Set(inPhase.map((movie) => movie.id));
    const watched = lists.reduce(
      (sum, set) => sum + [...set].filter((id) => ids.has(id)).length,
      0,
    );
    const capacity = inPhase.length * Math.max(users.length, 1);
    return {
      id: phase.id,
      roman: phase.roman,
      accent: phase.accent,
      watched,
      total: capacity,
      percent: capacity === 0 ? 0 : (watched / capacity) * 100,
    };
  });

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const [series, activeToday, active7d, legacy] = await Promise.all([
    readDailySeries(30),
    countActiveUsers(1),
    countActiveUsers(7),
    listLegacyProfiles(),
  ]);

  return {
    totalUsers: users.length,
    totalTicks,
    totalMinutes,
    adminCount: users.filter((user) => user.isAdmin).length,
    newUsers7d: users.filter((user) => user.createdAt >= weekAgo).length,
    activeToday,
    active7d,
    series,
    titleStats,
    unseen: titleStats.filter((stat) => stat.watchers === 0),
    universeRows,
    phaseRows,
    legacyRemaining: legacy.length,
  };
}

export type CatalogHealth = {
  total: number;
  movies: number;
  series: number;
  missingPoster: string[];
  missingRating: string[];
  unreleased: string[];
  duplicateImdb: string[];
  orphanKeys: string[];
};

/** Static checks over the catalog, plus Redis keys with no matching account. */
export async function checkCatalogHealth(users: AdminUserRow[]): Promise<CatalogHealth> {
  const missingPoster = MOVIES.filter((movie) => !movie.posterUrl && !POSTER_PATHS[movie.id]).map(
    (movie) => movie.title,
  );
  const missingRating = MOVIES.filter((movie) => movie.imdbRating === null).map((m) => m.title);
  const now = Date.now();
  const unreleased = MOVIES.filter((movie) => new Date(movie.releaseDate).getTime() > now).map(
    (movie) => movie.title,
  );

  const seen = new Map<string, string>();
  const duplicateImdb: string[] = [];
  for (const movie of MOVIES) {
    const existing = seen.get(movie.imdbId);
    if (existing) duplicateImdb.push(`${existing} / ${movie.title} (${movie.imdbId})`);
    else seen.set(movie.imdbId, movie.title);
  }

  // A watch list whose owner no longer exists in Clerk — usually a deleted
  // account, occasionally a claimed legacy profile that failed to clean up.
  const orphanKeys: string[] = [];
  const redis = getClient();
  if (redis) {
    try {
      const known = new Set(users.map((user) => user.id));
      const legacy = new Set((await listLegacyProfiles()).map((profile) => profile.id));
      const keys = await redis.keys("user:*:watched_movies");
      for (const key of keys) {
        const id = key.slice("user:".length, -":watched_movies".length);
        if (!known.has(id) && !legacy.has(id)) orphanKeys.push(id);
      }
    } catch (error) {
      console.error("[admin] orphan scan failed:", error);
    }
  }

  return {
    total: TOTAL_MOVIES,
    movies: MOVIES.filter((movie) => movie.kind !== "series").length,
    series: MOVIES.filter((movie) => movie.kind === "series").length,
    missingPoster,
    missingRating,
    unreleased,
    duplicateImdb,
    orphanKeys,
  };
}
