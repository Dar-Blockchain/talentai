import React from 'react';
import { Dialog, DialogContent, IconButton, Avatar } from '@mui/material';
import {
  Close as CloseIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Login as LoginIcon,
  Language as LanguageIcon,
  VerifiedUser as VerifiedIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material';
import { Badge } from '@/modules/shared/ui/shadcn/badge';
import { InfoRow, ADMIN_NEUTRAL, ADMIN_DARK_BANNER } from '@/modules/admin/shared';
import { User } from '../types';

interface UserDetailsDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onEdit?: (user: User) => void;
}

const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({ open, user, onClose }) => {
  if (!user) return null;

  const displayName =
    user.profile?.firstName && user.profile?.lastName
      ? `${user.profile.firstName} ${user.profile.lastName}`
      : user.username;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
        },
      }}
    >
      {/* Header */}
      <div
        className="relative px-6 pt-6 pb-10 text-center"
        style={{ backgroundColor: ADMIN_DARK_BANNER }}
      >
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 12, right: 12, color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
        <Avatar
          sx={{
            width: 64,
            height: 64,
            mx: 'auto',
            mb: 1.5,
            bgcolor: 'rgba(255,255,255,0.15)',
            border: '3px solid rgba(255,255,255,0.3)',
            fontSize: '1.5rem',
            fontWeight: 700,
          }}
        >
          {user.username?.charAt(0).toUpperCase() || 'U'}
        </Avatar>
        <h2 className="text-[1.15rem] font-bold text-white">{displayName}</h2>
        <p className="text-[13px] text-white/70 mt-0.5">@{user.username}</p>
      </div>

      <DialogContent sx={{ p: 0 }}>
        {/* Status chips - overlapping */}
        <div className="px-6 -mt-4 flex justify-center gap-2">
          <Badge variant="outline" className="border-slate-200 bg-white font-bold text-indigo-600 shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
            {user.role}
          </Badge>
          <Badge
            variant="outline"
            className="gap-1 border-transparent bg-white font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
            style={{ color: user.isVerified ? '#10b981' : '#f59e0b' }}
          >
            <VerifiedIcon style={{ fontSize: 14 }} />
            {user.isVerified ? 'Verified' : 'Pending'}
          </Badge>
        </div>

        {/* Info List */}
        <div className="px-6 pt-4 pb-1">
          <InfoRow icon={<EmailIcon sx={{ fontSize: 18, color: ADMIN_NEUTRAL }} />} label="Email" value={user.email} />
          <InfoRow
            icon={<CalendarIcon sx={{ fontSize: 18, color: ADMIN_NEUTRAL }} />}
            label="Joined"
            value={new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          />
          {user.lastLogin && (
            <InfoRow
              icon={<LoginIcon sx={{ fontSize: 18, color: ADMIN_NEUTRAL }} />}
              label="Last Login"
              value={new Date(user.lastLogin).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            />
          )}
          {user.Localisation && (
            <InfoRow icon={<LanguageIcon sx={{ fontSize: 18, color: ADMIN_NEUTRAL }} />} label="Location" value={user.Localisation} />
          )}
          {user.ip && (
            <InfoRow icon={<LanguageIcon sx={{ fontSize: 18, color: ADMIN_NEUTRAL }} />} label="IP Address" value={user.ip} mono />
          )}
        </div>

        {/* Profile Section */}
        {user.profile && (user.profile.phone || user.profile.location || user.profile.company || user.profile.position) && (
          <div className="px-6 pb-4">
            <div className="border-t border-slate-200 pt-3">
              <span className="text-[11px] uppercase tracking-[1.2px] text-slate-500">Profile</span>
              {user.profile.phone && (
                <InfoRow icon={<PhoneIcon sx={{ fontSize: 18, color: ADMIN_NEUTRAL }} />} label="Phone" value={user.profile.phone} />
              )}
              {user.profile.location && (
                <InfoRow icon={<LocationIcon sx={{ fontSize: 18, color: ADMIN_NEUTRAL }} />} label="Location" value={user.profile.location} />
              )}
              {user.profile.company && (
                <InfoRow icon={<BusinessIcon sx={{ fontSize: 18, color: ADMIN_NEUTRAL }} />} label="Company" value={user.profile.company} />
              )}
              {user.profile.position && (
                <InfoRow icon={<BadgeIcon sx={{ fontSize: 18, color: ADMIN_NEUTRAL }} />} label="Position" value={user.profile.position} />
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200">
          <span className="text-[11px] font-mono text-slate-400">ID: {user._id}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(UserDetailsDialog);
