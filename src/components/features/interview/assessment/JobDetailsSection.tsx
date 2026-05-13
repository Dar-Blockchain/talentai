import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import WorkOutlineOutlined from '@mui/icons-material/WorkOutline';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import AssignmentOutlined from '@mui/icons-material/AssignmentOutlined';
import { NAVY, NAVY2, GRAY, GRAY2, BORDER, T, TL, TBG, TBRD } from './helpers';

interface JobDetailsSectionProps {
  description: string;
  requirements?: string[];
  responsibilities?: string[];
}

const JobDetailsSection: React.FC<JobDetailsSectionProps> = ({ description, requirements, responsibilities }) => {
  const { t } = useTranslation('dashboard');
  const s = (k: string, opts?: any) => t(`candidate.assessment_detail.${k}`, opts) as string;
  if (!description) return null;

  return (
    <Box sx={{ bgcolor: '#fff', borderRadius: '18px', border: `1px solid ${BORDER}`, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
      <Box sx={{ height: 3, background: `linear-gradient(90deg, #2563EB, #6366f1)` }} />
      <Box sx={{ p: 2.5 }}>

        {/* Description */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Box sx={{ width: 30, height: 30, borderRadius: '9px', bgcolor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <WorkOutlineOutlined sx={{ fontSize: 16, color: '#2563EB' }} />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: NAVY }}>{s('job_details.description')}</Typography>
        </Box>
        <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#F8FAFC', border: `1px solid ${BORDER}`, mb: (requirements?.length || responsibilities?.length) ? 2.5 : 0 }}>
          <Typography sx={{ fontSize: '0.82rem', color: GRAY, lineHeight: 1.75 }}>{description}</Typography>
        </Box>

        {/* Requirements */}
        {requirements && requirements.length > 0 && (
          <Box sx={{ mb: responsibilities?.length ? 2.5 : 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Box sx={{ width: 30, height: 30, borderRadius: '9px', bgcolor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircleOutlined sx={{ fontSize: 16, color: '#059669' }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: NAVY }}>{s('job_details.requirements')}</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {requirements.map((req, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: '8px 12px', borderRadius: '10px', bgcolor: '#F8FAFC', border: `1px solid ${BORDER}` }}>
                  <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#059669', mt: '7px', flexShrink: 0 }} />
                  <Typography sx={{ fontSize: '0.8rem', color: NAVY2, lineHeight: 1.6 }}>{req}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Responsibilities */}
        {responsibilities && responsibilities.length > 0 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Box sx={{ width: 30, height: 30, borderRadius: '9px', bgcolor: TBG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AssignmentOutlined sx={{ fontSize: 16, color: T }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: NAVY }}>{s('job_details.responsibilities')}</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {responsibilities.map((resp, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: '8px 12px', borderRadius: '10px', bgcolor: '#F8FAFC', border: `1px solid ${BORDER}` }}>
                  <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: T, mt: '7px', flexShrink: 0 }} />
                  <Typography sx={{ fontSize: '0.8rem', color: NAVY2, lineHeight: 1.6 }}>{resp}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

      </Box>
    </Box>
  );
};

export default React.memo(JobDetailsSection);
