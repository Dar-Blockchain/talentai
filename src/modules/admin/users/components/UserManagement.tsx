import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
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
  InputAdornment,
  Tab,
  Tabs,
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
  Search as SearchIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  AdminPanelSettings as AdminIcon,
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
import { User, UserFilters } from '../../../types/admin';
// Hooks
import { usePagination } from '../../../hooks/usePagination';
// Utils
import { getRoleColor } from '../../../utils/colorMappings';

const PRIMARY = '#8310FF';

const StyledTabs = styled(Tabs)({
  minHeight: 40,
  '& .MuiTabs-indicator': {
    backgroundColor: PRIMARY,
    height: 3,
    borderRadius: '3px 3px 0 0',
  },
});

const StyledTab = styled(Tab)({
  minHeight: 40,
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.85rem',
  color: '#6c6c80',
  padding: '8px 16px',
  '&.Mui-selected': {
    color: PRIMARY,
  },
});

interface UserManagementProps {
  onUserSelect?: (user: User) => void;
  onUserEdit?: (user: User) => void;
  onUserDelete?: (userId: string) => void;
  onManagePermissions?: (user: User) => void;
  initialFilters?: Partial<UserFilters>;
}

const UserManagement: React.FC<UserManagementProps> = ({
  onUserSelect,
  onUserEdit,
  onUserDelete,
  onManagePermissions,
  initialFilters = {},
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const users = useSelector(selectAdminUsers) as User[];
  const totalUsers = useSelector(selectAdminTotalUsers);
  const loading = useSelector(selectAdminUsersLoading);
  const error = useSelector(selectAdminUsersError);

  const [usernameFilter, setUsernameFilter] = useState(initialFilters.username || '');
  const [emailFilter, setEmailFilter] = useState(initialFilters.email || '');
  const [roleFilter, setRoleFilter] = useState(initialFilters.role || '');
  const [statusFilter, setStatusFilter] = useState(initialFilters.status || '');

  const roleTabMap = ['', 'Candidate', 'Company', 'Admin'];
  const roleTabIndex = roleTabMap.indexOf(roleFilter);

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

  const handleRoleTabChange = useCallback((_: React.SyntheticEvent, newValue: number) => {
    setRoleFilter(roleTabMap[newValue]);
  }, []);

  useEffect(() => {
    dispatchFetchUsers();
  }, [dispatchFetchUsers]);

  return (
    <Box>
      {/* Header */}
      <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 3 }}>
        User Management
      </Typography>

      {/* Filters & Tabs */}
      <Paper sx={{ mb: 3, borderRadius: '12px', border: '1px solid #ece6fa', boxShadow: 'none', overflow: 'hidden' }}>
        {/* Search */}
        <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
          <TextField
            placeholder="Search by username..."
            variant="outlined"
            size="small"
            value={usernameFilter}
            onChange={(e) => setUsernameFilter(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#6c6c80', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{ flex: '1 1 180px' }}
          />
          <TextField
            placeholder="Search by email..."
            variant="outlined"
            size="small"
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#6c6c80', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{ flex: '1 1 180px' }}
          />
          <Button
            variant="contained"
            onClick={handleApplyFilters}
            disableElevation
            sx={{ backgroundColor: PRIMARY, textTransform: 'none', '&:hover': { backgroundColor: '#6a0dad' } }}
          >
            Search
          </Button>
          <Button
            variant="text"
            onClick={handleResetFilters}
            sx={{ color: '#6c6c80', textTransform: 'none' }}
          >
            Reset
          </Button>
        </Box>
        {/* Role Tabs */}
        <Box sx={{ borderTop: '1px solid #ece6fa', px: 2 }}>
          <StyledTabs value={roleTabIndex >= 0 ? roleTabIndex : 0} onChange={handleRoleTabChange}>
            <StyledTab icon={<PeopleIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="All" />
            <StyledTab icon={<PersonIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Candidates" />
            <StyledTab icon={<BusinessIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Companies" />
            <StyledTab icon={<AdminIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Admins" />
          </StyledTabs>
        </Box>
      </Paper>

      {/* Error */}
      {error && (
        <Box sx={{ mb: 2, p: 1.5, bgcolor: '#fef2f2', borderRadius: '8px' }}>
          <Typography color="error" variant="body2">{error}</Typography>
        </Box>
      )}

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: '12px', border: '1px solid #ece6fa', boxShadow: 'none' }}>
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
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">No users found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: PRIMARY, width: 36, height: 36, fontSize: '0.9rem' }}>
                        {user.username.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        {user.profile?.firstName && user.profile?.lastName ? (
                          <>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {user.profile.firstName} {user.profile.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              @{user.username}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {user.username}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={user.role} color={getRoleColor(user.role) as any} size="small" />
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
                    {user.Localisation ? (
                      <Box>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          {user.Localisation}
                        </Typography>
                        {user.ip && (
                          <Typography variant="caption" color="text.secondary">
                            IP: {user.ip}
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        No location
                      </Typography>
                    )}
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
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="View">
                        <IconButton size="small" onClick={() => onUserSelect?.(user)} sx={{ color: PRIMARY }}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => onUserEdit?.(user)} sx={{ color: '#6c6c80' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {user.role === 'Company' && onManagePermissions && (
                        <Tooltip title="Permissions">
                          <IconButton size="small" onClick={() => onManagePermissions(user)} sx={{ color: PRIMARY }}>
                            <SecurityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => onUserDelete?.(user._id)} sx={{ color: '#ccc', '&:hover': { color: '#ef4444' } }}>
                          <DeleteIcon fontSize="small" />
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
