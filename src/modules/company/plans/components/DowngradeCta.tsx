import React from "react";
import { useTranslation } from "react-i18next";
import { ArrowDown } from "lucide-react";
import { PlanLimit } from "@/store/slices/planLimitsSlice";
import { Button } from "@/modules/shared/ui/shadcn/button";

interface Props {
  plan: PlanLimit;
  currentSubId: string;
  currentAutoRenew: boolean;
  checkingOut: boolean;
  onDowngrade: (plan: PlanLimit, subId: string) => void;
}

const DowngradeCta: React.FC<Props> = ({ plan, currentSubId, currentAutoRenew, checkingOut, onDowngrade }) => {
  const { t } = useTranslation("dashboard");

  if (!currentAutoRenew) {
    return (
      <div className="flex items-start gap-2 rounded-[10px] border border-amber-200 bg-amber-50 px-3 py-2.5">
        <ArrowDown size={16} className="mt-0.5 flex-shrink-0 text-amber-600" />
        <div>
          <p className="text-[0.75rem] font-bold text-amber-800">
            {t("pages.subscription.card.downgrade_scheduled", "Downgrade scheduled")}
          </p>
          <p className="text-[0.68rem] leading-relaxed text-amber-700">
            {t("pages.subscription.card.downgrade_detail", "This plan activates when your current plan expires.")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full border-amber-600 text-[0.78rem] text-amber-600 hover:border-amber-700 hover:bg-amber-50 hover:text-amber-700"
      disabled={checkingOut}
      onClick={() => onDowngrade(plan, currentSubId)}
    >
      {t("pages.subscription.card.downgrade_to", "Downgrade to this plan")}
    </Button>
  );
};

export default DowngradeCta;
