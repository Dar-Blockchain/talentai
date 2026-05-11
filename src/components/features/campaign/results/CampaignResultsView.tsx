'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Chip, Divider, CircularProgress, Alert } from '@mui/material';

import DashboardLayout from '@/components/layout/dashboard/DashboardLayout';
import PageHeader      from '@/components/layout/dashboard/PageHeader';
import {
  fetchParticipantResults,
  selectParticipantResults,
  selectResultsLoading,
  selectResultsError,
} from '@/store/slices/campaignSlice';
import { AppDispatch } from '@/store/store';

import ArrowBackOutlined           from '@mui/icons-material/ArrowBackOutlined';
import CheckCircleOutlined         from '@mui/icons-material/CheckCircleOutlined';
import AssignmentOutlined          from '@mui/icons-material/AssignmentOutlined';
import PsychologyOutlined          from '@mui/icons-material/PsychologyOutlined';
import CodeOutlined                from '@mui/icons-material/CodeOutlined';
import StarRounded                 from '@mui/icons-material/StarRounded';
import TextSnippetOutlined         from '@mui/icons-material/TextSnippetOutlined';
import RadioButtonCheckedOutlined  from '@mui/icons-material/RadioButtonChecked';
import CheckBoxOutlined            from '@mui/icons-material/CheckBoxOutlined';
import EmojiEventsOutlined         from '@mui/icons-material/EmojiEventsOutlined';
import CalendarTodayOutlined       from '@mui/icons-material/CalendarTodayOutlined';

// ─── Types ─────────────────────────────────────────────────────────────────────

// Re-export so existing imports of ResultsData from this file still work
export type { ParticipantResultsData as ResultsData } from '@/store/slices/campaignSlice';
import type { ParticipantResultsData as ResultsData } from '@/store/slices/campaignSlice';

// ─── Module meta ───────────────────────────────────────────────────────────────

const MODULE_META: Record<string, { icon: React.ElementType; gradient: string; accent: string }> = {
  QUESTIONNAIRE: { icon: AssignmentOutlined, gradient: 'linear-gradient(135deg,#F59E0B,#D97706)', accent: '#F59E0B' },
  AI_INTERVIEW:  { icon: PsychologyOutlined, gradient: 'linear-gradient(135deg,#0D9488,#0891B2)', accent: '#0D9488' },
  SKILL_TEST:    { icon: CodeOutlined,       gradient: 'linear-gradient(135deg,#7C3AED,#5B21B6)', accent: '#7C3AED' },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

const CARD = {
  bgcolor: '#fff',
  border: '1px solid #E2E8F0',
  borderRadius: 3,
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
} as const;

const fmt = (iso: string | null, locale: string) =>
  iso
    ? new Date(iso).toLocaleDateString(locale.startsWith('fr') ? 'fr-FR' : 'en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
    : '—';

// ─── ScoreBadge ────────────────────────────────────────────────────────────────

const ScoreBadge: React.FC<{ score: number | null; size?: 'sm' | 'lg' }> = ({ score, size = 'sm' }) => {
  if (score === null) return null;
  const color = score >= 75 ? '#16A34A' : score >= 50 ? '#D97706' : '#DC2626';
  const bg    = score >= 75 ? '#F0FDF4' : score >= 50 ? '#FFFBEB' : '#FEF2F2';
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: size === 'lg' ? 2 : 1.25, py: size === 'lg' ? 1 : 0.5, borderRadius: 2, bgcolor: bg, border: `1px solid ${color}30` }}>
      <EmojiEventsOutlined sx={{ fontSize: size === 'lg' ? 18 : 14, color }} />
      <Typography sx={{ fontSize: size === 'lg' ? 18 : 13, fontWeight: 800, color }}>{score}%</Typography>
    </Box>
  );
};

// ─── QuestionnaireResults ──────────────────────────────────────────────────────

export const QuestionnaireResults: React.FC<{ data: ResultsData; scoringTimedOut?: boolean }> = ({ data, scoringTimedOut = false }) => {
  const { t } = useTranslation('dashboard');
  const rq = 'pages.campaigns.detail.results_view.questionnaire';
  const questions: { question: string; type: string; options?: string[] }[] =
    data.campaign.module?.config?.questions ?? [];
  const answers = data.response?.answers ?? [];
  const answerMap: Record<string, any> = {};
  answers.forEach(a => { answerMap[a.questionId] = a.answer; });

  const typeIcon: Record<string, React.ElementType> = {
    TEXT:            TextSnippetOutlined,
    SINGLE_CHOICE:   RadioButtonCheckedOutlined,
    MULTIPLE_CHOICE: CheckBoxOutlined,
    RATING:          StarRounded,
  };

  const qTypeLabel = (type: string) => {
    const k = `${rq}.qtype_${type}`;
    return t(k, { defaultValue: type });
  };

  const aiScore   = data.response?.aiScore   ?? null;
  const aiSummary = data.response?.aiSummary ?? null;

  if (questions.length === 0) {
    return (
      <Box sx={{ ...CARD, p: 4, textAlign: 'center' }}>
        <Typography sx={{ color: '#9CA3AF', fontSize: 14 }}>{t(`${rq}.empty`)}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {aiScore !== null ? (
        <Box sx={{ ...CARD, p: 3, display: 'flex', gap: 3, alignItems: 'flex-start' }}>
          <Box sx={{
            width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
            background: aiScore >= 75 ? 'linear-gradient(135deg,#16A34A,#15803D)' : aiScore >= 50 ? 'linear-gradient(135deg,#D97706,#B45309)' : 'linear-gradient(135deg,#DC2626,#B91C1C)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 8px 24px ${aiScore >= 75 ? 'rgba(22,163,74,0.3)' : aiScore >= 50 ? 'rgba(217,119,6,0.3)' : 'rgba(220,38,38,0.3)'}`,
          }}>
            <Typography sx={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>{aiScore}</Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
              {t(`${rq}.overall_score`)}
            </Typography>
            <Typography sx={{ fontSize: 24, fontWeight: 800, color: '#0F172A', lineHeight: 1.2, mb: aiSummary ? 1 : 0 }}>
              {aiScore}<Typography component="span" sx={{ fontSize: 14, color: '#94A3B8', fontWeight: 500 }}> / 100</Typography>
            </Typography>
            {aiSummary && (
              <Typography sx={{ fontSize: 13, color: '#374151', lineHeight: 1.7 }}>{aiSummary}</Typography>
            )}
          </Box>
        </Box>
      ) : scoringTimedOut ? (
        <Box sx={{ ...CARD, p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: '#F9FAFB', border: '1px solid #E2E8F0' }}>
          <Typography sx={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>
            {t(`${rq}.ai_score_unavailable`, { defaultValue: 'AI score is not available for this submission.' })}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ ...CARD, p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CircularProgress size={18} sx={{ color: '#F59E0B', flexShrink: 0 }} />
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#92400E' }}>
              {t(`${rq}.ai_progress_title`)}
            </Typography>
            <Typography sx={{ fontSize: 12, color: '#B45309' }}>
              {t(`${rq}.ai_progress_sub`)}
            </Typography>
          </Box>
        </Box>
      )}

      {questions.map((q, i) => {
        const answer    = answerMap[String(i)];
        const answerRec = answers[i];
        const qScore    = answerRec?.score ?? null;
        const TypeIcon  = typeIcon[q.type] ?? TextSnippetOutlined;
        const isRating  = q.type === 'RATING';
        const isMulti   = q.type === 'MULTIPLE_CHOICE';
        const selectedArr: string[] = isMulti && Array.isArray(answer) ? answer : [];

        return (
          <Box key={i} sx={{ ...CARD, p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
              <Box sx={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.25,
              }}>
                <Typography sx={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>{i + 1}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <TypeIcon sx={{ fontSize: 13, color: '#9CA3AF' }} />
                  <Typography sx={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {qTypeLabel(q.type)}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#0F172A', lineHeight: 1.5 }}>
                  {q.question}
                </Typography>
              </Box>
              {qScore !== null && <ScoreBadge score={qScore} />}
            </Box>

            <Divider sx={{ mb: 2 }} />

            {answer === undefined || answer === '' || (Array.isArray(answer) && answer.length === 0) ? (
              <Typography sx={{ fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' }}>{t(`${rq}.no_answer`)}</Typography>
            ) : isRating ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {[1,2,3,4,5].map(s => (
                  <StarRounded key={s} sx={{ fontSize: 26, color: s <= Number(answer) ? '#F59E0B' : '#E5E7EB' }} />
                ))}
                <Typography sx={{ ml: 1, fontSize: 14, fontWeight: 700, color: '#F59E0B' }}>{t(`${rq}.rating_of`, { n: answer })}</Typography>
              </Box>
            ) : isMulti ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                {(q.options ?? []).map((opt, oi) => {
                  const checked = selectedArr.includes(opt);
                  return (
                    <Box key={oi} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.75, borderRadius: 2, bgcolor: checked ? '#F5F3FF' : '#F9FAFB', border: `1px solid ${checked ? '#8B5CF6' : '#E5E7EB'}` }}>
                      <CheckBoxOutlined sx={{ fontSize: 16, color: checked ? '#8B5CF6' : '#D1D5DB' }} />
                      <Typography sx={{ fontSize: 13, color: checked ? '#374151' : '#9CA3AF', fontWeight: checked ? 600 : 400 }}>{opt}</Typography>
                    </Box>
                  );
                })}
              </Box>
            ) : q.type === 'SINGLE_CHOICE' ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                {(q.options ?? []).map((opt, oi) => {
                  const selected = answer === opt;
                  return (
                    <Box key={oi} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.75, borderRadius: 2, bgcolor: selected ? '#F5F3FF' : '#F9FAFB', border: `1px solid ${selected ? '#8B5CF6' : '#E5E7EB'}` }}>
                      <RadioButtonCheckedOutlined sx={{ fontSize: 16, color: selected ? '#8B5CF6' : '#D1D5DB' }} />
                      <Typography sx={{ fontSize: 13, color: selected ? '#374151' : '#9CA3AF', fontWeight: selected ? 600 : 400 }}>{opt}</Typography>
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <Typography sx={{ fontSize: 14, color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{String(answer)}</Typography>
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

// ─── Recommendation badge ──────────────────────────────────────────────────────

// ─── InterviewResults ──────────────────────────────────────────────────────────

export const InterviewResults: React.FC<{ data: ResultsData }> = ({ data }) => {
  const { t } = useTranslation('dashboard');
  const iv = 'pages.campaigns.detail.results_view.interview';
  const { response } = data;
  const score    = response?.aiScore ?? response?.testResults?.score ?? null;
  const maxScore = response?.testResults?.maxScore ?? 100;

  // breakdown is now an array: [{ area, label, score }]
  const breakdownArr: { area: string; label: string; score: number }[] =
    Array.isArray(response?.testResults?.breakdown) ? response!.testResults!.breakdown : [];

  // sub-scores come directly from the breakdown array
  const subScores = breakdownArr.filter(b => b.score != null).map(b => ({ label: b.label, value: b.score }));

  const hasContent = score !== null || response?.aiSummary || subScores.length > 0 || (response?.interviewTranscript?.length ?? 0) > 0;

  if (!hasContent) {
    return (
      <Box sx={{ ...CARD, p: 4, textAlign: 'center' }}>
        <Typography sx={{ color: '#9CA3AF', fontSize: 14 }}>{t(`${iv}.empty`)}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

      {/* ── Overall score ── */}
      {score !== null && (
        <Box sx={{ ...CARD, p: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box sx={{
            width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
            background: score >= 75 ? 'linear-gradient(135deg,#16A34A,#15803D)' : score >= 50 ? 'linear-gradient(135deg,#D97706,#B45309)' : 'linear-gradient(135deg,#DC2626,#B91C1C)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 8px 24px ${score >= 75 ? 'rgba(22,163,74,0.3)' : score >= 50 ? 'rgba(217,119,6,0.3)' : 'rgba(220,38,38,0.3)'}`,
          }}>
            <Typography sx={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>{score}</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 12, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t(`${iv}.overall_score`)}</Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
              {score}<Typography component="span" sx={{ fontSize: 14, color: '#94A3B8', fontWeight: 500 }}> / {maxScore}</Typography>
            </Typography>
          </Box>
        </Box>
      )}

      {/* ── Sub-scores ── */}
      {subScores.length > 0 && (
        <Box sx={{ ...CARD, p: 3 }}>
          <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 2 }}>
            {t(`${iv}.detailed_scores`)}
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            {subScores.map(({ label, value }) => {
              const color = value >= 75 ? '#16A34A' : value >= 50 ? '#D97706' : '#DC2626';
              return (
                <Box key={label} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{label}</Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 800, color }}>{value}%</Typography>
                  </Box>
                  <Box sx={{ height: 6, borderRadius: 3, bgcolor: '#F1F5F9', overflow: 'hidden' }}>
                    <Box sx={{ height: '100%', width: `${value}%`, bgcolor: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* ── Summary ── */}
      {response?.aiSummary && (
        <Box sx={{ ...CARD, p: 3 }}>
          <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.5 }}>
            {t(`${iv}.assessment_summary`)}
          </Typography>
          <Typography sx={{ fontSize: 14, color: '#374151', lineHeight: 1.75 }}>
            {response.aiSummary}
          </Typography>
        </Box>
      )}

      {/* ── Transcript ── */}
      {(response?.interviewTranscript?.length ?? 0) > 0 && (
        <Box sx={{ ...CARD, p: 3 }}>
          <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 2 }}>
            {t(`${iv}.transcript`)}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 420, overflowY: 'auto' }}>
            {response!.interviewTranscript.map((turn, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <Chip
                  label={turn.role === 'agent' ? t(`${iv}.role_agent`) : t(`${iv}.role_user`)}
                  size="small"
                  sx={{
                    fontSize: 10, fontWeight: 700, height: 20, flexShrink: 0,
                    bgcolor: turn.role === 'agent' ? '#EFF6FF' : '#F5F3FF',
                    color:   turn.role === 'agent' ? '#2563EB' : '#7C3AED',
                  }}
                />
                <Typography sx={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{turn.message}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

    </Box>
  );
};

// ─── CampaignResultsView ───────────────────────────────────────────────────────

interface Props {
  campaignId:    string;
  participantId: string;
  breadcrumbs:   { label: string; href?: string }[];
  backHref:      string;
  noLayout?:     boolean;
}

const CampaignResultsView: React.FC<Props> = ({ campaignId, participantId, breadcrumbs, backHref, noLayout }) => {
  const router   = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { t, i18n } = useTranslation('dashboard');
  const rv = 'pages.campaigns.detail.results_view';

  const data    = useSelector(selectParticipantResults);
  const loading = useSelector(selectResultsLoading);
  const error   = useSelector(selectResultsError);

  const [scoringTimedOut, setScoringTimedOut] = useState(false);
  const pollRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef(0);
  const MAX_POLLS    = 24; // 24 × 5s = 2 min max

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  useEffect(() => {
    if (!campaignId || !participantId) return;

    const load = () => dispatch(fetchParticipantResults({ campaignId, participantId }));

    load().then((action) => {
      if (fetchParticipantResults.fulfilled.match(action)) {
        const result = action.payload;
        // Poll until aiScore is set (async LLM scoring) — max 2 minutes
        const needsPoll =
          result.campaign?.module?.type === 'QUESTIONNAIRE' &&
          result.response !== null &&
          result.response?.aiScore == null;
        if (needsPoll && !pollRef.current) {
          pollCountRef.current = 0;
          pollRef.current = setInterval(() => {
            pollCountRef.current += 1;
            if (pollCountRef.current >= MAX_POLLS) {
              stopPolling();
              setScoringTimedOut(true);
              return;
            }
            load().then((a) => {
              if (fetchParticipantResults.fulfilled.match(a) && a.payload.response?.aiScore != null) {
                stopPolling();
              }
            });
          }, 5000);
        }
      }
    });

    return stopPolling;
  }, [campaignId, participantId]);

  const moduleType = data?.campaign?.module?.type ?? 'QUESTIONNAIRE';
  const meta       = MODULE_META[moduleType] ?? MODULE_META.QUESTIONNAIRE;
  const ModIcon    = meta.icon;

  const content = (
    <>
      {loading && !data ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress sx={{ color: '#8B5CF6' }} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
      ) : data ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 820, mx: 'auto' }}>

          {/* Header card */}
          <Box sx={{ ...CARD, overflow: 'hidden' }}>
            <Box sx={{ height: 4, background: meta.gradient }} />
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.25, borderRadius: 2, background: meta.gradient, display: 'flex', alignItems: 'center' }}>
                <ModIcon sx={{ fontSize: 22, color: '#fff' }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                  {data.campaign.title}
                </Typography>
                <Typography sx={{ fontSize: 13, color: '#64748B', mt: 0.25 }}>
                  {t(`pages.campaigns.module.${moduleType}`, { defaultValue: moduleType })}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75,
                  px: 1.5, py: 0.5, borderRadius: '999px', bgcolor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                  <CheckCircleOutlined sx={{ fontSize: 14, color: '#16A34A' }} />
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#16A34A' }}>{t(`${rv}.completed_badge`)}</Typography>
                </Box>
                {data.participant.completedAt && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarTodayOutlined sx={{ fontSize: 12, color: '#94A3B8' }} />
                    <Typography sx={{ fontSize: 12, color: '#94A3B8' }}>{fmt(data.participant.completedAt, i18n.language)}</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          {/* Results body */}
          {moduleType === 'QUESTIONNAIRE'
            ? <QuestionnaireResults data={data} scoringTimedOut={scoringTimedOut} />
            : <InterviewResults data={data} />
          }

          {/* Back button — hidden on public (link-based) results page */}
          {!noLayout && (
            <Box
              onClick={() => router.push(backHref)}
              sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.75,
                cursor: 'pointer', color: '#64748B', fontSize: 13, fontWeight: 600,
                '&:hover': { color: '#0F172A' }, transition: 'color 0.15s', pb: 2,
              }}
            >
              <ArrowBackOutlined sx={{ fontSize: 16 }} />
              {t(`${rv}.back_to_campaign`)}
            </Box>
          )}

        </Box>
      ) : null}
    </>
  );

  if (noLayout) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', px: { xs: 2, md: 4 }, py: 4 }}>
        {content}
      </Box>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader title="" breadcrumbs={breadcrumbs} />
      {content}
    </DashboardLayout>
  );
};

export default CampaignResultsView;
