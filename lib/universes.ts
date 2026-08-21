import type { Movie, PhaseId, Theme, UniverseId } from "@/lib/types";

export type Phase = {
  id: PhaseId;
  label: string;
  roman: string;
  saga: string;
  years: string;
  theme: string;
  accent: string;
  secondary: string;
  deep: string;
};

/**
 * MCU phase colour stories:
 *   1–2  Stark arc-reactor cyan against industrial steel
 *   3    Cosmic infinity purple shot through with gold
 *   4–6  Quantum red with a shifting dimensional-rift secondary
 */
export const PHASES: Phase[] = [
  { id: 1, label: "Phase One", roman: "I", saga: "The Infinity Saga", years: "2008 – 2012", theme: "Arc Reactor / Steel", accent: "#5ad2f4", secondary: "#8ea3b5", deep: "#07222e" },
  { id: 2, label: "Phase Two", roman: "II", saga: "The Infinity Saga", years: "2013 – 2015", theme: "Arc Reactor / Titanium", accent: "#3fdfd4", secondary: "#9fb3c4", deep: "#062a2c" },
  { id: 3, label: "Phase Three", roman: "III", saga: "The Infinity Saga", years: "2016 – 2019", theme: "Infinity Purple / Gold", accent: "#a970ff", secondary: "#f5c518", deep: "#1d0b3d" },
  { id: 4, label: "Phase Four", roman: "IV", saga: "The Multiverse Saga", years: "2021 – 2022", theme: "Quantum Red / Rift Amber", accent: "#ff3d5e", secondary: "#ff9d4d", deep: "#33081a" },
  { id: 5, label: "Phase Five", roman: "V", saga: "The Multiverse Saga", years: "2023 – 2025", theme: "Quantum Red / Rift Magenta", accent: "#ff2d55", secondary: "#d946ef", deep: "#340a24" },
  { id: 6, label: "Phase Six", roman: "VI", saga: "The Multiverse Saga", years: "2025 – 2027", theme: "Quantum Red / Rift Ember", accent: "#ff4f2a", secondary: "#ffb02e", deep: "#351106" },
];

export function getPhase(id: PhaseId): Phase {
  return PHASES.find((phase) => phase.id === id) as Phase;
}

export type Universe = {
  id: UniverseId;
  label: string;
  short: string;
  blurb: string;
  /** UI chrome — borders, glows, chips. Vivid, part of the visual identity. */
  accent: string;
  /**
   * Chart marks only. The vivid accents above fail a colourblind check when
   * used as adjacent categorical bars — Sony blue and Legacy purple came out
   * ΔE 1.3 apart under deuteranopia. This set was validated (lightness band,
   * chroma floor, CVD separation, normal-vision floor, contrast) against the
   * dark chart surface, so magnitude comparisons stay readable.
   */
  chartAccent: string;
};

export const UNIVERSES: Universe[] = [
  { id: "mcu", label: "MCU", short: "MCU", blurb: "Marvel Studios", accent: "#ff3d5e", chartAccent: "#e11d48" },
  { id: "fox", label: "Fox / X-Men", short: "FOX", blurb: "20th Century Fox", accent: "#f0c419", chartAccent: "#d97706" },
  { id: "sony", label: "Sony", short: "SONY", blurb: "Sony Pictures", accent: "#3b82f6", chartAccent: "#0891b2" },
  { id: "legacy", label: "Legacy", short: "LGCY", blurb: "Universal · New Line · Lionsgate", accent: "#8b5cf6", chartAccent: "#9333ea" },
  { id: "tv", label: "Marvel TV", short: "TV", blurb: "ABC · Netflix · Hulu · Freeform", accent: "#22c55e", chartAccent: "#16a34a" },
];

export const UNIVERSE_BY_ID = new Map(UNIVERSES.map((universe) => [universe.id, universe]));

/**
 * Per-franchise colour stories for everything outside the MCU. Keyed by the
 * `franchise` field so a card, a chapter header and a glow all agree.
 */
const FRANCHISE_THEMES: Record<string, Theme> = {
  "X-Men": { key: "x-men", label: "X-Men", short: "X", accent: "#f0c419", secondary: "#3b6fd4", deep: "#2b2405" },
  Deadpool: { key: "deadpool", label: "Deadpool", short: "DP", accent: "#e0313b", secondary: "#1c1c1c", deep: "#2e0508" },
  "Fantastic Four": { key: "ff-fox", label: "Fantastic Four", short: "F4", accent: "#2f7fd8", secondary: "#ff9d4d", deep: "#07203f" },
  Daredevil: { key: "daredevil", label: "Daredevil", short: "DD", accent: "#b3202b", secondary: "#6b1016", deep: "#280408" },
  "Spider-Man": { key: "spider-man", label: "Spider-Man", short: "SM", accent: "#e23636", secondary: "#3b6fd4", deep: "#2c0710" },
  "The Amazing Spider-Man": { key: "asm", label: "The Amazing Spider-Man", short: "ASM", accent: "#d92d3f", secondary: "#38bdf8", deep: "#28060f" },
  "Spider-Verse": { key: "spider-verse", label: "Spider-Verse", short: "SV", accent: "#ff2d9c", secondary: "#38e1ff", deep: "#2c0526" },
  Venom: { key: "venom", label: "Venom", short: "VN", accent: "#7dd3c0", secondary: "#9ca3af", deep: "#06201c" },
  "Sony Marvel": { key: "ssu", label: "Sony's Marvel Universe", short: "SSU", accent: "#8b5cf6", secondary: "#38bdf8", deep: "#1b0b3a" },
  "Ghost Rider": { key: "ghost-rider", label: "Ghost Rider", short: "GR", accent: "#ff6b1a", secondary: "#ffb02e", deep: "#2e1002" },
  Blade: { key: "blade", label: "Blade", short: "BL", accent: "#c62828", secondary: "#9ca3af", deep: "#250406" },
  Hulk: { key: "hulk-legacy", label: "Hulk", short: "HK", accent: "#4caf50", secondary: "#a970ff", deep: "#07260f" },
  // Marvel Studios series and specials
  WandaVision: { key: "wandavision", label: "WandaVision", short: "WV", accent: "#e0313b", secondary: "#f5c518", deep: "#2b0713" },
  Loki: { key: "loki-series", label: "Loki", short: "LK", accent: "#4ade80", secondary: "#f5a524", deep: "#06240f" },
  "What If...?": { key: "what-if", label: "What If...?", short: "WI", accent: "#f5a524", secondary: "#a970ff", deep: "#2e1d02" },
  Hawkeye: { key: "hawkeye", label: "Hawkeye", short: "HK", accent: "#a855f7", secondary: "#f5c518", deep: "#25073f" },
  "Moon Knight": { key: "moon-knight", label: "Moon Knight", short: "MK", accent: "#e5e7eb", secondary: "#f5c518", deep: "#141821" },
  "She-Hulk": { key: "she-hulk", label: "She-Hulk", short: "SH", accent: "#4ade80", secondary: "#ec4899", deep: "#08240f" },
  "Secret Invasion": { key: "secret-invasion", label: "Secret Invasion", short: "SI", accent: "#22c55e", secondary: "#6b7280", deep: "#07220f" },
  "Daredevil (MCU)": { key: "daredevil-mcu", label: "Daredevil", short: "DD", accent: "#e0313b", secondary: "#7f1d1d", deep: "#2b0509" },
  "Wonder Man": { key: "wonder-man", label: "Wonder Man", short: "WM", accent: "#f43f5e", secondary: "#38bdf8", deep: "#2c0713" },
  "Marvel Specials": { key: "specials", label: "Marvel Specials", short: "SP", accent: "#f5a524", secondary: "#8ea3b5", deep: "#2b1c02" },

  // Marvel Television
  "Marvel Netflix": { key: "netflix", label: "Marvel Netflix", short: "NFX", accent: "#e50914", secondary: "#6b1016", deep: "#210407" },
  "S.H.I.E.L.D.": { key: "shield", label: "S.H.I.E.L.D.", short: "SHD", accent: "#38bdf8", secondary: "#f5c518", deep: "#06202e" },
  Inhumans: { key: "inhumans", label: "Inhumans", short: "INH", accent: "#a78bfa", secondary: "#22d3ee", deep: "#1b0f36" },
  Runaways: { key: "runaways", label: "Runaways", short: "RUN", accent: "#fb7185", secondary: "#a78bfa", deep: "#2c0713" },
  "Cloak & Dagger": { key: "cloak-dagger", label: "Cloak & Dagger", short: "CD", accent: "#818cf8", secondary: "#e5e7eb", deep: "#12142e" },

  Punisher: { key: "punisher", label: "The Punisher", short: "PN", accent: "#d4d4d8", secondary: "#71717a", deep: "#141417" },
};

const FALLBACK_THEME: Theme = {
  key: "marvel",
  label: "Marvel",
  short: "M",
  accent: "#e23636",
  secondary: "#8ea3b5",
  deep: "#26060a",
};

/** The colour story for a film — its MCU phase, or its franchise. */
export function themeFor(movie: Pick<Movie, "universe" | "phase" | "franchise">): Theme {
  if (movie.universe === "mcu" && movie.phase) {
    const phase = getPhase(movie.phase);
    return {
      key: `phase-${phase.id}`,
      label: phase.label,
      short: phase.roman,
      accent: phase.accent,
      secondary: phase.secondary,
      deep: phase.deep,
    };
  }
  return FRANCHISE_THEMES[movie.franchise] ?? FALLBACK_THEME;
}
