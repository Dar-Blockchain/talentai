import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Zap, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/modules/shared/ui/shadcn/card";
import { RootState } from "@/store/store";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

const MONTHLY_TEST_QUOTA = 5;

interface Props {
  onOpen: () => void;
}

const QuickActionCard: React.FC<Props> = ({ onOpen }) => {
  const { t } = useTranslation("dashboard");
  const s = (k: string, opts?: any) => t(`candidate.skills.${k}`, opts) as string;
  const { showToast } = useToast();

  const profile   = useSelector((state: RootState) => state.user.connectedUser.profile);
  const quota     = profile?.quota ?? 0;
  const remaining = Math.max(0, MONTHLY_TEST_QUOTA - quota);
  const locked    = remaining === 0;

  const handleClick = () => {
    if (locked) {
      showToast({ message: s("upgrade_toast"), severity: "info" });
      return;
    }
    onOpen();
  };

  return (
    <Card
      onClick={handleClick}
      className="cursor-pointer group hover:shadow-md hover:-translate-y-px transition-all duration-200 py-0 gap-0 overflow-hidden"
    >
      <div className={cn(
        "h-0.5",
        locked ? "bg-amber-400" : "bg-gradient-to-r from-primary via-primary-dark to-secondary-dark",
      )} />
      <CardContent className="px-5 py-4 flex items-center gap-4">
        <div className={cn(
          "size-11 rounded-xl border flex items-center justify-center shrink-0 transition-colors",
          locked
            ? "bg-amber-50 border-amber-200"
            : "bg-primary-dark/10 border-primary-dark/20 group-hover:bg-primary-dark/15",
        )}>
          {locked
            ? <Sparkles className="size-5 text-amber-600" />
            : <Zap className="size-5 text-primary-dark" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[0.9rem] font-extrabold text-gray-900">Start a Skill Interview</p>
          <p className={cn("text-[0.72rem] mt-0.5", locked ? "text-amber-600 font-semibold" : "text-gray-400")}>
            {locked ? s("quota_remaining_zero") : s("quota_remaining", { remaining })}
          </p>
        </div>
        <ArrowRight className="size-4 text-gray-300 group-hover:text-primary-dark group-hover:translate-x-0.5 transition-all shrink-0" />
      </CardContent>
    </Card>
  );
};

export default QuickActionCard;
