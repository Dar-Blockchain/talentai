import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  Button,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ContentCopy as ContentCopyIcon,
  OpenInNew as OpenInNewIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

interface ProfileVisibilityTabProps {
  userId: string;
  isPublicProfile: boolean;
  onToggleVisibility: (isPublic: boolean) => Promise<void>;
}

const ProfileVisibilityTab: React.FC<ProfileVisibilityTabProps> = ({
  userId,
  isPublicProfile,
  onToggleVisibility,
}) => {
  const [isPublic, setIsPublic] = useState(isPublicProfile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Update local state when prop changes
  useEffect(() => {
    setIsPublic(isPublicProfile);
  }, [isPublicProfile]);

  // Generate public profile URL
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

      const successMessage = newVisibility
        ? 'Your profile is now public and can be viewed by anyone with the link'
        : 'Your profile is now private and hidden from public view';

      setSuccess(successMessage);
      toast.success(successMessage);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update profile visibility';
      setError(errorMessage);
      console.error('Error updating visibility:', err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isPublic, onToggleVisibility]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(publicProfileUrl);
    setCopied(true);
    toast.success('Profile link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  }, [publicProfileUrl]);

  const handleViewProfile = useCallback(() => {
    window.open(publicProfileUrl, '_blank');
  }, [publicProfileUrl]);

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', mb: 3 }}>
      <CardContent sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 0.5 }}>
            Public Profile Visibility
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Control who can view your profile information
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 3, borderRadius: 2 }}>
            {success}
          </Alert>
        )}

        {/* Main Visibility Toggle */}
        <Card
          sx={{
            mb: 3,
            borderRadius: 2,
            border: '1px solid #e5e7eb',
            boxShadow: 'none',
            background: isPublic
              ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
              : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    background: isPublic
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isPublic ? (
                    <VisibilityIcon sx={{ fontSize: 28, color: 'white' }} />
                  ) : (
                    <VisibilityOffIcon sx={{ fontSize: 28, color: 'white' }} />
                  )}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 0.5 }}>
                    {isPublic ? 'Profile is Public' : 'Profile is Private'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.9rem' }}>
                    {isPublic
                      ? 'Anyone with the link can view your profile information'
                      : 'Your profile is hidden and cannot be viewed publicly'}
                  </Typography>
                </Box>
              </Box>
              <Switch
                checked={isPublic}
                onChange={handleToggleVisibility}
                disabled={loading}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#10b981',
                    '&:hover': {
                      backgroundColor: 'rgba(16, 185, 129, 0.08)',
                    },
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#10b981',
                  },
                }}
              />
            </Box>

            {loading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <CircularProgress size={16} sx={{ color: '#8310FF' }} />
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Updating visibility...
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        <Divider sx={{ my: 3 }} />

        {/* Public Profile URL Section */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
              Public Profile URL
            </Typography>
            <Tooltip title="Share this link to allow others to view your public profile">
              <IconButton size="small">
                <InfoIcon sx={{ fontSize: 18, color: '#64748b' }} />
              </IconButton>
            </Tooltip>
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: '#f8fafc',
              border: '1px solid #e5e7eb',
              mb: 2,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: isPublic ? '#1a1a1a' : '#94a3b8',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                fontSize: '0.9rem',
              }}
            >
              {publicProfileUrl}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ContentCopyIcon />}
              onClick={handleCopyLink}
              disabled={!isPublic}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                borderColor: '#e5e7eb',
                color: '#64748b',
                '&:hover': {
                  borderColor: '#8310FF',
                  backgroundColor: 'rgba(131, 16, 255, 0.04)',
                  color: '#8310FF',
                },
                '&.Mui-disabled': {
                  borderColor: '#e5e7eb',
                  color: '#cbd5e1',
                },
              }}
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
            <Button
              variant="contained"
              startIcon={<OpenInNewIcon />}
              onClick={handleViewProfile}
              disabled={!isPublic}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                color: 'white',
                px: 3,
                background: '#8310FF',
                boxShadow: '0 4px 12px rgba(131, 16, 255, 0.3)',
                '&:hover': {
                  background: '#8310FF',
                  boxShadow: '0 6px 16px rgba(131, 16, 255, 0.4)',
                },
                '&.Mui-disabled': {
                  background: '#e2e8f0',
                  color: '#94a3b8',
                },
              }}
            >
              View Public Profile
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Information Section */}
        <Box
          sx={{
            p: 3,
            borderRadius: 2,
            backgroundColor: '#fffbeb',
            border: '1px solid #fef3c7',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#92400e', mb: 1 }}>
            Privacy Information
          </Typography>
          <Typography variant="body2" sx={{ color: '#78350f', mb: 2, lineHeight: 1.6 }}>
            When your profile is public, the following information will be visible to anyone with the link:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 3, color: '#78350f' }}>
            <li>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                Profile picture and basic information (name, title, location)
              </Typography>
            </li>
            <li>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                Skills and experience level
              </Typography>
            </li>
            <li>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                Work preferences and education
              </Typography>
            </li>
            <li>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                Public contact information (if provided)
              </Typography>
            </li>
          </Box>
          <Typography variant="body2" sx={{ color: '#78350f', mt: 2, fontWeight: 500 }}>
            Your email address and other sensitive information will never be publicly visible.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default React.memo(ProfileVisibilityTab);
