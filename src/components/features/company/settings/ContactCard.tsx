import React, { useMemo } from "react";
import { Box, TextField, MenuItem, Autocomplete } from "@mui/material";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import LanguageIcon from "@mui/icons-material/Language";
import { SectionCard, SectionHeader } from "@/components/ui/ui";
import EditActions from "./EditActions";
import { getAllCountryNames } from "@/utils/countryMappings";
import { UserProfile } from "@/types/profile";

const TEAL = "#0D9488";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    "&.Mui-focused fieldset": { borderColor: TEAL },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: TEAL },
};

const EMPLOYMENT_TYPES = ["Remote", "On-site", "Hybrid"];
const COMPANY_SIZES    = ["1-10", "11-50", "51-200", "201-500", "500+"];

interface ContactCardProps {
  profile: UserProfile;
  isEditing: boolean;
  loading: boolean;
  fieldErrors: Record<string, string>;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onInputChange: (field: keyof UserProfile, value: string) => void;
}

const ContactCard: React.FC<ContactCardProps> = ({
  profile,
  isEditing,
  loading,
  fieldErrors,
  onEdit,
  onCancel,
  onSave,
  onInputChange,
}) => {
  const countries = useMemo(() => getAllCountryNames(), []);

  return (
    <SectionCard>
      <SectionHeader
        title="Contact & Presence"
        subtitle="Location, social links, and company details"
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

        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, gridColumn: "1 / -1" }}>
          <LocationOnOutlined sx={{ fontSize: 20, color: TEAL, mt: 2 }} />
          <Autocomplete
            options={countries}
            value={profile.location || null}
            onChange={(_, v) => onInputChange("location", v || "")}
            disabled={!isEditing}
            fullWidth
            renderInput={(params) => (
              <TextField {...params} label="Country / Location" placeholder="Select country" sx={fieldSx} />
            )}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
          <WorkOutlined sx={{ fontSize: 20, color: TEAL, mt: 2 }} />
          <TextField
            select
            label="Employment Type"
            value={profile.employmentType || "Remote"}
            onChange={(e) => onInputChange("employmentType", e.target.value)}
            disabled={!isEditing}
            fullWidth
            sx={fieldSx}
            error={!!fieldErrors.employmentType}
            helperText={fieldErrors.employmentType || ""}
          >
            {EMPLOYMENT_TYPES.map((v) => (
              <MenuItem key={v} value={v}>{v}</MenuItem>
            ))}
          </TextField>
        </Box>

        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
          <GroupsOutlined sx={{ fontSize: 20, color: TEAL, mt: 2 }} />
          <TextField
            select
            label="Company Size"
            value={profile.size || ""}
            onChange={(e) => onInputChange("size", e.target.value)}
            disabled={!isEditing}
            fullWidth
            sx={fieldSx}
            error={!!fieldErrors.size}
            helperText={fieldErrors.size || ""}
          >
            {COMPANY_SIZES.map((s) => (
              <MenuItem key={s} value={s}>{s} employees</MenuItem>
            ))}
          </TextField>
        </Box>

        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, gridColumn: "1 / -1" }}>
          <LinkedInIcon sx={{ fontSize: 20, color: "#0A66C2", mt: 2 }} />
          <TextField
            label="LinkedIn URL"
            value={profile.linkedin || ""}
            onChange={(e) => onInputChange("linkedin", e.target.value)}
            disabled={!isEditing}
            fullWidth
            type="url"
            placeholder="https://linkedin.com/company/yourcompany"
            sx={fieldSx}
            error={!!fieldErrors.linkedin}
            helperText={fieldErrors.linkedin || ""}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, gridColumn: "1 / -1" }}>
          <LanguageIcon sx={{ fontSize: 20, color: TEAL, mt: 2 }} />
          <TextField
            label="Company Website"
            value={profile.website || ""}
            onChange={(e) => onInputChange("website", e.target.value)}
            disabled={!isEditing}
            fullWidth
            type="url"
            placeholder="https://yourcompany.com"
            sx={fieldSx}
            error={!!fieldErrors.website}
            helperText={fieldErrors.website || ""}
          />
        </Box>

      </Box>
    </SectionCard>
  );
};

export default ContactCard;
