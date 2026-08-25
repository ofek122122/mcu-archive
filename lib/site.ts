/**
 * Where the site lives, for anything that needs an absolute URL — robots,
 * sitemap, canonicals, JSON-LD, the OG card.
 *
 * Previews resolve to their own deployment so a preview's sitemap and
 * canonicals point at the preview rather than quietly at production.
 */
export const SITE_URL =
  process.env.VERCEL_ENV === "production" || !process.env.VERCEL_URL
    ? "https://www.mcuarchive.xyz"
    : `https://${process.env.VERCEL_URL}`;

export const SITE_NAME = "MCU Archive";

export const SITE_DESCRIPTION =
  "Every Marvel film and series — Marvel Studios, Fox, Sony and Marvel Television — in release order or in story order, with your watch log kept across devices.";
