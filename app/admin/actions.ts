"use server";

import { revalidatePath } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";

import { requireAdmin } from "@/lib/admin";
import { clearActivity } from "@/lib/activity";
import { clearAudit, recordAudit } from "@/lib/audit";
import { getWatchedMovies, setWatchedMany, watchedKey } from "@/lib/kv";
import { deleteLegacyProfile } from "@/lib/legacy-users";
import { MOVIE_IDS, MOVIES } from "@/lib/movies";
import { getClient } from "@/lib/redis";

/**
 * Admin Server Actions.
 *
 * Every one begins with `requireAdmin()` — the panel being hidden in the UI is
 * presentation, not a control — and every write is appended to the audit log
 * *before* it happens, so a half-failed destructive action still leaves a trace.
 */

export type ActionResult = { ok: boolean; message: string };

/** Grant or revoke admin via Clerk publicMetadata. */
export async function setUserRoleAction(
  userId: string,
  makeAdmin: boolean,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  if (userId === admin.id && !makeAdmin) {
    return { ok: false, message: "You cannot remove your own admin access." };
  }

  await recordAudit(admin, makeAdmin ? "promote" : "demote", userId, makeAdmin ? "granted admin" : "revoked admin");

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const metadata = { ...(user.publicMetadata ?? {}) } as Record<string, unknown>;

  if (makeAdmin) metadata.role = "admin";
  else delete metadata.role;

  await client.users.updateUser(userId, { publicMetadata: metadata });
  revalidatePath("/admin");

  return { ok: true, message: makeAdmin ? "Promoted to admin." : "Admin access revoked." };
}

/** Block or unblock sign-in without deleting anything. */
export async function setUserBannedAction(
  userId: string,
  banned: boolean,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  if (userId === admin.id) {
    return { ok: false, message: "You cannot ban yourself." };
  }

  await recordAudit(admin, banned ? "ban" : "unban", userId, banned ? "blocked sign-in" : "restored access");

  const client = await clerkClient();
  if (banned) await client.users.banUser(userId);
  else await client.users.unbanUser(userId);

  revalidatePath("/admin");
  return { ok: true, message: banned ? "User blocked." : "User unblocked." };
}

/** Wipe a user's watch list but keep their account. */
export async function resetUserListAction(userId: string): Promise<ActionResult> {
  const admin = await requireAdmin();

  const before = await getWatchedMovies(userId);
  await recordAudit(admin, "reset-list", userId, `cleared ${before.length} titles`);

  const redis = getClient();
  if (redis) await redis.del(watchedKey(userId));

  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true, message: `Cleared ${before.length} titles.` };
}

/**
 * Delete a Clerk account and its watch list.
 *
 * `confirmation` must equal the user's email — the client asks for it, but it is
 * re-checked here so the guard is not merely a UI nicety.
 */
export async function deleteUserAction(
  userId: string,
  confirmation: string,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  if (userId === admin.id) {
    return { ok: false, message: "You cannot delete your own account from here." };
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email =
    user.emailAddresses.find((a) => a.id === user.primaryEmailAddressId)?.emailAddress ?? "";

  if (confirmation.trim().toLowerCase() !== email.toLowerCase()) {
    return { ok: false, message: "Confirmation did not match the account email." };
  }

  const watched = await getWatchedMovies(userId);
  await recordAudit(admin, "delete-user", userId, `${email} · ${watched.length} titles`);

  const redis = getClient();
  if (redis) await redis.del(watchedKey(userId));
  await client.users.deleteUser(userId);

  revalidatePath("/admin");
  return { ok: true, message: `Deleted ${email}.` };
}

/** Toggle a single title on someone else's list — for support fixes. */
export async function adminToggleTitleAction(
  userId: string,
  movieId: string,
  watched: boolean,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  if (!MOVIE_IDS.has(movieId)) return { ok: false, message: "Unknown title." };

  await recordAudit(admin, watched ? "tick" : "untick", userId, movieId);
  await setWatchedMany(userId, [movieId], watched);

  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true, message: watched ? "Marked watched." : "Marked unwatched." };
}

/** Remove watch lists whose owner no longer exists. */
export async function cleanupOrphansAction(ids: string[]): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (ids.length === 0) return { ok: true, message: "Nothing to clean up." };

  await recordAudit(admin, "cleanup-orphans", "-", `${ids.length} keys: ${ids.join(", ")}`);

  const redis = getClient();
  if (redis) {
    for (const id of ids) await redis.del(watchedKey(id));
  }

  revalidatePath("/admin");
  return { ok: true, message: `Removed ${ids.length} orphaned list${ids.length === 1 ? "" : "s"}.` };
}

/** Drop a pre-Clerk PIN profile nobody has claimed. */
export async function deleteLegacyAction(id: string): Promise<ActionResult> {
  const admin = await requireAdmin();

  const watched = await getWatchedMovies(id);
  await recordAudit(admin, "delete-legacy", id, `${watched.length} titles`);
  await deleteLegacyProfile(id);

  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true, message: `Removed legacy profile ${id}.` };
}

export type ExportPayload = {
  exportedAt: string;
  catalogSize: number;
  users: { id: string; email: string; watched: string[] }[];
};

/** Full backup of every account's list, as JSON the browser downloads. */
export async function exportDataAction(): Promise<ExportPayload> {
  const admin = await requireAdmin();
  await recordAudit(admin, "export", "-", "downloaded full backup");

  const client = await clerkClient();
  const { data } = await client.users.getUserList({ limit: 200 });

  const users = await Promise.all(
    data.map(async (user) => ({
      id: user.id,
      email:
        user.emailAddresses.find((a) => a.id === user.primaryEmailAddressId)?.emailAddress ?? "",
      watched: await getWatchedMovies(user.id),
    })),
  );

  return { exportedAt: new Date().toISOString(), catalogSize: MOVIES.length, users };
}

/**
 * Restore lists from a previous export.
 *
 * Additive by design: it will never remove a title someone has since ticked, so
 * importing a stale backup cannot destroy newer progress.
 */
export async function importDataAction(raw: string): Promise<ActionResult> {
  const admin = await requireAdmin();

  let payload: ExportPayload;
  try {
    payload = JSON.parse(raw) as ExportPayload;
  } catch {
    return { ok: false, message: "That is not valid JSON." };
  }

  if (!Array.isArray(payload.users)) {
    return { ok: false, message: "No `users` array in that file." };
  }

  await recordAudit(admin, "import", "-", `${payload.users.length} users from ${payload.exportedAt ?? "unknown date"}`);

  let restored = 0;
  for (const entry of payload.users) {
    if (!entry?.id || !Array.isArray(entry.watched)) continue;
    const known = entry.watched.filter((id) => MOVIE_IDS.has(id));
    if (known.length === 0) continue;
    await setWatchedMany(entry.id, known, true);
    restored += known.length;
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true, message: `Merged ${restored} ticks across ${payload.users.length} users.` };
}

export async function clearActivityAction(): Promise<ActionResult> {
  const admin = await requireAdmin();
  await recordAudit(admin, "clear-activity", "-", "wiped the activity feed");
  await clearActivity();
  revalidatePath("/admin");
  return { ok: true, message: "Activity feed cleared." };
}

export async function clearAuditAction(): Promise<ActionResult> {
  const admin = await requireAdmin();
  // Recorded first so the log never simply ends with no explanation.
  await recordAudit(admin, "clear-audit", "-", "wiped the audit log");
  await clearAudit();
  await recordAudit(admin, "clear-audit", "-", "log cleared — entries before this point were removed");
  revalidatePath("/admin");
  return { ok: true, message: "Audit log cleared." };
}
