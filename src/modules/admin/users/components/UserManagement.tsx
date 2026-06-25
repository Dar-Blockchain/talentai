import React, { useState, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Avatar,
  IconButton,
  Tooltip,
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
import { useAdminUsersQuery } from '../queries';

// Types
import { User, UserFilters } from '../types';
// Hooks
import { usePagination } from '@/hooks/usePagination';
// UI
import { Card } from '@/modules/shared/ui/shadcn/card';
import { Badge } from '@/modules/shared/ui/shadcn/badge';
import { cn } from '@/lib/utils';
import { ADMIN_ACCENT, ADMIN_NEUTRAL, ADMIN_TABLE_HEAD_CELL_SX, ADMIN_TABLE_ROW_SX, AdminPageHeading } from '@/modules/admin/shared';

const StyledTabs = styled(Tabs)({
  minHeight: 40,
  '& .MuiTabs-indicator': {
    backgroundColor: ADMIN_NEUTRAL,
    height: 3,
    borderRadius: '3px 3px 0 0',
  },
});

const StyledTab = styled(Tab)({
  minHeight: 40,
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.85rem',
  color: '#64748B',
  padding: '8px 16px',
  '&.Mui-selected': {
    color: ADMIN_NEUTRAL,
  },
});

const roleBadgeClass = (role: string) => {
  switch (role?.toLowerCase()) {
    case 'admin':
      return 'bg-red-50 text-red-600';
    case 'company':
      return 'bg-indigo-50 text-indigo-600';
    case 'candidate':
      return 'bg-emerald-50 text-emerald-600';
    default:
      return 'bg-slate-100 text-slate-600';
  }
};

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
  // Text inputs the user is actively typing into.
  const [usernameFilter, setUsernameFilter] = useState(initialFilters.username || '');
  const [emailFilter, setEmailFilter] = useState(initialFilters.email || '');
  const [roleFilter, setRoleFilter] = useState(initialFilters.role || '');
  const [statusFilter, setStatusFilter] = useState(initialFilters.status || '');

  // Filters actually sent to the server — only updated on Search/Enter/tab
  // change/page change, so typing doesn't trigger a fetch on every keystroke.
  const [appliedFilters, setAppliedFilters] = useState({
    username: initialFilters.username || '',
    email: initialFilters.email || '',
    role: initialFilters.role || '',
    status: initialFilters.status || '',
  });

  const roleTabMap = ['', 'Candidate', 'Company', 'Admin'];
  const roleTabIndex = roleTabMap.indexOf(roleFilter);

  const {
    page,
    rowsPerPage,
    handleChangePage: onPageChange,
    handleChangeRowsPerPage: onRowsPerPageChange,
  } = usePagination({ initialRowsPerPage: 10 });

  const { data, isLoading: loading, error: queryError } = useAdminUsersQuery({
    page: page + 1,
    limit: rowsPerPage,
    username: appliedFilters.username || undefined,
    email: appliedFilters.email || undefined,
    role: appliedFilters.role || undefined,
    status: appliedFilters.status || undefined,
  });

  const users = (data?.users ?? []) as User[];
  const totalUsers = data?.total ?? 0;
  const error = queryError ? (queryError as Error).message : null;

  const handleChangePage = useCallback(
    (event: unknown, newPage: number) => onPageChange(event, newPage),
    [onPageChange]
  );

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => onRowsPerPageChange(event),
    [onRowsPerPageChange]
  );

  const handleResetFilters = useCallback(() => {
    setUsernameFilter('');
    setEmailFilter('');
    setRoleFilter('');
    setStatusFilter('');
    setAppliedFilters({ username: '', email: '', role: '', status: '' });
  }, []);

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters({ username: usernameFilter, email: emailFilter, role: roleFilter, status: statusFilter });
  }, [usernameFilter, emailFilter, roleFilter, statusFilter]);

  const handleRoleTabChange = useCallback((_: React.SyntheticEvent, newValue: number) => {
    const role = roleTabMap[newValue];
    setRoleFilter(role);
    setAppliedFilters((prev) => ({ ...prev, role }));
  }, []);

  return (
    <div>
      {/* Header */}
      <AdminPageHeading title="User Management" subtitle={`${totalUsers.toLocaleString()} total users across the platform`} />

      {/* Filters & Tabs */}
      <Card className="mb-6 overflow-hidden py-0 gap-0">
        {/* Search */}
        <div className="p-4 flex flex-wrap gap-3 items-center">
          <div className="flex-[1_1_180px] flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
            <SearchIcon style={{ fontSize: 18 }} className="text-slate-400 shrink-0" />
            <input
              placeholder="Search by username..."
              value={usernameFilter}
              onChange={(e) => setUsernameFilter(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
              className="w-full text-[13px] outline-none placeholder:text-slate-400"
            />
          </div>
          <div className="flex-[1_1_180px] flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
            <SearchIcon style={{ fontSize: 18 }} className="text-slate-400 shrink-0" />
            <input
              placeholder="Search by email..."
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
              className="w-full text-[13px] outline-none placeholder:text-slate-400"
            />
          </div>
          <button
            onClick={handleApplyFilters}
            className="rounded-lg px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-indigo-700"
            style={{ backgroundColor: ADMIN_ACCENT }}
          >
            Search
          </button>
          <button
            onClick={handleResetFilters}
            className="rounded-lg px-3 py-2 text-[13px] font-medium text-slate-500 hover:bg-slate-50 transition-colors"
          >
            Reset
          </button>
        </div>
        {/* Role Tabs */}
        <div className="border-t border-slate-100 px-2">
          <StyledTabs value={roleTabIndex >= 0 ? roleTabIndex : 0} onChange={handleRoleTabChange}>
            <StyledTab icon={<PeopleIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="All" />
            <StyledTab icon={<PersonIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Candidates" />
            <StyledTab icon={<BusinessIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Companies" />
            <StyledTab icon={<AdminIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Admins" />
          </StyledTabs>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <div className="mb-3 px-4 py-2.5 rounded-lg bg-red-50">
          <span className="text-[13px] text-red-600">{error}</span>
        </div>
      )}

      {/* Table */}
      <Card className="overflow-hidden py-0 gap-0">
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={ADMIN_TABLE_HEAD_CELL_SX}>User</TableCell>
                <TableCell sx={ADMIN_TABLE_HEAD_CELL_SX}>Role</TableCell>
                <TableCell sx={ADMIN_TABLE_HEAD_CELL_SX}>Status</TableCell>
                <TableCell sx={ADMIN_TABLE_HEAD_CELL_SX}>Location</TableCell>
                <TableCell sx={ADMIN_TABLE_HEAD_CELL_SX}>Joined</TableCell>
                <TableCell sx={ADMIN_TABLE_HEAD_CELL_SX}>Last Login</TableCell>
                <TableCell sx={ADMIN_TABLE_HEAD_CELL_SX}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <span className="text-[13px] text-slate-500">Loading...</span>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <span className="text-[13px] text-slate-500">No users found</span>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id} hover sx={ADMIN_TABLE_ROW_SX}>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar sx={{ mr: 2, bgcolor: '#475569', width: 36, height: 36, fontSize: '0.9rem' }}>
                          {user.username.charAt(0).toUpperCase()}
                        </Avatar>
                        <div>
                          {user.profile?.firstName && user.profile?.lastName ? (
                            <>
                              <div className="text-[13px] font-semibold text-slate-900">
                                {user.profile.firstName} {user.profile.lastName}
                              </div>
                              <div className="text-[11px] text-slate-400">@{user.username}</div>
                            </>
                          ) : (
                            <div className="text-[13px] font-semibold text-slate-900">{user.username}</div>
                          )}
                          <div className="text-[11px] text-slate-400">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("border-transparent font-semibold", roleBadgeClass(user.role))}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "gap-1 border-transparent font-semibold",
                          user.isVerified ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600",
                        )}
                      >
                        {user.isVerified ? <CheckCircleIcon style={{ fontSize: 13 }} /> : <PendingIcon style={{ fontSize: 13 }} />}
                        {user.isVerified ? 'Verified' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.Localisation ? (
                        <div>
                          <div className="flex items-center gap-1 text-[13px] text-slate-700">
                            <LocationIcon style={{ fontSize: 16 }} className="text-slate-400" />
                            {user.Localisation}
                          </div>
                          {user.ip && <div className="text-[11px] text-slate-400">IP: {user.ip}</div>}
                        </div>
                      ) : (
                        <span className="text-[13px] text-slate-400 italic">No location</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-[13px] text-slate-700">{new Date(user.createdAt).toLocaleDateString()}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[13px] text-slate-700">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-0.5">
                        <Tooltip title="View">
                          <IconButton size="small" onClick={() => onUserSelect?.(user)} sx={{ color: '#64748B' }}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => onUserEdit?.(user)} sx={{ color: '#64748B' }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {user.role === 'Company' && onManagePermissions && (
                          <Tooltip title="Permissions">
                            <IconButton size="small" onClick={() => onManagePermissions(user)} sx={{ color: '#64748B' }}>
                              <SecurityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => onUserDelete?.(user._id)} sx={{ color: '#ccc', '&:hover': { color: '#ef4444' } }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </div>
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
      </Card>
    </div>
  );
};

export default React.memo(UserManagement);
