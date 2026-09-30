import type { Metadata } from "next"
import { SiteNavbar } from "@/app/_components/site-navbar"
import { SiteFooter } from "@/app/_components/site-footer"
import { PrivacyNotice } from "./_sections/notice"

export const metadata: Metadata = {
  title: "Privacy Notice — Coach Adrian Ding",
  description:
    "How Coach Adrian Ding's team collects, uses and protects your personal information.",
}

export default function PrivacyPage() {
  return (
    <>
      <SiteNavbar />
      <main id="main-content">
        <PrivacyNotice />
      </main>
      <SiteFooter />
    </>
  )
}
