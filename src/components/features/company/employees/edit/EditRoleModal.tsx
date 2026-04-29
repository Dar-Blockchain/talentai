import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, Box, IconButton,
  CircularProgress, Alert, Select, MenuItem, FormControl, InputAdornment,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditOutlined from '@mui/icons-material/EditOutlined';
import BusinessOutlined from '@mui/icons-material/BusinessOutlined';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { fetchDepartments, selectDepartments, selectDepartmentsLoading } from '@/store/slices/departmentSlice';
import { useTranslation } from "react-i18next";
import { ROLES } from '@/constants/employee';
import { getRoleDescription, getRoleLabel, roleMatchesSearch } from '@/utils/employeeRoleI18n';

interface EditRoleModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (role: string, departmentId?: string) => Promise<void>;
  currentRole: string;
  currentDepartmentId?: string;
  memberName: string;
}

const PURPLE = '#8310FF';

const EditRoleModal: React.FC<EditRoleModalProps> = React.memo(({
  open, onClose, onSave, currentRole, currentDepartmentId, memberName,
}) => {
  const { t } = useTranslation("dashboard");
  const m = (key: string, opts?: { [k: string]: string }) => t(`pages.employees.modals.edit.${key}`, opts);
  const dispatch = useDispatch<AppDispatch>();
  const departments        = useSelector(selectDepartments);
  const departmentsLoading = useSelector(selectDepartmentsLoading);

  const [role,         setRole]         = useState(currentRole);
  const [departmentId, setDepartmentId] = useState(currentDepartmentId ?? '');
  const [roleSearch,   setRoleSearch]   = useState('');
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [success,      setSuccess]      = useState(false);

  useEffect(() => {
    if (open) {
      setRole(currentRole);
      setDepartmentId(currentDepartmentId ?? '');
      setRoleSearch('');
      setError(null);
      setSuccess(false);
      if (departments.length === 0) dispatch(fetchDepartments({}));
    }
  }, [open, currentRole, currentDepartmentId]); // eslint-disable-line react-hooks/exhaustive-deps

  const isChanged = useMemo(
    () => role !== currentRole || departmentId !== (currentDepartmentId ?? ''),
    [role, departmentId, currentRole, currentDepartmentId],
  );

  const handleSave = useCallback(async () => {
    if (!role) { setError(m('select_role_error')); return; }
    setLoading(true);
    setError(null);
    try {
      await onSave(role, departmentId || undefined);
      setSuccess(true);
      setTimeout(onClose, 1200);
    } catch (err: any) {
      setError(err.message || m('update_failed'));
    } finally {
      setLoading(false);
    }
  }, [role, departmentId, onSave, onClose]);

  const handleClose = useCallback(() => { if (!loading) onClose(); }, [loading, onClose]);

  const filteredRoles = useMemo(() => {
    const q = roleSearch.trim().toLowerCase();
    return ROLES.filter((r) => roleMatchesSearch(r.value, q, t));
  }, [roleSearch, t]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, maxHeight: '90vh', boxShadow: '0 20px 48px rgba(0,0,0,0.12)' } } }}
    >
      {/* Header */}
      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 3, py: 2.5, borderBottom: '1px solid #f3f4f6',
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
                {m('title')}
              </Typography>
              <Typography sx={{ fontSize: '0.775rem', color: '#9CA3AF', mt: 0.25 }}>
                {m('subtitle_intro')}{' '}
                <strong style={{ color: '#374151' }}>{memberName}</strong>
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
        {error   && <Alert severity="error"   sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 2, borderRadius: 2 }}>{m('success')}</Alert>}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

          {/* Role */}
          <Box>
            <Typography sx={{ mb: 1, fontWeight: 600, fontSize: '0.8rem', color: '#374151' }}>
              {m('role_label')}
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
                onClose={() => setRoleSearch('')}
                MenuProps={{
                  PaperProps: { sx: { maxHeight: 360, borderRadius: 2, mt: 0.5, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } },
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
                        color: r.color, flexShrink: 0, '& svg': { fontSize: 16 },
                      }}>
                        <Icon />
                      </Box>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>
                        {getRoleLabel(r.value, t)}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        — {getRoleDescription(r.value, t)}
                      </Typography>
                    </Box>
                  );
                }}
                sx={{
                  borderRadius: 2, bgcolor: '#F8FAFC',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: PURPLE, borderWidth: 2 },
                }}
              >
                {/* Sticky search */}
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
                    placeholder={m('search_roles')}
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

                {filteredRoles.map((r) => {
                  const Icon = r.icon;
                  return (
                    <MenuItem key={r.value} value={r.value} sx={{ py: 1.25, px: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                          width: 34, height: 34, borderRadius: 1.5,
                          bgcolor: `${r.color}18`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: r.color, flexShrink: 0, '& svg': { fontSize: 18 },
                        }}>
                          <Icon />
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#111827', lineHeight: 1.2 }}>
                            {getRoleLabel(r.value, t)}
                          </Typography>
                          <Typography sx={{ fontSize: '0.72rem', color: '#6b7280' }}>
                            {getRoleDescription(r.value, t)}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  );
                })}

                {filteredRoles.length === 0 && (
                  <MenuItem disabled sx={{ py: 2, justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{m('no_roles_match', { term: roleSearch })}</Typography>
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </Box>

          {/* Department */}
          <Box>
            <Typography sx={{ mb: 1, fontWeight: 600, fontSize: '0.8rem', color: '#374151' }}>
              {m('department_label')}{' '}
              <Typography component="span" sx={{ fontWeight: 400, color: '#9CA3AF', fontSize: '0.75rem' }}>
                {m('optional')}
              </Typography>
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                disabled={loading || departmentsLoading}
                displayEmpty
                startAdornment={<BusinessOutlined sx={{ fontSize: 18, color: '#9CA3AF', mr: 1 }} />}
                sx={{
                  borderRadius: 2, bgcolor: '#F8FAFC',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: PURPLE, borderWidth: 2 },
                }}
              >
                <MenuItem value="">
                  <Typography sx={{ color: '#9CA3AF', fontSize: '0.875rem' }}>{m('no_department')}</Typography>
                </MenuItem>
                {departments.map((d) => (
                  <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>
                ))}
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
          {m('cancel')}
        </Button>
        <Button
          onClick={handleSave} disabled={loading || !isChanged} variant="contained"
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
            ? <><CircularProgress size={15} sx={{ mr: 1, color: '#fff' }} />{m('updating_btn')}</>
            : m('save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

EditRoleModal.displayName = 'EditRoleModal';
export default EditRoleModal;
