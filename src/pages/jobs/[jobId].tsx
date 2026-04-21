import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Box, Typography, Button, Chip, CircularProgress, Divider,
} from '@mui/material';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import BusinessIcon from '@mui/icons-material/Business';
import CodeIcon from '@mui/icons-material/Code';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchJobDetails } from '@/store/slices/jobDetailsSlice';
import { setConnectedUser } from '@/store/slices/userSlice';
import { getPostSkills, formatSalary, getLevelFromNumber, getSoftSkillLevelLabel, Skill } from '@/utils/postHelpers';
import OnboardingModal from '@/components/features/interview/OnboardingModal';
import Header from '@/components/layout/Header';

const PURPLE = '#8310FF';
const PURPLE_LIGHT = 'rgba(131,16,255,0.08)';
const PURPLE_BORDER = 'rgba(131,16,255,0.2)';

function formatDate(iso: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box sx={{ bgcolor: '#fff', border: '1px solid #E5E7EB', borderRadius: '16px', p: { xs: 2.5, md: 3 } }}>
    {children}
  </Box>
);

const SectionTitle: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
    <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: PURPLE_LIGHT, border: `1px solid ${PURPLE_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: PURPLE, flexShrink: 0 }}>
      {icon}
    </Box>
    <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: 'Poppins' }}>
      {title}
    </Typography>
  </Box>
);

const MetaBadge: React.FC<{ icon: React.ReactNode; label: string; color: string; bg: string; border: string }> = ({ icon, label, color, bg, border }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, bgcolor: bg, border: `1px solid ${border}`, borderRadius: 2, px: 1.5, py: 0.75 }}>
    <Box sx={{ fontSize: 14, color, display: 'flex' }}>{icon}</Box>
    <Typography sx={{ fontSize: '12px', fontWeight: 600, color, fontFamily: 'Poppins' }}>{label}</Typography>
  </Box>
);

// ─── Onboarding Modal ─────────────────────────────────────────────────────────


// ─── Main Page ────────────────────────────────────────────────────────────────

const JobLandingPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { jobId } = router.query;

  const jobDetails = useSelector((state: RootState) => state.jobDetails.jobDetails);
  const loading = useSelector((state: RootState) => state.jobDetails.loading);
  const error = useSelector((state: RootState) => state.jobDetails.error);

  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!router.isReady || !jobId) return;
    dispatch(fetchJobDetails(jobId as string));
  }, [router.isReady, jobId]);

  const handleApplySuccess = async (token: string, user: any, profile: any) => {
    // 1. Set cookies + localStorage token keys
    localStorage.setItem('token', token);
    localStorage.setItem('api_token', token);
    Cookies.set('api_token', token, { expires: 30, path: '/', sameSite: 'lax' });
    Cookies.set('user_role', user?.role || 'Candidate', { expires: 30, path: '/', sameSite: 'lax' });

    // 2. Directly write the persisted Redux state to localStorage so that
    //    PersistGate rehydrates the next page with the correct authenticated state.
    //    This avoids the race condition between dispatch() and persistor.flush().
    const authState = {
      isAuthenticated: true,
      token,
      isLoading: false,
      error: null,
      isLoggingOut: false,
    };
    const userState = {
      connectedUser: {
        user: user || null,
        profile: profile || null,
        planLimits: null,
        companyMembership: null,
        loading: false,
        error: null,
      },
      targetUser: {
        user: null,
        profile: null,
        planLimits: null,
        companyMembership: null,
        loading: false,
        error: null,
      },
      userType: 'candidate',
      currentSpace: null,
    };
    // Read existing persist:root to preserve other slices (planLimits, etc.)
    let existing: Record<string, string> = {};
    try {
      const raw = localStorage.getItem('persist:root');
      if (raw) existing = JSON.parse(raw);
    } catch { /* ignore */ }
    localStorage.setItem('persist:root', JSON.stringify({
      ...existing,
      auth: JSON.stringify(authState),
      user: JSON.stringify(userState),
    }));

    // 3. Also hydrate the live Redux store for the current page
    dispatch(setConnectedUser({ user, profile, planLimits: null, companyMembership: null }));

    const companyId = jobDetails?.user?._id || jobDetails?.user || '';
    setModalOpen(false);
    router.push(`/interview/hr?jobId=${jobId}${companyId ? `&companyId=${companyId}` : ''}&ref=link`);
  };

  if (!router.isReady || loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#F8F9FA', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <CircularProgress sx={{ color: PURPLE }} size={44} />
        <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.85rem', color: '#6B7280' }}>Loading job details…</Typography>
      </Box>
    );
  }

  if (error || !jobDetails) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#F8F9FA', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, px: 3 }}>
        <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.2rem', color: '#111827' }}>Job not found</Typography>
        <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.85rem', color: '#6B7280', textAlign: 'center' }}>
          This link may be expired or invalid. Please contact the recruiter.
        </Typography>
      </Box>
    );
  }

  const jd = jobDetails.jobDetails || {};
  const skills = getPostSkills(jobDetails);
  const companyName = jobDetails.user?.companyName || jobDetails.companyName || 'Company';
  const jobTitle = jd.title || jobDetails.title || 'Open Position';

  return (
    <>
      <Head>
        <title>{jobTitle} — TalentAI</title>
        <meta name="description" content={jd.description?.slice(0, 160) || 'Apply for this role on TalentAI'} />
      </Head>

      <Header />

      <Box sx={{ bgcolor: '#F8F9FA', minHeight: 'calc(100vh - 56px)', py: { xs: 3, md: 5 } }}>
        <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 4 }, display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'stretch', md: 'flex-start' } }}>

          {/* ── Left: Job details ── */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

            <SectionCard>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2.5 }}>
                <Box sx={{ width: 52, height: 52, borderRadius: '14px', flexShrink: 0, bgcolor: PURPLE_LIGHT, border: `1px solid ${PURPLE_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BusinessIcon sx={{ fontSize: 24, color: PURPLE }} />
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: { xs: '1.2rem', md: '1.45rem' }, color: '#111827', lineHeight: 1.2 }}>
                    {jobTitle}
                  </Typography>
                  <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.88rem', color: '#6B7280', mt: 0.5 }}>{companyName}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {jd.workMode && <MetaBadge icon={<LocationOnOutlinedIcon sx={{ fontSize: 14 }} />} label={jd.workMode} color="#2563EB" bg="#EFF6FF" border="#BFDBFE" />}
                {jd.employmentType && <MetaBadge icon={<WorkOutlineIcon sx={{ fontSize: 14 }} />} label={jd.employmentType} color="#7C3AED" bg="#F5F3FF" border="#DDD6FE" />}
                {jd.salary && formatSalary(jd.salary) && <MetaBadge icon={<AttachMoneyOutlinedIcon sx={{ fontSize: 14 }} />} label={formatSalary(jd.salary)} color="#16A34A" bg="#F0FDF4" border="#BBF7D0" />}
                {jobDetails.createdAt && <MetaBadge icon={<CalendarTodayOutlinedIcon sx={{ fontSize: 14 }} />} label={formatDate(jobDetails.createdAt)} color="#6B7280" bg="#F9FAFB" border="#E5E7EB" />}
              </Box>
            </SectionCard>

            {jd.description && (
              <SectionCard>
                <SectionTitle icon={<WorkOutlineIcon sx={{ fontSize: 15 }} />} title="Job Description" />
                <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.88rem', color: '#374151', lineHeight: 1.85, whiteSpace: 'pre-line' }}>{jd.description}</Typography>
              </SectionCard>
            )}

            {jd.requirements && (
              <SectionCard>
                <SectionTitle icon={<CheckCircleOutlineIcon sx={{ fontSize: 15 }} />} title="Requirements" />
                <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.88rem', color: '#374151', lineHeight: 1.85, whiteSpace: 'pre-line' }}>{jd.requirements}</Typography>
              </SectionCard>
            )}

            {skills.length > 0 && (
              <SectionCard>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  {skills.filter(s => s.type === 'technical').length > 0 && (
                    <Box sx={{ flex: 1 }}>
                      <SectionTitle icon={<CodeIcon sx={{ fontSize: 15 }} />} title="Technical Skills" />
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                        {skills.filter(s => s.type === 'technical').map((skill: Skill, i: number) => (
                          <Chip key={i} label={`${skill.name}${skill.level ? ` · ${getLevelFromNumber(skill.level)}` : ''}`} size="small"
                            sx={{ fontSize: '11px', fontWeight: 600, height: 24, bgcolor: PURPLE_LIGHT, color: PURPLE, border: `1px solid ${PURPLE_BORDER}`, fontFamily: 'Poppins' }} />
                        ))}
                      </Box>
                    </Box>
                  )}
                  {skills.filter(s => s.type === 'soft').length > 0 && (
                    <Box sx={{ flex: 1 }}>
                      <SectionTitle icon={<PsychologyIcon sx={{ fontSize: 15 }} />} title="Soft Skills" />
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                        {skills.filter(s => s.type === 'soft').map((skill: Skill, i: number) => (
                          <Chip key={i} label={`${skill.name}${skill.level ? ` · ${getSoftSkillLevelLabel(Number(skill.level))}` : ''}`} size="small"
                            sx={{ fontSize: '11px', fontWeight: 600, height: 24, bgcolor: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', fontFamily: 'Poppins' }} />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </SectionCard>
            )}
          </Box>

          {/* ── Right: Sticky apply panel ── */}
          <Box sx={{ width: { xs: '100%', md: 320 }, flexShrink: 0, position: { md: 'sticky' }, top: { md: 24 } }}>
            <SectionCard>
              <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.05rem', color: '#111827', mb: 0.5 }}>Ready to apply?</Typography>
              <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.82rem', color: '#6B7280', mb: 2.5, lineHeight: 1.6 }}>
                Fill in a short form and start your AI interview immediately.
              </Typography>

              {[
                { num: 1, label: 'Fill in your details', sub: 'Name, email, phone' },
                { num: 2, label: 'Upload your CV', sub: 'PDF format, required' },
                { num: 3, label: 'Start AI Interview', sub: 'Takes ~20 minutes' },
              ].map(({ num, label, sub }) => (
                <Box key={num} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.75 }}>
                  <Box sx={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, bgcolor: PURPLE_LIGHT, border: `1px solid ${PURPLE_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.75rem', color: PURPLE }}>{num}</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.85rem', color: '#111827' }}>{label}</Typography>
                    <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.75rem', color: '#9CA3AF' }}>{sub}</Typography>
                  </Box>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              <Button variant="contained" fullWidth onClick={() => setModalOpen(true)} endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: PURPLE, color: '#fff', fontWeight: 700, fontFamily: 'Poppins',
                  fontSize: '0.95rem', py: 1.5, borderRadius: '12px', textTransform: 'none',
                  boxShadow: 'none', '&:hover': { bgcolor: '#6d0ee0', boxShadow: 'none' },
                }}>
                Apply Now
              </Button>
              <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.72rem', color: '#9CA3AF', textAlign: 'center', mt: 1.25 }}>
                No account required · Takes ~20 min
              </Typography>
            </SectionCard>
          </Box>
        </Box>
      </Box>

      <OnboardingModal
        open={modalOpen}
        jobId={jobId as string}
        jobTitle={jobTitle}
        onClose={() => setModalOpen(false)}
        onSuccess={handleApplySuccess}
      />
    </>
  );
};

export default JobLandingPage;
