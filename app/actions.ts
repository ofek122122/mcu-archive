"use server";

import { revalidatePath } from "next/cache";

import { requireUserId } from "@/lib/auth";
import { getWatchedMovies, setWatched, setWatchedMany } from "@/lib/kv";
import { MOVIE_IDS } from "@/lib/movies";
import { deleteLegacyProfile, toUserId, validatePin, verifyPin } from "@/lib/legacy-users";

/** Reject anything that is not a known catalog id before it reaches Redis. */
function assertKnown(movieIds: string[]): string[] {
  const known = movieIds.filter((id) => MOVIE_IDS.has(id));
  if (known.length !== movieIds.length) {
    throw new Error("Unknown movie id");
  }
  return known;
}

/**
 * Flip a single title's watched state for the signed-in user and push it
 * straight to Redis, then revalidate so their other devices pick it up.
 *
 * Guests never reach this — their ticks live in the browser until they make an
 * account, at which point `mergeGuestWatchedAction` carries them across.
 */
export async function toggleWatchedAction(movieId: string, watched: boolean): Promise<void> {
  const userId = await requireUserId();
  assertKnown([movieId]);

  await setWatched(userId, movieId, watched);
  revalidatePath("/");
}

/**
 * Batch toggle for "mark entire phase / franchise watched". Same guarantees as
 * the single toggle: session re-checked, every id validated against the known
 * catalog before anything is written.
 */
export async function toggleManyWatchedAction(
  movieIds: string[],
  watched: boolean,
): Promise<void> {
  const userId = await requireUserId();
  const known = assertKnown(movieIds);

  await setWatchedMany(userId, known, watched);
  revalidatePath("/");
}

/**
 * Fold a guest's browser-held ticks into their new account.
 *
 * Additive only — it never unticks anything, so signing in on a second device
 * with a stale guest list cannot erase progress made elsewhere. Returns how
 * many were genuinely new so the UI can say something honest.
 */
export async function mergeGuestWatchedAction(movieIds: string[]): Promise<number> {
  const userId = await requireUserId();
  const known = assertKnown(movieIds);
  if (known.length === 0) return 0;

  const existing = new Set(await getWatchedMovies(userId));
  const fresh = known.filter((id) => !existing.has(id));

  if (fresh.length > 0) {
    await setWatchedMany(userId, fresh, true);
    revalidatePath("/");
  }

  return fresh.length;
}

export type ClaimState = { error: string | null; claimed: number | null };

/**
 * One-time migration: prove ownership of a pre-Clerk PIN profile and absorb its
 * watch list into the signed-in account, then delete the old profile.
 *
 * The PIN check runs through the original scrypt comparison and the original
 * per-profile lockout, so this is no weaker than the old login it replaces.
 */
export async function claimLegacyProfileAction(
  _prev: ClaimState,
  formData: FormData,
): Promise<ClaimState> {
  const userId = await requireUserId();

  const username = String(formData.get("username") ?? "").trim();
  const pin = String(formData.get("pin") ?? "").trim();

  if (!username) return { error: "Pick a profile to claim.", claimed: null };

  const pinError = validatePin(pin);
  if (pinError) return { error: pinError, claimed: null };

  const legacyId = toUserId(username);
  const result = await verifyPin(legacyId, pin);
  if (!result.ok) return { error: result.error, claimed: null };

  // Carry the list over before removing the profile, so a failure midway
  // leaves the old profile intact and the claim simply retryable.
  const legacyWatched = await getWatchedMovies(legacyId);
  const known = legacyWatched.filter((id) => MOVIE_IDS.has(id));

  if (known.length > 0) {
    const existing = new Set(await getWatchedMovies(userId));
    const fresh = known.filter((id) => !existing.has(id));
    if (fresh.length > 0) await setWatchedMany(userId, fresh, true);
  }

  await deleteLegacyProfile(legacyId);
  revalidatePath("/");

  return { error: null, claimed: known.length };
}
