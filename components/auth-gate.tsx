"use client";

import { useActionState, useState } from "react";
import { ArrowLeft, ArrowRight, LoaderCircle, ShieldAlert, UserPlus, Users } from "lucide-react";

import { createUserAction, loginAction, type AuthState } from "@/app/actions";
import { PinInput } from "@/components/pin-input";

export type PublicUser = { id: string; username: string; watched: number };

type AuthGateProps = {
  users: PublicUser[];
  total: number;
};

const INITIAL: AuthState = { error: null };

type Screen = { kind: "pick" } | { kind: "signIn"; user: PublicUser } | { kind: "create" };

export function AuthGate({ users, total }: AuthGateProps) {
  const [screen, setScreen] = useState<Screen>(() =>
    users.length === 0 ? { kind: "create" } : { kind: "pick" },
  );

  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        {/* Masthead */}
        <div className="animate-rise mb-8">
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

        {screen.kind === "pick" ? (
          <UserPicker
            users={users}
            total={total}
            onPick={(user) => setScreen({ kind: "signIn", user })}
            onCreate={() => setScreen({ kind: "create" })}
          />
        ) : screen.kind === "signIn" ? (
          <SignInPanel user={screen.user} total={total} onBack={() => setScreen({ kind: "pick" })} />
        ) : (
          <CreatePanel
            onBack={users.length === 0 ? null : () => setScreen({ kind: "pick" })}
          />
        )}
      </div>
    </main>
  );
}

// ── Screens ─────────────────────────────────────────────────────────────────

function UserPicker({
  users,
  total,
  onPick,
  onCreate,
}: {
  users: PublicUser[];
  total: number;
  onPick: (user: PublicUser) => void;
  onCreate: () => void;
}) {
  return (
    <div
      className="glass-strong glass-edge animate-rise rounded-2xl p-6 sm:p-7"
      style={
        {
          animationDelay: "90ms",
          "--edge-from": "rgba(90,210,244,0.55)",
          "--edge-to": "rgba(226,54,54,0.35)",
        } as React.CSSProperties
      }
    >
      <div className="mb-5 flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg border border-arc/40 bg-arc/10 text-arc shadow-[0_0_22px_rgba(90,210,244,0.35)]">
          <Users className="size-4" strokeWidth={2.5} />
        </span>
        <div>
          <h1 className="font-display text-2xl leading-none tracking-wide text-bone uppercase">
            Who&apos;s watching?
          </h1>
          <p className="mt-1 font-mono text-[10px] tracking-brand text-mist uppercase">
            {users.length} {users.length === 1 ? "profile" : "profiles"}
          </p>
        </div>
      </div>

      <ul className="space-y-2">
        {users.map((user, index) => {
          const percent = total === 0 ? 0 : Math.round((user.watched / total) * 100);
          return (
            <li key={user.id}>
              <button
                type="button"
                onClick={() => onPick(user)}
                style={{ animationDelay: `${120 + index * 45}ms` }}
                className="animate-rise group flex w-full cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-void/40 px-3 py-2.5 text-left transition-all hover:border-arc/50 hover:bg-arc/5"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-arc/15 font-display text-base text-arc uppercase">
                  {user.username.slice(0, 2)}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-base tracking-wide text-bone uppercase">
                    {user.username}
                  </span>
                  <span className="mt-1 block h-1 overflow-hidden rounded-full bg-white/8">
                    <span
                      className="block h-full rounded-full bg-arc transition-[width] duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </span>
                </span>

                <span className="shrink-0 text-right">
                  <span className="block font-mono text-[11px] text-bone tabular-nums">
                    {user.watched}/{total}
                  </span>
                  <span className="block font-mono text-[9px] text-mist">{percent}%</span>
                </span>

                <ArrowRight className="size-4 shrink-0 text-mist transition-transform group-hover:translate-x-0.5 group-hover:text-arc" />
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={onCreate}
        className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 px-4 py-3 font-display text-sm tracking-widest text-mist uppercase transition-colors hover:border-marvel/60 hover:text-marvel"
      >
        <UserPlus className="size-4" />
        New profile
      </button>
    </div>
  );
}

function SignInPanel({
  user,
  total,
  onBack,
}: {
  user: PublicUser;
  total: number;
  onBack: () => void;
}) {
  const [state, formAction, pending] = useActionState(loginAction, INITIAL);

  return (
    <form
      action={formAction}
      className="glass-strong glass-edge animate-rise rounded-2xl p-6 text-center sm:p-7"
      style={
        {
          "--edge-from": "rgba(90,210,244,0.55)",
          "--edge-to": "rgba(226,54,54,0.35)",
        } as React.CSSProperties
      }
    >
      <input type="hidden" name="userId" value={user.id} />

      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-arc/15 font-display text-xl text-arc uppercase">
        {user.username.slice(0, 2)}
      </span>

      <h1 className="mt-3 font-display text-2xl leading-none tracking-wide text-bone uppercase">
        {user.username}
      </h1>
      <p className="mt-1.5 font-mono text-[10px] tracking-brand text-mist uppercase">
        {user.watched} of {total} logged
      </p>

      <div className="mt-6">
        <PinInput name="pin" label="Enter PIN" autoFocus invalid={Boolean(state.error)} />
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
        disabled={pending}
        className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-marvel px-4 py-3 font-display text-lg leading-none tracking-widest text-white uppercase shadow-[0_0_30px_-6px_rgba(226,54,54,0.7)] transition-all hover:bg-[#f04747] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? <LoaderCircle className="size-4 animate-spin" /> : "Enter"}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="mt-3 flex w-full cursor-pointer items-center justify-center gap-1.5 font-mono text-[10px] tracking-brand text-mist uppercase transition-colors hover:text-bone"
      >
        <ArrowLeft className="size-3" />
        All profiles
      </button>
    </form>
  );
}

function CreatePanel({ onBack }: { onBack: (() => void) | null }) {
  const [state, formAction, pending] = useActionState(createUserAction, INITIAL);

  return (
    <form
      action={formAction}
      className="glass-strong glass-edge animate-rise rounded-2xl p-6 sm:p-7"
      style={
        {
          "--edge-from": "rgba(226,54,54,0.55)",
          "--edge-to": "rgba(90,210,244,0.35)",
        } as React.CSSProperties
      }
    >
      <div className="mb-5 flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg border border-marvel/40 bg-marvel/10 text-marvel shadow-[0_0_22px_rgba(226,54,54,0.35)]">
          <UserPlus className="size-4" strokeWidth={2.5} />
        </span>
        <div>
          <h1 className="font-display text-2xl leading-none tracking-wide text-bone uppercase">
            New profile
          </h1>
          <p className="mt-1 font-mono text-[10px] tracking-brand text-mist uppercase">
            Your own watch log
          </p>
        </div>
      </div>

      <label htmlFor="username" className="mb-2 block font-mono text-[10px] tracking-brand text-mist uppercase">
        Username
      </label>
      <input
        id="username"
        name="username"
        type="text"
        autoComplete="off"
        autoFocus
        maxLength={16}
        placeholder="Ofek"
        className="w-full rounded-xl border border-white/12 bg-void/60 px-4 py-3 font-display text-lg tracking-wide text-bone backdrop-blur-md transition-colors placeholder:text-white/20 focus:border-marvel focus:outline-none"
      />
      <p className="mt-1.5 font-mono text-[9px] text-mist/60">
        Visible to everyone on the sign-in screen.
      </p>

      <div className="mt-5 space-y-4">
        <PinInput name="pin" label="Choose a 4-digit PIN" accent="#e23636" />
        <PinInput name="confirmPin" label="Confirm PIN" accent="#e23636" />
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
        disabled={pending}
        className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-marvel px-4 py-3 font-display text-lg leading-none tracking-widest text-white uppercase shadow-[0_0_30px_-6px_rgba(226,54,54,0.7)] transition-all hover:bg-[#f04747] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? <LoaderCircle className="size-4 animate-spin" /> : "Create profile"}
      </button>

      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="mt-3 flex w-full cursor-pointer items-center justify-center gap-1.5 font-mono text-[10px] tracking-brand text-mist uppercase transition-colors hover:text-bone"
        >
          <ArrowLeft className="size-3" />
          All profiles
        </button>
      ) : null}

      <p className="mt-5 text-center font-mono text-[9px] leading-relaxed tracking-wider text-mist/50 uppercase">
        A 4-digit PIN is a soft lock, not real security.
        <br />
        Don&apos;t reuse a PIN that guards anything important.
      </p>
    </form>
  );
}
