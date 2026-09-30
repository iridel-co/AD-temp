"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

import Floating, { FloatingElement } from "@/components/ui/parallax-floating"
import { cn } from "@/lib/utils"
import type { GalleryPhoto, GalleryReflection } from "@/lib/gallery"
import { galleryBlur } from "@/lib/gallery-blur"

/**
 * Event photo wall — the same floating/staggered language as the parent
 * `/gallery` wall (`FloatingWall`), but for one event's own photo set. Rows
 * mix single "hero" photos (bigger, alone) with rows of 2–3 smaller ones for
 * a deliberately uneven, collage-like rhythm rather than a uniform grid.
 * Every "alone" row also carries one of the event's `reflections` in the
 * space the lone photo doesn't use — like map notes next to a landmark — so
 * the wide gaps either side of a hero photo read as designed, not empty.
 * Clicking a photo opens a lightbox instead of navigating — these are
 * photos within one event, not links to other pages.
 */
const ASPECT_RATIO = { "3/2": 1.5, "4/5": 0.8 } as const

type RowTemplate = {
  widths: number[]
  bias: "left" | "right" | "center"
}

// Each row is a list of tile widths (vw, desktop only) — one entry = a big
// tile alone, several entries = that many tiles side by side in a row. A
// lone tile pairs with the next unused reflection, placed in the space on
// the *opposite* side from its bias. The pattern repeats (cycling) if an
// event has more photos than one pass uses.
const ROW_PATTERN: RowTemplate[] = [
  { widths: [40], bias: "left" },
  { widths: [24, 24], bias: "center" },
  { widths: [42], bias: "right" },
  { widths: [17, 17, 17], bias: "center" },
  { widths: [36], bias: "left" },
  { widths: [28], bias: "right" },
]
const EDGE_INSET_VW = 7
const ROW_GAP_VW = 3
const TEXT_MARGIN_VW = 3
const ROW_GAP_DESKTOP_VW = 5
const ROW_GAP_MOBILE_VW = 15
const TEXT_GAP_MOBILE_VW = 10
const MOBILE_TILE_VW = 62
const MOBILE_TEXT_VW = 78
const MOBILE_JITTER = [-4, 3, -3, 4, -2, 2, -4, 3, -3]
// Vertical mobile rail: each photo gets a width + horizontal shift from
// center. A shift pushes the tile toward (or past) one screen edge, and the
// rail's own `overflow-x-hidden` clips whatever runs off — the collage-crop
// look the desktop wall gets from its wide floating field. Widths above
// 100vw minus |shift| guarantee a real crop, not just an off-center tile.
const MOBILE_STAGGER = [
  { width: 80, shift: -14 },
  { width: 64, shift: 8 },
  { width: 86, shift: 12 },
  { width: 68, shift: -6 },
  { width: 92, shift: -16 },
  { width: 62, shift: 4 },
  { width: 78, shift: 10 },
]
const DEPTHS = [2, 3.5, 1, 2.5, 1.5, 3, 1.2, 2.2, 1.8]
const TEXT_DEPTHS = [0.6, 1, 0.8]

// Rough chars-per-line and line-height, in vw, for the text tile's actual
// rendered size (text-2xl → text-4xl body) — used only to reserve enough
// vertical room so a long reflection never runs into the next row. Errs
// generous on purpose (better extra whitespace than an overlap); tuned
// empirically against real renders, not exact.
const TEXT_CHARS_PER_VW_DESKTOP = 0.95
const TEXT_LINE_HEIGHT_VW_DESKTOP = 3.1
const TEXT_EYEBROW_VW_DESKTOP = 3.5
const TEXT_CHARS_PER_VW_MOBILE = 0.28
const TEXT_LINE_HEIGHT_VW_MOBILE = 9.5
const TEXT_EYEBROW_VW_MOBILE = 10

function estimateTextHeightVw(
  body: string,
  widthVw: number,
  charsPerVw: number,
  lineHeightVw: number,
  eyebrowVw: number
): number {
  const charsPerLine = Math.max(8, widthVw * charsPerVw)
  const lines = Math.max(1, Math.ceil(body.length / charsPerLine))
  return eyebrowVw + lines * lineHeightVw
}

interface PhotoTile {
  kind: "photo"
  key: string
  src: string
  alt: string
  aspect: "3/2" | "4/5"
  depth: number
  topMobile: number
  topDesktop: number
  leftMobile: number
  leftDesktop: number
  widthMobile: number
  widthDesktop: number
}

interface TextTile {
  kind: "text"
  key: string
  eyebrow: string
  body: string
  depth: number
  topMobile: number
  topDesktop: number
  leftMobile: number
  leftDesktop: number
  widthMobile: number
  widthDesktop: number
}

type WallItem = PhotoTile | TextTile

function buildPhotoWall(
  photos: GalleryPhoto[],
  reflections: GalleryReflection[]
): {
  items: WallItem[]
  mobileHeightVw: number
  desktopHeightVw: number
} {
  let topVw = 4
  let rowIndex = 0
  let photoIndex = 0
  let reflectionCursor = 0
  let photoDepthCursor = 0
  let textDepthCursor = 0

  // One entry per row actually consumed, in order — desktop positions are
  // computed inline here; the mobile pass below replays this same sequence
  // (photos then that row's text, single column) so both breakpoints show
  // the same content in the same relative order.
  const rows: {
    photos: { photo: GalleryPhoto; leftPct: number; widthVw: number }[]
    text?: GalleryReflection
  }[] = []
  const desktopRaw: {
    kind: "photo" | "text"
    topVw: number
    leftPct: number
    widthVw: number
    photo?: GalleryPhoto
    text?: GalleryReflection
  }[] = []

  while (photoIndex < photos.length) {
    const row = ROW_PATTERN[rowIndex % ROW_PATTERN.length]
    rowIndex += 1

    const count = Math.min(row.widths.length, photos.length - photoIndex)
    const widths = row.widths.slice(0, count)
    const totalWidth =
      widths.reduce((sum, w) => sum + w, 0) + ROW_GAP_VW * (count - 1)
    const rowLeft =
      count > 1
        ? (100 - totalWidth) / 2
        : row.bias === "left"
          ? EDGE_INSET_VW
          : row.bias === "right"
            ? 100 - totalWidth - EDGE_INSET_VW
            : (100 - totalWidth) / 2

    let cursor = rowLeft
    let rowHeight = 0
    const rowPhotos: {
      photo: GalleryPhoto
      leftPct: number
      widthVw: number
    }[] = []
    for (const width of widths) {
      const photo = photos[photoIndex]
      const aspect = ASPECT_RATIO[photo.aspect ?? "3/2"]
      const height = width / aspect
      desktopRaw.push({
        kind: "photo",
        topVw,
        leftPct: cursor,
        widthVw: width,
        photo,
      })
      rowPhotos.push({ photo, leftPct: cursor, widthVw: width })
      cursor += width + ROW_GAP_VW
      rowHeight = Math.max(rowHeight, height)
      photoIndex += 1
    }

    // Only a lone tile (count === 1) leaves a real gap worth annotating,
    // and only while reflections remain to fill it.
    const reflection =
      count === 1 && reflectionCursor < reflections.length
        ? reflections[reflectionCursor++]
        : undefined
    let textHeightVw = 0
    if (reflection) {
      const photoLeft = rowLeft
      const photoWidth = widths[0]
      const textLeft =
        row.bias === "left"
          ? photoLeft + photoWidth + ROW_GAP_VW + TEXT_MARGIN_VW
          : EDGE_INSET_VW
      const textWidth =
        row.bias === "left"
          ? 100 - EDGE_INSET_VW - textLeft
          : photoLeft - ROW_GAP_VW - TEXT_MARGIN_VW - textLeft
      const finalTextWidth = Math.max(textWidth, 18)
      textHeightVw = estimateTextHeightVw(
        reflection.body,
        finalTextWidth,
        TEXT_CHARS_PER_VW_DESKTOP,
        TEXT_LINE_HEIGHT_VW_DESKTOP,
        TEXT_EYEBROW_VW_DESKTOP
      )
      desktopRaw.push({
        kind: "text",
        topVw,
        leftPct: textLeft,
        widthVw: finalTextWidth,
        text: reflection,
      })
    }

    rows.push({ photos: rowPhotos, text: reflection })
    topVw += Math.max(rowHeight, textHeightVw) + ROW_GAP_DESKTOP_VW
  }

  const desktopHeightVw = topVw

  // Mobile: replay the same row sequence, single column — each row's
  // photo(s) stacked, then its text block (if any) as its own stacked card.
  let mobileTopVw = 3
  let mobileJitterCursor = 0
  const mobileRaw: {
    kind: "photo" | "text"
    topVw: number
    leftPct: number
    widthVw: number
    photo?: GalleryPhoto
    text?: GalleryReflection
  }[] = []
  for (const row of rows) {
    for (const p of row.photos) {
      const aspect = ASPECT_RATIO[p.photo.aspect ?? "3/2"]
      const height = MOBILE_TILE_VW / aspect
      const jitter = MOBILE_JITTER[mobileJitterCursor % MOBILE_JITTER.length]
      mobileJitterCursor += 1
      mobileRaw.push({
        kind: "photo",
        topVw: mobileTopVw,
        leftPct: (100 - MOBILE_TILE_VW) / 2 + jitter,
        widthVw: MOBILE_TILE_VW,
        photo: p.photo,
      })
      mobileTopVw += height + ROW_GAP_MOBILE_VW
    }
    if (row.text) {
      const textHeightVw = estimateTextHeightVw(
        row.text.body,
        MOBILE_TEXT_VW,
        TEXT_CHARS_PER_VW_MOBILE,
        TEXT_LINE_HEIGHT_VW_MOBILE,
        TEXT_EYEBROW_VW_MOBILE
      )
      mobileRaw.push({
        kind: "text",
        topVw: mobileTopVw,
        leftPct: (100 - MOBILE_TEXT_VW) / 2,
        widthVw: MOBILE_TEXT_VW,
        text: row.text,
      })
      mobileTopVw += textHeightVw + TEXT_GAP_MOBILE_VW
    }
  }
  const mobileHeightVw = mobileTopVw

  const items: WallItem[] = desktopRaw.map((d, i) => {
    const m = mobileRaw[i]
    if (d.kind === "photo" && d.photo) {
      const depth = DEPTHS[photoDepthCursor % DEPTHS.length]
      photoDepthCursor += 1
      const tile: PhotoTile = {
        kind: "photo",
        key: `photo-${d.photo.src}-${i}`,
        src: d.photo.src,
        alt: d.photo.alt,
        aspect: d.photo.aspect ?? "3/2",
        depth,
        topDesktop: (d.topVw / desktopHeightVw) * 100,
        leftDesktop: d.leftPct,
        widthDesktop: d.widthVw,
        topMobile: (m.topVw / mobileHeightVw) * 100,
        leftMobile: m.leftPct,
        widthMobile: m.widthVw,
      }
      return tile
    }
    const depth = TEXT_DEPTHS[textDepthCursor % TEXT_DEPTHS.length]
    textDepthCursor += 1
    const tile: TextTile = {
      kind: "text",
      key: `text-${i}`,
      eyebrow: d.text?.eyebrow ?? "",
      body: d.text?.body ?? "",
      depth,
      topDesktop: (d.topVw / desktopHeightVw) * 100,
      leftDesktop: d.leftPct,
      widthDesktop: d.widthVw,
      topMobile: (m.topVw / mobileHeightVw) * 100,
      leftMobile: m.leftPct,
      widthMobile: m.widthVw,
    }
    return tile
  })

  return { items, mobileHeightVw, desktopHeightVw }
}

export function EventPhotoWall({
  photos,
  reflections,
}: {
  photos: GalleryPhoto[]
  reflections: GalleryReflection[]
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  const { items, mobileHeightVw, desktopHeightVw } = buildPhotoWall(
    photos,
    reflections
  )
  const photoItems = items.filter(
    (item): item is PhotoTile => item.kind === "photo"
  )

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (lightboxIndex === null) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxIndex(null)
      if (e.key === "ArrowRight")
        setLightboxIndex((i) => (i === null ? i : (i + 1) % photoItems.length))
      if (e.key === "ArrowLeft")
        setLightboxIndex((i) =>
          i === null ? i : (i - 1 + photoItems.length) % photoItems.length
        )
    }
    window.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [lightboxIndex, photoItems.length])

  const activePhoto = lightboxIndex !== null ? photoItems[lightboxIndex] : null

  return (
    <div className="bg-background relative">
      {/* Mobile — the same photos and reflections, in the same order, as a
          staggered vertical column. Each photo gets a width + horizontal
          shift so it drifts off-center — some run past the screen edge and
          get clipped by this rail's own `overflow-x-clip` — echoing the wide
          floating field the desktop wall scatters across. Both branches are
          in the DOM and swapped with CSS rather than JS — every image here
          is lazy, so the hidden branch never fetches one. */}
      <div className="flex flex-col items-center gap-10 overflow-x-clip pb-2 md:hidden">
        {items.map((item, i) =>
          item.kind === "text" ? (
            <div key={item.key} className="w-[78vw] shrink-0 select-none">
              <p className="text-muted-foreground text-xs font-semibold tracking-[0.12em] uppercase">
                {item.eyebrow}
              </p>
              <p className="text-foreground mt-3 text-xl leading-snug">
                {item.body}
              </p>
            </div>
          ) : (
            (() => {
              const stagger = MOBILE_STAGGER[i % MOBILE_STAGGER.length]
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setLightboxIndex(photoItems.indexOf(item))}
                  className="focus-visible:ring-brand shrink-0 cursor-pointer transition-transform duration-200 ease-out outline-none focus-visible:ring-2 active:scale-[0.97]"
                  style={{
                    width: `${stagger.width}vw`,
                    marginLeft: `${stagger.shift}vw`,
                  }}
                >
                  <div
                    className="relative w-full overflow-hidden rounded-3xl shadow-lg shadow-black/15"
                    style={{ aspectRatio: item.aspect }}
                  >
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      sizes={`${stagger.width}vw`}
                      className="object-cover"
                      {...galleryBlur(item.src)}
                    />
                  </div>
                </button>
              )
            })()
          )
        )}
      </div>

      <div
        className="relative z-0 hidden w-full overflow-hidden md:block"
        style={
          {
            "--wall-h-m": `${mobileHeightVw}vw`,
            "--wall-h-d": `${desktopHeightVw}vw`,
          } as React.CSSProperties
        }
      >
        <div className="min-h-(--wall-h-m) md:min-h-(--wall-h-d)" />
        <div className="absolute inset-0">
          <Floating sensitivity={-0.15}>
            {items.map((item, index) => {
              const positionStyle = {
                "--wall-top-m": `${item.topMobile}%`,
                "--wall-top-d": `${item.topDesktop}%`,
                "--wall-left-m": `${item.leftMobile}%`,
                "--wall-left-d": `${item.leftDesktop}%`,
                "--wall-w-m": `${item.widthMobile}vw`,
                "--wall-w-d": `${item.widthDesktop}vw`,
              } as React.CSSProperties
              const positionClass = cn(
                "top-(--wall-top-m) left-(--wall-left-m) w-(--wall-w-m)",
                "md:top-(--wall-top-d) md:left-(--wall-left-d) md:w-(--wall-w-d)"
              )

              if (item.kind === "text") {
                return (
                  <FloatingElement
                    key={item.key}
                    depth={item.depth}
                    className={positionClass}
                    style={positionStyle}
                  >
                    <div
                      data-wall-tile
                      style={{ "--tile-i": index } as React.CSSProperties}
                      className="animate-wall-tile-in w-full select-none"
                    >
                      <p className="text-muted-foreground text-sm font-semibold tracking-[0.12em] uppercase lg:text-base">
                        {item.eyebrow}
                      </p>
                      <p className="text-foreground mt-3 text-2xl leading-snug font-normal md:text-3xl lg:text-4xl">
                        {item.body}
                      </p>
                    </div>
                  </FloatingElement>
                )
              }

              const photoIndex = photoItems.indexOf(item)

              return (
                <FloatingElement
                  key={item.key}
                  depth={item.depth}
                  className={positionClass}
                  style={positionStyle}
                >
                  <button
                    type="button"
                    data-wall-tile
                    onClick={() => setLightboxIndex(photoIndex)}
                    style={{ "--tile-i": index } as React.CSSProperties}
                    className="animate-wall-tile-in group focus-visible:ring-brand isolate block w-full cursor-pointer text-left outline-none focus-visible:z-10 focus-visible:ring-2"
                  >
                    <div
                      className="relative w-full origin-center overflow-hidden rounded-3xl border border-transparent transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:group-hover:scale-[1.04] md:group-focus-visible:scale-[1.04]"
                      style={{ aspectRatio: item.aspect }}
                    >
                      <Image
                        src={item.src}
                        alt={item.alt}
                        fill
                        sizes={`(min-width: 768px) ${Math.round(item.widthDesktop)}vw, ${MOBILE_TILE_VW}vw`}
                        className="object-cover"
                        {...galleryBlur(item.src)}
                      />
                    </div>
                  </button>
                </FloatingElement>
              )
            })}
          </Floating>
        </div>
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {activePhoto && lightboxIndex !== null && (
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label={activePhoto.alt}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 lg:p-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => setLightboxIndex(null)}
              >
                <div
                  className="relative max-h-[85vh] w-full max-w-5xl overflow-hidden shadow-2xl"
                  style={{ aspectRatio: activePhoto.aspect }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Image
                    src={activePhoto.src}
                    alt={activePhoto.alt}
                    fill
                    sizes="90vw"
                    className="object-cover"
                    priority
                    {...galleryBlur(activePhoto.src)}
                  />
                </div>

                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setLightboxIndex(null)}
                  className="focus-visible:ring-brand absolute top-6 right-6 flex h-10 w-10 items-center justify-center text-white/80 transition-colors duration-300 hover:text-white focus-visible:ring-2 focus-visible:outline-none lg:top-10 lg:right-10"
                >
                  <X className="size-5" aria-hidden="true" />
                </button>

                {photoItems.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Previous photo"
                      onClick={(e) => {
                        e.stopPropagation()
                        setLightboxIndex((i) =>
                          i !== null
                            ? (i - 1 + photoItems.length) % photoItems.length
                            : i
                        )
                      }}
                      className="bg-background/90 text-foreground hover:bg-background absolute top-1/2 left-4 flex size-10 -translate-y-1/2 items-center justify-center rounded-full transition-colors lg:left-8"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next photo"
                      onClick={(e) => {
                        e.stopPropagation()
                        setLightboxIndex((i) =>
                          i !== null ? (i + 1) % photoItems.length : i
                        )
                      }}
                      className="bg-background/90 text-foreground hover:bg-background absolute top-1/2 right-4 flex size-10 -translate-y-1/2 items-center justify-center rounded-full transition-colors lg:right-8"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  )
}
