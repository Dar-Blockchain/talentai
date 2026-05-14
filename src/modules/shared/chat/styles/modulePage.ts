/**
 * Messages shell under dashboard scroll (company candidate chat, etc.).
 * Fixed viewport height when the main area scrolls.
 */
export const chatDashboardShellSx = {
  flex: 1,
  display: "flex",
  flexDirection: "column" as const,
  minHeight: 0,
  height: {
    xs: "calc(100vh - 88px)",
    sm: "calc(100vh - 104px)",
    md: "calc(100vh - 120px)",
  },
  maxHeight: {
    xs: "calc(100vh - 88px)",
    sm: "calc(100vh - 104px)",
    md: "calc(100vh - 120px)",
  },
  overflow: "hidden",
};

/**
 * Team messages under `DashboardLayout fillMainHeight`: fills remaining column below header (no vh gap).
 */
export const chatDashboardShellFlexSx = {
  flex: 1,
  minHeight: 0,
  display: "flex",
  flexDirection: "column" as const,
  overflow: "hidden",
  width: "100%",
};

export const chatModulePageSx = {
  root: {
    display: "flex",
    flexDirection: "column",
    height: "calc(100vh - 100px)",
    gap: 2,
  },
  /** When parent already clamps height (e.g. company hub shell). */
  rootFill: {
    height: "100%",
    maxHeight: "100%",
    minHeight: 0,
    overflow: "hidden",
  },
  /** Dashboard messages: parent does not pass height; use viewport clamp instead of height:100%. */
  rootFillViewport: {
    height: chatDashboardShellSx.height,
    maxHeight: chatDashboardShellSx.maxHeight,
    minHeight: 0,
    overflow: "hidden",
  },
  headerPaper: {
    px: 2.5,
    py: 2,
    borderRadius: "18px",
    border: "1px solid #E8EAED",
    bgcolor: "#fff",
  },
  bodyPaper: {
    flex: 1,
    minHeight: 0,
    borderRadius: "18px",
    border: "1px solid #E8EAED",
    bgcolor: "#fff",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#111827",
  },
  /** Used with `dense` headers (e.g. team chat). */
  titleDense: {
    fontSize: { xs: "1.125rem", sm: "1.3125rem" },
    fontWeight: 800,
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
    color: "#0F172A",
  },
  subtitle: {
    fontSize: "13px",
    color: "#6B7280",
    mt: 0.25,
  },
  tabs: {
    minHeight: 40,
    bgcolor: "#F9FAFB",
    borderRadius: "12px",
    p: 0.5,
    "& .MuiTabs-indicator": { display: "none" },
    "& .MuiTab-root": {
      minHeight: 36,
      px: 2,
      textTransform: "none",
      fontWeight: 600,
      borderRadius: "10px",
      color: "#6B7280",
    },
    "& .Mui-selected": {
      bgcolor: "#fff",
      color: "#0F766E",
      boxShadow: "0 1px 3px rgba(15, 118, 110, 0.12)",
    },
  },
} as const;
