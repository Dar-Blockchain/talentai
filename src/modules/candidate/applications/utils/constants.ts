export const T = "#0D9488";
export const TL = "#14B8A6";
export const TBG = "#F0FDFA";
export const TBRD = "#99F6E4";
export const NAVY = "#0D1B2A";

export const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  applied:             { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
  pending:             { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
  shortlisted:         { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" },
  accepted:            { bg: TBG,       color: T,         border: TBRD      },
  rejected:            { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
  withdrawn:           { bg: "#F3F4F6", color: "#6B7280", border: "#E5E7EB" },
  interview_scheduled: { bg: TBG,       color: T,         border: TBRD      },
  interview_completed: { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" },
  viewed:              { bg: "#F8FAFC", color: "#475569", border: "#CBD5E1" },
  visited:             { bg: "#F8FAFC", color: "#475569", border: "#CBD5E1" },
};

export const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
