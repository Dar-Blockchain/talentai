import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  IconButton,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
} from '@mui/material';
import {
  Close as CloseIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';

interface AddMemberModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (email: string, role: string) => Promise<void>;
}

interface Role {
  value: string;
  label: string;
  description: string;
}

// Move roles outside component to prevent re-creation on each render
const ROLES: readonly Role[] = [
  { value: 'hr', label: 'HR', description: 'Manage candidates, recruitment, and team operations' },
  { value: 'technical_leader', label: 'Technical Leader', description: 'Manage technical assessments and evaluations' },
  { value: 'supervisor', label: 'Supervisor', description: 'Oversee team operations and workflows' },
  { value: 'manager', label: 'Manager', description: 'Manage department and strategic decisions' },
] as const;

const DEFAULT_ROLE = 'hr';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AddMemberModal: React.FC<AddMemberModalProps> = React.memo(({ open, onClose, onSave }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(DEFAULT_ROLE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setEmail('');
      setRole(DEFAULT_ROLE);
      setError(null);
      setSuccessMessage(null);
    }
  }, [open]);

  // Memoize validation logic
  const isValidEmail = useMemo(() => {
    return email.trim() && EMAIL_REGEX.test(email);
  }, [email]);

  const isFormValid = useMemo(() => {
    return isValidEmail && role;
  }, [isValidEmail, role]);

  const handleSave = useCallback(async () => {
    console.log('🔵 [AddMemberModal] handleSave called with:', { email, role });

    // Validation
    if (!email.trim()) {
      console.log('❌ [AddMemberModal] Validation failed: Email is required');
      setError('Email is required');
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      console.log('❌ [AddMemberModal] Validation failed: Invalid email format');
      setError('Please enter a valid email address');
      return;
    }

    if (!role) {
      console.log('❌ [AddMemberModal] Validation failed: Role is required');
      setError('Role is required');
      return;
    }

    console.log('✅ [AddMemberModal] Validation passed, calling onSave...');
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await onSave(email, role);
      console.log('✅ [AddMemberModal] onSave completed successfully');
      setSuccessMessage('Team member invited successfully!');

      // Close modal after 1.5 seconds
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('❌ [AddMemberModal] Error in onSave:', err);
      setError(err.message || 'Failed to invite team member');
    } finally {
      setLoading(false);
    }
  }, [email, role, onSave, onClose]);

  const handleClose = useCallback(() => {
    if (!loading) {
      onClose();
    }
  }, [loading, onClose]);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  }, []);

  const handleRoleChange = useCallback((e: any) => {
    setRole(e.target.value);
  }, []);

  const handleErrorDismiss = useCallback(() => {
    setError(null);
  }, []);

  // Memoize selected role details
  const selectedRoleDetails = useMemo(() => {
    return ROLES.find((r) => r.value === role);
  }, [role]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2,
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #8310FF 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PersonAddIcon sx={{ color: 'white', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a', fontSize: '1.25rem' }}>
              Add Team Member
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
              Invite a new member to your team
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={handleClose}
          disabled={loading}
          sx={{
            color: '#64748b',
            '&:hover': { bgcolor: '#f8fafc' },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Error Alert */}
          {error && (
            <Alert severity="error" onClose={handleErrorDismiss} sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Success Alert */}
          {successMessage && (
            <Alert severity="success" sx={{ borderRadius: 2 }}>
              {successMessage}
            </Alert>
          )}

          {/* Email Input */}
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                mb: 1,
                fontWeight: 600,
                color: '#334155',
                fontSize: '0.9rem',
              }}
            >
              Email Address
            </Typography>
            <TextField
              fullWidth
              placeholder="john.doe@company.com"
              type="email"
              value={email}
              onChange={handleEmailChange}
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#f8fafc',
                  '&:hover': {
                    backgroundColor: '#f1f5f9',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                    '& fieldset': {
                      borderColor: '#8310FF',
                      borderWidth: 2,
                    },
                  },
                },
              }}
            />
            <Typography variant="caption" sx={{ color: '#64748b', mt: 0.5, display: 'block' }}>
              An invitation will be sent to this email address
            </Typography>
          </Box>

          {/* Role Selection */}
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                mb: 1,
                fontWeight: 600,
                color: '#334155',
                fontSize: '0.9rem',
              }}
            >
              Role
            </Typography>
            <FormControl fullWidth>
              <Select
                value={role}
                onChange={handleRoleChange}
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  backgroundColor: '#f8fafc',
                  '&:hover': {
                    backgroundColor: '#f1f5f9',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#8310FF',
                      borderWidth: 2,
                    },
                  },
                }}
              >
                {ROLES.map((roleOption) => (
                  <MenuItem key={roleOption.value} value={roleOption.value}>
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                        {roleOption.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {roleOption.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="caption" sx={{ color: '#64748b', mt: 0.5, display: 'block' }}>
              Select the role and permissions for this team member
            </Typography>
          </Box>

    
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          pt: 2,
          gap: 1.5,
          borderTop: '1px solid #f0f0f0',
        }}
      >
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            color: '#64748b',
            borderRadius: 2,
            px: 3,
            '&:hover': {
              bgcolor: '#f8fafc',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={loading || !isFormValid}
          variant="contained"
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            px: 3,
            color: '#ffffff',
            background: 'linear-gradient(135deg, #8310FF 0%, #a855f7 100%)',
            boxShadow: '0 4px 12px rgba(131, 16, 255, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #6b0fd9 0%, #9333ea 100%)',
              boxShadow: '0 6px 16px rgba(131, 16, 255, 0.4)',
            },
            '&.Mui-disabled': {
              background: '#e2e8f0',
              color: '#94a3b8',
            },
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={18} sx={{ mr: 1, color: 'white' }} />
              Sending Invitation...
            </>
          ) : (
            'Send Invitation'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

AddMemberModal.displayName = 'AddMemberModal';

export default AddMemberModal;
