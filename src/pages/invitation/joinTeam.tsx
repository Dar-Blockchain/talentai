import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { Box, Container, Typography, Chip, CircularProgress } from '@mui/material';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlined from '@mui/icons-material/CancelOutlined';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import BusinessOutlined from '@mui/icons-material/BusinessOutlined';
import BadgeOutlined from '@mui/icons-material/BadgeOutlined';
import PersonOutlined from '@mui/icons-material/PersonOutlined';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import AppButton from '@/components/ui/AppButton';
import {
  fetchInvitationDetails,
  respondToInvitation,
  selectMembers,
} from '@/store/slices/memberSlice';
import Cookies from 'js-cookie';

const PURPLE = '#8310FF';
const TEAL   = '#0D9488';

const ROLE_LABELS: Record<string, string> = {
  RH: 'HR',
  TechLead: 'Technical Leader',
  Supervisor: 'Supervisor',
  Manager: 'Manager',
};

const ROLE_STYLES: Record<string, { color: string; bg: string; lightBg: string }> = {
  RH:         { color: '#059669', bg: '#D1FAE5', lightBg: '#ECFDF5' },
  TechLead:   { color: '#2563EB', bg: '#DBEAFE', lightBg: '#EFF6FF' },
  Supervisor: { color: '#B45309', bg: '#FEF3C7', lightBg: '#FFFBEB' },
  Manager:    { color: PURPLE,    bg: '#EDE9FE', lightBg: '#F5F3FF' },
};

// ─── Info row ─────────────────────────────────────────────────────────────────

const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  iconColor?: string;
  last?: boolean;
}> = ({ icon, label, value, iconColor = TEAL, last = false }) => (
  <Box sx={{
    display: 'flex', alignItems: 'center', gap: 2,
    py: 1.75, px: 2.5,
    borderBottom: last ? 'none' : '1px solid #F1F5F9',
  }}>
    <Box sx={{ color: iconColor, display: 'flex', flexShrink: 0, '& svg': { fontSize: 18 } }}>
      {icon}
    </Box>
    <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
      <Typography sx={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 500, flexShrink: 0 }}>
        {label}
      </Typography>
      {typeof value === 'string'
        ? <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>
            {value}
          </Typography>
        : value}
    </Box>
  </Box>
);

// ─── Page shell ───────────────────────────────────────────────────────────────

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box sx={{
    minHeight: '100vh', bgcolor: '#F8FAFC',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    pt: { xs: 4, sm: 7 }, pb: 6, px: 2,
  }}>
    {/* TalentAI logo */}
    <Box sx={{ mb: 5 }}>
      <Image src="/logo-purple.svg" alt="TalentAI" width={120} height={25} priority />
    </Box>

    <Container maxWidth="xs">{children}</Container>
  </Box>
);

// ─── Main component ───────────────────────────────────────────────────────────

const InvitationAcceptationPage: React.FC = () => {
  const router   = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { invitationId } = router.query;

  const {
    currentInvitation, fetchingInvitationDetails,
    respondingToInvitation, invitationResponse, error,
  } = useSelector(selectMembers);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user            = useSelector((state: RootState) => state.user.connectedUser.user);

  useEffect(() => {
    if (!router.isReady || !invitationId) return;
    const token = Cookies.get('api_token') || localStorage.getItem('api_token');
    if (!token && !isAuthenticated) {
      router.push(`/signin?returnUrl=${encodeURIComponent(window.location.href)}`);
    }
  }, [router.isReady, isAuthenticated, router, invitationId]);

  useEffect(() => {
    const token = Cookies.get('api_token') || localStorage.getItem('api_token');
    if (invitationId && typeof invitationId === 'string' && (token || isAuthenticated)) {
      dispatch(fetchInvitationDetails(invitationId));
    }
  }, [invitationId, dispatch, isAuthenticated]);

  const handleAccept = async () => {
    if (!invitationId || typeof invitationId !== 'string') return;
    try { await dispatch(respondToInvitation({ invitationId, action: 'accept' })).unwrap(); }
    catch { /* handled by redux */ }
  };

  const handleDecline = async () => {
    if (!invitationId || typeof invitationId !== 'string') return;
    try { await dispatch(respondToInvitation({ invitationId, action: 'reject' })).unwrap(); }
    catch { /* handled by redux */ }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (fetchingInvitationDetails) {
    return (
      <Shell>
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <CircularProgress size={32} thickness={3} sx={{ color: TEAL, mb: 2 }} />
          <Typography sx={{ color: '#94A3B8', fontSize: '0.875rem', fontWeight: 500 }}>
            Loading invitation…
          </Typography>
        </Box>
      </Shell>
    );
  }

  // ── Email mismatch / error ─────────────────────────────────────────────────
  const emailMismatch =
    currentInvitation && user && (currentInvitation as any).email &&
    user.email.toLowerCase() !== (currentInvitation as any).email.toLowerCase();

  if (error || !currentInvitation || emailMismatch) {
    const isWarning = Boolean(emailMismatch);
    return (
      <Shell>
        <Box sx={{
          bgcolor: '#fff', borderRadius: '20px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>
          <Box sx={{
            height: 88,
            background: isWarning ? 'linear-gradient(145deg, #FFFBEB, #fff)' : 'linear-gradient(145deg, #FEF2F2, #fff)',
            borderBottom: '1px solid #F1F5F9', position: 'relative',
          }}>
            <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: isWarning ? 'radial-gradient(circle at 50% 100%, #FBBF2415, transparent 70%)' : 'radial-gradient(circle at 50% 100%, #F8717115, transparent 70%)' }} />
          </Box>

          <Box sx={{ px: 3.5, pb: 3.5, mt: '-32px', textAlign: 'center' }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '16px', mx: 'auto', mb: 2.5, bgcolor: isWarning ? '#FEF3C7' : '#FEE2E2', border: '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
              {isWarning
                ? <WarningAmberOutlined sx={{ fontSize: 28, color: '#D97706' }} />
                : <CancelOutlined sx={{ fontSize: 28, color: '#EF4444' }} />}
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#1E293B', mb: 0.75, letterSpacing: '-0.02em' }}>
              {isWarning ? 'Email Mismatch' : 'Invalid Invitation'}
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: '0.825rem', lineHeight: 1.65, mb: 3 }}>
              {isWarning
                ? `Invitation sent to ${(currentInvitation as any).email}. You're signed in as ${user?.email}.`
                : error || 'This invitation is no longer valid or has expired.'}
            </Typography>
            <AppButton
              variant="primary" label={isWarning ? 'Go to Dashboard' : 'Go to Home'}
              size="large" fullWidth
              onClick={() => router.push(isWarning ? '/dashboard/member' : '/')}
              sx={{ borderRadius: '12px' }}
            />
          </Box>
        </Box>
      </Shell>
    );
  }

  if (invitationResponse) {
    const accepted = invitationResponse.action === 'accept';
    return (
      <Shell>
        <Box sx={{ bgcolor: '#fff', borderRadius: '20px', border: '1px solid #E5E7EB', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <Box sx={{
            height: 88,
            background: accepted ? 'linear-gradient(145deg, #ECFDF5, #fff)' : 'linear-gradient(145deg, #F8FAFC, #fff)',
            borderBottom: '1px solid #F1F5F9', position: 'relative',
          }}>
            <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: accepted ? 'radial-gradient(circle at 50% 100%, #34D39915, transparent 70%)' : 'radial-gradient(circle at 50% 100%, #94A3B815, transparent 70%)' }} />
          </Box>

          <Box sx={{ px: 3.5, pb: 3.5, mt: '-32px', textAlign: 'center' }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '16px', mx: 'auto', mb: 2.5, bgcolor: accepted ? '#D1FAE5' : '#F1F5F9', border: '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
              {accepted
                ? <CheckCircleOutlined sx={{ fontSize: 28, color: '#059669' }} />
                : <CancelOutlined sx={{ fontSize: 28, color: '#64748B' }} />}
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#1E293B', mb: 0.75, letterSpacing: '-0.02em' }}>
              {accepted ? 'Invitation Accepted!' : 'Invitation Declined'}
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: '0.825rem', lineHeight: 1.65, mb: 0.5 }}>
              {accepted ? `Welcome to ${(currentInvitation as any).Company?.username || currentInvitation.organization?.name || 'the team'}!` : 'You have declined this invitation.'}
            </Typography>
            <Typography sx={{ color: '#CBD5E1', fontSize: '0.775rem', mb: 3 }}>
              You can now close this window.
            </Typography>
            {accepted && (
              <AppButton
                variant="primary" label="Go to Dashboard"
                size="large" fullWidth
                onClick={() => router.push('/dashboard/member')}
                sx={{ borderRadius: '12px' }}
              />
            )}
          </Box>
        </Box>
      </Shell>
    );
  }

  // ── Main invitation view ───────────────────────────────────────────────────
  const roleStyle    = ROLE_STYLES[currentInvitation.role] ?? ROLE_STYLES.Manager;
  const roleLabel    = ROLE_LABELS[currentInvitation.role] ?? currentInvitation.role;
  const companyName  = (currentInvitation as any).Company?.username || currentInvitation.organization?.name || 'Company';
  const invitedBy    = (currentInvitation as any).invitedBy?.username || (currentInvitation as any).invitedBy?.email || 'Team Admin';
  const inviteeEmail = (currentInvitation as any).email;
  const companyLetter = companyName[0]?.toUpperCase() || 'C';

  return (
    <Shell>
      <Box sx={{
        bgcolor: '#fff', borderRadius: '20px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}>
        {/* Soft role-tinted header */}
        <Box sx={{
          height: 96,
          background: `linear-gradient(145deg, ${roleStyle.lightBg}, #FFFFFF)`,
          borderBottom: '1px solid #F1F5F9', position: 'relative',
        }}>
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
          <InfoRow icon={<PersonOutlined />} label="Invited by" value={invitedBy} iconColor="#D97706" last={!currentInvitation.expiresAt} />
          {currentInvitation.expiresAt && (
            <InfoRow
              icon={<AccessTimeOutlined />} label="Expires"
              value={new Date(currentInvitation.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
            onClick={handleDecline}
            sx={{ borderRadius: '12px', borderColor: '#E2E8F0', color: '#64748B', '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1' } }}
          />
          <AppButton
            variant="primary" label="Accept"
            size="large" fullWidth
            loading={respondingToInvitation}
            startIcon={<CheckCircleOutlined sx={{ fontSize: 17 }} />}
            onClick={handleAccept}
            sx={{ borderRadius: '12px', boxShadow: `0 4px 14px ${PURPLE}35`, '&:hover': { boxShadow: `0 6px 20px ${PURPLE}45` } }}
          />
        </Box>
      </Box>
    </Shell>
  );
};

export default InvitationAcceptationPage;
