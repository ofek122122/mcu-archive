"use client";

import { useActionState } from "react";
import { ArrowRight, LoaderCircle, Lock, ShieldAlert } from "lucide-react";

import { loginAction, type LoginState } from "@/app/actions";

const INITIAL_STATE: LoginState = { error: null };

export function PasscodeGate() {
  const [state, formAction, pending] = useActionState(loginAction, INITIAL_STATE);

  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        {/* Marvel-card style masthead */}
        <div className="animate-rise mb-10">
          <p className="font-mono text-[10px] tracking-brand text-mist uppercase">
            Marvel Cinematic Universe
          </p>
          <div className="mt-3 flex items-stretch">
            <span className="bg-marvel px-4 py-2.5 font-display text-3xl leading-none text-white -skew-x-6 shadow-[0_0_28px_rgba(226,54,54,0.55)]">
              MCU
            </span>
            <span className="ml-2 flex items-center border border-white/15 px-4 font-display text-3xl leading-none tracking-wide text-bone -skew-x-6 backdrop-blur-md">
              ARCHIVE
            </span>
          </div>
        </div>

        <div
          className="glass-strong glass-edge animate-rise rounded-2xl p-7 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.95)] sm:p-9"
          style={
            {
              animationDelay: "90ms",
              "--edge-from": "rgba(90,210,244,0.55)",
              "--edge-to": "rgba(226,54,54,0.35)",
            } as React.CSSProperties
          }
        >
          <div className="mb-6 flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg border border-arc/40 bg-arc/10 text-arc shadow-[0_0_22px_rgba(90,210,244,0.35)]">
              <Lock className="size-4" strokeWidth={2.5} />
            </span>
            <div>
              <h1 className="font-display text-2xl leading-none tracking-wide text-bone uppercase">
                Restricted Access
              </h1>
              <p className="mt-1 font-mono text-[10px] tracking-brand text-mist uppercase">
                Clearance required
              </p>
            </div>
          </div>

          <p className="mb-7 text-sm leading-relaxed text-mist">
            This tracker is private. Enter the archive passcode to view and edit the watch
            log.
          </p>

          <form action={formAction} className="space-y-4">
            <label htmlFor="passcode" className="sr-only">
              Passcode
            </label>
            <input
              id="passcode"
              name="passcode"
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              autoFocus
              placeholder="••••"
              aria-invalid={state.error ? true : undefined}
              aria-describedby={state.error ? "passcode-error" : undefined}
              className={`w-full rounded-lg border bg-void/60 px-4 py-3.5 text-center font-mono text-lg tracking-[0.5em] text-bone caret-arc backdrop-blur-md transition-colors placeholder:text-white/20 focus:border-arc focus:outline-none ${
                state.error ? "animate-shake border-marvel" : "border-white/12"
              }`}
            />

            {state.error ? (
              <p
                id="passcode-error"
                role="alert"
                className="flex items-center gap-2 font-mono text-xs text-marvel"
              >
                <ShieldAlert className="size-3.5 shrink-0" />
                {state.error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={pending}
              className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-marvel px-4 py-3.5 font-display text-lg leading-none tracking-widest text-white uppercase shadow-[0_0_30px_-6px_rgba(226,54,54,0.7)] transition-all hover:bg-[#f04747] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <>
                  Authenticate
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>

        <p
          className="animate-rise mt-6 text-center font-mono text-[10px] tracking-brand text-mist/60 uppercase"
          style={{ animationDelay: "180ms" }}
        >
          Session stored in an httpOnly cookie
        </p>
      </div>
    </main>
  );
}
