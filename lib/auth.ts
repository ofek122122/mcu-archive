/**
 * Passcode wall.
 *
 * A single owner-held passcode gates every read and write. The session cookie
 * stores a SHA-256 digest of the passcode rather than the passcode itself, so
 * the plaintext never leaves the server, and both comparisons run in constant
 * time.
 */
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "mcu_session";
const SESSION_DAYS = 180;

/** Change this in Vercel → Settings → Environment Variables, or leave the default. */
export function getPasscode(): string {
  return process.env.APP_PASSCODE ?? "2099";
}

function digest(passcode: string): string {
  return createHash("sha256").update(`mcu-archive::${passcode}`).digest("hex");
}

function constantTimeEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function isValidPasscode(input: string): boolean {
  return constantTimeEquals(digest(input), digest(getPasscode()));
}

export async function isAuthenticated(): Promise<boolean> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return false;
  return constantTimeEquals(token, digest(getPasscode()));
}

export async function createSession(): Promise<void> {
  (await cookies()).set(COOKIE_NAME, digest(getPasscode()), {
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
