"use client"

import { useRef } from "react"
import { motion, useInView, type Variants } from "framer-motion"
import { useReducedMotionSafe } from "@/app/_lib/use-reduced-motion-safe"
import { cn } from "@/lib/utils"

/**
 * Heading with an animated wavy underline wipe. The text itself stays its solid
 * `textColor` the whole time — nothing fades, dims, or recolours the glyphs at
 * any point. On scroll into view a wavy `--brand` rule the exact width of the
 * text wipes in from the left underneath. Not one-shot: `useInView` runs without
 * `once`, so the underline resets (instantly, while off the top of the viewport)
 * and replays each time the heading scrolls back into view.
 *
 * The underline is revealed with a left-to-right `clip-path` wipe rather than an
 * animated `pathLength`, which under a non-uniform stretch leaves dash artefacts.
 *
 * History: this used to also sweep a `background-clip: text` colour band across
 * the glyphs (adapted from 21st.dev's `dia-text-reveal`). Dropped — transparent
 * `-webkit-text-fill-color` clipped text antialiases greyscale, not subpixel, so
 * the heading always read a shade greyer/lighter than sibling headings painted
 * with a plain `color`, both mid-animation and at rest. A solid fill is the only
 * way to match them exactly. Reduced-motion renders plain text + a static rule.
 */

type TextSweepRevealProps = {
  text: string
  className?: string
  /** Colour of the text. Defaults to the inherited colour. */
  textColor?: string
  delaySeconds?: number
  /** Wipe a smooth wavy underline in from the left underneath, on reveal. */
  underline?: boolean
  underlineDurationSeconds?: number
}

// Shallow double-curve inside a 300x12 box (amplitude well within the box so the
// round caps are never clipped by the wipe). Stretched to the text width by
// `preserveAspectRatio="none"`; the stroke stays even via non-scaling-stroke.
const UNDERLINE_PATH = "M 1,6 Q 75,2 150,6 Q 225,10 299,6"

export function TextSweepReveal({
  text,
  className,
  textColor = "currentColor",
  delaySeconds = 0.1,
  underline = false,
  underlineDurationSeconds = 1.6,
}: TextSweepRevealProps) {
  const ref = useRef<HTMLSpanElement>(null)
  // No top/bottom inset: the heading stays "in view" until it is fully off the
  // top edge, so the underline reset is never seen. Slight bottom inset eases entry.
  const inView = useInView(ref, { margin: "0px 0px -20% 0px" })
  // Mount-gated: `initial` below serialises to an inline `clip-path` on the SSR
  // HTML, so a raw reduced-motion read mismatches hydration. (lessons 2026-09-02)
  const reduceMotion = useReducedMotionSafe()

  const underlineVariants: Variants = {
    // Instant reset while off-screen (top of viewport).
    hidden: { clipPath: "inset(0 100% 0 0)", transition: { duration: 0 } },
    visible: {
      clipPath: "inset(0 0% 0 0)",
      transition: {
        duration: underlineDurationSeconds,
        delay: delaySeconds + 0.15,
        ease: "easeInOut",
      },
    },
  }

  const underlineSvg = underline ? (
    <motion.span
      aria-hidden
      className="text-brand pointer-events-none absolute -bottom-[0.36em] left-0 block h-[0.4em] w-full"
      variants={underlineVariants}
      initial={reduceMotion ? "visible" : "hidden"}
      animate={reduceMotion || inView ? "visible" : "hidden"}
    >
      <svg
        viewBox="0 0 300 12"
        preserveAspectRatio="none"
        className="h-full w-full overflow-visible"
      >
        <path
          d={UNDERLINE_PATH}
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </motion.span>
  ) : null

  return (
    <span className="relative inline-block">
      <span
        ref={ref}
        className={cn("inline-block", className)}
        style={{ color: textColor }}
      >
        {text}
      </span>
      {underlineSvg}
    </span>
  )
}
