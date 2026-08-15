import type { HeroId } from "@/lib/types";

export type Hero = {
  id: HeroId;
  label: string;
  /** Short glyph used on the pill — kept to 1-3 chars so pills stay compact. */
  glyph: string;
  accent: string;
};

/**
 * The quick-select hero roster. Clicking one filters the whole catalog to films
 * that character appears in, across MCU and legacy studio films alike.
 */
export const HEROES: Hero[] = [
  { id: "spider-man", label: "Spider-Man", glyph: "SM", accent: "#e23636" },
  { id: "iron-man", label: "Iron Man", glyph: "IM", accent: "#f5a524" },
  { id: "wolverine", label: "Wolverine / X-Men", glyph: "X", accent: "#f0c419" },
  { id: "deadpool", label: "Deadpool", glyph: "DP", accent: "#d32f2f" },
  { id: "ghost-rider", label: "Ghost Rider", glyph: "GR", accent: "#ff6b1a" },
  { id: "thor", label: "Thor", glyph: "TH", accent: "#5ad2f4" },
  { id: "captain-america", label: "Captain America", glyph: "CA", accent: "#3b6fd4" },
  { id: "hulk", label: "Hulk", glyph: "HK", accent: "#4caf50" },
  { id: "doctor-strange", label: "Doctor Strange", glyph: "DS", accent: "#a970ff" },
  { id: "daredevil", label: "Daredevil", glyph: "DD", accent: "#b3202b" },
  { id: "blade", label: "Blade", glyph: "BL", accent: "#c62828" },
  { id: "fantastic-four", label: "Fantastic Four", glyph: "F4", accent: "#2f7fd8" },
  { id: "guardians", label: "Guardians", glyph: "GG", accent: "#ff8a3d" },
];

export const HERO_BY_ID = new Map(HEROES.map((hero) => [hero.id, hero]));

/** Human-readable names for every character tag, used by the text search. */
export const CHARACTER_LABELS: Record<string, string> = {
  ...Object.fromEntries(HEROES.map((hero) => [hero.id, hero.label])),
  punisher: "The Punisher",
  "black-panther": "Black Panther",
  "ant-man": "Ant-Man",
  "captain-marvel": "Captain Marvel",
};
