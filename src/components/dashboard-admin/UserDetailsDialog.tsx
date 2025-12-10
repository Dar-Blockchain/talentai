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
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { User } from '../../types/admin';

const GREEN_MAIN = '#8310FF';

interface UserDetailsDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onEdit?: (user: User) => void;
}

/**
 * UserDetailsDialog Component
 * Displays detailed information about a selected user
 * Extracted from admin.tsx for better modularity
 */
const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({ open, user, onClose, onEdit }) => {
  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        User Details
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {/* Basic Information */}
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Basic Information
            </Typography>
            <Stack spacing={2}>
              {Object.entries(user).map(
                ([key, value]) =>
                  key !== 'profile' &&
                  !key.toLowerCase().includes('id') && (
                    <Box key={key}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Typography>
                      <Typography variant="body1" sx={{ wordBreak: 'break-all', fontWeight: 500 }}>
                        {value !== null && value !== undefined ? String(value) : 'N/A'}
                      </Typography>
                    </Box>
                  )
              )}
            </Stack>
          </Box>

          {/* Profile Information */}
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Profile
            </Typography>
            {user.profile ? (
              <Stack spacing={2}>
                {Object.entries(user.profile).map(
                  ([key, value]) =>
                    !key.toLowerCase().includes('id') && (
                      <Box key={key}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Typography>
                        {Array.isArray(value) ? (
                          <Box sx={{ pl: 2 }}>
                            {value.length === 0 ? (
                              <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                                Empty
                              </Typography>
                            ) : (
                              value.map((item, idx) => (
                                <Box key={idx} sx={{ mb: 1 }}>
                                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    - {typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)}
                                  </Typography>
                                </Box>
                              ))
                            )}
                          </Box>
                        ) : typeof value === 'object' && value !== null ? (
                          <Box sx={{ pl: 2 }}>
                            <Typography
                              variant="body2"
                              component="pre"
                              sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.875rem' }}
                            >
                              {JSON.stringify(value, null, 2)}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body1" sx={{ wordBreak: 'break-all', fontWeight: 500 }}>
                            {value !== null && value !== undefined ? String(value) : 'N/A'}
                          </Typography>
                        )}
                      </Box>
                    )
                )}
              </Stack>
            ) : (
              <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                No profile data
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        {onEdit && (
          <Button
            variant="contained"
            onClick={() => onEdit(user)}
            sx={{
              backgroundColor: GREEN_MAIN,
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
