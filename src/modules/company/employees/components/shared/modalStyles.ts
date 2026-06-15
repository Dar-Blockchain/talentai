/** Shared sx constants for AddEmployeeModal and EditRoleModal. */

export const PURPLE = "#8310FF";

export const DIALOG_PAPER_SX = {
  borderRadius: 3,
  maxHeight: "90vh",
  boxShadow: "0 20px 48px rgba(0,0,0,0.12)",
} as const;

export const HEADER_ICON_SX = {
  width: 38, height: 38, borderRadius: 2,
  bgcolor: `${PURPLE}18`,
  display: "flex", alignItems: "center", justifyContent: "center",
  color: PURPLE,
} as const;

export const CLOSE_BTN_SX = {
  color: "#9CA3AF",
  "&:hover": { bgcolor: "#F3F4F6", color: "#374151" },
} as const;

export const FIELD_INPUT_SX = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2, bgcolor: "#F8FAFC",
    "& fieldset": { borderColor: "#E2E8F0" },
    "&:hover fieldset": { borderColor: "#CBD5E1" },
    "&.Mui-focused fieldset": { borderColor: PURPLE, borderWidth: 2 },
  },
} as const;

export const SELECT_SX = {
  borderRadius: 2, bgcolor: "#F8FAFC",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: PURPLE, borderWidth: 2 },
} as const;

export const SEARCH_FIELD_SX = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 1.5, bgcolor: "#F8FAFC",
    "& fieldset": { borderColor: "#E2E8F0" },
    "&:hover fieldset": { borderColor: "#CBD5E1" },
    "&.Mui-focused fieldset": { borderColor: PURPLE, borderWidth: 2 },
  },
} as const;

export const STICKY_SEARCH_ITEM_SX = {
  position: "sticky", top: 0, zIndex: 1,
  bgcolor: "#fff", p: 1.25,
  borderBottom: "1px solid #f3f4f6",
  "&:hover": { bgcolor: "#fff" },
  "&.Mui-focusVisible": { bgcolor: "#fff" },
} as const;

export const MENU_PAPER_SX = {
  maxHeight: 360, borderRadius: 2, mt: 0.5,
  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
} as const;

export const CANCEL_BTN_SX = {
  textTransform: "none", fontWeight: 600,
  color: "#6B7280", borderRadius: 2, px: 3,
  "&:hover": { bgcolor: "#F3F4F6" },
} as const;

export const PRIMARY_BTN_SX = {
  textTransform: "none", fontWeight: 700, borderRadius: 2, px: 3,
  bgcolor: PURPLE, color: "#fff",
  boxShadow: "0 2px 8px rgba(131,16,255,0.3)",
  "&:hover": { bgcolor: "#7209E6", boxShadow: "0 4px 14px rgba(131,16,255,0.4)" },
  "&.Mui-disabled": { bgcolor: "#E5E7EB", color: "#9CA3AF", boxShadow: "none" },
} as const;

export const FIELD_LABEL_SX = {
  mb: 1, fontWeight: 600, fontSize: "0.8rem", color: "#374151",
} as const;
