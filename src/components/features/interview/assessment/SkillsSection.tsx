import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { sectionStyle, sectionTitleStyle } from './helpers';

interface SkillsSectionProps {
  requiredSkills: any[];
  softSkills: any[];
  suggestedSkills: { technical?: any[]; frameworks?: any[]; tools?: any[] };
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ requiredSkills, softSkills, suggestedSkills }) => {
  const { t } = useTranslation('dashboard');
  const s = (k: string, opts?: any) => t(`candidate.assessment_detail.${k}`, opts) as string;
  const hasSuggested = suggestedSkills.technical?.length || suggestedSkills.frameworks?.length || suggestedSkills.tools?.length;
  if (requiredSkills.length === 0 && softSkills.length === 0 && !hasSuggested) return null;

  return (
    <Box sx={sectionStyle}>
      {requiredSkills.length > 0 && (
        <>
          <Typography variant="h5" sx={sectionTitleStyle('rgba(99, 102, 241, 0.83)')}>{s('skills.required')}</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {requiredSkills.map((skill: any, index: number) => (
              <Box key={skill._id || index} sx={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '14px', border: '1px solid rgba(238, 240, 242, 1)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#6366f1' }}>{skill.name?.charAt(0)?.toUpperCase() || 'S'}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>{skill.name}</Typography>
                      <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '11px' }}>{skill.category} - {skill.level}</Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={skill.importance || skill.category}
                    size="small"
                    sx={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', fontWeight: 500, fontSize: '0.65rem', height: 20, border: '1px solid rgba(99, 102, 241, 0.3)', textTransform: 'capitalize' }}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </>
      )}

      {softSkills.length > 0 && (
        <Box sx={{ mt: requiredSkills.length > 0 ? 2 : 0 }}>
          <Typography variant="subtitle2" sx={{ color: 'rgba(98, 111, 134, 1)', fontSize: '14px', fontWeight: 500, mb: 1.5 }}>{s('skills.soft')}</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {softSkills.map((skill: any, index: number) => (
              <Chip key={skill._id || index} label={`${skill.name} - ${skill.level}`} size="small"
                sx={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 500, fontSize: '0.75rem', height: 26, border: '1px solid rgba(16, 185, 129, 0.3)' }}
              />
            ))}
          </Box>
        </Box>
      )}

      {hasSuggested && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ color: 'rgba(98, 111, 134, 1)', fontSize: '14px', fontWeight: 500, mb: 1.5 }}>{s('skills.suggested')}</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {suggestedSkills.technical?.map((s: any, i: number) => (
              <Chip key={`tech-${i}`} label={s.name} size="small" sx={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', fontWeight: 500, fontSize: '0.7rem', height: 24, border: '1px solid rgba(139, 92, 246, 0.3)' }} />
            ))}
            {suggestedSkills.frameworks?.map((s: any, i: number) => (
              <Chip key={`fw-${i}`} label={s.name} size="small" sx={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', fontWeight: 500, fontSize: '0.7rem', height: 24, border: '1px solid rgba(245, 158, 11, 0.3)' }} />
            ))}
            {suggestedSkills.tools?.map((s: any, i: number) => (
              <Chip key={`tool-${i}`} label={s.name} size="small" sx={{ backgroundColor: 'rgba(20, 184, 166, 0.1)', color: '#14b8a6', fontWeight: 500, fontSize: '0.7rem', height: 24, border: '1px solid rgba(20, 184, 166, 0.3)' }} />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default React.memo(SkillsSection);
