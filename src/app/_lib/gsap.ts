/**
 * Central GSAP setup for the Adrian Ding site.
 *
 * Every animated component imports gsap + plugins + the shared tokens from here
 * so registration happens exactly once. Every plugin below ships free in the
 * standard `gsap` package (no Club GreenSock / paywall since v3.13).
 *
 * Registration is guarded to the client — several plugins touch `window` and
 * would throw during RSC/SSR evaluation. `useGSAP` does the DOM work inside an
 * effect, so components stay SSR-safe.
 */
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SplitText } from "gsap/SplitText"
import { CustomEase } from "gsap/CustomEase"
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin"
import { Draggable } from "gsap/Draggable"
import { InertiaPlugin } from "gsap/InertiaPlugin"
import { Flip } from "gsap/Flip"
import { useGSAP } from "@gsap/react"

if (typeof window !== "undefined") {
  gsap.registerPlugin(
    ScrollTrigger,
    SplitText,
    CustomEase,
    DrawSVGPlugin,
    Draggable,
    InertiaPlugin,
    Flip,
    useGSAP
  )

  // One signature curve for the whole site — a long, quiet editorial ease-out.
  // Registered as a named ease so components just reference the string.
  CustomEase.create("ad-ease", "0.22, 1, 0.36, 1")
  CustomEase.create("ad-ease-io", "0.65, 0, 0.35, 1")
}

/** The site's signature ease (named CustomEase, client-registered above). */
export const EASE = "ad-ease"
/** In/out variant for interactive + step transitions. */
export const EASE_IO = "ad-ease-io"

/** Shared durations (seconds). */
export const DUR = {
  fast: 0.4,
  base: 0.7,
  slow: 1.1,
} as const

/** Distance (px) an element rises into place on a standard reveal. */
export const RISE = 24

/** True when the user has asked for reduced motion. SSR-safe (returns false). */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export {
  gsap,
  ScrollTrigger,
  SplitText,
  CustomEase,
  DrawSVGPlugin,
  Draggable,
  InertiaPlugin,
  Flip,
  useGSAP,
}
