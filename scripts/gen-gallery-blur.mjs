/**
 * Generates `src/lib/gallery-blur.ts` — a 10px-wide JPEG of every photo under
 * `public/images/gallery/`, inlined as a data URI for `next/image`'s
 * `placeholder="blur"`.
 *
 * Run after adding or replacing gallery photos:  node scripts/gen-gallery-blur.mjs
 */
import { readdirSync, statSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import sharp from "sharp"

const ROOT = "public/images/gallery"

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}

const files = walk(ROOT)
  .filter((f) => /\.(jpe?g|png)$/i.test(f))
  .sort()

const entries = []
for (const f of files) {
  const buf = await sharp(f)
    .resize(10)
    .jpeg({ quality: 45, chromaSubsampling: "4:2:0" })
    .toBuffer()
  entries.push([
    `/${f.replace(/^public\//, "")}`,
    `data:image/jpeg;base64,${buf.toString("base64")}`,
  ])
}

const body = entries.map(([k, v]) => `  "${k}":\n    "${v}",`).join("\n")

writeFileSync(
  "src/lib/gallery-blur.ts",
  `/**
 * Generated — do not edit by hand.
 *
 * A 10px-wide JPEG of every gallery photo, inlined as a data URI, for
 * \`next/image\`'s \`placeholder="blur"\`. The wall photos are 200–500 KB each
 * and load on scroll, so without a placeholder each tile is a blank box until
 * its image lands. It also settles Next's dev-only LCP warning: the warning
 * only fires for a lazy image whose placeholder is \`empty\`.
 *
 * Regenerate with \`node scripts/gen-gallery-blur.mjs\` after adding or
 * replacing photos in \`public/images/gallery/\`.
 */

export const GALLERY_BLUR: Record<string, string> = {
${body}
}

/** Spread onto a \`next/image\` for a gallery photo: adds the blur-up
 *  placeholder when one was generated for that src, nothing when it wasn't. */
export function galleryBlur(src: string) {
  const blurDataURL = GALLERY_BLUR[src]
  return blurDataURL ? ({ placeholder: "blur", blurDataURL } as const) : {}
}
`
)

console.log(`wrote ${entries.length} entries`)
