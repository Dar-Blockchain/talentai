import React from 'react';
import { Dialog, DialogContent } from '@/modules/shared/ui/shadcn/dialog';
import { Avatar, AvatarFallback } from '@/modules/shared/ui/shadcn/avatar';
import {
  Mail as EmailIcon,
  Calendar as CalendarIcon,
  LogIn as LoginIcon,
  Globe as LanguageIcon,
  BadgeCheck as VerifiedIcon,
  Building2 as BusinessIcon,
  Phone as PhoneIcon,
  MapPin as LocationIcon,
  IdCard as BadgeIcon,
} from 'lucide-react';
import { Badge } from '@/modules/shared/ui/shadcn/badge';
import { InfoRow, ADMIN_NEUTRAL, ADMIN_ACCENT, ADMIN_RADIUS } from '@/modules/admin/shared';
import { User } from '../types';

interface UserDetailsDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
}

const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({ open, user, onClose }) => {
  if (!user) return null;

  const displayName =
    user.profile?.firstName && user.profile?.lastName
      ? `${user.profile.firstName} ${user.profile.lastName}`
      : user.username;

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent
        className="max-w-2xl p-0 gap-0 overflow-hidden"
        style={{ borderRadius: ADMIN_RADIUS, boxShadow: '0 16px 40px -8px rgba(15,23,42,0.12)' }}
      >
      {/* Header */}
      <div className="relative px-6 pt-6 pb-5 text-center">
        <Avatar className="mx-auto mb-3 size-16" style={{ backgroundColor: '#EEF2FF' }}>
          <AvatarFallback className="bg-transparent text-2xl font-bold" style={{ color: ADMIN_ACCENT }}>
            {user.username?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <h2 className="text-[1.15rem] font-semibold text-slate-900">{displayName}</h2>
        <p className="text-[13px] text-slate-500 mt-0.5">@{user.username}</p>
        <div className="flex justify-center gap-2 mt-3">
          <Badge variant="outline" className="border-transparent bg-slate-100 font-semibold text-slate-600">
            {user.role}
          </Badge>
          <Badge
            variant="outline"
            className="gap-1 border-transparent bg-slate-100 font-semibold"
            style={{ color: user.isVerified ? '#10b981' : '#f59e0b' }}
          >
            <VerifiedIcon size={14} />
            {user.isVerified ? 'Verified' : 'Pending'}
          </Badge>
        </div>
      </div>

      <div>
        {/* Info List */}
        <div className="px-6 pt-4 pb-1">
          <InfoRow icon={<EmailIcon size={18} color={ADMIN_NEUTRAL} />} label="Email" value={user.email} />
          <InfoRow
            icon={<CalendarIcon size={18} color={ADMIN_NEUTRAL} />}
            label="Joined"
            value={new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          />
          {user.lastLogin && (
            <InfoRow
              icon={<LoginIcon size={18} color={ADMIN_NEUTRAL} />}
              label="Last Login"
              value={new Date(user.lastLogin).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            />
          )}
          {user.Localisation && (
            <InfoRow icon={<LanguageIcon size={18} color={ADMIN_NEUTRAL} />} label="Location" value={user.Localisation} />
          )}
          {user.ip && (
            <InfoRow icon={<LanguageIcon size={18} color={ADMIN_NEUTRAL} />} label="IP Address" value={user.ip} mono />
          )}
        </div>

        {/* Profile Section */}
        {user.profile && (user.profile.phone || user.profile.location || user.profile.company || user.profile.position) && (
          <div className="px-6 pb-4">
            <div className="border-t border-slate-200 pt-3">
              <span className="text-[11px] uppercase tracking-[1.2px] text-slate-500">Profile</span>
              {user.profile.phone && (
                <InfoRow icon={<PhoneIcon size={18} color={ADMIN_NEUTRAL} />} label="Phone" value={user.profile.phone} />
              )}
              {user.profile.location && (
                <InfoRow icon={<LocationIcon size={18} color={ADMIN_NEUTRAL} />} label="Location" value={user.profile.location} />
              )}
              {user.profile.company && (
                <InfoRow icon={<BusinessIcon size={18} color={ADMIN_NEUTRAL} />} label="Company" value={user.profile.company} />
              )}
              {user.profile.position && (
                <InfoRow icon={<BadgeIcon size={18} color={ADMIN_NEUTRAL} />} label="Position" value={user.profile.position} />
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200">
          <span className="text-[11px] font-mono text-slate-400">ID: {user._id}</span>
        </div>
      </div>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(UserDetailsDialog);
