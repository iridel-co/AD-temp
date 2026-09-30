"use client"

import { useEffect, useRef } from "react"

/**
 * Animated mesh-gradient texture for brand-red CTA sections that aren't the
 * landing page ("Bloom Field" style, ported from the 21st.dev "Orange
 * gamification" gradient but recolored to the site's actual brand red
 * instead of orange). Four radial blobs drift on independent static phases
 * so the field never repeats identically, layered under an SVG grain
 * texture. Render as an absolutely-positioned first child of a
 * `relative overflow-hidden` section/wrapper — it fills its parent and sits
 * behind the section's real content (give the content `relative z-10`).
 */

const TWO_PI = Math.PI * 2

// Deterministic per-blob phase, hashed once from a fixed seed — never
// re-hashed per frame, so motion stays continuous instead of flickering.
function seededPhase(seed: number) {
  const x = Math.sin(seed) * 43758.5453
  return (x - Math.floor(x)) * TWO_PI
}

type Blob = {
  cx: number
  cy: number
  radius: number
  color: string
  pX: number
  pY: number
}

const BLOBS: Blob[] = [
  {
    cx: 66.94,
    cy: 46.43,
    radius: 76.1,
    color: "152, 15, 9", // deep crimson (brand)
    pX: seededPhase(3.1),
    pY: seededPhase(7.4),
  },
  {
    cx: 34.69,
    cy: 66.31,
    radius: 50.9,
    color: "199, 51, 34", // ember
    pX: seededPhase(5.2),
    pY: seededPhase(1.8),
  },
  {
    cx: 48.93,
    cy: 19.32,
    radius: 67,
    color: "224, 66, 28", // flame-red
    pX: seededPhase(9.6),
    pY: seededPhase(4.3),
  },
  {
    cx: 80.23,
    cy: 87.54,
    radius: 41.1,
    color: "152, 15, 9", // deep crimson (brand)
    pX: seededPhase(2.7),
    pY: seededPhase(6.1),
  },
]

const GRAIN_LAYER =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.28'/%3E%3C/svg%3E\")"

function buildBackgroundImage(ph: number) {
  const amt = 0.4
  const layers = BLOBS.map((b) => {
    const dx = (Math.sin(ph * 0.55 + b.pX) - Math.sin(b.pX)) * 14 * amt
    const dy = (Math.sin(ph * 0.43 + b.pY) - Math.sin(b.pY)) * 14 * amt
    const cx = b.cx + dx
    const cy = b.cy + dy
    return (
      `radial-gradient(circle at ${cx}% ${cy}%, ` +
      `rgba(${b.color}, 1) 0%, ` +
      `rgba(${b.color}, 0.844) ${b.radius * 0.25}%, ` +
      `rgba(${b.color}, 0.5) ${b.radius * 0.5}%, ` +
      `rgba(${b.color}, 0.156) ${b.radius * 0.75}%, ` +
      `rgba(${b.color}, 0) ${b.radius}%)`
    )
  })
  return [GRAIN_LAYER, ...layers].join(", ")
}

// Computed at render time (pure math, no window access) so the section is
// never blank before hydration or the first animation frame — SSR renders
// the same t=0 frame the rAF loop would draw next.
const INITIAL_BACKGROUND_IMAGE = buildBackgroundImage(0)

export function BloomFieldBackground() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return
    }

    let raf = 0
    const start = performance.now()
    const loop = (now: number) => {
      const t = (now - start) / 1000
      const ph = t * 1.0
      el.style.backgroundImage = buildBackgroundImage(ph)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundColor: "#980F09",
        backgroundImage: INITIAL_BACKGROUND_IMAGE,
        backgroundSize: "120px 120px, auto, auto, auto, auto",
        backgroundBlendMode: "overlay, normal, normal, normal, normal",
      }}
    />
  )
}
