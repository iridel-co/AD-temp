"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { INTEREST_PATH, LAST_PATH_KEY } from "@/lib/interest"

/**
 * Remembers the last page visited before the interest form, so the form can
 * send it as `sourcePath`. `document.referrer` does not update on client-side
 * navigation, hence sessionStorage.
 */
export function PathTracker() {
  const pathname = usePathname()
  useEffect(() => {
    if (pathname.startsWith(INTEREST_PATH)) return
    try {
      sessionStorage.setItem(LAST_PATH_KEY, pathname)
    } catch {
      // storage blocked (private mode): the form just omits sourcePath
    }
  }, [pathname])
  return null
}
