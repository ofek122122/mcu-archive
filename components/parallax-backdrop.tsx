"use client";

import { useEffect, useRef, type CSSProperties } from "react";

/**
 * Three-layer parallax backdrop.
 *
 *   deep  — cosmic starfield, drifts slowest
 *   mid   — nebulae, dimensional rifts and floating embers, responds to velocity
 *   near  — foreground dust and vignette
 *
 * Everything is `position: fixed`, so the backdrop contributes no page height:
 * it cannot cause layout shift or horizontal overflow. A single rAF-throttled
 * scroll listener writes two custom properties; the layers themselves are pure
 * CSS transforms and stay on the compositor.
 */

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

    const tick = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;

      // Smooth toward the current delta. Once scrolling stops delta is 0, so
      // this same line decays velocity back to rest over ~0.5s — without the
      // decay pass the velocity-driven layers would stay permanently offset.
      velocity += (delta - velocity) * 0.2;
      if (Math.abs(velocity) < 0.05) velocity = 0;

      root.style.setProperty("--scroll", y.toFixed(1));
      root.style.setProperty("--velocity", velocity.toFixed(2));

      // Keep animating while there is momentum left to bleed off.
      frame = velocity === 0 ? 0 : requestAnimationFrame(tick);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    tick();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ "--scroll": "0", "--velocity": "0" } as CSSProperties}
    >
      {/* ── Deep: cosmic void + starfields ──────────────────────────────── */}
      <div className="plx-deep absolute -inset-y-[15%] inset-x-0">
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,#0b1030_0%,#05050d_55%,#03030a_100%)]" />
        <div className="starfield-far absolute inset-0 opacity-70" />
        <div className="starfield-mid animate-twinkle absolute inset-0 opacity-80" />
      </div>

      {/* ── Mid: nebulae, rifts, embers ─────────────────────────────────── */}
      <div className="plx-mid absolute -inset-y-[20%] inset-x-0">
        {/* Nebula clouds */}
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
            background:
              "radial-gradient(circle, rgba(255,61,94,0.18) 0%, rgba(255,61,94,0) 70%)",
            animation: "nebula-breathe 29s ease-in-out infinite 8s",
          }}
        />

        {/* Dimensional rifts — slow conic sweeps, hidden on small screens */}
        <div
          className="absolute top-[12%] right-[8%] hidden size-[26rem] rounded-full opacity-[0.18] blur-[2px] md:block"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgba(169,112,255,0.55) 40deg, transparent 90deg, transparent 180deg, rgba(90,210,244,0.45) 230deg, transparent 300deg)",
            maskImage: "radial-gradient(circle, transparent 52%, #000 62%, #000 76%, transparent 84%)",
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
            maskImage: "radial-gradient(circle, transparent 55%, #000 64%, #000 78%, transparent 86%)",
            WebkitMaskImage:
              "radial-gradient(circle, transparent 55%, #000 64%, #000 78%, transparent 86%)",
            animation: "rift-spin 95s linear infinite reverse",
          }}
        />

        {/* Floating embers / cosmic dust */}
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
                animation: `float-drift ${ember.duration}s ease-in-out ${ember.delay}s infinite`,
                "--ember-dx": ember.dx,
                "--ember-peak": String(ember.peak),
              } as CSSProperties
            }
          />
        ))}
      </div>

      {/* ── Near: bright foreground stars + vignette ────────────────────── */}
      <div className="plx-near absolute -inset-y-[25%] inset-x-0">
        <div className="starfield-near absolute inset-0 opacity-60" />
      </div>

      {/* Static vignette — not parallaxed, keeps edges anchored */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_50%,transparent_40%,rgba(2,2,6,0.75)_100%)]" />
    </div>
  );
}
