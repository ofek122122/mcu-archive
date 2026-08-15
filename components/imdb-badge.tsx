import { Star } from "lucide-react";

/**
 * Authentic IMDb chip: the gold wordmark block followed by a dark rating
 * segment with a gold star. Renders as a plain badge or, with `href`, as an
 * external link.
 */
export function ImdbBadge({
  rating,
  href,
  size = "sm",
  label,
}: {
  rating: number | null;
  href?: string;
  size?: "sm" | "md";
  label?: string;
}) {
  const compact = size === "sm";

  const content = (
    <>
      <span
        className={`bg-gold font-display leading-none tracking-tight text-black ${
          compact ? "px-1.5 py-[3px] text-[11px]" : "px-2 py-1 text-sm"
        }`}
      >
        IMDb
      </span>
      <span
        className={`flex items-center gap-1 bg-black/75 font-mono font-bold text-bone ${
          compact ? "px-1.5 py-[3px] text-[10px]" : "px-2 py-1 text-xs"
        }`}
      >
        <Star className={compact ? "size-2.5" : "size-3"} fill="#f5c518" stroke="#f5c518" />
        {rating === null ? "NR" : rating.toFixed(1)}
      </span>
    </>
  );

  const shell = `inline-flex items-center overflow-hidden rounded-[3px] shadow-[0_2px_10px_rgba(0,0,0,0.55)]`;

  if (!href) {
    return (
      <span
        className={shell}
        aria-label={rating === null ? "Not yet rated on IMDb" : `IMDb rating ${rating} out of 10`}
      >
        {content}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label ?? "View on IMDb"}
      className={`${shell} transition-transform duration-200 hover:scale-105 hover:shadow-[0_2px_16px_rgba(245,197,24,0.45)]`}
    >
      {content}
    </a>
  );
}
