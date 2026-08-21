"use client";

import { useState } from "react";

import type { DailyPoint } from "@/lib/activity";

/**
 * Chart primitives for the admin dashboard.
 *
 * Single-series magnitude throughout, so each uses one hue and needs no legend
 * — the title names the series. Values are shown on hover rather than printed
 * on every mark, and the axis/grid stay recessive so the data reads first.
 */

const ARC = "#5ad2f4";

/** Ticks per day. Bars, because the data is discrete daily counts. */
export function ActivityChart({ series }: { series: DailyPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const peak = Math.max(1, ...series.map((point) => point.ticks));
  const total = series.reduce((sum, point) => sum + point.ticks, 0);

  return (
    <section className="glass glass-edge rounded-xl p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="font-display text-lg tracking-wide text-bone uppercase">
            Titles ticked per day
          </h2>
          <p className="mt-1 font-mono text-[10px] tracking-brand text-mist uppercase">
            Last 30 days · {total} total
          </p>
        </div>
        {hover !== null ? (
          <p className="font-mono text-[11px] text-arc tabular-nums">
            {formatDay(series[hover].day)} · {series[hover].ticks} ticked ·{" "}
            {series[hover].active} active
          </p>
        ) : (
          <p className="font-mono text-[10px] text-mist/60 uppercase">Hover for a day</p>
        )}
      </div>

      {total === 0 ? (
        <p className="mt-6 text-sm text-mist/70">
          Nothing recorded yet. Activity starts accumulating from the first tick after this
          release.
        </p>
      ) : (
        <div
          className="mt-5 flex h-32 items-end gap-[3px]"
          onMouseLeave={() => setHover(null)}
          role="img"
          aria-label={`Bar chart of titles ticked per day over the last 30 days, ${total} total`}
        >
          {series.map((point, index) => {
            const height = (point.ticks / peak) * 100;
            const active = hover === index;
            return (
              <button
                key={point.day}
                type="button"
                onMouseEnter={() => setHover(index)}
                onFocus={() => setHover(index)}
                aria-label={`${formatDay(point.day)}: ${point.ticks} ticked`}
                className="group relative flex h-full flex-1 cursor-default items-end"
              >
                {/* 4px rounded end anchored to the baseline; a hairline keeps
                    empty days visible rather than silently absent. */}
                <span
                  className="w-full rounded-t transition-all duration-200"
                  style={{
                    height: point.ticks === 0 ? "2px" : `${Math.max(height, 3)}%`,
                    backgroundColor: point.ticks === 0 ? "rgba(255,255,255,0.10)" : ARC,
                    opacity: hover === null || active ? 1 : 0.35,
                  }}
                />
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-2 flex justify-between font-mono text-[9px] text-mist/50">
        <span>{formatDay(series[0]?.day ?? "")}</span>
        <span>{formatDay(series[series.length - 1]?.day ?? "")}</span>
      </div>
    </section>
  );
}

/** Horizontal magnitude bars with a direct label on every row. */
export function BarList({
  title,
  subtitle,
  rows,
  emptyLabel = "Nothing to show yet.",
}: {
  title: string;
  subtitle?: string;
  rows: { key: string; label: string; value: number; max: number; accent: string; note?: string }[];
  emptyLabel?: string;
}) {
  return (
    <section className="glass glass-edge rounded-xl p-5">
      <h2 className="font-display text-lg tracking-wide text-bone uppercase">{title}</h2>
      {subtitle ? (
        <p className="mt-1 font-mono text-[10px] tracking-brand text-mist uppercase">{subtitle}</p>
      ) : null}

      {rows.length === 0 ? (
        <p className="mt-5 text-sm text-mist/70">{emptyLabel}</p>
      ) : (
        <ul className="mt-5 space-y-3">
          {rows.map((row) => (
            <li key={row.key}>
              <div className="flex items-baseline justify-between gap-3">
                {/* Direct label: identity never depends on colour alone. */}
                <span className="truncate text-[13px] text-bone">{row.label}</span>
                <span className="shrink-0 font-mono text-[11px] text-mist tabular-nums">
                  {row.note ?? row.value}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full transition-[width] duration-500 ease-out"
                  style={{
                    width: `${row.max === 0 ? 0 : (row.value / row.max) * 100}%`,
                    backgroundColor: row.accent,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** A single headline number — no plot, so no hover layer. */
export function StatTile({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent: string;
}) {
  return (
    <div
      className="glass glass-edge rounded-xl p-4"
      style={{ "--edge-from": `${accent}88`, "--edge-to": `${accent}22` } as React.CSSProperties}
    >
      <p className="font-mono text-[9px] tracking-brand text-mist uppercase">{label}</p>
      <p
        className="mt-2 font-display text-3xl leading-none tabular-nums"
        style={{ color: accent, textShadow: `0 0 24px ${accent}44` }}
      >
        {value}
      </p>
      <p className="mt-1.5 font-mono text-[10px] text-mist">{sub}</p>
    </div>
  );
}

function formatDay(day: string): string {
  if (!day) return "";
  const [, month, date] = day.split("-");
  return `${date}/${month}`;
}
