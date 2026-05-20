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

  grid: {
    flex: 1,
    minHeight: 0,
    maxHeight: { md: "min(500px, calc(100vh - 130px))" },
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
  } as SxProps<Theme>,

  lobbyAccentBar: {
    height: 4,
    background: "linear-gradient(90deg, #6AD39C 0%, #10453F 100%)",
  } as SxProps<Theme>,

} as const;
