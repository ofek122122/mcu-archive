"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Calendar, Check, Clapperboard, Clock3, ExternalLink, Plus, Tv, X } from "lucide-react";

import { imdbUrl } from "@/lib/movies";
import type { Theme, TrackedMovie } from "@/lib/types";
import { ImdbBadge } from "@/components/imdb-badge";
import { WatchProviders } from "@/components/watch-providers";

type MovieModalProps = {
  movie: TrackedMovie;
  theme: Theme;
  /** Geo-IP region resolved on the server; the picker can override it. */
  region: string;
  watched: boolean;
  onToggle: (movie: TrackedMovie, next: boolean) => void;
  onClose: () => void;
};

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function MovieModal({ movie, theme, region, watched, onToggle, onClose }: MovieModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [artFailed, setArtFailed] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const showArt = Boolean(movie.posterUrl) && !artFailed;
  const isSeries = movie.kind === "series";
  const shape = isSeries
    ? movie.seasons && movie.seasons > 1
      ? `${movie.seasons} seasons · ${movie.episodes} eps`
      : `${movie.episodes} ${movie.episodes === 1 ? "special" : "episodes"}`
    : movie.runtime
      ? `${movie.runtime} min`
      : "Runtime TBA";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="movie-modal-title"
      className="fixed inset-0 z-100 flex items-end justify-center bg-void/75 backdrop-blur-md sm:items-center sm:p-6"
      onClick={onClose}
    >
      {/*
        The panel is the scroll container, not the backdrop. Scrolling the
        backdrop instead stranded the top of a tall panel above the scrollable
        area — flex `items-end` pins the overflow out of reach — which on a
        phone put the close button off-screen with no way to scroll back to it.
      */}
      <div
        onClick={(event) => event.stopPropagation()}
        className="glass-strong glass-edge animate-rise relative flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl sm:max-h-[86dvh] sm:rounded-2xl"
        style={
          {
            "--edge-from": `${theme.accent}bb`,
            "--edge-to": `${theme.secondary}66`,
            boxShadow: `0 40px 120px -30px ${theme.accent}55`,
          } as CSSProperties
        }
      >
        {/* Themed wash */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(90% 60% at 0% 0%, ${theme.accent}22, transparent 60%)`,
          }}
        />

        {/* Sheet header — pinned, so the way out never scrolls away. */}
        <div className="relative z-20 flex shrink-0 items-center gap-3 border-b border-white/8 px-4 pt-4 pb-2.5 sm:px-7 sm:pt-3">
          <span
            aria-hidden="true"
            className="absolute top-1.5 left-1/2 h-1 w-9 -translate-x-1/2 rounded-full bg-white/20 sm:hidden"
          />
          <p
            className="min-w-0 flex-1 truncate font-mono text-[10px] tracking-brand uppercase"
            style={{ color: theme.accent }}
          >
            {theme.label} <span className="text-mist/50">·</span> {movie.studio}
          </p>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-void/60 px-3 py-1.5 font-mono text-[10px] tracking-brand text-mist uppercase backdrop-blur-sm transition-colors hover:border-white/30 hover:text-bone"
          >
            <X className="size-3.5" />
            Close
          </button>
        </div>

        {/*
          Two columns at both sizes, but on a phone everything below the title
          spans the full width instead of squeezing into the strip beside the
          poster. One DOM either way — a per-breakpoint copy of the body would
          also duplicate the where-to-watch fetch.
        */}
        <div className="relative grid min-h-0 flex-1 grid-cols-[6rem_1fr] content-start gap-x-4 gap-y-5 overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:grid-cols-[10rem_1fr] sm:gap-x-6 sm:p-7">
          {/* Poster */}
          <div
            className="relative aspect-[2/3] w-full self-start overflow-hidden rounded-lg"
            style={{
              background: `linear-gradient(158deg, ${theme.accent}38 0%, ${theme.deep} 46%, #04040a 100%)`,
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="outlined font-display text-3xl leading-none select-none sm:text-4xl"
                style={{ WebkitTextStrokeColor: theme.accent, opacity: 0.8 }}
              >
                {movie.initials}
              </span>
            </div>
            <div className="scanlines absolute inset-0 opacity-25 mix-blend-overlay" />
            {showArt ? (
              <Image
                src={movie.posterUrl as string}
                alt={`${movie.title} poster`}
                fill
                sizes="160px"
                className="object-cover"
                onError={() => setArtFailed(true)}
              />
            ) : null}
          </div>

          {/* Title block — sits beside the poster at every width */}
          <div className="min-w-0 self-start">
            <h2
              id="movie-modal-title"
              className="font-display text-xl leading-[1.05] tracking-wide text-bone uppercase sm:text-3xl"
            >
              {movie.title}
            </h2>

            <p className="mt-2 font-mono text-[11px] text-mist">
              {movie.year} <span className="text-mist/50">/</span> {shape}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2.5">
              <ImdbBadge rating={movie.imdbRating} size="md" />
              {movie.upcoming ? (
                <span
                  className="rounded-[3px] border px-2 py-1 font-mono text-[10px] tracking-brand uppercase"
                  style={{ borderColor: `${theme.secondary}66`, color: theme.secondary }}
                >
                  Unreleased
                </span>
              ) : null}
            </div>
          </div>

          {/* The rest: full width on a phone, beside the poster above sm */}
          <div className="col-span-2 min-w-0 sm:col-span-1 sm:col-start-2">
            <p className="text-sm leading-relaxed text-mist">{movie.synopsis}</p>

            <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              <Fact
                icon={Clapperboard}
                label={isSeries ? "Created by" : "Director"}
                value={movie.director}
              />
              <Fact
                icon={Calendar}
                label={isSeries ? "First aired" : "Released"}
                value={DATE_FORMAT.format(new Date(movie.releaseDate))}
              />
              {isSeries ? (
                <Fact
                  icon={Tv}
                  label="Episodes"
                  value={`${movie.seasons} ${movie.seasons === 1 ? "season" : "seasons"} · ${movie.episodes} ${movie.episodes === 1 ? "episode" : "episodes"}`}
                />
              ) : null}
              <Fact
                icon={Clock3}
                label={isSeries ? "Total runtime" : "Runtime"}
                value={
                  movie.runtime
                    ? isSeries
                      ? `about ${Math.round(movie.runtime / 60)} h (${movie.runtime} min)`
                      : `${movie.runtime} min`
                    : "To be announced"
                }
              />
            </dl>

            <WatchProviders
              movieId={movie.id}
              title={movie.title}
              accent={theme.accent}
              detectedRegion={region}
            />

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                aria-pressed={watched}
                onClick={() => onToggle(movie, !watched)}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-display text-sm tracking-widest uppercase transition-all active:scale-[0.99]"
                style={
                  watched
                    ? {
                        backgroundColor: theme.accent,
                        color: "#04040a",
                        boxShadow: `0 0 24px ${theme.accent}66`,
                      }
                    : {
                        border: `1px solid ${theme.accent}55`,
                        color: theme.accent,
                        backgroundColor: `${theme.accent}12`,
                      }
                }
              >
                {watched ? <Check className="size-4" strokeWidth={3} /> : <Plus className="size-4" />}
                {watched ? "Logged" : "Mark watched"}
              </button>

              <a
                href={imdbUrl(movie)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gold/40 bg-gold/10 px-4 py-2.5 font-display text-sm tracking-widest text-gold uppercase transition-colors hover:bg-gold/20"
              >
                View on IMDb
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 size-3.5 shrink-0 text-mist/60" />
      <div className="min-w-0">
        <dt className="font-mono text-[9px] tracking-brand text-mist/60 uppercase">{label}</dt>
        <dd className="truncate text-sm text-bone">{value}</dd>
      </div>
    </div>
  );
}
