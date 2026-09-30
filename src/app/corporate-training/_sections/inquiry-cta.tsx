import { Reveal } from "@/app/_components/reveal"
import { BloomFieldBackground } from "@/app/_components/bloom-field-background"
import { GlassLock } from "@/app/_components/glass-lock"
import { CorporateInquiryForm } from "./inquiry-form"

/**
 * Corporate Training — closing CTA. Full-bleed brand red, split like
 * <SiteCta>: heading + supporting copy on the left, the inquiry form itself
 * (not a modal) as a floating white card on the right, currently behind a
 * <GlassLock> (coming soon) that routes to the early-access list. The left column is
 * vertically centered against the form's height. Card floats on the red
 * ground for contrast — see `inquiry-form.tsx` for the card treatment.
 */
export function CorporateInquiryCta() {
  return (
    <section
      id="inquiry"
      className="text-brand-foreground relative scroll-mt-[calc(var(--nav-h)+1.5rem)] overflow-hidden"
    >
      <BloomFieldBackground />
      <div className="relative mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:py-28">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <Reveal>
            <div className="text-center lg:text-left">
              <h2 className="font-serif text-[2.75rem] leading-[1.03] tracking-[-0.02em] max-lg:text-balance lg:text-[3.5rem] lg:text-wrap">
                Ready to build a program for your team?
              </h2>
              <p className="text-brand-foreground/80 mx-auto mt-6 max-w-md text-lg leading-relaxed lg:mx-0 lg:text-xl">
                Online inquiries open soon. Join the early-access list and
                we&rsquo;ll reach out to build your programme.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <GlassLock
              interest="corporate"
              heading="Corporate inquiries open soon"
              body="Join the early-access list and Adrian's team will reach out to scope your programme."
              ctaLabel="Get notified"
              className="rounded-xl"
            >
              <CorporateInquiryForm />
            </GlassLock>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
