"use client";

import { useEffect, useRef } from "react";
import { RotateCcw, X } from "lucide-react";

import { HEROES } from "@/lib/heroes";
import { PHASES, UNIVERSES } from "@/lib/universes";
import type { HeroId, PhaseId, UniverseId } from "@/lib/types";
import { KIND_OPTIONS, SORT_OPTIONS, STATUS_OPTIONS } from "@/components/filter-options";
import type { KindFilter, PhaseFilter, SortKey, StatusFilter, ViewMode } from "@/components/filter-options";

type FilterPanelProps = {
  isMcuView: boolean;
  kind: KindFilter;
  onKindChange: (kind: KindFilter) => void;
  status: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  universes: UniverseId[];
  onUniversesChange: (universes: UniverseId[]) => void;
  phase: PhaseFilter;
  onPhaseChange: (phase: PhaseFilter) => void;
  hero: HeroId | null;
  onHeroChange: (hero: HeroId | null) => void;
  heroCounts: Record<string, number>;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  activeCount: number;
  onReset: () => void;
  onClose: () => void;
};

/**
 * Everything that is not search or the release/story toggle.
 *
 * These controls used to sit out in the bar, nine groups of them across four
 * rows, and none carried a word saying what it was — "Everything / Movies /
 * Series" is only obviously a *type* filter once you already know. In here each
 * group gets a label and room, and the bar outside keeps one line.
 *
 * A dropdown above sm, a bottom sheet below it. Same lesson as the detail
 * modal: the panel scrolls inside itself so its close control cannot be pushed
 * off a short screen.
 */
export function FilterPanel({
  isMcuView,
  kind,
  onKindChange,
  status,
  onStatusChange,
  universes,
  onUniversesChange,
  phase,
  onPhaseChange,
  hero,
  onHeroChange,
  heroCounts,
  sort,
  onSortChange,
  mode,
  onModeChange,
  activeCount,
  onReset,
  onClose,
}: FilterPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    // A pointerdown outside closes. Listening on pointerdown rather than click
    // means the toggle button's own click still fires afterwards, so tapping it
    // a second time closes rather than close-then-reopening.
    const onPointerDown = (event: PointerEvent) => {
      const node = panelRef.current;
      if (node && !node.contains(event.target as Node)) onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [onClose]);

  function toggleUniverse(id: UniverseId) {
    onUniversesChange(
      universes.includes(id) ? universes.filter((u) => u !== id) : [...universes, id],
    );
  }

  return (
    <>
      {/* Sheet scrim, phones only — the dropdown above sm needs no dimming. */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-60 bg-void/60 backdrop-blur-sm sm:hidden"
      />

      {/*
        Positioning lives on this wrapper, the look on the element inside.
        `.glass-edge` sets `position: relative` for its ::before border, and in
        Tailwind v4 project CSS outranks the utilities — put both on one element
        and the panel silently lands in normal flow, shoving the bar apart.
      */}
      <div
        ref={panelRef}
        className="fixed inset-x-0 bottom-0 z-60 sm:absolute sm:inset-x-auto sm:right-0 sm:bottom-auto sm:top-[calc(100%+0.5rem)] sm:w-[34rem]"
      >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        className="glass-strong glass-edge animate-rise flex max-h-[85dvh] flex-col overflow-hidden rounded-t-2xl sm:max-h-[min(32rem,70vh)] sm:rounded-xl"
        style={
          {
            "--edge-from": "#5ad2f488",
            "--edge-to": "#a970ff44",
            // `.glass-strong` is 82% opaque, which is right for a full-screen
            // modal sitting on its own scrim. This one hangs straight over the
            // posters with no scrim behind it above sm, and translucency there
            // just prints key art through the labels. Opaque, and inline —
            // project CSS outranks a bg-* utility (same trap as the position).
            backgroundColor: "var(--color-panel, #0e0e18)",
            boxShadow: "0 32px 80px -24px rgba(0,0,0,0.9)",
          } as React.CSSProperties
        }
      >
        <div className="flex shrink-0 items-center gap-3 border-b border-white/8 px-4 pt-4 pb-2.5 sm:px-5 sm:pt-3">
          <span
            aria-hidden="true"
            className="absolute top-1.5 left-1/2 h-1 w-9 -translate-x-1/2 rounded-full bg-white/20 sm:hidden"
          />
          <p className="flex-1 font-mono text-[10px] tracking-brand text-mist uppercase">Filters</p>

          <button
            type="button"
            onClick={onReset}
            disabled={activeCount === 0}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1.5 font-mono text-[10px] tracking-brand text-mist uppercase transition-colors hover:border-marvel/60 hover:text-marvel disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:text-mist"
          >
            <RotateCcw className="size-3" />
            Reset
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-void/60 px-2.5 py-1.5 font-mono text-[10px] tracking-brand text-mist uppercase transition-colors hover:border-white/30 hover:text-bone"
          >
            <X className="size-3" />
            Close
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-5">
          <Row label="Type">
            {KIND_OPTIONS.map((option) => (
              <Option
                key={option.value}
                active={kind === option.value}
                accent="#5ad2f4"
                onClick={() => onKindChange(option.value)}
              >
                <option.icon className="size-3" />
                {option.label}
              </Option>
            ))}
          </Row>

          <Row label="Status">
            {STATUS_OPTIONS.map((option) => (
              <Option
                key={option.value}
                active={status === option.value}
                accent="#edebe6"
                onClick={() => onStatusChange(option.value)}
              >
                <option.icon className="size-3" />
                {option.label}
              </Option>
            ))}
          </Row>

          {isMcuView ? (
            <Row label="Phase">
              <Option active={phase === "all"} accent="#edebe6" onClick={() => onPhaseChange("all")}>
                All phases
              </Option>
              {PHASES.map((item) => (
                <Option
                  key={item.id}
                  active={phase === item.id}
                  accent={item.accent}
                  onClick={() => onPhaseChange(item.id as PhaseId)}
                >
                  Phase {item.roman}
                </Option>
              ))}
            </Row>
          ) : (
            <Row label="Studios">
              <Option
                active={universes.length === 0}
                accent="#edebe6"
                onClick={() => onUniversesChange([])}
              >
                All studios
              </Option>
              {UNIVERSES.map((universe) => (
                <Option
                  key={universe.id}
                  active={universes.includes(universe.id)}
                  accent={universe.accent}
                  onClick={() => toggleUniverse(universe.id)}
                >
                  {universe.label}
                </Option>
              ))}
            </Row>
          )}

          <Row label="Character">
            <Option active={hero === null} accent="#edebe6" onClick={() => onHeroChange(null)}>
              Anyone
            </Option>
            {HEROES.map((item) => {
              const count = heroCounts[item.id] ?? 0;
              return (
                <Option
                  key={item.id}
                  active={hero === item.id}
                  accent={item.accent}
                  disabled={count === 0}
                  onClick={() => onHeroChange(hero === item.id ? null : item.id)}
                >
                  <span
                    className="flex size-4 items-center justify-center rounded-full text-[8px] font-bold"
                    style={{
                      backgroundColor: hero === item.id ? item.accent : `${item.accent}33`,
                      color: hero === item.id ? "#04040a" : item.accent,
                    }}
                  >
                    {item.glyph}
                  </span>
                  {item.label}
                  <span className="opacity-50">{count}</span>
                </Option>
              );
            })}
          </Row>

          <Row label="Sort">
            <select
              value={sort}
              onChange={(event) => onSortChange(event.target.value as SortKey)}
              aria-label="Sort by"
              className="cursor-pointer rounded-lg border border-white/10 bg-void/50 px-2.5 py-1.5 font-mono text-[10px] tracking-wider text-bone uppercase focus:border-arc focus:outline-none"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-panel text-bone">
                  {option.label}
                </option>
              ))}
            </select>
          </Row>

          <Row label="View">
            <Option active={mode === "posters"} accent="#edebe6" onClick={() => onModeChange("posters")}>
              Posters
            </Option>
            <Option active={mode === "compact"} accent="#edebe6" onClick={() => onModeChange("compact")}>
              List
            </Option>
          </Row>
        </div>
      </div>
      </div>
    </>
  );
}

/** A labelled group. The label is the whole point — see the note above. */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[4.5rem_1fr] sm:items-start sm:gap-4">
      <p className="font-mono text-[9px] tracking-brand text-mist/60 uppercase sm:pt-1.5">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Option({
  active,
  accent,
  disabled = false,
  onClick,
  children,
}: {
  active: boolean;
  accent: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
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
      className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-[10px] tracking-brand whitespace-nowrap uppercase transition-all disabled:cursor-not-allowed disabled:opacity-30 ${
        active ? "" : "border-white/10 text-mist hover:border-white/30 hover:text-bone"
      }`}
    >
      {children}
    </button>
  );
}
