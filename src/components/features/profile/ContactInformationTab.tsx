import React, { useMemo } from 'react';
import {
  Box, TextField, Button, CircularProgress, Divider,
  Typography, MenuItem, Autocomplete,
} from '@mui/material';
import { UserProfile } from '@/types/profile';
import { getAllCountryNames } from '@/utils/countryMappings';
import EditOutlined from '@mui/icons-material/EditOutlined';
import SaveOutlined from '@mui/icons-material/SaveOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';

const T    = "#0D9488";
const TBG  = "#F0FDFA";
const TBRD = "#99F6E4";
const NAVY = "#0D1B2A";

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: "10px",
    fontSize: "0.85rem",
    '&.Mui-focused fieldset': { borderColor: T },
    '&:hover fieldset': { borderColor: T },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: T },
  '& .MuiInputLabel-root': { fontSize: "0.85rem" },
};

interface ContactInformationTabProps {
  profile: UserProfile;
  isEditing: boolean;
  loading: boolean;
  fieldErrors?: Record<string, string>;
  onInputChange: (field: keyof UserProfile, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onEditToggle: () => void;
}

const ContactInformationTab: React.FC<ContactInformationTabProps> = ({
  profile, isEditing, loading, fieldErrors = {},
  onInputChange, onSave, onCancel, onEditToggle,
}) => {
  const countries = useMemo(() => getAllCountryNames(), []);

  return (
    <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      {/* Header */}
      <Box sx={{ px: 2.5, py: 2, borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: NAVY }}>Contact Information</Typography>
          <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8", mt: 0.25 }}>Manage your contact details and social profiles</Typography>
        </Box>
        {!isEditing ? (
          <Button size="small" startIcon={<EditOutlined sx={{ fontSize: "14px !important" }} />} onClick={onEditToggle}
            sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.75rem", color: T, bgcolor: TBG, border: `1px solid ${TBRD}`, borderRadius: "8px", px: 1.5, "&:hover": { bgcolor: "#CCFBF1" } }}>
            Edit
          </Button>
        ) : (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button size="small" startIcon={<CloseOutlined sx={{ fontSize: "14px !important" }} />} onClick={onCancel}
              sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.75rem", color: "#6B7280", bgcolor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "8px", px: 1.5 }}>
              Cancel
            </Button>
            <Button size="small" startIcon={loading ? undefined : <SaveOutlined sx={{ fontSize: "14px !important" }} />} onClick={onSave} disabled={loading}
              sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.75rem", color: "#fff", bgcolor: T, borderRadius: "8px", px: 1.5, "&:hover": { bgcolor: "#0F766E" } }}>
              {loading ? <CircularProgress size={14} color="inherit" /> : "Save"}
            </Button>
          </Box>
        )}
      </Box>

      <Box sx={{ p: 2.5 }}>
        {loading && !profile.username ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: T }} size={28} />
          </Box>
        ) : (
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <TextField label="Email" value={profile.email || ""} disabled fullWidth helperText="Email cannot be changed"
              sx={{ gridColumn: { xs: "1 / -1", sm: "span 2" }, ...fieldSx }} />

            <TextField label="Phone Number" value={profile.phone || ""} onChange={e => onInputChange("phone", e.target.value)}
              disabled={!isEditing} fullWidth placeholder="+33612345678"
              error={!!fieldErrors.phone} helperText={fieldErrors.phone || ""} sx={fieldSx} />

            <TextField label="Location" value={profile.location || ""} onChange={e => onInputChange("location", e.target.value)}
              disabled={!isEditing} fullWidth placeholder="Paris, France" sx={fieldSx} />

            <TextField label="Address" value={profile.address || ""} onChange={e => onInputChange("address", e.target.value)}
              disabled={!isEditing} fullWidth multiline rows={2} placeholder="123 Rue de Paris"
              sx={{ gridColumn: { xs: "1 / -1", sm: "span 2" }, ...fieldSx }} />

            <TextField label="LinkedIn URL" value={profile.linkedinUrl || ""} onChange={e => onInputChange("linkedinUrl", e.target.value)}
              disabled={!isEditing} fullWidth placeholder="https://linkedin.com/in/yourprofile"
              error={!!fieldErrors.linkedinUrl} helperText={fieldErrors.linkedinUrl || ""}
              sx={{ gridColumn: { xs: "1 / -1", sm: "span 2" }, ...fieldSx }} />

            <TextField label="GitHub URL" value={profile.githubUrl || ""} onChange={e => onInputChange("githubUrl", e.target.value)}
              disabled={!isEditing} fullWidth placeholder="https://github.com/yourprofile"
              error={!!fieldErrors.githubUrl} helperText={fieldErrors.githubUrl || ""}
              sx={{ gridColumn: { xs: "1 / -1", sm: "span 2" }, ...fieldSx }} />

            <TextField label="Personal Website" value={profile.personalWebsite || ""} onChange={e => onInputChange("personalWebsite", e.target.value)}
              disabled={!isEditing} fullWidth placeholder="https://yourwebsite.com"
              error={!!fieldErrors.personalWebsite} helperText={fieldErrors.personalWebsite || ""}
              sx={{ gridColumn: { xs: "1 / -1", sm: "span 2" }, ...fieldSx }} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default React.memo(ContactInformationTab);
