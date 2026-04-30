"use client";

import { Box, Button, CircularProgress, Divider, MenuItem, TextField, Typography } from "@mui/material";
import AutoAwesomeOutlined from "@mui/icons-material/AutoAwesomeOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import AttachMoneyOutlined from "@mui/icons-material/AttachMoneyOutlined";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import GenerateLanguageModal from "./GenerateLanguageModal";
import { contractTypes, defaultCurrencies, workModes } from "@/constants/candidate";
import { EMPLOYMENT_OPTION_KEY, optionLabel, WORK_MODE_OPTION_KEY } from "@/utils/postFormI18n";
import {
  generatePost,
  setEmploymentType,
  setExpirationDate,
  setPromptDescription,
  setWorkMode,
  updateSalaryField,
} from "@/store/slices/postGenerationSlice";
import { AppDispatch } from "@/store/store";

const TEAL        = "#0D9488";
const TEAL_BG     = "#F0FDFA";
const TEAL_BORDER = "#D1FAE5";

const fieldSx = {
  "& .MuiInputBase-root": {
    height: 38,
    fontSize: "12.5px",
    borderRadius: "8px",
    bgcolor: "#FAFAFA",
  },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: TEAL },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: `${TEAL} !important` },
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Typography sx={{ fontSize: "10.5px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em", mb: 1.25 }}>
    {children}
  </Typography>
);

const FieldLabel = ({ icon: Icon, label }: { icon?: React.ElementType; label: string }) => (
  <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "#6B7280", mb: 0.5, display: "flex", alignItems: "center", gap: 0.5 }}>
    {Icon && <Icon sx={{ fontSize: 12 }} />}
    {label}
  </Typography>
);

const PostDescription = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { promptDescription, salary, workMode, employmentType, expirationDate, loading } = useSelector(
    (state: any) => state.postGeneration
  );

  const [errors, setErrors] = useState({
    promptDescription: "",
    salary: "",
    employmentType: "",
    workMode: "",
  });
  const [langModalOpen, setLangModalOpen] = useState(false);
  const { t } = useTranslation("posts");

  const clear = (key: string) => setErrors((prev) => ({ ...prev, [key]: "" }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!promptDescription.trim()) e.promptDescription = t("create.form.error_prompt");
    if (!salary.min || !salary.max || !salary.currency) {
      e.salary = t("create.form.error_salary_required");
    } else if (Number(salary.max) <= Number(salary.min)) {
      e.salary = t("create.form.error_salary_max");
    }
    if (!employmentType) e.employmentType = t("create.form.error_required");
    if (!workMode) e.workMode = t("create.form.error_required");
    setErrors(e as any);
    return Object.keys(e).length === 0;
  };

  const handleGenerate = () => {
    if (!validate()) return;
    setLangModalOpen(true);
  };

  const handleConfirmLanguage = (language: string) => {
    dispatch(generatePost({ jobDescription: promptDescription, salary, workMode, contractType: employmentType, language }));
    setLangModalOpen(false);
  };

  const handleSalaryChange = (field: "min" | "max" | "currency", raw: string) => {
    let value: string | number = raw;
    if (field === "min" || field === "max") {
      const digits = raw.replace(/\D/g, "").replace(/^0+/, "");
      value = digits === "" ? 0 : Number(digits);
    }
    dispatch(updateSalaryField({ field, value }));
    clear("salary");
  };

  return (
    <Box
      sx={{
        bgcolor: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: "16px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
      }}
    >
      {/* ── Card header ─────────────────────────────────────────────────────── */}
      <Box
        sx={{
          bgcolor: TEAL_BG,
          borderBottom: `1px solid ${TEAL_BORDER}`,
          px: 2.5, py: 1.75,
          display: "flex", alignItems: "center", gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 34, height: 34, borderRadius: "9px",
            bgcolor: TEAL, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <AutoAwesomeOutlined sx={{ fontSize: 17, color: "#fff" }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: "13.5px", fontWeight: 700, color: "#111827", lineHeight: 1.25 }}>
            {t("create.form.header_title")}
          </Typography>
          <Typography sx={{ fontSize: "11.5px", color: "#6B7280", lineHeight: 1.3 }}>
            {t("create.form.header_subtitle")}
          </Typography>
        </Box>
      </Box>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <Box sx={{ px: 2.5, pt: 2, pb: 0, display: "flex", flexDirection: "column", gap: 1.75 }}>

        {/* Prompt textarea */}
        <Box>
          <FieldLabel label={t("create.form.prompt_label")} />
          <TextField
            value={promptDescription}
            onChange={(e) => { dispatch(setPromptDescription(e.target.value)); clear("promptDescription"); }}
            placeholder={t("create.form.prompt_placeholder")}
            multiline
            minRows={5}
            maxRows={8}
            fullWidth
            error={!!errors.promptDescription}
            helperText={errors.promptDescription}
            sx={{
              "& .MuiInputBase-root": {
                fontSize: "13px", borderRadius: "10px",
                bgcolor: "#FAFAFA", lineHeight: 1.65,
              },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: TEAL },
            }}
            FormHelperTextProps={{ sx: { ml: 0, fontSize: "11px" } }}
          />
        </Box>

        <Divider sx={{ borderColor: "#F3F4F6" }} />

        {/* Role details row */}
        <Box>
          <SectionLabel>{t("create.form.section_role")}</SectionLabel>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1.5 }}>
            <Box>
              <FieldLabel icon={WorkOutlined} label={t("create.post_form.labels.employment_type")} />
              <TextField
                select fullWidth
                value={employmentType}
                onChange={(e) => { dispatch(setEmploymentType(e.target.value)); clear("employmentType"); }}
                error={!!errors.employmentType}
                sx={fieldSx}
              >
                <MenuItem disabled value="" sx={{ fontSize: "12px" }}>{t("create.post_form.placeholders.select_employment_type")}</MenuItem>
                {contractTypes.map((c) => (
                  <MenuItem key={c} value={c} sx={{ fontSize: "12px" }}>{optionLabel(t, c, EMPLOYMENT_OPTION_KEY)}</MenuItem>
                ))}
              </TextField>
              {errors.employmentType && (
                <Typography sx={{ fontSize: "10.5px", color: "#EF4444", mt: 0.25 }}>
                  {errors.employmentType}
                </Typography>
              )}
            </Box>

            <Box>
              <FieldLabel icon={LocationOnOutlined} label={t("create.post_form.labels.work_mode")} />
              <TextField
                select fullWidth
                value={workMode}
                onChange={(e) => { dispatch(setWorkMode(e.target.value)); clear("workMode"); }}
                error={!!errors.workMode}
                sx={fieldSx}
              >
                <MenuItem disabled value="" sx={{ fontSize: "12px" }}>{t("create.post_form.placeholders.select_work_mode")}</MenuItem>
                {workModes.map((m) => (
                  <MenuItem key={m} value={m} sx={{ fontSize: "12px" }}>{optionLabel(t, m, WORK_MODE_OPTION_KEY)}</MenuItem>
                ))}
              </TextField>
              {errors.workMode && (
                <Typography sx={{ fontSize: "10.5px", color: "#EF4444", mt: 0.25 }}>
                  {errors.workMode}
                </Typography>
              )}
            </Box>

            <Box>
              <FieldLabel icon={CalendarTodayOutlined} label={t("create.post_form.labels.expires")} />
              <TextField
                type="date"
                fullWidth
                value={expirationDate ? new Date(expirationDate).toISOString().split("T")[0] : ""}
                onChange={(e) => {
                  if (e.target.value) dispatch(setExpirationDate(new Date(e.target.value).toISOString()));
                }}
                slotProps={{ htmlInput: { min: new Date().toISOString().split("T")[0] } }}
                sx={fieldSx}
              />
            </Box>
          </Box>
        </Box>

        {/* Salary row */}
        <Box>
          <SectionLabel>{t("create.post_form.labels.salary_section")}</SectionLabel>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1.4fr 1.4fr", gap: 1.5 }}>
            <Box>
              <FieldLabel icon={AttachMoneyOutlined} label={t("create.post_form.labels.currency")} />
              <TextField
                select fullWidth
                value={salary.currency || ""}
                onChange={(e) => handleSalaryChange("currency", e.target.value)}
                sx={fieldSx}
              >
                <MenuItem disabled value="" sx={{ fontSize: "12px" }}>{t("create.post_form.placeholders.select_currency")}</MenuItem>
                {defaultCurrencies.map((c: any) => (
                  <MenuItem key={c.value} value={c.value} sx={{ fontSize: "12px" }}>{c.label}</MenuItem>
                ))}
              </TextField>
            </Box>

            <Box>
              <FieldLabel label={t("create.post_form.labels.minimum")} />
              <TextField
                type="text" fullWidth
                value={salary.min || ""}
                onChange={(e) => handleSalaryChange("min", e.target.value)}
                placeholder={t("create.post_form.placeholders.min_salary_example")}
                sx={fieldSx}
              />
            </Box>

            <Box>
              <FieldLabel label={t("create.post_form.labels.maximum")} />
              <TextField
                type="text" fullWidth
                value={salary.max || ""}
                onChange={(e) => handleSalaryChange("max", e.target.value)}
                placeholder={t("create.post_form.placeholders.max_salary_example")}
                sx={fieldSx}
              />
            </Box>
          </Box>
          {errors.salary && (
            <Typography sx={{ fontSize: "11px", color: "#EF4444", mt: 0.5 }}>
              {errors.salary}
            </Typography>
          )}
        </Box>
      </Box>

      {/* ── Generate button ──────────────────────────────────────────────────── */}
      <Box sx={{ px: 2.5, pt: 2, pb: 2.5 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={handleGenerate}
          disabled={loading}
          startIcon={
            loading
              ? <CircularProgress size={15} sx={{ color: "#fff" }} />
              : <AutoAwesomeOutlined sx={{ fontSize: 17 }} />
          }
          sx={{
            textTransform: "none", fontWeight: 700, fontSize: "13.5px",
            borderRadius: "10px", height: 44,
            bgcolor: TEAL, color: "#fff", boxShadow: "none",
            "&:hover": { bgcolor: "#0F766E", boxShadow: "0 4px 14px rgba(13,148,136,0.28)" },
            "&.Mui-disabled": { bgcolor: TEAL, opacity: 0.65, color: "#fff" },
            transition: "all 0.2s",
          }}
        >
          {loading ? t("create.form.btn_generating") : t("create.form.btn_generate")}
        </Button>
      </Box>

      <GenerateLanguageModal
        open={langModalOpen}
        loading={loading}
        onConfirm={handleConfirmLanguage}
        onClose={() => setLangModalOpen(false)}
      />
    </Box>
  );
};

export default PostDescription;
