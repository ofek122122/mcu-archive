import type { MetadataRoute } from "next";

import { BRAND } from "@/lib/brand";

/**
 * Enough of a manifest to install the archive to a home screen and have it
 * open without browser chrome, in its own colours rather than a white flash.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MCU Archive",
    short_name: "MCU Archive",
    description:
      "Every Marvel film and series, in release order or in story order, with your watch log kept across devices.",
    start_url: "/",
    display: "standalone",
    background_color: BRAND.void,
    theme_color: BRAND.void,
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
