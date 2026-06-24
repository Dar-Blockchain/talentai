import React from "react";
import { useTranslation } from "react-i18next";
import { Code2, Users } from "lucide-react";
import dayjs from "@/lib/dayjs";
import { Progress } from "@/modules/shared/ui/shadcn/progress";
import { Badge } from "@/modules/shared/ui/shadcn/badge";
import { cn } from "@/lib/utils";

interface SkillCardProps {
  type: "technical" | "soft";
  skill: any;
  last: boolean;
}

const LEVEL_KEYS: Record<number, string> = {
  1: "entry", 2: "junior", 3: "mid", 4: "senior", 5: "expert",
};

const LEVEL_CLASSES: Record<string, string> = {
  entry:  "bg-gray-100 text-gray-500 border-gray-200",
  junior: "bg-warning-light text-warning border-warning-border",
  mid:    "bg-info-light text-info border-info-border",
  senior: "bg-secondary-light text-secondary-dark border-secondary-border",
  expert: "bg-primary-light text-primary-dark border-primary-border",
  new:    "bg-gray-50 text-gray-400 border-gray-200",
};

const SCORE_TEXT_CLASS: Record<string, string> = {
  high:   "text-primary-dark",
  mid:    "text-teal-600",
  low:    "text-warning",
  crit:   "text-danger",
};

const SCORE_BAR_CLASS: Record<string, string> = {
  high:   "[&>[data-slot=progress-indicator]]:bg-primary-dark",
  mid:    "[&>[data-slot=progress-indicator]]:bg-teal-600",
  low:    "[&>[data-slot=progress-indicator]]:bg-warning",
  crit:   "[&>[data-slot=progress-indicator]]:bg-danger",
  empty:  "[&>[data-slot=progress-indicator]]:bg-gray-200",
};

function scoreTier(s: number) {
  return s >= 80 ? "high" : s >= 60 ? "mid" : s >= 40 ? "low" : s > 0 ? "crit" : "empty";
}

const SkillCard: React.FC<SkillCardProps> = ({ skill, type }) => {
  const { t } = useTranslation("dashboard");
  const s = (k: string, opts?: any) => t(`candidate.skills.${k}`, opts) as string;

  const score    = skill.testScore ?? 0;
  const levelKey = LEVEL_KEYS[skill.levelConfirmed] ?? "new";
  const timeAgo  = skill?.updatedAt ? dayjs(skill.updatedAt).fromNow() : null;
  const tier     = scoreTier(score);

  const isTech = type === "technical";
  const Icon   = isTech ? Code2 : Users;

  return (
    <div
      className={cn(
        "bg-card border rounded-lg p-3 flex flex-col gap-2 transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-md",
        isTech ? "hover:border-info" : "hover:border-warning",
      )}
    >
      {/* Top row: icon · name · level badge */}
      <div className="flex items-start gap-2">
        <div className={cn(
          "size-8 rounded-lg border flex items-center justify-center shrink-0",
          isTech
            ? "bg-info-light border-info-border text-info"
            : "bg-warning-light border-warning-border text-warning",
        )}>
          <Icon className="size-[15px]" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[0.85rem] font-bold text-gray-900 truncate leading-tight">
            {skill.name}
          </p>
          {type === "soft" && skill.category && (
            <p className="text-[0.62rem] text-muted-foreground mt-0.5">{skill.category}</p>
          )}
        </div>

        <Badge
          variant="outline"
          className={cn("text-[0.6rem] font-bold h-5 px-1.5 shrink-0", LEVEL_CLASSES[levelKey])}
        >
          {s(`levels.${levelKey}`)}
        </Badge>
      </div>

      {/* Score bar */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-[0.62rem] text-muted-foreground font-medium">
            {score > 0 ? s("score") : s("not_tested")}
          </span>
          {score > 0 && (
            <span className={cn("text-[0.7rem] font-black", SCORE_TEXT_CLASS[tier])}>
              {score}%
            </span>
          )}
        </div>
        <Progress
          value={Math.min(score, 100)}
          className={cn("h-1 bg-gray-100", SCORE_BAR_CLASS[tier])}
        />
      </div>

      {/* Timestamp */}
      <p className="text-[0.58rem] text-gray-300 leading-none">
        {timeAgo ?? s("just_added")}
      </p>
    </div>
  );
};

export default SkillCard;
