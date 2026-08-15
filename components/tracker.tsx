"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useOptimistic, useState, useTransition } from "react";
import { CheckCheck, SearchX, Undo2 } from "lucide-react";

import { toggleManyWatchedAction, toggleWatchedAction } from "@/app/actions";
import { CHARACTER_LABELS, HEROES } from "@/lib/heroes";
import { MOVIES, themeFor } from "@/lib/movies";
import { PHASES } from "@/lib/universes";
import type { HeroId, PhaseId, Theme, TrackedMovie, UniverseId } from "@/lib/types";
import {
  FilterBar,
  type PhaseFilter,
  type SortKey,
  type StatusFilter,
  type TimelineOrder,
  type ViewMode,
} from "@/components/filter-bar";
import { CompactList } from "@/components/compact-list";
import { HeroRail } from "@/components/hero-rail";
import { MovieCard } from "@/components/movie-card";
import { MovieModal } from "@/components/movie-modal";
import { ProgressHeader, type ViewId } from "@/components/progress-header";
import { RouletteModal } from "@/components/roulette-modal";
import { StatsView } from "@/components/stats-view";

type TrackerProps = {
  movies: TrackedMovie[];
  watched: string[];
  databaseConnected: boolean;
};

/** A batch-capable optimistic update. */
type OptimisticToggle = { ids: string[]; next: boolean };

type Group = { key: string; label: string; sub: string; theme: Theme; movies: TrackedMovie[] };

/** Stable catalog numbers, by release order across the whole catalog. */
const CATALOG_NUMBER = new Map(MOVIES.map((movie, index) => [movie.id, index + 1]));

const HERO_IDS = new Set<string>(HEROES.map((hero) => hero.id));

export function Tracker({ movies, watched, databaseConnected }: TrackerProps) {
  const searchParams = useSearchParams();

  const [view, setView] = useState<ViewId>(() => parseView(searchParams.get("view")));
  const [hero, setHero] = useState<HeroId | null>(() => parseHero(searchParams.get("hero")));
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [status, setStatus] = useState<StatusFilter>(() => parseStatus(searchParams.get("status")));
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>(() =>
    parsePhase(searchParams.get("phase")),
  );
  const [universes, setUniverses] = useState<UniverseId[]>(() =>
    parseUniverses(searchParams.get("studios")),
  );
  const [order, setOrder] = useState<TimelineOrder>(() => parseOrder(searchParams.get("order")));
  const [sort, setSort] = useState<SortKey>(() => parseSort(searchParams.get("sort")));
  const [mode, setMode] = useState<ViewMode>(() => parseMode(searchParams.get("mode")));

  const [activeMovie, setActiveMovie] = useState<TrackedMovie | null>(null);
  const [roulettePick, setRoulettePick] = useState<TrackedMovie | null>(null);
  const [, startTransition] = useTransition();

  // The server value is the source of truth; this layer just makes clicks feel
  // instant while the Server Action round-trips to Redis.
  const [optimisticWatched, applyToggle] = useOptimistic(
    watched,
    (current: string[], update: OptimisticToggle) => {
      if (!update.next) {
        const removing = new Set(update.ids);
        return current.filter((id) => !removing.has(id));
      }
      return [...new Set([...current, ...update.ids])];
    },
  );

  const watchedSet = useMemo(() => new Set(optimisticWatched), [optimisticWatched]);

  // ── URL sync ──────────────────────────────────────────────────────────────
  // history.replaceState rather than router.replace: this page is dynamically
  // rendered, so a router navigation would round-trip to the server on every
  // keystroke. Only non-default values are written, keeping URLs clean.
  useEffect(() => {
    const params = new URLSearchParams();
    if (view !== "all") params.set("view", view);
    if (hero) params.set("hero", hero);
    if (query.trim()) params.set("q", query.trim());
    if (status !== "all") params.set("status", status);
    if (phaseFilter !== "all") params.set("phase", String(phaseFilter));
    if (universes.length > 0) params.set("studios", universes.join(","));
    if (order !== "release") params.set("order", order);
    if (sort !== "release-asc") params.set("sort", sort);
    if (mode !== "posters") params.set("mode", mode);

    const search = params.toString();
    window.history.replaceState(null, "", search ? `${window.location.pathname}?${search}` : window.location.pathname);
  }, [view, hero, query, status, phaseFilter, universes, order, sort, mode]);

  // ── Filtering ─────────────────────────────────────────────────────────────
  const scoped = useMemo(
    () => (view === "mcu" ? movies.filter((movie) => movie.universe === "mcu") : movies),
    [movies, view],
  );

  const heroCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const movie of scoped) {
      for (const tag of movie.characters) {
        if (HERO_IDS.has(tag)) counts[tag] = (counts[tag] ?? 0) + 1;
      }
    }
    return counts;
  }, [scoped]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const filtered = scoped.filter((movie) => {
      if (hero && !movie.characters.includes(hero)) return false;
      if (view === "mcu" && phaseFilter !== "all" && movie.phase !== phaseFilter) return false;
      if (view !== "mcu" && universes.length > 0 && !universes.includes(movie.universe)) return false;
      if (status === "watched" && !watchedSet.has(movie.id)) return false;
      if (status === "unwatched" && watchedSet.has(movie.id)) return false;

      if (needle) {
        const haystack = [
          movie.title,
          movie.director,
          movie.studio,
          movie.franchise,
          ...movie.villains,
          ...movie.characters.map((tag) => CHARACTER_LABELS[tag] ?? tag),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(needle)) return false;
      }

      return true;
    });

    return sortMovies(filtered, sort, view === "mcu" && order === "chrono");
  }, [scoped, hero, view, phaseFilter, universes, status, query, watchedSet, sort, order]);

  // Group into chapters, except when a search or hero filter makes a flat list
  // of results the clearer answer.
  const isChrono = view === "mcu" && order === "chrono";
  const grouped = !isChrono && !query.trim() && !hero;

  const groups: Group[] = useMemo(() => {
    if (!grouped) return [];

    if (view === "mcu") {
      return PHASES.map((phase) => {
        const inPhase = visible.filter((movie) => movie.phase === phase.id);
        return {
          key: `phase-${phase.id}`,
          label: phase.label,
          sub: `${phase.saga} · ${phase.years}`,
          theme: themeFor({ universe: "mcu", phase: phase.id, franchise: "" }),
          movies: inPhase,
        };
      }).filter((group) => group.movies.length > 0);
    }

    // All Marvel — group by franchise, ordered by earliest release.
    const byFranchise = new Map<string, TrackedMovie[]>();
    for (const movie of visible) {
      const bucket = byFranchise.get(movie.franchise);
      if (bucket) bucket.push(movie);
      else byFranchise.set(movie.franchise, [movie]);
    }

    return [...byFranchise.entries()]
      .map(([franchise, list]) => ({
        key: franchise,
        label: franchise,
        sub: `${list[0].studio} · ${list.length} film${list.length === 1 ? "" : "s"}`,
        theme: themeFor(list[0]),
        movies: list,
      }))
      .sort((a, b) => a.movies[0].releaseDate.localeCompare(b.movies[0].releaseDate));
  }, [grouped, view, visible]);

  // ── Counts ────────────────────────────────────────────────────────────────
  const perPhase = useMemo(() => {
    const totals: Record<number, { watched: number; total: number }> = {};
    for (const phase of PHASES) totals[phase.id] = { watched: 0, total: 0 };
    for (const movie of movies) {
      if (!movie.phase) continue;
      totals[movie.phase].total += 1;
      if (watchedSet.has(movie.id)) totals[movie.phase].watched += 1;
    }
    return totals;
  }, [movies, watchedSet]);

  const scopedWatched = useMemo(
    () => scoped.filter((movie) => watchedSet.has(movie.id)).length,
    [scoped, watchedSet],
  );

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleToggle = useCallback(
    (movie: TrackedMovie, next: boolean) => {
      startTransition(async () => {
        applyToggle({ ids: [movie.id], next });
        await toggleWatchedAction(movie.id, next);
      });
    },
    [applyToggle],
  );

  const handleBatch = useCallback(
    (ids: string[], next: boolean) => {
      if (ids.length === 0) return;
      startTransition(async () => {
        applyToggle({ ids, next });
        await toggleManyWatchedAction(ids, next);
      });
    },
    [applyToggle],
  );

  const unwatchedPool = useMemo(
    () => visible.filter((movie) => !watchedSet.has(movie.id)),
    [visible, watchedSet],
  );

  const spin = useCallback(() => {
    if (unwatchedPool.length === 0) return;
    const pick = unwatchedPool[Math.floor(Math.random() * unwatchedPool.length)];
    setRoulettePick(pick);
  }, [unwatchedPool]);

  return (
    <div className="min-h-dvh">
      <div className="sticky top-0 z-50">
        <ProgressHeader
          view={view}
          onViewChange={setView}
          watchedCount={view === "stats" ? scopedWatched : scopedWatched}
          total={scoped.length}
          perPhase={perPhase}
          databaseConnected={databaseConnected}
          onRoulette={spin}
          rouletteDisabled={unwatchedPool.length === 0}
        />

        {view !== "stats" ? (
          <>
            <FilterBar
              isMcuView={view === "mcu"}
              query={query}
              onQueryChange={setQuery}
              status={status}
              onStatusChange={setStatus}
              universes={universes}
              onUniversesChange={setUniverses}
              phase={phaseFilter}
              onPhaseChange={setPhaseFilter}
              order={order}
              onOrderChange={setOrder}
              sort={sort}
              onSortChange={setSort}
              mode={mode}
              onModeChange={setMode}
              resultCount={visible.length}
            />
            <div className="glass border-b border-white/8">
              <div className="mx-auto max-w-[1500px] px-4 py-1.5 sm:px-6">
                <HeroRail active={hero} counts={heroCounts} onChange={setHero} />
              </div>
            </div>
          </>
        ) : null}
      </div>

      <main className="relative mx-auto max-w-[1500px] px-4 pt-8 pb-28 sm:px-6">
        {view === "stats" ? (
          <StatsView movies={movies} watchedSet={watchedSet} />
        ) : visible.length === 0 ? (
          <EmptyState />
        ) : mode === "compact" ? (
          <div className="space-y-4">
            <BatchBar
              label={isChrono ? "Chronological story order" : "Results"}
              movies={visible}
              watchedSet={watchedSet}
              onBatch={handleBatch}
            />
            <CompactList
              movies={visible}
              watchedSet={watchedSet}
              orderById={isChrono ? chronoNumbers(visible) : CATALOG_NUMBER}
              onToggle={handleToggle}
              onOpen={setActiveMovie}
            />
          </div>
        ) : grouped ? (
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute top-2 bottom-8 left-[27px] hidden w-px lg:block"
              style={{
                background:
                  "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.22) 6%, rgba(255,255,255,0.22) 94%, transparent 100%)",
              }}
            />

            {groups.map((group, groupIndex) => (
              <section key={group.key} className="relative mb-16 last:mb-0">
                <ChapterHeader
                  group={group}
                  watchedSet={watchedSet}
                  onBatch={handleBatch}
                />
                <CardGrid
                  movies={group.movies}
                  watchedSet={watchedSet}
                  chrono={false}
                  baseDelay={groupIndex * 40}
                  onToggle={handleToggle}
                  onOpen={setActiveMovie}
                />
              </section>
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            <BatchBar
              label={isChrono ? "Chronological story order" : "Results"}
              movies={visible}
              watchedSet={watchedSet}
              onBatch={handleBatch}
            />
            <CardGrid
              movies={visible}
              watchedSet={watchedSet}
              chrono={isChrono}
              baseDelay={0}
              onToggle={handleToggle}
              onOpen={setActiveMovie}
            />
          </div>
        )}
      </main>

      {activeMovie ? (
        <MovieModal
          movie={activeMovie}
          theme={themeFor(activeMovie)}
          watched={watchedSet.has(activeMovie.id)}
          onToggle={handleToggle}
          onClose={() => setActiveMovie(null)}
        />
      ) : null}

      {roulettePick ? (
        <RouletteModal
          key={roulettePick.id}
          movie={roulettePick}
          watched={watchedSet.has(roulettePick.id)}
          onToggle={handleToggle}
          onReroll={spin}
          onClose={() => setRoulettePick(null)}
        />
      ) : null}
    </div>
  );
}

// ── Pieces ──────────────────────────────────────────────────────────────────

function CardGrid({
  movies,
  watchedSet,
  chrono,
  baseDelay,
  onToggle,
  onOpen,
}: {
  movies: TrackedMovie[];
  watchedSet: Set<string>;
  chrono: boolean;
  baseDelay: number;
  onToggle: (movie: TrackedMovie, next: boolean) => void;
  onOpen: (movie: TrackedMovie) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:pl-[72px] xl:grid-cols-5">
      {movies.map((movie, index) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          theme={themeFor(movie)}
          order={chrono ? (movie.chronoOrder ?? 0) : (CATALOG_NUMBER.get(movie.id) ?? 0)}
          watched={watchedSet.has(movie.id)}
          delay={Math.min(baseDelay + index * 28, 480)}
          priority={baseDelay === 0 && index < 5}
          onToggle={onToggle}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}

function ChapterHeader({
  group,
  watchedSet,
  onBatch,
}: {
  group: Group;
  watchedSet: Set<string>;
  onBatch: (ids: string[], next: boolean) => void;
}) {
  const ids = group.movies.map((movie) => movie.id);
  const seen = ids.filter((id) => watchedSet.has(id)).length;
  const allWatched = seen === ids.length;
  const percent = ids.length === 0 ? 0 : (seen / ids.length) * 100;
  const { theme } = group;

  return (
    <div className="relative mb-6">
      <span
        aria-hidden="true"
        className="glass absolute top-3 left-0 hidden size-14 items-center justify-center rounded-full font-display text-lg tracking-wide lg:flex"
        style={{
          color: theme.accent,
          border: `1px solid ${theme.accent}66`,
          boxShadow: `0 0 28px ${theme.accent}55, inset 0 0 18px ${theme.accent}22`,
        }}
      >
        {theme.short}
      </span>

      <span
        aria-hidden="true"
        className="absolute top-[38px] left-14 hidden h-px w-4 lg:block"
        style={{ background: `linear-gradient(90deg, ${theme.accent}88, transparent)` }}
      />

      <div
        className="glass glass-edge relative overflow-hidden rounded-xl px-4 py-4 sm:px-5 lg:ml-[72px]"
        style={
          {
            "--edge-from": `${theme.accent}88`,
            "--edge-to": `${theme.secondary}44`,
          } as React.CSSProperties
        }
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `linear-gradient(100deg, ${theme.accent}1f 0%, transparent 55%)` }}
        />

        <div className="relative flex flex-wrap items-end gap-3 sm:gap-5">
          <div className="min-w-0 flex-1">
            <h2
              className="font-display text-2xl leading-none tracking-wide uppercase sm:text-3xl"
              style={{ color: theme.accent }}
            >
              {group.label}
            </h2>
            <p className="mt-1.5 truncate font-mono text-[10px] tracking-brand text-mist uppercase">
              {group.sub}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="font-display text-xl leading-none text-bone tabular-nums sm:text-2xl">
              {seen}
              <span className="text-mist/50">/</span>
              <span className="text-mist">{ids.length}</span>
            </p>
            <p className="mt-1 font-mono text-[9px] tracking-brand text-mist uppercase">Logged</p>
          </div>

          <button
            type="button"
            onClick={() => onBatch(ids, !allWatched)}
            className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-[10px] tracking-brand uppercase transition-all"
            style={{
              borderColor: `${theme.accent}66`,
              color: theme.accent,
              backgroundColor: `${theme.accent}12`,
            }}
          >
            {allWatched ? <Undo2 className="size-3" /> : <CheckCheck className="size-3" />}
            {allWatched ? "Unmark all" : "Mark all watched"}
          </button>
        </div>

        <div className="relative mt-4 h-px w-full bg-white/10">
          <div
            className="h-px transition-[width] duration-500 ease-out"
            style={{
              width: `${percent}%`,
              backgroundColor: theme.accent,
              boxShadow: `0 0 10px ${theme.accent}`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

/** Batch controls for a flat (ungrouped) result set. */
function BatchBar({
  label,
  movies,
  watchedSet,
  onBatch,
}: {
  label: string;
  movies: TrackedMovie[];
  watchedSet: Set<string>;
  onBatch: (ids: string[], next: boolean) => void;
}) {
  const ids = movies.map((movie) => movie.id);
  const seen = ids.filter((id) => watchedSet.has(id)).length;
  const allWatched = seen === ids.length;

  return (
    <div className="glass glass-edge flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-2.5">
      <p className="font-mono text-[10px] tracking-brand text-mist uppercase">
        {label} <span className="text-mist/50">·</span> {seen}/{ids.length} logged
      </p>
      <button
        type="button"
        onClick={() => onBatch(ids, !allWatched)}
        className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/12 px-3 py-1.5 font-mono text-[10px] tracking-brand text-mist uppercase transition-colors hover:border-arc/60 hover:text-arc"
      >
        {allWatched ? <Undo2 className="size-3" /> : <CheckCheck className="size-3" />}
        {allWatched ? "Unmark these" : "Mark these watched"}
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="glass glass-edge mx-auto flex max-w-md flex-col items-center justify-center rounded-xl py-20 text-center">
      <SearchX className="mb-4 size-8 text-mist/40" />
      <h2 className="font-display text-2xl tracking-wide text-mist uppercase">Nothing here</h2>
      <p className="mt-2 max-w-xs px-6 text-sm text-mist/70">
        No films match this combination of filters. Try clearing the search or widening the studios.
      </p>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function sortMovies(list: TrackedMovie[], sort: SortKey, chrono: boolean): TrackedMovie[] {
  const copy = [...list];

  // Chronological view overrides the release-date sorts; other sorts still win
  // so the dropdown never silently stops working.
  if (chrono && sort.startsWith("release")) {
    return copy.sort((a, b) => (a.chronoOrder ?? 0) - (b.chronoOrder ?? 0));
  }

  switch (sort) {
    case "release-desc":
      return copy.sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));
    case "rating-desc":
      return copy.sort((a, b) => (b.imdbRating ?? -1) - (a.imdbRating ?? -1));
    case "rating-asc":
      return copy.sort((a, b) => (a.imdbRating ?? 99) - (b.imdbRating ?? 99));
    case "runtime-desc":
      return copy.sort((a, b) => (b.runtime ?? 0) - (a.runtime ?? 0));
    case "title-asc":
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return copy.sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));
  }
}

function chronoNumbers(list: TrackedMovie[]): Map<string, number> {
  return new Map(list.map((movie) => [movie.id, movie.chronoOrder ?? 0]));
}

function parseView(value: string | null): ViewId {
  return value === "mcu" || value === "stats" ? value : "all";
}

function parseHero(value: string | null): HeroId | null {
  return value && HERO_IDS.has(value) ? (value as HeroId) : null;
}

function parseStatus(value: string | null): StatusFilter {
  return value === "watched" || value === "unwatched" ? value : "all";
}

function parsePhase(value: string | null): PhaseFilter {
  const n = Number(value);
  return n >= 1 && n <= 6 ? (n as PhaseId) : "all";
}

function parseUniverses(value: string | null): UniverseId[] {
  if (!value) return [];
  const allowed: UniverseId[] = ["mcu", "fox", "sony", "legacy"];
  return value.split(",").filter((id): id is UniverseId => allowed.includes(id as UniverseId));
}

function parseOrder(value: string | null): TimelineOrder {
  return value === "chrono" ? "chrono" : "release";
}

function parseSort(value: string | null): SortKey {
  const allowed: SortKey[] = [
    "release-asc",
    "release-desc",
    "rating-desc",
    "rating-asc",
    "runtime-desc",
    "title-asc",
  ];
  return allowed.includes(value as SortKey) ? (value as SortKey) : "release-asc";
}

function parseMode(value: string | null): ViewMode {
  return value === "compact" ? "compact" : "posters";
}
