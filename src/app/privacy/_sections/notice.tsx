import {
  CONSENT_VERSION,
  DATA_CONTROLLER,
  PRIVACY_CONTACT_EMAIL,
} from "@/lib/interest"

export function PrivacyNotice() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16 lg:py-24">
      <h1 className="font-serif text-4xl lg:text-5xl">Privacy Notice</h1>
      <p className="text-muted-foreground mt-4 text-sm">
        Last updated: 1 October 2026 · Version {CONSENT_VERSION}
      </p>

      <div className="mt-12 space-y-10">
        <div className="space-y-3">
          <h2 className="font-serif text-2xl">1. Who we are</h2>
          <p className="text-muted-foreground leading-relaxed">
            {DATA_CONTROLLER}, the organisation behind Coach Adrian Ding&apos;s
            workshops and corporate training, is the personal information
            controller.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="font-serif text-2xl">2. What we collect</h2>
          <p className="text-muted-foreground leading-relaxed">
            Your full name, email, designation and company (if you give one);
            what you are interested in; whether you want updates; the page you
            came from; your browser&apos;s user-agent; and timestamps.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="font-serif text-2xl">3. Why</h2>
          <p className="text-muted-foreground leading-relaxed">
            To follow up on your interest from the event and our website. If you
            ticked the box, also to send occasional updates. Nothing else. There
            is no automated decision-making.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="font-serif text-2xl">4. Legal basis</h2>
          <p className="text-muted-foreground leading-relaxed">
            Your consent, under the Data Privacy Act of 2012 (Republic Act No.
            10173) and its Implementing Rules and Regulations. You can withdraw
            it at any time.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="font-serif text-2xl">5. Storage and security</h2>
          <p className="text-muted-foreground leading-relaxed">
            Stored in a Supabase (cloud Postgres) database with access
            restricted to authorised staff. Encrypted in transit. Never sold.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="font-serif text-2xl">6. Sharing</h2>
          <p className="text-muted-foreground leading-relaxed">
            Only with service providers that process data for us, such as
            hosting and email, under confidentiality obligations. Never for
            third-party marketing.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="font-serif text-2xl">7. Retention</h2>
          {/* TODO(client): confirm the retention period. */}
          <p className="text-muted-foreground leading-relaxed">
            Kept until you withdraw consent or ask us to delete it, and no
            longer than 2 years after our last contact with you. Then it is
            deleted.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="font-serif text-2xl">8. Your rights</h2>
          <p className="text-muted-foreground leading-relaxed">
            You have the right to be informed, to access, to object, to erasure
            or blocking, to rectification, to data portability, to damages, and
            to file a complaint with the National Privacy Commission
            (privacy.gov.ph).
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="font-serif text-2xl">9. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            To use any of these rights, write to us at{" "}
            <a
              href={`mailto:${PRIVACY_CONTACT_EMAIL}`}
              className="text-brand underline underline-offset-4"
            >
              {PRIVACY_CONTACT_EMAIL}
            </a>
            , or call 0920 900 7709.
          </p>
        </div>
      </div>
    </section>
  )
}
