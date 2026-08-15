"use client";

import { useMemo, useOptimistic, useState, useTransition, type CSSProperties } from "react";
import { SearchX } from "lucide-react";

import { toggleWatchedAction } from "@/app/actions";
import { getPhase, PHASES, type Phase, type PhaseId, type TrackedMovie } from "@/lib/movies";
import { FilterBar, type PhaseFilter, type StatusFilter } from "@/components/filter-bar";
import { MovieCard } from "@/components/movie-card";
import { MovieModal } from "@/components/movie-modal";
import { ProgressHeader } from "@/components/progress-header";

type TrackerProps = {
  movies: TrackedMovie[];
  watched: string[];
  databaseConnected: boolean;
};

type OptimisticToggle = { id: string; next: boolean };

export function Tracker({ movies, watched, databaseConnected }: TrackerProps) {
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [activeMovie, setActiveMovie] = useState<TrackedMovie | null>(null);
  const [, startTransition] = useTransition();

  // The server value is the source of truth; this layer just makes the click
  // feel instant while the Server Action round-trips to Redis.
  const [optimisticWatched, applyToggle] = useOptimistic(
    watched,
    (current: string[], update: OptimisticToggle) =>
      update.next ? [...current, update.id] : current.filter((id) => id !== update.id),
  );

  const watchedSet = useMemo(() => new Set(optimisticWatched), [optimisticWatched]);

  const orderById = useMemo(
    () => new Map(movies.map((movie, index) => [movie.id, index + 1])),
    [movies],
  );

  const perPhase = useMemo(() => {
    const totals: Record<number, { watched: number; total: number }> = {};
    for (const phase of PHASES) totals[phase.id] = { watched: 0, total: 0 };
    for (const movie of movies) {
      totals[movie.phase].total += 1;
      if (watchedSet.has(movie.id)) totals[movie.phase].watched += 1;
    }
    return totals;
  }, [movies, watchedSet]);

  const watchedCount = useMemo(
    () => movies.filter((movie) => watchedSet.has(movie.id)).length,
    [movies, watchedSet],
  );

  const visible = useMemo(
    () =>
      movies.filter((movie) => {
        if (phaseFilter !== "all" && movie.phase !== phaseFilter) return false;
        if (statusFilter === "watched" && !watchedSet.has(movie.id)) return false;
        if (statusFilter === "unwatched" && watchedSet.has(movie.id)) return false;
        return true;
      }),
    [movies, phaseFilter, statusFilter, watchedSet],
  );

  const grouped = useMemo(() => {
    const map = new Map<PhaseId, TrackedMovie[]>();
    for (const movie of visible) {
      const bucket = map.get(movie.phase);
      if (bucket) bucket.push(movie);
      else map.set(movie.phase, [movie]);
    }
    return map;
  }, [visible]);

  function handleToggle(movie: TrackedMovie, next: boolean) {
    startTransition(async () => {
      applyToggle({ id: movie.id, next });
      await toggleWatchedAction(movie.id, next);
    });
  }

  const chapters = PHASES.filter((phase) => grouped.has(phase.id));

  return (
    <div className="min-h-dvh">
      <div className="sticky top-0 z-50">
        <ProgressHeader
          watchedCount={watchedCount}
          total={movies.length}
          perPhase={perPhase}
          databaseConnected={databaseConnected}
        />
        <FilterBar
          phase={phaseFilter}
          status={statusFilter}
          onPhaseChange={setPhaseFilter}
          onStatusChange={setStatusFilter}
          resultCount={visible.length}
        />
      </div>

      <main className="relative mx-auto max-w-[1500px] px-4 pt-10 pb-28 sm:px-6">
        {visible.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="relative">
            {/* ── Timeline spine ─────────────────────────────────────────
                A single gradient rail the chapter nodes hang off. Desktop
                only; on narrow screens the chapters stack without it. */}
            <div
              aria-hidden="true"
              className="absolute top-2 bottom-8 left-[27px] hidden w-px lg:block"
              style={{
                background:
                  "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.22) 6%, rgba(255,255,255,0.22) 94%, transparent 100%)",
              }}
            />

            {chapters.map((phase, chapterIndex) => {
              const films = grouped.get(phase.id) ?? [];
              const stats = perPhase[phase.id];

              return (
                <section key={phase.id} className="relative mb-16 last:mb-0">
                  <PhaseChapter phase={phase} watched={stats.watched} total={stats.total} />

                  <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:pl-[72px] xl:grid-cols-5">
                    {films.map((movie, index) => (
                      <MovieCard
                        key={movie.id}
                        movie={movie}
                        phase={getPhase(movie.phase)}
                        order={orderById.get(movie.id) ?? 0}
                        watched={watchedSet.has(movie.id)}
                        delay={Math.min(chapterIndex * 40 + index * 30, 480)}
                        onToggle={handleToggle}
                        onOpen={setActiveMovie}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>

      {activeMovie ? (
        <MovieModal
          movie={activeMovie}
          phase={getPhase(activeMovie.phase)}
          watched={watchedSet.has(activeMovie.id)}
          onToggle={handleToggle}
          onClose={() => setActiveMovie(null)}
        />
      ) : null}
    </div>
  );
}

/** Chapter marker on the timeline: node medallion, connector, glass panel. */
function PhaseChapter({
  phase,
  watched,
  total,
}: {
  phase: Phase;
  watched: number;
  total: number;
}) {
  const percent = total === 0 ? 0 : (watched / total) * 100;

  return (
    <div className="relative mb-6">
      {/* Node medallion sitting on the spine */}
      <span
        aria-hidden="true"
        className="glass absolute top-3 left-0 hidden size-14 items-center justify-center rounded-full font-display text-lg tracking-wide lg:flex"
        style={{
          color: phase.accent,
          border: `1px solid ${phase.accent}66`,
          boxShadow: `0 0 28px ${phase.accent}55, inset 0 0 18px ${phase.accent}22`,
        }}
      >
        {phase.roman}
      </span>

      {/* Connector from node to panel */}
      <span
        aria-hidden="true"
        className="absolute top-[38px] left-14 hidden h-px w-4 lg:block"
        style={{ background: `linear-gradient(90deg, ${phase.accent}88, transparent)` }}
      />

      <div
        className="glass glass-edge relative overflow-hidden rounded-xl px-4 py-4 sm:px-5 lg:ml-[72px]"
        style={
          {
            "--edge-from": `${phase.accent}88`,
            "--edge-to": `${phase.secondary}44`,
          } as CSSProperties
        }
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(100deg, ${phase.accent}1f 0%, transparent 55%)`,
          }}
        />

        <div className="relative flex items-end gap-3 sm:gap-5">
          <span
            className="outlined font-display text-4xl leading-[0.8] select-none sm:text-6xl"
            style={{ WebkitTextStrokeColor: phase.accent }}
            aria-hidden="true"
          >
            {String(phase.id).padStart(2, "0")}
          </span>

          <div className="min-w-0 flex-1">
            <h2
              className="font-display text-2xl leading-none tracking-wide uppercase sm:text-4xl"
              style={{ color: phase.accent }}
            >
              {phase.label}
            </h2>
            <p className="mt-1.5 truncate font-mono text-[10px] tracking-brand text-mist uppercase">
              {phase.saga} <span className="text-mist/50">·</span> {phase.years}
            </p>
            <p
              className="mt-1 truncate font-mono text-[9px] tracking-brand uppercase"
              style={{ color: `${phase.secondary}cc` }}
            >
              {phase.theme}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="font-display text-xl leading-none text-bone tabular-nums sm:text-2xl">
              {watched}
              <span className="text-mist/50">/</span>
              <span className="text-mist">{total}</span>
            </p>
            <p className="mt-1 font-mono text-[9px] tracking-brand text-mist uppercase">Logged</p>
          </div>
        </div>

        <div className="relative mt-4 h-px w-full bg-white/10">
          <div
            className="h-px transition-[width] duration-500 ease-out"
            style={{
              width: `${percent}%`,
              backgroundColor: phase.accent,
              boxShadow: `0 0 10px ${phase.accent}`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="glass glass-edge mx-auto flex max-w-md flex-col items-center justify-center rounded-xl py-20 text-center">
      <SearchX className="mb-4 size-8 text-mist/40" />
      <h2 className="font-display text-2xl tracking-wide text-mist uppercase">Nothing here</h2>
      <p className="mt-2 max-w-xs px-6 text-sm text-mist/70">
        No films match this combination of phase and status. Try widening the filters.
      </p>
    </div>
  );
}
