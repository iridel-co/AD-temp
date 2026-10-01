"use client"

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react"
import Image from "next/image"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { GlassLock } from "@/app/_components/glass-lock"
import { Reveal } from "@/app/_components/reveal"
import { useReducedMotionSafe } from "@/app/_lib/use-reduced-motion-safe"
import { interestHref } from "@/lib/interest"

/**
 * Corporate Training page only — "Programs we run in-house". A horizontal
 * rail of programme cards from `CORPORATE_PROGRAMMES`.
 *
 * Every card sits under a <GlassLock variant="card"> "Coming soon" veil, the
 * same as the workshop cards: the whole card is one link to the corporate
 * interest form, and the content underneath (title, blurb, "Useful for"
 * bullets) is blurred and inert. Because nothing underneath is reachable,
 * the old hover take-over (widen a card to reveal bullets + an Inquire
 * button) is gone; cards are a fixed-width swipe rail with snap below `lg`
 * and a fixed-width scroll row from `lg`, driven by the arrow buttons.
 *
 * The rail starts at a constant 40px (`lg:pl-10`) at every desktop width,
 * identical to the landing workshops row (`ROW` in `event-cards.tsx`). The
 * header stays on the page's 80rem column like every other heading.
 */

export type ProgramCard = {
  key: string // Specialization.key
  title: string
  blurb: string
  usefulFor: string[]
  image: string
  imageAlt: string
  imagePosition?: string // CSS object-position, default "50% 50%"
}

const RAIL =
  "no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 pb-1 sm:scroll-px-8 sm:px-8 lg:snap-none lg:gap-5 lg:scroll-px-0 lg:pr-0 lg:pb-0 lg:pl-10"

const CARD =
  "relative h-[32rem] w-[82vw] max-w-[22rem] shrink-0 snap-start overflow-hidden rounded-3xl contain-layout lg:h-[34rem] lg:w-[22rem] lg:max-w-none"

const ARROW_BTN =
  "border-border/80 text-foreground flex size-11 items-center justify-center rounded-full border transition-colors hover:border-foreground hover:bg-foreground hover:text-background disabled:cursor-default disabled:opacity-25 disabled:hover:border-border/80 disabled:hover:bg-transparent disabled:hover:text-foreground"

function CarouselArrows({
  edges,
  onNudge,
}: {
  edges: { left: boolean; right: boolean }
  onNudge: (dir: 1 | -1) => void
}) {
  return (
    <div className="hidden items-center gap-2.5 lg:flex">
      <button
        type="button"
        aria-label="Previous programmes"
        onClick={() => onNudge(-1)}
        disabled={!edges.left}
        className={ARROW_BTN}
      >
        <ArrowLeft className="size-5" />
      </button>
      <button
        type="button"
        aria-label="Next programmes"
        onClick={() => onNudge(1)}
        disabled={!edges.right}
        className={ARROW_BTN}
      >
        <ArrowRight className="size-5" />
      </button>
    </div>
  )
}

export function ProgramCarousel({
  items,
  heading,
}: {
  items: ProgramCard[]
  /** Rendered in the header row, left; the desktop arrows sit right of it. */
  heading: ReactNode
}) {
  const reduce = useReducedMotionSafe()

  const railRef = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ left: false, right: false })

  useEffect(() => {
    const el = railRef.current
    if (!el) return
    let raf = 0
    const sync = () => {
      raf = 0
      const { scrollWidth: sw, clientWidth: cw, scrollLeft } = el
      const overflow = sw - cw > 1
      setEdges({
        left: overflow && scrollLeft > 1,
        right: overflow && scrollLeft < sw - cw - 1,
      })
    }
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(sync)
    }
    sync()
    el.addEventListener("scroll", queue, { passive: true })
    const ro = new ResizeObserver(queue)
    ro.observe(el)
    return () => {
      el.removeEventListener("scroll", queue)
      ro.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [items.length])

  const nudge = (dir: 1 | -1) => {
    const el = railRef.current
    if (!el) return
    el.scrollBy({
      left: dir * Math.max(320, el.clientWidth * 0.8),
      behavior: reduce ? "instant" : "smooth",
    })
  }

  const hasOverflow = edges.left || edges.right

  const renderCard = (item: ProgramCard) => (
    <div key={item.key} className={CARD}>
      <GlassLock
        variant="card"
        href={interestHref("corporate")}
        title={item.title}
        className="absolute inset-0 overflow-hidden rounded-[inherit]"
      >
        <Image
          fill
          src={item.image}
          alt={item.imageAlt}
          sizes="(min-width: 1024px) 22rem, 82vw"
          style={{ objectPosition: item.imagePosition ?? "50% 50%" }}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/35 to-black/10" />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 lg:p-8">
          <h3 className="max-w-[15.5rem] text-xl leading-tight font-extrabold tracking-[-0.01em] text-balance text-white lg:text-[1.65rem]">
            {item.title}
          </h3>
          <p className="text-sm leading-relaxed text-white/85">{item.blurb}</p>
          <ul className="space-y-1.5">
            {item.usefulFor.map((b) => (
              <li
                key={b}
                className="flex gap-2.5 text-sm leading-snug text-white/90"
              >
                <Check
                  className="mt-0.5 size-4 shrink-0 text-white/70"
                  aria-hidden
                />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </GlassLock>
    </div>
  )

  return (
    <div>
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="mb-10 flex flex-col gap-6 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
          {/* Two dynamic siblings in one JSX position — the passed-in
              `heading` (owned by the caller) and the conditionally-rendered
              arrows — get reconciled as an array and need explicit keys, or
              React warns "each child in a list should have a unique key". */}
          <Fragment key="heading">{heading}</Fragment>
          {hasOverflow && (
            <CarouselArrows key="arrows" edges={edges} onNudge={nudge} />
          )}
        </div>
      </div>

      <Reveal>
        <div ref={railRef} className={RAIL}>
          {items.map((item) => renderCard(item))}
          <div aria-hidden className="w-px shrink-0 lg:w-8" />
        </div>
      </Reveal>
    </div>
  )
}
