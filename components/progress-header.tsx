"use client";

import { useTransition } from "react";
import { Database, DatabaseZap, LogOut } from "lucide-react";

import { logoutAction } from "@/app/actions";
import { PHASES } from "@/lib/movies";

type ProgressHeaderProps = {
  watchedCount: number;
  total: number;
  /** Watched / total per phase id, used for the tick marks. */
  perPhase: Record<number, { watched: number; total: number }>;
  databaseConnected: boolean;
};

/** Arc-reactor cyan → infinity purple → quantum red, mirroring the phase run. */
const METER_GRADIENT =
  "linear-gradient(90deg, #5ad2f4 0%, #3fdfd4 18%, #a970ff 46%, #ff3d5e 74%, #ff4f2a 100%)";

export function ProgressHeader({
  watchedCount,
  total,
  perPhase,
  databaseConnected,
}: ProgressHeaderProps) {
  const [loggingOut, startLogout] = useTransition();
  const percent = total === 0 ? 0 : Math.round((watchedCount / total) * 100);

  // Cumulative phase boundaries, expressed as percentages of the slate.
  const boundaries = PHASES.slice(0, -1).map((phase, index) => {
    const cumulative = PHASES.slice(0, index + 1).reduce(
      (sum, earlier) => sum + (perPhase[earlier.id]?.total ?? 0),
      0,
    );
    return { id: phase.id, left: total === 0 ? 0 : (cumulative / total) * 100 };
  });

  return (
    <header className="glass-strong border-b border-white/10">
      <div className="mx-auto max-w-[1500px] px-4 pt-3.5 pb-3 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          {/* Wordmark */}
          <div className="flex items-center gap-2.5">
            <span className="bg-marvel px-2 py-1 font-display text-base leading-none text-white -skew-x-6 shadow-[0_0_18px_rgba(226,54,54,0.5)]">
              MCU
            </span>
            <span className="hidden font-display text-base leading-none tracking-wide text-bone uppercase sm:inline">
              Archive
            </span>
          </div>

          {/* Counter */}
          <div className="flex items-baseline gap-2 leading-none">
            <span className="font-display text-3xl text-bone tabular-nums sm:text-4xl">
              {watchedCount}
            </span>
            <span className="font-display text-lg text-mist/60 sm:text-xl">/</span>
            <span className="font-display text-lg text-mist tabular-nums sm:text-xl">{total}</span>
            <span className="ml-1 hidden font-mono text-[10px] tracking-brand text-mist uppercase sm:inline">
              Watched
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span
              title={
                databaseConnected
                  ? "Synced to Redis — changes appear on every device"
                  : "No Redis store linked yet — changes are in-memory only"
              }
              className={`hidden items-center gap-1.5 font-mono text-[10px] tracking-brand uppercase sm:flex ${
                databaseConnected ? "text-emerald-400/80" : "text-gold/80"
              }`}
            >
              {databaseConnected ? (
                <DatabaseZap className="size-3.5" />
              ) : (
                <Database className="size-3.5" />
              )}
              {databaseConnected ? "Synced" : "Local"}
            </span>

            <span className="font-display text-2xl text-arc tabular-nums sm:text-3xl [text-shadow:0_0_18px_rgba(90,210,244,0.55)]">
              {percent}
              <span className="text-base text-arc/60">%</span>
            </span>

            <button
              type="button"
              onClick={() => startLogout(async () => void (await logoutAction()))}
              disabled={loggingOut}
              aria-label="Lock the archive"
              className="flex size-8 cursor-pointer items-center justify-center rounded-md border border-white/10 text-mist transition-colors hover:border-marvel/60 hover:text-marvel disabled:opacity-50"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Progress meter */}
        <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full transition-[width] duration-500 ease-out"
            style={{
              width: `${percent}%`,
              background: METER_GRADIENT,
              boxShadow: "0 0 16px rgba(90,210,244,0.45)",
            }}
          />
          {boundaries.map((boundary) => (
            <span
              key={boundary.id}
              aria-hidden="true"
              className="absolute top-0 h-full w-px bg-void/90"
              style={{ left: `${boundary.left}%` }}
            />
          ))}
        </div>
      </div>
    </header>
  );
}
