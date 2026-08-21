"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  Ban,
  CheckCircle2,
  Database,
  Download,
  Film,
  Loader2,
  RotateCcw,
  Search,
  Shield,
  ShieldOff,
  Trash2,
  TriangleAlert,
  Upload,
  Users,
} from "lucide-react";

import type { ActivityEvent as ActivityEventBase } from "@/lib/activity";
import type { AuditEntry as AuditEntryBase } from "@/lib/audit";
import type { AdminUserRow, CatalogHealth, Overview } from "@/lib/admin-data";
import {
  adminToggleTitleAction,
  cleanupOrphansAction,
  clearActivityAction,
  clearAuditAction,
  deleteLegacyAction,
  deleteUserAction,
  exportDataAction,
  importDataAction,
  resetUserListAction,
  setUserBannedAction,
  setUserRoleAction,
  type ActionResult,
} from "@/app/admin/actions";
import { ActivityChart, BarList, StatTile } from "@/components/admin/charts";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

/** Timestamps arrive preformatted from the server — see relativeTime there. */
type FeedEvent = ActivityEventBase & { ago: string };
type AuditRow = AuditEntryBase & { ago: string };

type TabId = "overview" | "users" | "titles" | "catalog" | "data" | "audit";

const TABS: { id: TabId; label: string; icon: typeof Users }[] = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "users", label: "Users", icon: Users },
  { id: "titles", label: "Titles", icon: Film },
  { id: "catalog", label: "Catalog", icon: CheckCircle2 },
  { id: "data", label: "Data", icon: Database },
  { id: "audit", label: "Audit", icon: Shield },
];

export type AdminPanelProps = {
  adminName: string;
  /** Deep-linkable via ?tab= so a section can be bookmarked or shared. */
  initialTab?: TabId;
  users: AdminUserRow[];
  overview: Overview;
  health: CatalogHealth;
  activity: FeedEvent[];
  audit: AuditRow[];
  legacyProfiles: { id: string; username: string; watched: number }[];
  titleById: Record<string, string>;
  catalogTitles: { id: string; title: string; year: number }[];
};

export function AdminPanel(props: AdminPanelProps) {
  const [tab, setTab] = useState<TabId>(props.initialTab ?? "overview");
  const [toast, setToast] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  /** Every action funnels through here so the toast and spinner are uniform. */
  function run(action: () => Promise<ActionResult>) {
    startTransition(async () => {
      try {
        setToast(await action());
      } catch (error) {
        setToast({ ok: false, message: error instanceof Error ? error.message : "Action failed." });
      }
    });
  }

  return (
    <div className="min-h-dvh">
      <header className="glass-strong sticky top-0 z-50 border-b border-white/10">
        <div className="mx-auto max-w-[1400px] px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="bg-gold px-2 py-1 font-display text-base leading-none text-void -skew-x-6">
                ADMIN
              </span>
              <span className="hidden font-mono text-[10px] tracking-brand text-mist uppercase sm:inline">
                {props.adminName}
              </span>
            </div>

            <nav
              aria-label="Admin sections"
              className="no-scrollbar order-3 flex w-full items-center gap-0.5 overflow-x-auto rounded-lg border border-white/10 bg-void/50 p-0.5 md:order-2 md:w-auto"
            >
              {TABS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-current={tab === item.id ? "page" : undefined}
                    onClick={() => {
                      setTab(item.id);
                      window.history.replaceState(null, "", `/admin?tab=${item.id}`);
                    }}
                    className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 font-display text-xs tracking-wider uppercase transition-colors ${
                      tab === item.id ? "bg-bone text-void" : "text-mist hover:text-bone"
                    }`}
                  >
                    <Icon className="size-3.5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="order-2 flex items-center gap-2 md:order-3">
              {pending ? <Loader2 className="size-4 animate-spin text-arc" /> : null}
              <Link
                href="/"
                className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 font-mono text-[10px] tracking-brand text-mist uppercase transition-colors hover:border-arc/50 hover:text-bone"
              >
                <ArrowLeft className="size-3" />
                Archive
              </Link>
            </div>
          </div>
        </div>
      </header>

      {toast ? (
        <div
          role="status"
          className={`glass-strong fixed right-4 bottom-4 z-100 max-w-sm rounded-xl border px-4 py-3 ${
            toast.ok ? "border-emerald-400/40" : "border-marvel/50"
          }`}
        >
          <p className={`text-sm ${toast.ok ? "text-emerald-300" : "text-marvel"}`}>
            {toast.message}
          </p>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="mt-1 cursor-pointer font-mono text-[9px] tracking-brand text-mist uppercase hover:text-bone"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
        {tab === "overview" ? <OverviewTab {...props} /> : null}
        {tab === "users" ? <UsersTab {...props} run={run} /> : null}
        {tab === "titles" ? <TitlesTab overview={props.overview} /> : null}
        {tab === "catalog" ? <CatalogTab health={props.health} run={run} /> : null}
        {tab === "data" ? <DataTab {...props} run={run} /> : null}
        {tab === "audit" ? <AuditTab audit={props.audit} run={run} /> : null}
      </main>
    </div>
  );
}

// ── Overview ────────────────────────────────────────────────────────────────

function OverviewTab({ overview, activity, users, titleById }: AdminPanelProps) {
  const hours = overview.totalMinutes / 60;
  const nameById = useMemo(
    () => Object.fromEntries(users.map((user) => [user.id, user.name])),
    [users],
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatTile label="Accounts" value={String(overview.totalUsers)} sub={`${overview.adminCount} admin`} accent="#5ad2f4" />
        <StatTile label="New this week" value={`+${overview.newUsers7d}`} sub="signups, last 7 days" accent="#a970ff" />
        <StatTile label="Active today" value={String(overview.activeToday)} sub={`${overview.active7d} in last 7 days`} accent="#16a34a" />
        <StatTile label="Titles ticked" value={String(overview.totalTicks)} sub="across all accounts" accent="#f5c518" />
        <StatTile label="Combined watch time" value={`${Math.round(hours)}h`} sub={`${(hours / 24).toFixed(1)} days`} accent="#e11d48" />
        <StatTile label="Never watched" value={String(overview.unseen.length)} sub="by anyone, yet" accent="#8a8a9d" />
      </div>

      <ActivityChart series={overview.series} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <BarList
          title="Most watched"
          subtitle="Share of accounts that ticked it"
          rows={overview.titleStats.slice(0, 8).map((stat) => ({
            key: stat.id,
            label: stat.title,
            value: stat.watchers,
            max: Math.max(1, overview.totalUsers),
            accent: "#5ad2f4",
            note: `${stat.watchers}/${overview.totalUsers}`,
          }))}
        />

        <BarList
          title="Completion by account"
          subtitle="Titles logged out of the full catalog"
          rows={[...users]
            .sort((a, b) => b.watched - a.watched)
            .slice(0, 8)
            .map((user) => ({
              key: user.id,
              label: user.name,
              value: user.watched,
              max: Math.max(1, ...users.map((u) => u.watched)),
              accent: "#a970ff",
              note: `${user.watched} · ${user.percent.toFixed(0)}%`,
            }))}
          emptyLabel="No accounts yet."
        />

        <BarList
          title="By universe"
          subtitle="Total ticks against everything on offer"
          rows={overview.universeRows.map((row) => ({
            key: row.id,
            label: row.label,
            value: row.watched,
            max: Math.max(1, ...overview.universeRows.map((r) => r.total)),
            accent: row.chartAccent,
            note: `${row.watched} · ${row.percent.toFixed(0)}%`,
          }))}
        />

        <section className="glass glass-edge rounded-xl p-5">
          <h2 className="font-display text-lg tracking-wide text-bone uppercase">Recent activity</h2>
          <p className="mt-1 font-mono text-[10px] tracking-brand text-mist uppercase">
            Newest first
          </p>

          {activity.length === 0 ? (
            <p className="mt-5 text-sm text-mist/70">
              No activity recorded yet — the feed fills from the first tick after this release.
            </p>
          ) : (
            <ul className="mt-4 max-h-72 space-y-1.5 overflow-y-auto pr-1">
              {activity.slice(0, 40).map((event, index) => (
                <li
                  key={`${event.t}-${index}`}
                  className="flex items-center gap-2 border-b border-white/5 pb-1.5 text-[12px] last:border-0"
                >
                  <span
                    className={`size-1.5 shrink-0 rounded-full ${event.w ? "bg-emerald-400" : "bg-mist/50"}`}
                  />
                  <span className="truncate text-bone">{nameById[event.u] ?? "unknown"}</span>
                  <span className="text-mist/60">{event.w ? "ticked" : "unticked"}</span>
                  <span className="min-w-0 flex-1 truncate text-mist">
                    {event.n > 1 ? `${event.n} titles` : (titleById[event.m] ?? event.m)}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] text-mist/50">{event.ago}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

// ── Users ───────────────────────────────────────────────────────────────────

function UsersTab({
  users,
  catalogTitles,
  run,
}: AdminPanelProps & { run: (action: () => Promise<ActionResult>) => void }) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<AdminUserRow | null>(null);

  const filtered = users.filter((user) =>
    `${user.name} ${user.email}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-mist/60" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name or email…"
          aria-label="Search users"
          className="w-full rounded-lg border border-white/10 bg-void/50 py-2 pr-3 pl-9 font-mono text-[12px] text-bone placeholder:text-mist/50 focus:border-arc focus:outline-none"
        />
      </div>

      <div className="glass glass-edge overflow-hidden rounded-xl">
        {filtered.length === 0 ? (
          <p className="p-6 text-sm text-mist/70">No accounts match.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {filtered.map((user) => (
              <li key={user.id}>
                <div className="flex flex-wrap items-center gap-3 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={user.imageUrl}
                    alt=""
                    className="size-9 shrink-0 rounded-full border border-white/10"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 truncate">
                      <span className="font-display text-sm tracking-wide text-bone uppercase">
                        {user.name}
                      </span>
                      {user.isAdmin ? (
                        <span className="rounded-[3px] bg-gold/20 px-1.5 py-0.5 font-mono text-[9px] tracking-brand text-gold uppercase">
                          {user.lockedAdmin ? "Admin · env" : "Admin"}
                        </span>
                      ) : null}
                      {user.banned ? (
                        <span className="rounded-[3px] bg-marvel/20 px-1.5 py-0.5 font-mono text-[9px] tracking-brand text-marvel uppercase">
                          Blocked
                        </span>
                      ) : null}
                    </p>
                    <p className="truncate font-mono text-[10px] text-mist">{user.email}</p>
                  </div>

                  <div className="w-28 shrink-0">
                    <p className="font-mono text-[10px] text-mist tabular-nums">
                      {user.watched} · {user.percent.toFixed(0)}%
                    </p>
                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full bg-arc"
                        style={{ width: `${user.percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="hidden w-28 shrink-0 font-mono text-[10px] text-mist/70 lg:block">
                    <p>joined {user.joinedAgo}</p>
                    <p>seen {user.lastSeenAgo}</p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <IconButton
                      title={expanded === user.id ? "Hide list" : "View list"}
                      onClick={() => setExpanded(expanded === user.id ? null : user.id)}
                    >
                      <Film className="size-3.5" />
                    </IconButton>

                    <IconButton
                      title={user.isAdmin ? "Revoke admin" : "Make admin"}
                      disabled={user.lockedAdmin}
                      onClick={() => run(() => setUserRoleAction(user.id, !user.isAdmin))}
                    >
                      {user.isAdmin ? <ShieldOff className="size-3.5" /> : <Shield className="size-3.5" />}
                    </IconButton>

                    <IconButton
                      title={user.banned ? "Unblock" : "Block sign-in"}
                      onClick={() => run(() => setUserBannedAction(user.id, !user.banned))}
                    >
                      <Ban className="size-3.5" />
                    </IconButton>

                    <IconButton
                      title="Reset watch list"
                      onClick={() => run(() => resetUserListAction(user.id))}
                    >
                      <RotateCcw className="size-3.5" />
                    </IconButton>

                    <IconButton title="Delete account" danger onClick={() => setConfirm(user)}>
                      <Trash2 className="size-3.5" />
                    </IconButton>
                  </div>
                </div>

                {expanded === user.id ? (
                  <UserTitles
                    user={user}
                    catalogTitles={catalogTitles}
                    run={run}
                  />
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      {confirm ? (
        <ConfirmDialog
          title={`Delete ${confirm.name}?`}
          body="This removes their Clerk account and their entire watch list. It cannot be undone."
          confirmWord={confirm.email}
          confirmLabel="Delete account"
          onCancel={() => setConfirm(null)}
          onConfirm={(value) => {
            const target = confirm;
            setConfirm(null);
            run(() => deleteUserAction(target.id, value));
          }}
        />
      ) : null}
    </div>
  );
}

/** Expanded row: every title the user has ticked, each removable. */
function UserTitles({
  user,
  catalogTitles,
  run,
}: {
  user: AdminUserRow;
  catalogTitles: { id: string; title: string; year: number }[];
  run: (action: () => Promise<ActionResult>) => void;
}) {
  const [filter, setFilter] = useState("");
  const visible = catalogTitles.filter((title) =>
    title.title.toLowerCase().includes(filter.trim().toLowerCase()),
  );

  return (
    <div className="border-t border-white/5 bg-void/30 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[10px] tracking-brand text-mist uppercase">
          {user.watched} of {catalogTitles.length} ticked — click to toggle
        </p>
        <input
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder="Filter titles…"
          aria-label="Filter titles"
          className="rounded-lg border border-white/10 bg-void/60 px-2.5 py-1 font-mono text-[11px] text-bone placeholder:text-mist/50 focus:border-arc focus:outline-none"
        />
      </div>

      <div className="mt-3 flex max-h-64 flex-wrap gap-1.5 overflow-y-auto">
        {visible.map((title) => {
          const on = user.watchedIds?.includes(title.id) ?? false;
          return (
            <button
              key={title.id}
              type="button"
              onClick={() => run(() => adminToggleTitleAction(user.id, title.id, !on))}
              className={`cursor-pointer rounded-md border px-2 py-1 font-mono text-[10px] transition-colors ${
                on
                  ? "border-arc/60 bg-arc/15 text-arc"
                  : "border-white/10 text-mist/60 hover:border-white/25 hover:text-bone"
              }`}
            >
              {title.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Titles ──────────────────────────────────────────────────────────────────

function TitlesTab({ overview }: { overview: Overview }) {
  const [sort, setSort] = useState<"most" | "least">("most");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const list = [...overview.titleStats];
    if (sort === "least") list.reverse();
    const needle = query.trim().toLowerCase();
    return needle ? list.filter((stat) => stat.title.toLowerCase().includes(needle)) : list;
  }, [overview.titleStats, sort, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-mist/60" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search titles…"
            aria-label="Search titles"
            className="w-full rounded-lg border border-white/10 bg-void/50 py-2 pr-3 pl-9 font-mono text-[12px] text-bone placeholder:text-mist/50 focus:border-arc focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-0.5 rounded-lg border border-white/10 bg-void/50 p-0.5">
          {(["most", "least"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={sort === value}
              onClick={() => setSort(value)}
              className={`cursor-pointer rounded-md px-3 py-1.5 font-mono text-[10px] tracking-brand uppercase transition-colors ${
                sort === value ? "bg-bone text-void" : "text-mist hover:text-bone"
              }`}
            >
              {value} watched
            </button>
          ))}
        </div>
      </div>

      <div className="glass glass-edge overflow-hidden rounded-xl">
        <ul className="divide-y divide-white/5">
          {rows.slice(0, 120).map((stat, index) => (
            <li key={stat.id} className="flex items-center gap-3 px-3 py-2">
              <span className="w-7 shrink-0 font-mono text-[10px] text-mist/50 tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] text-bone">{stat.title}</span>
                <span className="font-mono text-[10px] text-mist/70">
                  {stat.year} · {stat.universe.toUpperCase()} · {stat.kind}
                  {stat.imdbRating !== null ? ` · IMDb ${stat.imdbRating}` : ""}
                </span>
              </span>
              <span className="w-32 shrink-0">
                <span className="block text-right font-mono text-[10px] text-mist tabular-nums">
                  {stat.watchers} · {stat.percentOfUsers.toFixed(0)}%
                </span>
                <span className="mt-1 block h-1 overflow-hidden rounded-full bg-white/8">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${stat.percentOfUsers}%`,
                      backgroundColor: stat.watchers === 0 ? "#8a8a9d" : "#5ad2f4",
                    }}
                  />
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── Catalog ─────────────────────────────────────────────────────────────────

function CatalogTab({
  health,
  run,
}: {
  health: CatalogHealth;
  run: (action: () => Promise<ActionResult>) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Titles" value={String(health.total)} sub={`${health.movies} films · ${health.series} series`} accent="#5ad2f4" />
        <StatTile label="Missing posters" value={String(health.missingPoster.length)} sub="fall back to key art" accent={health.missingPoster.length ? "#f5c518" : "#16a34a"} />
        <StatTile label="Unrated" value={String(health.missingRating.length)} sub="no IMDb score yet" accent="#8a8a9d" />
        <StatTile label="Unreleased" value={String(health.unreleased.length)} sub="future release dates" accent="#a970ff" />
      </div>

      <HealthList label="Duplicate IMDb ids" items={health.duplicateImdb} good="Every title has a unique IMDb id." />
      <HealthList label="Titles with no poster" items={health.missingPoster} good="Every title has artwork." />
      <HealthList label="Titles with no IMDb rating" items={health.missingRating} good="Every title is rated." />

      <section className="glass glass-edge rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg tracking-wide text-bone uppercase">
              Orphaned watch lists
            </h2>
            <p className="mt-1 text-[13px] text-mist">
              Redis lists whose owner no longer exists in Clerk — usually a deleted account.
            </p>
          </div>
          {health.orphanKeys.length > 0 ? (
            <button
              type="button"
              onClick={() => run(() => cleanupOrphansAction(health.orphanKeys))}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-marvel/50 bg-marvel/10 px-3 py-1.5 font-mono text-[10px] tracking-brand text-marvel uppercase transition-colors hover:bg-marvel/20"
            >
              <Trash2 className="size-3" />
              Clean up {health.orphanKeys.length}
            </button>
          ) : null}
        </div>

        {health.orphanKeys.length === 0 ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-emerald-400">
            <CheckCircle2 className="size-4" />
            No orphaned data.
          </p>
        ) : (
          <ul className="mt-4 space-y-1 font-mono text-[11px] text-mist">
            {health.orphanKeys.map((key) => (
              <li key={key}>{key}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function HealthList({ label, items, good }: { label: string; items: string[]; good: string }) {
  return (
    <section className="glass glass-edge rounded-xl p-5">
      <h2 className="font-display text-base tracking-wide text-bone uppercase">{label}</h2>
      {items.length === 0 ? (
        <p className="mt-2 flex items-center gap-2 text-sm text-emerald-400">
          <CheckCircle2 className="size-4" />
          {good}
        </p>
      ) : (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {items.map((item) => (
            <li
              key={item}
              className="rounded-md border border-gold/30 bg-gold/10 px-2 py-1 font-mono text-[10px] text-gold"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ── Data ────────────────────────────────────────────────────────────────────

function DataTab({
  legacyProfiles,
  run,
}: AdminPanelProps & { run: (action: () => Promise<ActionResult>) => void }) {
  const [importText, setImportText] = useState("");
  const [busy, setBusy] = useState(false);

  async function download() {
    setBusy(true);
    try {
      const payload = await exportDataAction();
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mcu-archive-backup-${payload.exportedAt.slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="glass glass-edge rounded-xl p-5">
        <h2 className="font-display text-lg tracking-wide text-bone uppercase">Backup</h2>
        <p className="mt-1.5 text-[13px] text-mist">
          Every account and its watch list, as JSON. Keep one before any bulk change.
        </p>
        <button
          type="button"
          onClick={download}
          disabled={busy}
          className="mt-4 flex cursor-pointer items-center gap-2 rounded-lg border border-arc/40 bg-arc/10 px-4 py-2 font-mono text-[11px] tracking-brand text-arc uppercase transition-colors hover:bg-arc/20 disabled:opacity-50"
        >
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
          Download backup
        </button>
      </section>

      <section className="glass glass-edge rounded-xl p-5">
        <h2 className="font-display text-lg tracking-wide text-bone uppercase">Restore</h2>
        <p className="mt-1.5 text-[13px] text-mist">
          Paste a backup file. Restoring is <span className="text-bone">additive</span> — it never
          removes a title someone has ticked since, so a stale backup cannot destroy newer progress.
        </p>
        <textarea
          value={importText}
          onChange={(event) => setImportText(event.target.value)}
          rows={5}
          placeholder='{ "users": [ … ] }'
          aria-label="Backup JSON"
          className="mt-3 w-full rounded-lg border border-white/10 bg-void/60 p-3 font-mono text-[11px] text-bone placeholder:text-mist/40 focus:border-arc focus:outline-none"
        />
        <button
          type="button"
          disabled={!importText.trim()}
          onClick={() => run(() => importDataAction(importText))}
          className="mt-3 flex cursor-pointer items-center gap-2 rounded-lg border border-gold/40 bg-gold/10 px-4 py-2 font-mono text-[11px] tracking-brand text-gold uppercase transition-colors hover:bg-gold/20 disabled:opacity-40"
        >
          <Upload className="size-3.5" />
          Merge backup
        </button>
      </section>

      <section className="glass glass-edge rounded-xl p-5">
        <h2 className="font-display text-lg tracking-wide text-bone uppercase">
          Legacy PIN profiles
        </h2>
        <p className="mt-1.5 text-[13px] text-mist">
          Pre-Clerk profiles still waiting to be claimed by their owner.
        </p>

        {legacyProfiles.length === 0 ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-emerald-400">
            <CheckCircle2 className="size-4" />
            All claimed — `lib/legacy-users.ts` can be deleted.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {legacyProfiles.map((profile) => (
              <li
                key={profile.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/10 px-3 py-2"
              >
                <span className="font-display text-sm tracking-wide text-bone uppercase">
                  {profile.username}
                </span>
                <span className="font-mono text-[10px] text-mist tabular-nums">
                  {profile.watched} titles
                </span>
                <button
                  type="button"
                  onClick={() => run(() => deleteLegacyAction(profile.id))}
                  className="cursor-pointer rounded-md border border-marvel/40 px-2 py-1 font-mono text-[9px] tracking-brand text-marvel uppercase transition-colors hover:bg-marvel/15"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="glass glass-edge rounded-xl border-0 p-5" style={{ "--edge-from": "rgba(226,54,54,0.6)", "--edge-to": "rgba(226,54,54,0.2)" } as React.CSSProperties}>
        <h2 className="flex items-center gap-2 font-display text-lg tracking-wide text-marvel uppercase">
          <TriangleAlert className="size-4" />
          Danger zone
        </h2>
        <p className="mt-1.5 text-[13px] text-mist">
          Clearing the activity feed loses the history behind the charts. Watch lists are untouched.
        </p>
        <button
          type="button"
          onClick={() => run(clearActivityAction)}
          className="mt-4 cursor-pointer rounded-lg border border-marvel/50 bg-marvel/10 px-4 py-2 font-mono text-[11px] tracking-brand text-marvel uppercase transition-colors hover:bg-marvel/20"
        >
          Clear activity feed
        </button>
      </section>
    </div>
  );
}

// ── Audit ───────────────────────────────────────────────────────────────────

function AuditTab({
  audit,
  run,
}: {
  audit: AuditRow[];
  run: (action: () => Promise<ActionResult>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-mist">
          Every admin write, newest first. Recorded before the action runs, so a failed action still
          leaves a trace.
        </p>
        <button
          type="button"
          onClick={() => run(clearAuditAction)}
          className="cursor-pointer rounded-lg border border-white/12 px-3 py-1.5 font-mono text-[10px] tracking-brand text-mist uppercase transition-colors hover:border-marvel/50 hover:text-marvel"
        >
          Clear log
        </button>
      </div>

      <div className="glass glass-edge overflow-hidden rounded-xl">
        {audit.length === 0 ? (
          <p className="p-6 text-sm text-mist/70">Nothing logged yet.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {audit.map((entry, index) => (
              <li key={`${entry.t}-${index}`} className="flex flex-wrap items-center gap-2 px-3 py-2">
                <span className="w-24 shrink-0 font-mono text-[10px] text-mist/60">{entry.ago}</span>
                <span className="rounded-[3px] bg-white/8 px-1.5 py-0.5 font-mono text-[9px] tracking-brand text-bone uppercase">
                  {entry.action}
                </span>
                <span className="truncate font-mono text-[10px] text-arc">{entry.actorEmail}</span>
                <span className="min-w-0 flex-1 truncate text-[12px] text-mist">{entry.detail}</span>
                <span className="hidden shrink-0 font-mono text-[9px] text-mist/40 lg:block">
                  {entry.target}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ── Shared ──────────────────────────────────────────────────────────────────

function IconButton({
  title,
  onClick,
  children,
  danger = false,
  disabled = false,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={`flex size-7 cursor-pointer items-center justify-center rounded-md border transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
        danger
          ? "border-marvel/40 text-marvel hover:bg-marvel/15"
          : "border-white/10 text-mist hover:border-white/30 hover:text-bone"
      }`}
    >
      {children}
    </button>
  );
}

