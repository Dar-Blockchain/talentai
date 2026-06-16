import type { SxProps, Theme } from "@mui/material";

/** Shared scrollbar-hide mixin — applied to any Box that may scroll. */
const hideScrollbar = {
  scrollbarWidth: "none",          // Firefox
  msOverflowStyle: "none",         // IE / Edge legacy
  "&::-webkit-scrollbar": { display: "none" }, // Chrome / Safari
} as const;

export const interviewScreenSx = {
  root: {
    // Lock to viewport on every breakpoint — interview is always fullscreen
    height: "100dvh",
    minHeight: "100dvh",
    maxHeight: "100dvh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    bgcolor: "#f8fdfb",
    // Cascade scrollbar-hiding to every descendant scroll container
    "& *": {
      scrollbarWidth: "none",
      msOverflowStyle: "none",
    },
    "& *::-webkit-scrollbar": {
      display: "none",
    },
  } as SxProps<Theme>,

  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    // On xs the stacked layout can exceed 100dvh — allow inner scroll without bar
    overflowY: { xs: "auto", md: "hidden" },
    py: { xs: 1.5, md: 1 },
    px: { xs: 1.5, md: 3 },
    ...hideScrollbar,
  } as SxProps<Theme>,

  grid: {
    flex: 1,
    minHeight: 0,
    maxHeight: { md: "min(500px, calc(100dvh - 130px))" },
    display: "grid",
    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "2fr 1fr" },
    gap: { xs: 1.5, md: 1 },
    mt: { xs: 1, md: 0.75 },
  } as SxProps<Theme>,

  lobbyCard: {
    bgcolor: "#fff",
    borderRadius: "20px",
    border: "1px solid #e8f5f0",
    boxShadow: "0 4px 24px rgba(16,69,63,0.07)",
    // If lobby content overflows its card, scroll without showing a bar
    overflowY: "auto",
    ...hideScrollbar,
  } as SxProps<Theme>,

  lobbyAccentBar: {
    height: 4,
    background: "linear-gradient(90deg, #6AD39C 0%, #10453F 100%)",
    flexShrink: 0,
  } as SxProps<Theme>,

} as const;
