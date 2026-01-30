import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
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
import { sectionStyle, sectionTitleStyle, formatAreaName, CHART_COLORS } from './helpers';

interface CoverageAnalysisProps {
  coverageAreas: Record<string, any>;
}

const CoverageAnalysis: React.FC<CoverageAnalysisProps> = ({ coverageAreas }) => {
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
    <Box sx={sectionStyle}>
      <Typography variant="h5" sx={{ ...sectionTitleStyle(), mb: 3 }}>
        Coverage Analysis
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ color: 'rgba(98, 111, 134, 1)', fontSize: '14px', fontWeight: 500, mb: 2 }}>
            Coverage by Area
          </Typography>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" angle={-35} textAnchor="end" height={60} tick={{ fontSize: 11, fill: '#6b7280' }} interval={0} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <RechartsTooltip
                formatter={(value: any) => [`${value}%`, 'Coverage']}
                contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ color: 'rgba(98, 111, 134, 1)', fontSize: '14px', fontWeight: 500, mb: 2 }}>
            Skills Radar
          </Typography>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#6b7280' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <Radar name="Coverage" dataKey="score" stroke="#8310FF" fill="#8310FF" fillOpacity={0.3} strokeWidth={2} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default React.memo(CoverageAnalysis);
