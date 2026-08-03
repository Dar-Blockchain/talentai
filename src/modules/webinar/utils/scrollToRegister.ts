/**
 * Anchor-scrolls to the registration section. A plain `href="#id"` can land a
 * few pixels short/long here because the section sits far down the page and
 * web-font swap-in (Fraunces loading after the initial paint) reflows the
 * headings above it mid-scroll, shifting the target after the browser has
 * already computed where to stop. Waiting for fonts + a settled layout frame
 * before scrolling removes that drift.
 */
export function scrollToRegister(e: React.MouseEvent) {
  e.preventDefault();

  const scroll = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById("webinar-register")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  };

  if (typeof document !== "undefined" && "fonts" in document) {
    document.fonts.ready.then(scroll).catch(scroll);
  } else {
    scroll();
  }
}
