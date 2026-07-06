import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import type { Campaign, ModuleType } from '@/modules/company/campaigns/types/campaign';
import {
  apiFetchByLinkToken, apiJoinByLink,
  apiFetchCampaignById, apiAddParticipant,
} from '@/modules/company/campaigns/api';
import type { CampaignModuleType } from '@/modules/interviews/campaign-interview';
import { MODULE_META } from './constants';
import { daysLeft, computeDeadlineBadge, resolveEligibility } from './helpers';
import type { EligibilityStatus } from './types';

export function useCampaignSession() {
  const router         = useRouter();
  const { campaignId } = router.query as { campaignId?: string };
  const token          = router.query.token as string | undefined;

  const user       = useSelector((state: RootState) => state.user.connectedUser.user);
  const profile    = useSelector((state: RootState) => state.user.connectedUser.profile);
  const isLoggedIn = !!user?._id;

  const [campaign,    setCampaign]    = useState<Campaign | null>(null);
  const [fetchError,  setFetchError]  = useState<string | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [eligibility, setEligibility] = useState<EligibilityStatus>('checking');

  const [showIdentity, setShowIdentity] = useState(false);
  const [name,         setName]         = useState('');
  const [email,        setEmail]        = useState('');
  const [nameErr,      setNameErr]      = useState('');
  const [emailErr,     setEmailErr]     = useState('');

  const [joining,              setJoining]              = useState(false);
  const [joinError,            setJoinError]            = useState<string | null>(null);
  const [view,                 setView]                 = useState<'overview' | 'questionnaire' | 'interview'>('overview');
  const [participantId,        setParticipantId]        = useState('');
  const [interviewCampaignId,  setInterviewCampaignId]  = useState('');
  const [interviewModuleType,  setInterviewModuleType]  = useState<CampaignModuleType>('AI_INTERVIEW');

  // ── Fetch ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!router.isReady || !campaignId) return;
    const load = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        let c: Campaign;
        if (token) {
          c = await apiFetchByLinkToken(token);
        } else if (isLoggedIn && user?._id) {
          c = await apiFetchCampaignById(campaignId, user._id);
        } else {
          try {
            const axios = (await import('@/utils/axiosInstance')).default;
            const res = await axios.get(`internal-campaigns/${campaignId}/public`);
            c = res.data.data;
          } catch {
            setEligibility('login_required');
            setLoading(false);
            return;
          }
        }
        setCampaign(c);
        setEligibility(resolveEligibility(c, isLoggedIn));
        if (c.accessMethod === 'LINK' && c.anonymityMode === 'NOMINATIVE' && !isLoggedIn) {
          setShowIdentity(true);
        }
      } catch (err: any) {
        setFetchError(err?.response?.data?.message ?? err?.message ?? 'Failed to load campaign');
        setEligibility('error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router.isReady, campaignId, token, isLoggedIn, user?._id]);

  // Pre-fill name/email from auth state
  useEffect(() => {
    const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ');
    if (fullName) setName(fullName);
    if (user?.email) setEmail(user.email);
  }, [profile, user]);

  // ── Identity validation ─────────────────────────────────────────────────────

  const validateIdentity = useCallback(() => {
    let ok = true;
    if (!name.trim()) { setNameErr('Your name is required'); ok = false; } else setNameErr('');
    if (!email.trim()) { setEmailErr('Your email is required'); ok = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setEmailErr('Enter a valid email address'); ok = false; }
    else setEmailErr('');
    return ok;
  }, [name, email]);

  // ── Start ───────────────────────────────────────────────────────────────────

  const handleStart = useCallback(async () => {
    if (!campaign || !campaignId) return;
    setJoining(true);
    setJoinError(null);
    const modType = campaign.module?.type as ModuleType;
    try {
      let resolvedId = campaignId;

      if (token) {
        const isNom = campaign.anonymityMode === 'NOMINATIVE';
        const nm = isLoggedIn
          ? [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || undefined
          : isNom ? name.trim() || undefined : undefined;
        const em = isLoggedIn ? (user?.email ?? undefined) : isNom ? email.trim() || undefined : undefined;
        const r = await apiJoinByLink(token, nm, em);
        if (!r.linkAccessToken && !r.anonymousToken && user?._id) {
          localStorage.setItem(`link_token_${r.campaignId}`, String(user._id));
        }
        resolvedId = r.campaignId ?? campaignId;
      } else if (isLoggedIn && user?._id) {
        try {
          const participant = await apiAddParticipant(campaignId, user._id);
          if (!participant.anonymousToken) localStorage.setItem(`link_token_${campaignId}`, String(user._id));
        } catch {
          localStorage.setItem(`link_token_${campaignId}`, String(user._id));
        }
      }

      if (modType === 'QUESTIONNAIRE') {
        const pid =
          localStorage.getItem(`anon_token_${resolvedId}`) ||
          localStorage.getItem(`link_token_${resolvedId}`) ||
          user?._id || '';
        setParticipantId(pid);
        setView('questionnaire');
        setJoining(false);
      } else if (modType === 'AI_INTERVIEW' || modType === 'SKILL_TEST') {
        const pid =
          localStorage.getItem(`anon_token_${resolvedId}`) ||
          localStorage.getItem(`link_token_${resolvedId}`) ||
          user?._id || '';
        setParticipantId(pid);
        setInterviewCampaignId(resolvedId);
        setInterviewModuleType(modType as CampaignModuleType);
        setView('interview');
        setJoining(false);
      } else {
        router.push(`/employee/campaigns/${resolvedId}`);
      }
    } catch (err: any) {
      setJoinError(err?.response?.data?.message ?? err?.message ?? 'Failed to join campaign');
      setJoining(false);
    }
  }, [campaign, campaignId, token, isLoggedIn, profile, user, name, email, router]);

  // ── Derived ─────────────────────────────────────────────────────────────────

  const modMeta     = useMemo(() => campaign?.module?.type ? MODULE_META[campaign.module.type as ModuleType] : null, [campaign]);
  const remaining   = useMemo(() => daysLeft(campaign?.deadline), [campaign?.deadline]);
  const deadlineBadge = useMemo(() => computeDeadlineBadge(campaign, remaining), [campaign, remaining]);
  const isAnon      = campaign?.anonymityMode === 'ANONYMOUS';
  const hasIdentity = !!(name.trim() && email.trim());

  const signIn = useCallback(() => {
    router.push(`/signin?returnUrl=${encodeURIComponent(router.asPath)}`);
  }, [router]);

  return {
    router, campaignId,
    campaign, fetchError, loading, eligibility,
    showIdentity, setShowIdentity,
    name, setName, email, setEmail,
    nameErr, setNameErr, emailErr, setEmailErr,
    joining, joinError, setJoinError,
    view, setView, participantId,
    interviewCampaignId, interviewModuleType,
    modMeta, remaining, isAnon, hasIdentity, deadlineBadge,
    isLoggedIn,
    validateIdentity, handleStart, signIn,
  };
}
