import React from 'react';
import { Sparkles } from 'lucide-react';
import { Card } from '@/modules/shared/ui/shadcn/card';
import { Badge } from '@/modules/shared/ui/shadcn/badge';
import { Spinner } from '@/modules/shared/ui/shadcn/spinner';
import type { Question, QuestionType } from '@/modules/company/campaigns/types/campaign';
import { useMyQuestionnaireResultsQuery } from '../queries';

function scoreColor(s: number) {
  if (s >= 70) return { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' };
  if (s >= 40) return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
  return { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
}

const TYPE_LABEL: Record<QuestionType, string> = {
  TEXT: 'Open answer',
  SINGLE_CHOICE: 'Single choice',
  MULTIPLE_CHOICE: 'Multiple choice',
  RATING: 'Rating',
};

const formatAnswer = (type: QuestionType, answer: string | number | string[] | undefined) => {
  if (answer === undefined || answer === '' || (Array.isArray(answer) && answer.length === 0)) return '—';
  if (type === 'MULTIPLE_CHOICE' && Array.isArray(answer)) return answer.join(', ');
  if (type === 'RATING') return `${answer} / 5`;
  return String(answer);
};

interface Props {
  campaignId: string;
  participantId: string;
  questions: Question[];
}

export const QuestionnaireResultsPanel: React.FC<Props> = ({ campaignId, participantId, questions }) => {
  const { data, isLoading } = useMyQuestionnaireResultsQuery(campaignId, participantId, true);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-400">
        <Spinner className="size-4" />
        Loading your results…
      </div>
    );
  }

  const response = data?.response;
  if (!response) return null;

  const stillScoring = response.aiScore == null && !response.aiSummary;
  const sc = response.aiScore != null ? scoreColor(response.aiScore) : null;

  return (
    <div className="w-full flex flex-col gap-3 text-left">
      {stillScoring ? (
        <Card className="flex-row items-center gap-2.5 rounded-xl border-slate-200 py-3 px-4">
          <Spinner className="size-4 text-slate-400" />
          <p className="text-[13px] text-slate-500">Your results are being scored — this can take a few seconds…</p>
        </Card>
      ) : (
        <Card className={`flex-row items-start gap-3 rounded-xl py-3 px-4 ${sc ? `${sc.bg} ${sc.border}` : 'border-slate-200'}`}>
          {response.aiScore != null && (
            <div className={`flex shrink-0 size-11 items-center justify-center rounded-full bg-white border-2 ${sc?.border}`}>
              <span className={`text-sm font-extrabold ${sc?.text}`}>{response.aiScore}</span>
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Sparkles className="size-3.5 text-violet-500" />
              <p className="text-[12px] font-bold text-slate-700">AI Summary</p>
            </div>
            <p className="text-[13px] text-slate-500 leading-relaxed">{response.aiSummary || '—'}</p>
          </div>
        </Card>
      )}

      {questions.length > 0 && (
        <div className="flex flex-col gap-2">
          {questions.map((q, i) => {
            const a = response.answers?.find((x) => x.questionId === String(i));
            return (
              <Card key={i} className="rounded-xl border-slate-200 py-2.5 px-3.5 gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold text-violet-600">{String(i + 1).padStart(2, '0')}</span>
                  <Badge variant="secondary" className="bg-violet-50 text-violet-700 text-[10px] h-[18px]">
                    {TYPE_LABEL[q.type]}
                  </Badge>
                  {a?.score != null && (
                    <Badge variant="outline" className={`ml-auto text-[10px] h-[18px] ${scoreColor(a.score).text} ${scoreColor(a.score).border}`}>
                      {a.score}%
                    </Badge>
                  )}
                </div>
                <p className="text-[13px] font-semibold text-slate-800">{q.question}</p>
                <p className="text-[13px] text-slate-600 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5">
                  {formatAnswer(q.type, a?.answer)}
                </p>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
