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

interface TeamMember {
  _id: string;
  email: string;
  name?: string;
  role: string;
  status: 'active' | 'pending' | 'inactive';
  joinedDate?: string;
  avatar?: string;
}

// Constants moved outside component
const ROLE_LABELS: Record<string, string> = {
  hr: 'HR',
  technical_leader: 'Technical Leader',
};

const ROLE_COLORS: Record<string, 'primary' | 'success' | 'info' | 'default'> = {
  hr: 'success',
  technical_leader: 'primary',
};

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'error'> = {
  active: 'success',
  pending: 'warning',
  inactive: 'error',
};

const ROLE_ICONS: Record<string, React.ReactElement> = {
  hr: <PersonIcon sx={{ fontSize: 18 }} />,
  technical_leader: <BarChartIcon sx={{ fontSize: 18 }} />,
};

const TeamMembersTab: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/company/team-members');
        // const data = await response.json();

        // Mock data for demonstration
        setTimeout(() => {
          setMembers([
            {
              _id: '1',
              email: 'john.doe@company.com',
              name: 'John Doe',
              role: 'hr',
              status: 'active',
              joinedDate: '2024-01-15',
            },
            {
              _id: '2',
              email: 'jane.smith@company.com',
              name: 'Jane Smith',
              role: 'technical_leader',
              status: 'active',
              joinedDate: '2024-02-01',
            },
            {
              _id: '3',
              email: 'mike.johnson@company.com',
              name: 'Mike Johnson',
              role: 'hr',
              status: 'pending',
              joinedDate: '2024-03-10',
            },
          ]);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to load team members');
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const handleAddMember = useCallback(async (email: string, role: string) => {
    // TODO: Implement API call to invite team member
    console.log('Inviting member:', { email, role });

    // Simulated API call
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // Add new member to the list
        const newMember: TeamMember = {
          _id: Date.now().toString(),
          email,
          role,
          status: 'pending',
          joinedDate: new Date().toISOString().split('T')[0],
        };
        setMembers((prev) => [...prev, newMember]);
        resolve();
      }, 1000);
    });
  }, []);

  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, member: TeamMember) => {
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setSelectedMember(null);
  }, []);

  const handleEditMember = useCallback(() => {
    console.log('Edit member:', selectedMember);
    handleMenuClose();
    // TODO: Implement edit functionality
  }, [selectedMember, handleMenuClose]);

  const handleDeleteMember = useCallback(() => {
    if (selectedMember) {
      setMembers((prev) => prev.filter((m) => m._id !== selectedMember._id));
    }
    handleMenuClose();
    // TODO: Implement API call to delete member
  }, [selectedMember, handleMenuClose]);

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
        </Box>

        {/* Error Alert */}
        {error && (
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
                          src={member.avatar}
                          sx={{
                            bgcolor: '#8310FF',
                            width: 40,
                            height: 40,
                          }}
                        >
                          {member.name?.[0] || member.email[0].toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                            {member.name || 'Pending'}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <EmailIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                              {member.email}
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
                        {member.joinedDate
                          ? new Date(member.joinedDate).toLocaleDateString('en-US', {
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
      </CardContent>
    </Card>
  );
};

export default React.memo(TeamMembersTab);
