/**
 * Public workshop catalogue — powers the workshops list, calendar and the
 * landing-page cards (all under the Coming Soon veil). Detail pages are
 * switched off (`/workshops/[slug]` redirects to the interest form), so only
 * card fields are kept; course copy and prices were removed 2026-10-01.
 *
 * In the real build this is CMS-managed.
 *
 * The first three entries (salesmanship, leadership, train-the-trainers) are
 * the client's own courses and head the list; the rest are demo entries.
 *
 * Each workshop carries 1–3 `tags` from `WORKSHOP_TAGS` (added 2026-09-19 — the
 * client wanted it obvious at a glance which area a course serves).
 */

/**
 * Fixed taxonomy for "which area does this workshop serve". Order here is the
 * display order everywhere (card pills, filter chips). In the real build this is
 * a CMS taxonomy field, not free text — see README "Backend / CRM / CMS".
 */
export const WORKSHOP_TAGS = [
  "Leadership",
  "Sales",
  "Communication",
  "Coaching",
  "Customer Experience",
  "Culture",
  "Train-the-Trainer",
] as const
export type WorkshopTag = (typeof WORKSHOP_TAGS)[number]

export type Workshop = {
  slug: string
  title: string
  /** 1–3 tags from WORKSHOP_TAGS, most relevant first. Shown as pills on every
   *  card; drives the /workshops filter. */
  tags: WorkshopTag[]
  /** ISO 8601 with PH offset. */
  start: string
  /** Human-readable schedule line. */
  schedule: string
  venue: string
  city: string
  /** Card fill — path under `public/images/`. */
  image: string
  status: "open" | "past"
  /** One-line hook for cards. */
  summary: string
}

const WORKSHOPS: Workshop[] = [
  {
    slug: "exceptional-salesmanship",
    title: "Exceptional Salesmanship",
    // TODO: client sign-off on tags
    tags: ["Sales", "Customer Experience"],
    start: "2026-10-09T09:00:00+08:00",
    schedule: "Friday, October 9, 2026 · 9:00 AM – 5:00 PM",
    venue: "SEDA Ayala Center Cebu, E-bloc",
    city: "Cebu City",
    image: "/images/gallery/primaryhomes/photo-3.jpg",
    status: "open",
    summary:
      "A one-day masterclass on attracting high-value clients, improving conversions and growing revenue — without pressure tactics.",
  },
  {
    // Client's own course (supplied 2026-09-17).
    slug: "exceptional-leadership",
    title: "Exceptional Leadership",
    tags: ["Leadership", "Communication"],
    start: "2026-10-16T09:00:00+08:00",
    schedule: "Friday, October 16, 2026 · 9:00 AM – 5:00 PM",
    venue: "SEDA Ayala Center Cebu, E-bloc",
    city: "Cebu City",
    image: "/images/gallery/sunlife/photo-3.jpg",
    status: "open",
    summary:
      "A concise, intensive day for the modern leader — grow from within, then lead a team that performs without you in the room.",
  },
  {
    // Client's own course (supplied 2026-09-17). The title is shortened to fit
    // a card; his full title ("… Certification Program for Exceptional
    // Presentations") is kept in `summary`.
    slug: "train-the-trainers-certification",
    title: "Train the Trainers Certification Program",
    tags: ["Train-the-Trainer", "Communication"],
    start: "2026-11-11T09:00:00+08:00",
    schedule: "November 11–13, 2026 · 9:00 AM – 5:00 PM daily",
    venue: "SEDA Ayala Center Cebu, E-bloc",
    city: "Cebu City",
    image: "/images/gallery/exceptional-salesmanship-manila-2025/photo-4.jpg",
    status: "open",
    summary:
      "A three-day boot camp for exceptional presentations — design, deliver and certify as a high-impact trainer and facilitator.",
  },
  // TODO: placeholder open workshops — added to preview a fuller catalogue.
  // Replace with the client's real upcoming dates.
  {
    slug: "presenting-with-impact",
    title: "Presenting with Impact",
    tags: ["Communication"],
    start: "2026-10-23T09:00:00+08:00",
    schedule: "Friday, October 23, 2026 · 9:00 AM – 5:00 PM",
    venue: "SEDA Ayala Center Cebu, E-bloc",
    city: "Cebu City",
    image: "/images/gallery/axa/photo-3.jpg",
    status: "open",
    summary:
      "Command a room, build a talk that lands, and handle questions without losing the thread — a full day of stagecraft for anyone who presents to clients, boards or their own team.",
  },
  {
    slug: "negotiation-essentials",
    title: "Negotiation Essentials",
    tags: ["Sales", "Communication"],
    start: "2026-11-06T09:00:00+08:00",
    schedule: "Friday, November 6, 2026 · 9:00 AM – 5:00 PM",
    venue: "SEDA Ayala Center Cebu, E-bloc",
    city: "Cebu City",
    image: "/images/gallery/dueksaminc/photo-3.jpg",
    status: "open",
    summary:
      "Prepare, open and close a negotiation so both sides leave able to say yes — a practical day on leverage, trade-offs and holding your number without burning the relationship.",
  },
  {
    slug: "coaching-for-managers",
    title: "Coaching for Managers",
    tags: ["Coaching", "Leadership"],
    start: "2026-11-20T09:00:00+08:00",
    schedule: "Friday, November 20, 2026 · 9:00 AM – 5:00 PM",
    venue: "SEDA Ayala Center Cebu, E-bloc",
    city: "Cebu City",
    image: "/images/gallery/evercare/photo-3.jpg",
    status: "open",
    summary:
      "Trade rescuing your team for developing it — a full day on the questions, feedback and follow-through that turn everyday conversations into growth.",
  },
  {
    slug: "customer-experience-excellence",
    title: "Customer Experience Excellence",
    tags: ["Customer Experience"],
    start: "2026-12-04T09:00:00+08:00",
    schedule: "Friday, December 4, 2026 · 9:00 AM – 5:00 PM",
    venue: "SEDA Ayala Center Cebu, E-bloc",
    city: "Cebu City",
    image: "/images/gallery/primaryhomes/photo-5.jpg",
    status: "open",
    summary:
      "Turn ordinary service into a reason customers come back — a full day on the standards, recovery moves and team habits behind an experience people talk about.",
  },
  {
    // TODO: replace representative past events with the client's real history.
    slug: "building-winning-cultures-2025",
    title: "Building Winning Cultures",
    tags: ["Culture", "Leadership"],
    start: "2025-11-14T09:00:00+08:00",
    schedule: "November 14, 2025 · 9:00 AM – 5:00 PM",
    venue: "SEDA Ayala Center Cebu, E-bloc",
    city: "Cebu City",
    image: "/images/gallery/sunlife/photo-5.jpg",
    status: "past",
    summary:
      "A sold-out day on the habits and rituals that turn a group of good people into a high-performing team.",
  },
]

export const OPEN_WORKSHOPS = WORKSHOPS.filter((w) => w.status === "open")
