import React from 'react';
import { Box, Typography } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TranslateIcon from '@mui/icons-material/Translate';
import CategoryIcon from '@mui/icons-material/Category';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import { SectionCard, MetaBadge, GREEN, GREEN_LIGHT, GREEN_BORDER } from './SkillPanelShared';

const PROFICIENCY_COLOR: Record<string, { color: string; bg: string; border: string }> = {
  beginner:     { color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  intermediate: { color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  advanced:     { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  expert:       { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
};

function proficiencyLabel(p: string | null): string {
  if (!p) return 'Intermediate';
  return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
}

interface SkillHeaderCardProps {
  skill: string;
  proficiency: string | null;
  category: string | null;
  duration: number;
  language: string;
}

export default function SkillHeaderCard({ skill, proficiency, category, duration, language }: SkillHeaderCardProps) {
  const profKey   = proficiency?.toLowerCase() ?? 'intermediate';
  const profStyle = PROFICIENCY_COLOR[profKey] ?? PROFICIENCY_COLOR.intermediate;

  return (
    <SectionCard>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2.5 }}>
        <Box sx={{
          width: 52, height: 52, borderRadius: '14px', flexShrink: 0,
          bgcolor: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CodeIcon sx={{ fontSize: 26, color: GREEN }} />
        </Box>
        <Box>
          <Typography sx={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: { xs: '1.2rem', md: '1.45rem' }, color: '#111827', lineHeight: 1.2 }}>
            {skill}
          </Typography>
          <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.88rem', color: '#6B7280', mt: 0.5 }}>
            Technical Skill Assessment · AI-Powered
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <MetaBadge
          icon={<EmojiEventsOutlinedIcon sx={{ fontSize: 14 }} />}
          label={proficiencyLabel(proficiency)}
          color={profStyle.color}
          bg={profStyle.bg}
          border={profStyle.border}
        />
        {category && (
          <MetaBadge
            icon={<CategoryIcon sx={{ fontSize: 14 }} />}
            label={category}
            color="#6B7280"
            bg="#F9FAFB"
            border="#E5E7EB"
          />
        )}
        <MetaBadge
          icon={<AccessTimeIcon sx={{ fontSize: 14 }} />}
          label={`${duration} min`}
          color="#16A34A"
          bg="#F0FDF4"
          border="#BBF7D0"
        />
        <MetaBadge
          icon={<TranslateIcon sx={{ fontSize: 14 }} />}
          label={language.toUpperCase()}
          color="#6B7280"
          bg="#F9FAFB"
          border="#E5E7EB"
        />
      </Box>
    </SectionCard>
  );
}
