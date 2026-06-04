import React from 'react';
import { Box, Typography } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import { formatSalary } from '@/utils/postHelpers';
import { fmtDate } from '@/utils/functions';
import { PURPLE, PURPLE_LIGHT, PURPLE_BORDER } from '../../constants';
import { SectionCard, MetaBadge } from './JobPanelShared';

interface JobHeaderCardProps {
  jobTitle: string;
  companyName: string;
  jd: any;
  createdAt?: string;
  expirationDate?: string;
}

export default function JobHeaderCard({ jobTitle, companyName, jd, createdAt, expirationDate }: JobHeaderCardProps) {
  return (
    <SectionCard>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2.5 }}>
        <Box sx={{ width: 52, height: 52, borderRadius: '14px', flexShrink: 0, bgcolor: PURPLE_LIGHT, border: `1px solid ${PURPLE_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BusinessIcon sx={{ fontSize: 24, color: PURPLE }} />
        </Box>
        <Box>
          <Typography sx={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: { xs: '1.2rem', md: '1.45rem' }, color: '#111827', lineHeight: 1.2 }}>
            {jobTitle}
          </Typography>
          <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.88rem', color: '#6B7280', mt: 0.5 }}>
            {companyName}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {jd.workMode       && <MetaBadge icon={<LocationOnOutlinedIcon sx={{ fontSize: 14 }} />}    label={jd.workMode}                              color="#2563EB" bg="#EFF6FF" border="#BFDBFE" />}
        {jd.employmentType && <MetaBadge icon={<WorkOutlineIcon sx={{ fontSize: 14 }} />}           label={jd.employmentType}                        color="#7C3AED" bg="#F5F3FF" border="#DDD6FE" />}
        {jd.salary && formatSalary(jd.salary) && <MetaBadge icon={<PaidOutlinedIcon sx={{ fontSize: 14 }} />} label={formatSalary(jd.salary)} color="#16A34A" bg="#F0FDF4" border="#BBF7D0" />}
        {createdAt         && <MetaBadge icon={<CalendarTodayOutlinedIcon sx={{ fontSize: 14 }} />} label={fmtDate(createdAt)}                       color="#6B7280" bg="#F9FAFB" border="#E5E7EB" />}
        {expirationDate    && <MetaBadge icon={<EventBusyOutlinedIcon   sx={{ fontSize: 14 }} />} label={`Expires ${fmtDate(expirationDate)}`}        color="#DC2626" bg="#FEF2F2" border="#FECACA" />}
      </Box>
    </SectionCard>
  );
}
