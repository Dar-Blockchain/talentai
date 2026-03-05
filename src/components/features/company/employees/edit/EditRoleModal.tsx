import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface Role {
  value: string;
  label: string;
  description: string;
}

interface EditRoleModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (role: string) => Promise<void>;
  currentRole: string;
  memberName: string;
}

// Role options
const ROLES: readonly Role[] = [
  { value: 'RH', label: 'HR', description: 'Manage candidates, recruitment, and team operations' },
  { value: 'TechLead', label: 'Technical Leader', description: 'Manage technical assessments and evaluations' },
  { value: 'Supervisor', label: 'Supervisor', description: 'Oversee team operations and workflows' },
  { value: 'Manager', label: 'Manager', description: 'Manage department and strategic decisions' },
] as const;

const EditRoleModal: React.FC<EditRoleModalProps> = React.memo(({
  open,
  onClose,
  onSave,
  currentRole,
  memberName
}) => {
  const [role, setRole] = useState(currentRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reset state when modal opens with new current role
  useEffect(() => {
    if (open) {
      setRole(currentRole);
      setError(null);
      setSuccessMessage(null);
    }
  }, [open, currentRole]);

  const handleSave = useCallback(async () => {
    console.log('🔵 [EditRoleModal] handleSave called with role:', role);

    if (!role) {
      console.log('❌ [EditRoleModal] Validation failed: Role is required');
      setError('Role is required');
      return;
    }

    console.log('✅ [EditRoleModal] Validation passed, calling onSave...');
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await onSave(role);
      console.log('✅ [EditRoleModal] onSave completed successfully');
      setSuccessMessage('Role updated successfully!');

      // Close modal after 1.5 seconds
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('❌ [EditRoleModal] Error in onSave:', err);
      setError(err.message || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  }, [role, onSave, onClose]);

  const handleClose = useCallback(() => {
    if (!loading) {
      onClose();
    }
  }, [loading, onClose]);

  const handleRoleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRole(event.target.value);
    setError(null);
  }, []);

  const isFormChanged = useMemo(() => {
    return role !== currentRole;
  }, [role, currentRole]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#1a1a1a',
          pb: 1,
        }}
      >
        Edit Role
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
          Update the role for <strong>{memberName}</strong>
        </Typography>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Success Alert */}
        {successMessage && (
          <Alert
            severity="success"
            icon={<CheckCircleIcon />}
            sx={{ mb: 2, borderRadius: 2 }}
          >
            {successMessage}
          </Alert>
        )}

        {/* Role Selection */}
        <FormControl component="fieldset" fullWidth>
          <FormLabel
            component="legend"
            sx={{
              fontWeight: 600,
              color: '#1a1a1a',
              mb: 2,
              '&.Mui-focused': {
                color: '#8310FF',
              },
            }}
          >
            Select Role
          </FormLabel>
          <RadioGroup value={role} onChange={handleRoleChange}>
            {ROLES.map((roleOption) => (
              <Box
                key={roleOption.value}
                sx={{
                  mb: 1.5,
                  p: 2,
                  border: '1px solid',
                  borderColor: role === roleOption.value ? '#8310FF' : '#e5e7eb',
                  borderRadius: 2,
                  backgroundColor: role === roleOption.value ? 'rgba(131, 16, 255, 0.04)' : 'transparent',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: '#8310FF',
                    backgroundColor: 'rgba(131, 16, 255, 0.04)',
                  },
                }}
                onClick={() => setRole(roleOption.value)}
              >
                <FormControlLabel
                  value={roleOption.value}
                  control={
                    <Radio
                      sx={{
                        color: '#94a3b8',
                        '&.Mui-checked': {
                          color: '#8310FF',
                        },
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: '#1a1a1a',
                          fontSize: '0.95rem',
                        }}
                      >
                        {roleOption.label}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#64748b',
                          display: 'block',
                          mt: 0.5,
                        }}
                      >
                        {roleOption.description}
                      </Typography>
                    </Box>
                  }
                  sx={{
                    margin: 0,
                    width: '100%',
                    alignItems: 'flex-start',
                  }}
                />
              </Box>
            ))}
          </RadioGroup>
        </FormControl>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            color: '#64748b',
            '&:hover': {
              backgroundColor: '#f8fafc',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={loading || !isFormChanged}
          variant="contained"
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
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
              Updating...
            </>
          ) : (
            'Update Role'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

EditRoleModal.displayName = 'EditRoleModal';

export default EditRoleModal;
