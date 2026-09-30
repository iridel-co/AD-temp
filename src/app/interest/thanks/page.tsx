import type { Metadata } from "next"
import { SiteNavbar } from "@/app/_components/site-navbar"
import { SiteFooter } from "@/app/_components/site-footer"
import { InterestReceived } from "./_sections/received"

export const metadata: Metadata = {
  title: "You're on the list — Coach Adrian Ding",
  description: "You're on Adrian Ding's early-access list.",
  robots: { index: false, follow: false },
}

export default function InterestThanksPage() {
  return (
    <>
      <SiteNavbar />
      <main id="main-content">
        <InterestReceived />
      </main>
      <SiteFooter />
    </>
  )
}
