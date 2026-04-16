import React from "react";
import { Box, TextField, MenuItem } from "@mui/material";
import { FieldLabel, SectionTitle } from "./SettingsShared";
import { fieldSx, COMPANY_SIZES, EXPERIENCE_LEVELS } from "./settingsConstants";

interface Props {
  profile: any;
  isEditing: boolean;
  fieldErrors: any;
  onInputChange: (key: string, value: string) => void;
}

const CompanyInfoTab: React.FC<Props> = ({ profile, isEditing, fieldErrors, onInputChange }) => (
  <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
    <SectionTitle title="Company Information" subtitle="Your company's basic profile details" />
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 3 }}>

      <Box sx={{ gridColumn: "1 / -1" }}>
        <FieldLabel text="Company Name" />
        <TextField
          value={profile.name || profile.companyName || ""}
          onChange={(e) => { onInputChange("name", e.target.value); onInputChange("companyName", e.target.value); }}
          disabled={!isEditing} fullWidth required placeholder="Your company name"
          error={!!fieldErrors.name || !!fieldErrors.companyName}
          helperText={fieldErrors.name || fieldErrors.companyName || ""}
          sx={fieldSx}
        />
      </Box>

      <Box sx={{ gridColumn: "1 / -1" }}>
        <FieldLabel text="Company Email" />
        <TextField value={profile.email} disabled fullWidth helperText="Email cannot be changed" sx={fieldSx} />
      </Box>

      <Box>
        <FieldLabel text="Industry" />
        <TextField
          value={profile.industry || ""}
          onChange={(e) => onInputChange("industry", e.target.value)}
          disabled={!isEditing} fullWidth placeholder="e.g. Technology, Finance..."
          error={!!fieldErrors.industry} helperText={fieldErrors.industry || ""}
          sx={fieldSx}
        />
      </Box>

      <Box>
        <FieldLabel text="Company Size" />
        <TextField select value={profile.size || profile.companySize || ""}
          onChange={(e) => { onInputChange("size", e.target.value); onInputChange("companySize", e.target.value); }}
          disabled={!isEditing} fullWidth
          error={!!fieldErrors.size} helperText={fieldErrors.size || ""}
          sx={fieldSx}
        >
          {COMPANY_SIZES.map((s) => <MenuItem key={s} value={s}>{s} employees</MenuItem>)}
        </TextField>
      </Box>

      <Box sx={{ gridColumn: "1 / -1" }}>
        <FieldLabel text="Required Experience Level" />
        <TextField select value={profile.requiredExperienceLevel || "Mid Level"}
          onChange={(e) => onInputChange("requiredExperienceLevel", e.target.value)}
          disabled={!isEditing} fullWidth sx={fieldSx}
        >
          {EXPERIENCE_LEVELS.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
        </TextField>
      </Box>

    </Box>
  </Box>
);

export default CompanyInfoTab;
