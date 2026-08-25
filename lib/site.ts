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

/**
 * Google Search Console ownership token.
 *
 * Committed rather than held in an env var. It is public by design — it ships
 * in the HTML of every page for every visitor to read — and it is not a
 * credential: it proves ownership of *this* property and grants nothing to
 * whoever copies it. Keeping it here means verification cannot quietly break
 * because an environment variable went missing from one deployment.
 *
 * Override with GOOGLE_SITE_VERIFICATION if the property is ever re-created.
 */
export const GOOGLE_SITE_VERIFICATION =
  process.env.GOOGLE_SITE_VERIFICATION ?? "Ba5VT8TlTndk0YWdoBopXTk5Vrj3AVc4OsujHvOkzzY";
