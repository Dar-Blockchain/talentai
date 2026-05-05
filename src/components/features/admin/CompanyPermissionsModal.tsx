import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
  Stack,
} from '@mui/material';
import {
  Close as CloseIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { Permission, DEFAULT_PERMISSIONS } from '@/types/permissions';

const PRIMARY = '#8310FF';

// Type for the permissions object (without metadata fields)
export type CompanyPermissions = Omit<Permission, '_id' | 'userId' | 'profileId' | 'lastModifiedBy' | 'notes' | 'createdAt' | 'updatedAt'>;

interface PermissionItem {
  key: keyof CompanyPermissions;
  label: string;
  description: string;
  icon: string;
}

interface CompanyPermissionsModalProps {
  open: boolean;
  onClose: () => void;
  company: {
    _id: string;
    username: string;
    email: string;
    profile?: {
      firstName?: string;
      lastName?: string;
      companyDetails?: {
        name?: string;
      };
    };
  } | null;
  onSave: (companyId: string, permissions: CompanyPermissions) => Promise<void>;
}

const defaultPermissions: CompanyPermissions = DEFAULT_PERMISSIONS;

const permissionItems: PermissionItem[] = [
  { key: 'canCreateJobPosts', label: 'Create Job Posts', description: 'Create, edit, delete, and manage job postings', icon: '📋' },
  { key: 'canViewCandidateProfiles', label: 'View Candidate Profiles', description: 'View candidate profiles, assessments, and resumes', icon: '👤' },
  { key: 'canContactCandidates', label: 'Contact Candidates', description: 'Send messages and communicate with candidates', icon: '💬' },
  { key: 'canUseHRAgents', label: 'Use HR Agents', description: 'Create and manage AI HR agents for recruitment automation', icon: '🤖' },
  { key: 'canManageTeam', label: 'Manage Team', description: 'Manage team members, view team list, and control team settings', icon: '👥' },
  { key: 'canInviteMembers', label: 'Invite Members', description: 'Send invitations to new team members to join the company', icon: '✉️' },
  { key: 'canAssignRoles', label: 'Assign Roles', description: 'Assign and update roles for team members', icon: '🎯' },
];

const CompanyPermissionsModal: React.FC<CompanyPermissionsModalProps> = ({
  open,
  onClose,
  company,
  onSave,
}) => {
  const [permissions, setPermissions] = useState<CompanyPermissions>(defaultPermissions);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (open && company) {
      fetchCompanyPermissions();
    }
  }, [open, company]);

  const fetchCompanyPermissions = async () => {
    if (!company) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('api_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}admin/companies/${company._id}/permissions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch permissions');
      const data = await response.json();
      if (data.success && data.permissions) {
        const validPermissions: CompanyPermissions = {
          canCreateJobPosts: data.permissions.canCreateJobPosts ?? defaultPermissions.canCreateJobPosts,
          canViewCandidateProfiles: data.permissions.canViewCandidateProfiles ?? defaultPermissions.canViewCandidateProfiles,
          canContactCandidates: data.permissions.canContactCandidates ?? defaultPermissions.canContactCandidates,
          canUseHRAgents: data.permissions.canUseHRAgents ?? defaultPermissions.canUseHRAgents,
          canManageTeam: data.permissions.canManageTeam ?? defaultPermissions.canManageTeam,
          canInviteMembers: data.permissions.canInviteMembers ?? defaultPermissions.canInviteMembers,
          canAssignRoles: data.permissions.canAssignRoles ?? defaultPermissions.canAssignRoles,
        };
        setPermissions(validPermissions);
      } else {
        setPermissions(defaultPermissions);
      }
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setPermissions(defaultPermissions);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permissionKey: keyof CompanyPermissions) => {
    setPermissions((prev) => ({ ...prev, [permissionKey]: !prev[permissionKey] }));
  };

  const handleSelectAll = () => {
    const allEnabled = Object.values(permissions).every(Boolean);
    const newPermissions = { ...permissions };
    Object.keys(newPermissions).forEach((key) => {
      newPermissions[key as keyof CompanyPermissions] = !allEnabled;
    });
    setPermissions(newPermissions);
  };

  const handleSave = async () => {
    if (!company) return;
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await onSave(company._id, permissions);
      setSuccessMessage('Permissions updated successfully!');
      setTimeout(() => onClose(), 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update permissions');
    } finally {
      setSaving(false);
    }
  };

  const getCompanyName = () => {
    if (!company) return '';
    return company.profile?.companyDetails?.name || company.profile?.firstName || company.username || 'Company';
  };

  const enabledCount = Object.values(permissions).filter(Boolean).length;
  const totalCount = Object.keys(permissions).length;

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
          maxHeight: '90vh',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${PRIMARY} 0%, #6a0dad 100%)`,
          px: 3,
          pt: 3,
          pb: 3,
          position: 'relative',
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 12, right: 12, color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SecurityIcon sx={{ fontSize: 28, color: 'rgba(255,255,255,0.9)' }} />
          <Box>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
              Company Permissions
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              {getCompanyName()} &middot; {company?.email}
            </Typography>
          </Box>
        </Box>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {/* Summary Bar */}
        <Box sx={{ px: 3, py: 2, backgroundColor: '#f5f3ff', borderBottom: '1px solid #ece6fa' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                {enabledCount} of {totalCount} enabled
              </Typography>
              <Typography variant="caption" sx={{ color: '#6c6c80' }}>
                {Math.round((enabledCount / totalCount) * 100)}% access level
              </Typography>
            </Box>
            <Chip
              label={Object.values(permissions).every(Boolean) ? 'Deselect All' : 'Select All'}
              size="small"
              onClick={handleSelectAll}
              sx={{
                backgroundColor: 'white',
                color: PRIMARY,
                fontWeight: 600,
                border: '1px solid #ece6fa',
                cursor: 'pointer',
                '&:hover': { backgroundColor: '#ece6fa' },
              }}
            />
          </Stack>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: PRIMARY }} />
          </Box>
        ) : (
          <Box sx={{ px: 2, py: 1.5 }}>
            {error && (
              <Alert severity="error" sx={{ mx: 1, mb: 1.5, borderRadius: '10px' }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            {successMessage && (
              <Alert severity="success" sx={{ mx: 1, mb: 1.5, borderRadius: '10px' }} onClose={() => setSuccessMessage(null)}>
                {successMessage}
              </Alert>
            )}

            {permissionItems.map((perm) => {
              const isEnabled = permissions[perm.key];
              return (
                <Box
                  key={perm.key}
                  onClick={() => handlePermissionChange(perm.key)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 2,
                    py: 1.5,
                    mx: 1,
                    mb: 1,
                    borderRadius: '12px',
                    border: '1.5px solid',
                    borderColor: isEnabled ? PRIMARY : '#ece6fa',
                    backgroundColor: isEnabled ? '#f5f3ff' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      borderColor: PRIMARY,
                      backgroundColor: '#f5f3ff',
                    },
                  }}
                >
                  <Typography sx={{ fontSize: 22, lineHeight: 1 }}>{perm.icon}</Typography>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                      {perm.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6c6c80', lineHeight: 1.3 }}>
                      {perm.description}
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isEnabled}
                        size="small"
                        sx={{
                          color: '#ece6fa',
                          '&.Mui-checked': { color: PRIMARY },
                          p: 0,
                        }}
                      />
                    }
                    label=""
                    sx={{ m: 0, mr: -0.5 }}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => handlePermissionChange(perm.key)}
                  />
                </Box>
              );
            })}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #ece6fa', backgroundColor: '#fafafa', gap: 1.5 }}>
        <Button
          onClick={onClose}
          disabled={saving}
          variant="outlined"
          sx={{
            textTransform: 'none',
            borderColor: '#ece6fa',
            color: '#6c6c80',
            borderRadius: '10px',
            '&:hover': { borderColor: '#ccc', backgroundColor: 'white' },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving || loading}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SecurityIcon />}
          sx={{
            textTransform: 'none',
            backgroundColor: PRIMARY,
            borderRadius: '10px',
            fontWeight: 600,
            '&:hover': { backgroundColor: '#6a0dad' },
          }}
        >
          {saving ? 'Saving...' : 'Save Permissions'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CompanyPermissionsModal;
