export const ACCENT = "#0D9488";
export const ACCENT2 = "#059669";

export const compactFieldSx = {
  "& .MuiInputLabel-root": {
    color: "#6B7280",
    fontFamily: "Poppins",
    fontWeight: 500,
    fontSize: { xs: "0.73rem", sm: "0.75rem" },
  },
  "& .MuiFormLabel-asterisk": { color: "#EF4444" },
  "& .MuiInputLabel-root.Mui-focused": { color: ACCENT },
  "& .MuiInputBase-input": {
    fontSize: { xs: "0.85rem", sm: "0.88rem" },
    fontFamily: "Poppins",
  },
  "& .MuiInputBase-input::placeholder": {
    fontSize: { xs: "0.68rem", sm: "0.7rem" },
    opacity: 1,
    color: "#C4CAD4",
  },
  "& .MuiFormHelperText-root": {
    fontSize: "0.7rem",
    mt: 0.5,
    fontFamily: "Poppins",
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    fontFamily: "Poppins",
    fontSize: { xs: "0.85rem", sm: "0.88rem" },
    bgcolor: "#F9FAFB",
    height: { xs: 44, sm: 46 },
    transition: "background-color 0.15s",
    "& fieldset": { borderColor: "#E5E7EB", borderWidth: "1.5px" },
    "&:hover fieldset": { borderColor: "#D1D5DB" },
    "&:hover": { bgcolor: "#F3F4F6" },
    "&.Mui-focused fieldset": { borderColor: ACCENT, borderWidth: "1.5px" },
    "&.Mui-focused": { bgcolor: "#fff" },
    "& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active":
      {
        WebkitBoxShadow: "0 0 0 1000px #F9FAFB inset",
        WebkitTextFillColor: "#0F172A",
        caretColor: "#0F172A",
        transition: "background-color 9999s ease-out 0s",
        borderRadius: "inherit",
      },
  },
};

export const compactSubmitBtnSx = {
  textTransform: "none",
  fontFamily: "Poppins",
  fontWeight: 600,
  borderRadius: "10px",
  height: { xs: 44, sm: 46 },
  px: { xs: 1.25, sm: 1.75 },
  background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT2} 100%)`,
  color: "#fff",
  boxShadow: `0 4px 20px ${ACCENT}50`,
  letterSpacing: "0.01em",
  fontSize: { xs: "0.88rem", sm: "0.92rem" },
  transition: "all 0.2s",
  "&:hover": {
    background: `linear-gradient(135deg, #0caa9d 0%, ${ACCENT2} 100%)`,
    boxShadow: `0 8px 28px ${ACCENT}60`,
    transform: "translateY(-1px)",
  },
  "&:active": { transform: "translateY(0)" },
  "&.Mui-disabled": { background: "#F3F4F6", color: "#9CA3AF", boxShadow: "none" },
};

export const selectMenuProps = {
  disableScrollLock: true,
  PaperProps: {
    sx: {
      mt: 0.5,
      borderRadius: 2,
      boxShadow: "0px 4px 20px rgba(0,0,0,0.08)",
      border: "1px solid rgba(0,0,0,0.06)",
      "& .MuiList-root": { py: 0.5 },
      "& .MuiMenuItem-root": {
        fontSize: { xs: "0.84rem", sm: "0.87rem", md: "0.9rem" },
        py: 0.75,
        px: 1.5,
        borderRadius: 1,
        mx: 0.5,
        color: "#444",
        fontFamily: "Poppins",
        transition: "background 0.15s",
        "&:hover": { background: `rgba(13,148,136,0.08)`, color: "#222" },
        "&.Mui-selected": {
          background: `rgba(13,148,136,0.12)`,
          color: ACCENT,
          fontWeight: 600,
          "&:hover": { background: `rgba(13,148,136,0.18)` },
        },
      },
    },
  },
};
