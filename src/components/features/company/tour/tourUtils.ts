import type { Step } from "./tourSteps";

const GAP = 14;
export const W = 340;

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
  const clampX = (x: number) => Math.min(Math.max(x, 12), window.innerWidth - W - 12);
  const clampY = (y: number) => Math.min(y, window.innerHeight - 280);
  const cx = rect.left + rect.width / 2 - W / 2;
  switch (position) {
    case "right": return { position: "fixed" as const, top: clampY(rect.top), left: rect.right + GAP, width: W };
    case "left":  return { position: "fixed" as const, top: clampY(rect.top), left: rect.left - W - GAP, width: W };
    case "top":   return { position: "fixed" as const, bottom: window.innerHeight - rect.top + GAP, left: clampX(cx), width: W };
    default:      return { position: "fixed" as const, top: rect.bottom + GAP, left: clampX(cx), width: W };
  }
}
