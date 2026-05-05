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
import WorkOutlineOutlined from '@mui/icons-material/WorkOutline';

const T    = '#0D9488';
const TL   = '#14B8A6';
const TBG  = '#F0FDFA';
const TBRD = '#99F6E4';
const NAVY = '#0D1B2A';

// ── Left sidebar ─────────────────────────────────────────────

const StatPill: React.FC<{ label: string; value: number | string; color: string; bg: string; border: string }> = ({ label, value, color, bg, border }) => (
  <Box sx={{ flex: 1, px: 1.5, py: 1.25, borderRadius: '10px', bgcolor: bg, border: `1px solid ${border}`, textAlign: 'center' }}>
    <Typography sx={{ fontSize: '1.3rem', fontWeight: 900, color, lineHeight: 1 }}>{value}</Typography>
    <Typography sx={{ fontSize: '0.65rem', color: '#6B7280', fontWeight: 500, mt: 0.25 }}>{label}</Typography>
  </Box>
);

const ProfileCard: React.FC<{
  displayName: string; email?: string; initial: string; avatarUrl?: string;
  targetRole?: string; experienceLevel?: string; score: number;
  labels: { score: string; assessment: string; };
  assessmentTypeLabel: string;
}> = ({ displayName, email, initial, avatarUrl, targetRole, experienceLevel, score, labels, assessmentTypeLabel }) => (
  <Box sx={{ bgcolor: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
    <Box sx={{ height: 56, background: `linear-gradient(135deg, ${NAVY} 0%, ${T} 100%)`, position: 'relative' }}>
      <Box sx={{ position: 'absolute', top: '50%', right: 16, transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', bgcolor: `${TL}30`, border: `1px solid ${TL}40` }} />
    </Box>
    <Box sx={{ px: 2, pb: 2 }}>
      <Box sx={{ mt: -3, mb: 1 }}>
        <Avatar src={avatarUrl} sx={{ width: 52, height: 52, bgcolor: T, fontSize: '1.2rem', fontWeight: 700, border: '2.5px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
          {initial}
        </Avatar>
      </Box>
      <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: NAVY, lineHeight: 1.2 }}>{displayName}</Typography>
      {email && <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', mt: 0.25, mb: 1 }}>{email}</Typography>}
      {targetRole && <Chip label={targetRole} size="small" sx={{ fontSize: '0.65rem', height: 20, bgcolor: TBG, border: `1px solid ${TBRD}`, color: T, fontWeight: 600, mb: 1 }} />}
      {experienceLevel && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <EmojiEventsOutlined sx={{ fontSize: 12, color: '#D97706' }} />
          <Typography sx={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 500 }}>{experienceLevel}</Typography>
        </Box>
      )}
      <Divider sx={{ my: 1.5 }} />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <StatPill label={labels.score} value={`${Math.round(score)}%`} color={score >= 70 ? '#059669' : score >= 50 ? '#D97706' : '#DC2626'} bg={score >= 70 ? '#F0FDF4' : score >= 50 ? '#FFFBEB' : '#FEF2F2'} border={score >= 70 ? '#BBF7D0' : score >= 50 ? '#FDE68A' : '#FECACA'} />
        <StatPill label={labels.assessment} value={assessmentTypeLabel} color={T} bg={TBG} border={TBRD} />
      </Box>
    </Box>
  </Box>
);

const ProfileStrengthCard: React.FC<{ title: string; checklist: { label: string; done: boolean }[] }> = ({ title, checklist }) => (
  <Box sx={{ bgcolor: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', p: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
      <TrendingUpOutlined sx={{ fontSize: 16, color: '#7C3AED' }} />
      <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: NAVY }}>{title}</Typography>
    </Box>
    <LinearProgress variant="determinate"
      value={Math.round((checklist.filter(c => c.done).length / checklist.length) * 100)}
      sx={{ height: 5, borderRadius: '99px', bgcolor: '#F3F4F6', mb: 1.5, '& .MuiLinearProgress-bar': { borderRadius: '99px', bgcolor: '#7C3AED' } }} />
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
      {checklist.map((item, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {item.done
            ? <CheckCircleOutlined sx={{ fontSize: 14, color: '#059669' }} />
            : <RadioButtonUncheckedOutlined sx={{ fontSize: 14, color: '#D1D5DB' }} />}
          <Typography sx={{ fontSize: '0.72rem', color: item.done ? '#374151' : '#9CA3AF', fontWeight: item.done ? 500 : 400 }}>
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  </Box>
);

// ── Right panel: assessment summary ──────────────────────────

const ScoreRing: React.FC<{ score: number; size?: number }> = ({ score, size = 80 }) => {
  const color = score >= 70 ? '#059669' : score >= 50 ? '#D97706' : '#DC2626';
  const r = (size / 2) - 8;
  const circ = 2 * Math.PI * r;
  const filled = (Math.min(score, 100) / 100) * circ;
  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${color}20`} strokeWidth={7} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={`${filled} ${circ}`} strokeLinecap="round" />
      </svg>
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ fontSize: size >= 80 ? '1rem' : '0.82rem', fontWeight: 900, color, lineHeight: 1 }}>{Math.round(score)}%</Typography>
      </Box>
    </Box>
  );
};

const AssessmentSummaryPanel: React.FC<{ assessment: any; analytics: any }> = ({ assessment, analytics }) => {
  const { t } = useTranslation('dashboard');
  const s = (k: string, opts?: any) => t(`candidate.assessment_detail.${k}`, opts) as string;
  const score = assessment?.interviewData?.finalReport?.coverage?.overall || 0;
  const scoreColor = score >= 70 ? '#059669' : score >= 50 ? '#D97706' : '#DC2626';
  const scoreLabel = score >= 70 ? s('summary.strong') : score >= 50 ? s('summary.good') : s('summary.needs_work');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Overall score */}
      <Box sx={{ bgcolor: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', p: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5 }}>
          {s('summary.overall_score')}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ScoreRing score={score} />
          <Box>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: scoreColor }}>{scoreLabel}</Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#6B7280', mt: 0.25 }}>{s('summary.coverage_performance')}</Typography>
          </Box>
        </Box>
      </Box>

      {/* Quick stats */}
      <Box sx={{ bgcolor: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', p: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.25 }}>
          {s('summary.interview_stats')}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 28, height: 28, borderRadius: '8px', bgcolor: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AccessTimeOutlined sx={{ fontSize: 14, color: '#2563EB' }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>{s('summary.duration')}</Typography>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: NAVY }}>
                {analytics?.duration ? `${Math.floor(analytics.duration / 60)}m ${analytics.duration % 60}s` : '—'}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 28, height: 28, borderRadius: '8px', bgcolor: TBG, border: `1px solid ${TBRD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ChatOutlined sx={{ fontSize: 14, color: T }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>{s('summary.messages')}</Typography>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: NAVY }}>{analytics?.messageCount ?? '—'}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 28, height: 28, borderRadius: '8px', bgcolor: '#FEF3C7', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AssessmentOutlined sx={{ fontSize: 14, color: '#D97706' }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>{s('summary.areas_covered')}</Typography>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: NAVY }}>
                {analytics?.completedAreas ?? '—'}/{analytics?.totalAreas ?? 4}
              </Typography>
            </Box>
          </Box>
          <Divider />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 28, height: 28, borderRadius: '8px', bgcolor: '#F5F3FF', border: '1px solid #DDD6FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <WorkOutlineOutlined sx={{ fontSize: 14, color: '#7C3AED' }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>{s('summary.job')}</Typography>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: NAVY, lineHeight: 1.3 }}>
                {assessment?.post?.jobDetails?.title || '—'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// ── Page ─────────────────────────────────────────────────────

const AssessmentDetailsPage = () => {
  const router    = useRouter();
  const { id }    = router.query;
  const { t }     = useTranslation('dashboard');
  const s = (k: string, opts?: any) => t(`candidate.assessment_detail.${k}`, opts) as string;
  const dispatch  = useDispatch<AppDispatch>();
  const profile   = useSelector((state: RootState) => state.user.connectedUser.profile);
  const user      = useSelector((state: RootState) => state.user.connectedUser.user);

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
  const coverageScore       = useMemo(() => assessment?.interviewData?.finalReport?.coverage?.overall || 0, [assessment]);

  // Profile sidebar data
  const displayName = profile?.firstName
    ? `${profile.firstName}${profile.lastName ? ` ${profile.lastName}` : ''}`
    : user?.username || s('candidate_fallback');
  const initial   = displayName[0]?.toUpperCase() || 'C';
  const avatarUrl = profile?.user_image
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Users/${profile.user_image}`
    : undefined;
  const quota = profile?.quota ?? 0;
  const checklist = [
    { label: s('checklist.complete_profile'), done: !!(profile?.firstName && profile?.lastName) },
    { label: s('checklist.add_target_role'),  done: !!profile?.targetRole                       },
    { label: s('checklist.set_experience'),   done: !!profile?.requiredExperienceLevel          },
    { label: s('checklist.first_skill_test'), done: quota > 0                                   },
  ];

  const jobTitle = assessment?.post?.jobDetails?.title || s('default_title');
  const assessmentTypeLabel = (assessment?.interviewData?.interviewType || 'HR').replace(/_/g, ' ');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'rgb(249 250 251)' }}>
      {/* Fixed header */}
      <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1200 }}>
        <Header breadcrumb={t('candidate.nav.dashboard')} onOpenMobile={() => {}} />
      </Box>

      <Box sx={{ flex: 1, mt: '64px', overflowY: 'auto', overflowX: 'hidden', p: { xs: 1.5, sm: 2.5, md: 3 } }} className="custom-scrollbar">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '240px 1fr', lg: '260px 1fr 240px' }, gap: 2.5, alignItems: 'start' }}>

          {/* ── LEFT: profile sidebar ── */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', gap: 2, position: 'sticky', top: 16, maxHeight: 'calc(100vh - 96px)', overflowY: 'auto' }} className="custom-scrollbar">
            <ProfileCard
              displayName={displayName} email={user?.email} initial={initial} avatarUrl={avatarUrl}
              targetRole={profile?.targetRole} experienceLevel={profile?.requiredExperienceLevel}
              score={coverageScore}
              labels={{ score: s('sidebar.score'), assessment: s('sidebar.assessment') }}
              assessmentTypeLabel={assessmentTypeLabel}
            />
            <ProfileStrengthCard title={s('sidebar.profile_strength')} checklist={checklist} />
          </Box>

          {/* ── CENTER: assessment content ── */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* Back nav */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                size="small"
                startIcon={<ChevronLeftOutlined sx={{ fontSize: '14px !important' }} />}
                onClick={() => router.push('/dashboard/candidate')}
                sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.72rem', color: '#6B7280', bgcolor: '#fff', border: '1px solid #E5E7EB', borderRadius: '10px', px: 1.5, py: 0.5, '&:hover': { bgcolor: '#F3F4F6' }, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
              >
                {s('back_to_dashboard')}
              </Button>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>{t('candidate.nav.dashboard')}</Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#CBD5E1' }}>›</Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>{t('candidate.nav.all_assessments')}</Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#CBD5E1' }}>›</Typography>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: NAVY }}>{loading ? s('loading_title') : jobTitle}</Typography>
              </Box>
            </Box>

            {/* Loading */}
            {loading && (
              <Box sx={{ bgcolor: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', p: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Skeleton variant="text" width="50%" height={28} />
                <Skeleton variant="text" width="30%" height={18} />
                <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
                <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
              </Box>
            )}

            {/* Error */}
            {!loading && error && (
              <Box sx={{ bgcolor: '#FEF2F2', borderRadius: '16px', border: '1px solid #FECACA', p: 3, textAlign: 'center' }}>
                <AssessmentOutlined sx={{ fontSize: 40, color: '#FECACA', mb: 1 }} />
                <Typography sx={{ color: '#DC2626', fontWeight: 700, fontSize: '0.9rem' }}>{s('error_title')}</Typography>
                <Typography sx={{ color: '#9CA3AF', fontSize: '0.78rem', mt: 0.5 }}>{error}</Typography>
              </Box>
            )}

            {/* Not found */}
            {!loading && !error && !assessment && (
              <Box sx={{ bgcolor: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', py: 10, textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <AssessmentOutlined sx={{ fontSize: 40, color: '#D1D5DB', mb: 1 }} />
                <Typography sx={{ color: '#9CA3AF', fontWeight: 600 }}>{s('not_found')}</Typography>
              </Box>
            )}

            {/* Main content — wrapped in dashboard-style cards */}
            {!loading && !error && assessment && (
              <>
                <Box sx={{ bgcolor: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <Box sx={{ height: 4, background: `linear-gradient(90deg, ${T}, ${TL})` }} />
                  <Box sx={{ p: 2.5 }}>
                    <AssessmentHeader assessment={assessment} container={false} />
                  </Box>
                </Box>

                {stepsData?.steps?.length > 0 && (
                  <PipelineSteps stepsData={stepsData} />
                )}

                {Object.keys(coverageAreas).length > 0 && (
                  <CoverageAnalysis coverageAreas={coverageAreas} />
                )}

                {Object.keys(coverageAreas).length > 0 && (
                  <CoverageAreas coverageAreas={coverageAreas} />
                )}

                {Object.keys(aiAnalysis).length > 0 && (
                  <AiAnalysisSection aiAnalysis={aiAnalysis} />
                )}

                {(requiredSkills.length > 0 || softSkills.length > 0) && (
                  <SkillsSection requiredSkills={requiredSkills} softSkills={softSkills} suggestedSkills={suggestedSkills} />
                )}

                {summary && (
                  <SummarySection summary={summary} />
                )}

                {(jobDescription || jobRequirements?.length > 0) && (
                  <JobDetailsSection description={jobDescription} requirements={jobRequirements} responsibilities={jobResponsibilities} />
                )}

                {recommendations.length > 0 && (
                  <RecommendationsSection recommendations={recommendations} />
                )}
              </>
            )}
          </Box>

          {/* ── RIGHT: assessment summary panel ── */}
          <Box sx={{ display: { xs: 'none', lg: 'flex' }, flexDirection: 'column', gap: 2, position: 'sticky', top: 16 }}>
            {!loading && assessment && (
              <AssessmentSummaryPanel assessment={assessment} analytics={analytics} />
            )}
            {loading && (
              <>
                <Box sx={{ bgcolor: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', p: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <Skeleton variant="circular" width={80} height={80} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="60%" />
                </Box>
                <Box sx={{ bgcolor: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', p: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <Skeleton variant="text" width="40%" sx={{ mb: 1 }} />
                  {[1, 2, 3].map(i => <Skeleton key={i} variant="rectangular" height={36} sx={{ borderRadius: 1, mb: 1 }} />)}
                </Box>
              </>
            )}
          </Box>

        </Box>
      </Box>
    </Box>
  );
};

export default dynamic(() => Promise.resolve(AssessmentDetailsPage), { ssr: false });
