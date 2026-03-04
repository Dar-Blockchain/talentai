import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, Box, IconButton,
  CircularProgress, Select, MenuItem, FormControl,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PeopleOutlined from '@mui/icons-material/PeopleOutlined';
import CodeOutlined from '@mui/icons-material/CodeOutlined';
import SupervisorAccountOutlined from '@mui/icons-material/SupervisorAccountOutlined';
import ManageAccountsOutlined from '@mui/icons-material/ManageAccountsOutlined';
import BusinessOutlined from '@mui/icons-material/BusinessOutlined';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store/store';
import {
  fetchDepartments,
  selectDepartments,
  selectDepartmentsLoading,
} from '@/store/slices/departmentSlice';

interface AddEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (email: string, role: string, departmentId?: string) => Promise<void>;
}

const ROLES = [
  { value: 'hr',               label: 'HR',             description: 'Recruitment & team ops',   icon: PeopleOutlined,              color: '#16A34A' },
  { value: 'technical_leader', label: 'Tech Lead',      description: 'Technical assessments',    icon: CodeOutlined,                color: '#0891B2' },
  { value: 'supervisor',       label: 'Supervisor',     description: 'Team operations',          icon: SupervisorAccountOutlined,   color: '#D97706' },
  { value: 'manager',          label: 'Manager',        description: 'Department strategy',      icon: ManageAccountsOutlined,      color: '#8310FF' },
] as const;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PURPLE = '#8310FF';

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = React.memo(({ open, onClose, onSave }) => {
  const dispatch = useDispatch<AppDispatch>();
  const departments       = useSelector(selectDepartments);
  const departmentsLoading = useSelector(selectDepartmentsLoading);

  const [email, setEmail]             = useState('');
  const [role, setRole]               = useState('hr');
  const [departmentId, setDepartmentId] = useState('');
  const [loading, setLoading]         = useState(false);

  useEffect(() => {
    if (open) {
      setEmail('');
      setRole('hr');
      setDepartmentId('');
      if (departments.length === 0) dispatch(fetchDepartments({}));
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const isFormValid = useMemo(() => email.trim() && EMAIL_REGEX.test(email) && role, [email, role]);

  const handleSave = useCallback(async () => {
    if (!email.trim() || !EMAIL_REGEX.test(email)) return;
    setLoading(true);
    try {
      await onSave(email, role, departmentId || undefined);
    } catch {
      // error already handled by parent via showToast
    } finally {
      setLoading(false);
      onClose();
    }
  }, [email, role, departmentId, onSave, onClose]);

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
              <PersonAddIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#111827', lineHeight: 1.2 }}>
                Invite Team Member
              </Typography>
              <Typography sx={{ fontSize: '0.775rem', color: '#9CA3AF', mt: 0.25 }}>
                Send an invitation to your workspace
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

          {/* Email */}
          <Box>
            <Typography sx={{ mb: 1, fontWeight: 600, fontSize: '0.8rem', color: '#374151' }}>
              Email Address
            </Typography>
            <TextField
              fullWidth size="small" type="email"
              placeholder="colleague@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2, bgcolor: '#F8FAFC',
                  '& fieldset': { borderColor: '#E2E8F0' },
                  '&:hover fieldset': { borderColor: '#CBD5E1' },
                  '&.Mui-focused fieldset': { borderColor: PURPLE, borderWidth: 2 },
                },
              }}
            />
            <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', mt: 0.75 }}>
              They'll receive an email invitation to join your team.
            </Typography>
          </Box>

          {/* Department (optional) */}
          <Box>
            <Typography sx={{ mb: 1, fontWeight: 600, fontSize: '0.8rem', color: '#374151' }}>
              Department <Typography component="span" sx={{ fontWeight: 400, color: '#9CA3AF', fontSize: '0.75rem' }}>(optional)</Typography>
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                disabled={loading || departmentsLoading}
                displayEmpty
                startAdornment={
                  <BusinessOutlined sx={{ fontSize: 18, color: '#9CA3AF', mr: 1 }} />
                }
                sx={{
                  borderRadius: 2,
                  bgcolor: '#F8FAFC',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: PURPLE, borderWidth: 2 },
                }}
              >
                <MenuItem value="">
                  <Typography sx={{ color: '#9CA3AF', fontSize: '0.875rem' }}>No department</Typography>
                </MenuItem>
                {departments.map((d) => (
                  <MenuItem key={d._id} value={d._id}>
                    {d.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Role — StatCard style list */}
          <Box>
            <Typography sx={{ mb: 1, fontWeight: 600, fontSize: '0.8rem', color: '#374151' }}>
              Select Role
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {ROLES.map((r) => {
                const selected = role === r.value;
                const Icon = r.icon;
                const iconBg = `${r.color}18`;
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
                    {/* Icon box — same as StatCard */}
                    <Box sx={{
                      width: 40, height: 40, borderRadius: 2,
                      backgroundColor: iconBg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: r.color, flexShrink: 0,
                      '& svg': { fontSize: 20 },
                    }}>
                      <Icon />
                    </Box>

                    {/* Text */}
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#111827', lineHeight: 1.2 }}>
                        {r.label}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>
                        {r.description}
                      </Typography>
                    </Box>

                    {/* Selected dot */}
                    {selected && (
                      <Box sx={{
                        width: 8, height: 8, borderRadius: '50%',
                        bgcolor: r.color, flexShrink: 0,
                      }} />
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
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
          onClick={handleSave} disabled={loading || !isFormValid} variant="contained"
          sx={{
            textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 3,
            bgcolor: PURPLE,
            boxShadow: '0 2px 8px rgba(131,16,255,0.3)',
            '&:hover': { bgcolor: '#7209E6', boxShadow: '0 4px 14px rgba(131,16,255,0.4)' },
            '&.Mui-disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF', boxShadow: 'none' },
          }}
        >
          {loading
            ? <><CircularProgress size={15} sx={{ mr: 1, color: '#fff' }} />Sending…</>
            : 'Send Invitation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

AddEmployeeModal.displayName = 'AddEmployeeModal';
export default AddEmployeeModal;
