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
  Divider,
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

// Permission categories and their permissions
export interface CompanyPermissions {
  // Job Post Permissions
  canCreateJobPosts: boolean;
  canEditJobPosts: boolean;
  canDeleteJobPosts: boolean;
  canViewJobPosts: boolean;

  // Candidate Permissions
  canUnlockCandidates: boolean;
  canViewCandidateProfiles: boolean;
  canViewCandidateAssessments: boolean;
  canDownloadCandidateResumes: boolean;

  // Matching Permissions
  canViewMatches: boolean;
  canAccessMatchingAlgorithm: boolean;

  // HR Agent Permissions
  canCreateHRAgents: boolean;
  canManageHRAgents: boolean;
  canViewHRAgentAnalytics: boolean;

  // Recruitment Flow Permissions
  canConfigureRecruitmentFlow: boolean;
  canViewRecruitmentPipeline: boolean;
  canModifyInterviewStages: boolean;

  // Token Permissions
  canPurchaseTokens: boolean;
  canViewTokenBalance: boolean;
  canTransferTokens: boolean;

  // Analytics Permissions
  canViewCompanyAnalytics: boolean;
  canExportReports: boolean;
  canViewDashboardMetrics: boolean;

  // Communication Permissions
  canSendMessages: boolean;
  canScheduleInterviews: boolean;
  canSendAssessments: boolean;
}

interface PermissionCategory {
  name: string;
  icon: React.ReactNode;
  permissions: {
    key: keyof CompanyPermissions;
    label: string;
    description: string;
  }[];
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

const defaultPermissions: CompanyPermissions = {
  canCreateJobPosts: true,
  canEditJobPosts: true,
  canDeleteJobPosts: true,
  canViewJobPosts: true,
  canUnlockCandidates: true,
  canViewCandidateProfiles: true,
  canViewCandidateAssessments: true,
  canDownloadCandidateResumes: true,
  canViewMatches: true,
  canAccessMatchingAlgorithm: true,
  canCreateHRAgents: false,
  canManageHRAgents: false,
  canViewHRAgentAnalytics: false,
  canConfigureRecruitmentFlow: true,
  canViewRecruitmentPipeline: true,
  canModifyInterviewStages: true,
  canPurchaseTokens: true,
  canViewTokenBalance: true,
  canTransferTokens: false,
  canViewCompanyAnalytics: true,
  canExportReports: true,
  canViewDashboardMetrics: true,
  canSendMessages: true,
  canScheduleInterviews: true,
  canSendAssessments: true,
};

const permissionCategories: PermissionCategory[] = [
  {
    name: 'Job Post Management',
    icon: '📋',
    permissions: [
      {
        key: 'canCreateJobPosts',
        label: 'Create Job Posts',
        description: 'Allow company to create new job postings',
      },
      {
        key: 'canEditJobPosts',
        label: 'Edit Job Posts',
        description: 'Allow company to edit existing job posts',
      },
      {
        key: 'canDeleteJobPosts',
        label: 'Delete Job Posts',
        description: 'Allow company to delete job posts',
      },
      {
        key: 'canViewJobPosts',
        label: 'View Job Posts',
        description: 'Allow company to view their job posts',
      },
    ],
  },
  {
    name: 'Candidate Access',
    icon: '👤',
    permissions: [
      {
        key: 'canUnlockCandidates',
        label: 'Unlock Candidates',
        description: 'Allow company to unlock candidate details using tokens',
      },
      {
        key: 'canViewCandidateProfiles',
        label: 'View Candidate Profiles',
        description: 'Allow company to view candidate profiles',
      },
      {
        key: 'canViewCandidateAssessments',
        label: 'View Assessments',
        description: 'Allow company to view candidate assessment results',
      },
      {
        key: 'canDownloadCandidateResumes',
        label: 'Download Resumes',
        description: 'Allow company to download candidate resumes',
      },
    ],
  },
  {
    name: 'Matching & Search',
    icon: '🔍',
    permissions: [
      {
        key: 'canViewMatches',
        label: 'View Matches',
        description: 'Allow company to view matching candidates',
      },
      {
        key: 'canAccessMatchingAlgorithm',
        label: 'Access Matching Algorithm',
        description: 'Allow company to use advanced matching features',
      },
    ],
  },
  {
    name: 'HR Agents (Premium)',
    icon: '🤖',
    permissions: [
      {
        key: 'canCreateHRAgents',
        label: 'Create HR Agents',
        description: 'Allow company to create AI HR agents',
      },
      {
        key: 'canManageHRAgents',
        label: 'Manage HR Agents',
        description: 'Allow company to configure and manage HR agents',
      },
      {
        key: 'canViewHRAgentAnalytics',
        label: 'View Agent Analytics',
        description: 'Allow company to view HR agent performance analytics',
      },
    ],
  },
  {
    name: 'Recruitment Flow',
    icon: '📊',
    permissions: [
      {
        key: 'canConfigureRecruitmentFlow',
        label: 'Configure Flow',
        description: 'Allow company to set up recruitment pipelines',
      },
      {
        key: 'canViewRecruitmentPipeline',
        label: 'View Pipeline',
        description: 'Allow company to view recruitment pipeline status',
      },
      {
        key: 'canModifyInterviewStages',
        label: 'Modify Interview Stages',
        description: 'Allow company to customize interview stages',
      },
    ],
  },
  {
    name: 'Token Management',
    icon: '💎',
    permissions: [
      {
        key: 'canPurchaseTokens',
        label: 'Purchase Tokens',
        description: 'Allow company to buy more tokens',
      },
      {
        key: 'canViewTokenBalance',
        label: 'View Balance',
        description: 'Allow company to view their token balance',
      },
      {
        key: 'canTransferTokens',
        label: 'Transfer Tokens',
        description: 'Allow company to transfer tokens to other accounts',
      },
    ],
  },
  {
    name: 'Analytics & Reports',
    icon: '📈',
    permissions: [
      {
        key: 'canViewCompanyAnalytics',
        label: 'View Analytics',
        description: 'Allow company to view their analytics dashboard',
      },
      {
        key: 'canExportReports',
        label: 'Export Reports',
        description: 'Allow company to export data and reports',
      },
      {
        key: 'canViewDashboardMetrics',
        label: 'View Metrics',
        description: 'Allow company to view dashboard metrics',
      },
    ],
  },
  {
    name: 'Communication',
    icon: '💬',
    permissions: [
      {
        key: 'canSendMessages',
        label: 'Send Messages',
        description: 'Allow company to send messages to candidates',
      },
      {
        key: 'canScheduleInterviews',
        label: 'Schedule Interviews',
        description: 'Allow company to schedule interviews',
      },
      {
        key: 'canSendAssessments',
        label: 'Send Assessments',
        description: 'Allow company to send assessment invitations',
      },
    ],
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
      if (data.success && data.permissions) {
        setPermissions({ ...defaultPermissions, ...data.permissions });
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

  const handleSelectAll = (category: PermissionCategory) => {
    const newPermissions = { ...permissions };
    const allEnabled = category.permissions.every((p) => permissions[p.key]);

    category.permissions.forEach((p) => {
      newPermissions[p.key] = !allEnabled;
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

            {/* Permission Categories */}
            {permissionCategories.map((category, idx) => (
              <Box key={idx} sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: 20 }}>{category.icon}</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151' }}>
                      {category.name}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    onClick={() => handleSelectAll(category)}
                    sx={{ textTransform: 'none' }}
                  >
                    {category.permissions.every((p) => permissions[p.key])
                      ? 'Deselect All'
                      : 'Select All'}
                  </Button>
                </Box>

                <FormGroup>
                  {category.permissions.map((perm) => (
                    <Box
                      key={perm.key}
                      sx={{
                        p: 2,
                        mb: 1,
                        borderRadius: 2,
                        border: '1px solid #E5E7EB',
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
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {perm.label}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#6B7280' }}>
                              {perm.description}
                            </Typography>
                          </Box>
                        }
                      />
                    </Box>
                  ))}
                </FormGroup>

                {idx < permissionCategories.length - 1 && <Divider sx={{ my: 2 }} />}
              </Box>
            ))}
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
