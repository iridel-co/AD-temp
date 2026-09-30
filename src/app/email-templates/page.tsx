import type { Metadata } from "next"
import { SiteNavbar } from "@/app/_components/site-navbar"
import { SiteFooter } from "@/app/_components/site-footer"
import { EmailTemplates } from "./_sections/templates"

export const metadata: Metadata = {
  title: "Email Templates — Coach Adrian Ding",
  description:
    "Copy and layout for the three client-facing emails: workshop confirmation, payment confirmation, and corporate inquiry acknowledgment.",
  robots: { index: false, follow: false },
}

export default function EmailTemplatesPage() {
  return (
    <>
      <SiteNavbar />
      <main className="mx-auto max-w-3xl px-5 py-14 sm:px-8 lg:py-20">
        <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
          Email templates
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl leading-relaxed">
          Copy and layout for the three automated emails, for review. Merge
          fields are shown as{" "}
          <code className="text-foreground">{"{like_this}"}</code>. Send
          triggers (Resend) are wired in the full build — bracketed values are
          placeholders for CMS-managed content.
        </p>

        <div className="mt-14">
          <EmailTemplates />
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
