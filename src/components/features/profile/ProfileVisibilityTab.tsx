import React, { useState, useCallback, useEffect } from 'react';
import {
  Box, Typography, Switch, Button, Alert, CircularProgress,
  Divider, IconButton, Tooltip,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ContentCopy as ContentCopyIcon,
  OpenInNew as OpenInNewIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from 'react-i18next';

const T    = "#0D9488";
const TBG  = "#F0FDFA";
const TBRD = "#99F6E4";
const NAVY = "#0D1B2A";

interface ProfileVisibilityTabProps {
  userId: string;
  isPublicProfile: boolean;
  onToggleVisibility: (isPublic: boolean) => Promise<void>;
  hasMembership?: boolean;
}

const ProfileVisibilityTab: React.FC<ProfileVisibilityTabProps> = ({
  userId, isPublicProfile, onToggleVisibility, hasMembership = false,
}) => {
  const { showToast } = useToast();
  const { t } = useTranslation('dashboard');
  const s = (k: string) => t(`candidate_settings.visibility.${k}`);

  const [isPublic, setIsPublic] = useState(isPublicProfile);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [success,  setSuccess]  = useState<string | null>(null);
  const [copied,   setCopied]   = useState(false);

  useEffect(() => {
    setIsPublic(hasMembership ? false : isPublicProfile);
  }, [isPublicProfile, hasMembership]);

  const publicProfileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/profile/candidate/${userId}`
    : '';

  const handleToggleVisibility = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const newVisibility = !isPublic;
      await onToggleVisibility(newVisibility);
      setIsPublic(newVisibility);
      const msg = newVisibility ? s('success_public') : s('success_private');
      setSuccess(msg);
      showToast({ message: msg, severity: 'success' });
    } catch (err: any) {
      const msg = err.message || 'Failed to update profile visibility';
      setError(msg);
      showToast({ message: msg, severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [isPublic, onToggleVisibility, showToast]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(publicProfileUrl);
    setCopied(true);
    showToast({ message: s('copied_toast'), severity: 'success' });
    setTimeout(() => setCopied(false), 2000);
  }, [publicProfileUrl, showToast]);

  const handleViewProfile = useCallback(() => {
    window.open(publicProfileUrl, '_blank');
  }, [publicProfileUrl]);

  const privacyItems = [
    s('privacy_item_1'),
    s('privacy_item_2'),
    s('privacy_item_3'),
    s('privacy_item_4'),
  ];

  return (
    <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      {/* Header */}
      <Box sx={{ px: 2.5, py: 2, borderBottom: "1px solid #F1F5F9" }}>
        <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: NAVY }}>{s('title')}</Typography>
        <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8", mt: 0.25 }}>{s('subtitle')}</Typography>
      </Box>

      <Box sx={{ p: 2.5 }}>
        {hasMembership && (
          <Alert severity="info" sx={{ mb: 2.5, borderRadius: "10px", fontSize: "0.8rem", bgcolor: TBG, border: `1px solid ${TBRD}`, "& .MuiAlert-icon": { color: T } }}>
            <Typography sx={{ fontWeight: 600, fontSize: "0.82rem", color: NAVY }}>{s('membership_title')}</Typography>
            <Typography sx={{ fontSize: "0.78rem", color: "#6B7280", mt: 0.25 }}>{s('membership_subtitle')}</Typography>
          </Alert>
        )}

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2, borderRadius: "10px", fontSize: "0.8rem" }}>{error}</Alert>
        )}
        {success && (
          <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2, borderRadius: "10px", fontSize: "0.8rem" }}>{success}</Alert>
        )}

        {/* Toggle card */}
        <Box sx={{
          p: 2, mb: 2.5, borderRadius: "12px",
          border: `1px solid ${isPublic ? TBRD : "#E5E7EB"}`,
          bgcolor: isPublic ? TBG : "#F9FAFB",
          display: "flex", alignItems: "center", gap: 2,
        }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: "12px", flexShrink: 0,
            bgcolor: isPublic ? T : "#94A3B8",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {isPublic
              ? <VisibilityIcon    sx={{ fontSize: 22, color: "#fff" }} />
              : <VisibilityOffIcon sx={{ fontSize: 22, color: "#fff" }} />
            }
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", color: NAVY }}>
              {isPublic ? s('status_public') : s('status_private')}
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "#6B7280", mt: 0.25 }}>
              {isPublic ? s('desc_public') : s('desc_private')}
            </Typography>
            {loading && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.75 }}>
                <CircularProgress size={12} sx={{ color: T }} />
                <Typography sx={{ fontSize: "0.72rem", color: "#6B7280" }}>{s('updating')}</Typography>
              </Box>
            )}
          </Box>
          <Switch
            checked={isPublic}
            onChange={handleToggleVisibility}
            disabled={loading || hasMembership}
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": { color: T, "&:hover": { bgcolor: `${T}14` } },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: T },
            }}
          />
        </Box>

        <Divider sx={{ mb: 2.5 }} />

        {/* URL section */}
        <Box sx={{ mb: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1.25 }}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", color: NAVY }}>{s('url_title')}</Typography>
            <Tooltip title={s('url_tooltip')}>
              <IconButton size="small">
                <InfoIcon sx={{ fontSize: 15, color: "#CBD5E1" }} />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ p: 1.5, borderRadius: "10px", bgcolor: "#F9FAFB", border: "1px solid #E5E7EB", mb: 1.5 }}>
            <Typography sx={{ fontSize: "0.78rem", fontFamily: "monospace", color: isPublic ? NAVY : "#CBD5E1", wordBreak: "break-all" }}>
              {publicProfileUrl}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button size="small" variant="outlined" startIcon={<ContentCopyIcon sx={{ fontSize: "14px !important" }} />}
              onClick={handleCopyLink} disabled={!isPublic}
              sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.75rem", borderRadius: "8px", px: 1.5, borderColor: "#E5E7EB", color: "#6B7280", "&:hover": { borderColor: T, bgcolor: TBG, color: T }, "&.Mui-disabled": { borderColor: "#F1F5F9", color: "#CBD5E1" } }}>
              {copied ? s('copied') : s('copy_link')}
            </Button>
            <Button size="small" variant="contained" startIcon={<OpenInNewIcon sx={{ fontSize: "14px !important" }} />}
              onClick={handleViewProfile} disabled={!isPublic}
              sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.75rem", borderRadius: "8px", px: 1.5, bgcolor: T, color: "#fff", "&:hover": { bgcolor: "#0F766E" }, "&.Mui-disabled": { bgcolor: "#F1F5F9", color: "#CBD5E1" } }}>
              {s('view_profile')}
            </Button>
          </Box>
        </Box>

        <Divider sx={{ mb: 2.5 }} />

        {/* Privacy info */}
        <Box sx={{ p: 2, borderRadius: "12px", bgcolor: "#FFFBEB", border: "1px solid #FEF3C7" }}>
          <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", color: "#92400E", mb: 0.75 }}>{s('privacy_title')}</Typography>
          <Typography sx={{ fontSize: "0.78rem", color: "#78350F", mb: 1, lineHeight: 1.6 }}>
            {s('privacy_intro')}
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5, color: "#78350F" }}>
            {privacyItems.map(item => (
              <li key={item}>
                <Typography sx={{ fontSize: "0.78rem", mb: 0.4 }}>{item}</Typography>
              </li>
            ))}
          </Box>
          <Typography sx={{ fontSize: "0.78rem", color: "#78350F", mt: 1, fontWeight: 600 }}>
            {s('privacy_footer')}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default React.memo(ProfileVisibilityTab);
