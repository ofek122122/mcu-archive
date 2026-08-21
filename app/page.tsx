import { Suspense } from "react";

import { isAdmin } from "@/lib/admin";
import { getCurrentUserId } from "@/lib/auth";
import { countWatched, getWatchedMovies, isDatabaseConnected } from "@/lib/kv";
import { listUsers } from "@/lib/legacy-users";
import { withReleaseStatus } from "@/lib/movies";
import { Tracker } from "@/components/tracker";
import type { LegacyProfile } from "@/components/claim-legacy";

export default async function HomePage() {
  const userId = await getCurrentUserId();

  // The catalog is public: guests get the full browse experience and their
  // ticks live in the browser until they make an account.
  const watched = userId ? await getWatchedMovies(userId) : [];
  const admin = userId ? await isAdmin() : false;

  // Pre-Clerk PIN profiles that still have progress waiting to be claimed.
  // Only offered to signed-in users, since claiming merges into an account.
  let legacyProfiles: LegacyProfile[] = [];
  if (userId) {
    const legacy = await listUsers();
    legacyProfiles = await Promise.all(
      legacy.map(async (profile) => ({
        id: profile.id,
        username: profile.username,
        watched: await countWatched(profile.id),
      })),
    );
  }

  // Release status is resolved server-side so hydration stays deterministic.
  const movies = withReleaseStatus();

  return (
    // Tracker reads its initial filter state from the URL via useSearchParams,
    // which Next requires to sit inside a Suspense boundary.
    <Suspense fallback={null}>
      <Tracker
        movies={movies}
        watched={watched}
        signedIn={Boolean(userId)}
        isAdmin={admin}
        legacyProfiles={legacyProfiles}
        databaseConnected={isDatabaseConnected()}
      />
    </Suspense>
  );
}
