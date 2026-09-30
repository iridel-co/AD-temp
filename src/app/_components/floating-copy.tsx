"use client"

import type { ReactNode } from "react"
import Floating, { FloatingElement } from "@/components/ui/parallax-floating"
import { useIsTouch } from "@/app/_lib/use-is-touch"
import { cn } from "@/lib/utils"

/**
 * Gives a block of heading/body copy the same subtle cursor-drift as the
 * gallery wall's photos and reflection text — shared so every page opener
 * that wants it doesn't re-derive the spacer/overlay plumbing by hand.
 *
 * `Floating`'s children are absolutely positioned, so the drifting copy
 * can't itself define this block's layout size — an `invisible aria-hidden`
 * clone (`hidden`) renders first to reserve the real height/width, then the
 * accessible copy (`visible`) renders on top inside `Floating`. Both are
 * plain `ReactNode` (not a render-prop function) because most callers are
 * Server Components composing this Client Component — functions can't cross
 * that boundary as props, elements can. Pass a non-heading tag (e.g. `<p>`)
 * for `hidden` and the real heading tag for `visible` so there's only one
 * heading in the accessible tree.
 */
export function FloatingCopy({
  hidden,
  visible,
  depth = 0.7,
  sensitivity = -0.15,
  className,
}: {
  hidden: ReactNode
  visible: ReactNode
  /** How far the copy drifts relative to the wall's own text tiles (0.6-1). */
  depth?: number
  sensitivity?: number
  className?: string
}) {
  const touch = useIsTouch()

  // No cursor, no drift — and `Floating` reads an absent pointer as position
  // (0, 0), i.e. the top-left corner, which parks every element at a constant
  // offset off its resting spot rather than at rest. On touch, render the copy
  // plainly in normal flow: no spacer clone, no absolute overlay, no rAF loop.
  if (touch) {
    return <div className={className}>{visible}</div>
  }

  return (
    <div className={cn("relative", className)}>
      <div aria-hidden className="invisible">
        {hidden}
      </div>
      <div className="absolute inset-0">
        <Floating sensitivity={sensitivity}>
          <FloatingElement depth={depth} className="inset-0">
            {visible}
          </FloatingElement>
        </Floating>
      </div>
    </div>
  )
}
