import React from "react";
import { Box, Typography, TextField, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";

export interface DeptFormFieldsProps {
  name: string;
  description: string;
  nameError: string;
  onNameChange: (v: string) => void;
  onDescChange: (v: string) => void;
  apiError: string | null;
}

const DeptFormFields: React.FC<DeptFormFieldsProps> = ({
  name,
  description,
  nameError,
  onNameChange,
  onDescChange,
  apiError,
}) => {
  const { t, i18n } = useTranslation("dashboard");
  const inputLang = i18n.language.startsWith("fr") ? "fr" : "en";

  return (
    <Stack spacing={2.5}>
      {apiError && (
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderRadius: 2,
            bgcolor: "#FEF2F2",
            border: "1px solid #FECACA",
          }}
        >
          <Typography sx={{ fontSize: "13px", color: "#DC2626" }}>{apiError}</Typography>
        </Box>
      )}

      <Box>
        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#374151", mb: 0.75 }}>
          {t("pages.departments.form.name_label")}{" "}
          <Box component="span" sx={{ color: "#EF4444" }}>*</Box>
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder={t("pages.departments.form.name_placeholder")}
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          error={Boolean(nameError)}
          helperText={nameError}
          inputProps={{ lang: inputLang, spellCheck: true }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "14px" } }}
        />
      </Box>

      <Box>
        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#374151", mb: 0.75 }}>
          {t("pages.departments.form.description_label")}
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          size="small"
          placeholder={t("pages.departments.form.description_placeholder")}
          value={description}
          onChange={(e) => onDescChange(e.target.value)}
          inputProps={{ maxLength: 500, lang: inputLang, spellCheck: true }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "14px" } }}
        />
        <Typography sx={{ fontSize: "11px", color: "#9CA3AF", mt: 0.5, textAlign: "right" }}>
          {t("pages.departments.form.character_count", { current: description.length })}
        </Typography>
      </Box>
    </Stack>
  );
};

export default DeptFormFields;
