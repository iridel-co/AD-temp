/**
 * Form → confirmation-page bridge.
 *
 * The forms carry what was submitted to a confirmation page so it feels like a
 * real post-submit destination rather than a static page. Only the interest
 * flow (`/interest/thanks`) reads it today; the corporate form is locked and
 * its confirmation route is retired. `sessionStorage` carries
 * the payload across the `router.push` and dies with the tab — nothing is sent
 * anywhere, which is what the demo's own footnote promises.
 *
 * Every read/write is wrapped: private-mode Safari and "block site data"
 * settings throw on access, and a confirmation page that crashes is far worse
 * than one that falls back to generic copy. Every consumer must render
 * correctly when this returns `null`.
 */

import type { Interest } from "@/lib/interest"

type CorporateHandoff = {
  kind: "corporate"
  fullName: string
  email: string
  company: string
  program: string
  attendees: string
  targetDate: string
  venue: string
  /** Optional extra programmes (titles). Absent on payloads saved before 2026-09-19. */
  alsoInterested?: string[]
}

export type InterestHandoff = {
  kind: "interest"
  fullName: string
  interest: Interest
}

export type Handoff = CorporateHandoff | InterestHandoff

const KEY = "ad-demo-handoff"

export function saveHandoff(payload: Handoff): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(payload))
  } catch {
    // Storage unavailable — the confirmation page falls back to generic copy.
  }
}

export function readHandoff<K extends Handoff["kind"]>(
  kind: K
): Extract<Handoff, { kind: K }> | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      (parsed as Handoff).kind === kind
    ) {
      return parsed as Extract<Handoff, { kind: K }>
    }
    return null
  } catch {
    return null
  }
}

/** First name for a greeting, or `null` when there's nothing to greet with. */
export function firstNameOf(fullName: string | undefined): string | null {
  const first = fullName?.trim().split(/\s+/)[0]
  return first ? first : null
}
