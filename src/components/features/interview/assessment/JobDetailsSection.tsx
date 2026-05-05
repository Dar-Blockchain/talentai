import React from 'react';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { sectionStyle } from './helpers';

interface JobDetailsSectionProps {
  description: string;
  requirements?: string[];
  responsibilities?: string[];
}

const listStyle = {
  ml: 0.75, maxWidth: '600px', pl: 2, listStyleType: 'disc',
  '& .MuiListItem-root': { paddingTop: 0, paddingBottom: 0 },
};

const textProps = { fontSize: '12px', fontWeight: 400, lineHeight: '18px', color: 'rgba(0, 0, 0, 1)' };

const JobDetailsSection: React.FC<JobDetailsSectionProps> = ({ description, requirements, responsibilities }) => {
  const { t } = useTranslation('dashboard');
  const s = (k: string, opts?: any) => t(`candidate.assessment_detail.${k}`, opts) as string;
  if (!description) return null;

  return (
    <Box sx={sectionStyle}>
      <Typography variant="subtitle2" sx={{ color: 'rgba(98, 111, 134, 1)', fontSize: '15px', fontWeight: 500, mb: 1 }}>
        {s('job_details.description')}
      </Typography>
      <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 1)', fontSize: '12px', fontWeight: 400, maxWidth: '600px', lineHeight: 1.6 }}>
        {description}
      </Typography>

      {requirements && requirements.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ color: 'rgba(98, 111, 134, 1)', fontSize: '15px', fontWeight: 500 }}>{s('job_details.requirements')}</Typography>
          <List sx={listStyle}>
            {requirements.map((req, index) => (
              <ListItem key={index} sx={{ display: 'list-item', pl: 0 }}>
                <ListItemText primary={req} sx={{ m: 0 }} slotProps={{ primary: textProps }} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {responsibilities && responsibilities.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ color: 'rgba(98, 111, 134, 1)', fontSize: '15px', fontWeight: 500 }}>{s('job_details.responsibilities')}</Typography>
          <List sx={listStyle}>
            {responsibilities.map((resp, index) => (
              <ListItem key={index} sx={{ display: 'list-item', pl: 0 }}>
                <ListItemText primary={resp} sx={{ m: 0 }} slotProps={{ primary: textProps }} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default React.memo(JobDetailsSection);
