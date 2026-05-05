import React from 'react';
import { Box, TextField, Button, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { UserProfile } from '@/types/profile';
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
  const { t } = useTranslation('dashboard');
  const s = (k: string) => t(`candidate_settings.contact.${k}`);

  return (
    <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <Box sx={{ px: 2.5, py: 2, borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: NAVY }}>{s('title')}</Typography>
          <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8", mt: 0.25 }}>{s('subtitle')}</Typography>
        </Box>
        {!isEditing ? (
          <Button size="small" startIcon={<EditOutlined sx={{ fontSize: "14px !important" }} />} onClick={onEditToggle}
            sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.75rem", color: T, bgcolor: TBG, border: `1px solid ${TBRD}`, borderRadius: "8px", px: 1.5, "&:hover": { bgcolor: "#CCFBF1" } }}>
            {s('edit')}
          </Button>
        ) : (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button size="small" startIcon={<CloseOutlined sx={{ fontSize: "14px !important" }} />} onClick={onCancel}
              sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.75rem", color: "#6B7280", bgcolor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "8px", px: 1.5 }}>
              {s('cancel')}
            </Button>
            <Button size="small" startIcon={loading ? undefined : <SaveOutlined sx={{ fontSize: "14px !important" }} />} onClick={onSave} disabled={loading}
              sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.75rem", color: "#fff", bgcolor: T, borderRadius: "8px", px: 1.5, "&:hover": { bgcolor: "#0F766E" } }}>
              {loading ? <CircularProgress size={14} color="inherit" /> : s('save')}
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
            <TextField label={s('email')} value={profile.email || ""} disabled fullWidth helperText={s('email_helper')}
              sx={{ gridColumn: { xs: "1 / -1", sm: "span 2" }, ...fieldSx }} />

            <TextField label={s('phone')} value={profile.phone || ""} onChange={e => onInputChange("phone", e.target.value)}
              disabled={!isEditing} fullWidth placeholder={s('phone_placeholder')}
              error={!!fieldErrors.phone} helperText={fieldErrors.phone || ""} sx={fieldSx} />

            <TextField label={s('location')} value={profile.location || ""} onChange={e => onInputChange("location", e.target.value)}
              disabled={!isEditing} fullWidth placeholder={s('location_placeholder')} sx={fieldSx} />

            <TextField label={s('address')} value={profile.address || ""} onChange={e => onInputChange("address", e.target.value)}
              disabled={!isEditing} fullWidth multiline rows={2} placeholder={s('address_placeholder')}
              sx={{ gridColumn: { xs: "1 / -1", sm: "span 2" }, ...fieldSx }} />

            <TextField label={s('linkedin')} value={profile.linkedinUrl || ""} onChange={e => onInputChange("linkedinUrl", e.target.value)}
              disabled={!isEditing} fullWidth placeholder={s('linkedin_placeholder')}
              error={!!fieldErrors.linkedinUrl} helperText={fieldErrors.linkedinUrl || ""}
              sx={{ gridColumn: { xs: "1 / -1", sm: "span 2" }, ...fieldSx }} />

            <TextField label={s('github')} value={profile.githubUrl || ""} onChange={e => onInputChange("githubUrl", e.target.value)}
              disabled={!isEditing} fullWidth placeholder={s('github_placeholder')}
              error={!!fieldErrors.githubUrl} helperText={fieldErrors.githubUrl || ""}
              sx={{ gridColumn: { xs: "1 / -1", sm: "span 2" }, ...fieldSx }} />

            <TextField label={s('website')} value={profile.personalWebsite || ""} onChange={e => onInputChange("personalWebsite", e.target.value)}
              disabled={!isEditing} fullWidth placeholder={s('website_placeholder')}
              error={!!fieldErrors.personalWebsite} helperText={fieldErrors.personalWebsite || ""}
              sx={{ gridColumn: { xs: "1 / -1", sm: "span 2" }, ...fieldSx }} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default React.memo(ContactInformationTab);
