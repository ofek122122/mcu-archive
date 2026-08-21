/**
 * Session handling — Clerk.
 *
 * Clerk owns identity: email/password, verification, reset, breached-password
 * checks and rate limiting all happen on their side, so this app never sees or
 * stores a password. We keep only the Clerk user id, and use it as the key for
 * that person's watch list in Redis.
 *
 * The previous system (username + 4-digit PIN, hashed here) is retained in
 * `lib/legacy-users.ts` purely so existing profiles can be claimed once and
 * carried over. See `claimLegacyProfileAction`.
 */
import { auth } from "@clerk/nextjs/server";

/** The signed-in Clerk user id, or null for a guest. */
export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * The signed-in user id, or a thrown error. Use in Server Actions that write —
 * a guest reaching one of those is a bug or an attack, not a normal path.
 */
export async function requireUserId(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}
