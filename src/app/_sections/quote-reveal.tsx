"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion"
import { useReducedMotionSafe } from "@/app/_lib/use-reduced-motion-safe"

/**
 * Quote-reveal transition — sits between <HeroEditorial /> and the content plane.
 *
 * As you scroll past the hero, this opaque white panel rides UP over the (now
 * held) hero like a video transition, then pins. While pinned, the belief line
 * writes itself in word by word inside a giant faint quotation mark, each
 * word's solid copy fading up over a ghost as scroll progress crosses its
 * slice. A short hold on the last words, then the panel releases and the rest
 * of the page scrolls up as before.
 *
 * Mechanism is pure CSS sticky + a scroll-linked opacity per word — no JS pin,
 * no position state-machine (cf. tasks/lessons.md 2026-08-09 / 2026-08-27). The
 * hero is made `sticky top-0` in hero-editorial.tsx so it stays put underneath
 * while this fully-opaque sheet covers it.
 */

// The opening quotation mark the user dropped in. Painted through a CSS mask off
// the real file so it stays a single source of truth and can still be tinted /
// scaled freely. Sits huge and faint behind the words.
const QUOTE_MARK_SRC = "/images/icons/quote-single-left-svgrepo-com.svg"

// Same deep maroon `--brand` used everywhere else on the site (buttons, nav
// active state, etc.) — not the brighter `--brand-accent`, so this page reads
// consistently with the rest of the site's red.
const ACCENT_CLASS = "text-brand"

// Hand-broken so each line lands on a meaning boundary rather than wherever the
// text happens to run out of room. A leading "^" marks a word for the accent —
// per-occurrence, not per-word-string: the people -> companies -> country
// ladder climbs on "better people" / "better companies" / "better country",
// but the *second* "better companies" (the hinge restating the first line's
// output as the next line's subject) stays plain white.
const LINES = [
  "^Better ^people,",
  "lead to",
  "^better ^companies.",
  "And better companies",
  "contribute to a",
  "^better ^country.",
] as const

const WORDS = LINES.map((line) =>
  line.split(" ").map((raw) => ({
    text: raw.replace(/^\^/, ""),
    accent: raw.startsWith("^"),
  }))
)
const WORD_COUNT = WORDS.reduce((n, w) => n + w.length, 0)
// First flat word index of each line, so the reveal slices stay in reading order.
const LINE_OFFSET = WORDS.reduce<number[]>((acc, w, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + WORDS[i - 1].length)
  return acc
}, [])

// Total scroll track. Minus one viewport = the pinned distance the reveal + hold
// play across. Kept fairly short so the beat still reads as a video-transition
// wipe, not a long scrub. Desktop gets a touch more track than mobile — a mouse
// wheel/trackpad covers a given vh faster than a thumb does, so the same track
// length reads shorter on desktop; nudging it up there keeps the reveal pacing
// roughly even across input types. Applied via Tailwind's `sm:` breakpoint
// (see the `TRACK_HEIGHT_CLASS` className below) rather than a single `vh`
// value, per the mobile-first-breakpoints lesson (no `max-[Npx]:` overrides).
const TRACK_HEIGHT_CLASS = "h-[145vh] sm:h-[165vh]"

// Reveal window inside the pinned range: ~5% lead-in before the first word, all
// words solid by ~85%, the last ~15% is a short hold before the panel releases.
const LEAD_IN = 0.05
const SPAN = 0.8

const LINE = "flex basis-full flex-wrap justify-start gap-x-[0.28em]"

// Quote-glyph aspect once it's stretched to fill its box (see the mask-size
// comment below) — the box is wider than the SVG's own 10.5/16.5 viewBox.
const QUOTE_MARK_RATIO = 15 / 16.5

// Position/size for both marks, as CSS custom properties. Defined once on the
// shared pinned-box wrapper (the `<section>` in the reduced branch, the
// `sticky` div in the motion branch) — NOT inside <Backdrop /> — so both marks
// resolve against the same box.
//
// q2 is placed as a FRACTION OF q1's own box (`--q2kx` / `--q2ky`), never as a
// standalone `vw`/`%` pair. The old form put q1 on a `vh`-driven height and q2
// on a `vw` left offset, so the two drifted independently: on a wide-short
// screen (q1 short, q2 far right) they pulled apart horizontally, and on a very
// tall one they pulled apart vertically — two disconnected stamps instead of
// one overlapping mark. Anchoring q2 inside q1's box (both k's < 1, and kx <
// QUOTE_MARK_RATIO) makes the overlap structural: it holds at every viewport
// because q2's origin is by construction a point inside q1.
// The marks also track the COPY, per band: while the quote sits top-left in a
// stacked frame (through `sm`) the big mark stays pinned near the top; from
// `md`, where the copy is a vertically-centred left column, the mark centres
// on it (`--q1t:45%`) and its size picks up `vw` terms so it scales with the
// column's width rather than with viewport height alone — a height-only mark
// reads enormous behind a 292px column on a tablet and undersized on a wide
// desktop.
//
// `--q1tk` MUST mirror `--q1t` as a plain number (0.45 ⇄ 45%): `--q1t` feeds
// mask-position, where a percentage resolves against (box − image), while q2
// needs that same edge as a length to offset from.
const MARK_VARS =
  "[--q1t:4%] [--q1tk:0.04] [--q1l:2vw] [--q1h:min(94vh,900px)]" +
  " [--q2h:min(54vh,520px)] [--q2kx:0.14] [--q2ky:0.48]" +
  " [--q2l:calc(var(--q1l)_+_var(--q1h)_*_var(--q2kx))]" +
  " [--q2t:calc(var(--q1tk)_*_(100vh_-_var(--q1h))_+_var(--q1h)_*_var(--q2ky))]" +
  " sm:[--q1l:4vw] sm:[--q2kx:0.3] sm:[--q2ky:0.52]" +
  " md:[--q1t:45%] md:[--q1tk:0.45] md:[--q1l:3vw]" +
  " md:[--q1h:min(88vh,78vw,900px)] md:[--q2h:min(52vh,46vw,520px)]" +
  " md:[--q2kx:0.55] md:[--q2ky:0.58]" +
  " lg:[--q1h:min(92vh,70vw,950px)] lg:[--q2h:min(54vh,42vw,560px)]" +
  " 2xl:[--q1h:min(96vh,64vw,1100px)] 2xl:[--q2h:min(56vh,38vw,620px)]"

// Cutout of Adrian (background removed) fixed to the bottom-right corner of
// the pinned viewport. No parallax — it sits still while the words reveal.
// Nudged down and oversized so it eats further into the left side of the
// frame; the bottom overflows past the fold on purpose (the section's
// `overflow-hidden` crops it) so growing it doesn't push it back up.
const MASCOT_SRC = "/images/mascot/quotebg-cutout.webp"
const MASCOT_RATIO = 1080 / 1475

function Mascot() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute right-0 bottom-0 z-0 translate-y-[12vh] md:translate-y-[14vh] lg:translate-y-[20vh] xl:translate-y-[26vh] 2xl:translate-y-[36vh]"
    >
      {/* Two regimes, and both are collision-proof by construction rather
          than by hand-tuned numbers.

          Through `sm` the frame is STACKED (copy above, portrait below), so
          he's sized by WIDTH — free to grow with the viewport, which is what
          keeps him from freezing at one size across 470–767px — and bounded
          by `max-h`, which fixes his top edge at `112vh − max-h`. The copy
          simply has to end above that line; it does, because its own type
          scale carries a `vh` term (see QuotePara).

          From `md` the frame is SIDE-BY-SIDE, so he's sized by HEIGHT with a
          `vw` ceiling on width. QuotePara's width is written against that
          same ceiling and ends ~5–11% inside his box — which is dead space:
          the cutout's alpha is transparent for the left 20% of its frame
          through the torso band (34% at the head), so he reads as reaching
          further left, past the copy, without a pixel of him touching it.

          From `lg` the heights run past 100vh (112 → 122) because on a normal
          laptop/desktop aspect he is HEIGHT-bound, not width-bound — the `vw`
          ceiling never binds there, so height is the only lever that makes him
          larger and pushes his left edge further across the frame. The paired
          `translate-y` is what keeps that from driving his head up under the
          fixed navbar — it holds his top edge at ~8vh through `xl`, and drops
          him to ~14vh at `2xl`, where a 1080p frame is tall enough that the
          higher seat left too little air above him. Size is set by height
          alone, so the translate only ever changes where he sits, never how
          big he is; the `vw` ceilings still guard the tall-screen case where
          width does bind. */}
      <div
        className="relative max-h-[62vh] w-[88vw] sm:max-h-[68vh] md:h-[92vh] md:max-h-none md:w-auto md:max-w-[64vw] lg:h-[112vh] lg:max-w-[62vw] xl:h-[118vh] 2xl:h-[122vh] 2xl:max-w-[52vw]"
        style={{ aspectRatio: MASCOT_RATIO }}
      >
        <Image
          // Decorative: the section this repeats from (the hero, seconds
          // above it in scroll order) already carries the real alt text for
          // this photo, and the wrapper's `aria-hidden` above hides this one
          // from the accessibility tree regardless — an `alt` string here
          // would be dead weight, never reachable by AT.
          src={MASCOT_SRC}
          alt=""
          fill
          // Not `priority`: this is the SECOND section on the page, entirely
          // off-screen at load behind a 145–165vh hero that already spends
          // two `priority` images of its own — a third eager/preloaded fetch
          // here would only contend with the hero's actual LCP candidates.
          sizes="(min-width: 1536px) 52vw, (min-width: 1024px) 62vw, (min-width: 768px) 64vw, 88vw"
          className="object-contain object-bottom-right"
        />
      </div>
    </div>
  )
}

/**
 * White ground + the oversized quotation marks.
 *
 * Composition follows the reference: the primary mark is pinned to the
 * upper-left, tall enough that the quote copy (see <QuotePara />) sits over
 * its top third while the bowl + tail curve down and right below the words.
 * A second, smaller mark overlaps it down-and-right and deliberately off its
 * axis (neither top nor left aligned to the first) — two stamps, not one
 * scaled copy, and it's fine for it to run off the pinned box; `overflow-
 * hidden` above crops it.
 *
 * Both marks are painted by ONE flat translucent-black layer, masked by the
 * *union* of the two glyph shapes (CSS multi-layer mask, default `mask-
 * composite: add`) rather than two stacked semi-transparent divs. Two
 * separate divs each at some opacity double up wherever they overlap — reads
 * as a Venn diagram, not two marks. One paint layer has no "wherever they
 * overlap" case: it's a single flat colour across the whole silhouette, which
 * is what "stacked" actually looks like.
 */
function Backdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-black/5"
        style={{
          maskImage: `url(${QUOTE_MARK_SRC}), url(${QUOTE_MARK_SRC})`,
          WebkitMaskImage: `url(${QUOTE_MARK_SRC}), url(${QUOTE_MARK_SRC})`,
          maskRepeat: "no-repeat, no-repeat",
          WebkitMaskRepeat: "no-repeat, no-repeat",
          maskSize: `calc(var(--q1h) * ${QUOTE_MARK_RATIO}) var(--q1h), calc(var(--q2h) * ${QUOTE_MARK_RATIO}) var(--q2h)`,
          WebkitMaskSize: `calc(var(--q1h) * ${QUOTE_MARK_RATIO}) var(--q1h), calc(var(--q2h) * ${QUOTE_MARK_RATIO}) var(--q2h)`,
          maskPosition: "var(--q1l) var(--q1t), var(--q2l) var(--q2t)",
          WebkitMaskPosition: "var(--q1l) var(--q1t), var(--q2l) var(--q2t)",
        }}
      />
    </div>
  )
}

export function QuoteReveal() {
  // Mount-gated: branching the whole return on the raw `useReducedMotion()` blows
  // up hydration for visitors who actually have Reduce Motion on (server always
  // renders the motion branch, their client renders the reduced one). The gate
  // holds the SSR shape until mounted, then switches. (lessons 2026-09-02)
  const reduce = useReducedMotionSafe()
  const container = useRef<HTMLElement>(null)

  // For a `sticky top-0 h-screen` child in a section of height T, this offset
  // pair runs 0 -> 1 exactly across the pinned range (0 as the pin engages, 1 as
  // it releases). Progress holds at 0 through the slide-up, so the panel wipes in
  // blank before any word appears.
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  })

  // Separate tracker for the approach, not the pin: runs 0 -> 1 while the
  // section's top edge travels from the bottom of the viewport up to the top
  // (i.e. exactly the "panel rides up over the hero" beat). Drives the top
  // corner radius so it reads rounded while rising and flattens to a hard
  // edge the instant it reaches the top and pins flush.
  const { scrollYProgress: riseProgress } = useScroll({
    target: container,
    offset: ["start end", "start start"],
  })
  // Elliptical, not circular: a big horizontal-radius / vertical-arc-height
  // split makes the top edge read as a wide dome (oval) rather than just
  // rounded corners. The arc's height (vertical radius) is what collapses to
  // 0 as the panel reaches the top — the horizontal 50% stays fixed so the
  // curve is always a smooth single arc across the whole width, not two
  // separate corner curves.
  const archHeight = useTransform(riseProgress, [0, 1], [160, 0])
  const topRadius = useMotionTemplate`50% 50% 0 0 / ${archHeight}px ${archHeight}px 0 0`

  if (reduce) {
    return (
      <section
        data-navbar-theme="light"
        className={`relative z-10 flex min-h-screen items-center justify-center overflow-hidden bg-white px-6 ${MARK_VARS}`}
      >
        <Backdrop />
        <Mascot />
        <QuotePara>
          {WORDS.map((lineWords, li) => (
            <span key={li} className={LINE}>
              {lineWords.map((word, wi) => (
                <span
                  key={wi}
                  className={word.accent ? ACCENT_CLASS : undefined}
                >
                  {word.text}
                </span>
              ))}
            </span>
          ))}
        </QuotePara>
        <AboutLink />
        <AboutLinkMobile />
      </section>
    )
  }

  return (
    <motion.section
      ref={container}
      data-navbar-theme="light"
      style={{ borderRadius: topRadius }}
      className={`relative z-10 overflow-clip bg-white shadow-[0_-24px_70px_-20px_rgba(0,0,0,0.12)] ${TRACK_HEIGHT_CLASS}`}
    >
      <div
        className={`sticky top-0 flex h-screen items-center justify-center overflow-hidden px-6 ${MARK_VARS}`}
      >
        <Backdrop />
        <Mascot />
        <QuotePara>
          {WORDS.map((lineWords, li) => (
            <span key={li} className={LINE}>
              {lineWords.map((word, wi) => {
                const i = LINE_OFFSET[li] + wi
                const start = LEAD_IN + (i / WORD_COUNT) * SPAN
                const end = start + (1 / WORD_COUNT) * SPAN
                return (
                  <Word
                    key={wi}
                    progress={scrollYProgress}
                    range={[start, end]}
                    accent={word.accent}
                  >
                    {word.text}
                  </Word>
                )
              })}
            </span>
          ))}
        </QuotePara>
        <AboutLink />
        <AboutLinkMobile />
      </div>
    </motion.section>
  )
}

/**
 * Foot of the quote column, sharing QuotePara's left edge so the two read as
 * one left-hand block.
 *
 * It used to anchor to the smaller mark's (q2) corner via `--about-*`. Now
 * that q2 is positioned as a fraction of q1 (see MARK_VARS) that corner sits
 * mid-frame, which put the link over the portrait. Anchoring to the column
 * instead keeps it clear of him by the same guarantee the copy has: the
 * portrait owns the right of the frame, this column owns the left.
 */
function AboutLink() {
  return (
    <Link
      href="/about"
      className={`group absolute bottom-[7vh] left-[5vw] z-10 hidden items-center gap-2 text-xs font-semibold tracking-[0.12em] whitespace-nowrap uppercase transition-colors hover:text-neutral-900 md:inline-flex md:text-sm lg:left-[6vw] xl:left-[7vw] 2xl:left-[8vw] ${ACCENT_CLASS}`}
    >
      More about Adrian
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
    </Link>
  )
}

// The stacked bands (below `md`) put the copy across the top and the portrait
// across the bottom, so there is no free left gutter for <AboutLink />'s
// bottom-left placement — it would land on him. Here it's a pill instead,
// bottom-right, legible over the photo on its own white ground.
function AboutLinkMobile() {
  return (
    <Link
      href="/about"
      className="group absolute right-5 bottom-5 z-20 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-semibold tracking-[0.12em] whitespace-nowrap text-black uppercase transition-colors hover:bg-white/90 md:hidden"
    >
      More about Adrian
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
    </Link>
  )
}

function QuotePara({ children }: { children: React.ReactNode }) {
  // Anchored lower and further right of the mark's top-left corner, so the
  // copy still reads over the mark's body without hugging its very tip.
  //
  // Stacked bands (through `sm`): full-width copy at the top, so it stays as
  // large as it is on a phone instead of being cut down to a narrow column
  // the moment the viewport clears 640px. The `min(…vw,…vh)` inside the clamp
  // is what makes that safe — on a short window the `vh` term shrinks the
  // type so the block still ends above the portrait's top edge, while on a
  // tall phone the `vw` term wins and the mobile size is untouched.
  //
  // Side-by-side bands (`md` and up): left + width are `vw` fractions written
  // against the portrait's `max-w` ceiling in Mascot, landing the copy's right
  // edge just inside his box's transparent left margin — close enough to read
  // as one composition, never close enough to touch him.
  //
  // `lg` and up walk the whole column rightward (5 → 8vw) and up a type step
  // per band as the portrait grows. The clamp's `vh` term is what lets the
  // type get materially bigger without risking the block on a short window:
  // the `vw` term sets the ambition, the `vh` term keeps a 16:9 laptop honest.
  // Every right edge here (left + width) still clears `100vw − 0.8 × ceiling`,
  // the point where his opaque pixels start.
  return (
    <p className="absolute top-[14%] left-[5vw] z-10 flex w-[min(92vw,40rem)] flex-wrap justify-start gap-y-1 text-left font-serif text-[clamp(1.5rem,min(6.4vw,4.6vh),3.35rem)] leading-[1.14] tracking-[-0.02em] text-neutral-900 sm:top-[8%] md:top-1/2 md:w-[40vw] md:-translate-y-1/2 md:text-[clamp(1.5rem,min(4.6vw,5.4vh),3.6rem)] lg:left-[6vw] lg:w-[40vw] lg:text-[clamp(1.6rem,min(4.8vw,5.8vh),4rem)] xl:left-[7vw] xl:text-[clamp(1.8rem,min(4.6vw,6vh),4.4rem)] 2xl:left-[8vw] 2xl:w-[40vw] 2xl:text-[clamp(2rem,min(4.2vw,6.4vh),5rem)]">
      {children}
    </p>
  )
}

function Word({
  children,
  progress,
  range,
  accent,
}: {
  children: string
  progress: MotionValue<number>
  range: [number, number]
  accent?: boolean
}) {
  // Function form on purpose: the (input, inputRange, outputRange) form routes
  // through framer's native "accelerate" scroll-timeline optimisation, which — with
  // many transforms off one `scrollYProgress` — tents each word back down to 0 by
  // progress 1 instead of holding it solid. The explicit clamp here can't.
  const [s, e] = range
  const opacity = useTransform(progress, (v) => {
    const t = (v - s) / (e - s)
    return t < 0 ? 0 : t > 1 ? 1 : t
  })

  return (
    <span className="relative inline-block">
      {/* Faint ghost so an accent word blooms into red as it resolves.
          `opacity-40`, not the original `opacity-20`: 20% measured ~1.56:1
          against white, well under WCAG's 4.5:1 — a real gap for anyone who
          stops scrolling mid-reveal or lands here via scroll-restoration (a
          `prefers-reduced-motion` visitor never sees this state at all, they
          get full-opacity text immediately). True 4.5:1 needs ~60% opacity,
          which reads as fully revealed and defeats the ghost effect this
          component exists to show — 40% is the honest middle: a real,
          measurable contrast improvement (~1.56:1 → ~2.3:1) without erasing
          the "faint, then resolves" reveal the design is built around. */}
      <span className="opacity-40">{children}</span>
      <motion.span
        aria-hidden
        style={{ opacity }}
        className={
          accent
            ? `${ACCENT_CLASS} absolute top-0 left-0`
            : "absolute top-0 left-0"
        }
      >
        {children}
      </motion.span>
    </span>
  )
}
