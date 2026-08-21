"use client";

import { useActionState, useState } from "react";
import { ArrowRight, KeyRound, LoaderCircle, ShieldAlert, X } from "lucide-react";

import { claimLegacyProfileAction, type ClaimState } from "@/app/actions";
import { PinInput } from "@/components/pin-input";

export type LegacyProfile = { id: string; username: string; watched: number };

const INITIAL: ClaimState = { error: null, claimed: null };

/**
 * One-time migration banner for people who had a PIN profile before Clerk.
 *
 * Only rendered when unclaimed legacy profiles still exist, so it disappears on
 * its own once the last one is carried over.
 */
export function ClaimLegacy({ profiles }: { profiles: LegacyProfile[] }) {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [selected, setSelected] = useState<LegacyProfile | null>(null);
  const [state, formAction, pending] = useActionState(claimLegacyProfileAction, INITIAL);

  if (dismissed || profiles.length === 0) return null;

  if (state.claimed !== null) {
    return (
      <div className="glass glass-edge mb-5 flex items-center justify-between gap-3 rounded-xl border-0 px-4 py-3">
        <p className="font-mono text-[11px] tracking-brand text-emerald-400 uppercase">
          Profile claimed — {state.claimed} {state.claimed === 1 ? "title" : "titles"} carried over
        </p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="cursor-pointer text-mist hover:text-bone"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        className="glass glass-edge mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3"
        style={
          {
            "--edge-from": "rgba(245,197,24,0.6)",
            "--edge-to": "rgba(245,197,24,0.2)",
          } as React.CSSProperties
        }
      >
        <div className="flex items-center gap-2.5">
          <KeyRound className="size-4 shrink-0 text-gold" />
          <p className="text-[13px] text-mist">
            <span className="text-bone">Had a PIN profile before?</span> Claim it to bring your
            watch list across.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-gold/40 bg-gold/10 px-3 py-1.5 font-mono text-[10px] tracking-brand text-gold uppercase transition-colors hover:bg-gold/20"
          >
            Claim profile
            <ArrowRight className="size-3" />
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss"
            className="cursor-pointer text-mist hover:text-bone"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Claim a legacy profile"
          className="fixed inset-0 z-100 flex items-center justify-center bg-void/85 p-4 backdrop-blur-md"
          onClick={() => setOpen(false)}
        >
          <form
            action={formAction}
            onClick={(event) => event.stopPropagation()}
            className="glass-strong glass-edge animate-rise relative w-full max-w-sm rounded-2xl p-6"
            style={
              {
                "--edge-from": "rgba(245,197,24,0.7)",
                "--edge-to": "rgba(226,54,54,0.3)",
              } as React.CSSProperties
            }
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute top-3 right-3 flex size-8 cursor-pointer items-center justify-center rounded-full border border-white/10 text-mist transition-colors hover:border-white/30 hover:text-bone"
            >
              <X className="size-4" />
            </button>

            <h2 className="font-display text-xl tracking-wide text-bone uppercase">
              Claim your old profile
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-mist">
              Pick your old profile and enter its 4-digit PIN. Its watch list merges into this
              account and the old profile is removed.
            </p>

            <div className="mt-5 space-y-2">
              {profiles.map((profile) => (
                <label
                  key={profile.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
                    selected?.id === profile.id
                      ? "border-gold/60 bg-gold/10"
                      : "border-white/10 hover:border-white/25"
                  }`}
                >
                  <input
                    type="radio"
                    name="username"
                    value={profile.username}
                    checked={selected?.id === profile.id}
                    onChange={() => setSelected(profile)}
                    className="sr-only"
                  />
                  <span className="flex size-8 items-center justify-center rounded-full bg-gold/15 font-display text-[13px] text-gold uppercase">
                    {profile.username.slice(0, 2)}
                  </span>
                  <span className="flex-1 font-display text-sm tracking-wide text-bone uppercase">
                    {profile.username}
                  </span>
                  <span className="font-mono text-[10px] text-mist tabular-nums">
                    {profile.watched} logged
                  </span>
                </label>
              ))}
            </div>

            <div className="mt-5">
              <PinInput name="pin" label="PIN" accent="#f5c518" invalid={Boolean(state.error)} />
            </div>

            {state.error ? (
              <p
                role="alert"
                className="mt-4 flex items-center justify-center gap-2 font-mono text-xs text-marvel"
              >
                <ShieldAlert className="size-3.5 shrink-0" />
                {state.error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={pending || !selected}
              className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3 font-display text-base leading-none tracking-widest text-void uppercase transition-all hover:bg-[#ffd34d] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? <LoaderCircle className="size-4 animate-spin" /> : "Claim and merge"}
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
