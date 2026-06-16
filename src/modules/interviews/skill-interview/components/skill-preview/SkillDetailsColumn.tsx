import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import MicIcon from '@mui/icons-material/Mic';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { SectionCard, SectionTitle, GREEN_LIGHT, GREEN_BORDER } from './SkillPanelShared';

const ASSESSMENT_AREAS: Record<string, string[]> = {
  default: [
    'Core concepts and fundamentals',
    'Practical problem-solving',
    'Best practices and patterns',
    'Real-world scenarios',
    'Performance and optimization',
  ],
};

const TIPS = [
  'Think out loud — the AI adapts to your explanation style',
  'Take reading time to understand each question fully',
  'Use concrete examples from your experience',
  'It\'s okay to ask for clarification before answering',
];

const FORMAT_ITEMS = [
  { icon: '🎤', label: 'Voice-based conversation with an AI interviewer' },
  { icon: '⏱',  label: 'Adaptive questions based on your responses' },
  { icon: '📊', label: 'Real-time coverage tracking as you answer' },
  { icon: '📝', label: 'Instant report when the session ends' },
];

interface SkillDetailsColumnProps {
  skill: string;
  proficiency: string | null;
}

export default function SkillDetailsColumn({ skill, proficiency }: SkillDetailsColumnProps) {
  const areas = ASSESSMENT_AREAS[skill.toLowerCase()] ?? ASSESSMENT_AREAS.default;

  const profLevel = proficiency?.toLowerCase() ?? 'intermediate';
  const difficultyChips: string[] =
    profLevel === 'beginner'     ? ['Foundations', 'Core Concepts', 'Basic Usage'] :
    profLevel === 'advanced'     ? ['Architecture', 'Performance', 'Edge Cases', 'Deep Dives'] :
    profLevel === 'expert'       ? ['System Design', 'Internals', 'Trade-offs', 'Production Scale'] :
    ['Concepts', 'Application', 'Problem Solving', 'Patterns'];

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

      {/* What will be assessed */}
      <SectionCard>
        <SectionTitle icon={<CodeIcon sx={{ fontSize: 15 }} />} title="What will be assessed" />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {areas.map((area) => (
            <Box key={area} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#6AD39C', flexShrink: 0 }} />
              <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.88rem', color: '#374151' }}>
                {area}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ mt: 2.5 }}>
          <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.4, mb: 1 }}>
            Focus areas at {proficiency ? proficiency.charAt(0).toUpperCase() + proficiency.slice(1).toLowerCase() : 'Intermediate'} level
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {difficultyChips.map((chip) => (
              <Chip
                key={chip}
                size="small"
                label={chip}
                sx={{ fontSize: '11px', fontWeight: 600, height: 24, bgcolor: GREEN_LIGHT, color: '#10453F', border: `1px solid ${GREEN_BORDER}`, fontFamily: 'Poppins' }}
              />
            ))}
          </Box>
        </Box>
      </SectionCard>

      {/* Interview format */}
      <SectionCard>
        <SectionTitle icon={<MicIcon sx={{ fontSize: 15 }} />} title="Interview format" />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          {FORMAT_ITEMS.map(({ icon, label }) => (
            <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.25, py: 0.875, borderRadius: '10px', bgcolor: '#F9FAFB', border: '1px solid #F0F1F3' }}>
              <Typography sx={{ fontSize: '1rem', lineHeight: 1, flexShrink: 0 }}>{icon}</Typography>
              <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.82rem', color: '#374151' }}>{label}</Typography>
            </Box>
          ))}
        </Box>
      </SectionCard>

      {/* Tips */}
      <SectionCard>
        <SectionTitle icon={<LightbulbOutlinedIcon sx={{ fontSize: 15 }} />} title="Tips to succeed" />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {TIPS.map((tip, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
              <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.1 }}>
                <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.65rem', color: '#10453F' }}>
                  {i + 1}
                </Typography>
              </Box>
              <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.85rem', color: '#374151', lineHeight: 1.6 }}>
                {tip}
              </Typography>
            </Box>
          ))}
        </Box>
      </SectionCard>

    </Box>
  );
}
