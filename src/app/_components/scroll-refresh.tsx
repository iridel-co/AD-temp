"use client"

import { useEffect, useLayoutEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { ScrollTrigger } from "@/app/_lib/gsap"

/** Our per-entry id, stored alongside Next's own fields in `history.state`. */
const KEY_FIELD = "__adScrollKey"
const STORE_PREFIX = "ad-scroll:"
/** How long after Back/Forward we keep re-asserting the saved position. */
const RESTORE_WINDOW_MS = 1500

type HistoryState = Record<string, unknown> | null

/**
 * The current history entry's scroll key, creating one if asked. Only entries
 * the Next router owns (`__NA`) get tagged: a native `#hash` entry has a null
 * state, and giving it one without `__NA` makes Next hard-reload on popstate.
 */
function entryKey(create: boolean): string | null {
  const state = window.history.state as HistoryState
  const existing = state?.[KEY_FIELD]
  if (typeof existing === "string") return existing
  if (!create || !state?.__NA) return null
  const key = Math.random().toString(36).slice(2)
  // No URL argument, and the state carries `__NA`, so Next's patched
  // replaceState passes this straight through without touching the router.
  window.history.replaceState({ ...state, [KEY_FIELD]: key }, "")
  return key
}

/**
 * Owns window scroll across routes, in one place because the two jobs below
 * collide on the same resource.
 *
 * 1. ScrollTrigger refresh. ScrollTrigger resolves `start: "top 85%"` into an
 *    absolute scroll position at *creation* time, but components mount before
 *    the layout is final (the Prata swap, SplitText re-wrapping the quote, the
 *    sticky hero resizing). Measured before this existed: the <LandingStats>
 *    reveal fired at scrollY 5300 instead of 4298. So we refresh once fonts,
 *    `load` and any later body resize have settled.
 *
 *    `refresh()` records the scroll position, scrolls to 0 to measure, then
 *    restores what it recorded — and that record can be stale. Tapping a card
 *    deep in a page swaps in the short /interest page (the browser clamps
 *    scrollY to its max), Next then sets scrollTop = 0, and the body-resize
 *    refresh restored the clamped value: you landed on the footer. Cause:
 *    ScrollTrigger caches the scroll value (read at the clamp) and its record
 *    step does `++cacheID` before reading, which collides with the one scroll
 *    event since, so it reuses the cache. A plain read first resyncs the cache
 *    id, so the record always hits the DOM. (Measured on iPhone 13 WebKit and
 *    Pixel 7: cache said 834 while scrollY was 0.)
 *
 * 2. Back/Forward restoration. The browser restores scroll on popstate, before
 *    Next has rendered the previous page, so it clamps to the *current* page's
 *    height — Back from /interest landed at 0 (desktop) or ~770 (mobile). We
 *    save scrollY per history entry in sessionStorage and, on popstate,
 *    re-apply it each frame once the target route has rendered, until the
 *    window closes or the user touches/scrolls. Forward navigations are left
 *    to Next (scroll to top); in-page #anchors are native and untouched.
 */
export function ScrollRefresh() {
  const pathname = usePathname()
  const renderedPath = useRef(pathname)

  // Before the restore loop's next frame sees the new route.
  useLayoutEffect(() => {
    renderedPath.current = pathname
  }, [pathname])

  useEffect(() => {
    let frame = 0
    const refresh = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        // Resync ScrollTrigger's scroll cache before it records — see (1).
        // Called with no argument it's a getter (GSAP docs); the bundled
        // types only declare the setter signature.
        ;(ScrollTrigger.getScrollFunc(window) as unknown as () => number)()
        ScrollTrigger.refresh()
      })
    }

    // Fonts are the big one — the serif swap moves everything below it.
    document.fonts?.ready.then(refresh)
    // Images without an intrinsic box, plus anything still in flight.
    if (document.readyState === "complete") refresh()
    else window.addEventListener("load", refresh)

    // Catch-all for late shifts the two hooks above miss (lazy sections
    // expanding, a marquee measuring itself, a route change). rAF-debounced.
    const ro = new ResizeObserver(refresh)
    ro.observe(document.body)

    let pending: { y: number; path: string; until: number } | null = null
    let restoreFrame = 0

    const save = () => {
      if (pending) return // our own restore scrolls, possibly clamped
      const key = entryKey(true)
      if (!key) return
      try {
        sessionStorage.setItem(STORE_PREFIX + key, String(Math.round(scrollY)))
      } catch {
        // storage blocked (private mode): Back just behaves natively
      }
    }

    const tick = () => {
      if (!pending || performance.now() > pending.until) {
        pending = null
        return
      }
      if (
        renderedPath.current === pending.path &&
        Math.abs(window.scrollY - pending.y) > 1
      ) {
        window.scrollTo({ top: pending.y, behavior: "instant" })
      }
      restoreFrame = requestAnimationFrame(tick)
    }

    const onPopState = (e: PopStateEvent) => {
      cancelAnimationFrame(restoreFrame)
      pending = null
      const key = (e.state as HistoryState)?.[KEY_FIELD]
      if (typeof key !== "string") return
      let saved: string | null = null
      try {
        saved = sessionStorage.getItem(STORE_PREFIX + key)
      } catch {}
      const y = saved === null ? NaN : Number(saved)
      if (!Number.isFinite(y)) return
      pending = {
        y,
        path: window.location.pathname,
        until: performance.now() + RESTORE_WINDOW_MS,
      }
      restoreFrame = requestAnimationFrame(tick)
    }

    // The user takes over: stop re-asserting.
    const cancel = () => {
      pending = null
    }
    const inputs = ["wheel", "touchstart", "pointerdown", "keydown"] as const

    window.addEventListener("scroll", save, { passive: true })
    window.addEventListener("popstate", onPopState)
    for (const t of inputs)
      window.addEventListener(t, cancel, { passive: true, capture: true })

    return () => {
      cancelAnimationFrame(frame)
      cancelAnimationFrame(restoreFrame)
      window.removeEventListener("load", refresh)
      ro.disconnect()
      window.removeEventListener("scroll", save)
      window.removeEventListener("popstate", onPopState)
      for (const t of inputs)
        window.removeEventListener(t, cancel, { capture: true })
    }
  }, [])

  return null
}
