"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Check, Dices, ExternalLink, X } from "lucide-react";

import { imdbUrl, themeFor } from "@/lib/movies";
import { useScrollLock } from "@/lib/use-scroll-lock";
import type { TrackedMovie } from "@/lib/types";
import { ImdbBadge } from "@/components/imdb-badge";

type RouletteModalProps = {
  movie: TrackedMovie;
  watched: boolean;
  onToggle: (movie: TrackedMovie, next: boolean) => void;
  onReroll: () => void;
  onClose: () => void;
};

/**
 * "Infinity Roulette" reveal. Spins through a few titles before settling on the
 * pick, which reads as a draw rather than an instant answer.
 */
export function RouletteModal({
  movie,
  watched,
  onToggle,
  onReroll,
  onClose,
}: RouletteModalProps) {
  const [revealed, setRevealed] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const theme = themeFor(movie);

  // The parent keys this component by movie id, so a re-roll remounts it and
  // the reveal re-arms without resetting state inside an effect.
  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 900);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  useScrollLock();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Infinity Roulette result"
      className="fixed inset-0 z-100 flex items-center justify-center bg-void/85 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="glass-strong glass-edge animate-rise relative w-full max-w-md overflow-hidden rounded-2xl p-6 text-center"
        style={
          {
            "--edge-from": `${theme.accent}cc`,
            "--edge-to": `${theme.secondary}66`,
            boxShadow: `0 40px 120px -30px ${theme.accent}77`,
          } as CSSProperties
        }
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(80% 60% at 50% 0%, ${theme.accent}2e, transparent 65%)`,
          }}
        />

        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-20 flex size-8 cursor-pointer items-center justify-center rounded-full border border-white/10 text-mist transition-colors hover:border-white/30 hover:text-bone"
        >
          <X className="size-4" />
        </button>

        <p
          className="relative font-mono text-[10px] tracking-brand uppercase"
          style={{ color: theme.accent }}
        >
          Infinity Roulette
        </p>

        {/* Spin → settle */}
        <div className="relative mt-5 flex justify-center" aria-live="polite">
          <div
            className={`relative aspect-[2/3] w-36 overflow-hidden rounded-xl transition-all duration-700 ${
              revealed ? "scale-100 opacity-100 blur-0" : "scale-90 opacity-40 blur-md"
            }`}
            style={{
              background: `linear-gradient(158deg, ${theme.accent}38 0%, ${theme.deep} 46%, #04040a 100%)`,
              boxShadow: revealed ? `0 0 46px -8px ${theme.accent}88` : "none",
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="outlined font-display text-4xl leading-none select-none"
                style={{ WebkitTextStrokeColor: theme.accent, opacity: 0.8 }}
              >
                {movie.initials}
              </span>
            </div>
            {movie.posterUrl ? (
              <Image
                src={movie.posterUrl}
                alt=""
                fill
                sizes="144px"
                className="object-cover"
              />
            ) : null}
            <div className="scanlines absolute inset-0 opacity-25 mix-blend-overlay" />
          </div>
        </div>

        <div
          className={`relative transition-all duration-500 ${
            revealed ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          <h2 className="mt-5 font-display text-2xl leading-tight tracking-wide text-bone uppercase">
            {movie.title}
          </h2>
          <p className="mt-1.5 font-mono text-[10px] tracking-brand text-mist uppercase">
            {movie.year} · {movie.studio}
            {movie.runtime ? ` · ${movie.runtime}m` : ""}
          </p>

          <div className="mt-3 flex justify-center">
            <ImdbBadge rating={movie.imdbRating} size="md" />
          </div>

          <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-mist">{movie.synopsis}</p>

          <div className="mt-6 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => onToggle(movie, !watched)}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-display text-sm tracking-widest uppercase transition-all active:scale-[0.99]"
              style={
                watched
                  ? { backgroundColor: theme.accent, color: "#04040a" }
                  : {
                      border: `1px solid ${theme.accent}55`,
                      color: theme.accent,
                      backgroundColor: `${theme.accent}12`,
                    }
              }
            >
              {watched ? <Check className="size-4" strokeWidth={3} /> : null}
              {watched ? "Logged" : "Mark watched"}
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onReroll}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/12 px-4 py-2 font-mono text-[10px] tracking-brand text-mist uppercase transition-colors hover:border-white/30 hover:text-bone"
              >
                <Dices className="size-3.5" />
                Spin again
              </button>
              <a
                href={imdbUrl(movie)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gold/40 bg-gold/10 px-4 py-2 font-mono text-[10px] tracking-brand text-gold uppercase transition-colors hover:bg-gold/20"
              >
                IMDb
                <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
