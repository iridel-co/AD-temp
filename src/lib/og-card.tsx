/**
 * Shared pieces for `opengraph-image.tsx`: the ink colour and the dark
 * left-to-right scrim laid over the treated room-plate photo.
 */

export const OG_INK = "#0a0606"
const OG_SCRIM =
  "linear-gradient(90deg, rgba(8,6,6,0.92) 0%, rgba(8,6,6,0.62) 46%, rgba(8,6,6,0.3) 78%, rgba(8,6,6,0.5) 100%)"

export function ogScrim() {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1200,
        height: 630,
        display: "flex",
        background: OG_SCRIM,
      }}
    />
  )
}
