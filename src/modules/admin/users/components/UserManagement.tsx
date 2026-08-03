import React, { useState, useCallback } from 'react';
import {
  Eye as VisibilityIcon,
  Pencil as EditIcon,
  Trash2 as DeleteIcon,
  CheckCircle2 as CheckCircleIcon,
  Clock as PendingIcon,
  MapPin as LocationIcon,
  Users as PeopleIcon,
  User as PersonIcon,
  Building2 as BusinessIcon,
  Search,
} from 'lucide-react';
import { useAdminUsersQuery } from '../queries';
import { User, UserFilters } from '../types';
import { usePagination } from '@/hooks/usePagination';
import { Card } from '@/modules/shared/ui/shadcn/card';
import { Badge } from '@/modules/shared/ui/shadcn/badge';
import { Button } from '@/modules/shared/ui/shadcn/button';
import { Avatar, AvatarFallback } from '@/modules/shared/ui/shadcn/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/modules/shared/ui/shadcn/tabs';
import { Pagination } from '@/modules/shared/ui/shadcn/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/modules/shared/ui/shadcn/select';
import { cn } from '@/lib/utils';
import { ADMIN_ACCENT, AdminPageHeading, AdminStatCard, AdminTableErrorRow } from '@/modules/admin/shared';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/modules/shared/ui/shadcn/tooltip';

const roleBadgeClass = (role: string) => {
  switch (role?.toLowerCase()) {
    case 'admin':     return 'bg-red-50 text-red-600 border-transparent';
    case 'company':   return 'bg-teal-50 text-teal-600 border-transparent';
    case 'candidate': return 'bg-emerald-50 text-emerald-600 border-transparent';
    default:          return 'bg-slate-100 text-slate-600 border-transparent';
  }
};

const TH = 'px-4 py-3 text-left text-[11px] font-bold text-teal-700 uppercase tracking-wider bg-teal-50 border-b border-teal-100';
const TD = 'px-4 py-3 text-[13px] text-slate-700 border-b border-slate-100';

const ROLE_TABS = ['', 'Candidate', 'Company', 'Admin'];

interface UserManagementProps {
  onUserSelect?: (user: User) => void;
  onUserEdit?: (user: User) => void;
  onUserDelete?: (userId: string) => void;
  initialFilters?: Partial<UserFilters>;
}

const UserManagement: React.FC<UserManagementProps> = ({
  onUserSelect, onUserEdit, onUserDelete, initialFilters = {},
}) => {
  const [usernameFilter, setUsernameFilter] = useState(initialFilters.username || '');
  const [emailFilter, setEmailFilter] = useState(initialFilters.email || '');
  const [roleFilter, setRoleFilter] = useState(initialFilters.role || '');
  const [appliedFilters, setAppliedFilters] = useState({
    username: initialFilters.username || '',
    email: initialFilters.email || '',
    role: initialFilters.role || '',
  });

  const roleTabIndex = Math.max(ROLE_TABS.indexOf(roleFilter), 0);

  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination({ initialRowsPerPage: 10 });

  const { data, isLoading: loading, isError, refetch } = useAdminUsersQuery({
    page: page + 1,
    limit: rowsPerPage,
    username: appliedFilters.username || undefined,
    email: appliedFilters.email || undefined,
    role: appliedFilters.role || undefined,
  });

  const users = (data?.users ?? []) as User[];
  const totalUsers = data?.total ?? 0;
  const stats = data?.stats;
  const totalPages = Math.ceil(totalUsers / rowsPerPage);

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters({ username: usernameFilter, email: emailFilter, role: roleFilter });
  }, [usernameFilter, emailFilter, roleFilter]);

  const handleResetFilters = useCallback(() => {
    setUsernameFilter(''); setEmailFilter(''); setRoleFilter('');
    setAppliedFilters({ username: '', email: '', role: '' });
  }, []);

  const handleRoleTab = useCallback((val: string) => {
    const role = ROLE_TABS[Number(val)] ?? '';
    setRoleFilter(role);
    setAppliedFilters((prev) => ({ ...prev, role }));
  }, []);

  return (
    <TooltipProvider>
    <div className="space-y-6">
      <AdminPageHeading title="User Management" subtitle={`${totalUsers.toLocaleString()} total users across the platform`} />

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <AdminStatCard icon={PeopleIcon}   value={(stats?.total      ?? 0).toLocaleString()} label="Total Users" loading={loading && !stats} />
        <AdminStatCard icon={PersonIcon}   value={(stats?.candidates ?? 0).toLocaleString()} label="Candidates"  loading={loading && !stats} />
        <AdminStatCard icon={BusinessIcon} value={(stats?.companies  ?? 0).toLocaleString()} label="Companies"   loading={loading && !stats} />
        <AdminStatCard icon={CheckCircleIcon} value={(stats?.verified ?? 0).toLocaleString()} label="Verified"   loading={loading && !stats} />
        <AdminStatCard icon={PendingIcon}  value={(stats?.pending    ?? 0).toLocaleString()} label="Pending"     loading={loading && !stats} />
      </div>

      {/* Filters */}
      <Card className="overflow-hidden py-0 gap-0">
        <div className="p-4 flex flex-wrap gap-3 items-center border-b border-slate-100">
          <div className="flex-[1_1_180px] flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 focus-within:border-teal-400 transition-colors">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              placeholder="Search by username..."
              value={usernameFilter}
              onChange={(e) => setUsernameFilter(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
              className="w-full text-[13px] outline-none placeholder:text-slate-400 bg-transparent"
            />
          </div>
          <div className="flex-[1_1_180px] flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 focus-within:border-teal-400 transition-colors">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              placeholder="Search by email..."
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
              className="w-full text-[13px] outline-none placeholder:text-slate-400 bg-transparent"
            />
          </div>
          <Button
            variant="ghost"
            onClick={handleApplyFilters}
            className="rounded-lg px-4 py-2 text-[13px] font-semibold text-white hover:opacity-90 hover:text-white"
            style={{ backgroundColor: ADMIN_ACCENT }}
          >
            Search
          </Button>
          <Button
            variant="ghost"
            onClick={handleResetFilters}
            className="rounded-lg px-3 py-2 text-[13px] font-medium text-slate-500"
          >
            Reset
          </Button>
        </div>
        {/* Role Tabs */}
        <div className="px-4">
          <Tabs value={String(roleTabIndex)} onValueChange={handleRoleTab}>
            <TabsList variant="line" className="h-11 gap-0 rounded-none bg-transparent border-b-0 w-auto">
              {['All', 'Candidates', 'Companies', 'Admins'].map((label, i) => (
                <TabsTrigger
                  key={label}
                  value={String(i)}
                  className="rounded-none px-4 text-[13px] data-[state=active]:text-teal-600 data-[state=active]:after:bg-teal-500"
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden py-0 gap-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={TH}>User</th>
                <th className={TH}>Role</th>
                <th className={TH}>Status</th>
                <th className={TH}>Location</th>
                <th className={TH}>Joined</th>
                <th className={TH}>Last Login</th>
                <th className={TH}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isError ? (
                <tr><td colSpan={7} className="py-8 text-center">
                  <AdminTableErrorRow message="Failed to load users." onRetry={() => refetch()} />
                </td></tr>
              ) : loading ? (
                <tr><td colSpan={7} className="py-8 text-center text-[13px] text-slate-400">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-[13px] text-slate-400">No users found</td></tr>
              ) : users.map((user) => (
                <tr key={user._id} className="hover:bg-teal-50/40 transition-colors">
                  <td className={TD}>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarFallback className="text-[12px] font-bold text-white bg-teal-600">
                          {user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        {user.profile?.firstName && user.profile?.lastName ? (
                          <>
                            <div className="font-semibold text-slate-900 truncate">{user.profile.firstName} {user.profile.lastName}</div>
                            <div className="text-[11px] text-slate-400 truncate">@{user.username}</div>
                          </>
                        ) : (
                          <div className="font-semibold text-slate-900 truncate">{user.username}</div>
                        )}
                        <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className={TD}>
                    <Badge variant="outline" className={cn('font-semibold', roleBadgeClass(user.role))}>{user.role}</Badge>
                  </td>
                  <td className={TD}>
                    <Badge variant="outline" className={cn('gap-1 border-transparent font-semibold', user.isVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600')}>
                      {user.isVerified ? <CheckCircleIcon size={12} /> : <PendingIcon size={12} />}
                      {user.isVerified ? 'Verified' : 'Pending'}
                    </Badge>
                  </td>
                  <td className={TD}>
                    {user.Localisation ? (
                      <div>
                        <div className="flex items-center gap-1 text-slate-700">
                          <LocationIcon size={14} className="text-slate-400" />
                          {user.Localisation}
                        </div>
                        {user.ip && <div className="text-[11px] text-slate-400">IP: {user.ip}</div>}
                      </div>
                    ) : <span className="text-slate-400 italic">—</span>}
                  </td>
                  <td className={TD}>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className={TD}>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
                  <td className={TD}>
                    <div className="flex items-center gap-0.5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button onClick={() => onUserSelect?.(user)} className="rounded-md p-1.5 text-[#64748B] hover:text-teal-600">
                            <VisibilityIcon size={18} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>View</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button onClick={() => onUserEdit?.(user)} className="rounded-md p-1.5 text-[#64748B] hover:text-teal-600">
                            <EditIcon size={18} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button onClick={() => onUserDelete?.(user._id)} className="rounded-md p-1.5 text-[#CBD5E1] hover:text-red-500">
                            <DeleteIcon size={18} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <span className="text-[12px] text-slate-400">{totalUsers.toLocaleString()} users</span>
          <div className="flex items-center gap-3">
            <Select
              value={String(rowsPerPage)}
              onValueChange={(v) => handleChangeRowsPerPage({ target: { value: v } } as any)}
            >
              <SelectTrigger size="sm" className="text-[12px] text-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 25].map((n) => <SelectItem key={n} value={String(n)}>{n} / page</SelectItem>)}
              </SelectContent>
            </Select>
            <Pagination
              page={page + 1}
              totalPages={totalPages}
              onPageChange={(p) => handleChangePage(null, p - 1)}
              size="sm"
            />
          </div>
        </div>
      </Card>
    </div>
    </TooltipProvider>
  );
};

export default React.memo(UserManagement);
