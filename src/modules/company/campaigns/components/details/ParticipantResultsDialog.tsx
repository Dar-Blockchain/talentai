"use client";

import React, { memo, useMemo } from "react";
import { ClipboardList, Star } from "lucide-react";
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from "@/modules/shared/ui/shadcn/dialog";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Badge } from "@/modules/shared/ui/shadcn/badge";
import { useParticipantResultsQuery } from "../../queries";
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

const formatAnswer = (type: QuestionType, answer: string | number | string[] | undefined) => {
  if (answer === undefined || answer === "" || (Array.isArray(answer) && answer.length === 0)) return "—";
  if (type === "MULTIPLE_CHOICE" && Array.isArray(answer)) return answer.join(", ");
  if (type === "RATING") return `${answer} / 5`;
  return String(answer);
};

interface Props {
  open: boolean;
  campaignId: string;
  participantId: string | null;
  participantName: string;
  onClose: () => void;
}

const ParticipantResultsDialog = memo<Props>(({ open, campaignId, participantId, participantName, onClose }) => {
  const { t } = useTranslation("dashboard");
  const sp = "pages.campaigns.detail.sessions";
  const rp = `${sp}.results_dialog`;

  const { data, isLoading: loading, error: queryError } = useParticipantResultsQuery(campaignId, open ? participantId : null);
  const error = queryError ? t(`${sp}.load_failed`) : null;

  const response  = data?.response ?? null;
  const module    = data?.campaign?.module;
  const questions = useMemo(
    () => (module?.type === "QUESTIONNAIRE" ? module.config?.questions ?? [] : []),
    [module],
  );
  const aiScoringEnabled = module?.type !== "QUESTIONNAIRE" || module.config?.aiScoringEnabled !== false;

  const answerFor = (index: number) =>
    response?.answers?.find((a) => a.questionId === String(index));

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
              {data?.campaign?.title ?? "—"}
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
          ) : (
            <div className="flex flex-col gap-3">
              {(response.aiScore != null || response.aiSummary) && (
                <div
                  className="rounded-xl p-3.5 flex items-start gap-3 border"
                  style={{
                    background: response.aiScore != null ? scoreBg(response.aiScore) : "#F8FAFC",
                    borderColor: response.aiScore != null ? `${scoreColor(response.aiScore)}30` : "#E5E7EB",
                  }}
                >
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
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground/80 mb-0.5">{t(`${rp}.ai_summary_label`)}</p>
                    <p className="text-[13px] text-muted-foreground leading-relaxed">{response.aiSummary || "—"}</p>
                  </div>
                </div>
              )}

              {!aiScoringEnabled && response.aiScore == null && !response.aiSummary && (
                <div className="rounded-xl p-3 bg-muted/40 border border-border">
                  <p className="text-xs text-muted-foreground">{t(`${rp}.ai_scoring_disabled_note`)}</p>
                </div>
              )}

              {questions.length > 0 && (
                <div className="flex flex-col gap-2.5">
                  {questions.map((q, i) => {
                    const a = answerFor(i);
                    return (
                      <div key={i} className="rounded-xl border border-border bg-muted/20 p-3.5">
                        <div className="flex items-center gap-2 mb-2">
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
                        <p className="text-[13px] font-semibold text-foreground mb-2">{q.question}</p>
                        <p className="text-[13px] text-foreground/80 bg-background border border-border rounded-md px-2.5 py-1.5">
                          {formatAnswer(q.type, a?.answer)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});
ParticipantResultsDialog.displayName = "ParticipantResultsDialog";

export default ParticipantResultsDialog;
