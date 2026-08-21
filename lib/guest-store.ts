"use client";

/**
 * Guest watch list — held in the browser until the visitor makes an account.
 *
 * The catalog is public, so someone can arrive, browse and start ticking
 * straight away. Those ticks land here rather than in Redis, and are folded
 * into the account on sign-in by `mergeGuestWatchedAction`.
 *
 * Exposed as a `useSyncExternalStore` source rather than read into state in an
 * effect: localStorage genuinely *is* an external store, and this way the
 * server snapshot is an empty list, so the first client render matches the HTML
 * and there is no hydration mismatch.
 *
 * Reads and writes are wrapped in try/catch because localStorage throws in
 * private mode on some browsers, and a watch tracker is not worth crashing over.
 */
const KEY = "mcu-archive:guest-watched";
const PROMPTED_KEY = "mcu-archive:guest-prompted";

/** Stable empty reference — returning a fresh [] each read would loop React. */
const EMPTY: string[] = [];

let cache: string[] | null = null;
const listeners = new Set<() => void>();

function load(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    const ids = parsed.filter((id): id is string => typeof id === "string");
    return ids.length > 0 ? ids : EMPTY;
  } catch {
    return EMPTY;
  }
}

function emit() {
  for (const listener of listeners) listener();
}

/** Subscribe to guest-list changes, including edits made in another tab. */
export function subscribeGuestWatched(listener: () => void): () => void {
  listeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Current guest list. The reference is stable until something writes. */
export function getGuestWatchedSnapshot(): string[] {
  if (cache === null) cache = load();
  return cache;
}

/** The server has no localStorage, so a guest always starts empty there. */
export function getGuestWatchedServerSnapshot(): string[] {
  return EMPTY;
}

export function writeGuestWatched(ids: string[]): void {
  cache = ids.length > 0 ? ids : EMPTY;
  try {
    if (ids.length > 0) window.localStorage.setItem(KEY, JSON.stringify(ids));
    else window.localStorage.removeItem(KEY);
  } catch {
    // Storage unavailable — the session still works, the ticks just will not
    // survive a reload.
  }
  emit();
}

export function clearGuestWatched(): void {
  writeGuestWatched([]);
}

/** Whether the "make an account" nudge has already been shown once. */
export function hasBeenPrompted(): boolean {
  try {
    return window.localStorage.getItem(PROMPTED_KEY) === "1";
  } catch {
    return true;
  }
}

export function markPrompted(): void {
  try {
    window.localStorage.setItem(PROMPTED_KEY, "1");
  } catch {
    // Nothing to do.
  }
}
