import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Avatar,
  Chip,
  IconButton,
  Typography,
  Tooltip,
  Stack,
  styled,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  LocationOn as LocationIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store/store';
import {
  fetchAdminUsers,
  selectAdminUsers,
  selectAdminUsersLoading,
  selectAdminUsersError,
  selectAdminTotalUsers,
} from '@/store/slices/adminSlice';

// Types
import { User, UserFilters } from '../../types/admin';
// Hooks
import { usePagination } from '../../hooks/usePagination';
// Utils
import { getRoleColor } from '../../utils/colorMappings';

const GREEN_MAIN = '#8310FF';

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 800,
  color: '#1a1a2e',
  marginBottom: theme.spacing(4),
  letterSpacing: '-0.5px',
  position: 'relative' as const,
  lineHeight: 1.1,
  paddingBottom: theme.spacing(2),
  '&:after': {
    content: '""',
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    width: '60px',
    height: '4px',
    background: 'linear-gradient(90deg, #8310FF 0%, #00FFC3 100%)',
    borderRadius: '2px',
  },
}));

const StyledCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '20px',
  boxShadow: '0 4px 24px rgba(131,16,255,0.06)',
  border: '1px solid #ece6fa',
  backgroundColor: '#ffffff',
}));

interface UserManagementProps {
  onUserSelect?: (user: User) => void;
  onUserEdit?: (user: User) => void;
  onUserDelete?: (userId: string) => void;
  onManagePermissions?: (user: User) => void;
  initialFilters?: Partial<UserFilters>;
}

/**
 * UserManagement Component
 * Handles user listing, filtering, and management operations
 * Extracted from admin.tsx for better modularity
 */
const UserManagement: React.FC<UserManagementProps> = ({
  onUserSelect,
  onUserEdit,
  onUserDelete,
  onManagePermissions,
  initialFilters = {},
}) => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const users = useSelector(selectAdminUsers) as User[];
  const totalUsers = useSelector(selectAdminTotalUsers);
  const loading = useSelector(selectAdminUsersLoading);
  const error = useSelector(selectAdminUsersError);

  // Filters
  const [usernameFilter, setUsernameFilter] = useState(initialFilters.username || '');
  const [emailFilter, setEmailFilter] = useState(initialFilters.email || '');
  const [roleFilter, setRoleFilter] = useState(initialFilters.role || '');
  const [statusFilter, setStatusFilter] = useState(initialFilters.status || '');

  // Pagination - using custom hook
  const {
    page,
    rowsPerPage,
    handleChangePage: onPageChange,
    handleChangeRowsPerPage: onRowsPerPageChange,
  } = usePagination({ initialRowsPerPage: 10 });

  const dispatchFetchUsers = useCallback(
    (overrides?: { page?: number; limit?: number }) => {
      dispatch(
        fetchAdminUsers({
          page: overrides?.page ?? page + 1,
          limit: overrides?.limit ?? rowsPerPage,
          username: usernameFilter || undefined,
          email: emailFilter || undefined,
          role: roleFilter || undefined,
          status: statusFilter || undefined,
        })
      );
    },
    [dispatch, page, rowsPerPage, usernameFilter, emailFilter, roleFilter, statusFilter]
  );

  const handleChangePage = useCallback(
    (event: unknown, newPage: number) => {
      onPageChange(event, newPage);
      dispatchFetchUsers({ page: newPage + 1 });
    },
    [onPageChange, dispatchFetchUsers]
  );

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newRowsPerPage = parseInt(event.target.value, 10);
      onRowsPerPageChange(event);
      dispatchFetchUsers({ page: 1, limit: newRowsPerPage });
    },
    [onRowsPerPageChange, dispatchFetchUsers]
  );

  const handleResetFilters = useCallback(() => {
    setUsernameFilter('');
    setEmailFilter('');
    setRoleFilter('');
    setStatusFilter('');
  }, []);

  const handleApplyFilters = useCallback(() => {
    dispatchFetchUsers({ page: 1 });
  }, [dispatchFetchUsers]);

  // Fetch users on mount and when filters change
  useEffect(() => {
    dispatchFetchUsers();
  }, [dispatchFetchUsers]);

  return (
    <Box>
      {/* Header with action buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <SectionTitle>User Management</SectionTitle>
       
      </Box>

      {/* Filter Card */}
      <StyledCard sx={{ mb: 3, p: { xs: 2, md: 3 }, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <TextField
          label="Username"
          variant="outlined"
          size="small"
          value={usernameFilter}
          onChange={(e) => setUsernameFilter(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
          sx={{ minWidth: 160 }}
        />
        <TextField
          label="Email"
          variant="outlined"
          size="small"
          value={emailFilter}
          onChange={(e) => setEmailFilter(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
          sx={{ minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Role</InputLabel>
          <Select value={roleFilter} label="Role" onChange={(e) => setRoleFilter(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Candidate">Candidate</MenuItem>
            <MenuItem value="Company">Company</MenuItem>
            <MenuItem value="Admin">Admin</MenuItem>
          </Select>
        </FormControl>

        <Button variant="contained" onClick={handleApplyFilters} sx={{ backgroundColor: GREEN_MAIN }}>
          Apply Filters
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleResetFilters} sx={{ ml: 'auto' }}>
          Reset Filters
        </Button>
      </StyledCard>

      {/* Error Display */}
      {error && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {/* Users Table */}
      <TableContainer component={Paper} sx={{ borderRadius: '16px', boxShadow: '0 2px 12px rgba(131,16,255,0.04)', border: '1px solid #ece6fa' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f3ff' }}>
              <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Last Login</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography>Loading users...</Typography>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="textSecondary">No users found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id} hover sx={{ '&:hover': { backgroundColor: '#faf8ff' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: GREEN_MAIN }}>
                        {user.username.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        {user.profile?.firstName && user.profile?.lastName ? (
                          <>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {user.profile.firstName} {user.profile.lastName}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              @{user.username}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {user.username}
                          </Typography>
                        )}
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={getRoleColor(user.role) as any}
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isVerified ? 'Verified' : 'Pending'}
                      color={user.isVerified ? 'success' : 'warning'}
                      size="small"
                      icon={user.isVerified ? <CheckCircleIcon /> : <PendingIcon />}
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      {user.Localisation ? (
                        <>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            {user.Localisation}
                          </Typography>
                          {user.ip && (
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                              IP: {user.ip}
                            </Typography>
                          )}
                        </>
                      ) : (
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                          No location data
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{new Date(user.createdAt).toLocaleDateString()}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => onUserSelect?.(user)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit User">
                        <IconButton size="small" onClick={() => onUserEdit?.(user)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      {user.role === 'Company' && onManagePermissions && (
                        <Tooltip title="Manage Permissions">
                          <IconButton
                            size="small"
                            onClick={() => onManagePermissions(user)}
                            sx={{
                              color: '#8310FF',
                              '&:hover': {
                                bgcolor: 'rgba(131, 16, 255, 0.1)',
                              }
                            }}
                          >
                            <SecurityIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete User">
                        <IconButton size="small" color="error" onClick={() => onUserDelete?.(user._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalUsers}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};

export default React.memo(UserManagement);
