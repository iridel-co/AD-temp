import { z } from "zod"

/**
 * Event interest list: the contract shared by the form, the API route, the
 * privacy notice and every CTA that links to the form. Keep the values in sync
 * with the CHECK constraint in supabase/migrations/*_interest_signups.sql.
 */

export const INTERESTS = ["workshops", "corporate", "both"] as const
export type Interest = (typeof INTERESTS)[number]

export const INTEREST_LABELS: Record<Interest, string> = {
  workshops: "Workshops",
  corporate: "Corporate training",
  both: "Both",
}

export const INTEREST_PATH = "/interest"
export const INTEREST_THANKS_PATH = "/interest/thanks"
export const INTEREST_API = "/api/interest"
export const PRIVACY_PATH = "/privacy"

/** Bump this string whenever the privacy notice or the consent wording changes. */
export const CONSENT_VERSION = "2026-10-01"

/** Legal entity named in the consent text and on the privacy notice. */
export const DATA_CONTROLLER = "Maximum Impact Training Development"

// Interim privacy contact until the client confirms their own address.
export const PRIVACY_CONTACT_EMAIL = "chanabayabay@gmail.com"

/** sessionStorage key: the last page visited before the form (written by <PathTracker>). */
export const LAST_PATH_KEY = "ad-last-path"

/** Hidden anti-spam field name. A real person never fills it. */
export const HONEYPOT_FIELD = "website"

/** Link to the form with the visitor's interest preselected. */
export function interestHref(from?: Interest): string {
  return from ? `${INTEREST_PATH}?from=${from}` : INTEREST_PATH
}

/** `?from=` → Interest. A missing or unknown value falls back to "both". */
export function parseInterest(value: unknown): Interest {
  return typeof value === "string" &&
    (INTERESTS as readonly string[]).includes(value)
    ? (value as Interest)
    : "both"
}

/** Client-side form schema (react-hook-form + zodResolver). */
export const interestSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name.").max(120),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  designation: z.string().trim().min(2, "Your role or title.").max(120),
  // Optional: blank is fine (the route stores null); if given, 2-120 chars.
  company: z
    .string()
    .trim()
    .max(120)
    .refine((v) => v === "" || v.length >= 2, "Enter at least 2 characters.")
    .optional(),
  interest: z.enum(INTERESTS, { message: "Pick one." }),
  consentPrivacy: z.literal(true, {
    message: "You need to agree to continue.",
  }),
  consentUpdates: z.boolean(),
})
export type InterestValues = z.infer<typeof interestSchema>

/** Server-side payload schema: the form values plus the page the visitor came from. */
export const interestPayloadSchema = interestSchema.extend({
  sourcePath: z.string().startsWith("/").max(300).optional(),
})
export type InterestPayload = z.infer<typeof interestPayloadSchema>
