"use client";

import { useState } from "react";
import { TriangleAlert, X } from "lucide-react";

/**
 * Type-to-confirm guard for destructive admin actions.
 *
 * The typed value is passed to the action and re-checked on the server — this
 * dialog makes the mistake harder to make, it is not the thing that prevents it.
 */
export function ConfirmDialog({
  title,
  body,
  confirmWord,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  title: string;
  body: string;
  /** The exact string the admin has to type. */
  confirmWord: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: (value: string) => void;
}) {
  const [value, setValue] = useState("");
  const matches = value.trim().toLowerCase() === confirmWord.toLowerCase();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      className="fixed inset-0 z-100 flex items-center justify-center bg-void/85 p-4 backdrop-blur-md"
      onClick={onCancel}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="glass-strong glass-edge animate-rise relative w-full max-w-sm rounded-2xl p-6"
        style={
          {
            "--edge-from": "rgba(226,54,54,0.7)",
            "--edge-to": "rgba(226,54,54,0.25)",
          } as React.CSSProperties
        }
      >
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel"
          className="absolute top-3 right-3 flex size-8 cursor-pointer items-center justify-center rounded-full border border-white/10 text-mist transition-colors hover:border-white/30 hover:text-bone"
        >
          <X className="size-4" />
        </button>

        <h2
          id="confirm-title"
          className="flex items-center gap-2 pr-8 font-display text-xl tracking-wide text-marvel uppercase"
        >
          <TriangleAlert className="size-4 shrink-0" />
          {title}
        </h2>

        <p className="mt-2.5 text-[13px] leading-relaxed text-mist">{body}</p>

        <label className="mt-5 block font-mono text-[10px] tracking-brand text-mist uppercase">
          Type <span className="text-bone">{confirmWord}</span> to confirm
        </label>
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          autoFocus
          autoComplete="off"
          aria-label={`Type ${confirmWord} to confirm`}
          className="mt-2 w-full rounded-lg border border-white/12 bg-void/60 px-3 py-2 font-mono text-[12px] text-bone focus:border-marvel focus:outline-none"
        />

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 cursor-pointer rounded-lg border border-white/12 px-4 py-2 font-mono text-[10px] tracking-brand text-mist uppercase transition-colors hover:border-white/30 hover:text-bone"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!matches}
            onClick={() => onConfirm(value)}
            className="flex-1 cursor-pointer rounded-lg bg-marvel px-4 py-2 font-display text-sm tracking-widest text-white uppercase transition-colors hover:bg-[#f04747] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
