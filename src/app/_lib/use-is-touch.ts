"use client"

import { useEffect, useState } from "react"

/**
 * True on devices with no real hover / no fine pointer — phones, tablets, and
 * the touch half of a hybrid device.
 *
 * Use it to skip pointer-driven behaviour (cursor parallax, hover take-overs,
 * hover-only reveals) rather than relying on mouse events not firing: a tap on
 * a touch screen still synthesises `mouseenter`/`mousemove`, so an ungated
 * handler fires anyway and leaves the effect stuck in its hovered state with no
 * way to leave it.
 *
 * Starts `false` and corrects in an effect, so SSR and the first client render
 * agree (lessons 2026-09-02 — never branch SSR'd markup on a client-only media
 * query). Listens for `change` too: the query can flip on a foldable or when a
 * mouse is attached to a tablet.
 */
export function useIsTouch() {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(hover: none), (pointer: coarse)")
    const sync = () => setIsTouch(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  return isTouch
}
