import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormGroup,
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
  Business as BusinessIcon,
} from '@mui/icons-material';
import { Permission, DEFAULT_PERMISSIONS } from '@/types/permissions';

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
  // Job Post Permissions
  {
    key: 'canCreateJobPosts',
    label: 'Create Job Posts',
    description: 'Create, edit, delete, and manage job postings',
    icon: '📋',
  },

  // Candidate Permissions
  {
    key: 'canUnlockCandidates',
    label: 'Unlock Candidates',
    description: 'Purchase and unlock candidate profiles using tokens',
    icon: '🔓',
  },
  {
    key: 'canViewCandidateProfiles',
    label: 'View Candidate Profiles',
    description: 'View unlocked candidate profiles, assessments, and resumes',
    icon: '👤',
  },
  {
    key: 'canContactCandidates',
    label: 'Contact Candidates',
    description: 'Send messages and communicate with candidates',
    icon: '💬',
  },

  // Matching Permissions
  {
    key: 'canAccessMatching',
    label: 'Access Matching',
    description: 'Access matching algorithm and view candidate matches',
    icon: '🔍',
  },

  // HR Agent Permissions
  {
    key: 'canUseHRAgents',
    label: 'Use HR Agents',
    description: 'Create and manage AI HR agents for recruitment automation',
    icon: '🤖',
  },

  // Team Permissions
  {
    key: 'canManageTeam',
    label: 'Manage Team',
    description: 'Manage team members, view team list, and control team settings',
    icon: '👥',
  },
  {
    key: 'canInviteMembers',
    label: 'Invite Members',
    description: 'Send invitations to new team members to join the company',
    icon: '✉️',
  },
  {
    key: 'canAssignRoles',
    label: 'Assign Roles',
    description: 'Assign and update roles for team members',
    icon: '🎯',
  },
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

  // Fetch current permissions when modal opens
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

      if (!response.ok) {
        throw new Error('Failed to fetch permissions');
      }

      const data = await response.json();
      console.log('📦 [PermissionsModal] Fetched permissions from backend:', data);

      if (data.success && data.permissions) {
        // Only extract the new permission fields that match our PermissionModel
        const validPermissions: CompanyPermissions = {
          canCreateJobPosts: data.permissions.canCreateJobPosts ?? defaultPermissions.canCreateJobPosts,
          canUnlockCandidates: data.permissions.canUnlockCandidates ?? defaultPermissions.canUnlockCandidates,
          canViewCandidateProfiles: data.permissions.canViewCandidateProfiles ?? defaultPermissions.canViewCandidateProfiles,
          canContactCandidates: data.permissions.canContactCandidates ?? defaultPermissions.canContactCandidates,
          canAccessMatching: data.permissions.canAccessMatching ?? defaultPermissions.canAccessMatching,
          canUseHRAgents: data.permissions.canUseHRAgents ?? defaultPermissions.canUseHRAgents,
          canManageTeam: data.permissions.canManageTeam ?? defaultPermissions.canManageTeam,
          canInviteMembers: data.permissions.canInviteMembers ?? defaultPermissions.canInviteMembers,
          canAssignRoles: data.permissions.canAssignRoles ?? defaultPermissions.canAssignRoles,
        };
        console.log('✅ [PermissionsModal] Cleaned permissions (new fields only):', validPermissions);
        setPermissions(validPermissions);
      } else {
        setPermissions(defaultPermissions);
      }
    } catch (err) {
      console.error('Error fetching permissions:', err);
      // Use default permissions if fetch fails
      setPermissions(defaultPermissions);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permissionKey: keyof CompanyPermissions) => {
    setPermissions((prev) => ({
      ...prev,
      [permissionKey]: !prev[permissionKey],
    }));
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
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update permissions');
    } finally {
      setSaving(false);
    }
  };

  const getCompanyName = () => {
    if (!company) return '';
    return (
      company.profile?.companyDetails?.name ||
      company.profile?.firstName ||
      company.username ||
      'Company'
    );
  };

  const getEnabledPermissionsCount = () => {
    return Object.values(permissions).filter(Boolean).length;
  };

  const getTotalPermissionsCount = () => {
    return Object.keys(permissions).length;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2,
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <BusinessIcon sx={{ fontSize: 32, color: '#8310FF' }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1F2937' }}>
              Company Permissions
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
              {getCompanyName()} • {company?.email}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Summary */}
            <Box
              sx={{
                mb: 3,
                p: 2,
                bgcolor: '#F9FAFB',
                borderRadius: 2,
                border: '1px solid #E5E7EB',
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <SecurityIcon sx={{ color: '#8310FF' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151' }}>
                    Permission Summary
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    {getEnabledPermissionsCount()} of {getTotalPermissionsCount()} permissions
                    enabled
                  </Typography>
                </Box>
                <Chip
                  label={`${Math.round((getEnabledPermissionsCount() / getTotalPermissionsCount()) * 100)}% Access`}
                  color="primary"
                  sx={{ fontWeight: 600 }}
                />
              </Stack>
            </Box>

            {/* Select/Deselect All Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                size="small"
                onClick={handleSelectAll}
                sx={{
                  textTransform: 'none',
                  color: '#8310FF',
                  fontWeight: 600,
                }}
              >
                {Object.values(permissions).every(Boolean)
                  ? 'Deselect All'
                  : 'Select All'}
              </Button>
            </Box>

            {/* Error/Success Messages */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            {successMessage && (
              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
                {successMessage}
              </Alert>
            )}

            {/* Permission List */}
            <FormGroup>
              {permissionItems.map((perm) => (
                <React.Fragment key={perm.key}>
                  <Box
                    sx={{
                      p: 2.5,
                      mb: 2,
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: permissions[perm.key] ? '#8310FF' : '#E5E7EB',
                      bgcolor: permissions[perm.key] ? 'rgba(131, 16, 255, 0.05)' : '#fff',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'rgba(131, 16, 255, 0.03)',
                        borderColor: '#8310FF',
                      },
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={permissions[perm.key]}
                          onChange={() => handlePermissionChange(perm.key)}
                          sx={{
                            color: '#8310FF',
                            '&.Mui-checked': {
                              color: '#8310FF',
                            },
                          }}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Typography sx={{ fontSize: 24 }}>{perm.icon}</Typography>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1F2937' }}>
                              {perm.label}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6B7280' }}>
                              {perm.description}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </Box>
                </React.Fragment>
              ))}
            </FormGroup>
          </>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: '1px solid #E5E7EB',
          gap: 2,
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={saving}
          sx={{
            textTransform: 'none',
            borderColor: '#E5E7EB',
            color: '#374151',
            '&:hover': {
              borderColor: '#9CA3AF',
              bgcolor: 'rgba(0,0,0,0.02)',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving || loading}
          startIcon={saving ? <CircularProgress size={16} /> : <SecurityIcon />}
          sx={{
            textTransform: 'none',
            bgcolor: '#8310FF',
            '&:hover': {
              bgcolor: '#6a0dad',
            },
          }}
        >
          {saving ? 'Saving...' : 'Save Permissions'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CompanyPermissionsModal;
