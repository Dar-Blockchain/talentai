import {
  Box,
  Typography,
  Chip,
  Container,
  Button,
  Divider,
  CircularProgress,
} from '@mui/material';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Header from '@/components/layout/Header';
import { GlobalStyles } from './styles';

const PURPLE = '#8310FF';
const PURPLE_BG = 'rgba(244,235,255,1)';
const PURPLE_BORDER = 'rgba(189,133,255,0.35)';

interface JobOverviewProps {
  jobData: any | null;
  interviewConfig: any;
  pipelineLoading: boolean;
  hasJobId: boolean;
  onStart: () => void;
}

const JobOverview: React.FC<JobOverviewProps> = ({
  jobData,
  interviewConfig,
  pipelineLoading,
  hasJobId,
  onStart,
}) => {
  if (!jobData) {
    return (
      <>
        <style jsx global>{GlobalStyles}</style>
        <Box sx={{ minHeight: '100vh', bgcolor: '#F8F9FA' }}>
          <Header />
          <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, gap: 2 }}>
              <CircularProgress sx={{ color: PURPLE }} />
              <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.9rem', color: '#9ca3af' }}>
                Loading job details…
              </Typography>
            </Box>
          </Container>
        </Box>
      </>
    );
  }

  const jd = jobData?.jobDetails;
  const jobTitle = jd?.title || interviewConfig?.context?.targetRole || 'Interview';
  const company = jobData?.companyName || interviewConfig?.context?.targetCompany || '';
  const location = jd?.location || '';
  const contractType = jd?.employmentType || '';
  const workMode = jd?.workMode || '';
  const experienceLevel = jd?.experienceLevel || interviewConfig?.context?.experienceLevel || '';
  const description = jd?.description || '';
  const salary = jd?.salary;
  const skills: string[] = (jobData?.skillAnalysis?.requiredSkills || []).map((s: any) => s.name).filter(Boolean);
  const softSkills: string[] = (jobData?.skillAnalysis?.softSkills || []).map((s: any) => s.name).filter(Boolean);
  const requirements: string[] = jd?.requirements || [];
  const responsibilities: string[] = jd?.responsibilities || [];

  return (
    <>
      <style jsx global>{GlobalStyles}</style>
      <Box sx={{ minHeight: '100vh', bgcolor: '#F8F9FA' }}>
        <Header />
        <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>

          {/* Step indicator */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            {/* Step 1 — done */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                <Box sx={{ width: 26, height: 26, borderRadius: '50%', bgcolor: PURPLE_BG, border: `2px solid ${PURPLE}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ color: PURPLE, fontWeight: 700, fontSize: '0.68rem', fontFamily: 'Poppins' }}>✓</Typography>
                </Box>
                <Typography sx={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '0.78rem', color: PURPLE, whiteSpace: 'nowrap' }}>Introduction</Typography>
              </Box>
              <Box sx={{ flex: 1, height: 1, bgcolor: PURPLE, mx: 2 }} />
            </Box>
            {/* Step 2 — active */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                <Box sx={{ width: 26, height: 26, borderRadius: '50%', bgcolor: PURPLE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.68rem', fontFamily: 'Poppins' }}>2</Typography>
                </Box>
                <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.78rem', color: PURPLE, whiteSpace: 'nowrap' }}>Job Overview</Typography>
              </Box>
              <Box sx={{ flex: 1, height: 1, bgcolor: '#E5E7EB', mx: 2 }} />
            </Box>
            {/* Step 3 — pending */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
              <Box sx={{ width: 26, height: 26, borderRadius: '50%', bgcolor: 'transparent', border: '2px solid #D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ color: '#9CA3AF', fontWeight: 700, fontSize: '0.68rem', fontFamily: 'Poppins' }}>3</Typography>
              </Box>
              <Typography sx={{ fontFamily: 'Poppins', fontWeight: 400, fontSize: '0.78rem', color: '#9CA3AF', whiteSpace: 'nowrap' }}>AI Interview</Typography>
            </Box>
          </Box>

          {/* Main card */}
          <Box sx={{ bgcolor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>

            {/* Header */}
            <Box sx={{ px: { xs: 3, md: 4 }, pt: 3.5, pb: 2.5, borderBottom: '1px solid #F3F4F6' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: '10px', bgcolor: PURPLE_BG, border: `1px solid ${PURPLE_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <WorkOutlineIcon sx={{ color: PURPLE, fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.1rem', color: '#111827', lineHeight: 1.25 }}>
                    {jobTitle}
                  </Typography>
                  {company && (
                    <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.82rem', color: '#6B7280', mt: 0.25 }}>
                      {company}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Meta chips */}
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
                {salary && (
                  <Chip label={`${salary.min}–${salary.max} ${salary.currency}`} size="small"
                    sx={{ bgcolor: PURPLE_BG, color: PURPLE, fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.72rem', border: `1px solid ${PURPLE_BORDER}` }} />
                )}
              </Box>
            </Box>

            {/* Body */}
            <Box sx={{ px: { xs: 3, md: 4 }, py: 3.5, display: 'flex', flexDirection: 'column', gap: 3 }}>

              {/* Description */}
              {description && (
                <Box>
                  <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.85rem', color: '#111827', mb: 1.2 }}>
                    About this role
                  </Typography>
                  <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.83rem', color: '#4B5563', lineHeight: 1.7 }}>
                    {description.length > 600 ? description.slice(0, 600) + '…' : description}
                  </Typography>
                </Box>
              )}

              {/* Technical Skills + Soft Skills */}
              {(skills.length > 0 || softSkills.length > 0) && (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                  {skills.length > 0 && (
                    <Box>
                      <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.83rem', color: '#111827', mb: 1.2, position: 'relative', display: 'inline-block', '&::after': { content: '""', position: 'absolute', bottom: -3, left: 0, width: 28, height: 3, bgcolor: PURPLE, borderRadius: 1 } }}>
                        Technical Skills
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mt: 0.5 }}>
                        {skills.map((s: string, i: number) => (
                          <Chip key={i} label={s} size="small" sx={{ bgcolor: PURPLE_BG, color: PURPLE, border: `1px solid ${PURPLE_BORDER}`, fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.72rem' }} />
                        ))}
                      </Box>
                    </Box>
                  )}
                  {softSkills.length > 0 && (
                    <Box>
                      <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.83rem', color: '#111827', mb: 1.2, position: 'relative', display: 'inline-block', '&::after': { content: '""', position: 'absolute', bottom: -3, left: 0, width: 28, height: 3, bgcolor: PURPLE, borderRadius: 1 } }}>
                        Soft Skills
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mt: 0.5 }}>
                        {softSkills.map((s: string, i: number) => (
                          <Chip key={i} label={s} size="small" sx={{ bgcolor: PURPLE_BG, color: PURPLE, border: `1px solid ${PURPLE_BORDER}`, fontFamily: 'Poppins', fontSize: '0.72rem' }} />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              )}

              {/* Responsibilities */}
              {responsibilities.length > 0 && (
                <Box>
                  <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.83rem', color: '#111827', mb: 1.2 }}>
                    Responsibilities
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.7 }}>
                    {responsibilities.slice(0, 5).map((r: string, i: number) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: PURPLE, mt: 0.65, flexShrink: 0 }} />
                        <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.82rem', color: '#4B5563', lineHeight: 1.55 }}>{r}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Requirements */}
              {requirements.length > 0 && (
                <Box>
                  <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.83rem', color: '#111827', mb: 1.2 }}>
                    Requirements
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.7 }}>
                    {requirements.slice(0, 5).map((r: string, i: number) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <CheckCircleOutlineIcon sx={{ fontSize: 16, color: PURPLE, mt: 0.18, flexShrink: 0 }} />
                        <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.82rem', color: '#4B5563', lineHeight: 1.55 }}>{r}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              <Divider sx={{ borderColor: '#F3F4F6' }} />

              {/* CTA */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 0.5 }}>
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={onStart}
                  disabled={hasJobId && pipelineLoading}
                  sx={{
                    bgcolor: PURPLE,
                    color: '#fff',
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    fontSize: '0.86rem',
                    px: 3.5,
                    py: 1.15,
                    borderRadius: '8px',
                    textTransform: 'none',
                    boxShadow: 'none',
                    minWidth: 160,
                    '&:hover': { bgcolor: '#6d0ee0', boxShadow: 'none' },
                    '&.Mui-disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF' },
                  }}
                >
                  {hasJobId && pipelineLoading ? 'Loading…' : 'Pass Interview'}
                </Button>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default JobOverview;
