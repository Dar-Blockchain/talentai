"use client";

import React, { memo, useMemo } from "react";
import { ClipboardList, Star, ThumbsUp, TrendingUp, TrendingDown } from "lucide-react";
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from "@/modules/shared/ui/shadcn/dialog";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Badge } from "@/modules/shared/ui/shadcn/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/modules/shared/ui/shadcn/tabs";
import { useParticipantResultsQuery, useMyParticipantResultsQuery } from "../../queries";
import { QuestionType } from "@/modules/company/campaigns/types/campaign";
import { useTranslation } from "react-i18next";

function scoreColor(s: number) { return s >= 70 ? "#16A34A" : s >= 40 ? "#D97706" : "#DC2626"; }
function scoreBg(s: number)    { return s >= 70 ? "#F0FDF4" : s >= 40 ? "#FFFBEB" : "#FEF2F2"; }

const TYPE_LABEL: Record<QuestionType, string> = {
  TEXT:            "Open answer",
  SINGLE_CHOICE:   "Single choice",
  MULTIPLE_CHOICE: "Multiple choice",
  RATING:          "Rating",
};

const RECOMMENDATION_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  strong_hire: { label: "Strong Hire", color: "#16A34A", bg: "#F0FDF4", border: "#86EFAC" },
  hire:        { label: "Hire",        color: "#0D9488", bg: "#F0FDFA", border: "#5EEAD4" },
  consider:    { label: "Consider",    color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  reject:      { label: "Not Recommended", color: "#DC2626", bg: "#FEF2F2", border: "#FCA5A5" },
};

const formatAnswer = (type: QuestionType, answer: string | number | string[] | undefined) => {
  if (answer === undefined || answer === "" || (Array.isArray(answer) && answer.length === 0)) return "—";
  if (type === "MULTIPLE_CHOICE" && Array.isArray(answer)) return answer.join(", ");
  if (type === "RATING") return `${answer} / 5`;
  return String(answer);
};

const fmtDate = (d: string | undefined, locale: string) =>
  d
    ? new Date(d).toLocaleDateString(locale.startsWith("fr") ? "fr-FR" : "en-US", {
      month: "short", day: "numeric", year: "numeric",
    })
    : null;

interface Props {
  open: boolean;
  campaignId: string;
  participantId: string | null;
  participantName: string;
  onClose: () => void;
  /** "self" fetches via the participant's own results endpoint (used by employees viewing their own campaign results). */
  mode?: "company" | "self";
}

const ParticipantResultsDialog = memo<Props>(({ open, campaignId, participantId, participantName, onClose, mode = "company" }) => {
  const { t, i18n } = useTranslation("dashboard");
  const sp = "pages.campaigns.detail.sessions";
  const rp = `${sp}.results_dialog`;

  const companyQuery = useParticipantResultsQuery(campaignId, mode === "company" && open ? participantId : null);
  const selfQuery = useMyParticipantResultsQuery(campaignId, mode === "self" && open ? participantId : null);
  const { data, isLoading: loading, error: queryError } = mode === "self" ? selfQuery : companyQuery;
  const error = queryError ? t(`${sp}.load_failed`) : null;

  const response  = data?.response ?? null;
  const campaignModule = data?.campaign?.module;
  const questions = useMemo(
    () => (campaignModule?.type === "QUESTIONNAIRE" ? campaignModule.config?.questions ?? [] : []),
    [campaignModule],
  );
  const aiScoringEnabled = campaignModule?.type !== "QUESTIONNAIRE" || campaignModule.config?.aiScoringEnabled !== false;
  const recommendation = response?.aiReport?.recommendation ? RECOMMENDATION_META[response.aiReport.recommendation] : null;
  const completedDate = fmtDate(data?.participant?.completedAt, i18n.language);

  const answerFor = (index: number) =>
    response?.answers?.find((a) => a.questionId === String(index));

  const hasSummary     = !!(response?.aiScore != null || response?.aiSummary || recommendation || (!aiScoringEnabled && response));
  const hasBreakdown   = (response?.testResults?.breakdown?.length ?? 0) > 0;
  const hasGrowth      = (response?.aiReport?.strengths?.length ?? 0) > 0 || (response?.aiReport?.areasForImprovement?.length ?? 0) > 0;
  const hasAnswers     = questions.length > 0;
  const hasDetails     = hasBreakdown || hasGrowth || hasAnswers;
  const hasTranscript  = (response?.interviewTranscript?.length ?? 0) > 0;

  const panels = useMemo(() => {
    const list: { key: string; label: string }[] = [];
    if (hasSummary)    list.push({ key: "summary",    label: t(`${rp}.tab_summary`) });
    if (hasDetails)    list.push({ key: "details",    label: t(`${rp}.tab_details`) });
    if (hasTranscript) list.push({ key: "transcript", label: t(`${rp}.tab_transcript`) });
    return list;
  }, [hasSummary, hasDetails, hasTranscript, t, rp]);

  const summaryContent = response && (
    <div className="flex flex-col gap-3.5">
      {(response.aiScore != null || response.aiSummary || recommendation) && (
        <div
          className="rounded-2xl p-4 border"
          style={{
            background: response.aiScore != null ? scoreBg(response.aiScore) : "#F8FAFC",
            borderColor: response.aiScore != null ? `${scoreColor(response.aiScore)}30` : "#E5E7EB",
          }}
        >
          <div className="flex items-start gap-3.5">
            {response.aiScore != null && (
              <div
                className="flex shrink-0 items-center justify-center size-[52px] rounded-full bg-white border-2"
                style={{ borderColor: scoreColor(response.aiScore) }}
              >
                <span className="text-[15px] font-extrabold" style={{ color: scoreColor(response.aiScore) }}>
                  {response.aiScore}
                </span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-xs font-bold text-foreground/80">{t(`${rp}.ai_summary_label`)}</p>
                {recommendation && (
                  <Badge
                    className="ml-auto shrink-0 text-[10.5px] font-bold border gap-1"
                    style={{ background: "white", color: recommendation.color, borderColor: recommendation.border }}
                  >
                    <ThumbsUp className="!size-2.5" />
                    {recommendation.label}
                  </Badge>
                )}
              </div>
              <p className="text-[13px] text-muted-foreground leading-relaxed">{response.aiSummary || "—"}</p>
            </div>
          </div>
        </div>
      )}

      {!aiScoringEnabled && response.aiScore == null && !response.aiSummary && (
        <div className="rounded-xl p-3 bg-muted/40 border border-border">
          <p className="text-xs text-muted-foreground">{t(`${rp}.ai_scoring_disabled_note`)}</p>
        </div>
      )}
    </div>
  );

  const detailsContent = response && (
    <div className="flex flex-col gap-3.5">
      {hasBreakdown && (
        <div className="rounded-2xl border border-border p-3.5">
          <div className="divide-y divide-border/50">
            {response.testResults!.breakdown!.map((b) => (
              <div key={b.area} className="flex items-center gap-3 py-1.5 first:pt-0 last:pb-0">
                <p className="flex-1 text-[12.5px] font-semibold text-foreground/80">{b.label}</p>
                <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.max(0, Math.min(100, b.score))}%`, background: scoreColor(b.score) }}
                  />
                </div>
                <span className="text-[12px] font-extrabold w-8 text-right" style={{ color: scoreColor(b.score) }}>{b.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasGrowth && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {(response.aiReport?.strengths?.length ?? 0) > 0 && (
            <div className="rounded-2xl border border-border p-3.5">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp className="size-3.5 text-emerald-600" />
                <p className="text-[11px] font-bold text-foreground/70">{t(`${rp}.strengths_label`)}</p>
              </div>
              <ul className="flex flex-col gap-1.5">
                {response.aiReport!.strengths!.map((s, i) => (
                  <li key={i} className="text-[12.5px] text-foreground/70 leading-snug pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-emerald-500">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {(response.aiReport?.areasForImprovement?.length ?? 0) > 0 && (
            <div className="rounded-2xl border border-border p-3.5">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingDown className="size-3.5 text-amber-600" />
                <p className="text-[11px] font-bold text-foreground/70">{t(`${rp}.areas_for_improvement_label`)}</p>
              </div>
              <ul className="flex flex-col gap-1.5">
                {response.aiReport!.areasForImprovement!.map((s, i) => (
                  <li key={i} className="text-[12.5px] text-foreground/70 leading-snug pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-amber-500">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {hasAnswers && (
        <div className="rounded-2xl border border-border p-3.5">
          <div className="divide-y divide-border/50">
            {questions.map((q, i) => {
              const a = answerFor(i);
              return (
                <div key={i} className="py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-extrabold text-primary">{String(i + 1).padStart(2, "0")}</span>
                    <Badge variant="secondary" className="bg-violet-50 text-violet-700 text-[10px] h-[18px]">
                      {TYPE_LABEL[q.type]}
                    </Badge>
                    {a?.score != null && (
                      <Badge
                        variant="outline"
                        className="ml-auto text-[10px] h-[18px] gap-1"
                        style={{ background: scoreBg(a.score), borderColor: `${scoreColor(a.score)}40`, color: scoreColor(a.score) }}
                      >
                        <Star className="!size-2.5" fill="currentColor" />
                        {a.score}%
                      </Badge>
                    )}
                  </div>
                  <p className="text-[13px] font-semibold text-foreground mb-1.5">{q.question}</p>
                  <p className="text-[13px] text-foreground/75 bg-muted/40 rounded-lg px-2.5 py-1.5">
                    {formatAnswer(q.type, a?.answer)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const transcriptContent = response && (
    <div className="rounded-2xl border border-border p-3.5">
      <div className="flex flex-col gap-2.5">
        {response.interviewTranscript!.map((entry, i) => (
          <div key={i} className="text-[13px] leading-relaxed">
            <span className={`font-bold ${entry.role === "agent" ? "text-primary" : "text-foreground/80"}`}>
              {entry.role === "agent" ? t(`${rp}.transcript_agent`) : t(`${rp}.transcript_candidate`)}:
            </span>{" "}
            <span className="text-foreground/70">{entry.message}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const panelContent: Record<string, React.ReactNode> = {
    summary: summaryContent,
    details: detailsContent,
    transcript: transcriptContent,
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="p-0 gap-0 overflow-hidden rounded-2xl sm:max-w-xl max-h-[88vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 pl-6 pr-10 pt-6 pb-4 bg-gradient-to-br from-primary/5 to-transparent shrink-0">
          <div className="flex items-center justify-center size-10 rounded-xl shrink-0 bg-primary/10 border border-primary/20">
            <ClipboardList className="size-[19px] text-primary" />
          </div>
          <div className="min-w-0">
            <DialogTitle className="text-[15px] font-extrabold text-foreground">
              {t(`${sp}.dialog_title`, { name: participantName })}
            </DialogTitle>
            <DialogDescription className="text-xs mt-0.5 truncate">
              {data?.campaign?.title ?? "—"}{completedDate ? ` · ${completedDate}` : ""}
            </DialogDescription>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-background px-6 py-4">
          {loading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-[60px] rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              {error}
            </div>
          ) : !response ? (
            <div className="text-center py-10">
              <ClipboardList className="size-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">{t(`${rp}.empty_title`)}</p>
            </div>
          ) : panels.length > 1 ? (
            <Tabs defaultValue={panels[0].key}>
              <TabsList className="w-full mb-3.5">
                {panels.map((p) => (
                  <TabsTrigger key={p.key} value={p.key} className="text-[12.5px] font-semibold">
                    {p.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {panels.map((p) => (
                <TabsContent key={p.key} value={p.key}>
                  {panelContent[p.key]}
                </TabsContent>
              ))}
            </Tabs>
          ) : panels.length === 1 ? (
            panelContent[panels[0].key]
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
});
ParticipantResultsDialog.displayName = "ParticipantResultsDialog";

export default ParticipantResultsDialog;
