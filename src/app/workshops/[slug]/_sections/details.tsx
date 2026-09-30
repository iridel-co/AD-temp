import { Check, Users, Clock } from "lucide-react"
import { Reveal } from "@/app/_components/reveal"
import type { Workshop } from "@/lib/workshops"

/**
 * Workshop detail — curriculum outline, inclusions, and who it's for.
 */
export function WorkshopDetails({ workshop }: { workshop: Workshop }) {
  return (
    <section className="bg-muted/40 py-20 lg:py-32">
      <div className="mx-auto grid max-w-5xl gap-16 px-6 sm:px-8 lg:grid-cols-[1.2fr_1fr]">
        <Reveal>
          <h2 className="font-serif text-[2.25rem] leading-[1.05] tracking-[-0.02em] lg:text-[3rem]">
            What the day covers
          </h2>
          <ol className="mt-6 space-y-3">
            {workshop.curriculum.map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-brand mt-0.5 font-serif text-sm">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-muted-foreground leading-relaxed">
                  {item}
                </span>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal delay={0.1} className="space-y-8">
          <div>
            <h3 className="text-foreground font-semibold tracking-tight">
              What&rsquo;s included
            </h3>
            <ul className="mt-3 space-y-2">
              {workshop.inclusions.map((inc) => (
                <li
                  key={inc}
                  className="text-muted-foreground flex gap-2 text-sm leading-relaxed"
                >
                  <Check className="text-brand mt-0.5 size-4 shrink-0" />
                  {inc}
                </li>
              ))}
            </ul>
          </div>
          <div className="border-border/70 space-y-3 border-t pt-6">
            <p className="text-muted-foreground flex gap-2 text-sm">
              <Users className="mt-0.5 size-4 shrink-0" />
              <span>
                <span className="text-foreground font-medium">
                  Who it&rsquo;s for:
                </span>{" "}
                {workshop.audience}
              </span>
            </p>
            <p className="text-muted-foreground flex gap-2 text-sm">
              <Clock className="mt-0.5 size-4 shrink-0" />
              <span>
                <span className="text-foreground font-medium">Format:</span>{" "}
                {workshop.format}
              </span>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
