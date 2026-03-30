export const TEAL        = "#0D9488";
export const TEAL_BG     = "#F0FDFA";
export const TEAL_BORDER = "#99F6E4";

export const COMPANY_SIZES     = ["1-10", "11-50", "51-200", "201-500", "500+"];
export const EXPERIENCE_LEVELS = ["Entry Level", "Mid Level", "Senior Level", "Lead", "Executive"];
export const EMPLOYMENT_TYPES  = ["Remote", "On-site", "Hybrid"];
export const AVAILABLE_SCOPES  = [
  "read:dashboard", "write:dashboard",
  "read:posts", "write:posts",
  "read:applications", "write:applications",
];

export const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    fontSize: "0.875rem",
    "&.Mui-focused fieldset": { borderColor: TEAL },
    "&.Mui-disabled": { bgcolor: "#F9FAFB" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: TEAL },
  "& .MuiInputLabel-root": { fontSize: "0.875rem" },
};

export const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
