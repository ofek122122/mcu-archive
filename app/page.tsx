import { Suspense } from "react";

import { getCurrentUser } from "@/lib/auth";
import { countWatched, getWatchedMovies, isDatabaseConnected } from "@/lib/kv";
import { TOTAL_MOVIES, withReleaseStatus } from "@/lib/movies";
import { listUsers } from "@/lib/users";
import { AuthGate, type PublicUser } from "@/components/auth-gate";
import { Tracker } from "@/components/tracker";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    // The directory is public by design — anyone can see who has a profile,
    // but each profile still needs its own PIN to open.
    const users = await listUsers();
    const withCounts: PublicUser[] = await Promise.all(
      users.map(async (entry) => ({
        id: entry.id,
        username: entry.username,
        watched: await countWatched(entry.id),
      })),
    );

    return <AuthGate users={withCounts} total={TOTAL_MOVIES} />;
  }

  const watched = await getWatchedMovies(user.id);

  // Release status is resolved server-side so hydration stays deterministic.
  const movies = withReleaseStatus();

  return (
    // Tracker reads its initial filter state from the URL via useSearchParams,
    // which Next requires to sit inside a Suspense boundary.
    <Suspense fallback={null}>
      <Tracker
        movies={movies}
        watched={watched}
        username={user.username}
        databaseConnected={isDatabaseConnected()}
      />
    </Suspense>
  );
}
