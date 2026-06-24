import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { Badge } from '@/modules/shared/ui/shadcn/badge';
import { cn } from '@/lib/utils';
import { Permission, DEFAULT_PERMISSIONS } from '@/types/permissions';
import { getToken } from '@/modules/auth/shared/utils/token';
import { ADMIN_ACCENT } from '@/modules/admin/shared';

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
      const token = getToken();
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
      <div
        className="relative px-6 pt-6 pb-6"
        style={{ background: ADMIN_ACCENT }}
      >
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 12, right: 12, color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
        <div className="flex items-center gap-3">
          <SecurityIcon style={{ fontSize: 28, color: 'rgba(255,255,255,0.9)' }} />
          <div>
            <h2 className="text-[1.15rem] font-bold text-white">Company Permissions</h2>
            <p className="text-[13px] text-white/70">
              {getCompanyName()} &middot; {company?.email}
            </p>
          </div>
        </div>
      </div>

      <DialogContent sx={{ p: 0 }}>
        {/* Summary Bar */}
        <div className="px-6 py-4 bg-indigo-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-[14px] font-semibold text-slate-900">
              {enabledCount} of {totalCount} enabled
            </div>
            <div className="text-[12px] text-slate-500">
              {Math.round((enabledCount / totalCount) * 100)}% access level
            </div>
          </div>
          <Badge
            variant="outline"
            className="cursor-pointer border-slate-200 bg-white font-semibold text-indigo-600 hover:bg-indigo-50"
            onClick={handleSelectAll}
          >
            {Object.values(permissions).every(Boolean) ? 'Deselect All' : 'Select All'}
          </Badge>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <CircularProgress sx={{ color: ADMIN_ACCENT }} />
          </div>
        ) : (
          <div className="px-3 py-3">
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
                <div
                  key={perm.key}
                  onClick={() => handlePermissionChange(perm.key)}
                  className={cn(
                    "flex items-center gap-3 mx-1 mb-2 px-3 py-3 rounded-xl border-[1.5px] cursor-pointer transition-all duration-150 hover:border-indigo-300 hover:bg-indigo-50",
                    isEnabled ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white",
                  )}
                >
                  <span className="text-[22px] leading-none">{perm.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-slate-900">{perm.label}</div>
                    <div className="text-[11px] text-slate-500 leading-[1.3]">{perm.description}</div>
                  </div>
                  <Checkbox
                    checked={isEnabled}
                    size="small"
                    sx={{
                      color: '#CBD5E1',
                      '&.Mui-checked': { color: ADMIN_ACCENT },
                      p: 0,
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => handlePermissionChange(perm.key)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', gap: 1.5 }}>
        <Button
          onClick={onClose}
          disabled={saving}
          variant="outlined"
          sx={{
            textTransform: 'none',
            borderColor: '#E2E8F0',
            color: '#64748B',
            borderRadius: '10px',
            '&:hover': { borderColor: '#CBD5E1', backgroundColor: 'white' },
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
            backgroundColor: ADMIN_ACCENT,
            borderRadius: '10px',
            fontWeight: 600,
            '&:hover': { backgroundColor: '#4338CA' },
          }}
        >
          {saving ? 'Saving...' : 'Save Permissions'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CompanyPermissionsModal;
