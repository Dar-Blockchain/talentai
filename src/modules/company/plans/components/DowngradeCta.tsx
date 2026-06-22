import React from "react";
import { useTranslation } from "react-i18next";
import { ArrowDown } from "lucide-react";
import { PlanLimit } from "@/store/slices/planLimitsSlice";
import AppButton from "@/components/ui/AppButton";

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
    <AppButton
      label={t("pages.subscription.card.downgrade_to", "Downgrade to this plan")}
      variant="outlined" fullWidth disabled={checkingOut}
      startIcon={<ArrowDown size={16} />}
      onClick={() => onDowngrade(plan, currentSubId)}
      sx={{
        borderColor: "#D97706", color: "#D97706",
        "&:hover": { bgcolor: "#FFFBEB", borderColor: "#B45309", color: "#B45309" },
        fontWeight: 700, borderRadius: "10px", py: 1.1,
        fontSize: "0.85rem", textTransform: "none",
      }}
    />
  );
};

export default DowngradeCta;
