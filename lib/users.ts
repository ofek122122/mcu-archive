/**
 * User accounts.
 *
 * Every visitor picks a username and a 4-digit PIN; each account keeps its own
 * watch progress under `user:<id>:watched_movies`.
 *
 * ── On the security of 4-digit PINs ────────────────────────────────────────
 * A 4-digit PIN is 10,000 combinations and the username list is public by
 * design, so this is a *soft* lock — enough to stop housemates ticking each
 * other's films off, not enough to protect anything sensitive. Two mitigations
 * are in place:
 *
 *   1. PINs are hashed with scrypt and a per-user random salt, so a dump of the
 *      store cannot be reversed with a rainbow table.
 *   2. Failed logins are counted per user and locked out after MAX_ATTEMPTS
 *      within the window, which makes online brute force impractical.
 *
 * Do not reuse a PIN here that guards anything that matters.
 */
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

import { getClient } from "@/lib/redis";

const USERS_KEY = "users";
const LEGACY_WATCHED_KEY = "user:watched_movies";

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
const USERNAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 _-]{1,15}$/;

/** Normalised key for a username — this is the account id. */
export function toUserId(username: string): string {
  return username.trim().toLowerCase().replace(/\s+/g, "-");
}

export function validateUsername(username: string): string | null {
  const trimmed = username.trim();
  if (trimmed.length < 2) return "Username needs at least 2 characters.";
  if (trimmed.length > 16) return "Username can be at most 16 characters.";
  if (!USERNAME_PATTERN.test(trimmed)) {
    return "Use letters, numbers, spaces, hyphens or underscores.";
  }
  return null;
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

/** Opaque session token for a user — depends on the stored hash, so changing
 *  the PIN invalidates existing sessions. */
export function sessionTokenFor(user: { id: string; hash: string }): string {
  return scryptSync(`${user.id}:${user.hash}`, "mcu-archive-session", 24).toString("hex");
}

// ── Storage ─────────────────────────────────────────────────────────────────

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

export async function getUser(id: string): Promise<User | null> {
  const stored = await readOne(id);
  if (!stored) return null;
  return { id: stored.id, username: stored.username, createdAt: stored.createdAt };
}

export type CreateResult =
  | { ok: true; user: User; token: string }
  | { ok: false; error: string };

export async function createUser(username: string, pin: string): Promise<CreateResult> {
  const usernameError = validateUsername(username);
  if (usernameError) return { ok: false, error: usernameError };

  const pinError = validatePin(pin);
  if (pinError) return { ok: false, error: pinError };

  const id = toUserId(username);
  if (await readOne(id)) return { ok: false, error: "That username is already taken." };

  const salt = randomBytes(16).toString("hex");
  const stored: StoredUser = {
    id,
    username: username.trim(),
    createdAt: new Date().toISOString(),
    salt,
    hash: hashPin(pin, salt),
  };

  const redis = getClient();
  if (!redis) {
    memoryUsers.set(id, stored);
  } else {
    await redis.hset(USERS_KEY, { [id]: JSON.stringify(stored) });

    // One-time migration: the pre-accounts build kept a single shared set. If
    // it still holds anything, hand it to the first account created so the
    // existing progress is not stranded.
    try {
      const existingUsers = await redis.hlen(USERS_KEY);
      if (existingUsers === 1) {
        const legacy = (await redis.smembers(LEGACY_WATCHED_KEY)) as unknown as string[];
        if (legacy.length > 0) {
          const [first, ...rest] = legacy;
          await redis.sadd(`user:${id}:watched_movies`, first, ...rest);
        }
      }
    } catch (error) {
      console.error("[users] legacy migration skipped:", error);
    }
  }

  return {
    ok: true,
    user: { id: stored.id, username: stored.username, createdAt: stored.createdAt },
    token: sessionTokenFor(stored),
  };
}

export type VerifyResult =
  | { ok: true; user: User; token: string }
  | { ok: false; error: string };

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
    token: sessionTokenFor(stored),
  };
}

/** Re-derive a user's session token, for validating an incoming cookie. */
export async function tokenFor(id: string): Promise<string | null> {
  const stored = await readOne(id);
  return stored ? sessionTokenFor(stored) : null;
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
