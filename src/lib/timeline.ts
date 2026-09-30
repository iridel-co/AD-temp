/**
 * Adrian Ding's journey — feeds the About-page <JourneyTimeline>.
 *
 * Certification entries (2004 / 2017 / 2021) are from the PRD. Career-milestone
 * entries are representative framing around the PRD facts (CEO of Maximum Impact
 * PH, 20+ years, 20,000+ leaders trained across HSBC, Wipro, Petron and more).
 * TODO: confirm founding year and milestone wording with the client.
 */
import type { TimelineEntry } from "@/app/_components/timeline"

export const JOURNEY: TimelineEntry[] = [
  {
    year: "2004",
    title: "Certified Trainer — Peak Potentials",
    body: "Completed the Train the Trainer certification under T. Harv Eker's Peak Potentials. It became the foundation of Adrian's platform craft and the way he designs a room.",
    logoSrc: "/images/logos/trainer-logo.webp",
    logoAlt: "Peak Potentials Train the Trainer",
  },
  {
    year: "2005",
    title: "Maximum Impact PH takes shape",
    body: "Adrian starts building what becomes Maximum Impact PH — first as a solo corporate trainer taking on whatever work came, then as a practice with a point of view.",
    logoSrc: "/images/logos/maximum-impact-logo.png",
    logoAlt: "Maximum Impact PH",
  },
  {
    year: "2012",
    title: "Into the boardrooms of the Top 500",
    body: "The client list grows into the country's largest companies — HSBC, Wipro, Petron and more — and the work shifts from one-off talks to multi-year leadership programs.",
  },
  {
    year: "2017",
    title: "Genos International — Emotional Intelligence",
    body: "Certified in the Genos Emotional Intelligence coaching practice, adding a measured, science-backed layer to the leadership and culture work.",
    logoSrc: "/images/logos/genos-logo.webp",
    logoAlt: "Genos International",
  },
  {
    year: "2021",
    title: "INSEAD — Executive Education",
    body: "Completed an Executive Education programme at INSEAD, alongside a background in Mass Communication — sharpening the strategy and the storytelling behind every keynote.",
    logoSrc: "/images/logos/insead-logo.png",
    logoAlt: "INSEAD",
  },
  {
    year: "Today",
    title: "CEO, Maximum Impact PH",
    body: "20+ years in the training circuit and more than 20,000 professionals trained. The focus now is opening that same work to individuals through public workshops.",
  },
]
