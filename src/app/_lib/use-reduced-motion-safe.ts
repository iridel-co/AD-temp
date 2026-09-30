"use client"

import { useEffect, useState } from "react"
import { useReducedMotion } from "framer-motion"

/**
 * `prefers-reduced-motion`, gated so SSR and the first client render always
 * agree.
 *
 * framer-motion's own `useReducedMotion()` reads `matchMedia`, which is
 * unavailable during SSR — it returns `null` there (so this hook reports
 * `false`) but resolves to the real OS setting on the client's very first
 * render. Branching *rendered markup* (DOM structure, or a `motion` element's
 * `initial` variant, which framer serialises to inline styles on the server)
 * directly on that value therefore crashes hydration for every visitor who
 * actually has Reduce Motion turned on. See tasks/lessons.md 2026-09-02.
 *
 * This returns `false` until after mount, then the true preference — so the
 * reduced-motion branch only swaps in post-hydration, in an effect. Use it
 * anywhere the return value changes what is rendered; the `gsap.matchMedia()`
 * pattern inside `useGSAP`/effects needs no such gate.
 */
export function useReducedMotionSafe(): boolean {
  const preference = useReducedMotion() ?? false
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted && preference
}
