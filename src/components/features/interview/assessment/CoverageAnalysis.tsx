import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';
import BarChartOutlined from '@mui/icons-material/BarChartOutlined';
import { sectionTitleStyle, formatAreaName, CHART_COLORS, NAVY, GRAY2, BORDER, T, TL } from './helpers';

interface CoverageAnalysisProps {
  coverageAreas: Record<string, any>;
}

const CoverageAnalysis: React.FC<CoverageAnalysisProps> = ({ coverageAreas }) => {
  const { t } = useTranslation('dashboard');
  const s = (k: string, opts?: any) => t(`candidate.assessment_detail.${k}`, opts) as string;

  const chartData = useMemo(
    () => Object.entries(coverageAreas).map(([key, data]: [string, any]) => ({
      name: formatAreaName(key),
      percentage: Math.round(data.percentage || 0),
    })),
    [coverageAreas]
  );

  const radarData = useMemo(
    () => Object.entries(coverageAreas).map(([key, data]: [string, any]) => ({
      subject: formatAreaName(key),
      score: Math.round(data.percentage || 0),
      fullMark: 100,
    })),
    [coverageAreas]
  );

  if (chartData.length === 0) return null;

  return (
    <Box sx={{ bgcolor: '#fff', borderRadius: '18px', border: `1px solid ${BORDER}`, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
      <Box sx={{ height: 3, background: `linear-gradient(90deg, ${T}, ${TL})` }} />
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
          <Box sx={{ width: 30, height: 30, borderRadius: '9px', bgcolor: '#F0FDFA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChartOutlined sx={{ fontSize: 16, color: T }} />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: NAVY }}>{s('coverage_analysis.title')}</Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <Box>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: GRAY2, textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1.5 }}>
              {s('coverage_analysis.by_area')}
            </Typography>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ top: 6, right: 8, left: -18, bottom: 36 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" angle={-30} textAnchor="end" height={56} tick={{ fontSize: 10, fill: '#94A3B8' }} interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} />
                <RechartsTooltip
                  formatter={(value: any) => [`${value}%`, s('header.coverage')]}
                  contentStyle={{ backgroundColor: '#fff', border: `1px solid ${BORDER}`, borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', fontSize: 12 }}
                  cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                />
                <Bar dataKey="percentage" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>

          <Box>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: GRAY2, textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1.5 }}>
              {s('coverage_analysis.radar')}
            </Typography>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart cx="50%" cy="50%" outerRadius="68%" data={radarData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#CBD5E1' }} />
                <Radar name={s('header.coverage')} dataKey="score" stroke={T} fill={T} fillOpacity={0.18} strokeWidth={2} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#64748B' }} />
              </RadarChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default React.memo(CoverageAnalysis);
