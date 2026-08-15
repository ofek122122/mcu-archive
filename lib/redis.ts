/**
 * Shared Redis client.
 *
 * Backed by Upstash Redis (the Vercel Marketplace replacement for Vercel KV).
 * Creating the store from your Vercel dashboard injects the connection env vars
 * automatically; see README.md.
 *
 * If no credentials are present callers fall back to in-process storage so that
 * `next build` and a bare `npm run dev` still work. That fallback is NOT a
 * database: it is per-instance and disappears on restart.
 */
import { Redis } from "@upstash/redis";

/** `undefined` = not resolved yet, `null` = no credentials configured. */
let cachedClient: Redis | null | undefined;

export function getClient(): Redis | null {
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
