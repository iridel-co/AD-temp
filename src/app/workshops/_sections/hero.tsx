import Image from "next/image"
import { SplitReveal } from "@/app/_components/split-reveal"
import { Reveal } from "@/app/_components/reveal"

/**
 * Workshops — opening banner. Full-bleed shot over the page's h1, same
 * treatment as `about/_sections/hero.tsx`.
 */
export function WorkshopsHero() {
  return (
    <section
      data-navbar-theme="dark"
      className="relative flex h-auto min-h-120 w-full items-end overflow-hidden bg-neutral-950 lg:h-[64svh]"
    >
      <Image
        src="/images/hero/workshops-hero.webp"
        alt="Adrian Ding leading a full-day public workshop"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_28%]"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent" />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pt-16 pb-8 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16 lg:pb-16">
        <SplitReveal
          as="h1"
          className="max-w-3xl font-serif text-[2.75rem] leading-[1.03] tracking-[-0.02em] text-white sm:text-[3.5rem] lg:text-[4.5rem]"
        >
          Coming workshops
        </SplitReveal>
        <Reveal className="flex max-w-md flex-col gap-6 lg:pb-2">
          <p className="text-base leading-relaxed text-white/80 lg:text-lg">
            A full day with Adrian — the same programs companies book, open for
            individual registration. Seats are limited and dates do sell out.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
