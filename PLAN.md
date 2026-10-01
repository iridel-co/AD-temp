# PLAN — Event build: interest list, "coming soon" glass, privacy notice

Repo: `/Users/chanchan/Programming/Iridel/demos/AD-temp` (baseline `fd8c347`). Client tests
tomorrow (Oct 1); event Oct 2. Event visitors scan a QR code, land on `/`, browse, and join
one Supabase list.

**Binding for every task:** `CLAUDE.md` (repo), `/Users/chanchan/Programming/Iridel/tasks/RULES.md`,
and `tasks/rules/07-nextjs.md` §21–22 (forms). Never edit `src/components/**`. Never edit
`src/app/_components/companies-marquee.tsx`. Tailwind class strings must be literal. No
string built from a variable. Do not add an eyebrow above a section `<h2>`.

**Explicit override:** RULES §2 says Iridel demos are frontend-only. Chan has decided this
event build gets one server route that writes to Supabase. That route is the only backend.
Add nothing else server-side.

---

## 0. Contracts (every task follows these; no task needs to see another task's code)

### 0.1 Shared module: `src/lib/interest.ts` (Task 0 writes it verbatim)

```ts
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

// TODO(client): the privacy contact email is still pending from Adrian's team.
// While it is null, the privacy notice shows a visible "to follow" placeholder
// instead of a mailto link. Set this before the event on Oct 2.
export const PRIVACY_CONTACT_EMAIL: string | null = null

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
  fullName: z.string().min(2, "Please enter your full name.").max(120),
  email: z.string().email("Enter a valid email address.").max(254),
  designation: z.string().min(2, "Your role or title.").max(120),
  company: z.string().min(2, "Which company? Self-employed is fine.").max(120),
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
```

### 0.2 Routes and query parameters

| Route                                       | Owner  | Notes                                                                                                                                  |
| ------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `/interest?from=workshops\|corporate\|both` | Task 1 | `from` preselects the interest. Missing or unknown → `both`. Every CTA builds this with `interestHref()`, never a hand-written string. |
| `/interest/thanks`                          | Task 1 | Confirmation route (RULES §22: a real route, not an inline "done" panel). `robots: noindex`.                                           |
| `/privacy`                                  | Task 2 | Privacy notice.                                                                                                                        |
| `POST /api/interest`                        | Task 2 | JSON in, JSON out.                                                                                                                     |

Preset rule for CTAs: a workshop page or workshop CTA → `interestHref("workshops")`. A
corporate page or corporate CTA → `interestHref("corporate")`. A neutral CTA (the navbar on
`/`, `/about` or `/gallery`) → `interestHref()`, which becomes "both".

### 0.3 API payload

Request `POST /api/interest`, `Content-Type: application/json`:

```jsonc
{
  "fullName": "Juan Dela Cruz",
  "email": "Juan@Email.com", // the server trims and lowercases it
  "designation": "Sales Manager",
  "company": "Acme PH",
  "interest": "workshops", // workshops | corporate | both
  "consentPrivacy": true, // must be literally true
  "consentUpdates": false,
  "sourcePath": "/workshops/exceptional-salesmanship", // optional, from sessionStorage LAST_PATH_KEY
  "website": "", // honeypot. Non-empty → the server returns 200 {ok:true} and writes nothing
}
```

Responses: `200 {"ok":true}` · `400 {"ok":false,"error":"invalid"}` ·
`500 {"ok":false,"error":"server"}`. The client treats anything but `ok:true` as a failure
and shows one generic inline error.

### 0.4 Handoff (sessionStorage → confirmation page)

Add this to `src/app/_lib/handoff.ts` (Task 1 owns the file):
`export type InterestHandoff = { kind: "interest"; fullName: string; interest: Interest }`.
Add it to the `Handoff` union.

### 0.5 GlassLock component: `src/app/_components/glass-lock.tsx` (Task 3 owns it)

This is a server component with no `"use client"`, so it can wrap client children.

```tsx
type GlassLockProps = {
  children: React.ReactNode // the original UI, still rendered underneath
  interest?: Interest // CTA → interestHref(interest). Omitted → interestHref()
  heading?: string // default "Coming soon"
  body?: string // default "Registration opens soon. Join the early-access list and you'll hear first."
  ctaLabel?: string // default "Get early access"
  variant?: "panel" | "chip" // panel = heading + body + CTA; chip = small "Coming soon" pill, no CTA
  className?: string // on the outer wrapper (width, radius, margins)
}
```

Behavior (fixed):

- Outer `div.relative.isolate`.
- Children sit in `<div inert aria-hidden="true" className="pointer-events-none select-none blur-[5px] saturate-[.85]">`.
  The children are blurred with CSS `filter`, not with the overlay's backdrop-filter, because
  `filter` works under any ancestor opacity or transform (the GSAP `<Reveal>` wrappers). They
  stay visible but read as locked. `inert` removes them from both the tab order and the
  pointer.
- The overlay is `absolute inset-0 z-10 flex items-center justify-center p-4` with a faint
  `bg-background/20`. It holds the glass card:
  `relative max-w-sm w-full rounded-2xl border border-white/60 bg-white/45 backdrop-blur-2xl backdrop-saturate-150 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.85),inset_0_-1px_0_0_rgb(255_255_255/0.3),0_24px_60px_-24px_rgb(0_0_0/0.4)]`.
  A `before:` sheen sits on top: `before:absolute before:inset-0 before:rounded-[inherit] before:bg-linear-to-br before:from-white/60 before:via-white/10 before:to-transparent before:pointer-events-none`.
  Text is `text-foreground`. Card contents:
  - a small uppercase label, "Coming soon". A label inside a card is allowed by RULES §4.
  - `<p className="font-serif text-2xl">` with the heading. Use a `<p>`, not a heading tag, so
    the page outline is left alone.
  - the body text.
  - `<Button asChild variant="brand"><Link href=…>{ctaLabel} <ArrowRight/></Link></Button>`.
- `chip` variant: same wrapper and blur. The overlay holds only a small glass pill with a
  "Coming soon" label and no CTA. Use it for inline facts such as a price row.
- The glass card must stay readable on both white and brand-red grounds, so there is no
  `tone` prop. Check both grounds in Task 5.
- Motion: none needed. If added, only `transition-opacity` with `motion-reduce:transition-none`.

---

## 1. Architecture decisions

| Decision             | Choice                                                                                                                                                                                         | Why (one line)                                                                                                                                                                                                                                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Where the form lives | **Its own route, `/interest?from=…`**, not a global modal                                                                                                                                      | Every CTA becomes a plain `<Link>` (many CTAs are server components or `href` props on `SiteCta`/`LandingPaths`). A URL can be deep-linked or put in a QR code. A route needs no global provider. It matches RULES §22, which requires a real confirmation route, and an uncontrolled Radix `Dialog` loses its state on close. |
| Page layout          | Same split as `corporate-training/_sections/inquiry-cta.tsx`: `BloomFieldBackground` brand ground, heading on the left, white floating form card on the right                                  | This is the existing house pattern for "the form as a section". Reuse it.                                                                                                                                                                                                                                                      |
| Interest preset      | Read `searchParams` in `page.tsx` on the server, then pass it as the `initialInterest` prop                                                                                                    | No first-render flash and no `useSearchParams` Suspense boundary. The route becomes dynamic, which is fine.                                                                                                                                                                                                                    |
| Success screen       | `router.push("/interest/thanks")` with a sessionStorage handoff                                                                                                                                | This is the same mechanism both existing forms use (`saveHandoff`). The thanks page must render correctly when the payload is `null`.                                                                                                                                                                                          |
| Submit mechanism     | **Route handler `src/app/api/interest/route.ts`**, which calls **plain `fetch` to PostgREST RPC** `/rest/v1/rpc/upsert_interest_signup`                                                        | `@supabase/supabase-js` is **not installed**. One fetch avoids adding a dependency. An RPC is needed because PostgREST `on_conflict` cannot target the `lower(email)` expression index, but SQL `ON CONFLICT ((lower(email)))` can. It is a route handler rather than a server action so it can be tested with curl.           |
| Validation           | `zod` (already `^4.1.13`) + `@hookform/resolvers` (already installed). One shared schema in `src/lib/interest.ts`                                                                              | Client and server cannot drift.                                                                                                                                                                                                                                                                                                |
| Spam                 | Honeypot field `website`, visually hidden, `tabIndex={-1}`, `autoComplete="off"`, excluded from the zod client schema. The server returns a silent `200` and does not write                    | The cheapest spam control that works. Rate limiting is an open item.                                                                                                                                                                                                                                                           |
| Source path          | `<PathTracker>`, a client component in `layout.tsx`, writes the current pathname to sessionStorage `LAST_PATH_KEY` on every route change except `/interest*`. The form reads it at submit time | `document.referrer` does not update on client-side navigation. This way no CTA has to carry the path itself.                                                                                                                                                                                                                   |
| Supabase auth header | `apikey: <SUPABASE_SECRET_KEY>`. Also send `Authorization: Bearer <key>` **only if the key starts with `eyJ`** (a legacy service_role JWT)                                                     | New `sb_secret_…` keys are not JWTs. Task 5 confirms the key works with one curl.                                                                                                                                                                                                                                              |
| Glass component      | One `GlassLock` component in `src/app/_components/`, with a `panel` or `chip` variant                                                                                                          | It is applied in 6 places (listed in Task 3). Two variants cover a whole section and a single inline fact.                                                                                                                                                                                                                     |
| Hidden routes        | **Delete** `src/app/staff-login/` and `src/app/email-templates/` and remove their footer links                                                                                                 | Both are staff or review routes and footer-linked. The git baseline keeps them. After deleting, run `rm -rf .next` before typecheck (07-nextjs rule).                                                                                                                                                                          |
| `src/app/api`        | It does not exist yet, so nothing needs hiding                                                                                                                                                 | The existing forms post nowhere: they are frontend-only and use `saveHandoff` + `router.push`.                                                                                                                                                                                                                                 |

### Existing form pattern (clone this; source files: `src/app/workshops/[slug]/_sections/registration-form.tsx` and `src/app/corporate-training/_sections/inquiry-form.tsx`)

- `"use client"`. `useForm<FormValues>({ resolver: zodResolver(schema), mode: "onTouched" })`
  from `react-hook-form`. Destructure `register, handleSubmit, trigger, getValues, watch, formState: { errors }`.
- `const STEPS: { title: string; fields: (keyof FormValues)[] }[]`. State:
  `const [step, setStep] = useState(0)` and `const [submitting, setSubmitting] = useState(false)`.
  `paneRef = useRef<HTMLDivElement>(null)`.
- `next = async () => { if (await trigger(STEPS[step].fields)) setStep(s => Math.min(s+1, STEPS.length-1)) }`.
  `back = () => setStep(s => Math.max(s-1, 0))`.
- **Step transition animation is GSAP**, imported from `@/app/_lib/gsap`
  (`import { gsap, useGSAP } from "@/app/_lib/gsap"`):
  ```ts
  useGSAP(
    () => {
      const el = paneRef.current
      if (!el) return
      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          el,
          { opacity: 0, x: 24 },
          { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }
        )
      })
      return () => mm.revert()
    },
    { dependencies: [step], scope: paneRef }
  )
  ```
- Layout, top to bottom:
  - Progress bars: `flex items-center gap-2`, one `h-1 flex-1 rounded-full transition-colors`
    per step, `bg-brand` when `i <= step`, otherwise `bg-border`.
  - `<p className="text-muted-foreground text-xs tracking-[0.1em] uppercase">Step {step+1} of {STEPS.length} · {current.title}</p>`.
  - `<div ref={paneRef} className="mt-10 space-y-5">` with `{step === n && (...)}` blocks.
- Inputs: `<Input className="placeholder:text-muted-foreground/50 h-12 text-base" autoComplete=… placeholder=… {...register("x")} />`,
  wrapped in a local `Field({label, error, children})` helper (`space-y-1.5`, `<Label>`, error
  as `<p className="text-destructive text-sm">`). Copy the helper; do not import it.
- Checkbox: `<label className="flex items-start gap-3"><input type="checkbox" className="accent-brand mt-1 size-4" {...register("consent")}/><span className="text-muted-foreground text-sm leading-relaxed">…</span></label>`.
- Selectable tiles: copy `TILE_BASE / TILE_OFF / TILE_ON / TILE_CHECK_*` from
  `inquiry-form.tsx` lines 67–85. They are real inputs, visually hidden, inside a `<fieldset>`
  with a `<legend>`. For the interest picker, use `type="radio"`. Per the memory rule, the
  border and glow change on hover together with the fill.
- Action row: `mt-8 flex flex-wrap-reverse items-center justify-between gap-x-6 gap-y-4`. The
  phone line sits on the left ("Rather ask first? Call or text 0920 900 7709", `tel:+639209007709`).
  On the right: a ghost Back button, then **`key="continue"` type=button / `key="submit"` type=submit
  brand buttons (distinct keys are mandatory, see RULES §21)**.
- The form card (corporate variant):
  `bg-background text-foreground rounded-xl p-6 shadow-2xl outline-none sm:p-10`.
- **Leave out `DemoFillButton`.** This form is live.

---

## Task 0 — Shared contract file (serial, first, about 2 minutes, Sonnet)

**Owns:** `src/lib/interest.ts`.
**Do:** Write §0.1 verbatim, then run `npx prettier --write src/lib/interest.ts && npx tsc --noEmit`.
**Accept:** The file exists and typecheck passes. Launch Tasks 1–4 together once this is done.

---

## Task 1 — Interest form, page, and thanks page (parallel, Sonnet)

**Owns (only these):**

- `src/app/interest/page.tsx` (new)
- `src/app/interest/_sections/signup.tsx` (new)
- `src/app/interest/_sections/interest-form.tsx` (new)
- `src/app/interest/thanks/page.tsx` (new)
- `src/app/interest/thanks/_sections/received.tsx` (new)
- `src/app/_lib/handoff.ts` (add `InterestHandoff`, §0.4)

**Do:**

1. `page.tsx` is composition only. It exports `metadata`
   (`title: "Join the early-access list — Coach Adrian Ding"`, a one-sentence description,
   and no "demo" wording) and
   `export default async function InterestPage({ searchParams }: { searchParams: Promise<{ from?: string | string[] }> })`.
   It awaits `searchParams`, takes the first value if it is an array, and calls
   `parseInterest(...)`. It renders `<SiteNavbar />`, then
   `<main id="main-content"><InterestSignup initialInterest={…} /></main>`, then `<SiteFooter />`.
2. `signup.tsx`: clone the `CorporateInquiryCta` layout (full-bleed `BloomFieldBackground`,
   `grid lg:grid-cols-[1fr_1.1fr]`, left column centered). The left column holds the page
   `<h1>` (font-serif, the same size scale as the inquiry CTA `h2`), text: **"Be first in the
   room."** The subtext: _"New workshop dates and corporate programmes are being finalised.
   Leave your details and Adrian's team will reach out before anyone else hears."_
   The right column holds `<InterestForm initialInterest=… />`. Leave out `scroll-mt`.
   Top padding must clear the sticky navbar; follow the page pattern of `/about`.
3. `interest-form.tsx` follows the pattern above with **3 steps**:
   - Step 1, "Your details": `fullName` (autoComplete `name`), `email` (type email,
     autoComplete `email`).
   - Step 2, "Your work": `designation` (label "Designation / role", autoComplete
     `organization-title`), `company` (autoComplete `organization`, placeholder
     "Company, or Self-employed").
   - Step 3, "Almost done": the `interest` radio tiles for all 3 `INTERESTS` with
     `INTEREST_LABELS`, preselected from `defaultValues: { interest: initialInterest, consentUpdates: false }`,
     legend "I'm interested in". Below the tiles, two checkboxes:
     - **required** `consentPrivacy`: _"I agree to {DATA_CONTROLLER} collecting and using
       the details above to follow up on my interest, as described in the
       [Privacy Notice](PRIVACY_PATH), in line with the Data Privacy Act of 2012 (RA 10173)."_
       The link uses `target="_blank" rel="noopener noreferrer"` so the form state survives,
       and `underline`.
     - **optional, unticked** `consentUpdates`: _"Also send me occasional updates about new
       workshop dates and programmes. I can unsubscribe any time."_
   - Honeypot: an uncontrolled `<input name={HONEYPOT_FIELD}>` read through a ref, inside
     `<div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">`,
     with `tabIndex={-1}` and `autoComplete="off"`. It is **not** in the zod schema.
   - `onSubmit` is async. It sets `setSubmitting(true)` and clears the error. It reads
     `sessionStorage.getItem(LAST_PATH_KEY)` inside try/catch, and only at submit time. It
     then calls `fetch(INTEREST_API, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({...values, sourcePath, website: honeypotRef.current?.value ?? ""}) })`.
     On `ok:true`: call `saveHandoff({ kind: "interest", fullName, interest })`, then
     `router.push(INTEREST_THANKS_PATH)`. Leave `submitting` true so the button cannot
     double-submit. On failure or thrown error: set an inline error
     _"We couldn't save that just now. Please try again, or call or text 0920 900 7709."_
     (`role="alert"`, `text-destructive text-sm`, above the action row), then call
     `setSubmitting(false)`.
   - Submit label: "Join the list", or "Saving…" while submitting. Continue and Back work as
     in the existing forms.
4. `thanks/page.tsx`: composition only. Metadata `title: "You're on the list — Coach Adrian Ding"`,
   `robots: { index: false, follow: false }`. Renders navbar, `<InterestReceived />`, footer.
5. `received.tsx` is `"use client"`. It reads `readHandoff("interest")` **in a `useEffect`**,
   never during the first render (07-nextjs rule). Heading: _"You're on the list."_ When a
   name exists, add `firstNameOf` to it: "You're on the list, Juan." Line: _"We'll email you
   as soon as {dates for public workshops / corporate programme slots / new dates and
   programmes} are confirmed."_ Pick the phrase by `interest`; with no payload, use the
   generic "both" wording. Below that, three browse links: Workshops (`/workshops`),
   Corporate training (`/corporate-training`), About Adrian (`/about`), plus a link back
   home. It must look finished with a `null` payload.

**Accept:**

- `npx tsc --noEmit` passes once Tasks 0 and 2–4 have landed. On its own: no new errors in
  owned files, and `npx eslint src/app/interest src/app/_lib/handoff.ts` is clean.
- `npx prettier --write` has been run on the owned files.
- Keyboard: Tab reaches each input in order. The radio tiles show `focus-visible` rings.
  Pressing Enter in a step-1 input does not submit the whole form.
- Report the exact copy you used.

---

## Task 2 — API route, SQL, privacy page, footer, route hiding, path tracker (parallel, Sonnet)

**Owns (only these):**

- `src/app/api/interest/route.ts` (new)
- `supabase/migrations/20260930120000_interest_signups.sql` (new)
- `src/app/privacy/page.tsx` (new) and `src/app/privacy/_sections/notice.tsx` (new)
- `src/app/_components/path-tracker.tsx` (new)
- `src/app/layout.tsx` (mount `<PathTracker />` inside `<body>`, nothing else)
- `src/app/_components/site-footer.tsx`
- delete `src/app/staff-login/` and `src/app/email-templates/` (whole directories)

**Do:**

1. **SQL:** write this verbatim.

   ```sql
   -- Event interest list (Oct 2 2026). Chan applies this manually in the Supabase SQL editor.
   -- Written only by the Next.js route handler using the server-side secret key (bypasses RLS).
   create table if not exists public.interest_signups (
     id               uuid primary key default gen_random_uuid(),
     full_name        text not null check (char_length(full_name) between 2 and 120),
     email            text not null check (char_length(email) between 3 and 254),
     designation      text not null check (char_length(designation) between 2 and 120),
     company          text not null check (char_length(company) between 2 and 120),
     interest         text not null check (interest in ('workshops', 'corporate', 'both')),
     source_path      text check (source_path is null or char_length(source_path) <= 300),
     consent_privacy  boolean not null check (consent_privacy = true),
     consent_updates  boolean not null default false,
     consent_version  text not null,
     user_agent       text check (user_agent is null or char_length(user_agent) <= 512),
     created_at       timestamptz not null default now(),
     updated_at       timestamptz not null default now()
   );

   create unique index if not exists interest_signups_email_lower_key
     on public.interest_signups (lower(email));

   alter table public.interest_signups enable row level security;
   -- Deliberately NO policies: anon/authenticated get nothing. The secret key bypasses RLS.
   revoke all on table public.interest_signups from anon, authenticated;

   create or replace function public.upsert_interest_signup(
     p_full_name text, p_email text, p_designation text, p_company text,
     p_interest text, p_source_path text, p_consent_privacy boolean,
     p_consent_updates boolean, p_consent_version text, p_user_agent text
   ) returns void
   language sql
   security invoker
   set search_path = ''
   as $$
     insert into public.interest_signups (
       full_name, email, designation, company, interest, source_path,
       consent_privacy, consent_updates, consent_version, user_agent
     ) values (
       p_full_name, lower(trim(p_email)), p_designation, p_company, p_interest, p_source_path,
       p_consent_privacy, p_consent_updates, p_consent_version, p_user_agent
     )
     on conflict ((lower(email))) do update set
       full_name       = excluded.full_name,
       designation     = excluded.designation,
       company         = excluded.company,
       interest        = excluded.interest,
       source_path     = excluded.source_path,
       consent_privacy = excluded.consent_privacy,
       consent_updates = excluded.consent_updates,
       consent_version = excluded.consent_version,
       user_agent      = excluded.user_agent,
       updated_at      = now();
   $$;

   revoke all on function public.upsert_interest_signup(text, text, text, text, text, text, boolean, boolean, text, text)
     from public, anon, authenticated;
   grant execute on function public.upsert_interest_signup(text, text, text, text, text, text, boolean, boolean, text, text)
     to service_role;

   notify pgrst, 'reload schema';
   ```

2. **Route handler** `src/app/api/interest/route.ts`: only `export async function POST(req: Request)`.
   - Read `content-length`. Over 10 000 → 413 `{ok:false,error:"invalid"}`. Call
     `await req.json()` in try/catch; a failure → 400.
   - Honeypot: if `body[HONEYPOT_FIELD]` is a non-empty string after trimming → return
     `200 {ok:true}` and do not write.
   - `interestPayloadSchema.safeParse(body)`. Failure → 400 `{ok:false,error:"invalid"}`.
     Do not echo the zod issues.
   - Read env `SUPABASE_URL` and `SUPABASE_SECRET_KEY` **inside** the handler. If either is
     missing → `console.error` + 500. Never use a `NEXT_PUBLIC_` prefix. Never log the key.
   - Build the headers per §1: `apikey` always; `Authorization: Bearer` only if
     `key.startsWith("eyJ")`. `POST ${url}/rest/v1/rpc/upsert_interest_signup` with
     `cache: "no-store"` and body
     `{ p_full_name: fullName.trim(), p_email: email.trim().toLowerCase(), p_designation: designation.trim(), p_company: company.trim(), p_interest: interest, p_source_path: sourcePath ?? null, p_consent_privacy: true, p_consent_updates: consentUpdates, p_consent_version: CONSENT_VERSION, p_user_agent: req.headers.get("user-agent")?.slice(0, 512) ?? null }`.
   - If the response is not ok → `console.error("interest upsert failed", status, await res.text())`
     - 500. Otherwise `Response.json({ ok: true })`.
   - Personal data never goes into logs: no request body in any `console.*`.
3. **PathTracker** (`"use client"`): `usePathname()` + `useEffect`. If the pathname does not
   start with `/interest`, run `sessionStorage.setItem(LAST_PATH_KEY, pathname)` in
   try/catch. It renders `null`. Mount it once in `layout.tsx` inside `<body>`.
4. **Privacy notice** `/privacy`. `page.tsx` is composition only (navbar, `<PrivacyNotice/>`,
   footer), metadata `title: "Privacy Notice — Coach Adrian Ding"`.
   `notice.tsx` is a single readable column (`mx-auto max-w-3xl px-6 py-16 lg:py-24`, serif
   `h1`, `h2` per section, `text-muted-foreground leading-relaxed` body). It shows
   "Last updated: 1 October 2026 · Version {CONSENT_VERSION}". Sections, kept short:
   1. **Who we are.** {DATA_CONTROLLER}, the organisation behind Coach Adrian Ding's
      workshops and corporate training, is the personal information controller.
   2. **What we collect.** Full name, email, designation, company, what you're interested
      in, whether you want updates, the page you came from, your browser's user-agent, and
      timestamps.
   3. **Why.** To follow up on your interest from the event and our website. If you ticked
      the box, also to send occasional updates. Nothing else. No automated decision-making.
   4. **Legal basis.** Your consent, under the Data Privacy Act of 2012 (Republic Act
      No. 10173) and its IRR. You can withdraw it any time.
   5. **Storage and security.** Stored in a Supabase (cloud Postgres) database with access
      restricted to authorised staff. Encrypted in transit. Never sold.
   6. **Sharing.** Only with service providers that process data for us, such as hosting
      and email, under confidentiality obligations. Never for third-party marketing.
   7. **Retention.** Kept until you withdraw consent or ask us to delete it, and no longer
      than 2 years after our last contact with you. Then it is deleted. _(Flag as open item:
      the client confirms the period.)_
   8. **Your rights.** To be informed, to access, to object, to erasure or blocking, to
      rectification, to data portability, to damages, and to file a complaint with the
      National Privacy Commission (privacy.gov.ph).
   9. **Contact.** If `PRIVACY_CONTACT_EMAIL` is set, render it as a mailto link. If it is
      `null`, render a visible
      `<span className="bg-brand/10 text-brand rounded px-1.5">privacy contact email to follow</span>`
      and keep the code comment `TODO(client)`. You may also give the public phone number
      0920 900 7709.
5. **Footer** (`site-footer.tsx`):
   - Remove lines 21–24 (the `/staff-login` and `/email-templates` entries and their comment).
   - In the bottom row (around lines 140–152), add `<Link href={PRIVACY_PATH}>Privacy Notice</Link>`
     next to the copyright, using the same `text-xs text-white/55 hover:text-white/80` style.
   - **Leave the "Demo by iridel.com" credit unchanged.** It is an open item for Chan.
6. Delete the two route directories. Then `grep -rn "staff-login\|email-templates" src` must
   return nothing. Docs may still mention them.

**Accept:**

- `rm -rf .next && npx tsc --noEmit` passes, and `npx eslint` is clean on the owned files.
  Run prettier on them.
- With `npm run dev` running: `curl -s -X POST localhost:3000/api/interest -H 'content-type: application/json' -d '{}'`
  returns 400, and a honeypot body returns `200 {"ok":true}`. The real insert is tested in
  Task 5, after Chan has applied the SQL. **Stop the dev server before reporting.**
- `/staff-login` and `/email-templates` return 404.

---

## Task 3 — GlassLock + every lock + workshop downplay (parallel, Sonnet; escalate to Opus if the glass look fails review)

**Owns (only these):**

- `src/app/_components/glass-lock.tsx` (new, §0.5)
- `src/app/corporate-training/_sections/inquiry-cta.tsx`
- `src/app/workshops/[slug]/_sections/register-cta.tsx`
- `src/app/workshops/[slug]/_sections/overview.tsx`
- `src/app/workshops/[slug]/_sections/hero.tsx`
- `src/app/workshops/[slug]/_sections/sticky-register-bar.tsx`
- `src/app/workshops/[slug]/_sections/past-cta.tsx`
- `src/app/workshops/_sections/list.tsx`
- `src/app/_components/event-cards.tsx`

Do **not** edit `inquiry-form.tsx`, `registration-form.tsx` or `registration-dialog.tsx`.
The originals stay byte-identical and are wrapped from outside.

**Where GlassLock is applied (complete list):**

| #   | File:line                                                            | Wraps                                                                                                                               | Props                                                                                                                                                                                           |
| --- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G1  | `corporate-training/_sections/inquiry-cta.tsx:37-39`                 | `<CorporateInquiryForm />`, **inside** the existing `<Reveal delay={0.1}>`                                                          | `interest="corporate"`, heading "Corporate inquiries open soon", body "Join the early-access list and Adrian's team will reach out to scope your programme.", ctaLabel "Register your interest" |
| G2  | `workshops/[slug]/_sections/register-cta.tsx` (rewritten, see below) | an inline, visible `<RegistrationForm …/>` in a white card                                                                          | `interest="workshops"`, heading "Registration opens soon"                                                                                                                                       |
| G3  | `workshops/[slug]/_sections/overview.tsx:53-89`                      | the whole register `<aside>` (countdown, seats, Reserve button, which hides the `RegistrationDialog` trigger inside the inert area) | `interest="workshops"`, heading "Dates coming soon", short body "Be first to hear when seats open."                                                                                             |
| G4  | `workshops/[slug]/_sections/overview.tsx:42-50`                      | the `<dl>` with When / Where / Investment                                                                                           | `variant="chip"`                                                                                                                                                                                |
| G5  | `workshops/_sections/list.tsx:25`                                    | `<WorkshopsCalendar …/>`                                                                                                            | `interest="workshops"`, heading "Calendar coming soon", body "Public workshop dates are being finalised. Join the list to get them first.", `className="w-full"`                                |

**Other edits (text-level downplay: glass on a one-line fact is noise, so it is swapped for text):**

- `inquiry-cta.tsx:27-30`: subtext becomes _"Online inquiries open soon. Join the early-access
  list and we'll reach out to build your programme."_ Keep the `h2`. Update the file
  doc-comment.
- `register-cta.tsx`: **rewrite** it to mirror `CorporateInquiryCta`. Full-bleed
  `BloomFieldBackground` section, `text-brand-foreground`, grid `lg:grid-cols-[1fr_1.1fr]`.
  - Left column: `h2` "Registration opens soon", and the p _"Dates and pricing for
    {workshop.title} are being finalised. Join the early-access list and you'll hear first."_
    plus a secondary `Button asChild` → `interestHref("workshops")` "Get early access". It is
    the page's second brand-ish CTA; use `variant="secondary"` as the old banner did.
  - Right column: `<GlassLock interest="workshops" heading="Registration opens soon"><div className="bg-background text-foreground rounded-xl p-6 shadow-2xl sm:p-10"><RegistrationForm slug=… workshopTitle=… schedule=… venue=… /></div></GlassLock>`.
  - Drop the `CtaBanner` and `RegistrationDialog` imports. Keep the export name `RegisterCta`
    and its props.
- `workshops/[slug]/_sections/hero.tsx:72`: the schedule `Chip` text becomes
  **"Dates coming soon"**. Remove the seats pill (lines 76–80).
- `sticky-register-bar.tsx`: remove `RegistrationDialog` and the seats logic
  (lines 52–56, 76–92). The left side shows the title plus a `CalendarDays` line
  "Dates & pricing coming soon". The right side is
  `<Button asChild variant="brand" size="lg"><Link href={interestHref("workshops")} tabIndex={shown ? undefined : -1}>Get early access</Link></Button>`.
  Keep the show/hide scroll logic. Update the doc-comment.
- `past-cta.tsx:46`: remove the `{next.schedule}` line. Past pages link on to the next
  workshop, which is still browsable.
- `event-cards.tsx`: line 313 `{shortDate(w.start)}` becomes "Dates coming soon". Line 341
  `{w.price}` becomes "Pricing soon". Line 356 "Register" becomes "Learn more". The card is
  already a `<Link>` to the browsable workshop page. If `shortDate` or the `Ticket` import
  becomes unused, delete it.

**Accept:**

- Typecheck and eslint are clean on the owned files once Task 0 is in. Prettier has been run.
- In the browser (Task 5 re-checks): on `/corporate-training#inquiry` and
  `/workshops/exceptional-salesmanship`, Tab never lands inside a locked form, `aside` or
  calendar. `document.querySelectorAll('[inert] input')` elements cannot be focused. The
  glass CTA is focusable and routes to `/interest?from=…`.
- The glass card is readable on the brand-red ground (G1, G2) and on the white ground
  (G3–G5), in light mode. Dark mode is not used by this site; confirm by grepping `.dark`
  usage before claiming otherwise.
- At 390px wide the glass card fits inside the locked area and does not overflow the page
  horizontally.

---

## Task 4 — Re-point every form CTA to the interest form (parallel, Sonnet)

**Owns (only these):**
`src/app/_components/site-navbar.tsx`, `src/app/_components/site-cta.tsx`,
`src/app/_sections/paths.tsx`, `src/app/workshops/[slug]/_sections/team-cta.tsx`,
`src/app/_components/workshop-tag-filter.tsx`, `src/app/_components/spec-reveal-cards.tsx`,
`src/app/_components/program-carousel.tsx`, `src/app/corporate-training/_sections/hero.tsx`,
`src/app/gallery/page.tsx`, `src/app/gallery/[slug]/page.tsx`.

Import `interestHref` from `@/lib/interest` everywhere. Never hand-write `/interest?...`.

**Complete inventory of CTAs that pointed at the existing forms** (baseline line numbers):

| #   | File:line                                                                                            | Now                                         | Change to                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | `site-navbar.tsx:60` `CTA_HREF = "/#which-path"`, used at `:212` (desktop) and `:235` (mobile sheet) | fork on `/`                                 | `href` computed per page: `pathname.startsWith("/workshops")` → `interestHref("workshops")`, `startsWith("/corporate-training")` → `interestHref("corporate")`, anything else → `interestHref()`. **Delete `handleCtaClick` (122–129)** and both `onClick={handleCtaClick}`. Drop the `smoothScrollToElement` import if it becomes unused (`smoothScrollToTop` is still used). Keep `CTA_LABEL` "Train with Me" (open item). Update the doc-comment at 46–48. |
| C2  | `site-cta.tsx:149-153` defaults                                                                      | `/workshops`, `/corporate-training#inquiry` | `primaryLabel = "Get workshop early access"`, `primaryHref = interestHref("workshops")`. `secondaryLabel = "Corporate training inquiries"`, `secondaryHref = interestHref("corporate")`. This covers `/about`, `/workshops` and `/gallery`, which use the defaults.                                                                                                                                                                                           |
| C3  | `gallery/[slug]/page.tsx:52` heading `…is open for registration`                                     |                                             | `` `${related.title} opens soon` ``. Also `:58-59`: `secondaryHref` → `interestHref("corporate")`. Keep `primaryHref`, since the workshop page stays browsable.                                                                                                                                                                                                                                                                                               |
| C4  | `gallery/page.tsx:34` subtext "See what's open for registration…"                                    |                                             | "Get first word on new dates, or ask about a private session."                                                                                                                                                                                                                                                                                                                                                                                                |
| C5  | `paths.tsx:183` corporate path `href: "/corporate-training#inquiry"`                                 |                                             | `interestHref("corporate")`. Keep the workshop path (`:169`, `/workshops`), which is a browse page.                                                                                                                                                                                                                                                                                                                                                           |
| C6  | `team-cta.tsx:37` `/corporate-training#inquiry` "Explore corporate training"                         |                                             | `interestHref("corporate")`, label "Ask about in-house training"                                                                                                                                                                                                                                                                                                                                                                                              |
| C7  | `workshop-tag-filter.tsx:207` `/corporate-training#inquiry`                                          |                                             | `interestHref("corporate")`                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| C8  | `spec-reveal-cards.tsx:221` `/corporate-training?program=…#inquiry`                                  |                                             | `interestHref("corporate")`. Replace the comment at 215–218 (the cold-load reason no longer applies).                                                                                                                                                                                                                                                                                                                                                         |
| C9  | `program-carousel.tsx:317-321` `href` + `onClick → inquire()`                                        |                                             | `href={interestHref("corporate")}`, remove the `onClick`. **Delete** `inquire()` (180–196), `PROGRAM_INQUIRE_EVENT` (89), the doc-comment passage at 50–53, and the `smoothScrollToElement` import if it becomes unused. `reduce` is still used at 269 and 288, so keep it. The listener in `inquiry-form.tsx` becomes harmless dead code there; do not edit that file.                                                                                       |
| C10 | `corporate-training/_sections/hero.tsx:52` `href="#inquiry"` "Start an inquiry"                      |                                             | `interestHref("corporate")`, label "Register your interest"                                                                                                                                                                                                                                                                                                                                                                                                   |

These are handled by other tasks and listed so the inventory is complete: the workshop
"Reserve your seat" button in `overview.tsx:73-82` (locked, Task 3), "Register now" in
`register-cta.tsx:21-30` (rewritten, Task 3), the sticky bar "Register" / "Join waitlist" in
`sticky-register-bar.tsx:83-92` (Task 3), the event-card "Register" pill in
`event-cards.tsx:356` (Task 3), and the footer (Task 2).

**Accept:**

- `grep -rn "#inquiry\|program=" src/app --include=*.tsx` returns only `inquiry-form.tsx`
  and `inquiry-cta.tsx` (`id="inquiry"`). Quote the pattern for zsh:
  `grep -rn -e '#inquiry' -e 'program=' src/app`.
- `grep -rn "which-path" src/app` returns only `paths.tsx` (the id and its own hash handler)
  and comments in `page.tsx`.
- Typecheck, eslint and prettier are clean on the owned files.

---

## Task 5 — Wire, validate, end-to-end (serial, after 1–4; Sonnet; Opus if a defect needs a redesign)

**Precondition:** Chan has pasted `supabase/migrations/20260930120000_interest_signups.sql`
into the Supabase SQL editor (project `bqbqwxhdykpepszbarpb`). If not, do steps 1–3 and 5,
then report that step 4 is blocked.

1. `rm -rf .next && npm run validate && npm run build`. Fix only integration seams (imports,
   types). Any real defect goes back to the owning task's file list.
2. Audit greps (RULES §29 plus this build):
   `grep -rn -e 'staff-login' -e 'email-templates' src`, which must be empty.
   `grep -rn RegistrationDialog src/app`, which should show only the definition and
   `overview.tsx`, inside the lock.
   `grep -rn TODO src` must show exactly one hit, `PRIVACY_CONTACT_EMAIL`, plus any that
   existed before.
   `grep -rn -i "demo" src/app` gets a review.
3. `npm run dev` on a free port. **Record the PID.** Run Playwright at 1280×800 and 390×844:
   - `/` → navbar CTA → `/interest` with "Both" selected. From `/workshops/exceptional-salesmanship`
     the navbar CTA preselects Workshops, and from `/corporate-training` it preselects
     Corporate. Every C1–C10 link lands on `/interest?from=<expected>`.
   - Step validation: an empty Continue shows errors. Back keeps the values. Submitting
     without the privacy box shows its error. The privacy link opens `/privacy` in a new tab.
   - Locks: Tab through `/corporate-training` and a workshop page. Focus never enters
     `[inert]`. Take screenshots of G1–G5 at both sizes.
4. **End to end:** submit the form from `/workshops/...` with the email `Event.Test+1@example.com`.
   It lands on `/interest/thanks` with the first-name greeting. Reload: still fine. Open it
   cold in a fresh context: the generic copy renders. Resubmit with `event.test+1@EXAMPLE.com`
   and a different company. Verify **one** row with the updated company and a later
   `updated_at` than `created_at`. Verify by reading the row with a server-side curl using
   the secret key from `.env.local`; never print the key. Also run a curl with the honeypot
   filled (200, no row) and one with `consentPrivacy:false` (400). **Delete the test rows
   afterwards** with a curl `DELETE ...?email=like.event.test*`.
5. Kill the dev server by PID, close every browser and context in `finally`, then confirm
   with `ps aux | grep -iE "playwright|chromium|next dev"` that the port is free.
6. `graphify update .`. Add a dated entry to `/Users/chanchan/Programming/Iridel/tasks/lessons.md`
   only if something actually went wrong.

---

## Parallelism

`Task 0` runs first, then `Tasks 1, 2, 3, 4` in parallel (their file sets do not overlap),
then `Task 5`. The only file several tasks import is `src/lib/interest.ts`, which Task 0
writes. Only Task 1 edits `handoff.ts`. Only Task 2 edits `layout.tsx` and the footer.

## Open items (client or Chan)

1. **Privacy contact email.** It is pending from the client, and `PRIVACY_CONTACT_EMAIL` is
   `null`. The notice shows a visible "to follow" placeholder. **This must be set before
   Oct 2.**
2. **Retention period.** The draft says "until withdrawn, max 2 years after last contact".
   The client confirms it.
3. **Vercel env.** Add `SUPABASE_URL` and `SUPABASE_SECRET_KEY` (server-only) to the deploy
   target's environment before the client test. `.env.local` is local only and gitignored.
4. **"Demo by iridel.com" footer credit.** RULES §4 requires it on demos, but this copy goes
   to real event visitors. Keep it, or change it to "Website by iridel.com"? It is
   unchanged by default.
5. **Navbar label "Train with Me"** now opens the form instead of the fork. Keep it, or use
   "Get early access"?
6. **Workshop `<title>` and OG card still show dates.** `workshops/[slug]/page.tsx:28` and
   `opengraph-image.tsx:61` are left unchanged because metadata changes only when it says
   "demo". Change them if dates are not final.
7. **Company required.** It is required, with "Self-employed is fine" guidance. Make it
   optional if the client prefers.
8. **No rate limiting** beyond the honeypot. That is acceptable for a one-day event list.
   Add IP throttling if spam appears.
9. The unlinked confirmation routes `/workshops/[slug]/registered` and
   `/corporate-training/inquiry-received` are still reachable by typing the URL. Nothing
   links to them now. Return `notFound()` from them if Chan wants them gone.

---

## Task 3 — done

Files: new `src/app/_components/glass-lock.tsx`; edited `inquiry-cta.tsx` (G1 + copy), `register-cta.tsx` (rewritten, G2), `overview.tsx` (G3 aside, G4 chip on `<dl>`), `list.tsx` (G5), `hero.tsx`, `sticky-register-bar.tsx`, `past-cta.tsx`, `event-cards.tsx` (`shortDate` and its use removed; `Ticket` icon kept). `npx tsc --noEmit` and eslint clean; prettier run.
Deviations: GlassLock adds a `Lock` icon and `rounded-[inherit]` on the overlay (lets the wrapper's `className` radius clip the tint). In `overview.tsx` the G3 lock wraps the `<aside>` and the `lg:max-w-xs`/`shrink-0` classes moved to the GlassLock wrapper. The G4 chip wrapper carries the `border-t`. Browser checks (Tab/inert, 390px, red vs white ground) are not run; left for Task 5. Not verified: dark mode (site is light-only; grep skipped).

## Task 4 — done

Files: site-navbar, site-cta, paths, team-cta, workshop-tag-filter, spec-reveal-cards, program-carousel, corporate-training hero, gallery page and gallery/[slug]/page (C1–C10 all applied; interestHref everywhere). Deviations: spec-reveal-cards and program-carousel Inquire pills changed from `<a>` to next/link (internal route). Removed stale comments (navbar doc, B<->C contract, cold-load note). tsc and eslint clean; grep acceptance checks pass (`#inquiry`/`program=` only in inquiry-form.tsx plus a comment-only hit none left in owned files; `which-path` only paths.tsx and page.tsx comments).

## Task 1 — done

Files: `src/app/interest/page.tsx`, `_sections/signup.tsx`, `_sections/interest-form.tsx`, `thanks/page.tsx`, `thanks/_sections/received.tsx`; `src/app/_lib/handoff.ts` (+`InterestHandoff`, imports `Interest` type). Prettier, eslint and `tsc --noEmit` clean. Deviations: form has `noValidate` (zod owns validation); thanks page adds `id="main-content"` on `<main>`; success requires `res.ok && data.ok === true`. Steps 1-2 have two text inputs and no submit button, so Enter cannot submit early (not browser-tested).

---

## Task 2 — done

Files: `supabase/migrations/20260930120000_interest_signups.sql`, `src/app/api/interest/route.ts`, `src/app/privacy/{page.tsx,_sections/notice.tsx}`, `src/app/_components/path-tracker.tsx`, `layout.tsx` (PathTracker mounted), `site-footer.tsx` (staff-login/email-templates links removed, Privacy Notice link added). tsc + eslint clean.
Deviations: **`src/app/staff-login/` and `src/app/email-templates/` NOT deleted** (the `rm -rf` was denied by the permission classifier). Footer links are gone, but the routes still exist; someone must `rm -rf` both dirs, then `rm -rf .next`. Curl checks (400/honeypot) not run (no dev server allowed).

## Task 5 — done

2026-10-01: validate + build pass (clean `.next`). Greps clean (no staff-login/email-templates/"Train with Me"; no Iridel outside code comments; PRIVACY_CONTACT_EMAIL TODO gone, remaining TODOs are pre-existing content ones). Playwright at 1280x800 and 390x844: navbar "Get notified" -> `/interest` (from `/`), `?from=corporate`, `?from=workshops`; `/workshops/<slug>` redirects to `/interest?from=workshops` (Workshops preselected); `/workshops/x/registered`, `/corporate-training/inquiry-received`, `/staff-login`, `/email-templates` all 404; all 7 workshop cards on `/` and `/workshops` are a single tab stop named "... coming soon, get notified" and link to `/interest?from=workshops`; focus never enters `[inert]` (also on `/corporate-training`); form validation, back-keeps-values, privacy error and new-tab privacy link OK; `/privacy` shows the chanabayabay@gmail.com mailto; footer has no Iridel credit. DB e2e: submit -> thanks greeting, reload OK, cold open generic; case-variant resubmit with new company -> one row, company updated, updated_at > created_at; honeypot 200 no row; consentPrivacy:false 400; all test rows deleted (0 remain). Blank company -> HTTP 500 (`23502` not-null on `company`): migration `20261001120000_interest_company_optional.sql` NOT yet applied. Blocked on Chan pasting it into the Supabase SQL editor; re-test one blank-company submit after.

## Round 2 — done

- Cleanups: gallery references removed from README.md / FSD.md (code removed 2026-10-01, out of scope); floating-copy.tsx comment fixed; dead `ad:program-inquire` listener + constant removed from corporate inquiry-form.tsx (nothing dispatches it; `?program=` deep link kept). `rm -rf .next && npm run validate && npm run build` pass.
- Browser (headless chromium, 1280x800 + 390x844, dev :3458): /gallery and /gallery/x 404; no Gallery link in nav/footer/mobile menu; zero console errors on /, /workshops, /corporate-training, /interest, /interest/thanks, /privacy, /about.
- Coming-soon cards: home 7 workshop + 10 corporate, /workshops 7, /corporate-training 10; each one tab stop (one full Tab cycle), name contains "coming soon", click -> /interest?from=workshops|corporate with that option preselected; focus never entered [inert]; lock bottom above 18-20px "Coming soon", content blurred 10px under 40% black veil.
- /interest: one checkbox (privacy); submit OK (200); thanks page fills >=85svh, scrollWidth == innerWidth at both sizes. DB row: company null, consent_privacy true, consent_updates false, consent_version 2026-10-01b; event.test\* rows deleted, 0 remain.
- Screenshots: scratchpad/shots2/_-d.png, _-m.png (8 views).
- Dev server killed by PID, port 3458 free; graphify updated.

## Rounds 3–4 — done (2026-10-01)

Live at https://adrianding.vercel.app/ (commit daa925c). QR codes: `assets-src/qr/adrianding-com-qr.{png,svg}` (→ https://adrianding.com/, current) and `adrianding-vercel-app-qr.{png,svg}` (→ adrianding.vercel.app, event print run).

- Every submission is kept as its own row. Migration `20261001130000` was applied by Chan and verified. The merge query for handover is at the bottom of that file.
- Fixed the bug where tapping a card opened `/interest` at the footer. The cause was `ScrollTrigger.refresh()` restoring a stale cached scroll value. Back/Forward now restore the scroll position (see `scroll-refresh.tsx`). Verified in emulation (iPhone 13, Pixel 7, desktop); not yet confirmed on a real iPhone.
- Every CTA is now a single "Get notified" button, each with its page's preset. The home page gets a closing SiteCta band. The `/interest` section is `min-h-[85svh]`, matching the thanks page.

Still open with the client: the real privacy contact email (interim: chanabayabay@gmail.com), confirmation of the 2-year retention period, and an update to the privacy notice when the data is transferred (~Nov).

- 2026-10-01: `consent_updates` dropped (column + RPC arg). Migration `20261001150000_interest_drop_consent_updates.sql` keeps the old 10-arg RPC working until the next deploy; then drop it (SQL at the bottom of that file). Privacy consent unchanged.
