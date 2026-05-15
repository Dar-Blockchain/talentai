import { alpha } from "@mui/material/styles";

/** MUI `alpha()` only accepts hex/rgb/hsl — not CSS keywords like `white` / `black`. */
const NAMED: Record<string, string> = {
  white: "#ffffff",
  black: "#000000",
};

export function safeAlpha(color: string | undefined, coefficient: number): string {
  if (color == null || color === "") return alpha("#000000", coefficient);
  const key = color.trim().toLowerCase();
  return alpha(NAMED[key] ?? color, coefficient);
}
