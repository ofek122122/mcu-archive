"use client";

import { useEffect, useRef, type CSSProperties } from "react";

/**
 * Multi-layer parallax backdrop.
 *
 *   deep   — static cosmic gradient (a smooth radial; motion is imperceptible)
 *   stars  — three tiling starfields, each looping on its own tile size
 *   dust   — drifting embers, looping on viewport height
 *   drift  — nebulae and dimensional rifts, bounded travel
 *
 * ── Why the offsets are computed in JS ──────────────────────────────────────
 * Layers that paint a *background* (the starfields) cannot simply be translated
 * by `scroll * rate`: on a long page that offset grows past the element and
 * exposes a hard edge. Instead each starfield offset is taken modulo its own
 * tile size, so it loops seamlessly and the parallax rate can be as strong as
 * we like without ever revealing an edge.
 *
 * Layers that only hold positioned decoration (nebulae, rifts) have no
 * background and therefore no edge to reveal — but at a strong rate they would
 * scroll out of view for good, so their travel is bounded instead.
 *
 * Everything is `position: fixed`, so the backdrop contributes no page height:
 * it cannot cause layout shift or horizontal overflow. One rAF-throttled
 * listener writes the custom properties; the layers are pure CSS transforms.
 */

/** Starfield tile sizes — must match the background-size in globals.css. */
const TILE_FAR = 300;
const TILE_MID = 420;
const TILE_NEAR = 640;

/** Parallax rates, as a fraction of scroll distance. */
const RATE = {
  far: 0.15,
  mid: 0.32,
  near: 0.55,
  dust: 0.45,
  drift: 0.12,
};

/** Mobile GPUs get a shallower budget — same effect, less overdraw per frame. */
const MOBILE_SCALE = 0.45;

/** How far the nebulae may travel, as a fraction of viewport height. */
const MAX_DRIFT = 0.7;

/** Deterministic ember placements — no Math.random, so SSR and CSR agree. */
const EMBERS = [
  { left: "6%", top: "18%", size: 3, delay: 0, duration: 15, dx: "18px", color: "#5ad2f4", peak: 0.7 },
  { left: "14%", top: "62%", size: 2, delay: 3.5, duration: 19, dx: "-22px", color: "#a970ff", peak: 0.55 },
  { left: "23%", top: "34%", size: 4, delay: 7, duration: 17, dx: "26px", color: "#ff3d5e", peak: 0.5 },
  { left: "31%", top: "80%", size: 2, delay: 1.5, duration: 21, dx: "12px", color: "#5ad2f4", peak: 0.65 },
  { left: "39%", top: "12%", size: 3, delay: 9, duration: 16, dx: "-16px", color: "#f5c518", peak: 0.45 },
  { left: "47%", top: "52%", size: 2, delay: 5, duration: 23, dx: "20px", color: "#a970ff", peak: 0.6 },
  { left: "55%", top: "26%", size: 4, delay: 12, duration: 18, dx: "-28px", color: "#5ad2f4", peak: 0.5 },
  { left: "62%", top: "72%", size: 2, delay: 2.5, duration: 20, dx: "14px", color: "#ff3d5e", peak: 0.65 },
  { left: "69%", top: "40%", size: 3, delay: 8, duration: 22, dx: "-18px", color: "#f5c518", peak: 0.4 },
  { left: "76%", top: "88%", size: 2, delay: 4, duration: 17, dx: "24px", color: "#a970ff", peak: 0.6 },
  { left: "83%", top: "22%", size: 3, delay: 10.5, duration: 19, dx: "-12px", color: "#5ad2f4", peak: 0.55 },
  { left: "90%", top: "58%", size: 2, delay: 6, duration: 24, dx: "16px", color: "#ff3d5e", peak: 0.5 },
  { left: "96%", top: "36%", size: 3, delay: 13, duration: 18, dx: "-20px", color: "#a970ff", peak: 0.45 },
  { left: "44%", top: "94%", size: 2, delay: 11, duration: 21, dx: "22px", color: "#f5c518", peak: 0.5 },
] as const;

export function ParallaxBackdrop() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let lastY = window.scrollY;
    let velocity = 0;
    let viewport = window.innerHeight;
    let scale = window.matchMedia("(max-width: 768px)").matches ? MOBILE_SCALE : 1;

    // Re-evaluate on resize so a rotated phone or a resized window picks up the
    // right budget without a reload.
    const onResize = () => {
      viewport = window.innerHeight;
      scale = window.matchMedia("(max-width: 768px)").matches ? MOBILE_SCALE : 1;
      if (!frame) frame = requestAnimationFrame(tick);
    };

    /** Loop an offset within one tile so the layer never runs out. */
    const loop = (distance: number, tile: number) => -((distance % tile) + tile) % tile;

    const tick = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;

      // Smooth toward the current delta. Once scrolling stops delta is 0, so
      // this same line decays velocity back to rest over ~0.5s — without the
      // decay pass the velocity-driven layers would stay permanently offset.
      velocity += (delta - velocity) * 0.2;
      if (Math.abs(velocity) < 0.05) velocity = 0;

      root.style.setProperty("--sf-far", `${loop(y * RATE.far * scale, TILE_FAR).toFixed(1)}px`);
      root.style.setProperty("--sf-mid", `${loop(y * RATE.mid * scale, TILE_MID).toFixed(1)}px`);
      root.style.setProperty("--sf-near", `${loop(y * RATE.near * scale, TILE_NEAR).toFixed(1)}px`);
      root.style.setProperty("--dust", `${loop(y * RATE.dust * scale, viewport).toFixed(1)}px`);
      root.style.setProperty(
        "--drift",
        `${-Math.min(y * RATE.drift * scale, viewport * MAX_DRIFT).toFixed(1)}px`,
      );
      root.style.setProperty("--velocity", velocity.toFixed(2));

      // Keep animating while there is momentum left to bleed off.
      frame = velocity === 0 ? 0 : requestAnimationFrame(tick);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    tick();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={
        {
          "--sf-far": "0px",
          "--sf-mid": "0px",
          "--sf-near": "0px",
          "--dust": "0px",
          "--drift": "0px",
          "--velocity": "0",
        } as CSSProperties
      }
    >
      {/* ── Static cosmic ground ─────────────────────────────────────────── */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,#0b1030_0%,#05050d_55%,#03030a_100%)]" />

      {/* ── Starfields: each loops on its own tile, so any rate is safe ─── */}
      <div
        className="starfield-far plx-star absolute inset-x-0 top-0 opacity-70"
        style={{ height: `calc(100% + ${TILE_FAR}px)`, transform: "translate3d(0,var(--sf-far),0)" }}
      />
      <div
        className="starfield-mid plx-star animate-twinkle absolute inset-x-0 top-0 opacity-80"
        style={{ height: `calc(100% + ${TILE_MID}px)`, transform: "translate3d(0,var(--sf-mid),0)" }}
      />
      <div
        className="starfield-near plx-star absolute inset-x-0 top-0 opacity-60"
        style={{
          height: `calc(100% + ${TILE_NEAR}px)`,
          transform: "translate3d(0,var(--sf-near),0)",
        }}
      />

      {/* ── Nebulae and rifts: bounded travel, no background to tear ────── */}
      <div className="plx-drift absolute inset-0">
        <div
          className="absolute -top-[10%] -left-[15%] size-[60vw] rounded-full blur-[110px]"
          style={{
            background:
              "radial-gradient(circle, rgba(90,210,244,0.22) 0%, rgba(90,210,244,0) 68%)",
            animation: "nebula-breathe 26s ease-in-out infinite",
          }}
        />
        <div
          className="absolute top-[28%] -right-[12%] size-[52vw] rounded-full blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, rgba(169,112,255,0.22) 0%, rgba(169,112,255,0) 68%)",
            animation: "nebula-breathe 32s ease-in-out infinite 4s",
          }}
        />
        <div
          className="absolute bottom-[2%] left-[24%] size-[58vw] rounded-full blur-[130px]"
          style={{
            background: "radial-gradient(circle, rgba(255,61,94,0.18) 0%, rgba(255,61,94,0) 70%)",
            animation: "nebula-breathe 29s ease-in-out infinite 8s",
          }}
        />

        <div
          className="absolute top-[12%] right-[8%] hidden size-[26rem] rounded-full opacity-[0.18] blur-[2px] md:block"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgba(169,112,255,0.55) 40deg, transparent 90deg, transparent 180deg, rgba(90,210,244,0.45) 230deg, transparent 300deg)",
            maskImage:
              "radial-gradient(circle, transparent 52%, #000 62%, #000 76%, transparent 84%)",
            WebkitMaskImage:
              "radial-gradient(circle, transparent 52%, #000 62%, #000 76%, transparent 84%)",
            animation: "rift-spin 70s linear infinite",
          }}
        />
        <div
          className="absolute bottom-[18%] left-[4%] hidden size-[19rem] rounded-full opacity-[0.16] blur-[2px] lg:block"
          style={{
            background:
              "conic-gradient(from 180deg, transparent 0deg, rgba(255,61,94,0.6) 55deg, transparent 120deg, transparent 220deg, rgba(255,176,46,0.4) 280deg, transparent 340deg)",
            maskImage:
              "radial-gradient(circle, transparent 55%, #000 64%, #000 78%, transparent 86%)",
            WebkitMaskImage:
              "radial-gradient(circle, transparent 55%, #000 64%, #000 78%, transparent 86%)",
            animation: "rift-spin 95s linear infinite reverse",
          }}
        />
      </div>

      {/* ── Dust: two stacked copies looping on viewport height ─────────── */}
      <div className="plx-dust absolute inset-x-0 top-0 h-[200vh]">
        <EmberField />
        <EmberField phaseShift={1.7} />
      </div>

      {/* Static vignette — anchors the edges of the frame */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_50%,transparent_40%,rgba(2,2,6,0.75)_100%)]" />
    </div>
  );
}

/** One viewport-tall field of drifting embers. */
function EmberField({ phaseShift = 0 }: { phaseShift?: number }) {
  return (
    <div className="relative h-screen">
      {EMBERS.map((ember, index) => (
        <span
          key={index}
          className="absolute rounded-full"
          style={
            {
              left: ember.left,
              top: ember.top,
              width: `${ember.size}px`,
              height: `${ember.size}px`,
              backgroundColor: ember.color,
              boxShadow: `0 0 ${ember.size * 4}px ${ember.size}px ${ember.color}55`,
              animation: `float-drift ${ember.duration}s ease-in-out ${ember.delay + phaseShift}s infinite`,
              "--ember-dx": ember.dx,
              "--ember-peak": String(ember.peak),
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
