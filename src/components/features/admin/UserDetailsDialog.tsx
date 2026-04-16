import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Close as CloseIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Login as LoginIcon,
  Language as LanguageIcon,
  VerifiedUser as VerifiedIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material';
import { User } from '../../../types/admin';

const PRIMARY = '#8310FF';

interface UserDetailsDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onEdit?: (user: User) => void;
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value, mono }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.2 }}>
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: '10px',
        backgroundColor: '#f5f3ff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: '#6c6c80', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
          color: '#1a1a2e',
          ...(mono && { fontFamily: 'monospace', fontSize: '0.8rem' }),
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {value}
      </Typography>
    </Box>
  </Box>
);

const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({ open, user, onClose }) => {
  if (!user) return null;

  const displayName =
    user.profile?.firstName && user.profile?.lastName
      ? `${user.profile.firstName} ${user.profile.lastName}`
      : user.username;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${PRIMARY} 0%, #6a0dad 100%)`,
          px: 3,
          pt: 3,
          pb: 5,
          position: 'relative',
          textAlign: 'center',
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 12, right: 12, color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
        <Avatar
          sx={{
            width: 64,
            height: 64,
            mx: 'auto',
            mb: 1.5,
            bgcolor: 'rgba(255,255,255,0.15)',
            border: '3px solid rgba(255,255,255,0.3)',
            fontSize: '1.5rem',
            fontWeight: 700,
          }}
        >
          {user.username?.charAt(0).toUpperCase() || 'U'}
        </Avatar>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
          {displayName}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.3 }}>
          @{user.username}
        </Typography>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {/* Status chips - overlapping */}
        <Box sx={{ px: 3, mt: -2, display: 'flex', justifyContent: 'center', gap: 1 }}>
          <Chip
            label={user.role}
            size="small"
            sx={{
              backgroundColor: 'white',
              color: PRIMARY,
              fontWeight: 700,
              fontSize: '0.75rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #ece6fa',
            }}
          />
          <Chip
            icon={<VerifiedIcon sx={{ fontSize: '14px !important' }} />}
            label={user.isVerified ? 'Verified' : 'Pending'}
            size="small"
            sx={{
              backgroundColor: 'white',
              color: user.isVerified ? '#10b981' : '#f59e0b',
              fontWeight: 600,
              fontSize: '0.75rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '& .MuiChip-icon': { color: user.isVerified ? '#10b981' : '#f59e0b' },
            }}
          />
        </Box>

        {/* Info List */}
        <Box sx={{ px: 3, pt: 2, pb: 1 }}>
          <InfoRow
            icon={<EmailIcon sx={{ fontSize: 18, color: PRIMARY }} />}
            label="Email"
            value={user.email}
          />
          <InfoRow
            icon={<CalendarIcon sx={{ fontSize: 18, color: PRIMARY }} />}
            label="Joined"
            value={new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          />
          {user.lastLogin && (
            <InfoRow
              icon={<LoginIcon sx={{ fontSize: 18, color: PRIMARY }} />}
              label="Last Login"
              value={new Date(user.lastLogin).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            />
          )}
          {user.Localisation && (
            <InfoRow
              icon={<LanguageIcon sx={{ fontSize: 18, color: PRIMARY }} />}
              label="Location"
              value={user.Localisation}
            />
          )}
          {user.ip && (
            <InfoRow
              icon={<LanguageIcon sx={{ fontSize: 18, color: PRIMARY }} />}
              label="IP Address"
              value={user.ip}
              mono
            />
          )}
        </Box>

        {/* Profile Section */}
        {user.profile && (user.profile.phone || user.profile.location || user.profile.company || user.profile.position) && (
          <Box sx={{ px: 3, pb: 2 }}>
            <Box sx={{ borderTop: '1px solid #ece6fa', pt: 2 }}>
              <Typography variant="overline" sx={{ color: '#6c6c80', letterSpacing: 1.2, fontSize: '0.7rem' }}>
                Profile
              </Typography>
              {user.profile.phone && (
                <InfoRow
                  icon={<PhoneIcon sx={{ fontSize: 18, color: PRIMARY }} />}
                  label="Phone"
                  value={user.profile.phone}
                />
              )}
              {user.profile.location && (
                <InfoRow
                  icon={<LocationIcon sx={{ fontSize: 18, color: PRIMARY }} />}
                  label="Location"
                  value={user.profile.location}
                />
              )}
              {user.profile.company && (
                <InfoRow
                  icon={<BusinessIcon sx={{ fontSize: 18, color: PRIMARY }} />}
                  label="Company"
                  value={user.profile.company}
                />
              )}
              {user.profile.position && (
                <InfoRow
                  icon={<BadgeIcon sx={{ fontSize: 18, color: PRIMARY }} />}
                  label="Position"
                  value={user.profile.position}
                />
              )}
            </Box>
          </Box>
        )}

        {/* Footer */}
        <Box sx={{ px: 3, py: 1.5, backgroundColor: '#fafafa', borderTop: '1px solid #ece6fa' }}>
          <Typography variant="caption" sx={{ color: '#aaa', fontFamily: 'monospace', fontSize: '0.7rem' }}>
            ID: {user._id}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(UserDetailsDialog);
