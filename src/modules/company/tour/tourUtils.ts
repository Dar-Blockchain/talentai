import type { Step } from "./tourSteps";

const GAP = 14;
export const W = 340;
const CARD_MAX_H = 420;

export function resolveRect(target: string): DOMRect | null {
  if (!target || target === "center") return null;
  const el = document.querySelector(target);
  return el ? el.getBoundingClientRect() : null;
}

export function popoverStyle(rect: DOMRect | null, position: Step["position"]) {
  if (!rect || position === "center") {
    return {
      position: "fixed" as const,
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      pointerEvents: "none" as const,
    };
  }

  const vh = window.innerHeight;
  const cardH = Math.min(CARD_MAX_H, vh - 80);
  const clampX = (x: number) => Math.min(Math.max(x, 12), window.innerWidth - W - 12);
  const clampTop = (ideal: number) => Math.max(12, Math.min(ideal, vh - cardH - 12));
  const cx = rect.left + rect.width / 2 - W / 2;

  switch (position) {
    case "right":
      return { position: "fixed" as const, top: clampTop(rect.top), left: rect.right + GAP, width: W, maxHeight: cardH };
    case "left":
      return { position: "fixed" as const, top: clampTop(rect.top), left: rect.left - W - GAP, width: W, maxHeight: cardH };
    case "top":
      return { position: "fixed" as const, top: clampTop(rect.top - cardH - GAP), left: clampX(cx), width: W, maxHeight: cardH };
    default:
      return { position: "fixed" as const, top: clampTop(rect.bottom + GAP), left: clampX(cx), width: W, maxHeight: cardH };
  }
}
