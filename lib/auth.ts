/**
 * Session handling.
 *
 * The cookie stores `<userId>.<token>`, where the token is derived from the
 * user's stored PIN hash. The PIN itself never leaves the login form, and
 * changing a PIN invalidates any existing session for free.
 */
import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import { getUser, tokenFor, type User } from "@/lib/users";

const COOKIE_NAME = "mcu_session";
const SESSION_DAYS = 180;

function constantTimeEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** The signed-in user, or null. Also returns null if the account has gone. */
export async function getCurrentUser(): Promise<User | null> {
  const raw = (await cookies()).get(COOKIE_NAME)?.value;
  if (!raw) return null;

  const separator = raw.lastIndexOf(".");
  if (separator <= 0) return null;

  const id = raw.slice(0, separator);
  const token = raw.slice(separator + 1);

  const expected = await tokenFor(id);
  if (!expected || !constantTimeEquals(token, expected)) return null;

  return getUser(id);
}

export async function createSession(userId: string, token: string): Promise<void> {
  (await cookies()).set(COOKIE_NAME, `${userId}.${token}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}
