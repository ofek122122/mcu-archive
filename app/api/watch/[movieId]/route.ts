import { NextResponse } from "next/server";

import { detectRegion } from "@/lib/region";
import { getWatchAvailability, watchProvidersConfigured } from "@/lib/watch-providers";

/**
 * Where-to-watch for one title.
 *
 * A route handler rather than server-rendering it into the page: availability
 * is only needed once someone opens a title's details, and pre-fetching it for
 * all 131 would be 131 TMDB calls per page load to answer a question nobody
 * asked. The modal fetches this when it opens; Redis absorbs the repeats.
 *
 * The region defaults to the caller's geo-IP country and can be overridden with
 * ?region= when the viewer picks a different one.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ movieId: string }> },
) {
  if (!watchProvidersConfigured()) {
    return NextResponse.json({ configured: false, availability: null });
  }

  const { movieId } = await params;
  const requested = new URL(request.url).searchParams.get("region");

  const region =
    requested && /^[A-Za-z]{2}$/.test(requested)
      ? requested.toUpperCase()
      : await detectRegion();

  const availability = await getWatchAvailability(movieId, region);

  return NextResponse.json(
    { configured: true, availability },
    {
      // Availability is already cached in Redis for 6h; this lets the browser
      // and the CDN skip the round trip entirely for a short while.
      headers: { "Cache-Control": "private, max-age=900" },
    },
  );
}
