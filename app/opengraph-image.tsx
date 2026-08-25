import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { BRAND, markDataUri, PHASE_BARS } from "@/lib/brand";
import { MOVIES } from "@/lib/movies";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "MCU Archive — a tracker for every Marvel film and series";

/**
 * The link preview, on every platform that reads OpenGraph or Twitter cards.
 *
 * Counts come from the catalog rather than being typed in, so a title added to
 * `lib/catalog-*.ts` updates the card on the next build instead of quietly
 * making it wrong.
 */
export default async function OpengraphImage() {
  const films = MOVIES.filter((movie) => movie.kind !== "series").length;
  const series = MOVIES.length - films;

  // The site's own two faces. Satori has no access to the `next/font` pipeline,
  // so they are vendored under assets/ rather than fetched from Google at build
  // time — a network blip should not be able to change how the card looks.
  //
  // Both are needed, not just Anton: Satori falls back to the first font given
  // for any text that does not name one, so shipping Anton alone set the whole
  // card, tagline included, in condensed display caps.
  const [anton, barlow] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/Anton-Regular.ttf")),
    readFile(join(process.cwd(), "assets/fonts/Barlow-Medium.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          background: BRAND.void,
          padding: "72px 80px",
        }}
      >
        {/* Phase gradient, as a rule across the top */}
        <div style={{ display: "flex", height: 8, width: "100%" }}>
          {PHASE_BARS.map((bar) => (
            <div key={bar.fill} style={{ flex: 1, background: bar.fill }} />
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={markDataUri({ size: 96, tile: false })} width={96} height={96} alt="" />
            {/* Anton for the wordmark and the numbers only — it is a display
                face, and setting it on the whole card would put the tagline in
                condensed all-caps too. */}
            <div style={{ display: "flex", fontSize: 82, letterSpacing: "0.03em", fontFamily: "Anton" }}>
              <span style={{ color: BRAND.bone }}>MCU</span>
              <span style={{ color: BRAND.mist, marginLeft: 22 }}>ARCHIVE</span>
            </div>
          </div>

          <div style={{ display: "flex", fontSize: 34, color: BRAND.mist, lineHeight: 1.35 }}>
            Every Marvel film and series, in release order or in story order.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 40, fontSize: 28 }}>
          <Stat value={MOVIES.length} label="titles" />
          <Stat value={films} label="films" />
          <Stat value={series} label="series" />
          <div style={{ display: "flex", marginLeft: "auto", color: BRAND.mist, fontSize: 24 }}>
            mcuarchive.xyz
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      // Barlow first: it is the default for anything that does not ask for Anton.
      fonts: [
        { name: "Barlow", data: barlow, weight: 500, style: "normal" },
        { name: "Anton", data: anton, weight: 400, style: "normal" },
      ],
    },
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
      <span style={{ color: BRAND.arc, fontSize: 48, fontFamily: "Anton" }}>{value}</span>
      <span style={{ color: BRAND.mist, textTransform: "uppercase", letterSpacing: "0.12em" }}>
        {label}
      </span>
    </div>
  );
}
