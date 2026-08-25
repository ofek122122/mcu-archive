"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { HERO_BY_ID } from "@/lib/heroes";
import { getPhase, UNIVERSE_BY_ID } from "@/lib/universes";
import type { HeroId, PhaseId, UniverseId } from "@/lib/types";
import { FilterPanel } from "@/components/filter-panel";
import { KIND_OPTIONS, STATUS_OPTIONS } from "@/components/filter-options";
import type {
  KindFilter,
  PhaseFilter,
  SortKey,
  StatusFilter,
  TimelineOrder,
  ViewMode,
} from "@/components/filter-options";

export {
  SORT_OPTIONS,
  STATUS_OPTIONS,
  KIND_OPTIONS,
} from "@/components/filter-options";
export type {
  KindFilter,
  PhaseFilter,
  SortKey,
  StatusFilter,
  TimelineOrder,
  ViewMode,
} from "@/components/filter-options";

type FilterBarProps = {
  isMcuView: boolean;
  kind: KindFilter;
  onKindChange: (kind: KindFilter) => void;
  query: string;
  onQueryChange: (query: string) => void;
  status: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  universes: UniverseId[];
  onUniversesChange: (universes: UniverseId[]) => void;
  phase: PhaseFilter;
  onPhaseChange: (phase: PhaseFilter) => void;
  hero: HeroId | null;
  onHeroChange: (hero: HeroId | null) => void;
  heroCounts: Record<string, number>;
  order: TimelineOrder;
  onOrderChange: (order: TimelineOrder) => void;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  resultCount: number;
};

/** One active filter, rendered as a chip you can switch off. */
type ActiveFilter = { key: string; label: string; accent: string; clear: () => void };

/**
 * Search, the release/story toggle, and a door to everything else.
 *
 * The bar used to carry all nine control groups at once — four stacked rows at
 * most widths, five on a phone, and a hero rail under them. Together with the
 * header that was a quarter to a third of the screen before a single poster,
 * and the squeeze fell on the search box, which was *narrower* at 1024px than
 * on a phone. The rest now lives in `FilterPanel`, with what is switched on
 * shown as chips here so nothing filters invisibly.
 */
export function FilterBar({
  isMcuView,
  kind,
  onKindChange,
  query,
  onQueryChange,
  status,
  onStatusChange,
  universes,
  onUniversesChange,
  phase,
  onPhaseChange,
  hero,
  onHeroChange,
  heroCounts,
  order,
  onOrderChange,
  sort,
  onSortChange,
  mode,
  onModeChange,
  resultCount,
}: FilterBarProps) {
  const [open, setOpen] = useState(false);

  // Sort and density are not filters — they change how the same set is shown,
  // so they stay out of the count and out of the chips.
  const active: ActiveFilter[] = [];

  if (kind !== "all") {
    const option = KIND_OPTIONS.find((item) => item.value === kind);
    active.push({ key: "kind", label: option?.label ?? kind, accent: "#5ad2f4", clear: () => onKindChange("all") });
  }

  if (status !== "all") {
    const option = STATUS_OPTIONS.find((item) => item.value === status);
    active.push({ key: "status", label: option?.label ?? status, accent: "#edebe6", clear: () => onStatusChange("all") });
  }

  if (isMcuView && phase !== "all") {
    const item = getPhase(phase as PhaseId);
    active.push({ key: "phase", label: `Phase ${item.roman}`, accent: item.accent, clear: () => onPhaseChange("all") });
  }

  if (!isMcuView) {
    for (const id of universes) {
      const universe = UNIVERSE_BY_ID.get(id);
      active.push({
        key: `studio-${id}`,
        label: universe?.label ?? id,
        accent: universe?.accent ?? "#edebe6",
        clear: () => onUniversesChange(universes.filter((u) => u !== id)),
      });
    }
  }

  if (hero) {
    const item = HERO_BY_ID.get(hero);
    active.push({ key: "hero", label: item?.label ?? hero, accent: item?.accent ?? "#edebe6", clear: () => onHeroChange(null) });
  }

  function reset() {
    onKindChange("all");
    onStatusChange("all");
    onPhaseChange("all");
    onUniversesChange([]);
    onHeroChange(null);
  }

  return (
    <div className="glass border-b border-white/8">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-2 px-4 py-2.5 sm:px-6">
        {/*
          DOM order puts the count straight after the search so a phone wraps to
          two rows — search + count, then the toggle + Filters — instead of
          three. Above sm it is sent to the end, where it has always sat.
        */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-mist/60" />
            <input
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search titles, heroes, villains…"
              aria-label="Search films, heroes and villains"
              className="w-full rounded-lg border border-white/10 bg-void/50 py-1.5 pr-7 pl-8 font-mono text-[11px] text-bone backdrop-blur-md transition-colors placeholder:text-mist/50 focus:border-arc focus:outline-none"
            />
            {query ? (
              <button
                type="button"
                onClick={() => onQueryChange("")}
                aria-label="Clear search"
                className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer text-mist hover:text-bone"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>

          <span
            aria-live="polite"
            className="shrink-0 font-mono text-[10px] tracking-brand text-mist uppercase sm:order-last sm:ml-auto"
          >
            {resultCount} {resultCount === 1 ? "title" : "titles"}
          </span>

          {/* The one filter that is also the point of the app stays in the bar. */}
          {isMcuView ? (
            <div
              role="group"
              aria-label="Timeline order"
              className="flex shrink-0 items-center gap-0.5 rounded-lg border border-white/10 bg-void/50 p-0.5 backdrop-blur-md"
            >
              <button
                type="button"
                aria-pressed={order === "release"}
                onClick={() => onOrderChange("release")}
                className={`cursor-pointer rounded-md px-2.5 py-1.5 font-mono text-[10px] tracking-brand whitespace-nowrap uppercase transition-colors ${
                  order === "release" ? "bg-bone text-void" : "text-mist hover:text-bone"
                }`}
              >
                Release order
              </button>
              <button
                type="button"
                aria-pressed={order === "chrono"}
                onClick={() => onOrderChange("chrono")}
                className={`cursor-pointer rounded-md px-2.5 py-1.5 font-mono text-[10px] tracking-brand whitespace-nowrap uppercase transition-colors ${
                  order === "chrono" ? "bg-bone text-void" : "text-mist hover:text-bone"
                }`}
              >
                Story order
              </button>
            </div>
          ) : null}

          <div className="relative shrink-0">
            <button
              type="button"
              aria-expanded={open}
              aria-haspopup="dialog"
              onClick={() => setOpen((was) => !was)}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-[10px] tracking-brand uppercase transition-colors ${
                open || active.length > 0
                  ? "border-arc/60 bg-arc/10 text-arc"
                  : "border-white/10 bg-void/50 text-mist hover:border-white/30 hover:text-bone"
              }`}
            >
              <SlidersHorizontal className="size-3" />
              Filters
              {active.length > 0 ? (
                <span className="flex size-4 items-center justify-center rounded-full bg-arc text-[9px] font-bold text-void">
                  {active.length}
                </span>
              ) : null}
            </button>

            {open ? (
              <FilterPanel
                isMcuView={isMcuView}
                kind={kind}
                onKindChange={onKindChange}
                status={status}
                onStatusChange={onStatusChange}
                universes={universes}
                onUniversesChange={onUniversesChange}
                phase={phase}
                onPhaseChange={onPhaseChange}
                hero={hero}
                onHeroChange={onHeroChange}
                heroCounts={heroCounts}
                sort={sort}
                onSortChange={onSortChange}
                mode={mode}
                onModeChange={onModeChange}
                activeCount={active.length}
                onReset={reset}
                onClose={() => setOpen(false)}
              />
            ) : null}
          </div>
        </div>

        {active.length > 0 ? (
          <div className="no-scrollbar -mx-1 flex items-center gap-1.5 overflow-x-auto px-1">
            {active.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={filter.clear}
                aria-label={`Remove filter: ${filter.label}`}
                style={{
                  backgroundColor: `${filter.accent}1f`,
                  borderColor: `${filter.accent}99`,
                  color: filter.accent,
                }}
                className="group flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-brand whitespace-nowrap uppercase transition-all hover:brightness-125"
              >
                {filter.label}
                <X className="size-3 opacity-60 transition-opacity group-hover:opacity-100" />
              </button>
            ))}

            <button
              type="button"
              onClick={reset}
              className="flex shrink-0 cursor-pointer items-center gap-1 rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10px] tracking-brand text-mist uppercase transition-colors hover:border-marvel/60 hover:text-marvel"
            >
              Clear all
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
