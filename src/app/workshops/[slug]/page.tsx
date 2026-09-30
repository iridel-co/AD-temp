import { redirect } from "next/navigation"
import { interestHref } from "@/lib/interest"

/**
 * Workshop detail pages are switched off while the event build collects
 * interest. Every /workshops/<slug> request goes to the interest form with
 * "workshops" preselected.
 */
export default function WorkshopPage() {
  redirect(interestHref("workshops"))
}
