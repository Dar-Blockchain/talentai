import React from "react";
import { useTranslation } from "react-i18next";
import { Box, TextField, MenuItem } from "@mui/material";
import { FieldLabel, SectionTitle } from "./SettingsShared";
import { fieldSx, COMPANY_SIZES, EXPERIENCE_LEVELS } from "./settingsConstants";

interface Props {
  profile: any;
  isEditing: boolean;
  fieldErrors: any;
  onInputChange: (key: string, value: string) => void;
}

const EXP_LEVEL_KEYS: Record<string, string> = {
  "Entry Level": "entry",
  "Mid Level": "mid",
  "Senior Level": "senior",
  "Lead": "lead",
  "Executive": "executive",
};

const CompanyInfoTab: React.FC<Props> = ({ profile, isEditing, fieldErrors, onInputChange }) => {
  const { t } = useTranslation("dashboard");

  return (
    <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
      <SectionTitle
        title={t("pages.settings.company_info.title")}
        subtitle={t("pages.settings.company_info.subtitle")}
      />
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 3 }}>

        <Box sx={{ gridColumn: "1 / -1" }}>
          <FieldLabel text={t("pages.settings.company_info.name_label")} />
          <TextField
            value={profile.name || profile.companyName || ""}
            onChange={(e) => { onInputChange("name", e.target.value); onInputChange("companyName", e.target.value); }}
            disabled={!isEditing} fullWidth required
            placeholder={t("pages.settings.company_info.name_placeholder")}
            error={!!fieldErrors.name || !!fieldErrors.companyName}
            helperText={fieldErrors.name || fieldErrors.companyName || ""}
            sx={fieldSx}
          />
        </Box>

        <Box sx={{ gridColumn: "1 / -1" }}>
          <FieldLabel text={t("pages.settings.company_info.email_label")} />
          <TextField
            value={profile.email} disabled fullWidth
            helperText={t("pages.settings.company_info.email_helper")}
            sx={fieldSx}
          />
        </Box>

        <Box>
          <FieldLabel text={t("pages.settings.company_info.industry_label")} />
          <TextField
            value={profile.industry || ""}
            onChange={(e) => onInputChange("industry", e.target.value)}
            disabled={!isEditing} fullWidth
            placeholder={t("pages.settings.company_info.industry_placeholder")}
            error={!!fieldErrors.industry} helperText={fieldErrors.industry || ""}
            sx={fieldSx}
          />
        </Box>

        <Box>
          <FieldLabel text={t("pages.settings.company_info.size_label")} />
          <TextField select value={profile.size || profile.companySize || ""}
            onChange={(e) => { onInputChange("size", e.target.value); onInputChange("companySize", e.target.value); }}
            disabled={!isEditing} fullWidth
            error={!!fieldErrors.size} helperText={fieldErrors.size || ""}
            sx={fieldSx}
          >
            {COMPANY_SIZES.map((s) => (
              <MenuItem key={s} value={s}>{s} {t("pages.settings.employees_suffix")}</MenuItem>
            ))}
          </TextField>
        </Box>

        <Box sx={{ gridColumn: "1 / -1" }}>
          <FieldLabel text={t("pages.settings.company_info.experience_label")} />
          <TextField select value={profile.requiredExperienceLevel || "Mid Level"}
            onChange={(e) => onInputChange("requiredExperienceLevel", e.target.value)}
            disabled={!isEditing} fullWidth sx={fieldSx}
          >
            {EXPERIENCE_LEVELS.map((l) => (
              <MenuItem key={l} value={l}>
                {t(`pages.settings.experience_levels.${EXP_LEVEL_KEYS[l]}`, { defaultValue: l })}
              </MenuItem>
            ))}
          </TextField>
        </Box>

      </Box>
    </Box>
  );
};

export default CompanyInfoTab;
