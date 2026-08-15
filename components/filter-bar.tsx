"use client";

import { Eye, EyeOff, Layers } from "lucide-react";

import { PHASES, type PhaseId } from "@/lib/movies";

export type PhaseFilter = PhaseId | "all";
export type StatusFilter = "all" | "watched" | "unwatched";

type FilterBarProps = {
  phase: PhaseFilter;
  status: StatusFilter;
  onPhaseChange: (phase: PhaseFilter) => void;
  onStatusChange: (status: StatusFilter) => void;
  resultCount: number;
};

const STATUS_OPTIONS: { value: StatusFilter; label: string; icon: typeof Eye }[] = [
  { value: "all", label: "All", icon: Layers },
  { value: "watched", label: "Watched", icon: Eye },
  { value: "unwatched", label: "Unwatched", icon: EyeOff },
];

export function FilterBar({
  phase,
  status,
  onPhaseChange,
  onStatusChange,
  resultCount,
}: FilterBarProps) {
  return (
    <div className="glass border-b border-white/8">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-2.5 px-4 py-2.5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Phase filter */}
        <div
          role="group"
          aria-label="Filter by phase"
          className="no-scrollbar -mx-1 flex items-center gap-1.5 overflow-x-auto px-1"
        >
          <FilterChip
            active={phase === "all"}
            onClick={() => onPhaseChange("all")}
            accent="#edebe6"
          >
            All Phases
          </FilterChip>

          {PHASES.map((p) => (
            <FilterChip
              key={p.id}
              active={phase === p.id}
              onClick={() => onPhaseChange(p.id)}
              accent={p.accent}
            >
              Phase {p.roman}
            </FilterChip>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex items-center justify-between gap-3">
          <div
            role="group"
            aria-label="Filter by status"
            className="flex items-center gap-0.5 rounded-lg border border-white/10 bg-void/50 p-0.5 backdrop-blur-md"
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

          <span
            aria-live="polite"
            className="shrink-0 font-mono text-[10px] tracking-brand text-mist uppercase"
          >
            {resultCount} {resultCount === 1 ? "film" : "films"}
          </span>
        </div>
      </div>
    </div>
  );
}

function FilterChip({
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
