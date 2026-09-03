import React from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { Code2, MessageCircle, Zap, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildInterviewUrl } from "@/lib/interviewSession";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/modules/shared/ui/shadcn/dialog";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Progress } from "@/modules/shared/ui/shadcn/progress";
import type { Skill } from "../types/skill.types";

interface Props {
  skill: Skill | null;
  type: "technical" | "soft";
  quotaUsed: number;
  quotaMax: number;
  /** Formatted next-reset date (e.g. "Oct 2, 2026"), computed server-side from
   *  the rolling quota window -- undefined until the profile has loaded. */
  quotaResetLabel?: string | null;
  onClose: () => void;
}

// Direct-from-card confirmation: skips AssessmentModal's manual type/category
// picker entirely since the skill is already known (the card that was
// clicked) -- Confirm goes straight to the interview session.
const ConfirmTestDialog: React.FC<Props> = ({ skill, type, quotaUsed, quotaMax, quotaResetLabel, onClose }) => {
  const router = useRouter();
  const { t } = useTranslation("dashboard");
  const s = (k: string, opts?: any) => t(`candidate.skills.${k}`, opts) as string;

  const Icon = type === "technical" ? Code2 : MessageCircle;
  const remainingAfter = Math.max(0, quotaMax - quotaUsed - 1);
  const isLastTest = remainingAfter === 0;
  const pct = Math.min(100, ((quotaUsed + 1) / quotaMax) * 100);

  const handleConfirm = () => {
    if (!skill) return;
    const params =
      type === "technical"
        ? { type: "skill" as const, skill: skill.name, category: skill.category, skillType: "technical" as const }
        : skill.name === "Communication"
          ? { type: "skill" as const, skill: skill.name, language: skill.category || "English", skillType: "soft" as const }
          : { type: "skill" as const, skill: skill.name, category: skill.category, skillType: "soft" as const };
    onClose();
    router.push(buildInterviewUrl(params));
  };

  return (
    <Dialog open={!!skill} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm gap-0 p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-6 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
              <Icon className="size-[18px] text-gray-500" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base font-bold text-foreground truncate">
                {s("confirm_test_title", { skill: skill?.name ?? "" })}
              </DialogTitle>
              {type === "soft" && skill?.category && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">{skill.category}</p>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-5 flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            {s("confirm_test_body", { skill: skill?.name ?? "" })}
          </p>

          {/* Quota */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3.5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Zap className="size-3.5 text-gray-500 shrink-0" />
                <span className="text-[0.72rem] font-bold text-gray-600 uppercase tracking-wide">
                  {s("monthly_quota")}
                </span>
              </div>
              <span className="text-[0.8rem] font-extrabold text-gray-800">
                {quotaUsed}/{quotaMax}
              </span>
            </div>

            <Progress
              value={pct}
              className={cn(
                "h-1.5 bg-gray-200",
                isLastTest
                  ? "[&>[data-slot=progress-indicator]]:bg-danger"
                  : "[&>[data-slot=progress-indicator]]:bg-gray-700",
              )}
            />

            <p className={cn(
              "text-[0.7rem] font-medium flex items-center gap-1",
              isLastTest ? "text-danger" : "text-muted-foreground",
            )}>
              {isLastTest && <AlertTriangle className="size-3 shrink-0" />}
              {isLastTest
                ? (quotaResetLabel ? s("quota_last_test_reset", { date: quotaResetLabel }) : s("quota_last_test"))
                : s("quota_remaining_after", { count: remainingAfter })}
            </p>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/30">
          <Button variant="ghost" size="sm" onClick={onClose} className="mr-auto cursor-pointer">
            {s("cancel")}
          </Button>
          <Button
            onClick={handleConfirm}
            className="rounded-full bg-gray-800 hover:bg-gray-900 text-white cursor-pointer"
          >
            {s("confirm_start")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmTestDialog;
