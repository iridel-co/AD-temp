"use client"

import { cloneElement, useId, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ArrowRight, Phone } from "lucide-react"
import { gsap, useGSAP } from "@/app/_lib/gsap"
import { saveHandoff } from "@/app/_lib/handoff"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DATA_CONTROLLER,
  HONEYPOT_FIELD,
  INTERESTS,
  INTEREST_API,
  INTEREST_LABELS,
  INTEREST_THANKS_PATH,
  LAST_PATH_KEY,
  PRIVACY_PATH,
  interestSchema,
  type Interest,
  type InterestValues,
} from "@/lib/interest"
import { cn } from "@/lib/utils"

/**
 * Early-access interest form: 3 steps, live. Posts to `/api/interest`, then
 * routes to `/interest/thanks` with a sessionStorage handoff for the greeting.
 * The `website` field is a honeypot; a real person never sees or fills it.
 */

const TILE_BASE =
  "relative flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-3 text-left text-sm font-medium select-none transition-[background-color,border-color,box-shadow,color,scale] duration-200 ease-out motion-reduce:transition-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background"
const TILE_OFF =
  "border-input bg-background text-foreground shadow-sm shadow-black/5 hover:border-brand/60 hover:bg-brand/5 hover:shadow-md hover:shadow-brand/15"
const TILE_ON =
  "border-brand bg-brand text-brand-foreground scale-[1.02] shadow-lg shadow-brand/35 hover:border-brand-accent hover:bg-brand-accent hover:shadow-brand-accent/45"

const STEPS: { title: string; fields: (keyof InterestValues)[] }[] = [
  { title: "Your details", fields: ["fullName", "email"] },
  { title: "Your work", fields: ["designation", "company"] },
  {
    title: "Almost done",
    fields: ["interest", "consentPrivacy", "consentUpdates"],
  },
]

const SUBMIT_ERROR =
  "We couldn't save that just now. Please try again, or call or text 0920 900 7709."

export function InterestForm({
  initialInterest,
}: {
  initialInterest: Interest
}) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const paneRef = useRef<HTMLDivElement>(null)
  const honeypotRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<InterestValues>({
    resolver: zodResolver(interestSchema),
    mode: "onTouched",
    defaultValues: { interest: initialInterest, consentUpdates: false },
  })

  const interest = watch("interest")

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

  const next = async () => {
    const ok = await trigger(STEPS[step].fields)
    if (ok) setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }
  const back = () => setStep((s) => Math.max(s - 1, 0))

  const onSubmit = async (v: InterestValues) => {
    setSubmitting(true)
    setSubmitError(null)
    let sourcePath: string | undefined
    try {
      sourcePath = sessionStorage.getItem(LAST_PATH_KEY) ?? undefined
    } catch {
      sourcePath = undefined
    }
    try {
      const res = await fetch(INTEREST_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...v,
          sourcePath,
          website: honeypotRef.current?.value ?? "",
        }),
      })
      const data: unknown = await res.json().catch(() => null)
      if (res.ok && (data as { ok?: unknown } | null)?.ok === true) {
        saveHandoff({
          kind: "interest",
          fullName: v.fullName,
          interest: v.interest,
        })
        // Stay disabled: the page is navigating away and must not double-submit.
        router.push(INTEREST_THANKS_PATH)
        return
      }
      setSubmitError(SUBMIT_ERROR)
    } catch {
      setSubmitError(SUBMIT_ERROR)
    }
    setSubmitting(false)
  }

  const current = STEPS[step]

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="bg-background text-foreground relative rounded-xl p-6 shadow-2xl outline-none sm:p-10"
    >
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div
            key={s.title}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i <= step ? "bg-brand" : "bg-border"
            )}
          />
        ))}
      </div>
      <p className="text-muted-foreground mt-3 text-xs tracking-[0.1em] uppercase">
        Step {step + 1} of {STEPS.length} · {current.title}
      </p>

      <div ref={paneRef} className="mt-10 space-y-5">
        {step === 0 && (
          <>
            <Field label="Full name" error={errors.fullName?.message}>
              <Input
                className="placeholder:text-muted-foreground/50 h-12 text-base"
                autoComplete="name"
                {...register("fullName")}
              />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <Input
                type="email"
                className="placeholder:text-muted-foreground/50 h-12 text-base"
                autoComplete="email"
                {...register("email")}
              />
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <Field
              label="Designation / role"
              error={errors.designation?.message}
            >
              <Input
                className="placeholder:text-muted-foreground/50 h-12 text-base"
                autoComplete="organization-title"
                {...register("designation")}
              />
            </Field>
            <Field label="Company (optional)" error={errors.company?.message}>
              <Input
                className="placeholder:text-muted-foreground/50 h-12 text-base"
                autoComplete="organization"
                {...register("company")}
              />
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <fieldset className="space-y-1.5">
              <legend className="mb-3 text-sm leading-none font-medium">
                I&rsquo;m interested in
              </legend>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {INTERESTS.map((value) => {
                  const on = interest === value
                  return (
                    <label
                      key={value}
                      className={cn(TILE_BASE, on ? TILE_ON : TILE_OFF)}
                    >
                      <input
                        type="radio"
                        value={value}
                        className="sr-only"
                        {...register("interest")}
                      />
                      <span className="flex-1 leading-snug">
                        {INTEREST_LABELS[value]}
                      </span>
                    </label>
                  )
                })}
              </div>
              {errors.interest?.message && (
                <p className="text-destructive text-sm">
                  {errors.interest.message}
                </p>
              )}
            </fieldset>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                className="accent-brand mt-1 size-4"
                {...register("consentPrivacy")}
              />
              <span className="text-muted-foreground text-sm leading-relaxed">
                I agree to {DATA_CONTROLLER} collecting and using the details
                above to follow up on my interest, as described in the{" "}
                <Link
                  href={PRIVACY_PATH}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground underline"
                >
                  Privacy Notice
                </Link>
                , in line with the Data Privacy Act of 2012 (RA 10173).
              </span>
            </label>
            {errors.consentPrivacy?.message && (
              <p className="text-destructive text-sm">
                {errors.consentPrivacy.message}
              </p>
            )}

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                className="accent-brand mt-1 size-4"
                {...register("consentUpdates")}
              />
              <span className="text-muted-foreground text-sm leading-relaxed">
                Also send me occasional updates about new workshop dates and
                programmes. I can unsubscribe any time.
              </span>
            </label>
          </>
        )}
      </div>

      {/* Honeypot: hidden from people and assistive tech, not part of the schema. */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px overflow-hidden"
      >
        <input
          ref={honeypotRef}
          type="text"
          name={HONEYPOT_FIELD}
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      {submitError && (
        <p role="alert" className="text-destructive mt-6 text-sm">
          {submitError}
        </p>
      )}

      <div className="mt-8 flex flex-wrap-reverse items-center justify-between gap-x-6 gap-y-4">
        <p className="text-muted-foreground/70 flex items-center gap-2 text-xs">
          <Phone className="size-3.5 shrink-0" />
          <span>
            Rather ask first? Call or text{" "}
            <a
              href="tel:+639209007709"
              className="hover:text-foreground font-medium whitespace-nowrap underline"
            >
              0920 900 7709
            </a>
          </span>
        </p>

        <div className="ml-auto flex items-center gap-2">
          {step > 0 && (
            <Button
              type="button"
              variant="ghost"
              onClick={back}
              // Keep focus in the field on press: a blur would validate, remove
              // the error line and shift this button out from under the click.
              onMouseDown={(e) => e.preventDefault()}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
          )}
          {/* Distinct keys: React must not reuse one <button> across the
              type=button -> type=submit swap (RULES §21). */}
          {step < STEPS.length - 1 ? (
            <Button key="continue" type="button" variant="brand" onClick={next}>
              Continue
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button
              key="submit"
              type="submit"
              variant="brand"
              disabled={submitting}
            >
              {submitting ? "Saving…" : "Join the list"}
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactElement<React.ComponentProps<"input">>
}) {
  const id = useId()
  const errorId = `${id}-error`
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {cloneElement(children, {
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error ? errorId : undefined,
      })}
      {error && (
        <p id={errorId} className="text-destructive text-sm">
          {error}
        </p>
      )}
    </div>
  )
}
