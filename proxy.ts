import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * Clerk session handling.
 *
 * Note the filename: Next.js 16 renamed Middleware to Proxy, so this lives in
 * `proxy.ts` rather than the `middleware.ts` most Clerk guides still show. The
 * exported handler is unchanged.
 *
 * No routes are protected here on purpose. The catalog is public — guests can
 * browse, filter and tick titles, which are held in their browser until they
 * make an account. Every *write* to a real watch list is guarded inside the
 * Server Action instead, which is the only place it actually matters.
 */
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next internals and static files unless they appear in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
