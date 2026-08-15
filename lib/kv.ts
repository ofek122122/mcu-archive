/**
 * Persistence layer — a single Redis SET holding the ids of watched films.
 *
 * Backed by Upstash Redis (the Vercel Marketplace replacement for Vercel KV).
 * Creating the store from your Vercel dashboard injects the connection env vars
 * automatically; see README.md.
 *
 * If no credentials are present the module falls back to an in-process set so
 * that `next build` and a bare `npm run dev` still work. That fallback is NOT a
 * database: it is per-instance and disappears on restart.
 */
import { Redis } from "@upstash/redis";

export const WATCHED_KEY = "user:watched_movies";

/** `undefined` = not resolved yet, `null` = no credentials configured. */
let cachedClient: Redis | null | undefined;

/** Dev-only fallback store. */
const memoryStore = new Set<string>();

function getClient(): Redis | null {
  if (cachedClient !== undefined) return cachedClient;

  // Upstash sets the UPSTASH_* pair; Vercel-provisioned stores also mirror the
  // legacy KV_* names, so accept either.
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  cachedClient = url && token ? new Redis({ url, token }) : null;
  return cachedClient;
}

/** True when a real Redis store is wired up. Surfaced in the UI as a badge. */
export function isDatabaseConnected(): boolean {
  return getClient() !== null;
}

export async function getWatchedMovies(): Promise<string[]> {
  const redis = getClient();
  if (!redis) return [...memoryStore];

  try {
    return (await redis.smembers(WATCHED_KEY)) as unknown as string[];
  } catch (error) {
    console.error("[kv] failed to read watched movies:", error);
    return [...memoryStore];
  }
}

export async function setWatched(movieId: string, watched: boolean): Promise<void> {
  const redis = getClient();

  if (!redis) {
    if (watched) memoryStore.add(movieId);
    else memoryStore.delete(movieId);
    return;
  }

  if (watched) await redis.sadd(WATCHED_KEY, movieId);
  else await redis.srem(WATCHED_KEY, movieId);
}
