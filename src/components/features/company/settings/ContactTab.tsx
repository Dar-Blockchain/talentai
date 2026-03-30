import React, { useMemo } from "react";
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

const ContactTab: React.FC<Props> = ({ profile, isEditing, fieldErrors, onInputChange }) => {
  const countries = useMemo(() => getAllCountryNames(), []);

  return (
    <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
      <SectionTitle title="Contact & Presence" subtitle="Location, social links, and work preferences" />
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 3 }}>

        <Box sx={{ gridColumn: "1 / -1" }}>
          <FieldLabel text="Country / Location" />
          <Autocomplete
            options={countries} value={profile.location || null}
            onChange={(_, v) => onInputChange("location", v || "")}
            disabled={!isEditing} fullWidth
            renderInput={(params) => <TextField {...params} placeholder="Select country" sx={fieldSx} />}
          />
        </Box>

        <Box>
          <FieldLabel text="Employment Type" />
          <TextField select value={profile.employmentType || "Remote"}
            onChange={(e) => onInputChange("employmentType", e.target.value)}
            disabled={!isEditing} fullWidth
            error={!!fieldErrors.employmentType} helperText={fieldErrors.employmentType || ""}
            sx={fieldSx}
          >
            {EMPLOYMENT_TYPES.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
          </TextField>
        </Box>

        <Box>
          <FieldLabel text="Company Size" />
          <TextField select value={profile.size || ""}
            onChange={(e) => onInputChange("size", e.target.value)}
            disabled={!isEditing} fullWidth
            error={!!fieldErrors.size} helperText={fieldErrors.size || ""}
            sx={fieldSx}
          >
            {COMPANY_SIZES.map((s) => <MenuItem key={s} value={s}>{s} employees</MenuItem>)}
          </TextField>
        </Box>

        <Box sx={{ gridColumn: "1 / -1" }}>
          <FieldLabel text="LinkedIn URL" />
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
          <FieldLabel text="Company Website" />
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
