import { Suspense } from "react";

import { isAdmin } from "@/lib/admin";
import { getCurrentUserId } from "@/lib/auth";
import { countWatched, getWatchedMovies, isDatabaseConnected } from "@/lib/kv";
import { listUsers } from "@/lib/legacy-users";
import { withReleaseStatus } from "@/lib/movies";
import { detectRegion } from "@/lib/region";
import { StructuredData } from "@/components/structured-data";
import { Tracker } from "@/components/tracker";
import type { LegacyProfile } from "@/components/claim-legacy";

export default async function HomePage() {
  const userId = await getCurrentUserId();

  // The catalog is public: guests get the full browse experience and their
  // ticks live in the browser until they make an account.
  const watched = userId ? await getWatchedMovies(userId) : [];
  const admin = userId ? await isAdmin() : false;
  const region = await detectRegion();

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
    <>
      <StructuredData />

      {/*
        The page had no h1 at all — the chapter headers are h2s and the logo is
        an image. Visually hidden because the header already says what this is
        far better than a line of text would, but a document with no top-level
        heading is a hole for both search engines and screen readers.
      */}
      <h1 className="sr-only">
        MCU Archive — every Marvel film and series in release order or story order
      </h1>

      {/* Tracker reads its initial filter state from the URL via
          useSearchParams, which Next requires inside a Suspense boundary. */}
      <Suspense fallback={null}>
        <Tracker
          movies={movies}
          watched={watched}
          signedIn={Boolean(userId)}
          isAdmin={admin}
          region={region}
          legacyProfiles={legacyProfiles}
          databaseConnected={isDatabaseConnected()}
        />
      </Suspense>
    </>
  );
}
