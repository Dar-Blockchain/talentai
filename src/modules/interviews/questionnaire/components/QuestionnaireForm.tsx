'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Textarea } from '@/modules/shared/ui/shadcn/textarea';
import { Badge } from '@/modules/shared/ui/shadcn/badge';
import { Spinner } from '@/modules/shared/ui/shadcn/spinner';
import { Alert, AlertDescription } from '@/modules/shared/ui/shadcn/alert';
import { Button } from '@/modules/shared/ui/shadcn/button';
import {
  CheckCircle2 as CheckCircleRounded,
  ArrowRight as ArrowForwardRounded,
  ArrowLeft as ArrowBackRounded,
  ClipboardList as AssignmentOutlined,
  Send as SendRounded,
  Star as StarRounded,
  Star as StarBorderRounded,
  Save as SaveOutlined,
  X as CloseIcon,
} from 'lucide-react';
import { Question, QuestionType } from '@/modules/company/campaigns/types/campaign';
import axios, { type AxiosError } from 'axios';
import axiosInstance from '@/utils/axiosInstance';
import { QuestionnaireResultsPanel } from './QuestionnaireResultsPanel';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  campaignId:    string;
  campaignTitle?: string;
  participantId: string;
  questions:     Question[];
  showResults?:  boolean;
  isLoggedIn?:   boolean;
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
    <div className="mt-2 flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <div
          key={star}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="cursor-pointer leading-none transition-colors"
          style={{ color: star <= (hovered || value) ? '#F59E0B' : '#D1D5DB' }}
        >
          {star <= (hovered || value)
            ? <StarRounded size={36} fill="currentColor" />
            : <StarBorderRounded size={36} />
          }
        </div>
      ))}
      {value > 0 && (
        <span className="ml-3 self-center text-sm font-bold text-[#F59E0B]">
          {value} / 5
        </span>
      )}
    </div>
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
    <div className="flex flex-col gap-6">

      {/* Question meta */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
          <span className="text-[13px] font-extrabold text-white">{index + 1}</span>
        </div>
        <Badge className="h-5 rounded-full border-transparent bg-[#F5F3FF] text-[10px] font-bold text-[#7C3AED]">
          {typeLabel[question.type]}
        </Badge>
        <span className="ml-auto text-[11px] text-[#9CA3AF]">
          {index + 1} of {total}
        </span>
      </div>

      {/* Question text */}
      <p className="text-[17px] font-semibold leading-[1.55] text-[#111827]">
        {question.question}
      </p>

      {/* Answer input */}
      {question.type === 'TEXT' && (
        <Textarea
          rows={4}
          placeholder="Type your answer here…"
          value={(answer as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-xl bg-[#FAFAFA] text-sm focus-visible:border-[#8B5CF6] focus-visible:ring-[#8B5CF6]/30"
        />
      )}

      {question.type === 'SINGLE_CHOICE' && question.options && (
        <div className="flex flex-col gap-2">
          {question.options.map((opt, i) => (
            <div
              key={i}
              onClick={() => onChange(opt)}
              className="flex cursor-pointer items-center rounded-xl px-4 py-2.5 transition-all hover:border-[#8B5CF6] hover:bg-[#F5F3FF]"
              style={{
                border: `1.5px solid ${answer === opt ? '#8B5CF6' : '#E5E7EB'}`,
                backgroundColor: answer === opt ? '#F5F3FF' : '#FAFAFA',
              }}
            >
              <span
                className="mr-2.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2"
                style={{ borderColor: answer === opt ? '#8B5CF6' : '#D1D5DB' }}
              >
                {answer === opt && <span className="h-2 w-2 rounded-full bg-[#8B5CF6]" />}
              </span>
              <span className={`flex-1 text-sm text-[#374151] ${answer === opt ? 'font-semibold' : 'font-normal'}`}>
                {opt}
              </span>
              {answer === opt && (
                <CheckCircleRounded size={18} color='#8B5CF6' className="ml-2" />
              )}
            </div>
          ))}
        </div>
      )}

      {question.type === 'MULTIPLE_CHOICE' && question.options && (() => {
        const selected: string[] = Array.isArray(answer) ? (answer as string[]) : [];
        const toggle = (opt: string) => {
          const next = selected.includes(opt) ? selected.filter(o => o !== opt) : [...selected, opt];
          onChange(next);
        };
        return (
          <div className="flex flex-col gap-2">
            {question.options.map((opt, i) => {
              const checked = selected.includes(opt);
              return (
                <div
                  key={i}
                  onClick={() => toggle(opt)}
                  className="flex cursor-pointer items-center rounded-xl px-4 py-2.5 transition-all hover:border-[#8B5CF6] hover:bg-[#F5F3FF]"
                  style={{
                    border: `1.5px solid ${checked ? '#8B5CF6' : '#E5E7EB'}`,
                    backgroundColor: checked ? '#F5F3FF' : '#FAFAFA',
                  }}
                >
                  <span
                    className="mr-2.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border-2"
                    style={{ borderColor: checked ? '#8B5CF6' : '#D1D5DB', backgroundColor: checked ? '#8B5CF6' : 'transparent' }}
                  >
                    {checked && <CheckCircleRounded size={11} color="#fff" fill="#8B5CF6" />}
                  </span>
                  <span className={`flex-1 text-sm text-[#374151] ${checked ? 'font-semibold' : 'font-normal'}`}>
                    {opt}
                  </span>
                  {checked && (
                    <CheckCircleRounded size={18} color='#8B5CF6' className="ml-2" />
                  )}
                </div>
              );
            })}
          </div>
        );
      })()}

      {question.type === 'RATING' && (
        <StarRating value={Number(answer) || 0} onChange={onChange} />
      )}
    </div>
  );
};

// ─── Completed screen ─────────────────────────────────────────────────────────

const CompletedScreen: React.FC<{
  campaignId: string;
  campaignTitle?: string;
  participantId: string;
  questions: Question[];
  showResults?: boolean;
  isLoggedIn?: boolean;
  onDone: () => void;
}> = ({ campaignId, campaignTitle, participantId, questions, showResults, isLoggedIn, onDone }) => (
  <div className="flex flex-col items-center gap-5 px-6 py-12 text-center">
    <div
      className="flex h-20 w-20 items-center justify-center rounded-full"
      style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 8px 32px rgba(16,185,129,0.35)' }}
    >
      <CheckCircleRounded size={44} color='#fff' />
    </div>
    <div>
      <p className="mb-1 text-2xl font-extrabold tracking-[-0.02em] text-[#111827]">
        Thank you!
      </p>
      <p className="max-w-[360px] text-sm leading-[1.7] text-[#6B7280]">
        You have completed {campaignTitle ? `"${campaignTitle}"` : 'this questionnaire'}. Your answers have been recorded.
      </p>
    </div>

    {showResults && (
      <QuestionnaireResultsPanel campaignId={campaignId} participantId={participantId} questions={questions} />
    )}

    {isLoggedIn && (
      <Button variant="outline" onClick={onDone} className="mt-1 rounded-[20px] px-8 py-5 font-semibold">
        Back to Dashboard
      </Button>
    )}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const QuestionnaireForm: React.FC<Props> = ({ campaignId, campaignTitle, participantId, questions, showResults, isLoggedIn, onComplete, onBack }) => {
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
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err as AxiosError<{ error?: string }>).response?.data?.error
        : undefined;
      setError(message ?? 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = Object.values(answers).filter(v =>
    Array.isArray(v) ? (v as string[]).length > 0 : v !== undefined && v !== ''
  ).length;
  const allAnswered = answeredCount === total;
  const isLast      = current === total - 1;

  if (done) return (
    <CompletedScreen
      campaignId={campaignId}
      campaignTitle={campaignTitle}
      participantId={participantId}
      questions={questions}
      showResults={showResults}
      isLoggedIn={isLoggedIn}
      onDone={onComplete}
    />
  );

  if (total === 0) return (
    <div className="py-16 text-center">
      <AssignmentOutlined size={48} color='#E5E7EB' className="mb-4" />
      <p className="text-[15px] text-[#6B7280]">No questions configured for this questionnaire.</p>
    </div>
  );

  return (
    <div className="flex h-full flex-col gap-0">

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#F3F4F6] px-6 pb-4 pt-5">
        <button
          onClick={onBack}
          className="-ml-2 rounded-md p-1.5 text-[#94A3B8] hover:bg-black/[0.04] hover:text-[#0F172A]"
        >
          <ArrowBackRounded size={18} />
        </button>
        <div className="flex items-center rounded-lg p-2" style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
          <AssignmentOutlined size={18} color='#fff' />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold leading-tight text-[#111827]">
            {campaignTitle || 'Questionnaire'}
          </p>
          <p className="text-[11px] text-[#9CA3AF]">
            {answeredCount} of {total} answered
          </p>
        </div>

        {/* Auto-save indicator */}
        <div className="flex items-center gap-2">
          {saveStatus === 'saving' && (
            <>
              <Spinner className="size-[11px]" style={{ color: '#9CA3AF' }} />
              <span className="text-[11px] text-[#9CA3AF]">Saving…</span>
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <SaveOutlined size={13} color='#10B981' />
              <span className="text-[11px] font-semibold text-[#10B981]">Saved</span>
            </>
          )}
        </div>

        <Badge
          className="h-[22px] rounded-full border-transparent text-[11px] font-bold"
          style={{
            backgroundColor: allAnswered ? '#ECFDF5' : '#F5F3FF',
            color: allAnswered ? '#059669' : '#7C3AED',
          }}
        >
          {Math.round((answeredCount / total) * 100)}%
        </Badge>
      </div>

      {/* Progress bar */}
      <div className="h-[3px] shrink-0 bg-[#F3F4F6]">
        <div
          className="h-full rounded-r transition-[width] duration-200"
          style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #6366F1, #8B5CF6)' }}
        />
      </div>

      {/* Question area */}
      <div className="flex-1 overflow-auto px-6 py-6">
        {/* Resume banner */}
        {resumed && (
          <Alert className="mb-4 rounded-lg border-blue-200 bg-blue-50 text-blue-700 [&>svg]:text-blue-600">
            <SaveOutlined size={16} />
            <AlertDescription className="flex flex-1 items-center justify-between font-medium text-blue-700">
              Your previous progress has been restored.
              <button onClick={() => setResumed(false)} className="ml-2 rounded p-0.5 hover:bg-blue-100">
                <CloseIcon size={14} />
              </button>
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4 rounded-lg">
            <AlertDescription className="flex flex-1 items-center justify-between">
              {error}
              <button onClick={() => setError(null)} className="ml-2 rounded p-0.5 hover:bg-destructive/10">
                <CloseIcon size={14} />
              </button>
            </AlertDescription>
          </Alert>
        )}
        <QuestionCard
          question={currentQ}
          index={current}
          total={total}
          answer={currentAns}
          onChange={setAnswer}
        />
      </div>

      {/* Navigation footer */}
      <div className="flex shrink-0 items-center gap-3 border-t border-[#F3F4F6] px-6 py-4">
        <Button variant="outline" onClick={goPrev} disabled={current === 0} className="rounded-lg px-4 font-semibold">
          <ArrowBackRounded />
          Back
        </Button>

        {/* Dot indicators */}
        <div className="flex flex-1 flex-wrap justify-center gap-1.5">
          {questions.map((_, i) => {
            const answered = Array.isArray(answers[i])
              ? (answers[i] as string[]).length > 0
              : answers[i] !== undefined && answers[i] !== '';
            const active   = i === current;
            return (
              <div
                key={i}
                onClick={() => { setCurrent(i); persistDraft(answers, i); }}
                className="h-2 cursor-pointer rounded-full transition-all"
                style={{
                  width: active ? 20 : 8,
                  backgroundColor: active ? '#8B5CF6' : answered ? '#10B981' : '#E5E7EB',
                }}
              />
            );
          })}
        </div>

        {isLast ? (
          <Button
            variant="default"
            onClick={handleSubmit}
            disabled={submitting || !allAnswered}
            loading={submitting}
            className="rounded-lg px-5 font-bold text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)]"
            style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
          >
            {submitting ? 'Submitting…' : 'Submit'}
            {!submitting && <SendRounded size={16} />}
          </Button>
        ) : (
          <Button
            variant="default"
            onClick={goNext}
            disabled={!isAnswered}
            className="rounded-lg px-5 font-bold text-white shadow-[0_4px_14px_rgba(99,102,241,0.25)]"
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
          >
            Next
            <ArrowForwardRounded />
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuestionnaireForm;
