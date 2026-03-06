import React from 'react';
import { Box, Typography, LinearProgress, IconButton, Chip } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { InterviewStatus, Coverage, RealTimeReport } from '@/types/interview';

const PURPLE = '#8310FF';

interface CoverageDashboardProps {
  interviewStatus: InterviewStatus;
  coverage: Coverage | null;
  realTimeReport: RealTimeReport | null;
  agentMessage: string;
  coverageDashboardExpanded: boolean;
  onToggleExpand: () => void;
}

const CoverageDashboard: React.FC<CoverageDashboardProps> = ({
  interviewStatus,
  coverage,
  realTimeReport,
  agentMessage,
  coverageDashboardExpanded,
  onToggleExpand,
}) => {
  if (!(interviewStatus === 'active' || coverage)) return null;

  const overall = coverage?.overall || 0;

  const getScoreColor = (pct: number) =>
    pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';

  const getScoreBg = (pct: number) =>
    pct >= 80 ? 'rgba(34,197,94,0.1)' : pct >= 50 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)';

  const getScoreBorder = (pct: number) =>
    pct >= 80 ? 'rgba(34,197,94,0.25)' : pct >= 50 ? 'rgba(245,158,11,0.25)' : 'rgba(239,68,68,0.25)';

  return (
    <Box
      sx={{
        bgcolor: '#fff',
        borderRadius: '20px',
        border: '1px solid #e8e2f5',
        boxShadow: '0 8px 32px rgba(131,16,255,0.08), 0 2px 8px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}
    >
      {/* ── Header stripe ── */}
      <Box
        onClick={onToggleExpand}
        sx={{
          background: 'linear-gradient(135deg, #8310FF 0%, #a855f7 100%)',
          px: 2.5,
          py: 1.75,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <AssessmentIcon sx={{ color: '#fff', fontSize: 20 }} />
          <Box>
            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.95rem', color: '#fff', lineHeight: 1.2 }}>
              AI Coverage Intelligence
            </Typography>
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.72rem', color: 'rgba(255,255,255,0.72)', mt: 0.15 }}>
              Real-time analysis of interview coverage
            </Typography>
          </Box>
        </Box>
        <Box display="flex" alignItems="center" gap={1.5}>
          {overall > 0 && (
            <Box
              sx={{
                bgcolor: 'rgba(255,255,255,0.18)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '20px',
                px: 1.5,
                py: 0.4,
              }}
            >
              <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.78rem', color: '#fff' }}>
                {overall}% coverage
              </Typography>
            </Box>
          )}
          <IconButton size="small" sx={{ color: '#fff', p: 0.5 }}>
            {coverageDashboardExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Box>
      </Box>

      {coverageDashboardExpanded && (
        <Box sx={{ p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

          {/* ── Top row: Overall score + AI Focus ── */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 2fr' }, gap: 2 }}>

            {/* Overall coverage donut-style */}
            <Box
              sx={{
                bgcolor: 'rgba(250,246,255,1)',
                border: '1px solid rgba(189,133,255,0.25)',
                borderRadius: '14px',
                p: 2.5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.8rem', color: '#374151' }}>
                Overall Coverage
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'Poppins',
                  fontWeight: 800,
                  fontSize: '2.4rem',
                  color: overall > 0 ? getScoreColor(overall) : PURPLE,
                  lineHeight: 1,
                }}
              >
                {overall}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={overall}
                sx={{
                  width: '100%',
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'rgba(131,16,255,0.08)',
                  '& .MuiLinearProgress-bar': {
                    background: overall > 0
                      ? `linear-gradient(90deg, ${getScoreColor(overall)}, ${getScoreColor(overall)}cc)`
                      : 'linear-gradient(90deg, #8310FF, #a855f7)',
                    borderRadius: 4,
                  },
                }}
              />
              <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.72rem', color: '#9ca3af' }}>
                Interview Completion
              </Typography>
            </Box>

            {/* AI current focus */}
            <Box
              sx={{
                bgcolor: 'rgba(250,246,255,1)',
                border: '1px solid rgba(189,133,255,0.25)',
                borderRadius: '14px',
                p: 2.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              <Box display="flex" alignItems="center" gap={0.75}>
                <Box
                  sx={{
                    width: 28, height: 28, borderRadius: '8px',
                    bgcolor: 'rgba(131,16,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <PsychologyIcon sx={{ fontSize: 16, color: PURPLE }} />
                </Box>
                <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.82rem', color: '#374151' }}>
                  AI Decision Intelligence
                </Typography>
              </Box>
              <Box
                sx={{
                  bgcolor: '#fff',
                  border: '1px solid rgba(189,133,255,0.2)',
                  borderRadius: '10px',
                  p: 1.5,
                  flex: 1,
                }}
              >
                <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.82rem', color: '#374151', lineHeight: 1.6, fontWeight: 500 }}>
                  {agentMessage || 'Analyzing conversation flow…'}
                </Typography>
                <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.72rem', color: '#9ca3af', mt: 0.75, lineHeight: 1.5 }}>
                  The AI continuously analyzes responses, prevents repetition, and ensures comprehensive coverage of all competency areas.
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* ── Competency areas ── */}
          {coverage?.areas && Object.keys(coverage.areas).length > 0 && (
            <Box>
              <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.85rem', color: '#111827', mb: 1.5, position: 'relative', display: 'inline-block', '&::after': { content: '""', position: 'absolute', bottom: -3, left: 0, width: 28, height: 3, bgcolor: PURPLE, borderRadius: 1 } }}>
                Competency Coverage
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 1.5, mt: 0.5 }}>
                {Object.entries(coverage.areas).map(([areaName, areaData]: [string, any]) => {
                  const pct = areaData.percentage || 0;
                  return (
                    <Box
                      key={areaName}
                      sx={{
                        p: 1.75,
                        borderRadius: '12px',
                        bgcolor: getScoreBg(pct),
                        border: `1px solid ${getScoreBorder(pct)}`,
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.78rem', color: '#374151' }}>
                          {areaName}
                        </Typography>
                        <Chip
                          size="small"
                          label={`${pct}%`}
                          sx={{
                            height: 20,
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            fontFamily: 'Poppins',
                            bgcolor: getScoreColor(pct),
                            color: '#fff',
                          }}
                        />
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          height: 5,
                          borderRadius: 3,
                          bgcolor: 'rgba(255,255,255,0.5)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: getScoreColor(pct),
                            borderRadius: 3,
                          },
                        }}
                      />
                      {areaData.aiAnalysis?.reasoning && (
                        <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.68rem', color: '#6b7280', mt: 0.75, lineHeight: 1.4, fontStyle: 'italic' }}>
                          {areaData.aiAnalysis.reasoning.substring(0, 60)}…
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* ── Insights + Recommendations + Trends ── */}
          {(realTimeReport?.aiInsights?.length > 0 || realTimeReport?.recommendations?.length > 0 || realTimeReport?.trends?.length > 0) && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>

              {realTimeReport?.aiInsights?.length > 0 && (
                <Box sx={{ bgcolor: 'rgba(250,246,255,1)', border: '1px solid rgba(189,133,255,0.25)', borderRadius: '14px', p: 2 }}>
                  <Box display="flex" alignItems="center" gap={0.75} mb={1.25}>
                    <PsychologyIcon sx={{ fontSize: 15, color: PURPLE }} />
                    <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.78rem', color: '#374151' }}>
                      AI Insights
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, maxHeight: 130, overflowY: 'auto' }}>
                    {realTimeReport.aiInsights.map((insight: string, i: number) => (
                      <Box key={i} display="flex" alignItems="flex-start" gap={0.75}>
                        <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: PURPLE, mt: 0.55, flexShrink: 0 }} />
                        <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.75rem', color: '#4b5563', lineHeight: 1.5 }}>{insight}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {realTimeReport?.recommendations?.length > 0 && (
                <Box sx={{ bgcolor: 'rgba(240,253,244,1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '14px', p: 2 }}>
                  <Box display="flex" alignItems="center" gap={0.75} mb={1.25}>
                    <LightbulbOutlinedIcon sx={{ fontSize: 15, color: '#22c55e' }} />
                    <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.78rem', color: '#374151' }}>
                      Recommendations
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, maxHeight: 130, overflowY: 'auto' }}>
                    {realTimeReport.recommendations.map((rec: string, i: number) => (
                      <Box key={i} display="flex" alignItems="flex-start" gap={0.75}>
                        <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#22c55e', mt: 0.55, flexShrink: 0 }} />
                        <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.75rem', color: '#4b5563', lineHeight: 1.5 }}>{rec}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {realTimeReport?.trends?.length > 0 && (
                <Box sx={{ bgcolor: 'rgba(254,252,232,1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '14px', p: 2 }}>
                  <Box display="flex" alignItems="center" gap={0.75} mb={1.25}>
                    <TrendingUpIcon sx={{ fontSize: 15, color: '#f59e0b' }} />
                    <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.78rem', color: '#374151' }}>
                      Performance Trends
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, maxHeight: 130, overflowY: 'auto' }}>
                    {realTimeReport.trends.map((trend: string, i: number) => (
                      <Box key={i} display="flex" alignItems="flex-start" gap={0.75}>
                        <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#f59e0b', mt: 0.55, flexShrink: 0 }} />
                        <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.75rem', color: '#4b5563', lineHeight: 1.5 }}>{trend}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

            </Box>
          )}

          {/* Empty state when interview is active but no data yet */}
          {!coverage && !realTimeReport && interviewStatus === 'active' && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.82rem', color: '#9ca3af', fontStyle: 'italic' }}>
                Coverage data will appear as the interview progresses…
              </Typography>
            </Box>
          )}

        </Box>
      )}
    </Box>
  );
};

export default CoverageDashboard;
