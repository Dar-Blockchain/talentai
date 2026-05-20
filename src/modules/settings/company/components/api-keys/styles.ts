import { TEAL } from "@/modules/settings/shared/constants";

export const addBtnSx = {
  textTransform: "none",
  fontWeight: 700,
  fontSize: "0.78rem",
  bgcolor: TEAL,
  color: "#fff",
  borderRadius: "9px",
  px: 2,
  boxShadow: "none",
  "&:hover": { bgcolor: "#0F766E", boxShadow: "none" },
} as const;

export const deleteBtnSx = {
  textTransform: "none",
  fontWeight: 700,
  bgcolor: "#EF4444",
  color: "#fff",
  borderRadius: "9px",
  px: 2.5,
  boxShadow: "none",
  "&:hover": { bgcolor: "#DC2626", boxShadow: "none" },
} as const;

export const cancelBtnSx = {
  textTransform: "none",
  fontWeight: 600,
  color: "#6B7280",
  border: "1px solid #E5E7EB",
  borderRadius: "9px",
  px: 2,
} as const;

export const saveBtnSx = {
  textTransform: "none",
  fontWeight: 700,
  bgcolor: TEAL,
  color: "#fff",
  borderRadius: "9px",
  px: 2.5,
  boxShadow: "none",
  "&:hover": { bgcolor: "#0F766E", boxShadow: "none" },
  "&.Mui-disabled": { bgcolor: "#E5E7EB" },
} as const;

// Applied directly to InputProps.sx — mirrors AppInput exactly
export const datePickerInputSx = {
  bgcolor: "#fff",
  borderRadius: 2,
  fontSize: "13px",
  height: 38,
  "& input": { fontSize: "13px" },
  "& .MuiOutlinedInput-notchedOutline":             { borderColor: "#E5E7EB" },
  "&:hover .MuiOutlinedInput-notchedOutline":       { borderColor: "#D1D5DB" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: TEAL,
    borderWidth: "1px",
    boxShadow: `0 0 0 4px rgba(13,148,136,0.1)`,
  },
} as const;
