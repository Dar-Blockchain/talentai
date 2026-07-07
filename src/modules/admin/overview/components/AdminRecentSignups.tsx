import React from 'react';
import { UserPlus } from 'lucide-react';
import { Avatar } from '@mui/material';
import { Badge } from '@/modules/shared/ui/shadcn/badge';
import { cn } from '@/lib/utils';
import { AdminChartCard, ADMIN_ACCENT } from '@/modules/admin/shared';
import { RecentSignup } from '../types';

interface AdminRecentSignupsProps {
  signups: RecentSignup[];
  loading?: boolean;
}

const roleBadgeClass = (role: string) => {
  switch (role?.toLowerCase()) {
    case 'admin':     return 'bg-red-50 text-red-600';
    case 'company':   return 'bg-teal-50 text-teal-600';
    case 'candidate': return 'bg-emerald-50 text-emerald-600';
    default:          return 'bg-slate-100 text-slate-600';
  }
};

const timeAgo = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const AdminRecentSignups: React.FC<AdminRecentSignupsProps> = ({ signups, loading }) => (
  <AdminChartCard icon={UserPlus} title="Recent Signups" className="mb-4">
    {loading ? (
      <p className="text-[13px] text-slate-400">Loading…</p>
    ) : signups.length === 0 ? (
      <p className="text-[13px] text-slate-400">No signups yet.</p>
    ) : (
      <div className="flex flex-col">
        {signups.map((user, i) => {
          const displayName = user.profile?.firstName && user.profile?.lastName
            ? `${user.profile.firstName} ${user.profile.lastName}`
            : user.username;
          return (
            <div
              key={user._id}
              className={cn("flex items-center gap-3 py-2.5", i < signups.length - 1 && "border-b border-slate-100")}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: ADMIN_ACCENT, fontSize: '0.8rem' }}>
                {user.username.charAt(0).toUpperCase()}
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-slate-900 truncate">{displayName}</div>
                <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
              </div>
              <Badge variant="outline" className={cn("border-transparent font-semibold shrink-0", roleBadgeClass(user.role))}>
                {user.role}
              </Badge>
              <span className="text-[11px] text-slate-400 shrink-0 w-16 text-right">{timeAgo(user.createdAt)}</span>
            </div>
          );
        })}
      </div>
    )}
  </AdminChartCard>
);

export default AdminRecentSignups;
