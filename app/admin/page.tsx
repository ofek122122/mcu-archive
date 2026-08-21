import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAdminUser } from "@/lib/admin";
import { readActivity } from "@/lib/activity";
import { readAudit } from "@/lib/audit";
import {
  buildOverview,
  checkCatalogHealth,
  listAdminUsers,
  relativeTime,
} from "@/lib/admin-data";
import { countWatched } from "@/lib/kv";
import { listUsers as listLegacyProfiles } from "@/lib/legacy-users";
import { MOVIES } from "@/lib/movies";
import { AdminPanel } from "@/components/admin/admin-panel";

export const metadata: Metadata = {
  title: "Admin — MCU Archive",
  robots: { index: false, follow: false },
};

const TAB_IDS = ["overview", "users", "titles", "catalog", "data", "audit"] as const;
type TabId = (typeof TAB_IDS)[number];

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const admin = await getAdminUser();

  // 404 rather than 403: a non-admin has no business learning this route
  // exists. The Server Actions behind it check again regardless.
  if (!admin) notFound();

  const requested = (await searchParams).tab;
  const initialTab = TAB_IDS.includes(requested as TabId) ? (requested as TabId) : undefined;

  const users = await listAdminUsers();

  const [overview, health, activity, audit, legacy] = await Promise.all([
    buildOverview(users),
    checkCatalogHealth(users),
    readActivity(60),
    readAudit(120),
    listLegacyProfiles(),
  ]);

  const legacyProfiles = await Promise.all(
    legacy.map(async (profile) => ({
      id: profile.id,
      username: profile.username,
      watched: await countWatched(profile.id),
    })),
  );

  return (
    <AdminPanel
      adminName={admin.email}
      initialTab={initialTab}
      users={users}
      overview={overview}
      health={health}
      // Relative times are formatted here: computing them in render is impure,
      // and would differ between the server pass and hydration.
      activity={activity.map((event) => ({ ...event, ago: relativeTime(event.t) }))}
      audit={audit.map((entry) => ({ ...entry, ago: relativeTime(entry.t) }))}
      legacyProfiles={legacyProfiles}
      titleById={Object.fromEntries(MOVIES.map((movie) => [movie.id, movie.title]))}
      catalogTitles={MOVIES.map((movie) => ({
        id: movie.id,
        title: movie.title,
        year: movie.year,
      }))}
    />
  );
}
