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
   * panel = heading + body + CTA; chip = small "Coming soon" pill, no CTA;
   * card = the whole box is one link to `href`: frosted veil, centred
   * "Coming soon" pill, content blurred hard and inert underneath. The wrapper
   * has no `relative`, so pass `absolute inset-0 ...` (or your own position).
   */
  variant?: "panel" | "chip" | "card"
  /** card variant: link target (normally interestHref(...)). */
  href?: string
  /** card variant: accessible name of the single link. */
  label?: string
  /** Heavier blur, for content that must not be readable at all (dates). */
  strong?: boolean
  /** On the outer wrapper (width, radius, margins). */
  className?: string
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
  ctaLabel = "Get early access",
  variant = "panel",
  href,
  label = "Coming soon, get notified",
  strong = false,
  className,
}: GlassLockProps) {
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
          className="group/glass focus-visible:ring-brand absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] bg-white/15 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.4),inset_0_1px_0_0_rgb(255_255_255/0.7)] backdrop-blur-sm backdrop-saturate-150 outline-none focus-visible:ring-4 focus-visible:ring-inset"
        >
          <span className="text-foreground relative inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/45 px-4 py-2 text-xs font-semibold tracking-[0.14em] uppercase shadow-[inset_0_1px_0_0_rgb(255_255_255/0.85),0_12px_30px_-12px_rgb(0_0_0/0.4)] backdrop-blur-2xl backdrop-saturate-150 transition-colors duration-300 group-hover/glass:bg-white/65 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-linear-to-br before:from-white/60 before:via-white/10 before:to-transparent motion-reduce:transition-none">
            <Lock className="relative size-3.5" />
            <span className="relative">Coming soon</span>
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

      <div className="bg-background/20 absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] p-4">
        {variant === "chip" ? (
          <span className="text-foreground relative inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/45 px-4 py-2 text-xs font-semibold tracking-[0.14em] uppercase shadow-[inset_0_1px_0_0_rgb(255_255_255/0.85),0_12px_30px_-12px_rgb(0_0_0/0.4)] backdrop-blur-2xl backdrop-saturate-150 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-linear-to-br before:from-white/60 before:via-white/10 before:to-transparent">
            <Lock className="relative size-3.5" />
            <span className="relative">Coming soon</span>
          </span>
        ) : (
          <div className="text-foreground relative w-full max-w-sm rounded-2xl border border-white/60 bg-white/45 p-6 text-center shadow-[inset_0_1px_0_0_rgb(255_255_255/0.85),inset_0_-1px_0_0_rgb(255_255_255/0.3),0_24px_60px_-24px_rgb(0_0_0/0.4)] backdrop-blur-2xl backdrop-saturate-150 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-linear-to-br before:from-white/60 before:via-white/10 before:to-transparent sm:p-8">
            <div className="relative">
              <p className="text-foreground/70 inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.14em] uppercase">
                <Lock className="size-3.5" />
                Coming soon
              </p>
              <p className="mt-3 font-serif text-2xl leading-tight">
                {heading}
              </p>
              <p className="text-foreground/75 mt-3 text-sm leading-relaxed">
                {body}
              </p>
              <Button asChild variant="brand" size="lg" className="mt-6">
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
