import { BRAND, MARK_SKEW, PHASE_BARS } from "@/lib/brand";

/**
 * The mark on its own — see lib/brand.ts for what it is and why.
 *
 * No gradients and no ids, so it can appear many times on a page without the
 * duplicate-id problem that bites `<defs>`-based logos.
 */
export function LogoMark({
  size = 32,
  tile = true,
  className,
}: {
  size?: number;
  /** Draw the rounded dark backing. Off when it sits on the page itself. */
  tile?: boolean;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label="MCU Archive"
      className={className}
    >
      {tile ? <rect width="32" height="32" rx="7" fill={BRAND.void} /> : null}
      <g transform={`skewX(${MARK_SKEW}) translate(3.2 0)`}>
        {PHASE_BARS.map((bar) => (
          <rect
            key={bar.fill}
            x={bar.x}
            y={bar.y}
            width={3.4}
            height={bar.h}
            rx={1.2}
            fill={bar.fill}
          />
        ))}
      </g>
    </svg>
  );
}

/**
 * Mark plus wordmark, as it appears in the header.
 *
 * "ARCHIVE" drops below lg — the phone header has to fit the nav and the right
 * cluster on the same line, and the mark plus "MCU" already identifies it.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={`flex shrink-0 items-center gap-2 ${className ?? ""}`}>
      <LogoMark size={30} tile={false} className="shrink-0" />
      <span className="font-display text-base leading-none tracking-wide uppercase">
        <span className="text-bone">MCU</span>{" "}
        <span className="hidden text-mist lg:inline">Archive</span>
      </span>
    </span>
  );
}
