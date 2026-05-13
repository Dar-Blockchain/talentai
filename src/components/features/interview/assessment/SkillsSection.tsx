import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CodeOutlined from '@mui/icons-material/CodeOutlined';
import PeopleOutlined from '@mui/icons-material/PeopleOutlined';
import LightbulbOutlined from '@mui/icons-material/LightbulbOutlined';
import { NAVY, NAVY2, GRAY, GRAY2, BORDER, T, TL, TBG, TBRD } from './helpers';

interface SkillsSectionProps {
  requiredSkills: any[];
  softSkills: any[];
  suggestedSkills: { technical?: any[]; frameworks?: any[]; tools?: any[] };
}

const SKILL_COLORS = [
  { bg: '#EFF6FF', border: '#BFDBFE', color: '#2563EB', accent: '#1D4ED8' },
  { bg: '#F5F3FF', border: '#DDD6FE', color: '#7C3AED', accent: '#6D28D9' },
  { bg: TBG,       border: TBRD,       color: T,          accent: '#0B7A71' },
  { bg: '#FEF3C7', border: '#FDE68A',  color: '#D97706',  accent: '#B45309' },
  { bg: '#FFF1F2', border: '#FECDD3',  color: '#E11D48',  accent: '#BE123C' },
];

const SkillsSection: React.FC<SkillsSectionProps> = ({ requiredSkills, softSkills, suggestedSkills }) => {
  const { t } = useTranslation('dashboard');
  const s = (k: string, opts?: any) => t(`candidate.assessment_detail.${k}`, opts) as string;
  const hasSuggested = suggestedSkills.technical?.length || suggestedSkills.frameworks?.length || suggestedSkills.tools?.length;
  if (requiredSkills.length === 0 && softSkills.length === 0 && !hasSuggested) return null;

  return (
    <Box sx={{ bgcolor: '#fff', borderRadius: '18px', border: `1px solid ${BORDER}`, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
      <Box sx={{ height: 3, background: `linear-gradient(90deg, #6366f1, #8b5cf6)` }} />
      <Box sx={{ p: 2.5 }}>

        {/* Required Skills */}
        {requiredSkills.length > 0 && (
          <Box sx={{ mb: softSkills.length > 0 || hasSuggested ? 2.5 : 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.75 }}>
              <Box sx={{ width: 30, height: 30, borderRadius: '9px', bgcolor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CodeOutlined sx={{ fontSize: 16, color: '#6366f1' }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: NAVY }}>{s('skills.required')}</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {requiredSkills.map((skill: any, index: number) => {
                const c = SKILL_COLORS[index % SKILL_COLORS.length];
                return (
                  <Box key={skill._id || index} sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    p: '10px 14px', borderRadius: '12px', border: `1px solid ${BORDER}`,
                    bgcolor: '#FAFAFA', transition: 'background 0.15s',
                    '&:hover': { bgcolor: c.bg, borderColor: c.border },
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: '9px', bgcolor: c.bg, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: c.color }}>{skill.name?.charAt(0)?.toUpperCase() || 'S'}</Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 700, color: NAVY2, fontSize: '0.82rem' }}>{skill.name}</Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: GRAY2 }}>{skill.category}{skill.level ? ` · Level ${skill.level}` : ''}</Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={skill.importance || skill.category}
                      size="small"
                      sx={{ height: 20, fontSize: '0.62rem', fontWeight: 600, bgcolor: c.bg, color: c.color, border: `1px solid ${c.border}`, textTransform: 'capitalize' }}
                    />
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Soft Skills */}
        {softSkills.length > 0 && (
          <Box sx={{ mb: hasSuggested ? 2.5 : 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Box sx={{ width: 30, height: 30, borderRadius: '9px', bgcolor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PeopleOutlined sx={{ fontSize: 16, color: '#059669' }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: NAVY }}>{s('skills.soft')}</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {softSkills.map((skill: any, index: number) => (
                <Chip
                  key={skill._id || index}
                  label={`${skill.name}${skill.level ? ` · ${skill.level}` : ''}`}
                  size="small"
                  sx={{ height: 26, fontSize: '0.72rem', fontWeight: 600, bgcolor: '#F0FDF4', color: '#059669', border: '1px solid #BBF7D0' }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Suggested Skills */}
        {hasSuggested && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Box sx={{ width: 30, height: 30, borderRadius: '9px', bgcolor: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LightbulbOutlined sx={{ fontSize: 16, color: '#D97706' }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: NAVY }}>{s('skills.suggested')}</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {suggestedSkills.technical?.map((sk: any, i: number) => (
                <Chip key={`tech-${i}`} label={sk.name} size="small" sx={{ height: 26, fontSize: '0.72rem', fontWeight: 600, bgcolor: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE' }} />
              ))}
              {suggestedSkills.frameworks?.map((sk: any, i: number) => (
                <Chip key={`fw-${i}`} label={sk.name} size="small" sx={{ height: 26, fontSize: '0.72rem', fontWeight: 600, bgcolor: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' }} />
              ))}
              {suggestedSkills.tools?.map((sk: any, i: number) => (
                <Chip key={`tool-${i}`} label={sk.name} size="small" sx={{ height: 26, fontSize: '0.72rem', fontWeight: 600, bgcolor: TBG, color: T, border: `1px solid ${TBRD}` }} />
              ))}
            </Box>
          </Box>
        )}

      </Box>
    </Box>
  );
};

export default React.memo(SkillsSection);
