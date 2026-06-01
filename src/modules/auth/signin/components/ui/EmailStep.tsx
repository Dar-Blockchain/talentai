import React from "react";
import { Box, InputAdornment, TextField, Typography } from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import { useTranslation } from "react-i18next";
import { ACCENT } from "@/modules/auth/shared/types";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { SigninFormValues } from "../../types";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px", fontFamily: "Poppins", fontSize: { xs: "0.85rem", sm: "0.88rem" },
    height: { xs: 44, sm: 46 }, bgcolor: "#F9FAFB", transition: "background-color 0.15s",
    "& fieldset": { borderColor: "#E5E7EB", borderWidth: "1.5px" },
    "&:hover fieldset": { borderColor: "#D1D5DB" },
    "&:hover": { bgcolor: "#F3F4F6" },
    "&.Mui-focused fieldset": { borderColor: ACCENT, borderWidth: "1.5px" },
    "&.Mui-focused": { bgcolor: "#fff" },
    "& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active": {
      WebkitBoxShadow: "0 0 0 1000px #F9FAFB inset", WebkitTextFillColor: "#0F172A",
      caretColor: "#0F172A", transition: "background-color 9999s ease-out 0s", borderRadius: "inherit",
    },
  },
  "& .MuiFormHelperText-root": { fontFamily: "Poppins", fontSize: "0.7rem", mt: 0.5 },
};

interface Props {
  register: UseFormRegister<SigninFormValues>;
  errors: FieldErrors<SigninFormValues>;
  loading: boolean;
  invitationEmail: string;
}

const EmailStep: React.FC<Props> = ({ register, errors, loading, invitationEmail }) => {
  const { t } = useTranslation("auth");

  return (
    <Box>
      <Typography sx={{ fontSize: { xs: "0.73rem", sm: "0.75rem" }, fontWeight: 500, color: "#374151", fontFamily: "Poppins", mb: 0.5 }}>
        {t("signin.email_label")}
      </Typography>
      <TextField
        error={!!errors.email}
        helperText={invitationEmail ? t("signin.email_prefilled") : errors.email?.message}
        fullWidth placeholder="you@company.com"
        disabled={loading || !!invitationEmail}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailOutlinedIcon sx={{ fontSize: 17, color: "#9CA3AF" }} /></InputAdornment> } }}
        sx={fieldSx}
        {...register("email", {
          required: t("signin.validation.email_required"),
          pattern: { value: /^\S+@\S+\.\S+$/, message: t("signin.validation.email_invalid") },
        })}
      />
      <Typography sx={{ fontSize: { xs: "0.68rem", sm: "0.7rem" }, color: "#9CA3AF", fontFamily: "Poppins", mt: 0.5 }}>
        {t("signin.email_hint")}
      </Typography>
    </Box>
  );
};

export default EmailStep;
