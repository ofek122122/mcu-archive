import { isAuthenticated } from "@/lib/auth";
import { getWatchedMovies, isDatabaseConnected } from "@/lib/kv";
import { withReleaseStatus } from "@/lib/movies";
import { PasscodeGate } from "@/components/passcode-gate";
import { Tracker } from "@/components/tracker";

export default async function HomePage() {
  if (!(await isAuthenticated())) {
    return <PasscodeGate />;
  }

  const watched = await getWatchedMovies();

  // Release status is resolved server-side so hydration stays deterministic.
  const movies = withReleaseStatus();

  return (
    <Tracker movies={movies} watched={watched} databaseConnected={isDatabaseConnected()} />
  );
}
