import React, { useCallback, useState } from "react";
import { Clock, ArrowRight, Copy as ContentCopyOutlined, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { fmtDate } from "@/utils/functions";
import { Campaign } from "@/modules/company/campaigns/types/campaign";
import { Button } from "@/modules/shared/ui/shadcn/button";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/modules/shared/ui/shadcn/tooltip";
import { buildCampaignSessionUrl } from "@/lib/campaignSession";
import { useToast } from "@/hooks/useToast";
import type { CampaignCardData } from "./useCampaignCard";

interface Props {
  campaign: Campaign;
  data: CampaignCardData;
}

const CardFooterCompany: React.FC<Props> = ({ campaign, data }) => {
  const { t } = useTranslation("dashboard");
  const p = "pages.campaigns";
  const dp = "pages.campaigns.detail";
  const { showToast } = useToast();
  const { remaining, isUrgent, isToday } = data;
  const [linkCopied, setLinkCopied] = useState(false);
  const isPublicLink = campaign.accessMethod === "LINK" && !!campaign.linkToken;

  const handleCopyLink = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!campaign.linkToken) return;
    const url = `${window.location.origin}${buildCampaignSessionUrl(campaign._id, campaign.linkToken)}`;
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      showToast({ message: t(`${dp}.link_copied`), severity: "success" });
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      showToast({ message: t(`${dp}.link_copy_failed`), severity: "error" });
    }
  }, [campaign._id, campaign.linkToken, showToast, t, dp]);

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
    if (remaining !== null && remaining <= 3) {
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

  return (
    <div className="flex items-center justify-between px-[18px] py-[11px] border-t border-border/60 bg-muted">
      <div className="flex items-center gap-1.5 text-[12.5px]">
        <Clock
          className="size-[14px] shrink-0 text-muted-foreground"
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

      <div className="flex items-center gap-1.5 shrink-0">
        {isPublicLink && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={handleCopyLink}
                  className={linkCopied
                    ? "border-gray-200 bg-gray-100 text-gray-700"
                    : "border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-700"}
                >
                  {linkCopied ? <Check className="size-3.5" /> : <ContentCopyOutlined className="size-3.5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {linkCopied ? t(`${dp}.link_copied`) : t(`${dp}.copy_link_button`)}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2.5 gap-1 text-xs font-semibold text-foreground/60 hover:text-foreground rounded-lg"
        >
          {t(`${p}.card.view`)}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    </div>
  );
};

export default CardFooterCompany;
