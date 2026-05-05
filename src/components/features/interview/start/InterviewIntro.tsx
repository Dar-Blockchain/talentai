import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Container, Button, Chip, CircularProgress } from '@mui/material';
import { RootState } from '@/store/store';
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Header from '@/components/layout/Header';
import { GlobalStyles } from './styles';
import { useTranslation } from 'react-i18next';

const PURPLE = '#8310FF';
const PURPLE_BG = 'rgba(244,235,255,1)';
const PURPLE_BORDER = 'rgba(189,133,255,0.35)';

export interface ApplicantData {
  firstName: string;
  lastName: string;
  email: string;
  applicantId: string;
}

interface InterviewIntroProps {
  interviewConfig: any;
  hasJobId: boolean;
  jobId?: string;
  refParam?: string;
  totalSteps?: number;
  jobData?: any;
  checkingEligibility?: boolean;
  onNext: (applicantData: ApplicantData) => void;
}

const InterviewIntro: React.FC<InterviewIntroProps> = ({
  interviewConfig,
  hasJobId,
  jobId,
  refParam,
  jobData,
  checkingEligibility = false,
  onNext,
}) => {
  const { t } = useTranslation('interview');
  const authUser = useSelector((state: RootState) => state.user.connectedUser.user);
  const profile = useSelector((state: RootState) => state.user.connectedUser.profile);

  const handleNext = () => {
    const firstName = profile?.firstName || profile?.name?.split(' ')[0] || authUser?.username || 'Unknown';
    const lastName = profile?.lastName || profile?.name?.split(' ').slice(1).join(' ') || '';
    const email = authUser?.email || profile?.email || '';
    onNext({ firstName, lastName, email, applicantId: '' });
  };

  const duration = interviewConfig?.sessionSettings?.duration || 20;

  // Job data
  const jd = jobData?.jobDetails;
  const jobTitle = jd?.title || jobData?.title || interviewConfig?.context?.targetRole
    || (interviewConfig?.interviewType === 'TECHNICAL_INTERVIEW' ? 'Technical Interview'
      : interviewConfig?.interviewType === 'ASSESSMENT' ? 'Soft Skills Assessment'
      : interviewConfig?.interviewType === 'EVALUATION' ? 'Psychotechnic Assessment'
      : 'HR Interview');
  const company = jobData?.companyName || interviewConfig?.context?.targetCompany || '';
  const location = jd?.location || '';
  const contractType = jd?.employmentType || '';
  const workMode = jd?.workMode || '';
  const experienceLevel = jd?.experienceLevel || interviewConfig?.context?.experienceLevel || '';
  const skills: string[] = (jobData?.skillAnalysis?.requiredSkills || []).map((s: any) => s.name).filter(Boolean).slice(0, 6);
  const description = jd?.description || '';

  const tips = [
    t('intro.tip1'),
    t('intro.tip2'),
    t('intro.tip3'),
    t('intro.tip4'),
  ];

  return (
    <>
      <style jsx global>{GlobalStyles}</style>
      <Box sx={{ minHeight: '100vh', bgcolor: '#F8F9FA' }}>
        <Header />
        <Container maxWidth="md" sx={{ py: { xs: 3, md: 4 } }}>

          {/* Step indicator — 2 steps */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
              <Box sx={{ width: 26, height: 26, borderRadius: '50%', bgcolor: PURPLE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.68rem', fontFamily: 'Poppins' }}>1</Typography>
              </Box>
              <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.78rem', color: PURPLE, whiteSpace: 'nowrap' }}>{t('intro.step1_label')}</Typography>
            </Box>
            <Box sx={{ flex: 1, height: 1, bgcolor: '#E5E7EB', mx: 2 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
              <Box sx={{ width: 26, height: 26, borderRadius: '50%', bgcolor: 'transparent', border: '2px solid #D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ color: '#9CA3AF', fontWeight: 700, fontSize: '0.68rem', fontFamily: 'Poppins' }}>2</Typography>
              </Box>
              <Typography sx={{ fontFamily: 'Poppins', fontWeight: 400, fontSize: '0.78rem', color: '#9CA3AF', whiteSpace: 'nowrap' }}>{t('intro.step2_label')}</Typography>
            </Box>
          </Box>

          {/* Main card */}
          <Box sx={{ bgcolor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>

            {/* Header */}
            <Box sx={{ px: { xs: 3, md: 4 }, pt: 3, pb: 2.5, borderBottom: '1px solid #F3F4F6' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 42, height: 42, borderRadius: '10px', bgcolor: PURPLE_BG, border: `1px solid ${PURPLE_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <VideocamOutlinedIcon sx={{ color: PURPLE, fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.1rem', color: '#111827', lineHeight: 1.25 }}>
                    {jobTitle}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.3 }}>
                    <TimerOutlinedIcon sx={{ fontSize: 13, color: '#6B7280' }} />
                    <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.79rem', color: '#6B7280' }}>
                      {company ? `${company} · ` : ''}~{duration} min · AI-powered · Video & Voice
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Meta chips */}
              {(location || contractType || workMode || experienceLevel) && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                  {location && (
                    <Chip icon={<LocationOnOutlinedIcon />} label={location} size="small"
                      sx={{ bgcolor: '#F9FAFB', color: '#374151', fontFamily: 'Poppins', fontSize: '0.72rem', border: '1px solid #E5E7EB', '& .MuiChip-icon': { color: '#6B7280 !important', fontSize: '14px !important' } }} />
                  )}
                  {contractType && (
                    <Chip icon={<BusinessCenterOutlinedIcon />} label={contractType} size="small"
                      sx={{ bgcolor: '#F9FAFB', color: '#374151', fontFamily: 'Poppins', fontSize: '0.72rem', border: '1px solid #E5E7EB', '& .MuiChip-icon': { color: '#6B7280 !important', fontSize: '14px !important' } }} />
                  )}
                  {workMode && (
                    <Chip label={workMode} size="small"
                      sx={{ bgcolor: '#F9FAFB', color: '#374151', fontFamily: 'Poppins', fontSize: '0.72rem', border: '1px solid #E5E7EB' }} />
                  )}
                  {experienceLevel && (
                    <Chip label={experienceLevel} size="small"
                      sx={{ bgcolor: PURPLE_BG, color: PURPLE, fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.72rem', border: `1px solid ${PURPLE_BORDER}` }} />
                  )}
                </Box>
              )}
            </Box>

            {/* Body — two columns on md+ */}
            <Box sx={{ px: { xs: 3, md: 4 }, py: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 3, md: 4 } }}>

              {/* LEFT: About the role / skills */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {description && (
                  <Box>
                    <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.83rem', color: '#111827', mb: 1 }}>
                      {t('intro.about_role')}
                    </Typography>
                    <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', color: '#4B5563', lineHeight: 1.65 }}>
                      {description.length > 280 ? description.slice(0, 280) + '…' : description}
                    </Typography>
                  </Box>
                )}
                {skills.length > 0 && (
                  <Box>
                    <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.83rem', color: '#111827', mb: 1 }}>
                      {t('intro.key_skills')}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                      {skills.map((s, i) => (
                        <Chip key={i} label={s} size="small"
                          sx={{ bgcolor: PURPLE_BG, color: PURPLE, border: `1px solid ${PURPLE_BORDER}`, fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.72rem' }} />
                      ))}
                    </Box>
                  </Box>
                )}
                {!description && !skills.length && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, bgcolor: '#F9FAFB', borderRadius: '10px', border: '1px solid #F3F4F6' }}>
                    <MicNoneOutlinedIcon sx={{ color: PURPLE, fontSize: 20, flexShrink: 0 }} />
                    <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', color: '#4B5563', lineHeight: 1.6 }}>
                      {t('intro.voice_video_desc')}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* RIGHT: Before you start */}
              <Box>
                <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.83rem', color: '#111827', mb: 1.25 }}>
                  {t('intro.before_start')}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {tips.map((tip, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleOutlineIcon sx={{ fontSize: 16, color: PURPLE, flexShrink: 0 }} />
                      <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.79rem', color: '#4B5563' }}>{tip}</Typography>
                    </Box>
                  ))}
                </Box>

                {/* Interview format pills */}
                <Box sx={{ mt: 2.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, px: 1.25, py: 0.5, bgcolor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                    <VideocamOutlinedIcon sx={{ fontSize: 14, color: '#6B7280' }} />
                    <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.72rem', color: '#374151' }}>{t('intro.video_label')}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, px: 1.25, py: 0.5, bgcolor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                    <MicNoneOutlinedIcon sx={{ fontSize: 14, color: '#6B7280' }} />
                    <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.72rem', color: '#374151' }}>{t('intro.voice_label')}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, px: 1.25, py: 0.5, bgcolor: PURPLE_BG, border: `1px solid ${PURPLE_BORDER}`, borderRadius: '8px' }}>
                    <TimerOutlinedIcon sx={{ fontSize: 14, color: PURPLE }} />
                    <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.72rem', color: PURPLE, fontWeight: 600 }}>{duration} min</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Footer CTA */}
            <Box sx={{ px: { xs: 3, md: 4 }, pb: 3, pt: 0.5, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #F3F4F6' }}>
              <Button
                variant="contained"
                endIcon={checkingEligibility ? undefined : <ArrowForwardIcon />}
                onClick={handleNext}
                disabled={checkingEligibility}
                sx={{
                  bgcolor: PURPLE, color: '#fff', fontFamily: 'Poppins', fontWeight: 600,
                  fontSize: '0.86rem', px: 3.5, py: 1.15, borderRadius: '8px',
                  textTransform: 'none', boxShadow: 'none', minWidth: 160,
                  '&:hover': { bgcolor: '#6d0ee0', boxShadow: 'none' },
                  '&.Mui-disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF' },
                }}
              >
                {checkingEligibility ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} sx={{ color: '#9CA3AF' }} />
                    <span>{t('intro.checking')}</span>
                  </Box>
                ) : t('start.btn_start')}
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default InterviewIntro;
