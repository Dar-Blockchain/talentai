import React from "react";
import { Clock, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { fmtDate } from "@/utils/functions";
import { Campaign } from "@/modules/company/campaigns/types/campaign";
import { Button } from "@/modules/shared/ui/shadcn/button";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/modules/shared/ui/shadcn/tooltip";
import type { CampaignCardData } from "./useCampaignCard";

interface Props {
  campaign: Campaign;
  data: CampaignCardData;
}

const CardFooterCompany: React.FC<Props> = ({ campaign, data }) => {
  const { t } = useTranslation("dashboard");
  const p = "pages.campaigns";
  const { remaining, isUrgent, isToday } = data;

  const deadlineNode = (() => {
    if (!campaign.deadline) {
      return <span className="text-muted-foreground/60">{t(`${p}.card.no_deadline`)}</span>;
    }
    const dateStr = fmtDate(campaign.deadline);
    if (remaining === 0 || isToday) {
      return <span className="font-semibold text-destructive">{t(`${p}.card.expires_today`)}</span>;
    }
    if (remaining === 1) {
      return (
        <span>
          <span className="font-semibold text-amber-500">{t(`${p}.card.tomorrow_prefix`)}</span>
          <span className="text-muted-foreground"> · {dateStr}</span>
        </span>
      );
    }
    if (remaining !== null && remaining <= 3) {
      return (
        <span>
          <span className="font-semibold text-amber-500">{t(`${p}.card.days_left`, { count: remaining })}</span>
          <span className="text-muted-foreground"> · {dateStr}</span>
        </span>
      );
    }
    return (
      <span className="text-foreground/55">
        {t(`${p}.card.due_prefix`)}{" "}
        <span className="font-semibold text-foreground/80">{dateStr}</span>
      </span>
    );
  })();

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-border/50 bg-muted/20">
      <div className="flex items-center gap-1.5 text-[12px]">
        <Clock
          className="size-3.5 shrink-0 text-muted-foreground/60"
          style={isUrgent ? { color: "#EF4444" } : undefined}
        />
        {campaign.deadline ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-default leading-none">{deadlineNode}</span>
              </TooltipTrigger>
              <TooltipContent>{fmtDate(campaign.deadline)}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          deadlineNode
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2.5 gap-1 text-xs font-semibold text-foreground/60 hover:text-foreground rounded-lg"
      >
        {t(`${p}.card.view`)}
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </Button>
    </div>
  );
};

export default CardFooterCompany;
