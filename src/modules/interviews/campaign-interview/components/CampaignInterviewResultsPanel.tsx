import React from 'react';
import { Sparkles } from 'lucide-react';
import { Card } from '@/modules/shared/ui/shadcn/card';
import { Spinner } from '@/modules/shared/ui/shadcn/spinner';
import { useMyInterviewResultsQuery } from '../queries';

function scoreColor(s: number) {
  if (s >= 70) return { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', bar: 'bg-emerald-600' };
  if (s >= 40) return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', bar: 'bg-amber-600' };
  return { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', bar: 'bg-red-600' };
}

interface Props {
  campaignId: string;
  participantId: string;
}

export const CampaignInterviewResultsPanel: React.FC<Props> = ({ campaignId, participantId }) => {
  const { data, isLoading } = useMyInterviewResultsQuery(campaignId, participantId, true);

  if (isLoading && !data) {
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
  const breakdown = response.testResults?.breakdown ?? [];

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

      {breakdown.length > 0 && (
        <div className="flex flex-col gap-2">
          {breakdown.map((b) => (
            <Card key={b.area} className="flex-row items-center gap-3 rounded-xl border-slate-200 py-2.5 px-3.5">
              <p className="flex-1 text-[13px] font-semibold text-slate-700">{b.label}</p>
              <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${scoreColor(b.score).bar}`}
                  style={{ width: `${Math.max(0, Math.min(100, b.score))}%` }}
                />
              </div>
              <span className={`text-[12px] font-extrabold w-8 text-right ${scoreColor(b.score).text}`}>{b.score}</span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
