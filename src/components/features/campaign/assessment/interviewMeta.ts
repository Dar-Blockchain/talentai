import PsychologyOutlined  from '@mui/icons-material/PsychologyOutlined';
import CodeOutlined         from '@mui/icons-material/CodeOutlined';
import AssignmentOutlined   from '@mui/icons-material/AssignmentOutlined';
import React                from 'react';

export interface ModuleMeta {
  label:    string;
  gradient: string;
  shadow:   string;
  accent:   string;
  icon:     React.ElementType;
}

export const MODULE_META: Record<string, ModuleMeta> = {
  AI_INTERVIEW: {
    label:    'AI Interview',
    gradient: 'linear-gradient(135deg, #0D9488 0%, #0891B2 100%)',
    shadow:   'rgba(13,148,136,0.4)',
    accent:   '#0D9488',
    icon:     PsychologyOutlined,
  },
  SKILL_TEST: {
    label:    'Skill Test',
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
    shadow:   'rgba(124,58,237,0.4)',
    accent:   '#7C3AED',
    icon:     CodeOutlined,
  },
  QUESTIONNAIRE: {
    label:    'Questionnaire',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    shadow:   'rgba(245,158,11,0.4)',
    accent:   '#F59E0B',
    icon:     AssignmentOutlined,
  },
};

export const getModuleMeta = (moduleType: string): ModuleMeta =>
  MODULE_META[moduleType] ?? MODULE_META.AI_INTERVIEW;
