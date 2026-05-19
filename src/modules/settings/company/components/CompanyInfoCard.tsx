import React from "react";
import { Box, TextField, MenuItem } from "@mui/material";
import { EditActions } from "@/modules/settings/shared/components";
import { fieldSx, COMPANY_SIZES } from "@/modules/settings/shared/constants";
import { UserProfile } from "@/types/profile";
import SectionCard from "@/components/ui/SectionCard";
import SectionHeader from "@/components/ui/SectionHeader";
import AppInput from "@/modules/shared/ui/AppInput";

interface CompanyInfoCardProps {
  profile: UserProfile;
  isEditing: boolean;
  loading: boolean;
  fieldErrors: Record<string, string>;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onInputChange: (field: keyof UserProfile, value: string) => void;
  readOnly?: boolean;
}

const CompanyInfoCard: React.FC<CompanyInfoCardProps> = ({ profile, isEditing, loading, fieldErrors, onEdit, onCancel, onSave, onInputChange, readOnly = false }) => (
  <SectionCard>
    <SectionHeader
      title="Company Information"
      subtitle="Basic company details and profile settings"
      action={!readOnly ? <EditActions isEditing={isEditing} loading={loading} onEdit={onEdit} onCancel={onCancel} onSave={onSave} /> : undefined}
    />
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
      <AppInput
        label="ali shanti"
        value={profile.name || profile.companyName || ""}
        onChange={(e) => { onInputChange("name", e.target.value); onInputChange("companyName", e.target.value); }}
        disabled={!isEditing}
        required
        error={fieldErrors.name || fieldErrors.companyName || ""}
        sx={{ gridColumn: "1 / -1" }}
      />
      <TextField label="Company Email" value={profile.email} disabled fullWidth
        helperText="Email cannot be changed" sx={{ gridColumn: "1 / -1", ...fieldSx }} />
      <TextField label="Industry" value={profile.industry || ""}
        onChange={(e) => onInputChange("industry", e.target.value)}
        disabled={!isEditing} fullWidth placeholder="e.g. Technology, Finance…"
        error={!!fieldErrors.industry} helperText={fieldErrors.industry || ""} sx={fieldSx} />
      <TextField select label="Company Size" value={profile.size || profile.companySize || ""}
        onChange={(e) => { onInputChange("size", e.target.value); onInputChange("companySize", e.target.value); }}
        disabled={!isEditing} fullWidth
        error={!!fieldErrors.size} helperText={fieldErrors.size || ""} sx={fieldSx}
      >
        {COMPANY_SIZES.map((s) => <MenuItem key={s} value={s}>{s} employees</MenuItem>)}
      </TextField>
    </Box>
  </SectionCard>
);

export default CompanyInfoCard;
