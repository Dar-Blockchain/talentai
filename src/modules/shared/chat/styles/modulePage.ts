export const chatModulePageSx = {
  root: {
    display: "flex",
    flexDirection: "column",
    height: "calc(100vh - 100px)",
    gap: 2,
  },
  rootFill: {
    height: "100%",
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
