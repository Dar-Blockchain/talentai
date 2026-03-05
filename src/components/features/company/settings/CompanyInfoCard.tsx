import React from "react";
import { Box, TextField, MenuItem } from "@mui/material";
import { SectionCard, SectionHeader } from "@/components/ui/ui";
import EditActions from "./EditActions";
import { UserProfile } from "@/types/profile";

const TEAL = "#0D9488";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    "&.Mui-focused fieldset": { borderColor: TEAL },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: TEAL },
};

const COMPANY_SIZES  = ["1-10", "11-50", "51-200", "201-500", "500+"];
const EXPERIENCE_LEVELS = ["Entry Level", "Mid Level", "Senior Level", "Lead", "Executive"];

interface CompanyInfoCardProps {
  profile: UserProfile;
  isEditing: boolean;
  loading: boolean;
  fieldErrors: Record<string, string>;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onInputChange: (field: keyof UserProfile, value: string) => void;
}

const CompanyInfoCard: React.FC<CompanyInfoCardProps> = ({
  profile,
  isEditing,
  loading,
  fieldErrors,
  onEdit,
  onCancel,
  onSave,
  onInputChange,
}) => (
  <SectionCard>
    <SectionHeader
      title="Company Information"
      subtitle="Basic company details and profile settings"
      action={
        <EditActions
          isEditing={isEditing}
          loading={loading}
          onEdit={onEdit}
          onCancel={onCancel}
          onSave={onSave}
        />
      }
    />

    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
      <TextField
        label="Company Name"
        value={profile.name || profile.companyName || ""}
        onChange={(e) => {
          onInputChange("name", e.target.value);
          onInputChange("companyName", e.target.value);
        }}
        disabled={!isEditing}
        fullWidth
        required
        error={!!fieldErrors.name || !!fieldErrors.companyName}
        helperText={fieldErrors.name || fieldErrors.companyName || ""}
        sx={{ gridColumn: "1 / -1", ...fieldSx }}
      />

      <TextField
        label="Company Email"
        value={profile.email}
        disabled
        fullWidth
        helperText="Email cannot be changed"
        sx={{ gridColumn: "1 / -1", ...fieldSx }}
      />

      <TextField
        label="Industry"
        value={profile.industry || ""}
        onChange={(e) => onInputChange("industry", e.target.value)}
        disabled={!isEditing}
        fullWidth
        placeholder="e.g. Technology, Finance…"
        error={!!fieldErrors.industry}
        helperText={fieldErrors.industry || ""}
        sx={fieldSx}
      />

      <TextField
        select
        label="Company Size"
        value={profile.size || profile.companySize || ""}
        onChange={(e) => {
          onInputChange("size", e.target.value);
          onInputChange("companySize", e.target.value);
        }}
        disabled={!isEditing}
        fullWidth
        error={!!fieldErrors.size}
        helperText={fieldErrors.size || ""}
        sx={fieldSx}
      >
        {COMPANY_SIZES.map((s) => (
          <MenuItem key={s} value={s}>{s} employees</MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Required Experience Level"
        value={profile.requiredExperienceLevel || "Mid Level"}
        onChange={(e) => onInputChange("requiredExperienceLevel", e.target.value)}
        disabled={!isEditing}
        fullWidth
        sx={{ gridColumn: "1 / -1", ...fieldSx }}
      >
        {EXPERIENCE_LEVELS.map((l) => (
          <MenuItem key={l} value={l}>{l}</MenuItem>
        ))}
      </TextField>
    </Box>
  </SectionCard>
);

export default CompanyInfoCard;
