import { auth, currentUser } from "@clerk/nextjs/server";

/**
 * Admin access.
 *
 * Two ways in, deliberately:
 *
 *   1. `ADMIN_EMAILS` — a comma-separated allowlist. This bootstraps the first
 *      admin, because before anyone is an admin there is nobody who can promote
 *      anyone. It cannot be changed from inside the app.
 *   2. `publicMetadata.role === "admin"` on the Clerk user — set by an existing
 *      admin from the panel, so adding the second admin needs no redeploy.
 *
 * The allowlist is checked against Clerk's *verified* primary email only, so
 * adding an unverified address to your own account cannot escalate anyone.
 */

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  /** True when the allowlist granted it — such an admin cannot be demoted. */
  viaAllowlist: boolean;
};

function allowlist(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowlisted(email: string | null | undefined): boolean {
  if (!email) return false;
  return allowlist().includes(email.toLowerCase());
}

/** The signed-in admin, or null. Never throws — use for conditional UI. */
export async function getAdminUser(): Promise<AdminUser | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  if (!user) return null;

  // Clerk marks which address is primary and whether it is verified; an
  // unverified address must not be able to claim an allowlisted identity.
  const primary = user.emailAddresses.find(
    (address) => address.id === user.primaryEmailAddressId,
  );
  const verified = primary?.verification?.status === "verified";
  const email = verified ? (primary?.emailAddress ?? "") : "";

  const viaAllowlist = isAllowlisted(email);
  const viaMetadata = (user.publicMetadata as { role?: string } | null)?.role === "admin";

  if (!viaAllowlist && !viaMetadata) return null;

  return {
    id: user.id,
    email: email || (primary?.emailAddress ?? "unknown"),
    name: user.firstName ?? user.username ?? email.split("@")[0] ?? "Admin",
    viaAllowlist,
  };
}

export async function isAdmin(): Promise<boolean> {
  return (await getAdminUser()) !== null;
}

/**
 * The signed-in admin, or a thrown error. Every admin Server Action starts with
 * this — the panel being hidden in the UI is not a control.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Forbidden");
  return admin;
}
