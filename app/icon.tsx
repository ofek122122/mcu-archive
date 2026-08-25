import { ImageResponse } from "next/og";

import { BRAND, markDataUri } from "@/lib/brand";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Browser-tab icon, rasterised from the same geometry the header renders.
 *
 * Generated rather than checked in as a binary so the mark has one definition:
 * edit lib/brand.ts and the favicon follows on the next build.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: BRAND.void,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={markDataUri({ size: 32, tile: true })} width={32} height={32} alt="" />
      </div>
    ),
    size,
  );
}
