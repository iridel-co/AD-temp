import Image from "next/image"
import { GlassLock } from "@/app/_components/glass-lock"
import { interestHref } from "@/lib/interest"
import { cn } from "@/lib/utils"

/**
 * The programmes (the teaser list on the landing page) as a stack of rounded, cropped
 * photo cards with the programme title and blurb laid over a scrim (both blurred; the
 * title is repeated crisp on the glass).
 *
 * Every card sits under a <GlassLock variant="card"> "Coming soon" veil, the
 * same as the workshop cards: the whole card is one link to the corporate
 * interest form and the content underneath is blurred and inert. With nothing
 * reachable underneath, the old expand-on-hover height tween and the Inquire
 * button are gone — cards are static.
 *
 * Below `lg` the cards are fixed-width panels in a horizontal snap rail (the
 * calling section supplies the scroller); from `lg` they stack vertically.
 */

export type SpecCard = {
  key: string
  title: string
  blurb: string
  image: string
  imageAlt: string
  // Vertical focal point for the cropped photo, e.g. "50% 20%" to bias the
  // crop toward the top of the frame. Defaults to centered.
  imagePosition?: string /** Untitled "And more…" teaser: centred lock + Get notified, no title. */
  comingSoon?: true
}

// Alternating horizontal offset so the stack reads as a staggered, hand-set
// column rather than a locked grid — even rows pulled left, odd rows pushed
// right. `lg:`-gated: below that the cards are fixed-width panels in a
// horizontal rail, where an inset would just shrink them unevenly.
const OFFSETS = ["lg:mr-[7%] lg:w-[93%]", "lg:ml-[7%] lg:w-[93%]"]

export function SpecRevealCards({ items }: { items: SpecCard[] }) {
  return (
    <>
      {items.map((item, i) => (
        <div
          key={item.key}
          className={cn(
            "relative h-[28rem] w-[78vw] max-w-96 shrink-0 snap-start overflow-hidden rounded-3xl contain-layout lg:h-60 lg:max-w-none lg:shrink",
            OFFSETS[i % OFFSETS.length]
          )}
        >
          <GlassLock
            variant="card"
            href={interestHref("corporate")}
            title={item.comingSoon ? undefined : item.title}
            className="absolute inset-0 overflow-hidden rounded-[inherit]"
          >
            <Image
              src={item.image}
              alt={item.imageAlt}
              fill
              sizes="(min-width: 1280px) 1216px, (min-width: 1024px) 100vw, 78vw"
              style={{ objectPosition: item.imagePosition ?? "50% 50%" }}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/35 to-black/15" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 lg:flex-row lg:items-end lg:justify-between lg:gap-8 lg:p-8 xl:gap-12">
              <h3 className="max-w-[15.5rem] text-xl leading-tight font-extrabold tracking-[-0.01em] text-balance text-white lg:max-w-60 lg:shrink-0 lg:text-[1.65rem]">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-white/85 lg:max-w-sm lg:text-right xl:text-base">
                {item.blurb}
              </p>
            </div>
          </GlassLock>
        </div>
      ))}
    </>
  )
}
