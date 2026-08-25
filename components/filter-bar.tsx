"use client";

import { ArrowDownUp, Clapperboard, Eye, EyeOff, LayoutGrid, Layers, List, Search, Tv, X } from "lucide-react";

import { PHASES, UNIVERSES } from "@/lib/universes";
import type { PhaseId, UniverseId } from "@/lib/types";

export type StatusFilter = "all" | "watched" | "unwatched";
/** Films, series, or both. Excluding series removes them from counts too. */
export type KindFilter = "all" | "movie" | "series";
export type PhaseFilter = PhaseId | "all";
export type ViewMode = "posters" | "compact";
export type TimelineOrder = "release" | "chrono";
export type SortKey =
  | "release-desc"
  | "release-asc"
  | "rating-desc"
  | "rating-asc"
  | "runtime-desc"
  | "title-asc";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "release-asc", label: "Release — oldest" },
  { value: "release-desc", label: "Release — newest" },
  { value: "rating-desc", label: "IMDb — highest" },
  { value: "rating-asc", label: "IMDb — lowest" },
  { value: "runtime-desc", label: "Runtime — longest" },
  { value: "title-asc", label: "Title — A to Z" },
];

const STATUS_OPTIONS: { value: StatusFilter; label: string; icon: typeof Eye }[] = [
  { value: "all", label: "All", icon: Layers },
  { value: "watched", label: "Watched", icon: Eye },
  { value: "unwatched", label: "Unwatched", icon: EyeOff },
];

const KIND_OPTIONS: { value: KindFilter; label: string; icon: typeof Eye }[] = [
  { value: "all", label: "Everything", icon: Layers },
  { value: "movie", label: "Movies", icon: Clapperboard },
  { value: "series", label: "Series", icon: Tv },
];

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
  order: TimelineOrder;
  onOrderChange: (order: TimelineOrder) => void;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  resultCount: number;
};

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
  order,
  onOrderChange,
  sort,
  onSortChange,
  mode,
  onModeChange,
  resultCount,
}: FilterBarProps) {
  function toggleUniverse(id: UniverseId) {
    onUniversesChange(
      universes.includes(id) ? universes.filter((u) => u !== id) : [...universes, id],
    );
  }

  return (
    <div className="glass border-b border-white/8">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-2.5 px-4 py-2.5 sm:px-6">
        {/*
          Row 1 — search, then the control groups.

          On a phone the search takes a row of its own and the groups sit in a
          scrolling strip below it, the same pattern row 2 already uses. That
          strip is what pays for the labels: these used to collapse to bare
          icons on small screens, where three near-identical glyphs said
          nothing about what they filtered.
        */}
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative w-full sm:min-w-[180px] sm:flex-1">
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

          <div className="no-scrollbar -mx-1 flex items-center gap-2 overflow-x-auto px-1 sm:contents">
          {/* Films vs series — excluding one drops it from progress counts too */}
          <div
            role="group"
            aria-label="Filter by type"
            className="flex shrink-0 items-center gap-0.5 rounded-lg border border-white/10 bg-void/50 p-0.5 backdrop-blur-md"
          >
            {KIND_OPTIONS.map((option) => {
              const Icon = option.icon;
              const active = kind === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  title={option.label}
                  onClick={() => onKindChange(option.value)}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-[10px] tracking-brand uppercase transition-colors ${
                    active ? "bg-arc text-void" : "text-mist hover:text-bone"
                  }`}
                >
                  <Icon className="size-3" />
                  {option.label}
                </button>
              );
            })}
          </div>

          <div
            role="group"
            aria-label="Filter by status"
            className="flex shrink-0 items-center gap-0.5 rounded-lg border border-white/10 bg-void/50 p-0.5 backdrop-blur-md"
          >
            {STATUS_OPTIONS.map((option) => {
              const Icon = option.icon;
              const active = status === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onStatusChange(option.value)}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-[10px] tracking-brand uppercase transition-colors ${
                    active ? "bg-bone text-void" : "text-mist hover:text-bone"
                  }`}
                >
                  <Icon className="size-3" />
                  {option.label}
                </button>
              );
            })}
          </div>

          <label className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-void/50 px-2 py-1.5 backdrop-blur-md">
            <ArrowDownUp className="size-3 text-mist" />
            <span className="sr-only">Sort by</span>
            <select
              value={sort}
              onChange={(event) => onSortChange(event.target.value as SortKey)}
              className="cursor-pointer bg-transparent font-mono text-[10px] tracking-wider text-bone uppercase focus:outline-none"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-panel text-bone">
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div
            role="group"
            aria-label="View density"
            className="flex shrink-0 items-center gap-0.5 rounded-lg border border-white/10 bg-void/50 p-0.5 backdrop-blur-md"
          >
            <button
              type="button"
              aria-pressed={mode === "posters"}
              onClick={() => onModeChange("posters")}
              className={`flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-[10px] tracking-brand uppercase transition-colors ${
                mode === "posters" ? "bg-bone text-void" : "text-mist hover:text-bone"
              }`}
            >
              <LayoutGrid className="size-3" />
              Posters
            </button>
            <button
              type="button"
              aria-pressed={mode === "compact"}
              onClick={() => onModeChange("compact")}
              className={`flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-[10px] tracking-brand uppercase transition-colors ${
                mode === "compact" ? "bg-bone text-void" : "text-mist hover:text-bone"
              }`}
            >
              <List className="size-3" />
              List
            </button>
          </div>

          <span
            aria-live="polite"
            className="shrink-0 font-mono text-[10px] tracking-brand text-mist uppercase"
          >
            {resultCount} {resultCount === 1 ? "film" : "films"}
          </span>
          </div>
        </div>

        {/* Row 2 — universe multi-select, or MCU phase + order controls */}
        <div className="no-scrollbar -mx-1 flex items-center gap-1.5 overflow-x-auto px-1">
          {isMcuView ? (
            <>
              <div className="flex shrink-0 items-center gap-0.5 rounded-lg border border-white/10 bg-void/50 p-0.5 backdrop-blur-md">
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

              <span className="shrink-0 px-1 text-white/15">|</span>

              <Chip active={phase === "all"} accent="#edebe6" onClick={() => onPhaseChange("all")}>
                All phases
              </Chip>
              {PHASES.map((item) => (
                <Chip
                  key={item.id}
                  active={phase === item.id}
                  accent={item.accent}
                  onClick={() => onPhaseChange(item.id)}
                >
                  Phase {item.roman}
                </Chip>
              ))}
            </>
          ) : (
            <>
              <span className="shrink-0 pr-1 font-mono text-[9px] tracking-brand text-mist/60 uppercase">
                Studios
              </span>
              <Chip
                active={universes.length === 0}
                accent="#edebe6"
                onClick={() => onUniversesChange([])}
              >
                All studios
              </Chip>
              {UNIVERSES.map((universe) => (
                <Chip
                  key={universe.id}
                  active={universes.includes(universe.id)}
                  accent={universe.accent}
                  onClick={() => toggleUniverse(universe.id)}
                >
                  {universe.label}
                </Chip>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Chip({
  active,
  accent,
  onClick,
  children,
}: {
  active: boolean;
  accent: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      style={
        active
          ? {
              backgroundColor: `${accent}1f`,
              borderColor: accent,
              color: accent,
              boxShadow: `0 0 18px ${accent}44`,
            }
          : undefined
      }
      className={`shrink-0 cursor-pointer rounded-lg border px-3 py-1.5 font-mono text-[10px] tracking-brand whitespace-nowrap uppercase transition-all ${
        active ? "" : "border-white/10 text-mist hover:border-white/30 hover:text-bone"
      }`}
    >
      {children}
    </button>
  );
}
