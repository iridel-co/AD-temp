import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SplitReveal } from "@/app/_components/split-reveal"
import { interestHref } from "@/lib/interest"

/**
 * Landing closer: one last "Get notified", same target as the navbar pill on
 * this page (the interest form, no preset).
 */
export function LandingClosingCta() {
  return (
    <section className="bg-background py-24 lg:py-36">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-6 text-center sm:px-8">
        <SplitReveal className="font-serif text-[2.75rem] leading-[1.05] tracking-[-0.02em] lg:text-[3.75rem]">
          Be first in the room
        </SplitReveal>
        <p className="text-muted-foreground mt-6 max-w-xl text-base leading-relaxed lg:text-lg">
          Workshops and corporate programmes open soon. Join the list and
          we&apos;ll tell you the moment dates are set.
        </p>
        <Button asChild variant="brand" size="lg" className="mt-10">
          <Link href={interestHref()}>
            Get notified
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </section>
  )
}
