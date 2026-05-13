import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';
import {
  Box, Typography, Chip, Skeleton, Button, Avatar, LinearProgress, Divider,
} from '@mui/material';
import dynamic from 'next/dynamic';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { AppDispatch, RootState } from '@/store/store';
import {
  fetchAssessmentDetails,
  clearAssessmentDetails,
  selectAssessmentDetails,
  selectAssessmentStepsData,
  selectAssessmentDetailsLoading,
  selectAssessmentDetailsError,
} from '@/store/slices/postSlice';
import {
  AssessmentHeader,
  PipelineSteps,
  CoverageAnalysis,
  CoverageAreas,
  AiAnalysisSection,
  SkillsSection,
  SummarySection,
  JobDetailsSection,
  RecommendationsSection,
} from '@/components/features/interview/assessment';
import Header from '@/components/layout/dashboard/Header';
import ChevronLeftOutlined from '@mui/icons-material/ChevronLeftOutlined';
import AssessmentOutlined from '@mui/icons-material/AssessmentOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import EmojiEventsOutlined from '@mui/icons-material/EmojiEventsOutlined';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import RadioButtonUncheckedOutlined from '@mui/icons-material/RadioButtonUncheckedOutlined';
import AccessTimeOutlined from '@mui/icons-material/AccessTime';
import ChatOutlined from '@mui/icons-material/ChatOutlined';
import CalendarTodayOutlined from '@mui/icons-material/CalendarTodayOutlined';

const T     = '#0D9488';
const TL    = '#14B8A6';
const TBG   = '#F0FDFA';
const TBRD  = '#99F6E4';
const NAVY  = '#0F172A';
const NAVY2 = '#1E293B';
const GRAY  = '#64748B';
const GRAY2 = '#94A3B8';
const BORDER = '#E2E8F0';

const scoreColor  = (s: number) => s >= 70 ? '#059669' : s >= 50 ? '#D97706' : '#DC2626';
const scoreBg     = (s: number) => s >= 70 ? '#F0FDF4' : s >= 50 ? '#FFFBEB' : '#FEF2F2';
const scoreBorder = (s: number) => s >= 70 ? '#BBF7D0' : s >= 50 ? '#FDE68A' : '#FECACA';

// ── Score ring ─────────────────────────────────────────────────────────────────
const ScoreRing: React.FC<{ score: number; size?: number }> = ({ score, size = 88 }) => {
  const color = scoreColor(score);
  const r     = (size / 2) - 9;
  const circ  = 2 * Math.PI * r;
  const filled = (Math.min(score, 100) / 100) * circ;
  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`${color}20`} strokeWidth={8} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${filled} ${circ}`} strokeLinecap="round" />
      </svg>
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color, lineHeight: 1 }}>{Math.round(score)}%</Typography>
      </Box>
    </Box>
  );
};


// ── Left score block (top of left sidebar) ────────────────────────────────────
const ScoreBlock: React.FC<{ score: number; assessmentTypeLabel: string }> = ({ score, assessmentTypeLabel }) => {
  const sc         = scoreColor(score);
  const sb         = scoreBg(score);
  const sd         = scoreBorder(score);
  const scoreLabel = score >= 70 ? 'Strong' : score >= 50 ? 'Good' : 'Needs Work';
  return (
    <Box sx={{ bgcolor: '#fff', borderRadius: '18px', border: `1px solid ${BORDER}`, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
      <Box sx={{ height: 3, background: `linear-gradient(90deg, ${T}, ${TL})` }} />
      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: GRAY2, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.5 }}>
          Overall Score
        </Typography>
        {/* Big score ring */}
        <ScoreRing score={score} size={100} />
        {/* Label */}
        <Box sx={{ mt: 1.5, px: 2, py: 0.75, borderRadius: '99px', bgcolor: sb, border: `1px solid ${sd}` }}>
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: sc }}>{scoreLabel}</Typography>
        </Box>
        <Typography sx={{ fontSize: '0.7rem', color: GRAY2, mt: 0.75 }}>Coverage performance</Typography>
        {/* Assessment type */}
        <Divider sx={{ width: '100%', borderColor: BORDER, my: 1.5 }} />
        <Chip
          label={assessmentTypeLabel}
          size="small"
          sx={{ height: 24, fontSize: '0.68rem', fontWeight: 700, bgcolor: TBG, color: T, border: `1px solid ${TBRD}` }}
        />
      </Box>
    </Box>
  );
};

// ── Left profile card ──────────────────────────────────────────────────────────
const ProfileCard: React.FC<{
  displayName: string; email?: string; initial: string; avatarUrl?: string;
  targetRole?: string; experienceLevel?: string;
}> = ({ displayName, email, initial, avatarUrl, targetRole, experienceLevel }) => (
  <Box sx={{ bgcolor: '#fff', borderRadius: '18px', border: `1px solid ${BORDER}`, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
    {/* Banner */}
    <Box sx={{ height: 56, background: `linear-gradient(135deg, ${NAVY} 0%, ${T} 100%)`, position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ position: 'absolute', top: -10, right: -10, width: 60, height: 60, borderRadius: '50%', bgcolor: `${TL}25` }} />
      <Box sx={{ position: 'absolute', bottom: -8, left: 16, width: 36, height: 36, borderRadius: '50%', bgcolor: `${T}20` }} />
    </Box>
    <Box sx={{ px: 2, pb: 2 }}>
      <Box sx={{ mt: -3.5, mb: 1.25 }}>
        <Avatar src={avatarUrl} sx={{ width: 52, height: 52, bgcolor: T, fontSize: '1.2rem', fontWeight: 700, border: '3px solid #fff', boxShadow: '0 3px 10px rgba(0,0,0,0.14)' }}>
          {initial}
        </Avatar>
      </Box>
      <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: NAVY, lineHeight: 1.2 }}>{displayName}</Typography>
      {email && <Typography sx={{ fontSize: '0.7rem', color: GRAY2, mt: 0.3 }}>{email}</Typography>}
      {(targetRole || experienceLevel) && (
        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
          {targetRole && (
            <Chip label={targetRole} size="small" sx={{ fontSize: '0.63rem', height: 20, bgcolor: TBG, border: `1px solid ${TBRD}`, color: T, fontWeight: 600 }} />
          )}
          {experienceLevel && (
            <Chip
              icon={<EmojiEventsOutlined sx={{ fontSize: '11px !important', color: '#D97706 !important' }} />}
              label={experienceLevel} size="small"
              sx={{ fontSize: '0.63rem', height: 20, bgcolor: '#FFFBEB', border: '1px solid #FDE68A', color: '#D97706', fontWeight: 600 }}
            />
          )}
        </Box>
      )}
    </Box>
  </Box>
);

// ── Profile strength card ──────────────────────────────────────────────────────
const ProfileStrengthCard: React.FC<{ title: string; checklist: { label: string; done: boolean }[] }> = ({ title, checklist }) => {
  const pct = Math.round((checklist.filter(c => c.done).length / checklist.length) * 100);
  return (
    <Box sx={{ bgcolor: '#fff', borderRadius: '18px', border: `1px solid ${BORDER}`, p: 2, boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <TrendingUpOutlined sx={{ fontSize: 15, color: '#7C3AED' }} />
          <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: NAVY }}>{title}</Typography>
        </Box>
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#7C3AED' }}>{pct}%</Typography>
      </Box>
      <LinearProgress variant="determinate" value={pct} sx={{
        height: 5, borderRadius: '99px', bgcolor: '#F3F4F6', mb: 1.75,
        '& .MuiLinearProgress-bar': { borderRadius: '99px', bgcolor: '#7C3AED' },
      }} />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.85 }}>
        {checklist.map((item, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {item.done
              ? <CheckCircleOutlined sx={{ fontSize: 14, color: '#059669' }} />
              : <RadioButtonUncheckedOutlined sx={{ fontSize: 14, color: '#D1D5DB' }} />}
            <Typography sx={{ fontSize: '0.72rem', color: item.done ? NAVY2 : GRAY2, fontWeight: item.done ? 500 : 400 }}>
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// ── Right summary panel ────────────────────────────────────────────────────────
const AssessmentSummaryPanel: React.FC<{ analytics: any; coverageAreas: Record<string, any> }> = ({
  analytics, coverageAreas,
}) => {
  const { t } = useTranslation('dashboard');
  const s = (k: string) => t(`candidate.assessment_detail.${k}`) as string;
  const areaEntries = Object.entries(coverageAreas).slice(0, 5);
  const AREA_COLORS = ['#0D9488', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6'];

  const durationSec = analytics?.duration ? Math.floor(analytics.duration / 1000) : 0;
  const durationFmt = durationSec > 0
    ? (durationSec >= 60 ? `${Math.floor(durationSec / 60)}m ${durationSec % 60}s` : `${durationSec}s`)
    : '—';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

      {/* Coverage areas mini card */}
      {areaEntries.length > 0 && (
        <Box sx={{ bgcolor: '#fff', borderRadius: '18px', border: `1px solid ${BORDER}`, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
          <Box sx={{ height: 3, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
          <Box sx={{ p: 2 }}>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: GRAY2, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.5 }}>
              Coverage Areas
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              {areaEntries.map(([key, data]: [string, any], idx) => {
                const pct = Math.round(data.percentage || 0);
                const col = AREA_COLORS[idx % AREA_COLORS.length];
                return (
                  <Box key={key}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: NAVY2, textTransform: 'capitalize' }}>
                        {key.replace(/_/g, ' ')}
                      </Typography>
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: col }}>{pct}%</Typography>
                    </Box>
                    <Box sx={{ height: 5, borderRadius: '99px', bgcolor: '#F1F5F9', overflow: 'hidden' }}>
                      <Box sx={{ height: '100%', borderRadius: '99px', width: `${pct}%`, bgcolor: col, transition: 'width 0.5s ease' }} />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      )}

      {/* Quick stats card */}
      <Box sx={{ bgcolor: '#fff', borderRadius: '18px', border: `1px solid ${BORDER}`, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
        <Box sx={{ height: 3, background: 'linear-gradient(90deg, #D97706, #f59e0b)' }} />
        <Box sx={{ p: 2 }}>
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: GRAY2, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.5 }}>
            {s('summary.interview_stats')}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {[
              { label: s('summary.duration'),     value: durationFmt,                                              iconBg: '#EFF6FF', iconColor: '#2563EB', icon: <AccessTimeOutlined sx={{ fontSize: 14 }} /> },
              { label: s('summary.messages'),     value: analytics?.messageCount ?? '—',                           iconBg: TBG,       iconColor: T,          icon: <ChatOutlined sx={{ fontSize: 14 }} />         },
              { label: s('summary.areas_covered'), value: `${analytics?.completedAreas ?? 0} / ${analytics?.totalAreas ?? 4}`, iconBg: '#FEF3C7', iconColor: '#D97706', icon: <AssessmentOutlined sx={{ fontSize: 14 }} /> },
            ].map((item, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: '7px 10px', borderRadius: '10px', bgcolor: '#F8FAFC', border: `1px solid ${BORDER}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 26, height: 26, borderRadius: '8px', bgcolor: item.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box sx={{ color: item.iconColor, display: 'flex' }}>{item.icon}</Box>
                  </Box>
                  <Typography sx={{ fontSize: '0.72rem', color: GRAY, fontWeight: 500 }}>{item.label}</Typography>
                </Box>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: NAVY2 }}>{item.value}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

    </Box>
  );
};

// ── Hero banner (top of center column) ────────────────────────────────────────
const HeroBanner: React.FC<{ jobTitle: string; date: string; assessmentType: string }> =
  ({ jobTitle, date, assessmentType }) => {
  return (
    <Box sx={{
      borderRadius: '20px', overflow: 'hidden',
      background: `linear-gradient(135deg, ${NAVY} 0%, #1a3a5c 50%, ${T} 100%)`,
      boxShadow: '0 4px 24px rgba(13,26,42,0.18)',
      position: 'relative',
    }}>
      {/* Decorative circles */}
      <Box sx={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', bgcolor: `${TL}18` }} />
      <Box sx={{ position: 'absolute', bottom: -30, left: -20, width: 100, height: 100, borderRadius: '50%', bgcolor: `${T}15` }} />

      <Box sx={{ position: 'relative', p: { xs: 2.5, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Chip label={assessmentType} size="small" sx={{ fontSize: '0.65rem', fontWeight: 700, height: 22, bgcolor: `${TL}30`, color: '#fff', border: `1px solid ${TL}50` }} />
        </Box>
        <Typography sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' }, fontWeight: 900, color: '#fff', lineHeight: 1.2, mb: 0.75 }}>
          {jobTitle}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <CalendarTodayOutlined sx={{ fontSize: 13, color: `${TL}CC` }} />
          <Typography sx={{ fontSize: '0.75rem', color: `${TL}CC`, fontWeight: 500 }}>{date}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

// ── Page ───────────────────────────────────────────────────────────────────────
const AssessmentDetailsPage = () => {
  const router   = useRouter();
  const { id }   = router.query;
  const { t }    = useTranslation('dashboard');
  const s = (k: string) => t(`candidate.assessment_detail.${k}`) as string;
  const dispatch = useDispatch<AppDispatch>();
  const profile  = useSelector((state: RootState) => state.user.connectedUser.profile);
  const user     = useSelector((state: RootState) => state.user.connectedUser.user);

  const assessment = useSelector(selectAssessmentDetails);
  const stepsData  = useSelector(selectAssessmentStepsData);
  const loading    = useSelector(selectAssessmentDetailsLoading);
  const error      = useSelector(selectAssessmentDetailsError);

  useEffect(() => {
    if (!id) return;
    dispatch(fetchAssessmentDetails(id as string));
    return () => { dispatch(clearAssessmentDetails()); };
  }, [id, dispatch]);

  const coverageAreas       = useMemo(() => assessment?.interviewData?.finalReport?.coverage?.areas || {}, [assessment]);
  const aiAnalysis          = useMemo(() => assessment?.interviewData?.finalReport?.aiAnalysis || {}, [assessment]);
  const requiredSkills      = useMemo(() => assessment?.post?.skillAnalysis?.requiredSkills || [], [assessment]);
  const softSkills          = useMemo(() => assessment?.post?.skillAnalysis?.softSkills || [], [assessment]);
  const suggestedSkills     = useMemo(() => assessment?.post?.skillAnalysis?.suggestedSkills || {}, [assessment]);
  const summary             = useMemo(() => assessment?.interviewData?.finalReport?.summary || '', [assessment]);
  const recommendations     = useMemo(() => assessment?.interviewData?.finalReport?.recommendations || [], [assessment]);
  const jobDescription      = useMemo(() => assessment?.post?.jobDetails?.description || '', [assessment]);
  const jobRequirements     = useMemo(() => assessment?.post?.jobDetails?.requirements, [assessment]);
  const jobResponsibilities = useMemo(() => assessment?.post?.jobDetails?.responsibilities, [assessment]);
  const analytics           = useMemo(() => assessment?.interviewData?.analytics || {}, [assessment]);
  const coverageScore       = useMemo(() => assessment?.interviewData?.finalReport?.scores?.overall || 0, [assessment]);

  const displayName = profile?.firstName
    ? `${profile.firstName}${profile.lastName ? ` ${profile.lastName}` : ''}`
    : user?.username || s('candidate_fallback');
  const initial   = displayName[0]?.toUpperCase() || 'C';
  const avatarUrl = profile?.user_image
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Users/${profile.user_image}`
    : undefined;

  const checklist = [
    { label: s('checklist.complete_profile'), done: !!(profile?.firstName && profile?.lastName) },
    { label: s('checklist.add_target_role'),  done: !!profile?.targetRole                       },
    { label: s('checklist.set_experience'),   done: !!profile?.requiredExperienceLevel          },
    { label: s('checklist.first_skill_test'), done: (profile?.quota ?? 0) > 0                  },
  ];

  const jobTitle            = assessment?.post?.jobDetails?.title || s('default_title');
  const assessmentTypeLabel = (assessment?.interviewData?.interviewType || 'HR').replace(/_/g, ' ');
  const assessmentDate      = assessment?.createdAt
    ? new Date(assessment.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#F8FAFC' }}>
      <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1200 }}>
        <Header breadcrumb={t('candidate.nav.dashboard')} onOpenMobile={() => {}} />
      </Box>

      <Box sx={{ flex: 1, mt: '64px', overflowY: 'auto', overflowX: 'hidden', p: { xs: 1.5, sm: 2.5, md: 3 } }} className="custom-scrollbar">
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '252px 1fr', lg: '252px 1fr 252px' }, gap: 2.5, alignItems: 'start' }}>

            {/* ── LEFT sidebar ── */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', gap: 2, position: 'sticky', top: 16 }}>
              {loading ? (
                <>
                  <Box sx={{ bgcolor: '#fff', borderRadius: '18px', border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
                    <Skeleton variant="rectangular" height={56} />
                    <Box sx={{ p: 2 }}>
                      <Skeleton variant="circular" width={52} height={52} sx={{ mb: 1, mt: -3 }} />
                      <Skeleton variant="text" width="70%" height={22} />
                      <Skeleton variant="text" width="50%" height={16} />
                    </Box>
                  </Box>
                  <Box sx={{ bgcolor: '#fff', borderRadius: '18px', border: `1px solid ${BORDER}`, p: 2 }}>
                    <Skeleton variant="text" width="60%" sx={{ mb: 1 }} />
                    <Skeleton variant="rounded" height={6} sx={{ borderRadius: '99px', mb: 1.5 }} />
                    {[1,2,3,4].map(i => <Skeleton key={i} variant="text" width="80%" sx={{ mb: 0.75 }} />)}
                  </Box>
                </>
              ) : (
                <>
                  <ProfileCard
                    displayName={displayName} email={user?.email} initial={initial} avatarUrl={avatarUrl}
                    targetRole={profile?.targetRole} experienceLevel={profile?.requiredExperienceLevel}
                  />
                  <ProfileStrengthCard title={s('sidebar.profile_strength')} checklist={checklist} />
                </>
              )}
            </Box>

            {/* ── CENTER content ── */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

              {/* Back nav */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Button
                  size="small"
                  startIcon={<ChevronLeftOutlined sx={{ fontSize: '14px !important' }} />}
                  onClick={() => router.push('/candidate/dashboard')}
                  sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.72rem', color: GRAY, bgcolor: '#fff', border: `1px solid ${BORDER}`, borderRadius: '10px', px: 1.5, py: 0.6, '&:hover': { bgcolor: '#F8FAFC' }, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                >
                  {s('back_to_dashboard')}
                </Button>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                  <Typography sx={{ fontSize: '0.72rem', color: GRAY2 }}>{t('candidate.nav.dashboard')}</Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: '#CBD5E1' }}>›</Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: GRAY2 }}>{t('candidate.nav.all_assessments')}</Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: '#CBD5E1' }}>›</Typography>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: NAVY }}>{loading ? s('loading_title') : jobTitle}</Typography>
                </Box>
              </Box>

              {/* Loading */}
              {loading && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Skeleton variant="rounded" height={120} sx={{ borderRadius: '20px' }} />
                  <Box sx={{ bgcolor: '#fff', borderRadius: '18px', border: `1px solid ${BORDER}`, p: 3 }}>
                    <Skeleton variant="text" width="50%" height={28} sx={{ mb: 1.5 }} />
                    <Skeleton variant="text" width="30%" height={18} sx={{ mb: 2 }} />
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
                      {[1,2,3,4].map(i => <Skeleton key={i} variant="rounded" height={80} sx={{ borderRadius: '12px' }} />)}
                    </Box>
                  </Box>
                  <Skeleton variant="rounded" height={200} sx={{ borderRadius: '18px' }} />
                </Box>
              )}

              {/* Error */}
              {!loading && error && (
                <Box sx={{ bgcolor: '#FEF2F2', borderRadius: '18px', border: '1px solid #FECACA', p: 4, textAlign: 'center' }}>
                  <AssessmentOutlined sx={{ fontSize: 44, color: '#FECACA', mb: 1.5 }} />
                  <Typography sx={{ color: '#DC2626', fontWeight: 700, fontSize: '0.95rem' }}>{s('error_title')}</Typography>
                  <Typography sx={{ color: GRAY2, fontSize: '0.8rem', mt: 0.5 }}>{error}</Typography>
                </Box>
              )}

              {/* Not found */}
              {!loading && !error && !assessment && (
                <Box sx={{ bgcolor: '#fff', borderRadius: '18px', border: `1px solid ${BORDER}`, py: 12, textAlign: 'center' }}>
                  <AssessmentOutlined sx={{ fontSize: 44, color: '#D1D5DB', mb: 1.5 }} />
                  <Typography sx={{ color: GRAY2, fontWeight: 600 }}>{s('not_found')}</Typography>
                </Box>
              )}

              {/* Content */}
              {!loading && !error && assessment && (
                <>
                  {/* Hero */}
                  <HeroBanner
                    jobTitle={jobTitle} date={assessmentDate}
                    assessmentType={assessmentTypeLabel}
                  />

                  {/* Assessment header (info pills + analytics stats) */}
                  <AssessmentHeader assessment={assessment} />

                  {stepsData?.steps?.length > 0 && <PipelineSteps stepsData={stepsData} />}
                  {Object.keys(coverageAreas).length > 0 && <CoverageAnalysis coverageAreas={coverageAreas} />}
                  {Object.keys(coverageAreas).length > 0 && <CoverageAreas coverageAreas={coverageAreas} />}
                  {Object.keys(aiAnalysis).length > 0 && <AiAnalysisSection aiAnalysis={aiAnalysis} />}
                  {(requiredSkills.length > 0 || softSkills.length > 0) && (
                    <SkillsSection requiredSkills={requiredSkills} softSkills={softSkills} suggestedSkills={suggestedSkills} />
                  )}
                  {summary && <SummarySection summary={summary} />}
                  {(jobDescription || jobRequirements?.length > 0) && (
                    <JobDetailsSection description={jobDescription} requirements={jobRequirements} responsibilities={jobResponsibilities} />
                  )}
                  {recommendations.length > 0 && <RecommendationsSection recommendations={recommendations} />}
                </>
              )}
            </Box>

            {/* ── RIGHT sidebar ── */}
            <Box sx={{ display: { xs: 'none', lg: 'flex' }, flexDirection: 'column', gap: 2, position: 'sticky', top: 16 }}>
              {loading ? (
                <>
                  <Box sx={{ bgcolor: '#fff', borderRadius: '18px', border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
                    <Skeleton variant="rectangular" height={3} />
                    <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Skeleton variant="circular" width={100} height={100} sx={{ mb: 1.5 }} />
                      <Skeleton variant="rounded" width={90} height={28} sx={{ borderRadius: '99px', mb: 0.75 }} />
                      <Skeleton variant="text" width="60%" />
                    </Box>
                  </Box>
                  <Box sx={{ bgcolor: '#fff', borderRadius: '18px', border: `1px solid ${BORDER}`, p: 2 }}>
                    <Skeleton variant="text" width="50%" sx={{ mb: 1.5 }} />
                    {[1,2,3,4].map(i => <Skeleton key={i} variant="rounded" height={36} sx={{ borderRadius: '9px', mb: 1 }} />)}
                  </Box>
                </>
              ) : assessment ? (
                <>
                  <ScoreBlock score={coverageScore} assessmentTypeLabel={assessmentTypeLabel} />
                  <AssessmentSummaryPanel analytics={analytics} coverageAreas={coverageAreas} />
                </>
              ) : null}
            </Box>

          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default dynamic(() => Promise.resolve(AssessmentDetailsPage), { ssr: false });
