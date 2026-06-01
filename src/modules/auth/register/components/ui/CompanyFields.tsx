import React from "react";
import { Box, InputAdornment, MenuItem, TextField } from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import PeopleIcon from "@mui/icons-material/People";
import CategoryIcon from "@mui/icons-material/Category";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LanguageIcon from "@mui/icons-material/Language";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import EmailIcon from "@mui/icons-material/Email";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { Control, UseFormRegister, FieldErrors } from "react-hook-form";
import { compactFieldSx, selectMenuProps } from "../registerFormStyles";
import { COMPANY_SIZES, INDUSTRIES } from "../../utils";
import type { CompanyFormValues } from "../../types";

const half = { flex: "1 1 100%", minWidth: 0, "@media (min-width:1025px)": { flex: "1 1 calc(50% - 12px)" } };
const full = { flex: "1 1 100%" };

const placeholder = (text: string) => (
  <span style={{ color: "#C4CAD4", fontSize: "0.82rem", fontFamily: "Poppins" }}>{text}</span>
);

interface Props {
  register: UseFormRegister<CompanyFormValues>;
  control: Control<CompanyFormValues>;
  errors: FieldErrors<CompanyFormValues>;
  loading: boolean;
}

const CompanyFields: React.FC<Props> = ({ register, control, errors, loading }) => {
  const { t } = useTranslation("auth");

  return (
    <>
      <Box sx={half}>
        <TextField label={t("company_form.company_name")} placeholder="Acme Corp" fullWidth required disabled={loading}
          error={!!errors.name} helperText={errors.name?.message}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><BusinessIcon sx={{ fontSize: { xs: 18, md: 20 }, color: "#9CA3AF" }} /></InputAdornment> } }}
          sx={compactFieldSx}
          {...register("name", { required: t("company_form.validation.company_name_required") })}
        />
      </Box>

      <Box sx={half}>
        <TextField label={t("company_form.work_email")} placeholder="contact@company.com" fullWidth required type="email" disabled={loading}
          error={!!errors.email} helperText={errors.email?.message}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailIcon sx={{ fontSize: { xs: 18, md: 20 }, color: "#9CA3AF" }} /></InputAdornment> } }}
          sx={compactFieldSx}
          {...register("email", {
            required: t("company_form.validation.email_required"),
            pattern: { value: /^\S+@\S+\.\S+$/, message: t("company_form.validation.email_invalid") },
          })}
        />
      </Box>

      <Box sx={half}>
        <Controller name="industry" control={control} rules={{ required: t("company_form.validation.industry_required") }}
          render={({ field }) => (
            <TextField {...field} label={t("company_form.industry")} fullWidth required select disabled={loading}
              error={!!errors.industry} helperText={errors.industry?.message}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><CategoryIcon sx={{ fontSize: { xs: 18, md: 20 }, color: "#9CA3AF" }} /></InputAdornment> } }}
              SelectProps={{ MenuProps: selectMenuProps, displayEmpty: true, renderValue: (v: any) => v ? v : placeholder(t("company_form.select_industry")) }}
              sx={compactFieldSx}
            >
              {INDUSTRIES.map((ind) => <MenuItem key={ind} value={ind}>{ind}</MenuItem>)}
            </TextField>
          )}
        />
      </Box>

      <Box sx={half}>
        <Controller name="size" control={control} rules={{ required: t("company_form.validation.size_required") }}
          render={({ field }) => (
            <TextField {...field} label={t("company_form.company_size")} fullWidth required select disabled={loading}
              error={!!errors.size} helperText={errors.size?.message}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><PeopleIcon sx={{ fontSize: { xs: 18, md: 20 }, color: "#9CA3AF" }} /></InputAdornment> } }}
              SelectProps={{ MenuProps: selectMenuProps, displayEmpty: true, renderValue: (v: any) => v ? v : placeholder(t("company_form.select_size")) }}
              sx={compactFieldSx}
            >
              {COMPANY_SIZES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
          )}
        />
      </Box>

      <Box sx={half}>
        <TextField label={t("company_form.location")} placeholder="e.g. Paris, France" fullWidth required disabled={loading}
          error={!!errors.location} helperText={errors.location?.message}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><LocationOnIcon sx={{ fontSize: { xs: 18, md: 20 }, color: "#9CA3AF" }} /></InputAdornment> } }}
          sx={compactFieldSx}
          {...register("location", { required: t("company_form.validation.location_required") })}
        />
      </Box>

      <Box sx={half}>
        <TextField label={t("company_form.website")} placeholder="https://yourcompany.com" fullWidth disabled={loading}
          error={!!errors.website} helperText={errors.website?.message}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><LanguageIcon sx={{ fontSize: { xs: 18, md: 20 }, color: "#9CA3AF" }} /></InputAdornment> } }}
          sx={compactFieldSx}
          {...register("website", {
            validate: (v) => {
              if (!v) return true;
              try {
                const u = new URL(v);
                if (!["http:", "https:"].includes(u.protocol)) return t("company_form.validation.url_protocol");
                if (!u.hostname.includes(".")) return t("company_form.validation.url_domain");
                return true;
              } catch { return t("company_form.validation.url_invalid"); }
            },
          })}
        />
      </Box>

      <Box sx={full}>
        <TextField label={t("company_form.linkedin")} placeholder="https://linkedin.com/company/..." fullWidth disabled={loading}
          error={!!errors.linkedin} helperText={errors.linkedin?.message}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><LinkedInIcon sx={{ fontSize: { xs: 18, md: 20 }, color: "#9CA3AF" }} /></InputAdornment> } }}
          sx={compactFieldSx}
          {...register("linkedin", {
            validate: (v) => {
              if (!v) return true;
              try {
                const u = new URL(v);
                if (!["http:", "https:"].includes(u.protocol)) return t("company_form.validation.linkedin_protocol");
                if (!u.hostname.replace("www.", "").startsWith("linkedin.com")) return t("company_form.validation.linkedin_domain");
                if (!u.pathname.startsWith("/company/")) return t("company_form.validation.linkedin_path");
                return true;
              } catch { return t("company_form.validation.linkedin_protocol"); }
            },
          })}
        />
      </Box>
    </>
  );
};

export default CompanyFields;
