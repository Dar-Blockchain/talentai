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
} from '@mui/icons-material';

// Types
import { User, UserFilters, FetchUsersParams, FetchUsersResponse } from '../../types/admin';

// Hooks
import { usePagination } from '../../hooks/usePagination';
import { useAuthToken } from '../../hooks/useAuthToken';

// Utils
import { getRoleColor } from '../../utils/colorMappings';

const GREEN_MAIN = '#7851a9';

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 600,
  color: '#333',
  marginBottom: theme.spacing(2),
}));

const StyledCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  backgroundColor: '#ffffff',
}));

interface UserManagementProps {
  onUserSelect?: (user: User) => void;
  onUserEdit?: (user: User) => void;
  onUserDelete?: (userId: string) => void;
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
  initialFilters = {},
}) => {
  // Auth
  const { token, isAuthenticated } = useAuthToken();

  // State
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  /**
   * Fetch users from API with filters and pagination
   */
  const fetchUsers = useCallback(
    async (params?: Partial<FetchUsersParams>) => {
      if (!isAuthenticated || !token) {
        setError('Authentication required');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams({
          page: String(params?.page ?? page + 1), // API uses 1-based pagination
          limit: String(params?.limit ?? rowsPerPage),
        });

        // Add filters if present
        const username = params?.username ?? usernameFilter;
        const email = params?.email ?? emailFilter;
        const role = params?.role ?? roleFilter;
        const status = params?.status ?? statusFilter;

        if (username) queryParams.append('username', username);
        if (email) queryParams.append('email', email);
        if (role) queryParams.append('role', role);
        if (status) queryParams.append('status', status);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}dashboard/getAllUsers?${queryParams.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.status}`);
        }

        const data: FetchUsersResponse = await response.json();
        setUsers(data.users || []);
        setTotalUsers(data.total || 0);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load users';
        setError(errorMessage);
        console.error('Fetch users error:', err);
      } finally {
        setLoading(false);
      }
    },
    [token, isAuthenticated, page, rowsPerPage, usernameFilter, emailFilter, roleFilter, statusFilter]
  );

  /**
   * Handle page change
   */
  const handleChangePage = useCallback(
    (event: unknown, newPage: number) => {
      onPageChange(event, newPage);
      fetchUsers({ page: newPage + 1 });
    },
    [onPageChange, fetchUsers]
  );

  /**
   * Handle rows per page change
   */
  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newRowsPerPage = parseInt(event.target.value, 10);
      onRowsPerPageChange(event);
      fetchUsers({ page: 1, limit: newRowsPerPage });
    },
    [onRowsPerPageChange, fetchUsers]
  );

  /**
   * Reset all filters
   */
  const handleResetFilters = useCallback(() => {
    setUsernameFilter('');
    setEmailFilter('');
    setRoleFilter('');
    setStatusFilter('');
  }, []);

  /**
   * Apply filters and fetch
   */
  const handleApplyFilters = useCallback(() => {
    fetchUsers({ page: 1 });
  }, [fetchUsers]);

  /**
   * Download Excel handlers
   */
  const handleDownloadExcel = useCallback(
    async (endpoint: string, filename: string) => {
      if (!token) return;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}dashboard/${endpoint}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Download failed');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Download error:', err);
        setError('Failed to download Excel file');
      }
    },
    [token]
  );

  // Fetch users on mount and when filters change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <Box>
      {/* Header with action buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <SectionTitle>User Management</SectionTitle>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => handleDownloadExcel('downloadUserExcel', 'users.xlsx')}
            disabled={!isAuthenticated}
          >
            Download All Users Excel
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleDownloadExcel('download-users-with-assessment-zero', 'users_with_score_0.xlsx')}
            disabled={!isAuthenticated}
          >
            Download Users with Assessment 0
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleDownloadExcel('download-users-with-assessment-Above50', 'users_with_score_above_50.xlsx')}
            disabled={!isAuthenticated}
          >
            Download Users with Assessment ≥ 50
          </Button>
        </Box>
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
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.50' }}>
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
                <TableRow key={user._id} hover>
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
