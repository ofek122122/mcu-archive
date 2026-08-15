"use client";

import { X } from "lucide-react";

import { HEROES } from "@/lib/heroes";
import type { HeroId } from "@/lib/types";

type HeroRailProps = {
  active: HeroId | null;
  counts: Record<string, number>;
  onChange: (hero: HeroId | null) => void;
};

/**
 * Quick-select character pills. Selecting one filters the whole catalog to
 * films that character appears in, across MCU and legacy studio films alike.
 */
export function HeroRail({ active, counts, onChange }: HeroRailProps) {
  return (
    <div
      role="group"
      aria-label="Filter by character"
      className="no-scrollbar -mx-1 flex items-center gap-1.5 overflow-x-auto px-1 py-0.5"
    >
      <span className="shrink-0 pr-1 font-mono text-[9px] tracking-brand text-mist/60 uppercase">
        Heroes
      </span>

      {HEROES.map((hero) => {
        const isActive = active === hero.id;
        const count = counts[hero.id] ?? 0;

        return (
          <button
            key={hero.id}
            type="button"
            aria-pressed={isActive}
            disabled={count === 0}
            onClick={() => onChange(isActive ? null : hero.id)}
            title={`${hero.label} — ${count} film${count === 1 ? "" : "s"}`}
            style={
              isActive
                ? {
                    backgroundColor: `${hero.accent}22`,
                    borderColor: hero.accent,
                    color: hero.accent,
                    boxShadow: `0 0 20px ${hero.accent}55`,
                  }
                : undefined
            }
            className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-wider whitespace-nowrap uppercase transition-all disabled:cursor-not-allowed disabled:opacity-30 ${
              isActive ? "" : "border-white/10 text-mist hover:border-white/30 hover:text-bone"
            }`}
          >
            <span
              className="flex size-4 items-center justify-center rounded-full text-[8px] font-bold"
              style={{
                backgroundColor: isActive ? hero.accent : `${hero.accent}33`,
                color: isActive ? "#04040a" : hero.accent,
              }}
            >
              {hero.glyph}
            </span>
            {hero.label}
            <span className="opacity-50">{count}</span>
          </button>
        );
      })}

      {active ? (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="flex shrink-0 cursor-pointer items-center gap-1 rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10px] tracking-wider text-mist uppercase transition-colors hover:border-marvel/60 hover:text-marvel"
        >
          <X className="size-3" />
          Clear
        </button>
      ) : null}
    </div>
  );
}
