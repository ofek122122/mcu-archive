/**
 * Legacy PIN profiles — read-only, kept for one-time migration.
 *
 * Before Clerk, accounts here were a username plus a 4-digit PIN hashed with
 * scrypt. Those profiles still hold real watch progress, so this module stays
 * alive with exactly enough surface to let their owner prove ownership once and
 * carry the list across: list the profiles, verify a PIN, delete on success.
 *
 * Creating new PIN profiles is gone. When the last legacy profile is claimed
 * this file and its `users` hash can be deleted outright.
 */
import { scryptSync, timingSafeEqual } from "node:crypto";

import { watchedKey } from "@/lib/kv";
import { getClient } from "@/lib/redis";

const USERS_KEY = "users";

/** Failed-login throttle. */
const MAX_ATTEMPTS = 8;
const ATTEMPT_WINDOW_SECONDS = 600;

export type User = {
  id: string;
  username: string;
  createdAt: string;
};

/** Stored shape — the salt and hash never leave the server. */
type StoredUser = User & { salt: string; hash: string };

/** Dev-only fallback stores, mirroring the Redis structures. */
const memoryUsers = new Map<string, StoredUser>();
const memoryAttempts = new Map<string, number>();

// ── Validation ──────────────────────────────────────────────────────────────

export const PIN_LENGTH = 4;

/** Normalised key for a username — this is the account id. */
export function toUserId(username: string): string {
  return username.trim().toLowerCase().replace(/\s+/g, "-");
}

export function validatePin(pin: string): string | null {
  if (!/^\d{4}$/.test(pin)) return "PIN must be exactly 4 digits.";
  return null;
}

// ── Hashing ─────────────────────────────────────────────────────────────────

function hashPin(pin: string, salt: string): string {
  // scrypt is deliberately slow, so a leaked store cannot be brute-forced
  // anywhere near as fast as a bare SHA-256 would allow.
  return scryptSync(pin, salt, 32).toString("hex");
}

function constantTimeEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

async function readAll(): Promise<StoredUser[]> {
  const redis = getClient();
  if (!redis) return [...memoryUsers.values()];

  try {
    const raw = await redis.hgetall<Record<string, unknown>>(USERS_KEY);
    if (!raw) return [];
    return Object.values(raw).map((value) =>
      typeof value === "string" ? (JSON.parse(value) as StoredUser) : (value as StoredUser),
    );
  } catch (error) {
    console.error("[users] failed to read users:", error);
    return [];
  }
}

async function readOne(id: string): Promise<StoredUser | null> {
  const redis = getClient();
  if (!redis) return memoryUsers.get(id) ?? null;

  try {
    const raw = await redis.hget<unknown>(USERS_KEY, id);
    if (!raw) return null;
    return typeof raw === "string" ? (JSON.parse(raw) as StoredUser) : (raw as StoredUser);
  } catch (error) {
    console.error("[users] failed to read user:", error);
    return null;
  }
}

/** Public directory — everyone can see who has an account. Never exposes hashes. */
export async function listUsers(): Promise<User[]> {
  const users = await readAll();
  return users
    .map(({ id, username, createdAt }) => ({ id, username, createdAt }))
    .sort((a, b) => a.username.localeCompare(b.username));
}

export type VerifyResult = { ok: true; user: User } | { ok: false; error: string };

export async function verifyPin(id: string, pin: string): Promise<VerifyResult> {
  if (await isLockedOut(id)) {
    return { ok: false, error: "Too many attempts. Try again in a few minutes." };
  }

  const stored = await readOne(id);
  if (!stored) return { ok: false, error: "That user no longer exists." };

  if (!constantTimeEquals(hashPin(pin, stored.salt), stored.hash)) {
    await recordFailure(id);
    return { ok: false, error: "Wrong PIN." };
  }

  await clearFailures(id);
  return {
    ok: true,
    user: { id: stored.id, username: stored.username, createdAt: stored.createdAt },
  };
}

// ── Throttling ──────────────────────────────────────────────────────────────

function attemptKey(id: string) {
  return `login:fail:${id}`;
}

async function isLockedOut(id: string): Promise<boolean> {
  const redis = getClient();
  if (!redis) return (memoryAttempts.get(id) ?? 0) >= MAX_ATTEMPTS;

  try {
    const count = await redis.get<number>(attemptKey(id));
    return (count ?? 0) >= MAX_ATTEMPTS;
  } catch {
    return false;
  }
}

async function recordFailure(id: string): Promise<void> {
  const redis = getClient();
  if (!redis) {
    memoryAttempts.set(id, (memoryAttempts.get(id) ?? 0) + 1);
    return;
  }

  try {
    const count = await redis.incr(attemptKey(id));
    if (count === 1) await redis.expire(attemptKey(id), ATTEMPT_WINDOW_SECONDS);
  } catch (error) {
    console.error("[users] failed to record login failure:", error);
  }
}

async function clearFailures(id: string): Promise<void> {
  const redis = getClient();
  if (!redis) {
    memoryAttempts.delete(id);
    return;
  }

  try {
    await redis.del(attemptKey(id));
  } catch {
    // Non-fatal: the key expires on its own.
  }
}

/** Remove a legacy profile and its watch set once it has been claimed. */
export async function deleteLegacyProfile(id: string): Promise<void> {
  const redis = getClient();
  if (!redis) {
    memoryUsers.delete(id);
    memoryAttempts.delete(id);
    return;
  }

  // Safe to drop the watch set here: the claim action copies it across first
  // and only calls this on success, so nothing is lost.
  await redis.hdel(USERS_KEY, id);
  await redis.del(watchedKey(id));
  await redis.del(attemptKey(id));
}
