import { Reveal } from "@/app/_components/reveal"
import { BloomFieldBackground } from "@/app/_components/bloom-field-background"
import type { Interest } from "@/lib/interest"
import { InterestForm } from "./interest-form"

/**
 * Early-access list: full-bleed brand ground, heading on the left, the form
 * as a floating white card on the right. Same split as the corporate
 * inquiry CTA.
 */
export function InterestSignup({
  initialInterest,
}: {
  initialInterest: Interest
}) {
  return (
    <section className="text-brand-foreground relative flex min-h-[85svh] items-center overflow-hidden">
      <BloomFieldBackground />
      <div className="relative mx-auto w-full max-w-7xl px-6 py-16 sm:px-8 lg:py-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <Reveal>
            <div className="text-center lg:text-left">
              <h1 className="font-serif text-[2.75rem] leading-[1.03] tracking-[-0.02em] max-lg:text-balance lg:text-[3.5rem] lg:text-wrap">
                Be first in the room.
              </h1>
              <p className="text-brand-foreground/80 mx-auto mt-6 max-w-md text-lg leading-relaxed lg:mx-0 lg:text-xl">
                New workshop dates and corporate programmes are being finalised.
                Leave your details and Adrian&rsquo;s team will reach out before
                anyone else hears.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <InterestForm initialInterest={initialInterest} />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
