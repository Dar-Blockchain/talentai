import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Box, TextField, MenuItem, Autocomplete } from "@mui/material";
import { FieldLabel, SectionTitle } from "./SettingsShared";
import { fieldSx, COMPANY_SIZES, EMPLOYMENT_TYPES } from "./settingsConstants";
import { getAllCountryNames } from "@/utils/countryMappings";

interface Props {
  profile: any;
  isEditing: boolean;
  fieldErrors: any;
  onInputChange: (key: string, value: string) => void;
}

const EMP_TYPE_KEYS: Record<string, string> = {
  "Remote": "remote",
  "On-site": "onsite",
  "Hybrid": "hybrid",
};

const ContactTab: React.FC<Props> = ({ profile, isEditing, fieldErrors, onInputChange }) => {
  const { t } = useTranslation("dashboard");
  const countries = useMemo(() => getAllCountryNames(), []);

  return (
    <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
      <SectionTitle
        title={t("pages.settings.contact.title")}
        subtitle={t("pages.settings.contact.subtitle")}
      />
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 3 }}>

        <Box sx={{ gridColumn: "1 / -1" }}>
          <FieldLabel text={t("pages.settings.contact.country_label")} />
          <Autocomplete
            options={countries} value={profile.location || null}
            onChange={(_, v) => onInputChange("location", v || "")}
            disabled={!isEditing} fullWidth
            renderInput={(params) => (
              <TextField {...params} placeholder={t("pages.settings.contact.country_placeholder")} sx={fieldSx} />
            )}
          />
        </Box>

        <Box>
          <FieldLabel text={t("pages.settings.contact.employment_label")} />
          <TextField select value={profile.employmentType || "Remote"}
            onChange={(e) => onInputChange("employmentType", e.target.value)}
            disabled={!isEditing} fullWidth
            error={!!fieldErrors.employmentType} helperText={fieldErrors.employmentType || ""}
            sx={fieldSx}
          >
            {EMPLOYMENT_TYPES.map((v) => (
              <MenuItem key={v} value={v}>
                {t(`pages.settings.employment_types.${EMP_TYPE_KEYS[v]}`, { defaultValue: v })}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Box>
          <FieldLabel text={t("pages.settings.contact.size_label")} />
          <TextField select value={profile.size || ""}
            onChange={(e) => onInputChange("size", e.target.value)}
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
          <FieldLabel text={t("pages.settings.contact.linkedin_label")} />
          <TextField
            value={profile.linkedin || ""}
            onChange={(e) => onInputChange("linkedin", e.target.value)}
            disabled={!isEditing} fullWidth type="url"
            placeholder="https://linkedin.com/company/yourcompany"
            error={!!fieldErrors.linkedin} helperText={fieldErrors.linkedin || ""}
            sx={fieldSx}
          />
        </Box>

        <Box sx={{ gridColumn: "1 / -1" }}>
          <FieldLabel text={t("pages.settings.contact.website_label")} />
          <TextField
            value={profile.website || ""}
            onChange={(e) => onInputChange("website", e.target.value)}
            disabled={!isEditing} fullWidth type="url"
            placeholder="https://yourcompany.com"
            error={!!fieldErrors.website} helperText={fieldErrors.website || ""}
            sx={fieldSx}
          />
        </Box>

      </Box>
    </Box>
  );
};

export default ContactTab;
