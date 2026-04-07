'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  CircularProgress,
  TextField,
  alpha,
} from '@mui/material';
import dynamic from 'next/dynamic';
import {
  ErrorOutline as ErrorIcon,
  LockOutlined as LockIcon,
  CalendarTodayOutlined as CalendarIcon,
  BusinessOutlined as CompanyIcon,
  PlayArrowOutlined as PlayIcon,
  LoginOutlined as LoginIcon,
  AssignmentOutlined as QuestionnaireIcon,
  PsychologyOutlined as AIIcon,
  AssignmentTurnedInOutlined as SkillIcon,
  PersonOutlined as PersonIcon,
} from '@mui/icons-material';
import {
  fetchCampaignByLinkToken,
  joinCampaignByLink,
} from '@/store/slices/campaignSlice';
import { AppDispatch, RootState } from '@/store/store';
import { Campaign } from '@/types/campaign';
import { fmtDate } from '@/utils/functions';

const MODULE_ICONS: Record<string, React.ElementType> = {
  QUESTIONNAIRE: QuestionnaireIcon,
  AI_INTERVIEW:  AIIcon,
  SKILL_TEST:    SkillIcon,
};

const MODULE_LABELS: Record<string, string> = {
  QUESTIONNAIRE: 'Questionnaire',
  AI_INTERVIEW:  'AI Interview',
  SKILL_TEST:    'Skill Test',
};

const CampaignJoinPage: React.FC = () => {
  const router   = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { token } = router.query as { token?: string };

  const user = useSelector((state: RootState) => state.user.connectedUser.user);

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [joining,  setJoining]  = useState(false);
  const [joinErr,  setJoinErr]  = useState<string | null>(null);

  // LINK+NOMINATIVE form state (for unauthenticated users)
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [nameErr,  setNameErr]  = useState('');

  // ── Fetch campaign by token ─────────────────────────────────────────────────
  useEffect(() => {
    if (!router.isReady || !token) return;
    setLoading(true);
    dispatch(fetchCampaignByLinkToken(token))
      .unwrap()
      .then((c) => setCampaign(c))
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  }, [router.isReady, token, dispatch]);

  // ── Auto-join for logged-in users on NOMINATIVE campaigns ──────────────────
  useEffect(() => {
    if (!campaign || !user || joining || joinErr) return;
    if (campaign.anonymityMode === 'NOMINATIVE') {
      handleJoin();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign, user]);

  const handleJoin = async (opts?: { name?: string; email?: string }) => {
    if (!token) return;
    setJoining(true);
    setJoinErr(null);
    try {
      const result = await dispatch(joinCampaignByLink({ token, ...opts })).unwrap();
      // LINK campaigns (anonymous or no-account nominative) → public assessment page
      if (result.anonymousToken || result.linkAccessToken) {
        router.push(`/campaign/assessment/${result.campaignId}`);
      } else {
        // Logged-in employee → employee assessment page
        router.push(`/employee/campaigns/${result.campaignId}/assessment`);
      }
    } catch (e: any) {
      setJoinErr(e);
      setJoining(false);
    }
  };

  const handleFormSubmit = () => {
    if (!name.trim()) {
      setNameErr('Please enter your name');
      return;
    }
    setNameErr('');
    handleJoin({ name: name.trim(), email: email.trim() || undefined });
  };

  const handleLoginRedirect = () => {
    router.push(`/signin?returnUrl=${encodeURIComponent(router.asPath)}`);
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (!router.isReady || loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC' }}>
        <CircularProgress sx={{ color: '#0D9488' }} />
      </Box>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error || !campaign) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC', p: 3 }}>
        <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
          <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <ErrorIcon sx={{ fontSize: 32, color: '#EF4444' }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#0F172A', mb: 1 }}>
            Campaign Not Found
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: '#64748B' }}>
            {error ?? 'This link is invalid or the campaign is no longer available.'}
          </Typography>
        </Box>
      </Box>
    );
  }

  const isExpired   = campaign.deadline ? new Date(campaign.deadline).getTime() < Date.now() : false;
  const isAnon      = campaign.anonymityMode === 'ANONYMOUS';
  const isAccounts  = campaign.accessMethod === 'ACCOUNTS';
  const ModIcon     = MODULE_ICONS[campaign.module?.type] ?? QuestionnaireIcon;
  const modLabel    = MODULE_LABELS[campaign.module?.type] ?? campaign.module?.type;
  const companyName = campaign.company && typeof campaign.company === 'object' ? (campaign.company as any).name : null;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC', p: 3 }}>
      <Box sx={{
        maxWidth: 480,
        width: '100%',
        bgcolor: '#fff',
        borderRadius: '20px',
        border: '1px solid #EDEEF0',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <Box sx={{
          background: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
          p: 3,
          pb: 2.5,
        }}>
          <Box sx={{
            width: 48, height: 48, borderRadius: '14px',
            bgcolor: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mb: 1.5,
          }}>
            <ModIcon sx={{ fontSize: 26, color: '#fff' }} />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#fff', lineHeight: 1.3, mb: 0.5 }}>
            {campaign.title}
          </Typography>
          {campaign.description && (
            <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
              {campaign.description}
            </Typography>
          )}
        </Box>

        {/* Meta */}
        <Box sx={{ px: 3, pt: 2.5, pb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {companyName && (
            <MetaRow icon={<CompanyIcon sx={{ fontSize: 15, color: '#0D9488' }} />} label="By" value={companyName} />
          )}
          <MetaRow
            icon={<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#0D9488' }} />}
            label="Type"
            value={modLabel}
          />
          {campaign.deadline && (
            <MetaRow
              icon={<CalendarIcon sx={{ fontSize: 15, color: isExpired ? '#EF4444' : '#64748B' }} />}
              label="Deadline"
              value={
                <Typography component="span" sx={{ fontSize: '0.8rem', fontWeight: 600, color: isExpired ? '#EF4444' : '#0F172A' }}>
                  {fmtDate(campaign.deadline)}{isExpired ? ' — Expired' : ''}
                </Typography>
              }
            />
          )}
          <MetaRow
            icon={<LockIcon sx={{ fontSize: 15, color: '#94A3B8' }} />}
            label="Mode"
            value={isAnon ? 'Anonymous' : 'Nominative'}
          />
        </Box>

        {/* Action area */}
        <Box sx={{ px: 3, pb: 3 }}>
          {isExpired ? (
            <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#FEF2F2', border: '1px solid #FECACA', textAlign: 'center' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#EF4444' }}>
                This campaign has expired
              </Typography>
            </Box>

          ) : isAccounts ? (
            /* ACCOUNTS campaign reached via link → must log in */
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ p: 2, borderRadius: '12px', bgcolor: alpha('#0D9488', 0.06), border: `1px solid ${alpha('#0D9488', 0.15)}`, textAlign: 'center' }}>
                <Typography sx={{ fontSize: '0.8rem', color: '#0F172A', fontWeight: 600 }}>
                  This campaign requires a TalentAI account
                </Typography>
              </Box>
              <ActionButton
                label="Sign In to Participate"
                icon={<LoginIcon sx={{ fontSize: 18 }} />}
                onClick={handleLoginRedirect}
              />
            </Box>

          ) : joinErr ? (
            <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#FEF2F2', border: '1px solid #FECACA', textAlign: 'center' }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#EF4444', mb: 1 }}>{joinErr}</Typography>
              <ActionButton label="Try Again" onClick={() => handleJoin()} loading={joining} />
            </Box>

          ) : isAnon ? (
            /* LINK+ANONYMOUS: anyone can start immediately */
            <ActionButton
              label={joining ? 'Starting…' : 'Start Assessment'}
              icon={<PlayIcon sx={{ fontSize: 18 }} />}
              onClick={() => handleJoin()}
              loading={joining}
            />

          ) : user ? (
            /* LINK+NOMINATIVE + logged in: auto-joining */
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress size={24} sx={{ color: '#0D9488' }} />
              <Typography sx={{ fontSize: '0.8rem', color: '#64748B', mt: 1 }}>Joining campaign…</Typography>
            </Box>

          ) : (
            /* LINK+NOMINATIVE + not logged in: name/email form */
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ p: 2, borderRadius: '12px', bgcolor: alpha('#0D9488', 0.06), border: `1px solid ${alpha('#0D9488', 0.15)}` }}>
                <Typography sx={{ fontSize: '0.8rem', color: '#0F172A', fontWeight: 600, mb: 0.5 }}>
                  Enter your details to participate
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>
                  No account needed — just your name.
                </Typography>
              </Box>
              <TextField
                size="small"
                placeholder="Your full name *"
                value={name}
                onChange={(e) => { setName(e.target.value); setNameErr(''); }}
                error={!!nameErr}
                helperText={nameErr}
                InputProps={{ startAdornment: <PersonIcon sx={{ fontSize: 16, color: '#94A3B8', mr: 0.75 }} /> }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.875rem' } }}
              />
              <TextField
                size="small"
                placeholder="Email address (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.875rem' } }}
              />
              <ActionButton
                label={joining ? 'Joining…' : 'Start Assessment'}
                icon={<PlayIcon sx={{ fontSize: 18 }} />}
                onClick={handleFormSubmit}
                loading={joining}
              />
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  component="span"
                  sx={{ fontSize: '0.75rem', color: '#0D9488', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
                  onClick={handleLoginRedirect}
                >
                  Sign in with your account instead
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

// ── Small helpers ─────────────────────────────────────────────────────────────

const MetaRow: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Box sx={{ width: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {icon}
    </Box>
    <Typography sx={{ fontSize: '0.775rem', color: '#94A3B8', fontWeight: 600, minWidth: 52 }}>{label}</Typography>
    {typeof value === 'string' ? (
      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#0F172A' }}>{value}</Typography>
    ) : value}
  </Box>
);

const ActionButton: React.FC<{ label: string; icon?: React.ReactNode; onClick: () => void; loading?: boolean }> = ({ label, icon, onClick, loading }) => (
  <Box
    onClick={!loading ? onClick : undefined}
    sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
      py: 1.375, px: 2.5, borderRadius: '12px', cursor: loading ? 'default' : 'pointer',
      background: loading ? '#E2E8F0' : 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
      boxShadow: loading ? 'none' : '0 4px 14px rgba(13,148,136,0.3)',
      transition: 'all 0.2s',
      ...(!loading && { '&:hover': { boxShadow: '0 6px 20px rgba(13,148,136,0.4)', transform: 'translateY(-1px)' } }),
    }}
  >
    {loading ? (
      <CircularProgress size={18} sx={{ color: '#64748B' }} />
    ) : (
      <>
        {icon}
        <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: loading ? '#64748B' : '#fff' }}>{label}</Typography>
      </>
    )}
  </Box>
);

export default dynamic(() => Promise.resolve(CampaignJoinPage), { ssr: false });
