import { SiteCta } from "@/app/_components/site-cta"
import { interestHref } from "@/lib/interest"

/**
 * Landing closer: the same red CTA band as /workshops and /about, with the
 * navbar pill's target (the interest form, no preset) as the primary action.
 */
export function LandingClosingCta() {
  return (
    <SiteCta
      heading="Be first in the room"
      subtext="Workshops and corporate programmes open soon. Join the list and we'll tell you the moment dates are set."
      primaryLabel="Get notified"
      primaryHref={interestHref()}
    />
  )
}
