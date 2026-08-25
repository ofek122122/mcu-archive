/**
 * The MCU Archive mark.
 *
 * Five bars stepping up left to right, sheared forward, in the same colours the
 * progress meter runs through — arc-reactor cyan, titanium teal, infinity
 * violet, quantum red, ember. It is the app's own phase gradient turned into a
 * logo: a slate you work through, in the order the story happens.
 *
 * The shear is what keeps it from reading as a bar chart, and it echoes the
 * `-skew-x-6` the wordmark has always had.
 *
 * Deliberately nothing like Marvel's own red-box wordmark, which is what the
 * old header mark imitated. This is a fan tracker; it should look like itself.
 *
 * One geometry, three consumers: `components/logo.tsx` renders these as JSX,
 * and the icon / apple-icon / OG routes rasterise `markSvg()` through Satori,
 * so the favicon and the header can never drift apart.
 */

export const BRAND = {
  void: "#04040a",
  panel: "#0e0e18",
  bone: "#edebe6",
  mist: "#8a8a9d",
  arc: "#5ad2f4",
} as const;

/** Degrees of forward shear applied to the bar group. */
export const MARK_SKEW = -11;

/** Bars in a 32×32 box, in phase order. */
export const PHASE_BARS: readonly { x: number; y: number; h: number; fill: string }[] = [
  { x: 5.0, y: 19.0, h: 8.0, fill: "#5ad2f4" },
  { x: 9.9, y: 16.5, h: 10.5, fill: "#3fdfd4" },
  { x: 14.8, y: 13.5, h: 13.5, fill: "#a970ff" },
  { x: 19.7, y: 10.0, h: 17.0, fill: "#ff3d5e" },
  { x: 24.6, y: 6.0, h: 21.0, fill: "#ff4f2a" },
];

const BAR_W = 3.4;
const BAR_R = 1.2;

/**
 * The mark as standalone SVG markup.
 *
 * `tile` draws the rounded dark backing — wanted for an app icon, not for the
 * header, where the mark sits on the page's own background.
 */
export function markSvg({ size = 32, tile = true }: { size?: number; tile?: boolean } = {}): string {
  const bars = PHASE_BARS.map(
    (bar) =>
      `<rect x="${bar.x}" y="${bar.y}" width="${BAR_W}" height="${bar.h}" rx="${BAR_R}" fill="${bar.fill}"/>`,
  ).join("");

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">`,
    tile ? `<rect width="32" height="32" rx="7" fill="${BRAND.void}"/>` : "",
    `<g transform="skewX(${MARK_SKEW}) translate(3.2 0)">${bars}</g>`,
    `</svg>`,
  ].join("");
}

/** The same markup as a data URI, for `<img>` inside an ImageResponse. */
export function markDataUri(options?: { size?: number; tile?: boolean }): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(markSvg(options))}`;
}
