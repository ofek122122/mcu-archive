import "server-only";

import { headers } from "next/headers";

/**
 * Viewer region, used to ask JustWatch "where can *you* watch this".
 *
 * Streaming rights are sold territory by territory, so the answer is different
 * in Israel, the UK and the US. Vercel puts the geo-IP country on every request
 * as `x-vercel-ip-country`, which costs nothing and needs no client permission
 * prompt — unlike the browser geolocation API, which would be both slower and
 * far more intrusive for something this trivial.
 *
 * Falls back to US when the header is absent (local dev, or a request Vercel
 * could not resolve), because it is the region JustWatch covers most densely.
 */
export const DEFAULT_REGION = "US";

/** Regions worth offering in the picker, with the flag shown beside them. */
export const REGIONS: { code: string; label: string; flag: string }[] = [
  { code: "IL", label: "Israel", flag: "🇮🇱" },
  { code: "US", label: "United States", flag: "🇺🇸" },
  { code: "GB", label: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", label: "Canada", flag: "🇨🇦" },
  { code: "AU", label: "Australia", flag: "🇦🇺" },
  { code: "DE", label: "Germany", flag: "🇩🇪" },
  { code: "FR", label: "France", flag: "🇫🇷" },
  { code: "ES", label: "Spain", flag: "🇪🇸" },
  { code: "IT", label: "Italy", flag: "🇮🇹" },
  { code: "NL", label: "Netherlands", flag: "🇳🇱" },
  { code: "BR", label: "Brazil", flag: "🇧🇷" },
  { code: "IN", label: "India", flag: "🇮🇳" },
  { code: "JP", label: "Japan", flag: "🇯🇵" },
  { code: "MX", label: "Mexico", flag: "🇲🇽" },
  { code: "PL", label: "Poland", flag: "🇵🇱" },
  { code: "SE", label: "Sweden", flag: "🇸🇪" },
];

const KNOWN = new Set(REGIONS.map((region) => region.code));

/** The viewer's country from Vercel's geo header, or the default. */
export async function detectRegion(): Promise<string> {
  const country = (await headers()).get("x-vercel-ip-country");
  if (!country) return DEFAULT_REGION;

  const upper = country.toUpperCase();
  // Unlisted countries still work — TMDB keys results by ISO code, and the
  // picker simply will not have a label for it.
  return /^[A-Z]{2}$/.test(upper) ? upper : DEFAULT_REGION;
}

export function regionLabel(code: string): string {
  return REGIONS.find((region) => region.code === code)?.label ?? code;
}

export function regionFlag(code: string): string {
  return REGIONS.find((region) => region.code === code)?.flag ?? "🌍";
}

export function isKnownRegion(code: string): boolean {
  return KNOWN.has(code);
}
