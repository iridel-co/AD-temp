"use client"

import { useLayoutEffect, useState, type RefObject } from "react"

export type NavbarTheme = "light" | "dark"

/**
 * Reads which section currently sits behind the sticky top bar and returns
 * `"dark"` / `"light"` so the bar can flip its background, logo, links and CTA
 * to match — same convention as HND-Design-DEMO's `useNavbarTheme`.
 *
 * A section opts into the dark treatment with `data-navbar-theme="dark"` on any
 * element that covers the strip behind the bar (normally the section root).
 * Anything else — and the default — is `"light"`.
 *
 * Hit-tests (`elementsFromPoint`) rather than a geometric rect scan: the
 * landing hero is `sticky top-0` and never unpins, so a rect scan would "see"
 * it through every opaque plane covering it and read dark forever.
 * `elementsFromPoint` is z-order/occlusion aware, so a covering plane wins —
 * as long as that plane is itself tagged (the walk stops at the first tagged
 * ancestor of the topmost hit, so an *untagged* cover plane over a tagged hero
 * resolves to the hero underneath).
 *
 * `initial` is the first-paint guess (before the effect runs / on SSR) — pass
 * `"dark"` when the bar is born over a dark hero to avoid a light flash.
 */
export function useNavbarTheme(
  barRef: RefObject<HTMLElement | null>,
  initial: NavbarTheme = "light"
): NavbarTheme {
  const [theme, setTheme] = useState<NavbarTheme>(initial)

  // Layout effect (not a plain effect): the hit-test result must land before
  // the browser paints. On a reload where the scroll position is restored
  // mid-page (common — browsers preserve scroll on refresh), a plain effect
  // lets the very first frame paint with `initial`'s guess before correcting
  // a tick later, which flashes the wrong bar color for a frame.
  useLayoutEffect(() => {
    const bar = barRef.current
    if (!bar || typeof document.elementsFromPoint !== "function") return

    let frame = 0
    const read = () => {
      frame = 0
      const rect = bar.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      const x = Math.round(rect.left + rect.width / 2)
      // Sample 1px *below* the bar's bottom edge — this bar reserves its own
      // flow space (it doesn't float transparently over the section below),
      // so content starts exactly at `rect.bottom` and never overlaps the bar
      // itself. Sampling `rect.bottom - 1` landed back inside the bar's own
      // box instead, whose only ancestors above the tagged section are
      // untagged (body/html) — that always fell through to the default
      // "light", which is why scrolling down then back to the top flipped an
      // initially-dark bar (e.g. About, dark hero) white on arrival.
      const y = Math.round(rect.bottom + 1)
      // Bar not on screen yet (e.g. the landing bar still parked at the hero's
      // bottom edge) — keep the caller's `initial` guess until it reaches the top.
      if (y < 0 || y > window.innerHeight) return

      let next: NavbarTheme = "light"
      for (const el of document.elementsFromPoint(x, y)) {
        if (el === bar || bar.contains(el)) continue
        const marked = (el as HTMLElement).closest<HTMLElement>(
          "[data-navbar-theme]"
        )
        if (marked) {
          next = marked.dataset.navbarTheme === "dark" ? "dark" : "light"
          break
        }
      }
      setTheme((prev) => (prev === next ? prev : next))
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(read)
    }

    read()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [barRef])

  return theme
}
