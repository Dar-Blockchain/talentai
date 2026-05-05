import React, { useState, useMemo, useCallback } from 'react';
import { Box, Typography, Chip, LinearProgress, Collapse, IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import {
  sectionStyle,
  sectionTitleStyle,
  formatDuration,
  formatAreaName,
  getStepStatusColor,
  CHART_COLORS,
} from './helpers';

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

  return (
    <Box sx={sectionStyle}>
      <Typography variant="h5" sx={sectionTitleStyle('#8310FF')}>
        {s('pipeline_steps.title')}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500 }}>
          {s('pipeline_steps.completed', { completed: completedCount, total: sortedSteps.length })}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={(completedCount / sortedSteps.length) * 100}
          sx={{
            flex: 1, height: 8, borderRadius: 4,
            backgroundColor: '#f3f4f6',
            '& .MuiLinearProgress-bar': { backgroundColor: '#8310FF', borderRadius: 4 },
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
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
  const stepLabel = step.stepId?.data?.label || step.stepId?.data?.config?.title || `Step ${index + 1}`;
  const stepType = step.stepId?.data?.type || 'interview';
  const stepKey = step._id || `step-${index}`;
  const interviewDetails = step.interviewDetails;
  const hasDetails = !!interviewDetails?.interviewData;
  const statusLabel =
    step.status === 'done' || step.status === 'passed'
      ? s('pipeline_steps.status.completed')
      : step.status === 'inProgress'
        ? s('pipeline_steps.status.in_progress')
        : s('pipeline_steps.status.pending');

  return (
    <Box>
      <Box
        onClick={() => hasDetails && onToggle(stepKey)}
        sx={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          padding: '16px',
          border: `1px solid ${isExpanded ? statusColors.border : 'rgba(238, 240, 242, 1)'}`,
          cursor: hasDetails ? 'pointer' : 'default',
          transition: 'all 0.2s ease',
          '&:hover': hasDetails ? { borderColor: statusColors.border, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' } : {},
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 40, height: 40, borderRadius: '10px',
                backgroundColor: step.status === 'done' || step.status === 'passed'
                  ? 'rgba(16, 185, 129, 0.1)'
                  : step.status === 'inProgress' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              {step.status === 'done' || step.status === 'passed' ? (
                <CheckCircleOutlineIcon sx={{ fontSize: 22, color: '#10b981' }} />
              ) : (
                <Typography sx={{ fontWeight: 700, fontSize: '14px', color: statusColors.color }}>{index + 1}</Typography>
              )}
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>{stepLabel}</Typography>
              <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '11px', textTransform: 'capitalize' }}>
                {stepType}
                {step.completedAt && ` - ${new Date(step.completedAt).toLocaleDateString(i18n.language || 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {step.score !== undefined && step.score !== null && (
              <Typography sx={{ fontWeight: 700, fontSize: '14px', color: statusColors.color }}>{Math.round(step.score)}%</Typography>
            )}
            <Chip
              label={statusLabel}
              size="small"
              sx={{
                backgroundColor: statusColors.bg, color: statusColors.color,
                fontWeight: 600, fontSize: '0.7rem', height: 22,
                border: `1px solid ${statusColors.border}`,
              }}
            />
            {hasDetails && (
              <IconButton size="small" sx={{ color: '#6b7280' }}>
                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )}
          </Box>
        </Box>
      </Box>

      <Collapse in={isExpanded}>
        {hasDetails && <StepInterviewDetails interviewDetails={interviewDetails} />}
      </Collapse>
    </Box>
  );
});

const StepInterviewDetails: React.FC<{ interviewDetails: any }> = React.memo(({ interviewDetails }) => {
  const { t, i18n } = useTranslation('dashboard');
  const s = (k: string, opts?: any) => t(`candidate.assessment_detail.${k}`, opts) as string;
  const data = interviewDetails.interviewData;
  const areas = data?.finalReport?.coverage?.areas;
  const aiAnalysis = data?.finalReport?.aiAnalysis;

  return (
    <Box sx={{ ml: 3, mt: 1, p: 2, backgroundColor: 'rgba(248, 249, 252, 1)', borderRadius: '10px', border: '1px solid rgba(238, 240, 242, 1)' }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'rgba(23, 43, 77, 1)', fontSize: '13px', mb: 1.5 }}>
        {s('pipeline_steps.interview_details')}
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, mb: 2 }}>
        <MiniStat value={`${Math.round(data?.finalReport?.coverage?.overall || 0)}%`} label={s('header.coverage')} color="#8310FF" />
        <MiniStat value={formatDuration(data?.analytics?.duration || 0)} label={s('summary.duration')} color="#6366f1" />
        <MiniStat value={data?.analytics?.messageCount || 0} label={s('summary.messages')} color="#10b981" />
      </Box>

      {areas && Object.keys(areas).length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151', fontSize: '12px', mb: 1 }}>{s('pipeline_steps.coverage_areas')}</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {Object.entries(areas).map(([areaKey, areaData]: [string, any], idx: number) => (
              <Box key={areaKey} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography sx={{ fontSize: '12px', color: '#374151', fontWeight: 500, minWidth: 120, textTransform: 'capitalize' }}>
                  {formatAreaName(areaKey)}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={areaData.percentage || 0}
                  sx={{
                    flex: 1, height: 6, borderRadius: 3, backgroundColor: '#e5e7eb',
                    '& .MuiLinearProgress-bar': { backgroundColor: CHART_COLORS[idx % CHART_COLORS.length], borderRadius: 3 },
                  }}
                />
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: CHART_COLORS[idx % CHART_COLORS.length], minWidth: 35 }}>
                  {Math.round(areaData.percentage || 0)}%
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {aiAnalysis && (
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {aiAnalysis.strongestAreas?.length > 0 && (
            <AnalysisBox title={s('pipeline_steps.strengths')} items={aiAnalysis.strongestAreas} bg="rgba(16, 185, 129, 0.06)" border="rgba(16, 185, 129, 0.15)" titleColor="#065f46" itemColor="#047857" />
          )}
          {aiAnalysis.weakestAreas?.length > 0 && (
            <AnalysisBox title={s('pipeline_steps.needs_improvement')} items={aiAnalysis.weakestAreas} bg="rgba(239, 68, 68, 0.06)" border="rgba(239, 68, 68, 0.15)" titleColor="#991b1b" itemColor="#b91c1c" />
          )}
        </Box>
      )}

      {data?.finalReport?.summary && (
        <Box sx={{ mt: 1.5 }}>
          <Typography variant="body2" sx={{ color: '#374151', fontSize: '12px', lineHeight: 1.5 }}>{data.finalReport.summary}</Typography>
        </Box>
      )}
    </Box>
  );
});

const MiniStat: React.FC<{ value: string | number; label: string; color: string }> = ({ value, label, color }) => (
  <Box sx={{ textAlign: 'center', p: 1, backgroundColor: '#fff', borderRadius: '8px', border: '1px solid rgba(238,240,242,1)' }}>
    <Typography sx={{ fontWeight: 700, fontSize: '16px', color }}>{value}</Typography>
    <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '10px' }}>{label}</Typography>
  </Box>
);

const AnalysisBox: React.FC<{ title: string; items: string[]; bg: string; border: string; titleColor: string; itemColor: string }> = ({
  title, items, bg, border, titleColor, itemColor,
}) => (
  <Box sx={{ flex: 1, minWidth: 150, p: 1, backgroundColor: bg, borderRadius: '8px', border: `1px solid ${border}` }}>
    <Typography sx={{ fontWeight: 600, color: titleColor, fontSize: '11px', mb: 0.5 }}>{title}</Typography>
    {items.map((area: string, idx: number) => (
      <Typography key={idx} sx={{ color: itemColor, fontSize: '11px' }}>{formatAreaName(area)}</Typography>
    ))}
  </Box>
);

export default React.memo(PipelineSteps);
