import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import MicIcon from '@mui/icons-material/Mic';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useTranslation } from 'react-i18next';
import { SectionCard, SectionTitle, GREEN_LIGHT, GREEN_BORDER } from './SkillPanelShared';

interface SkillDetailsColumnProps {
  skill: string;
}

export default function SkillDetailsColumn({ skill }: SkillDetailsColumnProps) {
  const { t } = useTranslation('modules/interview/skill-interview');

  const areas       = t('preview.areas',        { returnObjects: true }) as string[];
  const focusChips  = t('preview.focus_chips',  { returnObjects: true }) as string[];
  const formatItems = t('preview.format_items', { returnObjects: true }) as string[];
  const formatIcons = t('preview.format_icons', { returnObjects: true }) as string[];
  const tips        = t('preview.tips',         { returnObjects: true }) as string[];

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

      {/* What will be assessed */}
      <SectionCard>
        <SectionTitle icon={<CodeIcon sx={{ fontSize: 15 }} />} title={t('preview.what_assessed')} />
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
            {t('preview.focus_areas_label')}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {focusChips.map((chip) => (
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
        <SectionTitle icon={<MicIcon sx={{ fontSize: 15 }} />} title={t('preview.format_title')} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          {formatItems.map((label, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.25, py: 0.875, borderRadius: '10px', bgcolor: '#F9FAFB', border: '1px solid #F0F1F3' }}>
              <Typography sx={{ fontSize: '1rem', lineHeight: 1, flexShrink: 0 }}>{formatIcons[i]}</Typography>
              <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.82rem', color: '#374151' }}>{label}</Typography>
            </Box>
          ))}
        </Box>
      </SectionCard>

      {/* Tips */}
      <SectionCard>
        <SectionTitle icon={<LightbulbOutlinedIcon sx={{ fontSize: 15 }} />} title={t('preview.tips_title')} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {tips.map((tip, i) => (
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
