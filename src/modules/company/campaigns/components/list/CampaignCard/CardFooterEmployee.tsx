import React, { useCallback } from "react";
import { Clock, Play, ArrowRight, Award, Eye, PauseCircle, StopCircle, AlertCircle } from "lucide-react";
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
  onStart?: (id: string) => void;
  onShowResults?: (id: string) => void;
}

const CardFooterEmployee: React.FC<Props> = ({ campaign, data, onStart, onShowResults }) => {
  const { t } = useTranslation("dashboard");
  const p = "pages.campaigns";
  const { remaining, isUrgent, isToday, participantStatus, isPaused, isClosed, isExpired, canParticipantStart } = data;
  const hasResults = participantStatus === "COMPLETED" && campaign.score != null;

  const handleStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onStart?.(campaign._id);
  }, [onStart, campaign._id]);

  const handleShowResults = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShowResults?.(campaign._id);
  }, [onShowResults, campaign._id]);

  const deadlineNode = (() => {
    if (!campaign.deadline) {
      return <span className="text-muted-foreground">{t(`${p}.card.no_deadline`)}</span>;
    }
    const dateStr = fmtDate(campaign.deadline);
    if (remaining === 0 || isToday) {
      return <span className="font-semibold text-destructive">{t(`${p}.card.expires_today`)}</span>;
    }
    if (remaining === 1) {
      return (
        <span>
          <span className="font-semibold text-destructive">{t(`${p}.card.tomorrow_prefix`)}</span>
          <span className="text-muted-foreground"> · {dateStr}</span>
        </span>
      );
    }
    if (remaining !== null && remaining >= 0 && remaining <= 3) {
      return (
        <span>
          <span className="font-semibold text-destructive">{t(`${p}.card.days_left`, { count: remaining })}</span>
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

  const actionButton = (() => {
    if (isPaused && participantStatus !== "COMPLETED") {
      return (
        <Button variant="warning" size="sm" disabled className="h-7 px-2.5 gap-1 text-xs disabled:opacity-100">
          <PauseCircle className="size-3.5" />
          {t(`${p}.card.employee_paused`)}
        </Button>
      );
    }
    if (isClosed && participantStatus !== "COMPLETED") {
      return (
        <Button variant="outline" size="sm" disabled className="h-7 px-2.5 gap-1 text-xs disabled:opacity-100">
          <StopCircle className="size-3.5" />
          {t(`${p}.card.employee_closed`)}
        </Button>
      );
    }
    if (!canParticipantStart && isExpired && participantStatus !== "COMPLETED") {
      return (
        <Button variant="destructive" size="sm" disabled className="h-7 px-2.5 gap-1 text-xs disabled:opacity-100">
          <AlertCircle className="size-3.5" />
          {t(`${p}.card.employee_expired`)}
        </Button>
      );
    }
    if (participantStatus === "INVITED" && canParticipantStart) {
      return (
        <Button variant="secondary" size="sm" onClick={handleStart} className="h-7 px-2.5 gap-1 text-xs">
          <Play className="size-3.5" />
          {t(`${p}.card.employee_start`)}
        </Button>
      );
    }
    if (participantStatus === "IN_PROGRESS" && canParticipantStart) {
      return (
        <Button variant="warning" size="sm" onClick={handleStart} className="h-7 px-2.5 gap-1 text-xs">
          <ArrowRight className="size-3.5" />
          {t(`${p}.card.employee_continue`)}
        </Button>
      );
    }
    if (hasResults) {
      return (
        <Button size="sm" onClick={handleShowResults} className="h-7 px-2.5 gap-1 text-xs">
          <Award className="size-3.5" />
          {t(`${p}.card.employee_show_results`)}
        </Button>
      );
    }
    return (
      <Button variant="outline" size="sm" className="h-7 px-2.5 gap-1 text-xs">
        <Eye className="size-3.5" />
        {t(`${p}.card.employee_view_details`)}
      </Button>
    );
  })();

  return (
    <div className="flex items-center justify-between gap-2 px-[18px] py-[11px] border-t border-border/60 bg-muted">
      <div className="flex items-center gap-1.5 text-[12.5px] min-w-0">
        <Clock
          className="size-[14px] shrink-0 text-muted-foreground"
          style={isUrgent ? { color: "#EF4444" } : undefined}
        />
        {campaign.deadline ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-default leading-none truncate">{deadlineNode}</span>
              </TooltipTrigger>
              <TooltipContent>{fmtDate(campaign.deadline)}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          deadlineNode
        )}
      </div>

      <div className="shrink-0">{actionButton}</div>
    </div>
  );
};

export default CardFooterEmployee;
