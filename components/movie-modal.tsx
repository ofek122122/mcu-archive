"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Calendar, Check, Clapperboard, Clock3, ExternalLink, Plus, Tv, X } from "lucide-react";

import { imdbUrl } from "@/lib/movies";
import type { Theme, TrackedMovie } from "@/lib/types";
import { ImdbBadge } from "@/components/imdb-badge";

type MovieModalProps = {
  movie: TrackedMovie;
  theme: Theme;
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

export function MovieModal({ movie, theme, watched, onToggle, onClose }: MovieModalProps) {
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="movie-modal-title"
      className="fixed inset-0 z-100 flex items-end justify-center overflow-y-auto bg-void/75 p-0 backdrop-blur-md sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="glass-strong glass-edge animate-rise relative w-full max-w-2xl overflow-hidden rounded-t-2xl sm:rounded-2xl"
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

        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="absolute top-3 right-3 z-20 flex size-9 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-void/60 text-mist backdrop-blur-sm transition-colors hover:border-white/30 hover:text-bone"
        >
          <X className="size-4" />
        </button>

        <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:gap-6 sm:p-7">
          {/* Poster */}
          <div
            className="relative aspect-[2/3] w-28 shrink-0 self-start overflow-hidden rounded-lg sm:w-40"
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

          {/* Details */}
          <div className="min-w-0 flex-1">
            <p
              className="font-mono text-[10px] tracking-brand uppercase"
              style={{ color: theme.accent }}
            >
              {theme.label} <span className="text-mist/50">·</span> {movie.studio}
            </p>

            <h2
              id="movie-modal-title"
              className="mt-2 pr-10 font-display text-2xl leading-[1.05] tracking-wide text-bone uppercase sm:text-3xl"
            >
              {movie.title}
            </h2>

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

            <p className="mt-4 text-sm leading-relaxed text-mist">{movie.synopsis}</p>

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
