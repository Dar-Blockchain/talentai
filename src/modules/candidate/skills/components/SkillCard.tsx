import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Code2, MessageCircle, Zap, RotateCcw, FileText } from "lucide-react";
import dayjs from "@/lib/dayjs";
import { Progress } from "@/modules/shared/ui/shadcn/progress";
import { Badge } from "@/modules/shared/ui/shadcn/badge";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { cn } from "@/lib/utils";
import { scoreToLevelKey, wasSkillTested } from "../utils/level";
import SkillReportModal from "@/modules/candidate/interviews/components/SkillReportModal";

interface SkillCardProps {
  type: "technical" | "soft";
  skill: any;
  last: boolean;
  onTest?: () => void;
  /** Id of the skill's most recent completed assessment, if any — shows a "Report" CTA. */
  reportId?: string;
}

// Grayscale progression (lightest -> darkest = entry -> expert) so level is
// still legible at a glance without relying on color -- except "expert",
// which gets the brand mint accent so a top-tier skill stands out (same
// treatment as the top score tier in SkillInterviewReport).
const LEVEL_CLASSES: Record<string, string> = {
  entry:  "bg-gray-50  text-gray-400     border-gray-200",
  junior: "bg-gray-100 text-gray-500     border-gray-200",
  mid:    "bg-gray-100 text-gray-600     border-gray-300",
  senior: "bg-gray-200 text-gray-700     border-gray-300",
  expert: "bg-primary-dark text-white    border-primary-dark",
  new:    "bg-gray-50  text-gray-400     border-gray-200",
};

// Same idea for score: darker = higher, except the top tier which uses the
// brand accent instead of a red/amber/green tier system.
const SCORE_TEXT_CLASS: Record<string, string> = {
  high:   "text-primary-dark",
  mid:    "text-gray-700",
  low:    "text-gray-600",
  crit:   "text-gray-500",
};

const SCORE_BAR_CLASS: Record<string, string> = {
  high:   "[&>[data-slot=progress-indicator]]:bg-primary",
  mid:    "[&>[data-slot=progress-indicator]]:bg-gray-500",
  low:    "[&>[data-slot=progress-indicator]]:bg-gray-400",
  crit:   "[&>[data-slot=progress-indicator]]:bg-gray-300",
};

// A genuine 0% is a real, meaningful score now that "tested" is tracked
// separately (via numberTestPassed) -- it always resolves to a real tier,
// "empty" is reserved for the untested-bar rendering below, not for scores.
function scoreTier(s: number) {
  return s >= 80 ? "high" : s >= 60 ? "mid" : s >= 40 ? "low" : "crit";
}

const SkillCard: React.FC<SkillCardProps> = ({ skill, type, onTest, reportId }) => {
  const { t } = useTranslation("dashboard");
  const s = (k: string, opts?: any) => t(`candidate.skills.${k}`, opts) as string;
  const [reportOpen, setReportOpen] = useState(false);

  // "tested" and the derived level both come from the shared helper so the
  // level filter (TechnicalSkills/SoftSkills) and this badge never disagree.
  const wasTested = wasSkillTested(skill);
  const score     = skill.testScore ?? 0;
  const levelKey  = wasTested ? scoreToLevelKey(score) : "new";
  const timeAgo   = skill?.updatedAt ? dayjs(skill.updatedAt).fromNow() : null;
  const tier      = scoreTier(score);

  const isTech = type === "technical";
  const Icon   = isTech ? Code2 : MessageCircle;

  return (
    <div
      className={cn(
        "bg-card border border-gray-300 shadow-sm rounded-lg p-2.5 flex flex-col gap-1.5 transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-md hover:border-gray-400",
      )}
    >
      {/* Top row: icon · name · level badge */}
      <div className="flex items-center gap-1.5">
        <div className="size-6 rounded-md border border-gray-200 bg-gray-100 flex items-center justify-center shrink-0">
          <Icon className="size-3 text-gray-500" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[0.78rem] font-bold text-gray-900 truncate leading-tight">
            {skill.name}
          </p>
          {skill.category && (
            <p className="text-[0.58rem] text-muted-foreground truncate leading-tight">{skill.category}</p>
          )}
        </div>

        <Badge
          variant="outline"
          className={cn("text-[0.56rem] font-bold h-4 px-1.5 shrink-0", LEVEL_CLASSES[levelKey])}
        >
          {s(`levels.${levelKey}`)}
        </Badge>
      </div>

      {/* Score bar — only meaningful once the skill has an actual score */}
      {wasTested && (
        <div className="flex items-center gap-2">
          <Progress
            value={Math.min(score, 100)}
            className={cn("h-1.5 flex-1 bg-gray-100", SCORE_BAR_CLASS[tier])}
          />
          <span className={cn("text-[0.78rem] font-black shrink-0", SCORE_TEXT_CLASS[tier])}>
            {score}%
          </span>
        </div>
      )}

      {/* Timestamp / test / retest CTA — pinned to the bottom so the button
          lines up across cards even when the score row above is skipped
          (untested skills) and the grid stretches this card taller. */}
      <div className="mt-auto">
        {wasTested ? (
          <div className="flex items-center justify-between gap-2">
            <p className="text-[0.66rem] font-medium text-gray-500 leading-none truncate">
              {timeAgo ? `${s("table_tested")} ${timeAgo}` : s("just_added")}
            </p>
            <div className="flex items-center gap-1 shrink-0">
              {reportId && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setReportOpen(true)}
                  className="group h-6 gap-1 px-2 text-[0.6rem] font-bold rounded-md shrink-0 cursor-pointer border border-gray-300 text-gray-700 bg-transparent hover:bg-gray-800 hover:text-white hover:border-gray-800"
                >
                  <FileText className="size-2.5 text-gray-500 group-hover:text-white" />
                  {s("report")}
                </Button>
              )}
              {onTest && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onTest}
                  className="group h-6 gap-1 px-2 text-[0.6rem] font-bold rounded-md shrink-0 cursor-pointer border border-gray-300 text-gray-700 bg-transparent hover:bg-gray-800 hover:text-white hover:border-gray-800"
                >
                  <RotateCcw className="size-2.5 text-gray-500 group-hover:text-white" />
                  {s("retest")}
                </Button>
              )}
            </div>
          </div>
        ) : !onTest ? (
          <p className="text-[0.66rem] font-medium text-gray-500 leading-none">
            {timeAgo ?? s("just_added")}
          </p>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <p className="text-[0.66rem] font-medium text-gray-500 leading-none truncate">
              {timeAgo ?? s("just_added")}
            </p>
            <Button
              size="sm"
              variant="ghost"
              onClick={onTest}
              className="group h-6 gap-1 px-2.5 text-[0.6rem] font-bold rounded-md shrink-0 cursor-pointer border border-gray-300 text-gray-700 bg-transparent hover:bg-gray-800 hover:text-white hover:border-gray-800"
            >
              <Zap className="size-2.5 text-gray-500 group-hover:text-white" />
              {s("test")}
            </Button>
          </div>
        )}
      </div>

      {reportId && (
        <SkillReportModal interviewId={reportOpen ? reportId : null} onClose={() => setReportOpen(false)} />
      )}
    </div>
  );
};

export default SkillCard;
