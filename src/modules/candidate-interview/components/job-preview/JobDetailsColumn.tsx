import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CodeIcon from '@mui/icons-material/Code';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { getLevelFromNumber, getSoftSkillLevelLabel, type Skill } from '@/utils/postHelpers';
import { useTranslation } from 'react-i18next';
import { PURPLE, PURPLE_LIGHT, PURPLE_BORDER } from '../../constants';
import { SectionCard, SectionTitle } from './JobPanelShared';

interface JobDetailsColumnProps {
  jd: any;
  technicalSkills: Skill[];
  softSkills: Skill[];
}

export default function JobDetailsColumn({ jd, technicalSkills, softSkills }: JobDetailsColumnProps) {
  const { t } = useTranslation('modules/interview/apply');
  const hasSkills = technicalSkills.length > 0 || softSkills.length > 0;

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

      {jd.description && (
        <SectionCard>
          <SectionTitle icon={<WorkOutlineIcon sx={{ fontSize: 15 }} />} title={t('section.description')} />
          <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.88rem', color: '#374151', lineHeight: 1.85, whiteSpace: 'pre-line' }}>
            {jd.description}
          </Typography>
        </SectionCard>
      )}

      {jd.requirements && (
        <SectionCard>
          <SectionTitle icon={<CheckCircleOutlineIcon sx={{ fontSize: 15 }} />} title={t('section.requirements')} />
          <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.88rem', color: '#374151', lineHeight: 1.85, whiteSpace: 'pre-line' }}>
            {jd.requirements}
          </Typography>
        </SectionCard>
      )}

      {hasSkills && (
        <SectionCard>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            {technicalSkills.length > 0 && (
              <Box sx={{ flex: 1 }}>
                <SectionTitle icon={<CodeIcon sx={{ fontSize: 15 }} />} title={t('section.technical_skills')} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {technicalSkills.map((skill, i) => (
                    <Chip key={i} size="small"
                      label={`${skill.name}${skill.level ? ` · ${getLevelFromNumber(skill.level)}` : ''}`}
                      sx={{ fontSize: '11px', fontWeight: 600, height: 24, bgcolor: PURPLE_LIGHT, color: PURPLE, border: `1px solid ${PURPLE_BORDER}`, fontFamily: 'Poppins' }} />
                  ))}
                </Box>
              </Box>
            )}
            {softSkills.length > 0 && (
              <Box sx={{ flex: 1 }}>
                <SectionTitle icon={<PsychologyIcon sx={{ fontSize: 15 }} />} title={t('section.soft_skills')} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {softSkills.map((skill, i) => (
                    <Chip key={i} size="small"
                      label={`${skill.name}${skill.level ? ` · ${getSoftSkillLevelLabel(Number(skill.level))}` : ''}`}
                      sx={{ fontSize: '11px', fontWeight: 600, height: 24, bgcolor: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', fontFamily: 'Poppins' }} />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </SectionCard>
      )}
    </Box>
  );
}
