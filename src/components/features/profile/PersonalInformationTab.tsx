import React from 'react';
import {
  Box, TextField, Button, MenuItem, Select, FormControl,
  InputLabel, CircularProgress, Alert, Divider, Typography, SelectChangeEvent,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { UserProfile } from '@/types/profile';
import { experienceLevels, countries, languages, timezones } from '@/constants/profile';
import ProfilePictureSection from './ProfilePictureSection';
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

interface PersonalInformationTabProps {
  profile: UserProfile;
  isEditing: boolean;
  loading: boolean;
  saveSuccess: boolean;
  error: string | null;
  uploadingImage: boolean;
  fieldErrors?: Record<string, string>;
  onInputChange: (field: keyof UserProfile, value: string) => void;
  onSelectChange: (event: SelectChangeEvent<string>, field: keyof UserProfile) => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  onCancel: () => void;
  onEditToggle: () => void;
}

const PersonalInformationTab: React.FC<PersonalInformationTabProps> = ({
  profile, isEditing, loading, saveSuccess, error, uploadingImage, fieldErrors = {},
  onInputChange, onSelectChange, onImageUpload, onSave, onCancel, onEditToggle,
}) => {
  const { t } = useTranslation('dashboard');
  const s = (k: string) => t(`candidate_settings.personal.${k}`);
  const isLoading = loading && !profile.firstName && !profile.username;

  return (
    <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      {/* Header */}
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
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: T }} size={28} />
          </Box>
        ) : (
          <>
            {saveSuccess && <Alert severity="success" sx={{ mb: 2, borderRadius: "10px", fontSize: "0.8rem" }}>{s('save_success')}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: "10px", fontSize: "0.8rem" }}>{error}</Alert>}

            <ProfilePictureSection
              profile={profile}
              uploadingImage={uploadingImage}
              isEditing={isEditing}
              onImageUpload={onImageUpload}
              onEditClick={onEditToggle}
            />

            <Divider sx={{ my: 2.5 }} />

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <TextField label={s('username')} value={profile.username || ""} disabled fullWidth sx={fieldSx} />
              <TextField label={s('email')}    value={profile.email    || ""} disabled fullWidth sx={fieldSx} />
              <TextField label={s('first_name')} value={profile.firstName || ""} onChange={e => onInputChange("firstName", e.target.value)} disabled={!isEditing} fullWidth sx={fieldSx} />
              <TextField label={s('last_name')}  value={profile.lastName  || ""} onChange={e => onInputChange("lastName",  e.target.value)} disabled={!isEditing} fullWidth sx={fieldSx} />

              <FormControl fullWidth disabled={!isEditing} sx={fieldSx}>
                <InputLabel>{s('gender')}</InputLabel>
                <Select value={profile.gender || ""} onChange={e => onSelectChange(e, "gender")} label={s('gender')}>
                  <MenuItem value="Male">{s('gender_male')}</MenuItem>
                  <MenuItem value="Female">{s('gender_female')}</MenuItem>
                  <MenuItem value="Prefer not to say">{s('gender_other')}</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth disabled={!isEditing} sx={fieldSx}>
                <InputLabel>{s('country')}</InputLabel>
                <Select value={profile.country || ""} onChange={e => onSelectChange(e, "country")} label={s('country')}>
                  {countries.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl fullWidth disabled={!isEditing} sx={fieldSx}>
                <InputLabel>{s('language')}</InputLabel>
                <Select value={profile.language || ""} onChange={e => onSelectChange(e, "language")} label={s('language')}>
                  {languages.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl fullWidth disabled={!isEditing} sx={fieldSx}>
                <InputLabel>{s('timezone')}</InputLabel>
                <Select value={profile.timezone || ""} onChange={e => onSelectChange(e, "timezone")} label={s('timezone')}>
                  {timezones.map(tz => <MenuItem key={tz} value={tz}>{tz}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl fullWidth disabled={!isEditing} sx={fieldSx}>
                <InputLabel>{s('experience_level')}</InputLabel>
                <Select value={profile.requiredExperienceLevel || ""} onChange={e => onSelectChange(e, "requiredExperienceLevel")} label={s('experience_level')}>
                  {experienceLevels.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                </Select>
              </FormControl>

              <TextField label={s('target_role')} value={profile.targetRole || ""} onChange={e => onInputChange("targetRole", e.target.value)} disabled={!isEditing} fullWidth placeholder={s('target_role_placeholder')} sx={fieldSx} />
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default React.memo(PersonalInformationTab);
