import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, IconButton, CircularProgress, Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditOutlined from '@mui/icons-material/EditOutlined';
import PeopleOutlined from '@mui/icons-material/PeopleOutlined';
import CodeOutlined from '@mui/icons-material/CodeOutlined';
import SupervisorAccountOutlined from '@mui/icons-material/SupervisorAccountOutlined';
import ManageAccountsOutlined from '@mui/icons-material/ManageAccountsOutlined';
import AdminPanelSettingsOutlined from '@mui/icons-material/AdminPanelSettingsOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface EditRoleModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (role: string) => Promise<void>;
  currentRole: string;
  memberName: string;
}

const ROLES = [
  { value: 'RH',         label: 'HR',               description: 'Recruitment & team ops',             icon: PeopleOutlined,             color: '#16A34A' },
  { value: 'TechLead',   label: 'Tech Lead',         description: 'Technical assessments',              icon: CodeOutlined,               color: '#0891B2' },
  { value: 'Supervisor', label: 'Supervisor',        description: 'Team operations',                    icon: SupervisorAccountOutlined,  color: '#D97706' },
  { value: 'Manager',    label: 'Manager',           description: 'Department strategy',                icon: ManageAccountsOutlined,     color: '#8310FF' },
  { value: 'Owner',      label: 'Owner',             description: 'Full workspace ownership & control', icon: AdminPanelSettingsOutlined, color: '#DC2626' },
] as const;

const PURPLE = '#8310FF';

const EditRoleModal: React.FC<EditRoleModalProps> = React.memo(({
  open, onClose, onSave, currentRole, memberName,
}) => {
  const [role, setRole]           = useState(currentRole);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState(false);

  useEffect(() => {
    if (open) {
      setRole(currentRole);
      setError(null);
      setSuccess(false);
    }
  }, [open, currentRole]);

  const isChanged = useMemo(() => role !== currentRole, [role, currentRole]);

  const handleSave = useCallback(async () => {
    if (!role) { setError('Please select a role'); return; }
    setLoading(true);
    setError(null);
    try {
      await onSave(role);
      setSuccess(true);
      setTimeout(onClose, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  }, [role, onSave, onClose]);

  const handleClose = useCallback(() => { if (!loading) onClose(); }, [loading, onClose]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            maxHeight: '90vh',
            boxShadow: '0 20px 48px rgba(0,0,0,0.12)',
          },
        },
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 3, py: 2.5,
          borderBottom: '1px solid #f3f4f6',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 38, height: 38, borderRadius: 2,
              bgcolor: `${PURPLE}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: PURPLE,
            }}>
              <EditOutlined sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#111827', lineHeight: 1.2 }}>
                Edit Role
              </Typography>
              <Typography sx={{ fontSize: '0.775rem', color: '#9CA3AF', mt: 0.25 }}>
                Updating role for <strong style={{ color: '#374151' }}>{memberName}</strong>
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleClose} disabled={loading} size="small"
            sx={{ color: '#9CA3AF', '&:hover': { bgcolor: '#F3F4F6', color: '#374151' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 3, pb: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>
        )}
        {success && (
          <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 2, borderRadius: 2 }}>
            Role updated successfully!
          </Alert>
        )}

        <Typography sx={{ mb: 1.5, fontWeight: 600, fontSize: '0.8rem', color: '#374151' }}>
          Select Role
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {ROLES.map((r) => {
            const selected = role === r.value;
            const Icon = r.icon;
            return (
              <Box
                key={r.value}
                onClick={() => !loading && setRole(r.value)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5,
                  px: 2, py: 1.5,
                  borderRadius: 2.5,
                  border: `1px solid ${selected ? r.color + '40' : '#f3f4f6'}`,
                  bgcolor: selected ? `${r.color}08` : '#fff',
                  boxShadow: selected ? `0 2px 8px ${r.color}18` : '0 2px 8px rgba(0,0,0,0.06)',
                  cursor: loading ? 'default' : 'pointer',
                  transition: 'all 0.15s ease',
                  '&:hover': !loading ? {
                    border: `1px solid ${r.color}40`,
                    bgcolor: `${r.color}08`,
                    boxShadow: `0 2px 8px ${r.color}18`,
                  } : {},
                }}
              >
                <Box sx={{
                  width: 40, height: 40, borderRadius: 2,
                  backgroundColor: `${r.color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: r.color, flexShrink: 0,
                  '& svg': { fontSize: 20 },
                }}>
                  <Icon />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#111827', lineHeight: 1.2 }}>
                    {r.label}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>
                    {r.description}
                  </Typography>
                </Box>
                {selected && (
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: r.color, flexShrink: 0 }} />
                )}
              </Box>
            );
          })}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 2.5, gap: 1.5 }}>
        <Button
          onClick={handleClose} disabled={loading}
          sx={{ textTransform: 'none', fontWeight: 600, color: '#6B7280', borderRadius: 2, px: 3, '&:hover': { bgcolor: '#F3F4F6' } }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave} disabled={loading || !isChanged} variant="contained"
          sx={{
            textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 3,
            bgcolor: PURPLE,
            boxShadow: '0 2px 8px rgba(131,16,255,0.3)',
            '&:hover': { bgcolor: '#7209E6', boxShadow: '0 4px 14px rgba(131,16,255,0.4)' },
            '&.Mui-disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF', boxShadow: 'none' },
          }}
        >
          {loading
            ? <><CircularProgress size={15} sx={{ mr: 1, color: '#fff' }} />Updating…</>
            : 'Update Role'}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

EditRoleModal.displayName = 'EditRoleModal';
export default EditRoleModal;
