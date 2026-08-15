"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSession, destroySession, isAuthenticated, isValidPasscode } from "@/lib/auth";
import { setWatched, setWatchedMany } from "@/lib/kv";
import { MOVIE_IDS } from "@/lib/movies";

export type LoginState = { error: string | null };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const passcode = String(formData.get("passcode") ?? "").trim();

  if (!passcode) return { error: "Enter the archive passcode." };
  if (!isValidPasscode(passcode)) return { error: "Access denied — incorrect passcode." };

  await createSession();
  revalidatePath("/");
  redirect("/");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  revalidatePath("/");
  redirect("/");
}

/**
 * Flip a single film's watched state and push it straight to Redis, then
 * revalidate so every other device picks the change up on its next load.
 */
export async function toggleWatchedAction(movieId: string, watched: boolean): Promise<void> {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }
  if (!MOVIE_IDS.has(movieId)) {
    throw new Error(`Unknown movie id: ${movieId}`);
  }

  await setWatched(movieId, watched);
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
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }

  const known = movieIds.filter((id) => MOVIE_IDS.has(id));
  if (known.length !== movieIds.length) {
    throw new Error("Unknown movie id in batch");
  }

  await setWatchedMany(known, watched);
  revalidatePath("/");
}
