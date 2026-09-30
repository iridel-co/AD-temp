import type { Metadata } from "next"
import { SiteNavbar } from "@/app/_components/site-navbar"
import { SiteFooter } from "@/app/_components/site-footer"
import { parseInterest } from "@/lib/interest"
import { InterestSignup } from "./_sections/signup"

export const metadata: Metadata = {
  title: "Join the early-access list — Coach Adrian Ding",
  description:
    "Leave your details and Adrian's team will reach out when new workshop dates and corporate programmes are confirmed.",
}

export default async function InterestPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string | string[] }>
}) {
  const { from } = await searchParams
  const initialInterest = parseInterest(Array.isArray(from) ? from[0] : from)

  return (
    <>
      <SiteNavbar />
      <main id="main-content">
        <InterestSignup initialInterest={initialInterest} />
      </main>
      <SiteFooter />
    </>
  )
}
