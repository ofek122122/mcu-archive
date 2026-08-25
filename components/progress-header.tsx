"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { BarChart3, Clapperboard, Database, DatabaseZap, Dices, Layers, LogIn, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { PHASES } from "@/lib/universes";
import { Logo } from "@/components/logo";

export type ViewId = "all" | "mcu" | "stats";

const VIEWS: { id: ViewId; label: string; icon: typeof Layers }[] = [
  { id: "all", label: "All Marvel", icon: Layers },
  { id: "mcu", label: "MCU Timeline", icon: Clapperboard },
  { id: "stats", label: "Stats & Vault", icon: BarChart3 },
];

type ProgressHeaderProps = {
  view: ViewId;
  onViewChange: (view: ViewId) => void;
  /** Guest ticks held in the browser, shown as a nudge in the header. */
  guestPending: number;
  /** Resolved on the server — the panel itself re-checks on every request. */
  isAdmin: boolean;
  watchedCount: number;
  total: number;
  /** Watched / total per phase id, used for the tick marks. */
  perPhase: Record<number, { watched: number; total: number }>;
  databaseConnected: boolean;
  onRoulette: () => void;
  rouletteDisabled: boolean;
};

/** Arc-reactor cyan → infinity purple → quantum red, mirroring the phase run. */
const METER_GRADIENT =
  "linear-gradient(90deg, #5ad2f4 0%, #3fdfd4 18%, #a970ff 46%, #ff3d5e 74%, #ff4f2a 100%)";

export function ProgressHeader({
  view,
  onViewChange,
  guestPending,
  isAdmin,
  watchedCount,
  total,
  perPhase,
  databaseConnected,
  onRoulette,
  rouletteDisabled,
}: ProgressHeaderProps) {
  const percent = total === 0 ? 0 : Math.round((watchedCount / total) * 100);

  // Cumulative phase boundaries, expressed as percentages of the slate.
  const boundaries = PHASES.slice(0, -1).map((phase, index) => {
    const cumulative = PHASES.slice(0, index + 1).reduce(
      (sum, earlier) => sum + (perPhase[earlier.id]?.total ?? 0),
      0,
    );
    return { id: phase.id, left: total === 0 ? 0 : (cumulative / total) * 100 };
  });

  return (
    <header className="glass-strong border-b border-white/10">
      <div className="mx-auto max-w-[1500px] px-4 pt-3 pb-2.5 sm:px-6">
        {/*
          On a phone the nav wraps onto its own full-width row (`order-last`),
          which is what buys the wordmark and the right cluster enough room to
          keep their text labels. Above sm it all sits on one line as before.
        */}
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 sm:flex-nowrap">
          <Logo />

          {/* View navigation */}
          <nav
            aria-label="Views"
            className="no-scrollbar order-last flex w-full items-center gap-0.5 overflow-x-auto rounded-lg border border-white/10 bg-void/50 p-0.5 backdrop-blur-md sm:order-none sm:w-auto"
          >
            {VIEWS.map((item) => {
              const Icon = item.icon;
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={active ? "page" : undefined}
                  onClick={() => onViewChange(item.id)}
                  className={`flex flex-1 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 font-display text-xs tracking-wider whitespace-nowrap uppercase transition-colors sm:flex-none sm:justify-start sm:px-3.5 sm:text-sm ${
                    active ? "bg-bone text-void" : "text-mist hover:text-bone"
                  }`}
                >
                  <Icon className="size-3.5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right cluster */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Infinity Roulette */}
            <button
              type="button"
              onClick={onRoulette}
              disabled={rouletteDisabled}
              title={
                rouletteDisabled
                  ? "Nothing unwatched in this filter"
                  : "Infinity Roulette — pick something to watch"
              }
              aria-label="Infinity Roulette"
              className="group relative flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-gold/50 bg-gold/10 px-2.5 text-gold transition-all hover:bg-gold/20 hover:shadow-[0_0_22px_rgba(245,197,24,0.5)] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-transparent disabled:text-mist/40 disabled:shadow-none sm:px-3"
            >
              <Dices className="size-4 transition-transform group-enabled:group-hover:rotate-180 group-enabled:group-hover:duration-500" />
              <span className="font-display text-xs tracking-widest uppercase">Roulette</span>
            </button>

            <div className="hidden items-baseline gap-1.5 leading-none md:flex">
              <span className="font-display text-2xl text-bone tabular-nums">{watchedCount}</span>
              <span className="font-display text-sm text-mist/60">/</span>
              <span className="font-display text-sm text-mist tabular-nums">{total}</span>
            </div>

            <span className="font-display text-2xl text-arc tabular-nums [text-shadow:0_0_18px_rgba(90,210,244,0.55)]">
              {percent}
              <span className="text-sm text-arc/60">%</span>
            </span>

            <span
              title={
                databaseConnected
                  ? "Synced to Redis — changes appear on every device"
                  : "No Redis store linked yet — changes are in-memory only"
              }
              className={`hidden ${databaseConnected ? "text-emerald-400/80" : "text-gold/80"} xl:block`}
            >
              {databaseConnected ? (
                <DatabaseZap className="size-3.5" />
              ) : (
                <Database className="size-3.5" />
              )}
            </span>

            {isAdmin ? (
              <Link
                href="/admin"
                title="Admin panel"
                className="flex size-8 items-center justify-center rounded-lg border border-gold/50 bg-gold/10 text-gold transition-colors hover:bg-gold/20"
              >
                <ShieldCheck className="size-4" />
              </Link>
            ) : null}

            {/* Clerk's own control component rather than a server-side
                ternary: UserButton mounts a host node on the client that is not
                in the server HTML, so branching by hand hydration-mismatches.
                Core 3 replaced <SignedIn>/<SignedOut> with <Show when=...>. */}
            <Show when="signed-in">
              <UserButton
                appearance={{ elements: { avatarBox: "size-8" } }}
                userProfileProps={{ appearance: { elements: { profileSection: "bg-panel" } } }}
              />
            </Show>

            <Show when="signed-out">
              <div className="flex items-center gap-1.5">
                {/* Guests see what they stand to keep, not a bare login link */}
                {guestPending > 0 ? (
                  <span
                    title={`${guestPending} ticked on this device only`}
                    className="hidden font-mono text-[10px] tracking-brand text-gold uppercase sm:inline"
                  >
                    {guestPending} unsaved
                  </span>
                ) : null}

                <SignInButton mode="modal">
                  <button
                    type="button"
                    className="flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-white/10 px-2.5 text-mist transition-colors hover:border-arc/50 hover:text-bone sm:px-3"
                  >
                    <LogIn className="size-3.5" />
                    <span className="font-display text-xs tracking-wider uppercase">Sign in</span>
                  </button>
                </SignInButton>

                <SignUpButton mode="modal">
                  <button
                    type="button"
                    className="hidden cursor-pointer rounded-lg bg-marvel px-3 py-1.5 font-display text-xs tracking-wider text-white uppercase shadow-[0_0_18px_-4px_rgba(226,54,54,0.8)] transition-colors hover:bg-[#f04747] md:block"
                  >
                    Sign up
                  </button>
                </SignUpButton>
              </div>
            </Show>
          </div>
        </div>

        {/* Progress meter */}
        <div className="relative mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full transition-[width] duration-500 ease-out"
            style={{
              width: `${percent}%`,
              background: METER_GRADIENT,
              boxShadow: "0 0 16px rgba(90,210,244,0.45)",
            }}
          />
          {boundaries.map((boundary) => (
            <span
              key={boundary.id}
              aria-hidden="true"
              className="absolute top-0 h-full w-px bg-void/90"
              style={{ left: `${boundary.left}%` }}
            />
          ))}
        </div>
      </div>
    </header>
  );
}
