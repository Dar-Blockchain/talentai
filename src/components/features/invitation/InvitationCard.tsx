import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlined from '@mui/icons-material/CancelOutlined';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import BusinessOutlined from '@mui/icons-material/BusinessOutlined';
import BadgeOutlined from '@mui/icons-material/BadgeOutlined';
import PersonOutlined from '@mui/icons-material/PersonOutlined';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import AppButton from '@/components/ui/AppButton';
import Shell from './Shell';
import InfoRow from './InfoRow';
import { PURPLE, TEAL, ROLE_LABELS, ROLE_STYLES } from './constants';

const InvitationCard: React.FC<{
  invitation: any;
  respondingToInvitation: boolean;
  onAccept: () => void;
  onDecline: () => void;
}> = ({ invitation, respondingToInvitation, onAccept, onDecline }) => {
  const roleStyle    = ROLE_STYLES[invitation.role] ?? ROLE_STYLES.Manager;
  const roleLabel    = ROLE_LABELS[invitation.role] ?? invitation.role;
  const companyName  = invitation.Company?.username || invitation.organization?.name || 'Company';
  const invitedBy    = invitation.invitedBy?.username || invitation.invitedBy?.email || 'Team Admin';
  const inviteeEmail = invitation.email;
  const companyLetter = companyName[0]?.toUpperCase() || 'C';

  return (
    <Shell>
      <Box sx={{ bgcolor: '#fff', borderRadius: '20px', border: '1px solid #E5E7EB', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {/* Role-tinted header */}
        <Box sx={{ height: 96, background: `linear-gradient(145deg, ${roleStyle.lightBg}, #FFFFFF)`, borderBottom: '1px solid #F1F5F9', position: 'relative' }}>
          <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(circle at 15% 50%, ${roleStyle.color}12, transparent 65%)` }} />
          <Box sx={{ position: 'absolute', bottom: -24, right: -24, width: 100, height: 100, borderRadius: '50%', pointerEvents: 'none', background: `radial-gradient(circle, ${roleStyle.color}0A, transparent 70%)` }} />
        </Box>

        {/* Company avatar */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: '-32px', mb: 2, position: 'relative', zIndex: 1 }}>
          <Box sx={{
            width: 64, height: 64, borderRadius: '16px',
            background: `linear-gradient(135deg, ${PURPLE} 0%, #A855F7 100%)`,
            border: '3px solid #fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 6px 20px ${PURPLE}30`,
          }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#fff', lineHeight: 1 }}>
              {companyLetter}
            </Typography>
          </Box>
        </Box>

        {/* Heading */}
        <Box sx={{ textAlign: 'center', px: 3, mb: 3 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#1E293B', letterSpacing: '-0.02em', mb: 0.5 }}>
            You're Invited!
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: '0.825rem', lineHeight: 1.65 }}>
            <Box component="span" sx={{ fontWeight: 700, color: PURPLE }}>{companyName}</Box>
            {' '}has invited you to join their team.
          </Typography>
        </Box>

        {/* Info rows */}
        <Box sx={{ mx: 3, mb: 3, borderRadius: '12px', border: '1px solid #F1F5F9', overflow: 'hidden' }}>
          <InfoRow icon={<BusinessOutlined />} label="Organization" value={companyName} iconColor={TEAL} />
          <InfoRow
            icon={<BadgeOutlined />} label="Role" iconColor={roleStyle.color}
            value={
              <Chip label={roleLabel} size="small" sx={{ fontWeight: 700, fontSize: '0.72rem', height: 22, color: roleStyle.color, bgcolor: roleStyle.bg, border: `1px solid ${roleStyle.color}25`, borderRadius: '6px', '& .MuiChip-label': { px: 1.25 } }} />
            }
          />
          {inviteeEmail && (
            <InfoRow icon={<EmailOutlined />} label="Email" value={inviteeEmail} iconColor="#0891B2" />
          )}
          <InfoRow icon={<PersonOutlined />} label="Invited by" value={invitedBy} iconColor="#D97706" last={!invitation.expiresAt} />
          {invitation.expiresAt && (
            <InfoRow
              icon={<AccessTimeOutlined />} label="Expires"
              value={new Date(invitation.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              iconColor="#2563EB" last
            />
          )}
        </Box>

        {/* Action buttons */}
        <Box sx={{ px: 3, pb: 3.5, display: 'flex', gap: 1.5 }}>
          <AppButton
            variant="outlined" label="Decline"
            size="large" fullWidth
            disabled={respondingToInvitation}
            onClick={onDecline}
            sx={{ borderRadius: '12px', borderColor: '#E2E8F0', color: '#64748B', '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1' } }}
          />
          <AppButton
            variant="primary" label="Accept"
            size="large" fullWidth
            loading={respondingToInvitation}
            startIcon={<CheckCircleOutlined sx={{ fontSize: 17 }} />}
            onClick={onAccept}
            sx={{ borderRadius: '12px', boxShadow: `0 4px 14px ${PURPLE}35`, '&:hover': { boxShadow: `0 6px 20px ${PURPLE}45` } }}
          />
        </Box>
      </Box>
    </Shell>
  );
};

export default InvitationCard;
