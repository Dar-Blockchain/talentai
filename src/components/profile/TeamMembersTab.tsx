import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import {
  Person as PersonIcon,
  BarChart as BarChartIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import AddMemberModal from '@/components/dashboard-company/AddMemberModal';
import EditRoleModal from '@/components/dashboard-company/EditRoleModal';
import PendingInvitationsList from '@/components/dashboard-company/PendingInvitationsList';
import TeamMembersHeader from './team-members/TeamMembersHeader';
import TeamMembersTable from './team-members/TeamMembersTable';
import TeamMembersEmptyState from './team-members/TeamMembersEmptyState';
import TeamMemberMenu from './team-members/TeamMemberMenu';
import DeleteMemberDialog from './team-members/DeleteMemberDialog';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store/store';
import {
  addEmployee,
  updateMemberRole,
  deleteMember,
  fetchMembers,
  fetchInvitations,
  resendInvitation,
  cancelInvitation,
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
  const {
    members,
    loading,
    error,
    sharedAccountId,
    addMemberSuccess,
    updateRoleSuccess,
    deleteMemberSuccess,
    invitations,
    fetchingInvitations,
  } = useSelector(selectMembers);
  const { showToast } = useToast();
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [editRoleModalOpen, setEditRoleModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Fetch members and invitations on mount
  useEffect(() => {
    console.log('🔍 [TeamMembersTab] Component mounted, fetching members and invitations...');
    dispatch(fetchMembers());
    dispatch(fetchInvitations());
  }, [dispatch]);

  // Close modal when member is added successfully
  useEffect(() => {
    if (addMemberSuccess) {
      setAddMemberModalOpen(false);
      dispatch(clearAddMemberSuccess());
      showToast({ message: 'Team member invited successfully!', severity: 'success' });
      // Refresh the invitations and members list
      dispatch(fetchInvitations());
      dispatch(fetchMembers());
    }
  }, [addMemberSuccess, dispatch]);

  // Close modal and refresh when role is updated successfully
  useEffect(() => {
    if (updateRoleSuccess) {
      setEditRoleModalOpen(false);
      setSelectedMember(null); // Clear selected member after successful update
      dispatch(clearUpdateRoleSuccess());
      showToast({ message: 'Member role updated successfully!', severity: 'success' });
      dispatch(fetchMembers());
    }
  }, [updateRoleSuccess, dispatch, showToast]);

  // Close dialog and refresh when member is deleted successfully
  useEffect(() => {
    if (deleteMemberSuccess) {
      setDeleteDialogOpen(false);
      setSelectedMember(null);
      dispatch(clearDeleteMemberSuccess());
      showToast({ message: 'Team member removed successfully!', severity: 'success' });
      dispatch(fetchMembers());
    }
  }, [deleteMemberSuccess, dispatch, showToast]);

  // Map UI roles to API roles
  const roleMapping: Record<string, MemberRole> = {
    'hr': 'RH',
    'technical_leader': 'TechLead',
    'supervisor': 'Supervisor',
    'manager': 'Manager'
  };

  // Extract sharedAccountId from members if available (needed for update/delete operations)
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

    console.log('🔍 [TeamMembersTab] handleAddMember - sending invitation');

    // Dispatch the add employee action (now sends invitation)
    const result = await dispatch(addEmployee({
      email,
      role: apiRole
    }));

    // Check if the action was rejected
    if (addEmployee.rejected.match(result)) {
      throw new Error(result.payload as string || 'Failed to send invitation');
    }
  }, [dispatch, roleMapping]);

  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, member: Member) => {
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleEditMember = useCallback(() => {
    console.log('🔵 [TeamMembersTab] Edit member:', selectedMember);
    setEditRoleModalOpen(true);
    setAnchorEl(null); // Close menu but keep selectedMember for the modal
  }, [selectedMember]);

  const handleUpdateRole = useCallback(async (role: string) => {
    console.log('🔵 [TeamMembersTab] handleUpdateRole called with role:', role);

    if (!selectedMember) {
      console.error('❌ [TeamMembersTab] Missing selectedMember');
      throw new Error('Unable to update role. Please try again.');
    }

    console.log('🔵 [TeamMembersTab] Updating role for membership:', selectedMember._id);
    console.log('🔵 [TeamMembersTab] User:', selectedMember.user._id);

    await dispatch(updateMemberRole({
      membershipId: selectedMember._id,
      role: role as MemberRole
    })).unwrap();
  }, [dispatch, selectedMember]);

  const handleDeleteMember = useCallback(() => {
    console.log('🔵 [TeamMembersTab] Opening delete confirmation for member:', selectedMember);
    setDeleteDialogOpen(true);
    // Don't clear selectedMember yet - we need it for the delete operation
    setAnchorEl(null);
  }, [selectedMember]);

  const handleConfirmDelete = useCallback(async () => {
    console.log('🔵 [TeamMembersTab] Confirming delete for member:', selectedMember);

    if (!selectedMember) {
      console.error('❌ [TeamMembersTab] Missing selectedMember');
      return;
    }

    console.log('🔵 [TeamMembersTab] Deleting membership:', selectedMember._id);
    console.log('🔵 [TeamMembersTab] User:', selectedMember.user._id);

    try {
      await dispatch(deleteMember({
        membershipId: selectedMember._id
      })).unwrap();
    } catch (error) {
      console.error('❌ [TeamMembersTab] Failed to delete member:', error);
    }
  }, [dispatch, selectedMember]);

  const handleCancelDelete = useCallback(() => {
    setDeleteDialogOpen(false);
    setSelectedMember(null);
  }, []);

  // Invitation handlers (using local state - temporary)
  const handleResendInvitation = useCallback(async (invitationId: string) => {
    console.log('🔵 [TeamMembersTab] Resending invitation:', invitationId);
    try {
      await dispatch(resendInvitation(invitationId)).unwrap();
      showToast({ message: 'Invitation resent successfully!', severity: 'success' });
    } catch (error) {
      console.error('Failed to resend invitation:', error);
      showToast({ message: 'Failed to resend invitation', severity: 'error' });
    }
  }, [dispatch, showToast]);

  const handleCancelInvitation = useCallback(async (invitationId: string) => {
    console.log('🔵 [TeamMembersTab] Cancelling invitation:', invitationId);
    try {
      await dispatch(cancelInvitation(invitationId)).unwrap();
      showToast({ message: 'Invitation cancelled successfully!', severity: 'success' });
    } catch (error) {
      console.error('Failed to cancel invitation:', error);
      showToast({ message: 'Failed to cancel invitation', severity: 'error' });
    }
  }, [dispatch, showToast]);

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

  // Memoize empty state check
  const hasMembers = useMemo(() => members.length > 0, [members.length]);

  // Check if user has owner role in members
  const hasOwnerRole = useMemo(() => {
    return members.some(member => member.role === 'Owner');
  }, [members]);

  // Debug render
  console.log('🎨 [TeamMembersTab] RENDERING - sharedAccountId:', sharedAccountId);
  console.log('🎨 [TeamMembersTab] accountIdFromMembers:', accountIdFromMembers);
  console.log('🎨 [TeamMembersTab] effectiveAccountId:', effectiveAccountId);
  console.log('🎨 [TeamMembersTab] hasOwnerRole:', hasOwnerRole);

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', mb: 3 }}>
      <CardContent sx={{ p: 4 }}>      {/* Header */}
        <TeamMembersHeader
          showActivateButton={false}
          activating={false}
          onActivateAccount={() => {}}
          onAddMember={handleOpenAddModal}
        />

        {/* Loading State */}
        {loading ? (
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            py: 8,
            borderRadius: 3,
            border: '1px solid #e5e7eb',
            bgcolor: 'white'
          }}>
            <CircularProgress sx={{ color: '#8310FF' }} />
          </Box>
        ) : error ? (
          /* Error State */
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        ) : !hasMembers ? (
          /* Empty State */
          <TeamMembersEmptyState />
        ) : (
          /* Members Table */
          <TeamMembersTable
            members={members}
            onMenuOpen={handleMenuOpen}
            getRoleLabel={getRoleLabel}
            getRoleColor={getRoleColor}
            getStatusColor={getStatusColor}
            getRoleIcon={getRoleIcon}
          />
        )}

        {/* Pending Invitations */}
        {invitations.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <PendingInvitationsList
              invitations={invitations}
              loading={fetchingInvitations}
              error={null}
              onResend={handleResendInvitation}
              onCancel={handleCancelInvitation}
            />
          </Box>
        )}

        {/* Context Menu */}
        <TeamMemberMenu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onEditClick={handleEditMember}
          onDeleteClick={handleDeleteMember}
        />

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
            onClose={() => {
              setEditRoleModalOpen(false);
              setSelectedMember(null);
            }}
            onSave={handleUpdateRole}
            currentRole={selectedMember.role}
            memberName={selectedMember.user?.username || selectedMember.user?.email || 'Member'}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <DeleteMemberDialog
          open={deleteDialogOpen}
          memberName={selectedMember?.user?.username || selectedMember?.user?.email || 'this member'}
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
        />
      </CardContent>
    </Card>

  );
};

export default React.memo(TeamMembersTab);
