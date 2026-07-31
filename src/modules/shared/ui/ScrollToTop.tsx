import React, { useEffect, useState } from "react"

const SCROLL_THRESHOLD = 300

const getScrollEl = (): HTMLElement | Window => {
  if (typeof window === "undefined") return window
  return document.getElementById("main-scroll") ?? window
}

const getScrollTop = (el: HTMLElement | Window): number =>
  el instanceof Window ? el.scrollY : el.scrollTop

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = getScrollEl()

    const onScroll = () => {
      setVisible(getScrollTop(el) > SCROLL_THRESHOLD)
    }

    el.addEventListener("scroll", onScroll, { passive: true })

    return () => {
      el.removeEventListener("scroll", onScroll)
    }
  }, [])

  const scrollToTop = () => {
    const el = getScrollEl()

    if (el instanceof Window) {
      el.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      el.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <button
      onClick={scrollToTop}
      aria-label="scroll to top"
      className={`
        fixed bottom-6 right-6 z-[1000]
        flex items-center justify-center
        h-10 w-10 rounded-full
        bg-[#00FF9D] text-white
        shadow-lg
        transition-all duration-300
        hover:bg-[#00e68a]
        hover:scale-110
        active:scale-95
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
      `}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m18 15-6-6-6 6" />
      </svg>
    </button>
  )
}