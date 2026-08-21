"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronDown, ExternalLink, Loader2, MonitorPlay, Ticket } from "lucide-react";

import type { WatchAvailability } from "@/lib/watch-providers";

/**
 * "Where to watch" for one title, in the viewer's region.
 *
 * ── Attribution ────────────────────────────────────────────────────────────
 * The data is JustWatch's, via TMDB. TMDB's terms require the source to be
 * attributed as JustWatch **on each media item** — not once somewhere in the
 * app — and they revoke API access over it. That is why the credit renders
 * inside this component, next to every result, rather than in a footer.
 */

const REGIONS = [
  { code: "IL", label: "Israel", flag: "🇮🇱" },
  { code: "US", label: "United States", flag: "🇺🇸" },
  { code: "GB", label: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", label: "Canada", flag: "🇨🇦" },
  { code: "AU", label: "Australia", flag: "🇦🇺" },
  { code: "DE", label: "Germany", flag: "🇩🇪" },
  { code: "FR", label: "France", flag: "🇫🇷" },
  { code: "ES", label: "Spain", flag: "🇪🇸" },
  { code: "IT", label: "Italy", flag: "🇮🇹" },
  { code: "NL", label: "Netherlands", flag: "🇳🇱" },
  { code: "BR", label: "Brazil", flag: "🇧🇷" },
  { code: "IN", label: "India", flag: "🇮🇳" },
  { code: "JP", label: "Japan", flag: "🇯🇵" },
  { code: "MX", label: "Mexico", flag: "🇲🇽" },
];

const REGION_KEY = "mcu-archive:region";
const LOGO_BASE = "https://image.tmdb.org/t/p/w92";

type Response = { configured: boolean; availability: WatchAvailability | null };

export function WatchProviders({
  movieId,
  title,
  accent,
  /** Geo-IP region resolved on the server, used until the viewer overrides it. */
  detectedRegion,
}: {
  movieId: string;
  title: string;
  accent: string;
  detectedRegion: string;
}) {
  // A stored preference wins over geo-IP: someone travelling, or behind a VPN,
  // should not re-pick their country on every title. Read in a lazy initialiser
  // rather than an effect — this component only mounts on click, well after
  // hydration, so there is no server/client snapshot to disagree with.
  const [region, setRegion] = useState(() => {
    try {
      const saved = window.localStorage.getItem(REGION_KEY);
      return saved && /^[A-Z]{2}$/.test(saved) ? saved : detectedRegion;
    } catch {
      return detectedRegion;
    }
  });

  const [picking, setPicking] = useState(false);
  const [result, setResult] = useState<{ key: string; payload: Response | null } | null>(null);

  const requestKey = `${movieId}:${region}`;
  // Derived rather than a second piece of state: a stale result for a previous
  // title or region *is* the loading condition, so setLoading(true) inside the
  // effect would be both redundant and a cascading render.
  const loading = result?.key !== requestKey;
  const data = loading ? null : (result?.payload ?? null);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/watch/${encodeURIComponent(movieId)}?region=${region}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: Response | null) => {
        if (!cancelled) setResult({ key: requestKey, payload });
      })
      .catch(() => {
        if (!cancelled) setResult({ key: requestKey, payload: null });
      });

    return () => {
      cancelled = true;
    };
  }, [movieId, region, requestKey]);

  function choose(code: string) {
    setRegion(code);
    setPicking(false);
    try {
      window.localStorage.setItem(REGION_KEY, code);
    } catch {
      // Preference just will not persist.
    }
  }

  // Not configured at all — say nothing rather than show a broken section.
  if (!loading && data && !data.configured) return null;

  const availability = data?.availability ?? null;
  const groups = availability
    ? ([
        { key: "stream", label: "Stream", items: availability.stream },
        { key: "free", label: "Free", items: availability.free },
        { key: "rent", label: "Rent", items: availability.rent },
        { key: "buy", label: "Buy", items: availability.buy },
      ] as const).filter((group) => group.items.length > 0)
    : [];

  const current = REGIONS.find((entry) => entry.code === region);

  return (
    <section className="mt-6 border-t border-white/8 pt-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-mono text-[10px] tracking-brand text-mist uppercase">
          <MonitorPlay className="size-3.5" style={{ color: accent }} />
          Where to watch
        </h3>

        {/* Region picker — geo-IP is a guess, and a wrong guess is worse than
            no answer when availability is territory-locked. */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setPicking((open) => !open)}
            aria-expanded={picking}
            aria-label={`Region: ${current?.label ?? region}. Change region`}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/12 px-2 py-1 font-mono text-[10px] tracking-wider text-mist uppercase transition-colors hover:border-white/30 hover:text-bone"
          >
            <span aria-hidden="true">{current?.flag ?? "🌍"}</span>
            {region}
            <ChevronDown className="size-3" />
          </button>

          {picking ? (
            <div className="glass-strong absolute right-0 z-20 mt-1 max-h-56 w-44 overflow-y-auto rounded-lg border border-white/12 p-1">
              {REGIONS.map((entry) => (
                <button
                  key={entry.code}
                  type="button"
                  onClick={() => choose(entry.code)}
                  className={`flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px] transition-colors ${
                    entry.code === region ? "bg-white/10 text-bone" : "text-mist hover:bg-white/5"
                  }`}
                >
                  <span aria-hidden="true">{entry.flag}</span>
                  {entry.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {loading ? (
        <p className="mt-3 flex items-center gap-2 text-[13px] text-mist/70">
          <Loader2 className="size-3.5 animate-spin" />
          Checking {current?.label ?? region}…
        </p>
      ) : groups.length === 0 ? (
        <p className="mt-3 text-[13px] text-mist/70">
          Not streaming in {current?.label ?? region} right now.
          {availability ? " Try another region." : ""}
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {groups.map((group) => (
            <div key={group.key} className="flex flex-wrap items-center gap-2">
              <span className="w-12 shrink-0 font-mono text-[9px] tracking-brand text-mist/60 uppercase">
                {group.label}
              </span>
              {group.items.map((provider) => (
                <span
                  key={provider.id}
                  title={provider.name}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-void/40 py-1 pr-2 pl-1"
                >
                  {provider.logoPath ? (
                    <Image
                      src={`${LOGO_BASE}${provider.logoPath}`}
                      alt=""
                      width={20}
                      height={20}
                      className="rounded"
                      unoptimized
                    />
                  ) : (
                    <Ticket className="size-4 text-mist" />
                  )}
                  <span className="text-[11px] text-bone">{provider.name}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Required by TMDB: the source must be credited as JustWatch on every
          item that shows this data. */}
      <p className="mt-3 flex flex-wrap items-center gap-1 font-mono text-[9px] text-mist/50">
        <span>Availability data by</span>
        {availability?.link ? (
          <a
            href={availability.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-mist/70 underline underline-offset-2 transition-colors hover:text-bone"
          >
            JustWatch
            <ExternalLink className="size-2.5" />
          </a>
        ) : (
          <a
            href={`https://www.justwatch.com/${region.toLowerCase()}/search?q=${encodeURIComponent(title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-mist/70 underline underline-offset-2 transition-colors hover:text-bone"
          >
            JustWatch
            <ExternalLink className="size-2.5" />
          </a>
        )}
        <span>via TMDB</span>
      </p>
    </section>
  );
}
