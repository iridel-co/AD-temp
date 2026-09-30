import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BloomFieldBackground } from "@/app/_components/bloom-field-background"
import { GlassLock } from "@/app/_components/glass-lock"
import { Reveal } from "@/app/_components/reveal"
import { interestHref } from "@/lib/interest"
import type { Workshop } from "@/lib/workshops"
import { RegistrationForm } from "./registration-form"

/**
 * Workshop page closer. Same split as the corporate inquiry CTA: copy on the
 * left, the real registration form on the right as a white card, currently
 * locked behind a <GlassLock> that routes to the early-access list.
 */
export function RegisterCta({ workshop }: { workshop: Workshop }) {
  return (
    <section className="text-brand-foreground relative overflow-hidden">
      <BloomFieldBackground />
      <div className="relative mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:py-28">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <Reveal>
            <div className="text-center lg:text-left">
              <h2 className="font-serif text-[2.75rem] leading-[1.03] tracking-[-0.02em] max-lg:text-balance lg:text-[3.5rem] lg:text-wrap">
                Registration opens soon
              </h2>
              <p className="text-brand-foreground/80 mx-auto mt-6 max-w-md text-lg leading-relaxed lg:mx-0 lg:text-xl">
                Dates and pricing for {workshop.title} are being finalised. Join
                the early-access list and you&rsquo;ll hear first.
              </p>
              <Button asChild variant="secondary" size="lg" className="mt-8">
                <Link href={interestHref("workshops")}>Get early access</Link>
              </Button>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <GlassLock
              interest="workshops"
              heading="Registration opens soon"
              className="rounded-xl"
            >
              <div className="bg-background text-foreground rounded-xl p-6 shadow-2xl sm:p-10">
                <RegistrationForm
                  slug={workshop.slug}
                  workshopTitle={workshop.title}
                  schedule={workshop.schedule}
                  venue={`${workshop.venue}, ${workshop.city}`}
                />
              </div>
            </GlassLock>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
