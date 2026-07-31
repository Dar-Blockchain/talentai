import React from "react";
import { ExternalLink } from "lucide-react";
import dayjs from "@/lib/dayjs";
import { cn } from "@/lib/utils";
import { Button } from "@/modules/shared/ui/shadcn/button";
import type { SkillInterviewAssessment } from "../types/interview.types";

const getScore = (a: SkillInterviewAssessment): number =>
  a.interviewData?.finalReport?.scores?.overall ??
  (a.interviewData?.finalReport?.coverage?.overall as number | undefined) ??
  0;

const getLevelKey = (s: number) =>
  s >= 80 ? "expert" : s >= 60 ? "senior" : s >= 40 ? "mid" : s >= 20 ? "junior" : "entry";

const LEVEL_CLASSES: Record<string, { badge: string }> = {
  expert: { badge: "bg-green-50 border-green-200 text-green-700" },
  senior: { badge: "bg-info/10 border-info/20 text-info" },
  mid:    { badge: "bg-warning/10 border-warning/20 text-warning" },
  junior: { badge: "bg-orange-50 border-orange-200 text-orange-600" },
  entry:  { badge: "bg-gray-100 border-gray-200 text-gray-500" },
};

const SCORE_COLOR: Record<string, string> = {
  high:   "bg-green-500",
  good:   "bg-primary",
  mid:    "bg-warning",
  low:    "bg-danger",
  none:   "bg-gray-200",
};

function scoreColorKey(s: number): string {
  if (s >= 80) return "high";
  if (s >= 60) return "good";
  if (s >= 40) return "mid";
  if (s >  0)  return "low";
  return "none";
}

interface Props {
  assessment: SkillInterviewAssessment;
  accentBg:     string;
  accentBorder: string;
  accentText:   string;
  icon: React.ElementType;
  s: (k: string) => string;
}

const SkillInterviewCard: React.FC<Props> = ({ assessment, accentBg, accentBorder, accentText, icon: Icon, s }) => {
  const score    = getScore(assessment);
  const levelKey = getLevelKey(score);
  const date     = assessment.updatedAt || assessment.createdAt;
  const timeAgo  = date ? dayjs(date).fromNow() : "";

  return (
    <div className={cn(
      "flex flex-col gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4",
      "transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md",
    )}>
      <div className="flex items-start gap-3">
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border", accentBg, accentBorder)}>
          <Icon className={cn("h-4 w-4", accentText)} />
        </div>
        <p className="flex-1 truncate text-[0.85rem] font-bold text-[#0D1B2A] leading-tight pt-1">
          {assessment.skill || s("skill_assessment")}
        </p>
        <span className={cn(
          "shrink-0 rounded-full border px-2 py-0.5 text-[0.6rem] font-bold",
          LEVEL_CLASSES[levelKey]?.badge,
        )}>
          {s(`levels.${levelKey}`)}
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[0.62rem] font-medium text-[#94A3B8]">
            {score > 0 ? s("score") : s("not_tested")}
          </span>
          {score > 0 && (
            <span className={cn("text-[0.72rem] font-extrabold", {
              "text-green-600": score >= 80,
              "text-primary":   score >= 60 && score < 80,
              "text-warning":   score >= 40 && score < 60,
              "text-danger":    score < 40,
            })}>
              {score}%
            </span>
          )}
        </div>
        <div className="h-[5px] w-full overflow-hidden rounded-full bg-[#F1F5F9]">
          <div
            className={cn("h-full rounded-full transition-all", SCORE_COLOR[scoreColorKey(score)])}
            style={{ width: `${Math.min(score, 100)}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[0.6rem] text-[#CBD5E1]">{timeAgo || s("just_added")}</span>
        {score > 0 && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 border-green-200 bg-green-50 px-3 text-[0.68rem] font-bold text-green-700 hover:bg-green-100"
          >
            {s("report")}
            <ExternalLink className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default SkillInterviewCard;
