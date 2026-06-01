import React from "react";
import { Box, InputAdornment, TextField } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import { useTranslation } from "react-i18next";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { compactFieldSx } from "../registerFormStyles";
import type { CandidateFormValues } from "../../types";

const half = { flex: "1 1 100%", minWidth: 0, "@media (min-width:1025px)": { flex: "1 1 calc(50% - 12px)" } };

interface Props {
  register: UseFormRegister<CandidateFormValues>;
  errors: FieldErrors<CandidateFormValues>;
  loading: boolean;
  invitationEmail: string;
}

const CandidateFields: React.FC<Props> = ({ register, errors, loading, invitationEmail }) => {
  const { t } = useTranslation("auth");

  return (
    <>
      <Box sx={half}>
        <TextField label={t("candidate_form.first_name")} placeholder="John" fullWidth required disabled={loading}
          error={!!errors.firstName} helperText={errors.firstName?.message}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><PersonIcon sx={{ fontSize: { xs: 18, md: 20 }, color: "#9CA3AF" }} /></InputAdornment> } }}
          sx={compactFieldSx}
          {...register("firstName", { required: t("candidate_form.validation.first_name_required") })}
        />
      </Box>
      <Box sx={half}>
        <TextField label={t("candidate_form.last_name")} placeholder="Doe" fullWidth required disabled={loading}
          error={!!errors.lastName} helperText={errors.lastName?.message}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><PersonIcon sx={{ fontSize: { xs: 18, md: 20 }, color: "#9CA3AF" }} /></InputAdornment> } }}
          sx={compactFieldSx}
          {...register("lastName", { required: t("candidate_form.validation.last_name_required") })}
        />
      </Box>
      <Box sx={half}>
        <TextField label={t("candidate_form.email")} placeholder="john@example.com" fullWidth required type="email"
          disabled={loading || !!invitationEmail} error={!!errors.email}
          helperText={invitationEmail ? t("candidate_form.email_prefilled") : errors.email?.message}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailIcon sx={{ fontSize: { xs: 18, md: 20 }, color: "#9CA3AF" }} /></InputAdornment> } }}
          sx={compactFieldSx}
          {...register("email", {
            required: t("candidate_form.validation.email_required"),
            pattern: { value: /^\S+@\S+\.\S+$/, message: t("candidate_form.validation.email_invalid") },
          })}
        />
      </Box>
      <Box sx={half}>
        <TextField label={t("candidate_form.phone")} placeholder="+1 234 567 890" fullWidth required disabled={loading}
          error={!!errors.phone} helperText={errors.phone?.message}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ fontSize: { xs: 18, md: 20 }, color: "#9CA3AF" }} /></InputAdornment> } }}
          sx={compactFieldSx}
          {...register("phone", {
            required: t("candidate_form.validation.phone_required"),
            validate: (v) => /^\+?[1-9]\d{6,14}$/.test(v.replace(/[\s\-().]/g, "")) || t("candidate_form.validation.phone_invalid"),
          })}
        />
      </Box>
    </>
  );
};

export default CandidateFields;
