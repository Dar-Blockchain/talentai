import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Avatar,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import AddMemberModal from '@/components/dashboard-company/AddMemberModal';
import EditRoleModal from '@/components/dashboard-company/EditRoleModal';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store/store';
import {
  fetchMyEmployees,
  addEmployee,
  activateSharedAccount,
  updateMemberRole,
  deleteMember,
  selectMembers,
  clearAddMemberSuccess,
  clearUpdateRoleSuccess,
  clearDeleteMemberSuccess,
  Member,
  MemberRole
} from '@/store/slices/memberSlice';
import { useToast } from '@/hooks/useToast';

// Constants moved outside component
const ROLE_LABELS: Record<string, string> = {
  RH: 'HR',
  TechLead: 'Technical Leader',
  Supervisor: 'Supervisor',
  Manager: 'Manager',
  Owner: 'Owner',
  hr: 'HR',
  technical_leader: 'Technical Leader',
};

const ROLE_COLORS: Record<string, 'primary' | 'success' | 'info' | 'default'> = {
  RH: 'success',
  TechLead: 'primary',
  Supervisor: 'info',
  Manager: 'primary',
  Owner: 'default',
  hr: 'success',
  technical_leader: 'primary',
};

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'error'> = {
  active: 'success',
  pending: 'warning',
  inactive: 'error',
};

const ROLE_ICONS: Record<string, React.ReactElement> = {
  RH: <PersonIcon sx={{ fontSize: 18 }} />,
  TechLead: <BarChartIcon sx={{ fontSize: 18 }} />,
  Supervisor: <BarChartIcon sx={{ fontSize: 18 }} />,
  Manager: <BarChartIcon sx={{ fontSize: 18 }} />,
  Owner: <PersonAddIcon sx={{ fontSize: 18 }} />,
  hr: <PersonIcon sx={{ fontSize: 18 }} />,
  technical_leader: <BarChartIcon sx={{ fontSize: 18 }} />,
};

const TeamMembersTab: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { members, loading, error, sharedAccountId, addMemberSuccess, updateRoleSuccess, deleteMemberSuccess } = useSelector(selectMembers);
  const { showToast } = useToast();
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [editRoleModalOpen, setEditRoleModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [activating, setActivating] = useState(false);

  // Fetch members on mount - always try to fetch
  useEffect(() => {
    console.log('🔍 [TeamMembersTab] Component mounted, fetching employees...');
    console.log('🔍 [TeamMembersTab] sharedAccountId:', sharedAccountId);
    dispatch(fetchMyEmployees());
  }, [dispatch]);

  // Close modal when member is added successfully
  useEffect(() => {
    if (addMemberSuccess) {
      setAddMemberModalOpen(false);
      dispatch(clearAddMemberSuccess());
      // Refresh the member list
      dispatch(fetchMyEmployees());
    }
  }, [addMemberSuccess, dispatch]);

  // Close modal and refresh when role is updated successfully
  useEffect(() => {
    if (updateRoleSuccess) {
      setEditRoleModalOpen(false);
      dispatch(clearUpdateRoleSuccess());
      // Refresh the member list
      dispatch(fetchMyEmployees());
    }
  }, [updateRoleSuccess, dispatch]);

  // Close dialog and refresh when member is deleted successfully
  useEffect(() => {
    if (deleteMemberSuccess) {
      setDeleteDialogOpen(false);
      setSelectedMember(null);
      dispatch(clearDeleteMemberSuccess());
      // The member is already removed from state, but we can refresh to ensure sync
      dispatch(fetchMyEmployees());
    }
  }, [deleteMemberSuccess, dispatch]);

  // Map UI roles to API roles
  const roleMapping: Record<string, MemberRole> = {
    'hr': 'RH',
    'technical_leader': 'TechLead',
    'supervisor': 'Supervisor',
    'manager': 'Manager'
  };

  // Extract sharedAccountId from members if available
  const accountIdFromMembers = useMemo(() => {
    if (members.length > 0 && members[0].Organization) {
      return members[0].Organization;
    }
    return null;
  }, [members]);

  // Use sharedAccountId from Redux or extract from members
  const effectiveAccountId = sharedAccountId || accountIdFromMembers;

  const handleAddMember = useCallback(async (email: string, role: string) => {
    console.log('Inviting member:', { email, role });

    // Map the role to API format
    const apiRole = roleMapping[role] || 'RH';

    // Use the effective account ID (from Redux or extracted from members)
    const accountId = effectiveAccountId || '';

    console.log('🔍 [TeamMembersTab] handleAddMember - accountId:', accountId);
    console.log('🔍 [TeamMembersTab] handleAddMember - sharedAccountId:', sharedAccountId);
    console.log('🔍 [TeamMembersTab] handleAddMember - accountIdFromMembers:', accountIdFromMembers);

    if (!accountId) {
      throw new Error('Account ID not found. Please try again.');
    }

    // Dispatch the add employee action
    const result = await dispatch(addEmployee({
      accountId,
      email,
      role: apiRole
    }));

    // Check if the action was rejected
    if (addEmployee.rejected.match(result)) {
      throw new Error(result.payload as string || 'Failed to add member');
    }
  }, [dispatch, effectiveAccountId, sharedAccountId, accountIdFromMembers, roleMapping]);

  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, member: Member) => {
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setSelectedMember(null);
  }, []);

  const handleEditMember = useCallback(() => {
    console.log('🔵 [TeamMembersTab] Edit member:', selectedMember);
    setEditRoleModalOpen(true);
    handleMenuClose();
  }, [selectedMember, handleMenuClose]);

  const handleUpdateRole = useCallback(async (role: string) => {
    console.log('🔵 [TeamMembersTab] handleUpdateRole called with role:', role);

    if (!selectedMember || !effectiveAccountId) {
      console.error('❌ [TeamMembersTab] Missing selectedMember or effectiveAccountId');
      throw new Error('Unable to update role. Please try again.');
    }

    console.log('🔵 [TeamMembersTab] Updating role for user:', selectedMember.user._id);
    console.log('🔵 [TeamMembersTab] Organization:', effectiveAccountId);

    await dispatch(updateMemberRole({
      organizationId: effectiveAccountId,
      userId: selectedMember.user._id,
      role: role as MemberRole
    })).unwrap();
  }, [dispatch, selectedMember, effectiveAccountId]);

  const handleDeleteMember = useCallback(() => {
    console.log('🔵 [TeamMembersTab] Opening delete confirmation for member:', selectedMember);
    setDeleteDialogOpen(true);
    // Don't clear selectedMember yet - we need it for the delete operation
    setAnchorEl(null);
  }, [selectedMember]);

  const handleConfirmDelete = useCallback(async () => {
    console.log('🔵 [TeamMembersTab] Confirming delete for member:', selectedMember);

    if (!selectedMember || !effectiveAccountId) {
      console.error('❌ [TeamMembersTab] Missing selectedMember or effectiveAccountId');
      return;
    }

    console.log('🔵 [TeamMembersTab] Deleting member:', selectedMember.user._id);
    console.log('🔵 [TeamMembersTab] Organization:', effectiveAccountId);

    try {
      await dispatch(deleteMember({
        organizationId: effectiveAccountId,
        userId: selectedMember.user._id
      })).unwrap();
    } catch (error) {
      console.error('❌ [TeamMembersTab] Failed to delete member:', error);
    }
  }, [dispatch, selectedMember, effectiveAccountId]);

  const handleCancelDelete = useCallback(() => {
    setDeleteDialogOpen(false);
    setSelectedMember(null);
  }, []);

  // Memoized helper functions
  const getRoleLabel = useCallback((role: string) => ROLE_LABELS[role] || role, []);
  const getRoleColor = useCallback((role: string): 'primary' | 'success' | 'info' | 'default' =>
    ROLE_COLORS[role] || 'default', []);
  const getStatusColor = useCallback((status: string): 'success' | 'warning' | 'error' =>
    STATUS_COLORS[status] || 'warning', []);
  const getRoleIcon = useCallback((role: string): React.ReactElement =>
    ROLE_ICONS[role] || <PersonIcon sx={{ fontSize: 18 }} />, []);

  const handleOpenAddModal = useCallback(() => {
    setAddMemberModalOpen(true);
  }, []);

  const handleCloseAddModal = useCallback(() => {
    setAddMemberModalOpen(false);
  }, []);

  const handleActivateAccount = useCallback(async () => {
    console.log('🔵 [TeamMembersTab] Activating shared account...');
    setActivating(true);
    try {
      await dispatch(activateSharedAccount()).unwrap();
      console.log('✅ [TeamMembersTab] Shared account activated successfully');
      // Fetch employees after activation
      dispatch(fetchMyEmployees());
    } catch (err: any) {
      console.error('❌ [TeamMembersTab] Failed to activate shared account:', err);
    } finally {
      setActivating(false);
    }
  }, [dispatch]);

  // Memoize empty state check
  const hasMembers = useMemo(() => members.length > 0, [members.length]);

  // Check if user has owner role in members
  const hasOwnerRole = useMemo(() => {
    return members.some(member => member.role === 'Owner');
  }, [members]);

  // Show activation button only if no account ID AND no owner role
  const showActivateButton = !effectiveAccountId && !hasOwnerRole;

  // Debug render
  console.log('🎨 [TeamMembersTab] RENDERING - sharedAccountId:', sharedAccountId);
  console.log('🎨 [TeamMembersTab] accountIdFromMembers:', accountIdFromMembers);
  console.log('🎨 [TeamMembersTab] effectiveAccountId:', effectiveAccountId);
  console.log('🎨 [TeamMembersTab] hasOwnerRole:', hasOwnerRole);
  console.log('🎨 [TeamMembersTab] showActivateButton:', showActivateButton);

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', mb: 3 }}>
      <CardContent sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 0.5 }}>
              Team Members
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Manage your team members and their permissions
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {showActivateButton ? (
              <Button
                variant="contained"
                onClick={handleActivateAccount}
                disabled={activating}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 3,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)',
                  },
                  '&.Mui-disabled': {
                    background: '#e2e8f0',
                    color: '#94a3b8',
                  },
                }}
              >
                {activating ? (
                  <>
                    <CircularProgress size={18} sx={{ mr: 1, color: 'white' }} />
                    Activating...
                  </>
                ) : (
                  'Activate Shared Account'
                )}
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={handleOpenAddModal}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 3,
                  background: 'linear-gradient(135deg, #8310FF 0%, #a855f7 100%)',
                  boxShadow: '0 4px 12px rgba(131, 16, 255, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #6b0fd9 0%, #9333ea 100%)',
                    boxShadow: '0 6px 16px rgba(131, 16, 255, 0.4)',
                  },
                }}
              >
                Add Member
              </Button>
            )}
          </Box>
        </Box>

        {/* Error Alert */}
        {error && typeof error === 'string' && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#8310FF' }} />
          </Box>
        ) : !hasMembers ? (
          /* Empty State */
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 4,
              backgroundColor: '#f8fafc',
              borderRadius: 3,
            }}
          >
            <PersonAddIcon sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#64748b', mb: 1 }}>
              No team members yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
              Get started by inviting your first team member
            </Typography>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={handleOpenAddModal}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                background: 'linear-gradient(135deg, #8310FF 0%, #a855f7 100%)',
              }}
            >
              Add Member
            </Button>
          </Box>
        ) : (
          /* Members Table */
          <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e5e7eb', borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Member</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Joined Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b' }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.map((member) => (
                  <TableRow
                    key={member._id}
                    sx={{
                      '&:hover': {
                        backgroundColor: '#f8fafc',
                      },
                    }}
                  >
                    {/* Member Info */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: '#8310FF',
                            width: 40,
                            height: 40,
                          }}
                        >
                          {member.user?.username?.[0]?.toUpperCase() || member.user?.email?.[0]?.toUpperCase() || 'U'}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                            {member.user?.username || 'Pending'}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <EmailIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                              {member.user?.email || 'No email'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Role */}
                    <TableCell>
                      <Chip
                        icon={getRoleIcon(member.role)}
                        label={getRoleLabel(member.role)}
                        color={getRoleColor(member.role)}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.8rem',
                        }}
                      />
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Chip
                        label={member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                        color={getStatusColor(member.status)}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      />
                    </TableCell>

                    {/* Joined Date */}
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        {member.createdAt
                          ? new Date(member.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'N/A'}
                      </Typography>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, member)}
                        sx={{
                          color: '#64748b',
                          '&:hover': {
                            backgroundColor: 'rgba(131, 16, 255, 0.08)',
                            color: '#8310FF',
                          },
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          slotProps={{
            paper: {
              sx: {
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                minWidth: 180,
              },
            },
          }}
        >
          <MenuItem onClick={handleEditMember}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit Role</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleDeleteMember} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Remove</ListItemText>
          </MenuItem>
        </Menu>

        {/* Add Member Modal */}
        <AddMemberModal
          open={addMemberModalOpen}
          onClose={handleCloseAddModal}
          onSave={handleAddMember}
        />

        {/* Edit Role Modal */}
        {selectedMember && (
          <EditRoleModal
            open={editRoleModalOpen}
            onClose={() => setEditRoleModalOpen(false)}
            onSave={handleUpdateRole}
            currentRole={selectedMember.role}
            memberName={selectedMember.user?.username || selectedMember.user?.email || 'Member'}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleCancelDelete}
          maxWidth="xs"
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
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#1a1a1a',
              pb: 1,
            }}
          >
            Remove Team Member
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: '#64748b', fontSize: '0.95rem' }}>
              Are you sure you want to remove{' '}
              <strong>
                {selectedMember?.user?.username || selectedMember?.user?.email || 'this member'}
              </strong>{' '}
              from your team? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button
              onClick={handleCancelDelete}
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
              onClick={handleConfirmDelete}
              variant="contained"
              color="error"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(239, 68, 68, 0.4)',
                },
              }}
            >
              Remove
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default React.memo(TeamMembersTab);
