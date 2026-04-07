import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, Box, IconButton,
  CircularProgress, Select, MenuItem, FormControl, InputAdornment,
} from '@mui/material';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import BusinessOutlined from '@mui/icons-material/BusinessOutlined';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store/store';
import {
  fetchDepartments,
  selectDepartments,
  selectDepartmentsLoading,
} from '@/store/slices/departmentSlice';
import { ROLES } from '@/constants/employee';

interface AddEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (email: string, role: string, departmentId?: string) => Promise<void>;
  defaultDepartmentId?: string;
}



const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PURPLE = '#8310FF';

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = React.memo(({ open, onClose, onSave, defaultDepartmentId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const departments       = useSelector(selectDepartments);
  const departmentsLoading = useSelector(selectDepartmentsLoading);

  const [email, setEmail]             = useState('');
  const [role, setRole]               = useState('hr');
  const [departmentId, setDepartmentId] = useState('');
  const [loading, setLoading]         = useState(false);
  const [roleSearch, setRoleSearch]   = useState('');

  useEffect(() => {
    if (open) {
      setEmail('');
      setRole('hr');
      setDepartmentId(defaultDepartmentId ?? '');
      setRoleSearch('');
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
                Add Employee
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

      <DialogContent sx={{ px: 3, pt: 4, pb: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 2 }}>

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
              Department{' '}
              {!defaultDepartmentId && (
                <Typography component="span" sx={{ fontWeight: 400, color: '#9CA3AF', fontSize: '0.75rem' }}>(optional)</Typography>
              )}
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                disabled={loading || departmentsLoading || Boolean(defaultDepartmentId)}
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

          {/* Role — searchable Select */}
          <Box>
            <Typography sx={{ mb: 1, fontWeight: 600, fontSize: '0.8rem', color: '#374151' }}>
              Select Role
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
                onClose={() => setRoleSearch('')}
                MenuProps={{
                  PaperProps: {
                    sx: { maxHeight: 360, borderRadius: 2, mt: 0.5, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' },
                  },
                  autoFocus: false,
                }}
                renderValue={(val) => {
                  const r = ROLES.find((r) => r.value === val);
                  if (!r) return null;
                  const Icon = r.icon;
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{
                        width: 28, height: 28, borderRadius: 1.5,
                        bgcolor: `${r.color}18`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: r.color, flexShrink: 0,
                        '& svg': { fontSize: 16 },
                      }}>
                        <Icon />
                      </Box>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>
                        {r.label}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        — {r.description}
                      </Typography>
                    </Box>
                  );
                }}
                sx={{
                  borderRadius: 2,
                  bgcolor: '#F8FAFC',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: PURPLE, borderWidth: 2 },
                }}
              >
                {/* Sticky search box */}
                <MenuItem
                  disableRipple
                  onKeyDown={(e) => e.stopPropagation()}
                  sx={{
                    position: 'sticky', top: 0, zIndex: 1,
                    bgcolor: '#fff', p: 1.25,
                    borderBottom: '1px solid #f3f4f6',
                    '&:hover': { bgcolor: '#fff' },
                    '&.Mui-focusVisible': { bgcolor: '#fff' },
                  }}
                >
                  <TextField
                    size="small" fullWidth autoFocus
                    placeholder="Search roles…"
                    value={roleSearch}
                    onChange={(e) => setRoleSearch(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchOutlined sx={{ fontSize: 18, color: '#9CA3AF' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5, bgcolor: '#F8FAFC',
                        '& fieldset': { borderColor: '#E2E8F0' },
                        '&:hover fieldset': { borderColor: '#CBD5E1' },
                        '&.Mui-focused fieldset': { borderColor: PURPLE, borderWidth: 2 },
                      },
                    }}
                  />
                </MenuItem>

                {/* Filtered role list */}
                {ROLES.filter((r) => {
                  const q = roleSearch.trim().toLowerCase();
                  return !q || r.label.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
                }).map((r) => {
                  const Icon = r.icon;
                  return (
                    <MenuItem key={r.value} value={r.value} sx={{ py: 1.25, px: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                          width: 34, height: 34, borderRadius: 1.5,
                          bgcolor: `${r.color}18`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: r.color, flexShrink: 0,
                          '& svg': { fontSize: 18 },
                        }}>
                          <Icon />
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#111827', lineHeight: 1.2 }}>
                            {r.label}
                          </Typography>
                          <Typography sx={{ fontSize: '0.72rem', color: '#6b7280' }}>
                            {r.description}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  );
                })}

                {/* Empty state */}
                {ROLES.filter((r) => {
                  const q = roleSearch.trim().toLowerCase();
                  return !q || r.label.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
                }).length === 0 && (
                  <MenuItem disabled sx={{ py: 2, justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#9CA3AF' }}>No roles match "{roleSearch}"</Typography>
                  </MenuItem>
                )}
              </Select>
            </FormControl>
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
            color: '#fff',
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
