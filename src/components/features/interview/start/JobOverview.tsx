import React from 'react';
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
        <Box sx={{ minHeight: '100vh', bgcolor: '#fff' }}>
          <Header />
          <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, gap: 2 }}>
              <CircularProgress sx={{ color: 'rgba(163,98,239,1)' }} />
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
      <Box sx={{ minHeight: '100vh', bgcolor: '#fff' }}>
        <Header />
        <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>

          {/* Step indicator — Step 1 done, Step 2 active, Step 3 pending */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            {/* Step 1 — done */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: 'rgba(189,133,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ color: 'rgba(163,98,239,1)', fontWeight: 700, fontSize: '0.7rem', fontFamily: 'Poppins' }}>✓</Typography>
              </Box>
              <Typography sx={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '0.8rem', color: 'rgba(163,98,239,0.6)' }}>Introduction</Typography>
            </Box>
            <Box sx={{ flex: 1, height: 2, bgcolor: 'rgba(163,98,239,1)', borderRadius: 1 }} />
            {/* Step 2 — active */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: 'rgba(163,98,239,1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.7rem', fontFamily: 'Poppins' }}>2</Typography>
              </Box>
              <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.8rem', color: 'rgba(163,98,239,1)' }}>Job Overview</Typography>
            </Box>
            <Box sx={{ flex: 1, height: 2, bgcolor: '#e8e2f5', borderRadius: 1 }} />
            {/* Step 3 — pending */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: '#e8e2f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ color: '#9ca3af', fontWeight: 700, fontSize: '0.7rem', fontFamily: 'Poppins' }}>3</Typography>
              </Box>
              <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.8rem', color: '#9ca3af' }}>AI Interview</Typography>
            </Box>
          </Box>

          {/* Main card */}
          <Box sx={{ bgcolor: '#fff', borderRadius: '20px', border: '1px solid #e8e2f5', boxShadow: '0 8px 32px rgba(131,16,255,0.08)', overflow: 'hidden' }}>

            {/* Header */}
            <Box sx={{ px: { xs: 3, md: 4 }, pt: 3.5, pb: 2.5, borderBottom: '1px solid rgba(232,232,232,1)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: 'rgba(250,246,255,1)', border: '1px solid rgba(189,133,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <WorkOutlineIcon sx={{ color: 'rgba(163,98,239,1)', fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.2rem', color: '#000', lineHeight: 1.25 }}>
                    {jobTitle}
                  </Typography>
                  {company && (
                    <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.82rem', color: 'rgba(100,113,131,1)', mt: 0.25 }}>
                      {company}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Meta chips */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                {location && (
                  <Chip icon={<LocationOnOutlinedIcon />} label={location} size="small"
                    sx={{ bgcolor: 'rgba(0,0,0,0.04)', color: 'rgba(56,68,85,1)', fontFamily: 'Poppins', fontSize: '0.72rem', border: '1px solid rgba(25,25,25,0.1)', '& .MuiChip-icon': { color: 'rgba(100,113,131,1) !important', fontSize: '14px !important' } }} />
                )}
                {contractType && (
                  <Chip icon={<BusinessCenterOutlinedIcon />} label={contractType} size="small"
                    sx={{ bgcolor: 'rgba(0,0,0,0.04)', color: 'rgba(56,68,85,1)', fontFamily: 'Poppins', fontSize: '0.72rem', border: '1px solid rgba(25,25,25,0.1)', '& .MuiChip-icon': { color: 'rgba(100,113,131,1) !important', fontSize: '14px !important' } }} />
                )}
                {workMode && (
                  <Chip label={workMode} size="small"
                    sx={{ bgcolor: 'rgba(0,0,0,0.04)', color: 'rgba(56,68,85,1)', fontFamily: 'Poppins', fontSize: '0.72rem', border: '1px solid rgba(25,25,25,0.1)' }} />
                )}
                {experienceLevel && (
                  <Chip label={experienceLevel} size="small"
                    sx={{ bgcolor: 'rgba(244,235,255,1)', color: 'rgba(163,98,239,1)', fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.72rem', border: '1px solid rgba(189,133,255,0.35)' }} />
                )}
                {salary && (
                  <Chip label={`${salary.min}–${salary.max} ${salary.currency}`} size="small"
                    sx={{ bgcolor: 'rgba(244,235,255,1)', color: '#8310FF', fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.72rem', border: '1px solid rgba(189,133,255,0.35)' }} />
                )}
              </Box>
            </Box>

            {/* Body */}
            <Box sx={{ px: { xs: 3, md: 4 }, py: 3.5, display: 'flex', flexDirection: 'column', gap: 3 }}>

              {/* Description */}
              {description && (
                <Box>
                  <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.9rem', color: '#000', mb: 1.2 }}>
                    About this role
                  </Typography>
                  <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.85rem', color: '#4b5563', lineHeight: 1.7 }}>
                    {description.length > 600 ? description.slice(0, 600) + '…' : description}
                  </Typography>
                </Box>
              )}

              {/* Technical Skills + Soft Skills side by side */}
              {(skills.length > 0 || softSkills.length > 0) && (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                  {skills.length > 0 && (
                    <Box>
                      <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.85rem', color: '#000', mb: 1.2, position: 'relative', display: 'inline-block', '&::after': { content: '""', position: 'absolute', bottom: -3, left: 0, width: 28, height: 3, bgcolor: '#8310FF', borderRadius: 1 } }}>
                        Technical Skills
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mt: 0.5 }}>
                        {skills.map((s: string, i: number) => (
                          <Chip key={i} label={s} size="small" sx={{ bgcolor: 'rgba(244,235,255,1)', color: 'rgba(163,98,239,1)', border: '1px solid rgba(189,133,255,0.35)', fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.72rem' }} />
                        ))}
                      </Box>
                    </Box>
                  )}
                  {softSkills.length > 0 && (
                    <Box>
                      <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.85rem', color: '#000', mb: 1.2, position: 'relative', display: 'inline-block', '&::after': { content: '""', position: 'absolute', bottom: -3, left: 0, width: 28, height: 3, bgcolor: 'rgba(189,133,255,1)', borderRadius: 1 } }}>
                        Soft Skills
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mt: 0.5 }}>
                        {softSkills.map((s: string, i: number) => (
                          <Chip key={i} label={s} size="small" sx={{ bgcolor: 'rgba(250,246,255,1)', color: '#8310FF', border: '1px solid rgba(189,133,255,0.3)', fontFamily: 'Poppins', fontSize: '0.72rem' }} />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              )}

              {/* Responsibilities */}
              {responsibilities.length > 0 && (
                <Box>
                  <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.85rem', color: '#000', mb: 1.2 }}>
                    Responsibilities
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.7 }}>
                    {responsibilities.slice(0, 5).map((r: string, i: number) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: 'rgba(163,98,239,1)', mt: 0.65, flexShrink: 0 }} />
                        <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.82rem', color: 'rgba(84,98,116,1)', lineHeight: 1.55 }}>{r}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Requirements */}
              {requirements.length > 0 && (
                <Box>
                  <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.85rem', color: '#000', mb: 1.2 }}>
                    Requirements
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.7 }}>
                    {requirements.slice(0, 5).map((r: string, i: number) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <CheckCircleOutlineIcon sx={{ fontSize: 16, color: 'rgba(163,98,239,1)', mt: 0.18, flexShrink: 0 }} />
                        <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.82rem', color: 'rgba(84,98,116,1)', lineHeight: 1.55 }}>{r}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

           
              <Divider sx={{ borderColor: 'rgba(232,232,232,1)' }} />

              {/* CTA */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={onStart}
                  disabled={hasJobId && pipelineLoading}
                  sx={{
                    background: 'rgba(163,98,239,1)',
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    px: 3.5,
                    py: 1.2,
                    borderRadius: '38px',
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(163,98,239,0.3)',
                    '&:hover': { background: 'rgba(131,16,255,1)', boxShadow: '0 6px 18px rgba(131,16,255,0.35)' },
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
