"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSession, destroySession, getCurrentUser } from "@/lib/auth";
import { setWatched, setWatchedMany } from "@/lib/kv";
import { MOVIE_IDS } from "@/lib/movies";
import { createUser, verifyPin } from "@/lib/users";

export type AuthState = { error: string | null };

/** Sign in as an existing user with their 4-digit PIN. */
export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const userId = String(formData.get("userId") ?? "").trim();
  const pin = String(formData.get("pin") ?? "").trim();

  if (!userId) return { error: "Pick a user first." };
  if (!pin) return { error: "Enter your 4-digit PIN." };

  const result = await verifyPin(userId, pin);
  if (!result.ok) return { error: result.error };

  await createSession(result.user.id, result.token);
  revalidatePath("/");
  redirect("/");
}

/** Create a new account and sign straight into it. */
export async function createUserAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const username = String(formData.get("username") ?? "");
  const pin = String(formData.get("pin") ?? "").trim();
  const confirm = String(formData.get("confirmPin") ?? "").trim();

  if (pin !== confirm) return { error: "The two PINs do not match." };

  const result = await createUser(username, pin);
  if (!result.ok) return { error: result.error };

  await createSession(result.user.id, result.token);
  revalidatePath("/");
  redirect("/");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  revalidatePath("/");
  redirect("/");
}

/**
 * Flip a single film's watched state for the signed-in user and push it
 * straight to Redis, then revalidate so their other devices pick the change up.
 */
export async function toggleWatchedAction(movieId: string, watched: boolean): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  if (!MOVIE_IDS.has(movieId)) {
    throw new Error(`Unknown movie id: ${movieId}`);
  }

  await setWatched(user.id, movieId, watched);
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
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const known = movieIds.filter((id) => MOVIE_IDS.has(id));
  if (known.length !== movieIds.length) {
    throw new Error("Unknown movie id in batch");
  }

  await setWatchedMany(user.id, known, watched);
  revalidatePath("/");
}
