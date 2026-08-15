/**
 * Persistence layer — one Redis SET per user holding the ids of watched films.
 *
 * The key is `user:<userId>:watched_movies`, so every account keeps entirely
 * separate progress. (Before accounts existed this was a single shared
 * `user:watched_movies` set; `createUser` migrates that into the first account.)
 *
 * Falls back to an in-process store when no credentials are present so that
 * `next build` and a bare `npm run dev` still work. That fallback is NOT a
 * database: it is per-instance and disappears on restart.
 */
import { getClient } from "@/lib/redis";

export { isDatabaseConnected } from "@/lib/redis";

export function watchedKey(userId: string): string {
  return `user:${userId}:watched_movies`;
}

/** Dev-only fallback store, keyed the same way. */
const memoryStore = new Map<string, Set<string>>();

function memoryFor(userId: string): Set<string> {
  const existing = memoryStore.get(userId);
  if (existing) return existing;
  const created = new Set<string>();
  memoryStore.set(userId, created);
  return created;
}

export async function getWatchedMovies(userId: string): Promise<string[]> {
  const redis = getClient();
  if (!redis) return [...memoryFor(userId)];

  try {
    return (await redis.smembers(watchedKey(userId))) as unknown as string[];
  } catch (error) {
    console.error("[kv] failed to read watched movies:", error);
    return [...memoryFor(userId)];
  }
}

/** How many films a user has logged — used by the public user picker. */
export async function countWatched(userId: string): Promise<number> {
  const redis = getClient();
  if (!redis) return memoryFor(userId).size;

  try {
    return await redis.scard(watchedKey(userId));
  } catch (error) {
    console.error("[kv] failed to count watched movies:", error);
    return 0;
  }
}

export async function setWatched(
  userId: string,
  movieId: string,
  watched: boolean,
): Promise<void> {
  const redis = getClient();

  if (!redis) {
    const store = memoryFor(userId);
    if (watched) store.add(movieId);
    else store.delete(movieId);
    return;
  }

  if (watched) await redis.sadd(watchedKey(userId), movieId);
  else await redis.srem(watchedKey(userId), movieId);
}

/**
 * Batch equivalent of `setWatched`, for "mark whole phase / franchise watched".
 * One round trip instead of N — SADD and SREM are both variadic.
 */
export async function setWatchedMany(
  userId: string,
  movieIds: string[],
  watched: boolean,
): Promise<void> {
  if (movieIds.length === 0) return;

  const redis = getClient();

  if (!redis) {
    const store = memoryFor(userId);
    for (const id of movieIds) {
      if (watched) store.add(id);
      else store.delete(id);
    }
    return;
  }

  // Split the head off so TypeScript sees the non-empty tuple that sadd/srem
  // require; the early return above guarantees there is one.
  const [first, ...rest] = movieIds;
  if (watched) await redis.sadd(watchedKey(userId), first, ...rest);
  else await redis.srem(watchedKey(userId), first, ...rest);
}
