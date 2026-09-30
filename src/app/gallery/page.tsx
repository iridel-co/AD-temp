import type { Metadata } from "next"
import { SiteNavbar } from "@/app/_components/site-navbar"
import { SiteFooter } from "@/app/_components/site-footer"
import { SiteCta } from "@/app/_components/site-cta"
import { SplitReveal } from "@/app/_components/split-reveal"
import { FloatingWall } from "./_sections/floating-wall"

export const metadata: Metadata = {
  title: "Event Gallery — Coach Adrian Ding",
  description:
    "Past workshops, keynotes and corporate sessions with Coach Adrian Ding.",
}

export default function GalleryPage() {
  return (
    <>
      <SiteNavbar />
      <main>
        <section className="mx-auto max-w-7xl px-6 pt-20 pb-10 sm:px-8 lg:pt-28 lg:pb-14">
          <SplitReveal
            as="h1"
            className="font-serif text-[2.75rem] leading-[1.03] tracking-[-0.02em] sm:text-[3.5rem] lg:text-[4.5rem]"
          >
            Inside the room
          </SplitReveal>
          <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-relaxed lg:text-xl">
            A look back at recent workshops, keynotes and corporate sessions —
            click a photo to step into that event.
          </p>
        </section>
        <FloatingWall />
        <SiteCta
          heading="The next one could be yours"
          subtext="See what's open for registration, or ask about a private session."
        />
      </main>
      <SiteFooter />
    </>
  )
}
