"use client"

import { useRef } from "react"
import { gsap, useGSAP, EASE } from "@/app/_lib/gsap"

type CounterProps = {
  to: number
  prefix?: string
  suffix?: string
  /** Count-up duration in seconds. */
  duration?: number
  decimals?: number
  className?: string
}

/**
 * Count-up number that runs once when scrolled into view. The static markup
 * already shows the final value, so SSR and reduced-motion are correct with no
 * extra branch — the effect just rewinds to 0 and eases back up.
 */
export function Counter({
  to,
  prefix = "",
  suffix = "",
  duration = 2,
  decimals = 0,
  className,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)

  const fmt = (n: number) =>
    prefix +
    n.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }) +
    suffix

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return

      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const obj = { v: 0 }
        el.textContent = fmt(0)
        gsap.to(obj, {
          v: to,
          duration,
          ease: EASE,
          onUpdate: () => {
            el.textContent = fmt(obj.v)
          },
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        })
      })
      return () => mm.revert()
    },
    { scope: ref }
  )

  return (
    <span ref={ref} className={className}>
      {fmt(to)}
    </span>
  )
}
