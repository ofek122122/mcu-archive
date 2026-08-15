"use client";

import { Check, ExternalLink, Info, Star } from "lucide-react";

import { imdbUrl, themeFor } from "@/lib/movies";
import type { TrackedMovie } from "@/lib/types";

type CompactListProps = {
  movies: TrackedMovie[];
  watchedSet: Set<string>;
  orderById: Map<string, number>;
  onToggle: (movie: TrackedMovie, next: boolean) => void;
  onOpen: (movie: TrackedMovie) => void;
};

/**
 * High-density checklist. Built for rapid ticking, so the whole row is the
 * toggle and the secondary actions sit at the end with their own hit areas.
 */
export function CompactList({
  movies,
  watchedSet,
  orderById,
  onToggle,
  onOpen,
}: CompactListProps) {
  return (
    <div className="glass glass-edge overflow-hidden rounded-xl">
      <ul className="divide-y divide-white/5">
        {movies.map((movie) => {
          const watched = watchedSet.has(movie.id);
          const theme = themeFor(movie);

          return (
            <li key={movie.id} className="group relative flex items-center gap-2 pr-2">
              <button
                type="button"
                aria-pressed={watched}
                aria-label={`${movie.title} (${movie.year}) — mark as ${watched ? "unwatched" : "watched"}`}
                onClick={() => onToggle(movie, !watched)}
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 py-2 pl-3 text-left transition-colors hover:bg-white/[0.03]"
              >
                {/* Tick box */}
                <span
                  className={`flex size-5 shrink-0 items-center justify-center rounded border transition-colors ${
                    watched ? "text-black" : "border-white/20 text-transparent"
                  }`}
                  style={
                    watched
                      ? { backgroundColor: theme.accent, borderColor: theme.accent }
                      : undefined
                  }
                >
                  <Check className="size-3.5" strokeWidth={3.5} />
                </span>

                <span className="w-7 shrink-0 font-mono text-[10px] text-mist/60 tabular-nums">
                  {String(orderById.get(movie.id) ?? 0).padStart(2, "0")}
                </span>

                <span
                  className="hidden w-11 shrink-0 rounded-[3px] px-1 py-0.5 text-center font-mono text-[9px] font-bold sm:block"
                  style={{ backgroundColor: `${theme.accent}22`, color: theme.accent }}
                >
                  {theme.short}
                </span>

                <span className="min-w-0 flex-1">
                  <span
                    className={`block truncate font-display text-sm tracking-wide uppercase ${
                      watched ? "" : "text-bone"
                    }`}
                    style={watched ? { color: theme.accent } : undefined}
                  >
                    {movie.title}
                  </span>
                  <span className="mt-0.5 block truncate font-mono text-[10px] text-mist/70">
                    {movie.year} · {movie.studio}
                    {movie.runtime ? ` · ${movie.runtime}m` : " · TBA"}
                  </span>
                </span>

                <span className="hidden shrink-0 items-center gap-1 font-mono text-[11px] text-bone/80 tabular-nums md:flex">
                  <Star className="size-3" fill="#f5c518" stroke="#f5c518" />
                  {movie.imdbRating === null ? "—" : movie.imdbRating.toFixed(1)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onOpen(movie)}
                aria-label={`Details for ${movie.title}`}
                className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md border border-white/10 text-mist transition-colors hover:border-white/30 hover:text-bone"
              >
                <Info className="size-3.5" />
              </button>

              <a
                href={imdbUrl(movie)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${movie.title} on IMDb`}
                className="flex size-7 shrink-0 items-center justify-center rounded-md border border-gold/30 text-gold transition-colors hover:bg-gold/15"
              >
                <ExternalLink className="size-3.5" />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
