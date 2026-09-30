import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { SiteNavbar } from "@/app/_components/site-navbar"
import { SiteFooter } from "@/app/_components/site-footer"
import { SiteCta } from "@/app/_components/site-cta"
import { EventHero } from "./_sections/event-hero"
import { EventPhotoWall } from "./_sections/photo-wall"
import { GALLERY_EVENTS, getGalleryEvent } from "@/lib/gallery"
import { getWorkshop } from "@/lib/workshops"

type Params = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return GALLERY_EVENTS.map((e) => ({ slug: e.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const e = getGalleryEvent(slug)
  if (!e) return { title: "Event not found" }
  return {
    title: `${e.name} — ${e.date} · Coach Adrian Ding`,
    description: e.blurb,
  }
}

export default async function GalleryEventPage({ params }: Params) {
  const { slug } = await params
  const event = getGalleryEvent(slug)
  if (!event) notFound()

  const related = event.relatedWorkshop
    ? getWorkshop(event.relatedWorkshop)
    : undefined

  return (
    <>
      <SiteNavbar />
      <main>
        <EventHero event={event} />

        <div className="mt-14 pb-20 md:pb-0">
          <EventPhotoWall
            photos={event.photos.filter((p) => p.src !== event.cover)}
            reflections={event.reflections}
          />
        </div>

        <SiteCta
          heading={
            related
              ? `${related.title} is open for registration`
              : "Want to be in the next one?"
          }
          subtext="Join a live session, or bring this training in-house for your own team."
          primaryLabel="Join the Experience"
          primaryHref={related ? `/workshops/${related.slug}` : "/workshops"}
          secondaryLabel="Create one for your team"
          secondaryHref="/corporate-training#inquiry"
        />
      </main>
      <SiteFooter />
    </>
  )
}
