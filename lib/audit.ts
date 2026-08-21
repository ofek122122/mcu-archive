import { getClient } from "@/lib/redis";

/**
 * Admin audit trail.
 *
 * Every write an admin makes is appended here before it happens, so a
 * destructive action always leaves a record even if the action itself then
 * fails halfway. Capped, and readable from the panel.
 *
 * This is deliberately append-only from the app's point of view: there is no
 * function to delete a single entry, only to clear the whole log, which is
 * itself audited.
 */

const AUDIT_KEY = "admin:audit";
const MAX_ENTRIES = 1000;

export type AuditEntry = {
  t: number;
  /** Clerk id of the admin who acted. */
  actor: string;
  /** Their email, denormalised so the log stays readable after deletion. */
  actorEmail: string;
  action: string;
  /** What was acted on — a user id, a title id, or "-". */
  target: string;
  detail: string;
};

export async function recordAudit(
  actor: { id: string; email: string },
  action: string,
  target: string,
  detail: string,
): Promise<void> {
  const redis = getClient();
  if (!redis) return;

  const entry: AuditEntry = {
    t: Date.now(),
    actor: actor.id,
    actorEmail: actor.email,
    action,
    target,
    detail,
  };

  try {
    await redis.lpush(AUDIT_KEY, JSON.stringify(entry));
    await redis.ltrim(AUDIT_KEY, 0, MAX_ENTRIES - 1);
  } catch (error) {
    console.error("[audit] failed to record:", error);
  }
}

export async function readAudit(limit = 100): Promise<AuditEntry[]> {
  const redis = getClient();
  if (!redis) return [];

  try {
    const raw = await redis.lrange<unknown>(AUDIT_KEY, 0, limit - 1);
    return raw
      .map((entry) => {
        try {
          return typeof entry === "string" ? (JSON.parse(entry) as AuditEntry) : (entry as AuditEntry);
        } catch {
          return null;
        }
      })
      .filter((entry): entry is AuditEntry => entry !== null);
  } catch (error) {
    console.error("[audit] failed to read:", error);
    return [];
  }
}

export async function clearAudit(): Promise<void> {
  const redis = getClient();
  if (!redis) return;
  await redis.del(AUDIT_KEY);
}
