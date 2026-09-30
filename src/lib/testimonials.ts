/**
 * Testimonials for the landing carousel and the corporate-training page.
 *
 * TODO: every `quote` below is a placeholder. Replace verbatim (do not
 * paraphrase) from Coach_Adrian_Ding_Website_2025.pdf once supplied.
 *
 * TODO: `photo` is unset on every entry — drop headshots in `public/images/`
 * and point each `photo` at its path. Orgs without logo artwork (Knowles,
 * PETDA, Rotary International) render as a name chip until a `logo` is added.
 */

export type Testimonial = {
  quote: string
  name: string
  role: string
  org: string
  /** Include in the corporate-training page's curated subset. */
  corporate: boolean
  /**
   * Headshot under /public. TODO: none supplied yet — the carousel shows a
   * placeholder avatar until a real path is set here.
   */
  photo?: string
  /** Company logo under /public. Omitted orgs render as a name chip. */
  logo?: string
  /** Logo artwork proportion; "square" emblems get a taller box. */
  logoShape?: "wide" | "square"
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Adrian did not give us a seminar, he gave us a standard. Six months on, the language from that room is still how our managers talk to their teams.",
    name: "L&D Lead",
    role: "Learning & Development",
    org: "Wipro",
    corporate: true,
    logo: "/images/logos/co-wipro.svg",
    logoShape: "square",
  },
  {
    quote:
      "The session paid for itself in the first quarter. Our people left with a process, not just motivation — and the process stuck.",
    name: "Head of Sales Enablement",
    role: "Sales Enablement",
    org: "Global Payments",
    corporate: true,
    logo: "/images/logos/co-global-payments.svg",
  },
  {
    quote:
      "Practical, direct, and clearly built by someone who has run a team himself. Our store leaders finally had words for what good looks like.",
    name: "HR Director",
    role: "Human Resources",
    org: "Rose Pharmacy",
    corporate: false,
    logo: "/images/logos/co-rose-pharmacy.png",
  },
  {
    quote:
      "Adrian reads a room better than anyone we have brought in. He met our engineers where they were and still moved them.",
    name: "Plant HR Manager",
    role: "Human Resources",
    org: "Knowles",
    corporate: false,
  },
  {
    quote:
      "We have used a lot of trainers. Adrian is the one our leaders still quote by name a year later.",
    name: "VP for People",
    role: "People & Culture",
    org: "Global Pacific",
    corporate: true,
    logo: "/images/logos/co-global-pacific.png",
  },
  {
    quote:
      "High energy without the fluff. He respected our time and sent everyone back to the floor with something they could use on Monday.",
    name: "Regional L&D Manager",
    role: "Learning & Development",
    org: "HSBC",
    corporate: true,
    logo: "/images/logos/co-hsbc.svg",
  },
  {
    quote:
      "The feedback scores were the highest we have recorded for an external facilitator. Our members asked when he is coming back.",
    name: "Programs Chair",
    role: "Board of Trustees",
    org: "PETDA",
    corporate: false,
  },
  {
    quote:
      "Adrian understands that leadership is service. That came through in every exercise, and it landed with a very senior audience.",
    name: "District Governor",
    role: "District Leadership",
    org: "Rotary International",
    corporate: false,
  },
]

export const CORPORATE_TESTIMONIALS = TESTIMONIALS.filter((t) => t.corporate)
