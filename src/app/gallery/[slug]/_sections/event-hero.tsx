import Image from "next/image"
import Link from "next/link"
import type { GalleryEvent } from "@/lib/gallery"
import { galleryBlur } from "@/lib/gallery-blur"

/**
 * Event page opener — an asymmetric split instead of a centered column, so
 * the page reads as one continuous collage with the floating photo wall
 * below it rather than "header, then a different-feeling gallery." The
 * photo runs wide and unboxed on one side; the copy sits staggered lower
 * on the other, in the same big/plain-sans voice as the wall's reflections.
 */
export function EventHero({ event }: { event: GalleryEvent }) {
  const cover = (
    <Image
      src={event.cover}
      alt={event.name}
      fill
      priority
      sizes="(min-width: 1024px) 58vw, 100vw"
      className="object-cover"
      {...galleryBlur(event.cover)}
    />
  )

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 pt-16 sm:px-8 lg:pt-24">
        <Link
          href="/gallery"
          className="text-muted-foreground hover:text-foreground text-xs font-semibold tracking-[0.14em] uppercase"
        >
          ← All events
        </Link>

        <div className="mt-10 flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
          <div className="lg:w-[58%] lg:shrink-0">
            <div className="relative aspect-3/2 w-full overflow-hidden rounded-3xl">
              {cover}
            </div>
          </div>

          <div className="lg:mt-20 lg:w-[36%]">
            <p className="text-muted-foreground text-sm font-semibold tracking-[0.14em] uppercase lg:text-base">
              {event.date} · {event.location}
            </p>
            <h1 className="mt-4 font-serif text-[2.5rem] leading-[1.03] tracking-[-0.02em] sm:text-[3.5rem] lg:text-[4rem]">
              {event.name}
            </h1>
            <p className="text-foreground mt-8 text-xl leading-relaxed lg:text-2xl">
              {event.blurb}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
