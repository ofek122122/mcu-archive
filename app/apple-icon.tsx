import { ImageResponse } from "next/og";

import { BRAND, markDataUri } from "@/lib/brand";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * iOS home-screen icon.
 *
 * iOS masks and rounds this itself, so the mark is drawn without its own tile
 * and given breathing room — a rounded tile inside a rounded mask reads as a
 * sticker rather than an app.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: BRAND.void,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={markDataUri({ size: 124, tile: false })} width={124} height={124} alt="" />
      </div>
    ),
    size,
  );
}
