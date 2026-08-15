"use client";

import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";

type PinInputProps = {
  /** Form field name — the joined 4-digit value is submitted under this. */
  name: string;
  label: string;
  autoFocus?: boolean;
  invalid?: boolean;
  accent?: string;
  /** Fired when all four digits are filled. */
  onComplete?: () => void;
};

const SLOTS = [0, 1, 2, 3];

/** Four auto-advancing digit boxes that submit as one hidden value. */
export function PinInput({
  name,
  label,
  autoFocus = false,
  invalid = false,
  accent = "#5ad2f4",
  onComplete,
}: PinInputProps) {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  function commit(next: string[]) {
    setDigits(next);
    if (next.every((digit) => digit !== "")) onComplete?.();
  }

  function handleChange(index: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    commit(next);
    if (digit && index < SLOTS.length - 1) refs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      const next = [...digits];
      next[index - 1] = "";
      setDigits(next);
      refs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < SLOTS.length - 1) refs.current[index + 1]?.focus();
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pasted) return;
    event.preventDefault();
    const next = ["", "", "", ""];
    for (let i = 0; i < pasted.length; i += 1) next[i] = pasted[i];
    commit(next);
    refs.current[Math.min(pasted.length, 3)]?.focus();
  }

  return (
    <div>
      <span className="mb-2 block font-mono text-[10px] tracking-brand text-mist uppercase">
        {label}
      </span>

      <div className="flex justify-center gap-2.5" role="group" aria-label={label}>
        {SLOTS.map((index) => (
          <input
            key={index}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={1}
            value={digits[index]}
            aria-label={`${label} digit ${index + 1}`}
            autoFocus={autoFocus && index === 0}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            onFocus={(event) => event.target.select()}
            style={digits[index] ? { borderColor: accent, boxShadow: `0 0 18px ${accent}44` } : undefined}
            className={`size-13 rounded-xl border bg-void/60 text-center font-display text-2xl text-bone backdrop-blur-md transition-all focus:outline-none ${
              invalid ? "animate-shake border-marvel" : "border-white/12"
            }`}
          />
        ))}
      </div>

      <input type="hidden" name={name} value={digits.join("")} />
    </div>
  );
}
