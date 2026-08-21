import { getClient } from "@/lib/redis";

/**
 * Activity recording — the history the dashboard charts are built from.
 *
 * The watch lists are plain Redis sets, which only ever describe *now*. To show
 * anything over time (ticks per day, active users, trending titles) the toggles
 * themselves have to be written down.
 *
 * Three structures, all capped or expiring so none can grow without bound:
 *
 *   activity:log        capped list of the last MAX_EVENTS toggles
 *   stats:ticks:<date>  a counter per day, expiring after RETENTION_DAYS
 *   stats:active:<date> set of user ids seen that day, same expiry
 *
 * Recording is best-effort: a failure here must never stop someone ticking a
 * film, so every call swallows its errors and logs.
 */

const LOG_KEY = "activity:log";
const MAX_EVENTS = 5000;
const RETENTION_DAYS = 120;
const RETENTION_SECONDS = RETENTION_DAYS * 24 * 60 * 60;

export type ActivityEvent = {
  /** Epoch milliseconds. */
  t: number;
  /** Clerk user id. */
  u: string;
  /** Movie id, or "*" for a batch action. */
  m: string;
  /** True when marking watched. */
  w: boolean;
  /** Number of titles affected — >1 for batch actions. */
  n: number;
};

/** UTC day key, so a chart's buckets do not shift with the viewer's timezone. */
export function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function recordActivity(
  userId: string,
  movieId: string,
  watched: boolean,
  count = 1,
): Promise<void> {
  const redis = getClient();
  if (!redis) return;

  const now = new Date();
  const event: ActivityEvent = { t: now.getTime(), u: userId, m: movieId, w: watched, n: count };
  const day = dayKey(now);

  try {
    await Promise.all([
      redis.lpush(LOG_KEY, JSON.stringify(event)).then(() => redis.ltrim(LOG_KEY, 0, MAX_EVENTS - 1)),
      // Only marking counts as a "tick" for the daily chart; unticking is a
      // correction, and counting it would inflate the activity line.
      watched
        ? redis
            .incrby(`stats:ticks:${day}`, count)
            .then(() => redis.expire(`stats:ticks:${day}`, RETENTION_SECONDS))
        : Promise.resolve(),
      redis
        .sadd(`stats:active:${day}`, userId)
        .then(() => redis.expire(`stats:active:${day}`, RETENTION_SECONDS)),
    ]);
  } catch (error) {
    console.error("[activity] failed to record:", error);
  }
}

export async function readActivity(limit = 50): Promise<ActivityEvent[]> {
  const redis = getClient();
  if (!redis) return [];

  try {
    const raw = await redis.lrange<unknown>(LOG_KEY, 0, limit - 1);
    return raw
      .map((entry) => (typeof entry === "string" ? safeParse(entry) : (entry as ActivityEvent)))
      .filter((entry): entry is ActivityEvent => entry !== null);
  } catch (error) {
    console.error("[activity] failed to read:", error);
    return [];
  }
}

export type DailyPoint = { day: string; ticks: number; active: number };

/** Ticks and distinct active users per day, oldest first. */
export async function readDailySeries(days = 30): Promise<DailyPoint[]> {
  const redis = getClient();

  const keys: string[] = [];
  const now = Date.now();
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    keys.push(dayKey(new Date(now - offset * 24 * 60 * 60 * 1000)));
  }

  if (!redis) return keys.map((day) => ({ day, ticks: 0, active: 0 }));

  try {
    const [ticks, actives] = await Promise.all([
      redis.mget<(number | null)[]>(...keys.map((day) => `stats:ticks:${day}`)),
      Promise.all(keys.map((day) => redis.scard(`stats:active:${day}`))),
    ]);

    return keys.map((day, index) => ({
      day,
      ticks: Number(ticks?.[index] ?? 0),
      active: actives[index] ?? 0,
    }));
  } catch (error) {
    console.error("[activity] failed to read series:", error);
    return keys.map((day) => ({ day, ticks: 0, active: 0 }));
  }
}

/** Distinct users active across the last `days` days. */
export async function countActiveUsers(days: number): Promise<number> {
  const redis = getClient();
  if (!redis) return 0;

  const keys: string[] = [];
  const now = Date.now();
  for (let offset = 0; offset < days; offset += 1) {
    keys.push(`stats:active:${dayKey(new Date(now - offset * 24 * 60 * 60 * 1000))}`);
  }

  try {
    const union = await redis.sunion(keys[0], ...keys.slice(1));
    return (union as unknown as string[]).length;
  } catch (error) {
    console.error("[activity] failed to count active users:", error);
    return 0;
  }
}

export async function clearActivity(): Promise<void> {
  const redis = getClient();
  if (!redis) return;
  await redis.del(LOG_KEY);
}

function safeParse(value: string): ActivityEvent | null {
  try {
    return JSON.parse(value) as ActivityEvent;
  } catch {
    return null;
  }
}
