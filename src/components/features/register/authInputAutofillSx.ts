/**
 * Chrome/Safari apply default autofill colours that clash with our grey fields.
 * Use inside `& .MuiOutlinedInput-root` so autofilled text stays dark on #F9FAFB / #fff.
 */
export const authOutlinedInputAutofillSx = {
  "& input:-webkit-autofill": {
    WebkitBoxShadow: "0 0 0 100px #F9FAFB inset",
    WebkitTextFillColor: "#0F172A",
    caretColor: "#0F172A",
    borderRadius: "inherit",
  },
  "& input:-webkit-autofill:hover": {
    WebkitBoxShadow: "0 0 0 100px #F3F4F6 inset",
    WebkitTextFillColor: "#0F172A",
  },
  "& input:-webkit-autofill:focus": {
    WebkitBoxShadow: "0 0 0 100px #FFFFFF inset",
    WebkitTextFillColor: "#0F172A",
  },
};
