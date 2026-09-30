"use client"

import { useRef, type ReactNode } from "react"
import { gsap, useGSAP, SplitText, EASE, DUR } from "@/app/_lib/gsap"
import { cn } from "@/lib/utils"

type Tag = "h1" | "h2" | "h3" | "h4" | "p"

type SplitRevealProps = {
  children: ReactNode
  as?: Tag
  className?: string
  /** Split granularity for the stagger. */
  by?: "lines" | "words"
  /** ScrollTrigger `start`, default `"top 85%"`. */
  start?: string
  delay?: number
  /** Draw a short maroon accent rule beneath the heading as it enters (DrawSVG). */
  rule?: boolean
}

/**
 * Heading reveal driven by GSAP SplitText — each line (or word) rises from
 * behind a mask on scroll-in, once. Renders a real semantic tag. Split is
 * deferred to `document.fonts.ready` so lines are measured against the loaded
 * webfont, not the fallback (Iridel lessons 2026-08-09). With `rule`, a short
 * accent line draws in underneath via DrawSVG. Reduced-motion users get the
 * plain heading (and a static rule) with no animation.
 */
export function SplitReveal({
  children,
  as: Tag = "h2",
  className,
  by = "lines",
  start = "top 85%",
  delay = 0,
  rule = false,
}: SplitRevealProps) {
  const scope = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const ruleRef = useRef<SVGLineElement>(null)

  useGSAP(
    () => {
      const el = headingRef.current
      if (!el) return

      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        let split: SplitText | undefined
        let tween: gsap.core.Tween | undefined

        document.fonts.ready.then(() => {
          if (!headingRef.current) return
          split = new SplitText(el, {
            type: by === "lines" ? "lines" : "words",
            linesClass: "split-line",
            wordsClass: "split-word",
          })
          // Each `.split-line` clips its own overflow (`overflow: hidden`).
          // With the tight serif leading on headings the glyph descenders
          // (g p q y) paint below the line box and get sheared off. Grow the
          // box down with padding so the descenders fall inside the clip, then
          // pull the same amount back with a negative margin so line spacing
          // and the heading's total height are unchanged.
          if (by === "lines") {
            gsap.set(split.lines, {
              paddingBottom: "0.22em",
              marginBottom: "-0.22em",
            })
          }
          const targets = by === "lines" ? split.lines : split.words
          const st = { trigger: el, start, once: true } as const
          tween = gsap.from(targets, {
            yPercent: 115,
            opacity: 0,
            duration: DUR.base,
            ease: EASE,
            stagger: 0.09,
            delay,
            scrollTrigger: st,
          })
          if (ruleRef.current) {
            gsap.from(ruleRef.current, {
              drawSVG: "0%",
              duration: DUR.base,
              ease: EASE,
              delay: delay + 0.2,
              scrollTrigger: st,
            })
          }
        })

        return () => {
          tween?.kill()
          split?.revert()
        }
      })
      return () => mm.revert()
    },
    { scope }
  )

  const heading = (
    <Tag
      ref={headingRef}
      className={cn("[&_.split-line]:overflow-hidden", className)}
    >
      {children}
    </Tag>
  )

  if (!rule) {
    return (
      <div ref={scope} className="contents">
        {heading}
      </div>
    )
  }

  return (
    <div ref={scope}>
      {heading}
      <svg
        width="88"
        height="4"
        viewBox="0 0 88 4"
        className="text-brand mt-7 block overflow-visible"
        aria-hidden
      >
        <line
          ref={ruleRef}
          x1="2"
          y1="2"
          x2="86"
          y2="2"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  )
}
