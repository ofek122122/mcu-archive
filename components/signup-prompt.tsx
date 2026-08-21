"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Check, CloudUpload, Smartphone, X } from "lucide-react";

/**
 * Shown once, the first time a guest ticks something.
 *
 * The tick is already saved locally by this point — the modal explains that and
 * offers to make it permanent, rather than blocking the action and losing it.
 */
export function SignupPrompt({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="signup-prompt-title"
      className="fixed inset-0 z-100 flex items-center justify-center bg-void/85 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="glass-strong glass-edge animate-rise relative w-full max-w-sm overflow-hidden rounded-2xl p-6 text-center"
        style={
          {
            "--edge-from": "rgba(90,210,244,0.7)",
            "--edge-to": "rgba(226,54,54,0.35)",
            boxShadow: "0 40px 120px -30px rgba(90,210,244,0.5)",
          } as React.CSSProperties
        }
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 flex size-8 cursor-pointer items-center justify-center rounded-full border border-white/10 text-mist transition-colors hover:border-white/30 hover:text-bone"
        >
          <X className="size-4" />
        </button>

        <span className="mx-auto flex size-12 items-center justify-center rounded-full border border-arc/40 bg-arc/10 text-arc shadow-[0_0_26px_rgba(90,210,244,0.4)]">
          <Check className="size-5" strokeWidth={3} />
        </span>

        <h2
          id="signup-prompt-title"
          className="mt-4 font-display text-2xl leading-tight tracking-wide text-bone uppercase"
        >
          Saved on this device
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-mist">
          <span className="text-bone">{title}</span> is ticked, but only in this browser. Make a
          free account to keep your list.
        </p>

        <ul className="mt-5 space-y-2 text-left">
          <li className="flex items-center gap-2.5 text-[13px] text-mist">
            <CloudUpload className="size-4 shrink-0 text-arc" />
            Everything you have ticked so far comes with you
          </li>
          <li className="flex items-center gap-2.5 text-[13px] text-mist">
            <Smartphone className="size-4 shrink-0 text-arc" />
            Your list syncs to your phone and laptop
          </li>
        </ul>

        <div className="mt-6 space-y-2">
          <SignUpButton mode="modal">
            <button
              type="button"
              className="flex w-full cursor-pointer items-center justify-center rounded-xl bg-marvel px-4 py-3 font-display text-lg leading-none tracking-widest text-white uppercase shadow-[0_0_30px_-6px_rgba(226,54,54,0.7)] transition-all hover:bg-[#f04747] active:scale-[0.99]"
            >
              Create free account
            </button>
          </SignUpButton>

          <SignInButton mode="modal">
            <button
              type="button"
              className="w-full cursor-pointer rounded-xl border border-white/12 px-4 py-2.5 font-mono text-[11px] tracking-brand text-mist uppercase transition-colors hover:border-arc/50 hover:text-bone"
            >
              I already have one
            </button>
          </SignInButton>

          <button
            type="button"
            onClick={onClose}
            className="w-full cursor-pointer py-1.5 font-mono text-[10px] tracking-brand text-mist/60 uppercase transition-colors hover:text-mist"
          >
            Keep browsing as a guest
          </button>
        </div>
      </div>
    </div>
  );
}
