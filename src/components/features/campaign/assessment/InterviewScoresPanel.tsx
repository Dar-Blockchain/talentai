import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import VisibilityOutlined  from '@mui/icons-material/VisibilityOutlined';
import StarIcon            from '@mui/icons-material/Star';
import { Coverage }        from '@/types/interview';

interface Props {
  finalReport:   any;
  coverage:      Coverage | null;
  moduleType:    string;
  onViewResults: () => void;
}

const ScoreBar: React.FC<{ label: string; value: number; icon: string; color: string }> = ({ label, value, icon, color }) => (
  <Box>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Typography sx={{ fontSize: 14 }}>{icon}</Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{label}</Typography>
      </Box>
      <Typography sx={{ fontSize: 13, fontWeight: 800, color }}>{value}%</Typography>
    </Box>
    <Box sx={{ position: 'relative', height: 6, borderRadius: 3, bgcolor: '#E2E8F0' }}>
      <Box sx={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: `${value}%`, borderRadius: 3, bgcolor: color,
        transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: `0 0 8px ${color}60`,
      }} />
    </Box>
  </Box>
);

const REC_MAP: Record<string, { label: string; color: string; bg: string }> = {
  strong_hire: { label: 'Strong Hire',  color: '#34D399', bg: 'rgba(52,211,153,0.12)' },
  hire:        { label: 'Hire',         color: '#2DD4BF', bg: 'rgba(45,212,191,0.12)' },
  consider:    { label: 'Under Review', color: '#FCD34D', bg: 'rgba(252,211,77,0.12)' },
  reject:      { label: 'Not Selected', color: '#FCA5A5', bg: 'rgba(252,165,165,0.12)' },
};

const InterviewScoresPanel: React.FC<Props> = ({ finalReport, coverage, moduleType, onViewResults }) => {
  const accent  = moduleType === 'SKILL_TEST' ? '#A78BFA' : '#2DD4BF';
  const overall = finalReport?.overallScore ?? coverage?.overall ?? 0;

  const scores = [
    { label: 'Communication', icon: '🗣', value: finalReport?.communicationScore ?? Math.round(overall), color: '#2DD4BF' },
    { label: 'Confidence',    icon: '💪', value: finalReport?.confidenceScore    ?? Math.round(overall * 0.92), color: '#A78BFA' },
    { label: 'Clarity',       icon: '✨', value: finalReport?.clarityScore       ?? Math.min(100, Math.round(overall * 1.05)), color: '#60A5FA' },
    { label: 'Engagement',    icon: '👁', value: finalReport?.engagementScore    ?? Math.round(overall * 0.94), color: '#FCD34D' },
  ].filter(s => s.value > 0);

  const summary   = finalReport?.summary ?? null;
  const strengths = (finalReport?.strengths ?? []).slice(0, 3);
  const rec       = finalReport?.recommendation ? (REC_MAP[finalReport.recommendation] ?? null) : null;
  const scoreColor = overall >= 70 ? '#34D399' : overall >= 50 ? '#FCD34D' : '#FCA5A5';

  return (
    <Box sx={{
      bgcolor: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: 3,
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      overflow: 'hidden',
    }}>

      {/* Header */}
      <Box sx={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.25) 0%, rgba(5,150,105,0.15) 100%)',
        borderBottom: '1px solid rgba(52,211,153,0.2)',
        px: 3.5, py: 2.5,
        display: 'flex', alignItems: 'center', gap: 2,
      }}>
        <Box sx={{
          width: 42, height: 42, borderRadius: '50%',
          bgcolor: 'rgba(52,211,153,0.15)', border: '1.5px solid rgba(52,211,153,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <CheckCircleOutlined sx={{ color: '#34D399', fontSize: 22 }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
            Interview Complete
          </Typography>
          <Typography sx={{ fontSize: 11, color: '#94A3B8', mt: 0.2 }}>
            AI analysis is ready
          </Typography>
        </Box>
      </Box>

      <Box sx={{ p: 3.5, display: 'flex', flexDirection: 'column', gap: 3 }}>

        {/* Overall score + recommendation */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
              Overall
            </Typography>
            <Typography sx={{ fontSize: 56, fontWeight: 900, color: scoreColor, lineHeight: 1, textShadow: `0 0 20px ${scoreColor}40` }}>
              {Math.round(overall)}
              <Typography component="span" sx={{ fontSize: 22, fontWeight: 700, color: '#94A3B8' }}>%</Typography>
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            {rec && (
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1.75, py: 0.75, borderRadius: 5, bgcolor: rec.bg, border: `1px solid ${rec.color}30`, mb: 1.5 }}>
                <StarIcon sx={{ fontSize: 12, color: rec.color }} />
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: rec.color }}>
                  {rec.label}
                </Typography>
              </Box>
            )}
            {summary && (
              <Typography sx={{ fontSize: 12, color: '#64748B', lineHeight: 1.65, fontStyle: 'italic' }}>
                "{summary}"
              </Typography>
            )}
          </Box>
        </Box>

        {/* Score bars */}
        {scores.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
            <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Interview Analysis
            </Typography>
            {scores.map(s => (
              <ScoreBar key={s.label} label={s.label} value={s.value} icon={s.icon} color={s.color} />
            ))}
          </Box>
        )}

        {/* Strengths */}
        {strengths.length > 0 && (
          <Box>
            <Typography sx={{ fontSize: 10, fontWeight: 700, color: 'rgba(241,245,249,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1.25 }}>
              Key Strengths
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {strengths.map((s: string, i: number) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#34D399', mt: 0.7, flexShrink: 0 }} />
                  <Typography sx={{ fontSize: 12, color: '#475569', lineHeight: 1.6 }}>{s}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* CTA */}
        <Button
          variant="contained"
          fullWidth
          startIcon={<VisibilityOutlined sx={{ fontSize: 16 }} />}
          onClick={onViewResults}
          sx={{
            background: `linear-gradient(135deg, ${accent} 0%, ${accent}bb 100%)`,
            fontWeight: 700, fontSize: 13, textTransform: 'none',
            borderRadius: 2, py: 1.35, boxShadow: 'none',
            '&:hover': { filter: 'brightness(1.1)', boxShadow: `0 6px 20px ${accent}40`, transform: 'translateY(-1px)' },
            transition: 'all 0.2s',
          }}
        >
          View Detailed Results
        </Button>
      </Box>
    </Box>
  );
};

export default InterviewScoresPanel;
