import React from 'react';
import { Box, Typography } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import TranslateIcon from '@mui/icons-material/Translate';
import CategoryIcon from '@mui/icons-material/Category';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useTranslation } from 'react-i18next';
import { SectionCard, MetaBadge, GREEN, GREEN_LIGHT, GREEN_BORDER } from './SkillPanelShared';

interface SkillHeaderCardProps {
  skill: string;
  category: string | null;
  language: string;
}

export default function SkillHeaderCard({ skill, category, language }: SkillHeaderCardProps) {
  const { t } = useTranslation('modules/interview/skill-interview');

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
            {t('header.subtitle')}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <MetaBadge
          icon={<AutoAwesomeIcon sx={{ fontSize: 14 }} />}
          label={t('header.adaptive_difficulty')}
          color="#7C3AED"
          bg="#F5F3FF"
          border="#DDD6FE"
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
