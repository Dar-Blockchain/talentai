export function CheckIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

export function ChevronIcon({ dir }: { dir: "up" | "down" | "right" | "left" }) {
  const pts = { up: "18 15 12 9 6 15", down: "6 9 12 15 18 9", right: "9 18 15 12 9 6", left: "15 18 9 12 15 6" };
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points={pts[dir]}/>
    </svg>
  );
}
