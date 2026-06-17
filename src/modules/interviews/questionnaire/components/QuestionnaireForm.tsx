'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Typography, Button, TextField, Radio, Checkbox,
  LinearProgress, Chip, CircularProgress, Alert,
} from '@mui/material';
import CheckCircleRounded    from '@mui/icons-material/CheckCircleRounded';
import ArrowForwardRounded   from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRounded      from '@mui/icons-material/ArrowBackRounded';
import AssignmentOutlined    from '@mui/icons-material/AssignmentOutlined';
import SendRounded           from '@mui/icons-material/SendRounded';
import StarRounded           from '@mui/icons-material/StarRounded';
import StarBorderRounded     from '@mui/icons-material/StarBorderRounded';
import SaveOutlined          from '@mui/icons-material/SaveOutlined';
import { Question, QuestionType } from '@/types/campaign';
import axiosInstance from '@/utils/axiosInstance';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  campaignId:    string;
  participantId: string;
  questions:     Question[];
  onComplete:    () => void;
  onBack:        () => void;
}

type Answers = Record<number, string | number | string[]>;

const DRAFT_KEY = (campaignId: string, participantId: string) =>
  `qform_draft_${campaignId}_${participantId}`;

// ─── Star Rating ──────────────────────────────────────────────────────────────

const StarRating: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Box
          key={star}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          sx={{ cursor: 'pointer', color: star <= (hovered || value) ? '#F59E0B' : '#D1D5DB', transition: 'color 0.15s', lineHeight: 0 }}
        >
          {star <= (hovered || value)
            ? <StarRounded sx={{ fontSize: 36 }} />
            : <StarBorderRounded sx={{ fontSize: 36 }} />
          }
        </Box>
      ))}
      {value > 0 && (
        <Typography sx={{ ml: 1.5, alignSelf: 'center', fontSize: 14, fontWeight: 700, color: '#F59E0B' }}>
          {value} / 5
        </Typography>
      )}
    </Box>
  );
};

// ─── Single Question card ─────────────────────────────────────────────────────

const QuestionCard: React.FC<{
  question:  Question;
  index:     number;
  total:     number;
  answer:    string | number | string[] | undefined;
  onChange:  (val: string | number | string[]) => void;
}> = ({ question, index, total, answer, onChange }) => {
  const typeLabel: Record<QuestionType, string> = {
    TEXT:            'Open answer',
    SINGLE_CHOICE:   'Single choice',
    MULTIPLE_CHOICE: 'Multiple choice',
    RATING:          'Rating',
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* Question meta */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{index + 1}</Typography>
        </Box>
        <Chip
          label={typeLabel[question.type]}
          size="small"
          sx={{ fontSize: 10, fontWeight: 700, height: 20, bgcolor: '#F5F3FF', color: '#7C3AED', border: 'none' }}
        />
        <Typography sx={{ ml: 'auto', fontSize: 11, color: '#9CA3AF' }}>
          {index + 1} of {total}
        </Typography>
      </Box>

      {/* Question text */}
      <Typography sx={{ fontSize: 17, fontWeight: 600, color: '#111827', lineHeight: 1.55 }}>
        {question.question}
      </Typography>

      {/* Answer input */}
      {question.type === 'TEXT' && (
        <TextField
          multiline
          minRows={4}
          maxRows={8}
          placeholder="Type your answer here…"
          value={answer ?? ''}
          onChange={(e) => onChange(e.target.value)}
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2.5, fontSize: 14, bgcolor: '#FAFAFA',
              '&.Mui-focused fieldset': { borderColor: '#8B5CF6' },
            },
          }}
        />
      )}

      {question.type === 'SINGLE_CHOICE' && question.options && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {question.options.map((opt, i) => (
            <Box
              key={i}
              onClick={() => onChange(opt)}
              sx={{
                display: 'flex', alignItems: 'center',
                px: 2, py: 1.25, borderRadius: 2.5, cursor: 'pointer',
                border: `1.5px solid ${answer === opt ? '#8B5CF6' : '#E5E7EB'}`,
                bgcolor: answer === opt ? '#F5F3FF' : '#FAFAFA',
                transition: 'all 0.15s',
                '&:hover': { borderColor: '#8B5CF6', bgcolor: '#F5F3FF' },
              }}
            >
              <Radio
                checked={answer === opt}
                size="small"
                sx={{ color: '#D1D5DB', '&.Mui-checked': { color: '#8B5CF6' }, p: 0.5, mr: 1, pointerEvents: 'none' }}
              />
              <Typography sx={{ fontSize: 14, color: '#374151', fontWeight: answer === opt ? 600 : 400, flex: 1 }}>
                {opt}
              </Typography>
              {answer === opt && (
                <CheckCircleRounded sx={{ fontSize: 18, color: '#8B5CF6', ml: 1 }} />
              )}
            </Box>
          ))}
        </Box>
      )}

      {question.type === 'MULTIPLE_CHOICE' && question.options && (() => {
        const selected: string[] = Array.isArray(answer) ? (answer as string[]) : [];
        const toggle = (opt: string) => {
          const next = selected.includes(opt) ? selected.filter(o => o !== opt) : [...selected, opt];
          onChange(next);
        };
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {question.options.map((opt, i) => {
              const checked = selected.includes(opt);
              return (
                <Box
                  key={i}
                  onClick={() => toggle(opt)}
                  sx={{
                    display: 'flex', alignItems: 'center',
                    px: 2, py: 1.25, borderRadius: 2.5, cursor: 'pointer',
                    border: `1.5px solid ${checked ? '#8B5CF6' : '#E5E7EB'}`,
                    bgcolor: checked ? '#F5F3FF' : '#FAFAFA',
                    transition: 'all 0.15s',
                    '&:hover': { borderColor: '#8B5CF6', bgcolor: '#F5F3FF' },
                  }}
                >
                  <Checkbox
                    checked={checked}
                    size="small"
                    sx={{ color: '#D1D5DB', '&.Mui-checked': { color: '#8B5CF6' }, p: 0.5, mr: 1, pointerEvents: 'none' }}
                  />
                  <Typography sx={{ fontSize: 14, color: '#374151', fontWeight: checked ? 600 : 400, flex: 1 }}>
                    {opt}
                  </Typography>
                  {checked && (
                    <CheckCircleRounded sx={{ fontSize: 18, color: '#8B5CF6', ml: 1 }} />
                  )}
                </Box>
              );
            })}
          </Box>
        );
      })()}

      {question.type === 'RATING' && (
        <StarRating value={Number(answer) || 0} onChange={onChange} />
      )}
    </Box>
  );
};

// ─── Completed screen ─────────────────────────────────────────────────────────

const CompletedScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 6, gap: 2.5 }}>
    <Box sx={{
      width: 80, height: 80, borderRadius: '50%',
      background: 'linear-gradient(135deg, #10B981, #059669)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 8px 32px rgba(16,185,129,0.35)',
    }}>
      <CheckCircleRounded sx={{ fontSize: 44, color: '#fff' }} />
    </Box>
    <Box>
      <Typography sx={{ fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', mb: 0.5 }}>
        Questionnaire Submitted!
      </Typography>
      <Typography sx={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7, maxWidth: 360 }}>
        Your answers have been recorded. Thank you for completing this assessment.
      </Typography>
    </Box>
    <Button
      variant="outlined"
      onClick={onBack}
      sx={{
        mt: 1, textTransform: 'none', fontWeight: 600, borderRadius: 2.5,
        borderColor: '#E5E7EB', color: '#374151', px: 4, py: 1.25,
        '&:hover': { borderColor: '#10B981', color: '#059669', bgcolor: '#ECFDF5' },
      }}
    >
      Back to Campaign
    </Button>
  </Box>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const QuestionnaireForm: React.FC<Props> = ({ campaignId, participantId, questions, onComplete, onBack }) => {
  const draftKey = DRAFT_KEY(campaignId, participantId);

  // Load draft from localStorage on first render
  const loadDraft = (): { answers: Answers; current: number } => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) return JSON.parse(raw);
    } catch {}
    return { answers: {}, current: 0 };
  };

  const draft = loadDraft();

  const [current,    setCurrent]    = useState(draft.current);
  const [answers,    setAnswers]    = useState<Answers>(draft.answers);
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [resumed,    setResumed]    = useState(Object.keys(draft.answers).length > 0);

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total      = questions.length;
  const progress   = total > 0 ? ((current + 1) / total) * 100 : 0;
  const currentQ   = questions[current];
  const currentAns = answers[current];
  const isAnswered = Array.isArray(currentAns)
    ? (currentAns as string[]).length > 0
    : currentAns !== undefined && currentAns !== '';

  // Persist draft to localStorage + debounce remote save
  const persistDraft = useCallback((nextAnswers: Answers, nextCurrent: number) => {
    try {
      localStorage.setItem(draftKey, JSON.stringify({ answers: nextAnswers, current: nextCurrent }));
    } catch {}

    // Debounced remote save (2s)
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        const payload = questions.map((q, i) => ({
          questionId: String(i),
          answer: nextAnswers[i] ?? '',
        }));
        await axiosInstance.post(`internal-campaigns/${campaignId}/questionnaire/save-progress`, {
          participantId,
          answers: payload,
        });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch {
        setSaveStatus('idle');
      }
    }, 2000);
  }, [campaignId, participantId, questions, draftKey]);

  const setAnswer = (val: string | number | string[]) => {
    const next = { ...answers, [current]: val };
    setAnswers(next);
    persistDraft(next, current);
  };

  const goNext = () => {
    if (current < total - 1) {
      const next = current + 1;
      setCurrent(next);
      persistDraft(answers, next);
    }
  };

  const goPrev = () => {
    if (current > 0) {
      const next = current - 1;
      setCurrent(next);
      persistDraft(answers, next);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    try {
      const payload = questions.map((q, i) => ({
        questionId: String(i),
        answer: answers[i] ?? '',
      }));
      await axiosInstance.post(`internal-campaigns/${campaignId}/questionnaire/submit`, {
        participantId,
        answers: payload,
      });
      // Clear draft from localStorage on successful submit
      try { localStorage.removeItem(draftKey); } catch {}
      setDone(true);
      onComplete();
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = Object.values(answers).filter(v =>
    Array.isArray(v) ? (v as string[]).length > 0 : v !== undefined && v !== ''
  ).length;
  const allAnswered = answeredCount === total;
  const isLast      = current === total - 1;

  if (done) return <CompletedScreen onBack={onBack} />;

  if (total === 0) return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <AssignmentOutlined sx={{ fontSize: 48, color: '#E5E7EB', mb: 2 }} />
      <Typography sx={{ fontSize: 15, color: '#6B7280' }}>No questions configured for this questionnaire.</Typography>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, height: '100%' }}>

      {/* Header */}
      <Box sx={{
        px: 3, pt: 2.5, pb: 2,
        borderBottom: '1px solid #F3F4F6',
        display: 'flex', alignItems: 'center', gap: 1.5,
      }}>
        <Box sx={{
          p: 1, borderRadius: 2,
          background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
          display: 'flex', alignItems: 'center',
        }}>
          <AssignmentOutlined sx={{ fontSize: 18, color: '#fff' }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>
            Questionnaire
          </Typography>
          <Typography sx={{ fontSize: 11, color: '#9CA3AF' }}>
            {answeredCount} of {total} answered
          </Typography>
        </Box>

        {/* Auto-save indicator */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          {saveStatus === 'saving' && (
            <>
              <CircularProgress size={11} sx={{ color: '#9CA3AF' }} />
              <Typography sx={{ fontSize: 11, color: '#9CA3AF' }}>Saving…</Typography>
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <SaveOutlined sx={{ fontSize: 13, color: '#10B981' }} />
              <Typography sx={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>Saved</Typography>
            </>
          )}
        </Box>

        <Chip
          label={`${Math.round((answeredCount / total) * 100)}%`}
          size="small"
          sx={{
            fontWeight: 700, fontSize: 11, height: 22,
            bgcolor: allAnswered ? '#ECFDF5' : '#F5F3FF',
            color: allAnswered ? '#059669' : '#7C3AED',
          }}
        />
      </Box>

      {/* Progress bar */}
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 3, bgcolor: '#F3F4F6', flexShrink: 0,
          '& .MuiLinearProgress-bar': {
            background: 'linear-gradient(90deg, #6366F1, #8B5CF6)',
            borderRadius: 2,
          },
        }}
      />

      {/* Question area */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 3, py: 3 }}>
        {/* Resume banner */}
        {resumed && (
          <Alert
            severity="info"
            icon={<SaveOutlined sx={{ fontSize: 16 }} />}
            onClose={() => setResumed(false)}
            sx={{ mb: 2, borderRadius: 2, fontSize: 13, '& .MuiAlert-message': { fontWeight: 500 } }}
          >
            Your previous progress has been restored.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        <QuestionCard
          question={currentQ}
          index={current}
          total={total}
          answer={currentAns}
          onChange={setAnswer}
        />
      </Box>

      {/* Navigation footer */}
      <Box sx={{
        px: 3, py: 2,
        borderTop: '1px solid #F3F4F6',
        display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0,
      }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackRounded />}
          onClick={goPrev}
          disabled={current === 0}
          sx={{
            textTransform: 'none', fontWeight: 600, borderRadius: 2,
            borderColor: '#E5E7EB', color: '#374151', px: 2,
            '&:hover': { borderColor: '#6366F1', color: '#6366F1', bgcolor: '#F5F3FF' },
            '&.Mui-disabled': { borderColor: '#F3F4F6' },
          }}
        >
          Back
        </Button>

        {/* Dot indicators */}
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 0.75, flexWrap: 'wrap' }}>
          {questions.map((_, i) => {
            const answered = Array.isArray(answers[i])
              ? (answers[i] as string[]).length > 0
              : answers[i] !== undefined && answers[i] !== '';
            const active   = i === current;
            return (
              <Box
                key={i}
                onClick={() => { setCurrent(i); persistDraft(answers, i); }}
                sx={{
                  width: active ? 20 : 8, height: 8, borderRadius: 4, cursor: 'pointer',
                  bgcolor: active ? '#8B5CF6' : answered ? '#10B981' : '#E5E7EB',
                  transition: 'all 0.2s',
                }}
              />
            );
          })}
        </Box>

        {isLast ? (
          <Button
            variant="contained"
            endIcon={submitting ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <SendRounded sx={{ fontSize: 16 }} />}
            onClick={handleSubmit}
            disabled={submitting || !allAnswered}
            sx={{
              textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 2.5, color: '#fff',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
              '&:hover': { boxShadow: '0 6px 20px rgba(16,185,129,0.4)' },
              '&.Mui-disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF', boxShadow: 'none' },
            }}
          >
            {submitting ? 'Submitting…' : 'Submit'}
          </Button>
        ) : (
          <Button
            variant="contained"
            endIcon={<ArrowForwardRounded />}
            onClick={goNext}
            disabled={!isAnswered}
            sx={{
              textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 2.5, color: '#fff',
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              boxShadow: '0 4px 14px rgba(99,102,241,0.25)',
              '&:hover': { boxShadow: '0 6px 20px rgba(99,102,241,0.35)' },
              '&.Mui-disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF', boxShadow: 'none' },
            }}
          >
            Next
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default QuestionnaireForm;
