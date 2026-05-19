import type { SxProps, Theme } from "@mui/material";

export const interviewScreenSx = {
  root: {
    height: { xs: "auto", md: "100vh" },
    minHeight: { xs: "100vh", md: "unset" },
    display: "flex",
    flexDirection: "column",
    overflow: { md: "hidden" },
    bgcolor: "#f8fdfb",
    userSelect: "none",
    WebkitUserSelect: "none",
  } as SxProps<Theme>,

  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    py: { xs: 1.5, md: 1 },
    px: { xs: 1.5, md: 3 },
  } as SxProps<Theme>,

  grid: (hasCoverage: boolean): SxProps<Theme> => ({
    flex: 1,
    minHeight: 0,
    maxHeight: { md: "min(500px, calc(100vh - 130px))" },
    display: "grid",
    gridTemplateColumns: {
      xs: "1fr",
      sm: "1fr 1fr",
      md: hasCoverage ? "1fr 2fr 1fr" : "2fr 1fr",
    },
    gap: { xs: 1.5, md: 1 },
    mt: { xs: 1, md: 0.75 },
  }),

} as const;
