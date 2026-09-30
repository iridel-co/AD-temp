"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Check } from "lucide-react"
import { Reveal } from "@/app/_components/reveal"
import {
  firstNameOf,
  readHandoff,
  type InterestHandoff,
} from "@/app/_lib/handoff"
import type { Interest } from "@/lib/interest"

/**
 * Confirmation for the early-access list. The handoff is read in an effect
 * (never during render: SSR has no sessionStorage). With no payload it reads
 * as the generic "both" wording.
 */

const WHAT: Record<Interest, string> = {
  workshops: "dates for public workshops",
  corporate: "corporate programme slots",
  both: "new dates and programmes",
}

const LINKS = [
  { href: "/workshops", label: "Workshops" },
  { href: "/corporate-training", label: "Corporate training" },
  { href: "/about", label: "About Adrian" },
  { href: "/", label: "Back home" },
]

export function InterestReceived() {
  const [handoff, setHandoff] = useState<InterestHandoff | null>(null)

  useEffect(() => {
    setHandoff(readHandoff("interest"))
  }, [])

  const firstName = firstNameOf(handoff?.fullName)
  const what = WHAT[handoff?.interest ?? "both"]

  return (
    <section className="bg-background flex min-h-[85svh] items-center py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        <Reveal className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <span className="bg-brand text-brand-foreground flex size-16 items-center justify-center rounded-full lg:size-20">
            <Check className="size-8 lg:size-10" strokeWidth={2.5} />
          </span>
          <h1 className="mt-10 font-serif text-5xl leading-[1.02] tracking-[-0.02em] sm:text-6xl lg:text-8xl">
            {firstName
              ? `You're on the list, ${firstName}.`
              : "You're on the list."}
          </h1>
          <p className="text-muted-foreground mt-8 max-w-3xl text-xl leading-relaxed sm:text-2xl lg:text-3xl">
            We&rsquo;ll email you as soon as {what} are confirmed.
          </p>
          <ul className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="hover:text-brand text-lg font-medium underline underline-offset-4"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
