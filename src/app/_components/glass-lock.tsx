import Link from "next/link"
import { ArrowRight, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { interestHref, type Interest } from "@/lib/interest"

type GlassLockProps = {
  /** The original UI, still rendered (blurred, inert) underneath the glass. */
  children: React.ReactNode
  /** CTA goes to interestHref(interest). Omitted → interestHref(). */
  interest?: Interest
  heading?: string
  body?: string
  ctaLabel?: string
  /**
   * panel = heading + body + CTA; chip = lock + "Coming soon", no CTA;
   * card = the whole box is one link to `href`: dark frosted veil, centred
   * lock + "Coming soon", content blurred hard and inert underneath. The
   * wrapper has no `relative`, so pass `absolute inset-0 ...` (or your own
   * position).
   */
  variant?: "panel" | "chip" | "card"
  /** card variant: link target (normally interestHref(...)). */
  href?: string
  /** card variant: accessible name of the single link. */
  label?: string
  /**
   * card variant: "title on the glass". The veil is unchanged, but instead of
   * the centred lock + CTA the card shows a small frosted "Coming soon" pill
   * and this title, crisp, bottom-left. The link's accessible name becomes
   * "<title> — coming soon, get notified" (`label` is ignored). Omitted →
   * the card renders exactly as before.
   */
  title?: string
  /** Heavier blur, for content that must not be readable at all (dates). */
  strong?: boolean
  /** On the outer wrapper (width, radius, margins). */
  className?: string
}

/** Lock in a small frosted circle, then a large tracked "Coming soon". */
function LockBadge({ hoverGroup = false }: { hoverGroup?: boolean }) {
  return (
    <>
      <span
        className={`relative flex size-14 items-center justify-center rounded-full border border-white/40 bg-white/15 text-white shadow-[inset_0_1px_0_0_rgb(255_255_255/0.5),0_12px_30px_-12px_rgb(0_0_0/0.6)] backdrop-blur-xl backdrop-saturate-150 transition-colors duration-300 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-linear-to-br before:from-white/40 before:via-white/5 before:to-transparent motion-reduce:transition-none sm:size-16 ${
          hoverGroup ? "group-hover/glass:bg-white/30" : ""
        }`}
      >
        <Lock className="relative size-6 sm:size-7" aria-hidden="true" />
      </span>
      <span className="text-lg font-semibold tracking-[0.18em] text-white uppercase drop-shadow-[0_1px_8px_rgb(0_0_0/0.5)] sm:text-xl">
        Coming soon
      </span>
    </>
  )
}

/** Titled-card pill: the LockBadge tokens at pill size, lock + tracked label. */
function ComingSoonPill() {
  return (
    <span className="relative inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/15 py-1.5 pr-3 pl-2.5 text-white shadow-[inset_0_1px_0_0_rgb(255_255_255/0.5),0_12px_30px_-12px_rgb(0_0_0/0.6)] backdrop-blur-xl backdrop-saturate-150 transition-colors duration-300 group-hover/glass:bg-white/30 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-linear-to-br before:from-white/40 before:via-white/5 before:to-transparent motion-reduce:transition-none">
      <Lock className="relative size-3.5" aria-hidden="true" />
      <span className="relative text-[0.6875rem] font-semibold tracking-[0.18em] uppercase">
        Coming soon
      </span>
    </span>
  )
}

/**
 * "Liquid glass" lock. The real UI stays rendered underneath, blurred with CSS
 * `filter` (not backdrop-filter, so it survives ancestor opacity/transform from
 * the GSAP <Reveal> wrappers) and `inert`, so it can be seen but never focused
 * or clicked. A frosted card on top says COMING SOON and links to the interest
 * form. Server component: safe to wrap client children.
 */
export function GlassLock({
  children,
  interest,
  heading = "Coming soon",
  body = "Registration opens soon. Join the early-access list and you'll hear first.",
  ctaLabel = "Get notified",
  variant = "panel",
  href,
  label = "Coming soon, get notified",
  title,
  strong = false,
  className,
}: GlassLockProps) {
  if (variant === "card" && title) {
    return (
      <div className={`isolate ${className ?? ""}`}>
        <div
          inert
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 scale-105 blur-[10px] saturate-[.85] select-none"
        >
          {children}
        </div>
        <Link
          href={href ?? interestHref(interest)}
          aria-label={`${title} — coming soon, get notified`}
          className="group/glass focus-visible:ring-brand absolute inset-0 z-10 flex flex-col items-start justify-end gap-3 rounded-[inherit] bg-black/40 bg-linear-to-t from-black/45 via-transparent to-transparent p-6 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.25),inset_0_1px_0_0_rgb(255_255_255/0.5)] backdrop-blur-sm backdrop-saturate-150 outline-none focus-visible:ring-4 focus-visible:ring-inset lg:p-8"
        >
          <ComingSoonPill />
          <span
            aria-hidden="true"
            className={`font-serif leading-[1.08] tracking-[-0.02em] text-balance [overflow-wrap:anywhere] text-white [text-shadow:0_2px_16px_rgb(0_0_0/0.55),0_1px_3px_rgb(0_0_0/0.4)] ${
              // Long titles (the Train the Trainers certification) step down
              // a size so they stay a readable block, not five or six lines.
              title.length > 40
                ? "text-[1.375rem] lg:text-[1.625rem]"
                : "text-[1.75rem] lg:text-[2.125rem]"
            }`}
          >
            {title}
          </span>
        </Link>
      </div>
    )
  }

  if (variant === "card") {
    return (
      <div className={`isolate ${className ?? ""}`}>
        <div
          inert
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 scale-105 blur-[10px] saturate-[.85] select-none"
        >
          {children}
        </div>
        <Link
          href={href ?? interestHref(interest)}
          aria-label={label}
          className="group/glass focus-visible:ring-brand absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-[inherit] bg-black/40 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.25),inset_0_1px_0_0_rgb(255_255_255/0.5)] backdrop-blur-sm backdrop-saturate-150 outline-none focus-visible:ring-4 focus-visible:ring-inset sm:gap-3"
        >
          <LockBadge hoverGroup />
          <span
            aria-hidden="true"
            className="bg-brand text-brand-foreground shadow-brand/30 group-hover/glass:bg-brand/90 mt-1 inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-semibold shadow-lg transition-all duration-300 group-hover/glass:-translate-y-0.5 group-hover/glass:shadow-xl motion-reduce:transition-none sm:h-10 sm:px-5 sm:text-sm"
          >
            Get notified
            <ArrowRight className="size-3.5 transition-transform duration-300 group-hover/glass:translate-x-0.5 sm:size-4" />
          </span>
        </Link>
      </div>
    )
  }

  return (
    <div className={`relative isolate ${className ?? ""}`}>
      <div
        inert
        aria-hidden="true"
        className={`pointer-events-none saturate-[.85] select-none ${
          strong ? "blur-[10px]" : "blur-[5px]"
        }`}
      >
        {children}
      </div>

      <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] bg-black/35 p-4 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.25),inset_0_1px_0_0_rgb(255_255_255/0.5)] backdrop-blur-[2px] backdrop-saturate-150">
        {variant === "chip" ? (
          <div className="flex flex-col items-center gap-3">
            <LockBadge />
          </div>
        ) : (
          <div className="relative w-full max-w-sm rounded-2xl border border-white/25 bg-black/45 p-6 text-center text-white shadow-[inset_0_1px_0_0_rgb(255_255_255/0.4),0_24px_60px_-24px_rgb(0_0_0/0.6)] backdrop-blur-2xl backdrop-saturate-150 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-linear-to-br before:from-white/20 before:via-white/5 before:to-transparent sm:p-8">
            <div className="relative flex flex-col items-center gap-3">
              <LockBadge />
              <p className="mt-2 font-serif text-2xl leading-tight">
                {heading}
              </p>
              <p className="text-sm leading-relaxed text-white/85">{body}</p>
              <Button asChild variant="brand" size="lg" className="mt-3">
                <Link href={interestHref(interest)}>
                  {ctaLabel}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
