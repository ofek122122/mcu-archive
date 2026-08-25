import { Clapperboard, Eye, EyeOff, Layers, Tv } from "lucide-react";

import type { PhaseId } from "@/lib/types";

/**
 * The filter vocabulary, shared by the bar and the panel it opens.
 *
 * It lives apart from both so neither has to import the other — the bar owns
 * the panel, and the panel needs the same option lists to render them.
 */

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

export const STATUS_OPTIONS: { value: StatusFilter; label: string; icon: typeof Eye }[] = [
  { value: "all", label: "All", icon: Layers },
  { value: "watched", label: "Watched", icon: Eye },
  { value: "unwatched", label: "Unwatched", icon: EyeOff },
];

export const KIND_OPTIONS: { value: KindFilter; label: string; icon: typeof Eye }[] = [
  { value: "all", label: "Everything", icon: Layers },
  { value: "movie", label: "Movies", icon: Clapperboard },
  { value: "series", label: "Series", icon: Tv },
];
