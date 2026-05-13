import React, { useState, useMemo, useCallback } from 'react';
import { Box, Typography, Chip, LinearProgress, Collapse, IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AccountTreeOutlined from '@mui/icons-material/AccountTreeOutlined';
import {
  formatDuration, formatAreaName, getStepStatusColor,
  CHART_COLORS, NAVY, NAVY2, GRAY, GRAY2, BORDER,
} from './helpers';
import i18n from '@/i18n/config';

interface PipelineStepsProps {
  stepsData: any;
}

const PipelineSteps: React.FC<PipelineStepsProps> = ({ stepsData }) => {
  const { t } = useTranslation('dashboard');
  const s = (k: string, opts?: any) => t(`candidate.assessment_detail.${k}`, opts) as string;
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});

  const sortedSteps = useMemo(() => {
    if (!stepsData?.steps) return [];
    return [...stepsData.steps].sort((a: any, b: any) => (a.stepId?.order ?? 999) - (b.stepId?.order ?? 999));
  }, [stepsData]);

  const completedCount = useMemo(
    () => sortedSteps.filter((s: any) => s.status === 'done' || s.status === 'passed').length,
    [sortedSteps]
  );

  const toggleStep = useCallback((stepId: string) => {
    setExpandedSteps(prev => ({ ...prev, [stepId]: !prev[stepId] }));
  }, []);

  if (sortedSteps.length === 0) return null;

  const progressPct = (completedCount / sortedSteps.length) * 100;

  return (
    <Box sx={{ bgcolor: '#fff', borderRadius: '18px', border: `1px solid ${BORDER}`, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
      <Box sx={{ height: 3, background: 'linear-gradient(90deg, #7C3AED, #6366f1)' }} />
      <Box sx={{ p: 2.5 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Box sx={{ width: 30, height: 30, borderRadius: '9px', bgcolor: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AccountTreeOutlined sx={{ fontSize: 16, color: '#7C3AED' }} />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: NAVY }}>{s('pipeline_steps.title')}</Typography>
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '0.72rem', color: GRAY2, fontWeight: 600 }}>
              {s('pipeline_steps.completed', { completed: completedCount, total: sortedSteps.length })}
            </Typography>
          </Box>
        </Box>

        {/* Progress */}
        <Box sx={{ mb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={progressPct}
            sx={{
              height: 5, borderRadius: '99px', bgcolor: '#F1F5F9',
              '& .MuiLinearProgress-bar': { borderRadius: '99px', bgcolor: '#7C3AED' },
            }}
          />
        </Box>

        {/* Steps */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {sortedSteps.map((step: any, index: number) => (
            <StepCard
              key={step._id || `step-${index}`}
              step={step}
              index={index}
              isExpanded={expandedSteps[step._id || `step-${index}`] || false}
              onToggle={toggleStep}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

interface StepCardProps {
  step: any;
  index: number;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

const StepCard: React.FC<StepCardProps> = React.memo(({ step, index, isExpanded, onToggle }) => {
  const { t } = useTranslation('dashboard');
  const s = (k: string, opts?: any) => t(`candidate.assessment_detail.${k}`, opts) as string;
  const statusColors = getStepStatusColor(step.status);
  const stepLabel    = step.stepId?.data?.label || step.stepId?.data?.config?.title || `Step ${index + 1}`;
  const stepType     = step.stepId?.data?.type || 'interview';
  const stepKey      = step._id || `step-${index}`;
  const hasDetails   = !!step.interviewDetails?.interviewData;

  const isDone = step.status === 'done' || step.status === 'passed';
  const statusLabel = isDone
    ? s('pipeline_steps.status.completed')
    : step.status === 'inProgress'
      ? s('pipeline_steps.status.in_progress')
      : s('pipeline_steps.status.pending');

  return (
    <Box>
      <Box
        onClick={() => hasDetails && onToggle(stepKey)}
        sx={{
          borderRadius: '12px', p: '12px 14px',
          bgcolor: isExpanded ? `${statusColors.bg}` : '#FAFAFA',
          border: `1px solid ${isExpanded ? statusColors.border : BORDER}`,
          cursor: hasDetails ? 'pointer' : 'default',
          transition: 'all 0.15s',
          '&:hover': hasDetails ? { bgcolor: `${statusColors.bg}`, borderColor: statusColors.border, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' } : {},
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box sx={{
              width: 34, height: 34, borderRadius: '10px', flexShrink: 0,
              bgcolor: isDone ? 'rgba(16,185,129,0.1)' : step.status === 'inProgress' ? 'rgba(245,158,11,0.1)' : '#F1F5F9',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {isDone
                ? <CheckCircleOutlineIcon sx={{ fontSize: 18, color: '#10b981' }} />
                : <Typography sx={{ fontWeight: 800, fontSize: '0.78rem', color: statusColors.color }}>{index + 1}</Typography>
              }
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, color: NAVY2, fontSize: '0.82rem' }}>{stepLabel}</Typography>
              <Typography sx={{ fontSize: '0.65rem', color: GRAY2, textTransform: 'capitalize' }}>
                {stepType}
                {step.completedAt && ` · ${new Date(step.completedAt).toLocaleDateString(i18n.language || 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {step.score !== undefined && step.score !== null && (
              <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', color: statusColors.color }}>{Math.round(step.score)}%</Typography>
            )}
            <Chip
              label={statusLabel}
              size="small"
              sx={{ height: 20, fontSize: '0.62rem', fontWeight: 700, bgcolor: statusColors.bg, color: statusColors.color, border: `1px solid ${statusColors.border}` }}
            />
            {hasDetails && (
              <IconButton size="small" sx={{ color: GRAY2, p: 0.25 }}>
                {isExpanded ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
              </IconButton>
            )}
          </Box>
        </Box>
      </Box>

      <Collapse in={isExpanded}>
        {hasDetails && <StepInterviewDetails interviewDetails={step.interviewDetails} />}
      </Collapse>
    </Box>
  );
});

StepCard.displayName = 'StepCard';

const StepInterviewDetails: React.FC<{ interviewDetails: any }> = React.memo(({ interviewDetails }) => {
  const { t, i18n: i18nInstance } = useTranslation('dashboard');
  const s = (k: string, opts?: any) => t(`candidate.assessment_detail.${k}`, opts) as string;
  const data       = interviewDetails.interviewData;
  const areas      = data?.finalReport?.coverage?.areas;
  const aiAnalysis = data?.finalReport?.aiAnalysis;

  return (
    <Box sx={{ ml: 2.5, mt: 0.75, p: 2, borderRadius: '12px', bgcolor: '#F8FAFC', border: `1px solid ${BORDER}` }}>
      <Typography sx={{ fontWeight: 700, color: NAVY2, fontSize: '0.78rem', mb: 1.5 }}>
        {s('pipeline_steps.interview_details')}
      </Typography>

      {/* Mini stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: areas || aiAnalysis ? 1.75 : 0 }}>
        {[
          { value: `${Math.round(data?.finalReport?.coverage?.overall || 0)}%`, label: s('header.coverage'), color: '#7C3AED' },
          { value: formatDuration(data?.analytics?.duration || 0),              label: s('summary.duration'), color: '#6366f1' },
          { value: data?.analytics?.messageCount || 0,                          label: s('summary.messages'), color: '#0D9488' },
        ].map((stat, i) => (
          <Box key={i} sx={{ textAlign: 'center', p: '8px 6px', bgcolor: '#fff', borderRadius: '10px', border: `1px solid ${BORDER}` }}>
            <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: stat.color, lineHeight: 1 }}>{stat.value}</Typography>
            <Typography sx={{ fontSize: '0.62rem', color: GRAY2, mt: 0.25 }}>{stat.label}</Typography>
          </Box>
        ))}
      </Box>

      {/* Coverage area bars */}
      {areas && Object.keys(areas).length > 0 && (
        <Box sx={{ mb: aiAnalysis ? 1.5 : 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.72rem', color: GRAY2, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1 }}>
            {s('pipeline_steps.coverage_areas')}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {Object.entries(areas).map(([areaKey, areaData]: [string, any], idx: number) => (
              <Box key={areaKey} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Typography sx={{ fontSize: '0.72rem', color: NAVY2, fontWeight: 600, minWidth: 110, textTransform: 'capitalize' }}>
                  {formatAreaName(areaKey)}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={areaData.percentage || 0}
                  sx={{
                    flex: 1, height: 5, borderRadius: '99px', bgcolor: '#E2E8F0',
                    '& .MuiLinearProgress-bar': { borderRadius: '99px', bgcolor: CHART_COLORS[idx % CHART_COLORS.length] },
                  }}
                />
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: CHART_COLORS[idx % CHART_COLORS.length], minWidth: 30, textAlign: 'right' }}>
                  {Math.round(areaData.percentage || 0)}%
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* AI analysis mini cards */}
      {aiAnalysis && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {aiAnalysis.strongestAreas?.length > 0 && (
            <Box sx={{ flex: 1, minWidth: 130, p: '8px 10px', borderRadius: '10px', bgcolor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <Typography sx={{ fontWeight: 700, color: '#065f46', fontSize: '0.68rem', mb: 0.5 }}>{s('pipeline_steps.strengths')}</Typography>
              {aiAnalysis.strongestAreas.map((area: string, idx: number) => (
                <Typography key={idx} sx={{ color: '#047857', fontSize: '0.68rem' }}>{formatAreaName(area)}</Typography>
              ))}
            </Box>
          )}
          {aiAnalysis.weakestAreas?.length > 0 && (
            <Box sx={{ flex: 1, minWidth: 130, p: '8px 10px', borderRadius: '10px', bgcolor: '#FEF2F2', border: '1px solid #FECACA' }}>
              <Typography sx={{ fontWeight: 700, color: '#991b1b', fontSize: '0.68rem', mb: 0.5 }}>{s('pipeline_steps.needs_improvement')}</Typography>
              {aiAnalysis.weakestAreas.map((area: string, idx: number) => (
                <Typography key={idx} sx={{ color: '#b91c1c', fontSize: '0.68rem' }}>{formatAreaName(area)}</Typography>
              ))}
            </Box>
          )}
        </Box>
      )}

      {data?.finalReport?.summary && (
        <Box sx={{ mt: 1.5, p: '8px 12px', borderRadius: '10px', bgcolor: '#fff', border: `1px solid ${BORDER}` }}>
          <Typography sx={{ color: GRAY, fontSize: '0.75rem', lineHeight: 1.6 }}>{data.finalReport.summary}</Typography>
        </Box>
      )}
    </Box>
  );
});

StepInterviewDetails.displayName = 'StepInterviewDetails';

export default React.memo(PipelineSteps);
