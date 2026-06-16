import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Chip,
  LinearProgress,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CodeIcon from '@mui/icons-material/Code';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import CandidateWorkspaceLayout from '@/modules/shared/layouts/candidate/CandidateWorkspaceLayout';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store/store';
import {
  fetchInterviewReport,
  selectInterviewReport,
  selectInterviewReportLoading,
  selectInterviewReportError,
  clearReport,
} from '@/store/slices/interviewSlice';

// ─── Design tokens ────────────────────────────────────────────────────────────

const INDIGO   = '#6366f1';
const INDIGO_L = 'rgba(99,102,241,0.08)';
const INDIGO_B = 'rgba(99,102,241,0.18)';
const GREEN    = '#10b981';
const GREEN_L  = 'rgba(16,185,129,0.08)';
const GREEN_B  = 'rgba(16,185,129,0.18)';
const AMBER    = '#f59e0b';
const AMBER_L  = 'rgba(245,158,11,0.08)';
const AMBER_B  = 'rgba(245,158,11,0.18)';
const RED      = '#ef4444';
const RED_L    = 'rgba(239,68,68,0.08)';
const RED_B    = 'rgba(239,68,68,0.18)';
const GRAY     = '#6b7280';
const SURFACE  = '#f9fafb';
const BORDER   = 'rgba(0,0,0,0.07)';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const scoreColor  = (s: number) => s >= 80 ? GREEN  : s >= 60 ? INDIGO  : s >= 40 ? AMBER  : RED;
const scoreBg     = (s: number) => s >= 80 ? GREEN_L : s >= 60 ? INDIGO_L : s >= 40 ? AMBER_L : RED_L;
const scoreBorder = (s: number) => s >= 80 ? GREEN_B : s >= 60 ? INDIGO_B : s >= 40 ? AMBER_B : RED_B;
const areaLabel   = (key: string) =>
  key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const fmtDuration = (ms: number) => {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const Card = ({ children, sx = {} }: { children: React.ReactNode; sx?: object }) => (
  <Box sx={{ bgcolor: '#fff', borderRadius: '16px', border: `1px solid ${BORDER}`, p: { xs: 2.5, md: 3.5 }, mb: 2, ...sx }}>
    {children}
  </Box>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <Typography sx={{
    fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem', color: '#111827',
    mb: 2.5, pb: 1.5, borderBottom: `2px solid ${INDIGO_L}`,
  }}>
    {children}
  </Typography>
);

const StatPill = ({
  label, value, icon, color = INDIGO, bg = INDIGO_L, border = INDIGO_B,
}: {
  label: string; value: string | number; icon: React.ReactNode;
  color?: string; bg?: string; border?: string;
}) => (
  <Box sx={{
    display: 'flex', alignItems: 'center', gap: 1.5,
    px: 2, py: 1.5, borderRadius: '12px',
    bgcolor: bg, border: `1px solid ${border}`,
    minWidth: 140, flex: 1,
  }}>
    <Box sx={{
      width: 38, height: 38, borderRadius: '10px',
      bgcolor: '#fff', border: `1px solid ${border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {icon}
    </Box>
    <Box>
      <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.65rem', color: GRAY, fontWeight: 500, lineHeight: 1, mb: 0.4 }}>
        {label}
      </Typography>
      <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.95rem', fontWeight: 700, color, lineHeight: 1 }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

const ScoreRing = ({ score }: { score: number }) => {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = scoreColor(score);
  return (
    <Box sx={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke={`${color}20`} strokeWidth="8" />
        <circle
          cx="55" cy="55" r={r}
          fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 55 55)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.4rem', color, lineHeight: 1 }}>
          {score}
        </Typography>
        <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.55rem', color: GRAY, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          / 100
        </Typography>
      </Box>
    </Box>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

function SkillInterviewReportPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation('modules/interview/skill-interview');
  const { id } = router.query;

  const data    = useSelector(selectInterviewReport);
  const loading = useSelector(selectInterviewReportLoading);
  const error   = useSelector(selectInterviewReportError);

  useEffect(() => {
    if (!id) return;
    dispatch(fetchInterviewReport(id as string));
    return () => { dispatch(clearReport()); };
  }, [id, dispatch]);

  const fr        = data?.interviewData?.finalReport;
  const analytics = data?.interviewData?.analytics;
  const coverage  = fr?.coverage;
  const overall   = coverage?.overall ?? 0;
  const isSoft    = data?.skillType === 'soft';

  const scoreLabel = (s: number) =>
    s >= 80 ? t('report.score_labels.excellent') :
    s >= 60 ? t('report.score_labels.good') :
    s >= 40 ? t('report.score_labels.fair') :
              t('report.score_labels.needs_work');

  return (
    <CandidateWorkspaceLayout breadcrumb="Skill Interview Report">

      <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; }
          #skill-report, #skill-report * { visibility: visible !important; }
          #skill-report { position: absolute !important; left: 0; top: 0; width: 100vw; background: #fff !important; }
        }
      `}</style>

      {/* ── Page header ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Box>
          <Typography sx={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: { xs: '1.3rem', md: '1.6rem' }, color: '#111827', lineHeight: 1.2 }}>
            {t('report.title')}
          </Typography>
          {data?.skill && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              {isSoft
                ? <PsychologyIcon sx={{ fontSize: 15, color: INDIGO }} />
                : <CodeIcon sx={{ fontSize: 15, color: INDIGO }} />
              }
              <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', color: GRAY, fontWeight: 500 }}>
                {data.skill}{data.category ? ` · ${data.category}` : ''}
              </Typography>
            </Box>
          )}
        </Box>
        {!loading && !error && data && (
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => window.print()}
            sx={{
              bgcolor: INDIGO, color: '#fff', fontFamily: 'Poppins', fontWeight: 700,
              textTransform: 'none', fontSize: '0.82rem', borderRadius: '10px', px: 2.5, py: 1,
              boxShadow: 'none', '&:hover': { bgcolor: '#4f46e5', boxShadow: 'none' },
            }}
          >
            {t('report.download_pdf')}
          </Button>
        )}
      </Box>

      <div id="skill-report">
        {loading ? (
          <Card sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: INDIGO }} />
          </Card>
        ) : error ? (
          <Card><Alert severity="error">{error}</Alert></Card>
        ) : !data ? (
          <Card><Alert severity="info">{t('report.no_report')}</Alert></Card>
        ) : (
          <>
            {/* ── Hero — score + meta ── */}
            <Card>
              <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                <ScoreRing score={overall} />
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75, flexWrap: 'wrap' }}>
                    <Chip
                      label={scoreLabel(overall)}
                      size="small"
                      sx={{ bgcolor: scoreBg(overall), color: scoreColor(overall), border: `1px solid ${scoreBorder(overall)}`, fontWeight: 700, fontFamily: 'Poppins', fontSize: '0.72rem' }}
                    />
                    <Chip
                      label={isSoft ? t('report.soft_skill') : t('report.technical_skill')}
                      size="small"
                      icon={isSoft ? <PsychologyIcon sx={{ fontSize: '13px !important' }} /> : <CodeIcon sx={{ fontSize: '13px !important' }} />}
                      sx={{ bgcolor: INDIGO_L, color: INDIGO, border: `1px solid ${INDIGO_B}`, fontWeight: 600, fontFamily: 'Poppins', fontSize: '0.72rem' }}
                    />
                    {data.proficiency && (
                      <Chip
                        label={data.proficiency}
                        size="small"
                        icon={<WorkspacePremiumIcon sx={{ fontSize: '13px !important' }} />}
                        sx={{ bgcolor: AMBER_L, color: AMBER, border: `1px solid ${AMBER_B}`, fontWeight: 600, fontFamily: 'Poppins', fontSize: '0.72rem' }}
                      />
                    )}
                  </Box>
                  <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.3rem', color: '#111827', mb: 0.25 }}>
                    {data.skill || 'Skill Assessment'}
                  </Typography>
                  {fr?.summary && (
                    <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', color: GRAY, lineHeight: 1.6, maxWidth: 520 }}>
                      {fr.summary}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Quick stats row */}
              {analytics && (
                <Box sx={{ display: 'flex', gap: 1.5, mt: 3, flexWrap: 'wrap' }}>
                  {analytics.duration != null && (
                    <StatPill
                      label={t('report.stats.duration')}
                      value={fmtDuration(analytics.duration)}
                      icon={<AccessTimeIcon sx={{ fontSize: 18, color: INDIGO }} />}
                    />
                  )}
                  {analytics.messageCount != null && (
                    <StatPill
                      label={t('report.stats.exchanges')}
                      value={analytics.messageCount}
                      icon={<ChatBubbleOutlineIcon sx={{ fontSize: 18, color: INDIGO }} />}
                    />
                  )}
                  {analytics.coveragePercentage != null && (
                    <StatPill
                      label={t('report.stats.coverage')}
                      value={`${analytics.coveragePercentage}%`}
                      icon={<TrendingUpIcon sx={{ fontSize: 18, color: scoreColor(analytics.coveragePercentage) }} />}
                      color={scoreColor(analytics.coveragePercentage)}
                      bg={scoreBg(analytics.coveragePercentage)}
                      border={scoreBorder(analytics.coveragePercentage)}
                    />
                  )}
                  {analytics.completedAreas != null && analytics.totalAreas != null && (
                    <StatPill
                      label={t('report.stats.areas_covered')}
                      value={`${analytics.completedAreas} / ${analytics.totalAreas}`}
                      icon={<EmojiEventsIcon sx={{ fontSize: 18, color: AMBER }} />}
                      color={AMBER} bg={AMBER_L} border={AMBER_B}
                    />
                  )}
                </Box>
              )}
            </Card>

            {/* ── Coverage areas ── */}
            {coverage?.areas && Object.keys(coverage.areas).length > 0 && (
              <Card>
                <SectionTitle>{t('report.sections.coverage_areas')}</SectionTitle>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {Object.entries(coverage.areas).map(([key, area]: [string, any]) => {
                    const pct = area?.percentage ?? 0;
                    const col = scoreColor(pct);
                    return (
                      <Box key={key} sx={{ p: 2.5, bgcolor: SURFACE, borderRadius: '12px', border: `1px solid ${BORDER}` }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25, flexWrap: 'wrap', gap: 1 }}>
                          <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.88rem', color: '#111827' }}>
                            {areaLabel(key)}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            {area?.questionsAsked != null && (
                              <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.7rem', color: GRAY }}>
                                {t('report.area_question', { count: area.questionsAsked })}
                              </Typography>
                            )}
                            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.9rem', color: col }}>
                              {pct}%
                            </Typography>
                          </Box>
                        </Box>

                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          sx={{
                            height: 6, borderRadius: 3, mb: 1.75,
                            bgcolor: `${col}18`,
                            '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: col },
                          }}
                        />

                        {area?.aiAnalysis?.reasoning && (
                          <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.75rem', color: GRAY, lineHeight: 1.6, mb: 1.5, fontStyle: 'italic' }}>
                            {area.aiAnalysis.reasoning}
                          </Typography>
                        )}

                        {area?.indicators?.length > 0 && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                            {(area.indicators as any[])
                              .filter((ind: any, i: number, arr: any[]) =>
                                arr.findIndex((x: any) => (x.name || x) === (ind.name || ind)) === i
                              )
                              .map((ind: any, idx: number) => {
                                const name = (ind.name || ind as string)
                                  .replace(/^AI-detected:\s*/i, '')
                                  .replace(/_/g, ' ')
                                  .replace(/\b\w/g, (c: string) => c.toUpperCase());
                                return (
                                  <Chip
                                    key={idx}
                                    label={name}
                                    size="small"
                                    icon={ind.covered
                                      ? <CheckCircleIcon sx={{ fontSize: '13px !important', color: `${GREEN} !important` }} />
                                      : <RadioButtonUncheckedIcon sx={{ fontSize: '13px !important', color: `${GRAY} !important` }} />
                                    }
                                    sx={{
                                      fontFamily: 'Poppins', fontSize: '0.7rem', fontWeight: 500,
                                      bgcolor: ind.covered ? GREEN_L : '#f3f4f6',
                                      color: ind.covered ? GREEN : GRAY,
                                      border: `1px solid ${ind.covered ? GREEN_B : BORDER}`,
                                      '& .MuiChip-icon': { ml: '6px' },
                                    }}
                                  />
                                );
                              })}
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </Card>
            )}

            {/* ── Scores breakdown ── */}
            {fr?.scores && Object.values(fr.scores).some((v) => v != null) && (
              <Card>
                <SectionTitle>{t('report.sections.score_breakdown')}</SectionTitle>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {Object.entries(fr.scores)
                    .filter(([, v]) => v != null)
                    .map(([key, val]: [string, any]) => {
                      const pct = Math.round(val);
                      const col = scoreColor(pct);
                      return (
                        <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.78rem', color: '#374151', fontWeight: 500, minWidth: 140 }}>
                            {areaLabel(key)}
                          </Typography>
                          <Box sx={{ flex: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={pct}
                              sx={{
                                height: 7, borderRadius: 3,
                                bgcolor: `${col}18`,
                                '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: col },
                              }}
                            />
                          </Box>
                          <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', fontWeight: 700, color: col, minWidth: 38, textAlign: 'right' }}>
                            {pct}
                          </Typography>
                        </Box>
                      );
                    })}
                </Box>
              </Card>
            )}

            {/* ── AI Analysis ── */}
            {fr?.aiAnalysis && (
              <Card>
                <SectionTitle>{t('report.sections.ai_analysis')}</SectionTitle>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {fr.aiAnalysis.strongestAreas?.length > 0 && (
                    <Box sx={{ p: 2, bgcolor: GREEN_L, borderRadius: '12px', border: `1px solid ${GREEN_B}` }}>
                      <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.8rem', color: GREEN, mb: 1 }}>
                        {t('report.labels.strongest')}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                        {fr.aiAnalysis.strongestAreas.map((area: string, i: number) => (
                          <Chip key={i} label={areaLabel(area)} size="small"
                            sx={{ bgcolor: '#fff', color: GREEN, border: `1px solid ${GREEN_B}`, fontFamily: 'Poppins', fontSize: '0.72rem', fontWeight: 600 }} />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {fr.aiAnalysis.weakestAreas?.length > 0 && (
                    <Box sx={{ p: 2, bgcolor: RED_L, borderRadius: '12px', border: `1px solid ${RED_B}` }}>
                      <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.8rem', color: RED, mb: 1 }}>
                        {t('report.labels.improve')}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                        {fr.aiAnalysis.weakestAreas.map((area: string, i: number) => (
                          <Chip key={i} label={areaLabel(area)} size="small"
                            sx={{ bgcolor: '#fff', color: RED, border: `1px solid ${RED_B}`, fontFamily: 'Poppins', fontSize: '0.72rem', fontWeight: 600 }} />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {fr.aiAnalysis.recommendedFocus?.length > 0 && (
                    <Box sx={{ p: 2, bgcolor: INDIGO_L, borderRadius: '12px', border: `1px solid ${INDIGO_B}` }}>
                      <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.8rem', color: INDIGO, mb: 1 }}>
                        {t('report.labels.recommended_focus')}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                        {fr.aiAnalysis.recommendedFocus.map((area: string, i: number) => (
                          <Chip key={i} label={areaLabel(area)} size="small"
                            sx={{ bgcolor: '#fff', color: INDIGO, border: `1px solid ${INDIGO_B}`, fontFamily: 'Poppins', fontSize: '0.72rem', fontWeight: 600 }} />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Card>
            )}

            {/* ── Recommendations ── */}
            {fr?.recommendations?.length > 0 && (
              <Card>
                <SectionTitle>{t('report.sections.recommendations')}</SectionTitle>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {fr.recommendations.map((rec: string, i: number) => (
                    <Box key={i} sx={{
                      display: 'flex', alignItems: 'flex-start', gap: 1.5,
                      p: 1.75, bgcolor: SURFACE, borderRadius: '10px', border: `1px solid ${BORDER}`,
                    }}>
                      <Box sx={{
                        minWidth: 26, height: 26, borderRadius: '50%',
                        bgcolor: INDIGO_L, border: `1px solid ${INDIGO_B}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <LightbulbOutlinedIcon sx={{ fontSize: 14, color: INDIGO }} />
                      </Box>
                      <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', color: '#374151', lineHeight: 1.65 }}>
                        {rec}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Card>
            )}

            {/* ── Strengths & Weaknesses ── */}
            {(fr?.strengths?.length > 0 || fr?.weaknesses?.length > 0) && (
              <Card>
                <SectionTitle>{t('report.sections.strengths_weaknesses')}</SectionTitle>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  {fr.strengths?.length > 0 && (
                    <Box sx={{ p: 2, bgcolor: GREEN_L, borderRadius: '12px', border: `1px solid ${GREEN_B}` }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <ThumbUpOutlinedIcon sx={{ fontSize: 16, color: GREEN }} />
                        <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.8rem', color: GREEN }}>
                          {t('report.labels.strengths')}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        {(fr.strengths as string[]).map((s, i) => (
                          <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: GREEN, mt: 0.75, flexShrink: 0 }} />
                            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.77rem', color: '#374151', lineHeight: 1.6 }}>{s}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                  {fr.weaknesses?.length > 0 && (
                    <Box sx={{ p: 2, bgcolor: RED_L, borderRadius: '12px', border: `1px solid ${RED_B}` }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <ThumbDownOutlinedIcon sx={{ fontSize: 16, color: RED }} />
                        <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.8rem', color: RED }}>
                          {t('report.labels.weaknesses')}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        {(fr.weaknesses as string[]).map((w, i) => (
                          <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: RED, mt: 0.75, flexShrink: 0 }} />
                            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.77rem', color: '#374151', lineHeight: 1.6 }}>{w}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Card>
            )}

            {/* ── Development Areas ── */}
            {fr?.developmentAreas?.length > 0 && (
              <Card>
                <SectionTitle>{t('report.sections.development_areas')}</SectionTitle>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {(fr.developmentAreas as string[]).map((area, i) => (
                    <Box key={i} sx={{
                      display: 'flex', alignItems: 'flex-start', gap: 1.5,
                      p: 1.75, bgcolor: AMBER_L, borderRadius: '10px', border: `1px solid ${AMBER_B}`,
                    }}>
                      <BuildOutlinedIcon sx={{ fontSize: 16, color: AMBER, mt: 0.2, flexShrink: 0 }} />
                      <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', color: '#374151', lineHeight: 1.65 }}>
                        {area}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Card>
            )}

            {/* ── Candidate Profile ── */}
            {fr?.candidateProfile && (fr.candidateProfile.revealedExpertise?.length > 0 || fr.candidateProfile.revealedGaps?.length > 0 || fr.candidateProfile.difficultyLevel) && (
              <Card>
                <SectionTitle>{t('report.sections.candidate_profile')}</SectionTitle>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {fr.candidateProfile.difficultyLevel && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <PersonOutlineIcon sx={{ fontSize: 16, color: INDIGO }} />
                      <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', color: '#374151' }}>
                        <span style={{ fontWeight: 600, color: '#111827' }}>{t('report.labels.difficulty_level')}</span>{' '}
                        {String(fr.candidateProfile.difficultyLevel).charAt(0).toUpperCase() + String(fr.candidateProfile.difficultyLevel).slice(1)}
                      </Typography>
                    </Box>
                  )}
                  {fr.candidateProfile.revealedExpertise?.length > 0 && (
                    <Box>
                      <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.78rem', color: GREEN, mb: 1 }}>
                        {t('report.labels.demonstrated')}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                        {(fr.candidateProfile.revealedExpertise as string[]).map((e, i) => (
                          <Chip key={i} label={e} size="small"
                            sx={{ bgcolor: GREEN_L, color: GREEN, border: `1px solid ${GREEN_B}`, fontFamily: 'Poppins', fontSize: '0.72rem', fontWeight: 500 }} />
                        ))}
                      </Box>
                    </Box>
                  )}
                  {fr.candidateProfile.revealedGaps?.length > 0 && (
                    <Box>
                      <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.78rem', color: AMBER, mb: 1 }}>
                        {t('report.labels.gaps')}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                        {(fr.candidateProfile.revealedGaps as string[]).map((g, i) => (
                          <Chip key={i} label={g} size="small"
                            sx={{ bgcolor: AMBER_L, color: AMBER, border: `1px solid ${AMBER_B}`, fontFamily: 'Poppins', fontSize: '0.72rem', fontWeight: 500 }} />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Card>
            )}

            {/* ── Conversation Q&A ── */}
            {(data?.interviewData as any)?.conversation?.length > 0 && (
              <Card>
                <SectionTitle>{t('report.sections.qa')}</SectionTitle>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {((data?.interviewData as any).conversation as any[]).map((turn: any, i: number) => (
                    <Box key={i} sx={{ p: 2, bgcolor: SURFACE, borderRadius: '12px', border: `1px solid ${BORDER}` }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                        <QuestionAnswerOutlinedIcon sx={{ fontSize: 15, color: INDIGO, mt: 0.2, flexShrink: 0 }} />
                        <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.8rem', color: '#111827', lineHeight: 1.5 }}>
                          {turn.question}
                        </Typography>
                      </Box>
                      {turn.response && (
                        <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.77rem', color: '#374151', lineHeight: 1.65, pl: 3 }}>
                          {turn.response}
                        </Typography>
                      )}
                      {(turn.evaluation?.qualityScore != null || turn.targetArea) && (
                        <Box sx={{ display: 'flex', gap: 1, mt: 1, pl: 3, flexWrap: 'wrap' }}>
                          {turn.targetArea && (
                            <Chip label={areaLabel(turn.targetArea)} size="small"
                              sx={{ bgcolor: INDIGO_L, color: INDIGO, border: `1px solid ${INDIGO_B}`, fontFamily: 'Poppins', fontSize: '0.68rem' }} />
                          )}
                          {turn.evaluation?.qualityScore != null && (
                            <Chip
                              label={t('report.stats.quality', { score: turn.evaluation.qualityScore })} size="small"
                              sx={{ bgcolor: scoreBg(turn.evaluation.qualityScore * 10), color: scoreColor(turn.evaluation.qualityScore * 10), border: `1px solid ${scoreBorder(turn.evaluation.qualityScore * 10)}`, fontFamily: 'Poppins', fontSize: '0.68rem', fontWeight: 600 }} />
                          )}
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              </Card>
            )}

            {/* ── Next recommended area ── */}
            {fr?.nextRecommendedArea && (
              <Card sx={{ bgcolor: INDIGO_L, border: `1px solid ${INDIGO_B}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <TrendingUpIcon sx={{ color: INDIGO, fontSize: 22 }} />
                  <Box>
                    <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.82rem', color: INDIGO }}>
                      {t('report.sections.next_area')}
                    </Typography>
                    <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', color: '#374151', mt: 0.25 }}>
                      {areaLabel(fr.nextRecommendedArea)}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            )}

            {/* ── Analytics detail ── */}
            {analytics && (
              <Card>
                <SectionTitle>{t('report.sections.session_analytics')}</SectionTitle>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  {[
                    { label: t('report.stats.duration'),       value: analytics.duration != null ? fmtDuration(analytics.duration) : null },
                    { label: t('report.stats.exchanges'),      value: analytics.messageCount },
                    { label: t('report.stats.coverage'),       value: analytics.coveragePercentage != null ? `${analytics.coveragePercentage}%` : null },
                    { label: t('report.stats.areas_covered'),  value: analytics.completedAreas != null && analytics.totalAreas != null ? `${analytics.completedAreas} / ${analytics.totalAreas}` : null },
                    { label: t('report.stats.avg_response'),   value: analytics.averageResponseLength != null ? `${analytics.averageResponseLength} words` : null },
                    { label: t('report.stats.style'),          value: analytics.interactionStyle },
                    { label: t('report.stats.silence'),        value: analytics.silenceEvents },
                  ].filter(({ value }) => value != null).map(({ label, value }) => (
                    <Box key={label}>
                      <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.68rem', color: GRAY, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.4 }}>
                        {label}
                      </Typography>
                      <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.88rem', fontWeight: 700, color: '#111827' }}>
                        {value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Card>
            )}
          </>
        )}
      </div>

    </CandidateWorkspaceLayout>
  );
}

export default dynamic(() => Promise.resolve(SkillInterviewReportPage), { ssr: false });
