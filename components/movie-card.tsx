"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { Check, Clock3, ExternalLink, Info, Plus, Tv } from "lucide-react";

import { imdbUrl } from "@/lib/movies";
import type { Theme, TrackedMovie } from "@/lib/types";
import { ImdbBadge } from "@/components/imdb-badge";

type MovieCardProps = {
  movie: TrackedMovie;
  theme: Theme;
  /** 1-based position in the full chronological slate. */
  order: number;
  /**
   * Short phase marker ("P4"), shown only where the surrounding list is not
   * already grouped by phase — story order, chiefly, where the phases
   * interleave and the card is the only place the phase can be read.
   */
  phaseTag?: string;
  watched: boolean;
  /** Stagger index for the load-in animation. */
  delay: number;
  /** Eager-load above-the-fold posters so the LCP image isn't lazy. */
  priority?: boolean;
  onToggle: (movie: TrackedMovie, next: boolean) => void;
  onOpen: (movie: TrackedMovie) => void;
};

const MAX_TILT_DEG = 7;

export function MovieCard({
  movie,
  theme,
  order,
  phaseTag,
  watched,
  delay,
  priority = false,
  onToggle,
  onOpen,
}: MovieCardProps) {
  const tiltRef = useRef<HTMLDivElement>(null);
  const finePointer = useRef(false);
  const [artFailed, setArtFailed] = useState(false);

  // Tilt is a desktop affordance only — touch devices skip it entirely, which
  // also keeps mobile GPUs out of a per-frame transform loop.
  useEffect(() => {
    finePointer.current =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const node = tiltRef.current;
    if (!node || !finePointer.current) return;

    const rect = node.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;

    node.classList.add("tilt-active");
    node.style.setProperty("--ry", `${(px - 0.5) * 2 * MAX_TILT_DEG}deg`);
    node.style.setProperty("--rx", `${(0.5 - py) * 2 * MAX_TILT_DEG}deg`);
    node.style.setProperty("--lift", "-6px");
    node.style.setProperty("--mx", `${px * 100}%`);
    node.style.setProperty("--my", `${py * 100}%`);
  }, []);

  const handlePointerLeave = useCallback(() => {
    const node = tiltRef.current;
    if (!node) return;

    node.classList.remove("tilt-active");
    node.style.setProperty("--rx", "0deg");
    node.style.setProperty("--ry", "0deg");
    node.style.setProperty("--lift", "0px");
  }, []);

  const showArt = Boolean(movie.posterUrl) && !artFailed;
  const isSeries = movie.kind === "series";
  // Series show shape (seasons/episodes) rather than a single runtime; the
  // total minutes are still in the modal and drive the watch-time stats.
  const meta = isSeries
    ? movie.seasons && movie.seasons > 1
      ? `${movie.seasons} seasons · ${movie.episodes} eps`
      : `${movie.episodes} ${movie.episodes === 1 ? "special" : "episodes"}`
    : movie.runtime
      ? `${movie.runtime}m`
      : "TBA";

  return (
    <article
      className="group animate-rise h-full [perspective:1000px]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        ref={tiltRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="glass glass-edge sheen relative flex h-full flex-col overflow-hidden rounded-xl"
        style={
          {
            "--edge-from": `${theme.accent}${watched ? "cc" : "55"}`,
            "--edge-to": `${theme.secondary}${watched ? "88" : "30"}`,
            boxShadow: watched
              ? `0 18px 46px -22px ${theme.accent}99, 0 0 0 1px ${theme.accent}33`
              : "0 18px 40px -28px rgba(0,0,0,0.9)",
          } as CSSProperties
        }
      >
        {/* ── Poster ─────────────────────────────────────────────────────── */}
        <div className="relative aspect-[2/3] overflow-hidden">
          {/* Generated key art (also the fallback when a posterUrl 404s) */}
          <div
            className={`absolute inset-0 transition-all duration-500 ${
              watched ? "saturate-150" : "opacity-90 grayscale-[0.35] group-hover:grayscale-0"
            }`}
            style={{
              background: `linear-gradient(158deg, ${theme.accent}38 0%, ${theme.deep} 46%, #04040a 100%)`,
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(125% 70% at 50% 0%, ${theme.accent}33, transparent 66%)`,
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="outlined font-display text-[clamp(2.5rem,8vw,4.25rem)] leading-none tracking-tight select-none"
                style={{ WebkitTextStrokeColor: theme.accent, opacity: 0.75 }}
              >
                {movie.initials}
              </span>
            </div>
            <div className="scanlines absolute inset-0 opacity-25 mix-blend-overlay" />
          </div>

          {/* Real artwork, when a posterUrl is configured */}
          {showArt ? (
            <Image
              src={movie.posterUrl as string}
              alt={`${movie.title} poster`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 22vw"
              priority={priority}
              className={`object-cover transition-all duration-500 ${
                watched ? "saturate-125" : "opacity-90 grayscale-[0.3] group-hover:grayscale-0"
              }`}
              onError={() => setArtFailed(true)}
            />
          ) : null}

          {/* Base click target: toggle watched. Siblings below sit above it. */}
          <button
            type="button"
            aria-pressed={watched}
            aria-label={`${movie.title} (${movie.year}) — mark as ${watched ? "unwatched" : "watched"}`}
            onClick={() => onToggle(movie, !watched)}
            className="absolute inset-0 z-10 cursor-pointer"
          />

          {/* Bottom scrim so the caption edge never fights the art */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-void/90 to-transparent" />

          <span className="pointer-events-none absolute top-2 left-2 z-20 flex items-center gap-1 rounded-[3px] bg-void/70 px-1.5 py-0.5 font-mono text-[10px] font-medium text-bone/85 backdrop-blur-sm">
            {isSeries ? <Tv className="size-2.5" style={{ color: theme.accent }} /> : null}
            {String(order).padStart(2, "0")}
            {phaseTag ? (
              <>
                <span className="text-bone/35">·</span>
                <span style={{ color: theme.accent }}>{phaseTag}</span>
              </>
            ) : null}
          </span>

          {/* IMDb badge — an external link in its own right */}
          <div className="absolute top-2 right-2 z-30">
            <ImdbBadge
              rating={movie.imdbRating}
              href={imdbUrl(movie)}
              label={`View ${movie.title} on IMDb`}
            />
          </div>

          {movie.upcoming ? (
            <span
              className="pointer-events-none absolute bottom-2 left-2 z-20 flex items-center gap-1 rounded-[3px] bg-void/75 px-1.5 py-0.5 font-mono text-[9px] tracking-wider uppercase backdrop-blur-sm"
              style={{ color: theme.secondary }}
            >
              <Clock3 className="size-2.5" />
              Soon
            </span>
          ) : null}

          {/* Watched marker */}
          <span
            key={watched ? "watched" : "unwatched"}
            className={`pointer-events-none absolute right-2 bottom-2 z-20 flex size-7 items-center justify-center rounded-full border transition-colors ${
              watched ? "animate-pop text-black" : "border-bone/25 bg-void/60 text-bone/60 backdrop-blur-sm"
            }`}
            style={
              watched
                ? {
                    borderColor: theme.accent,
                    backgroundColor: theme.accent,
                    boxShadow: `0 0 16px ${theme.accent}aa`,
                  }
                : undefined
            }
          >
            {watched ? (
              <Check className="size-4" strokeWidth={3.5} />
            ) : (
              <Plus className="size-4" strokeWidth={2.5} />
            )}
          </span>

          {/* Hover reveal: synopsis + explicit IMDb link. The panel itself is
              click-through so the poster stays a one-click watched toggle. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 translate-y-full bg-void/92 p-3 backdrop-blur-md transition-transform duration-300 group-hover:translate-y-0">
            <p className="line-clamp-3 text-[11px] leading-snug text-mist">{movie.synopsis}</p>
            <p className="mt-2 font-mono text-[9px] tracking-brand text-mist/70 uppercase">
              Dir. {movie.director}
            </p>
            <a
              href={imdbUrl(movie)}
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto mt-2.5 flex items-center justify-center gap-1.5 rounded-md border border-gold/40 bg-gold/10 py-1.5 font-mono text-[10px] tracking-brand text-gold uppercase transition-colors hover:bg-gold/20"
            >
              View on IMDb
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>

        {/* ── Caption ────────────────────────────────────────────────────── */}
        <div className="relative z-20 mt-auto flex items-start gap-2 border-t border-white/5 px-2.5 py-2.5">
          <div className="min-w-0 flex-1">
            {/* Two lines are always reserved so every card in a row is the
                same height regardless of title length. */}
            <h3
              className="line-clamp-2 min-h-8 font-display text-[15px] leading-[1.05] tracking-wide uppercase transition-colors"
              style={{ color: watched ? theme.accent : undefined }}
            >
              {movie.title}
            </h3>
            <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[10px] text-mist">
              <span>{movie.year}</span>
              <span className="text-mist/50">/</span>
              <span className="truncate">{meta}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpen(movie)}
            aria-label={`Details for ${movie.title}`}
            className="mt-0.5 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md border border-white/10 text-mist transition-colors hover:border-white/30 hover:text-bone"
          >
            <Info className="size-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
