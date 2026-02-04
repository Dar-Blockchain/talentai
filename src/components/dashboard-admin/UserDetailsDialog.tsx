import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
  Stack,
  Chip,
  Avatar,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { User } from '../../types/admin';

const PRIMARY = '#8310FF';

interface UserDetailsDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onEdit?: (user: User) => void;
}

const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({ open, user, onClose, onEdit }) => {
  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: `linear-gradient(135deg, ${PRIMARY} 0%, #6a0dad 100%)`,
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 40, height: 40 }}>
            {user.username?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {user.profile?.firstName && user.profile?.lastName
                ? `${user.profile.firstName} ${user.profile.lastName}`
                : user.username}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              @{user.username} &middot; {user.email}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Status Bar */}
        <Box
          sx={{
            background: '#f5f3ff',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
            borderBottom: '1px solid #ece6fa',
          }}
        >
          <Chip
            label={user.role}
            size="small"
            sx={{ backgroundColor: '#ece6fa', color: PRIMARY, fontWeight: 600 }}
          />
          <Chip
            label={user.isVerified ? 'Verified' : 'Pending'}
            size="small"
            color={user.isVerified ? 'success' : 'warning'}
          />
          {user.Localisation && (
            <Chip label={user.Localisation} size="small" variant="outlined" />
          )}
        </Box>

        {/* Two Column Layout */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          {/* Basic Information */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' }, borderRight: { md: '1px solid #ece6fa' } }}>
            <Box sx={{ p: 3, borderBottom: '1px solid #ece6fa' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: PRIMARY, mb: 2 }}>
                Account Information
              </Typography>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#6c6c80' }}>Username</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>@{user.username}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#6c6c80' }}>Email</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{user.email}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#6c6c80' }}>Role</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{user.role}</Typography>
                </Box>
                {user.ip && (
                  <Box>
                    <Typography variant="body2" sx={{ color: '#6c6c80' }}>IP Address</Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{user.ip}</Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="body2" sx={{ color: '#6c6c80' }}>Joined</Typography>
                  <Typography variant="body1">{new Date(user.createdAt).toLocaleDateString()}</Typography>
                </Box>
                {user.lastLogin && (
                  <Box>
                    <Typography variant="body2" sx={{ color: '#6c6c80' }}>Last Login</Typography>
                    <Typography variant="body1">{new Date(user.lastLogin).toLocaleDateString()}</Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          </Box>

          {/* Profile Information */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
            <Box sx={{ p: 3, borderBottom: '1px solid #ece6fa' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: PRIMARY, mb: 2 }}>
                Profile
              </Typography>
              {user.profile ? (
                <Stack spacing={1.5}>
                  {user.profile.firstName && (
                    <Box>
                      <Typography variant="body2" sx={{ color: '#6c6c80' }}>First Name</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{user.profile.firstName}</Typography>
                    </Box>
                  )}
                  {user.profile.lastName && (
                    <Box>
                      <Typography variant="body2" sx={{ color: '#6c6c80' }}>Last Name</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{user.profile.lastName}</Typography>
                    </Box>
                  )}
                  {user.profile.phone && (
                    <Box>
                      <Typography variant="body2" sx={{ color: '#6c6c80' }}>Phone</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{user.profile.phone}</Typography>
                    </Box>
                  )}
                  {user.profile.location && (
                    <Box>
                      <Typography variant="body2" sx={{ color: '#6c6c80' }}>Location</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{user.profile.location}</Typography>
                    </Box>
                  )}
                  {user.profile.company && (
                    <Box>
                      <Typography variant="body2" sx={{ color: '#6c6c80' }}>Company</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{user.profile.company}</Typography>
                    </Box>
                  )}
                  {user.profile.position && (
                    <Box>
                      <Typography variant="body2" sx={{ color: '#6c6c80' }}>Position</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{user.profile.position}</Typography>
                    </Box>
                  )}
                  {!user.profile.firstName && !user.profile.lastName && !user.profile.phone && !user.profile.location && !user.profile.company && !user.profile.position && (
                    <Typography variant="body2" sx={{ color: '#ccc', fontStyle: 'italic' }}>
                      No profile details
                    </Typography>
                  )}
                </Stack>
              ) : (
                <Typography variant="body2" sx={{ color: '#ccc', fontStyle: 'italic' }}>
                  No profile data
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* ID Footer */}
        <Box sx={{ p: 2, backgroundColor: '#fafafa', borderTop: '1px solid #ece6fa' }}>
          <Typography variant="caption" sx={{ color: '#6c6c80', fontFamily: 'monospace' }}>
            ID: {user._id}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, backgroundColor: '#fafafa' }}>
        <Button onClick={onClose} variant="outlined" sx={{ textTransform: 'none', borderColor: '#ece6fa', color: '#6c6c80' }}>
          Close
        </Button>
        {onEdit && (
          <Button
            variant="contained"
            onClick={() => onEdit(user)}
            sx={{
              textTransform: 'none',
              backgroundColor: PRIMARY,
              '&:hover': { backgroundColor: '#6a0dad' },
            }}
          >
            Edit User
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(UserDetailsDialog);
