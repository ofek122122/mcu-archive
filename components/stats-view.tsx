"use client";

import { type CSSProperties } from "react";
import { Clock, Film, Lock, Sparkles, Trophy } from "lucide-react";

import { PHASES, UNIVERSES } from "@/lib/universes";
import type { TrackedMovie } from "@/lib/types";

type StatsViewProps = {
  movies: TrackedMovie[];
  watchedSet: Set<string>;
};

const BADGES = [
  { threshold: 25, emoji: "🥉", name: "Avenger Initiate", blurb: "A quarter of the archive logged.", accent: "#cd7f32" },
  { threshold: 50, emoji: "🥈", name: "Earth's Mightiest Hero", blurb: "Half the catalog behind you.", accent: "#c0c0c0" },
  { threshold: 75, emoji: "🥇", name: "Master of the Mystic Arts", blurb: "Three quarters mastered.", accent: "#f5c518" },
  { threshold: 100, emoji: "💎", name: "Nexus Being", blurb: "Infinity Gauntlet Master — every film watched.", accent: "#a970ff" },
];

export function StatsView({ movies, watchedSet }: StatsViewProps) {
  const watched = movies.filter((movie) => watchedSet.has(movie.id));
  const percent = movies.length === 0 ? 0 : (watched.length / movies.length) * 100;

  const minutes = watched.reduce((sum, movie) => sum + (movie.runtime ?? 0), 0);
  const hours = minutes / 60;
  const days = hours / 24;

  const totalMinutes = movies.reduce((sum, movie) => sum + (movie.runtime ?? 0), 0);
  const remainingHours = (totalMinutes - minutes) / 60;

  const rated = watched.filter((movie) => movie.imdbRating !== null);
  const averageRating =
    rated.length === 0
      ? null
      : rated.reduce((sum, movie) => sum + (movie.imdbRating ?? 0), 0) / rated.length;

  const universeRows = UNIVERSES.map((universe) => {
    const inUniverse = movies.filter((movie) => movie.universe === universe.id);
    const seen = inUniverse.filter((movie) => watchedSet.has(movie.id));
    return {
      ...universe,
      total: inUniverse.length,
      seen: seen.length,
      percent: inUniverse.length === 0 ? 0 : (seen.length / inUniverse.length) * 100,
    };
  });

  const phaseRows = PHASES.map((phase) => {
    const inPhase = movies.filter((movie) => movie.phase === phase.id);
    const seen = inPhase.filter((movie) => watchedSet.has(movie.id));
    return {
      ...phase,
      total: inPhase.length,
      seen: seen.length,
      percent: inPhase.length === 0 ? 0 : (seen.length / inPhase.length) * 100,
    };
  });

  return (
    <div className="space-y-5">
      {/* ── Headline tiles ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile
          icon={Film}
          label="Films logged"
          value={`${watched.length}`}
          sub={`of ${movies.length} · ${percent.toFixed(0)}%`}
          accent="#5ad2f4"
        />
        <Tile
          icon={Clock}
          label="Total watch time"
          value={`${hours.toFixed(1)}h`}
          sub={`${days.toFixed(1)} days in the chair`}
          accent="#a970ff"
        />
        <Tile
          icon={Sparkles}
          label="Average IMDb"
          value={averageRating === null ? "—" : averageRating.toFixed(2)}
          sub={rated.length === 0 ? "Nothing rated yet" : `across ${rated.length} rated films`}
          accent="#f5c518"
        />
        <Tile
          icon={Trophy}
          label="Still to watch"
          value={`${movies.length - watched.length}`}
          sub={`about ${remainingHours.toFixed(0)}h remaining`}
          accent="#ff3d5e"
        />
      </div>

      {/* ── Universe breakdown ────────────────────────────────────────────── */}
      <section className="glass glass-edge rounded-xl p-5">
        <h2 className="font-display text-xl tracking-wide text-bone uppercase">By universe</h2>
        <p className="mt-1 font-mono text-[10px] tracking-brand text-mist uppercase">
          Completion per rights holder
        </p>

        <div className="mt-5 space-y-4">
          {universeRows.map((row) => (
            <div key={row.id}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-display text-sm tracking-wide uppercase" style={{ color: row.accent }}>
                  {row.label}
                </span>
                <span className="font-mono text-[11px] text-mist tabular-nums">
                  {row.seen}/{row.total} · {row.percent.toFixed(0)}%
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full transition-[width] duration-700 ease-out"
                  style={{
                    width: `${row.percent}%`,
                    backgroundColor: row.accent,
                    boxShadow: `0 0 12px ${row.accent}aa`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MCU phase breakdown ───────────────────────────────────────────── */}
      <section className="glass glass-edge rounded-xl p-5">
        <h2 className="font-display text-xl tracking-wide text-bone uppercase">MCU phases</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {phaseRows.map((row) => (
            <div
              key={row.id}
              className="rounded-lg border border-white/8 p-3 text-center"
              style={{ backgroundColor: `${row.accent}0f` }}
            >
              <p className="font-display text-lg leading-none" style={{ color: row.accent }}>
                {row.roman}
              </p>
              <p className="mt-2 font-display text-xl text-bone tabular-nums">
                {row.seen}
                <span className="text-mist/50">/</span>
                <span className="text-mist">{row.total}</span>
              </p>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full transition-[width] duration-700"
                  style={{ width: `${row.percent}%`, backgroundColor: row.accent }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Achievements ──────────────────────────────────────────────────── */}
      <section className="glass glass-edge rounded-xl p-5">
        <h2 className="font-display text-xl tracking-wide text-bone uppercase">Infinity Vault</h2>
        <p className="mt-1 font-mono text-[10px] tracking-brand text-mist uppercase">
          Achievements unlock as the archive fills
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {BADGES.map((badge) => {
            const unlocked = percent >= badge.threshold;
            const toGo = Math.max(0, Math.ceil((badge.threshold / 100) * movies.length) - watched.length);

            return (
              <div
                key={badge.name}
                className={`glass-edge relative overflow-hidden rounded-xl border-0 p-4 text-center transition-all ${
                  unlocked ? "" : "opacity-55"
                }`}
                style={
                  {
                    "--edge-from": unlocked ? `${badge.accent}bb` : "rgba(255,255,255,0.10)",
                    "--edge-to": unlocked ? `${badge.accent}44` : "rgba(255,255,255,0.04)",
                    backgroundColor: unlocked ? `${badge.accent}12` : "rgba(255,255,255,0.02)",
                    boxShadow: unlocked ? `0 0 34px -12px ${badge.accent}` : "none",
                  } as CSSProperties
                }
              >
                <div className={`text-3xl ${unlocked ? "animate-pop" : "grayscale"}`}>
                  {unlocked ? badge.emoji : <Lock className="mx-auto size-7 text-mist/50" />}
                </div>

                <p
                  className="mt-2.5 font-display text-sm leading-tight tracking-wide uppercase"
                  style={{ color: unlocked ? badge.accent : undefined }}
                >
                  {badge.name}
                </p>
                <p className="mt-1.5 text-[11px] leading-snug text-mist">{badge.blurb}</p>

                <p className="mt-2.5 font-mono text-[9px] tracking-brand text-mist/70 uppercase">
                  {unlocked ? `Unlocked · ${badge.threshold}%` : `${toGo} more film${toGo === 1 ? "" : "s"}`}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Tile({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: typeof Film;
  label: string;
  value: string;
  sub: string;
  accent: string;
}) {
  return (
    <div
      className="glass glass-edge rounded-xl p-4"
      style={{ "--edge-from": `${accent}88`, "--edge-to": `${accent}22` } as CSSProperties}
    >
      <div className="flex items-center gap-2">
        <Icon className="size-3.5" style={{ color: accent }} />
        <p className="font-mono text-[9px] tracking-brand text-mist uppercase">{label}</p>
      </div>
      <p
        className="mt-2 font-display text-4xl leading-none tabular-nums"
        style={{ color: accent, textShadow: `0 0 24px ${accent}55` }}
      >
        {value}
      </p>
      <p className="mt-1.5 font-mono text-[10px] text-mist">{sub}</p>
    </div>
  );
}
