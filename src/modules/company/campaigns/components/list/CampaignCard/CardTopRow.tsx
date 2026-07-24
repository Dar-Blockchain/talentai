import React, { useCallback, useState } from "react";
import { Trash2, Link2, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Campaign, CampaignStatus } from "@/modules/company/campaigns/types/campaign";
import {
  DropdownMenuItem, DropdownMenuSeparator,
} from "@/modules/shared/ui/shadcn/dropdown-menu";
import { MoreOptionsMenu } from "@/modules/shared/ui/MoreOptionsMenu";
import { buildCampaignSessionUrl } from "@/lib/campaignSession";
import { useToast } from "@/hooks/useToast";
import { STATUS_ICONS, scoreColor } from "./constants";
import type { CampaignCardData } from "./useCampaignCard";

interface Props {
  campaign: Campaign;
  data: CampaignCardData;
  canDelete?: boolean;
  canPublish?: boolean;
  onDelete?: (id: string, title: string) => void;
  onStatusChange?: (id: string, title: string, currentStatus: Campaign["status"], targetStatus: CampaignStatus) => void;
}

const CardTopRow: React.FC<Props> = ({ campaign, data, canDelete = true, canPublish = true, onDelete, onStatusChange }) => {
  const { t } = useTranslation("dashboard");
  const p = "pages.campaigns";
  const dp = "pages.campaigns.detail";
  const { showToast } = useToast();
  const [linkCopied, setLinkCopied] = useState(false);
  const { isEmployee, statusBadge, statusLabel, participantStatus, participantBadge, transitions, showMenu, moduleConf, moduleLabel } = data;
  const ModuleIcon = moduleConf?.icon;
  const isPublicLink = campaign.accessMethod === "LINK" && !!campaign.linkToken;

  const handleCopyLink = useCallback(async (e: React.MouseEvent) => {
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

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1.5 min-w-0">
        {isEmployee ? (
          <span className={`inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-full text-[11px] font-bold tracking-[0.01em] shrink-0 ${participantBadge.badge}`}>
            <span className={`size-1.5 rounded-full shrink-0 ${participantBadge.dot}`} />
            {t(`pages.campaigns.detail.participants.participant_status.${participantStatus}`)}
          </span>
        ) : (
          <span className={`inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-full text-[11px] font-bold tracking-[0.01em] shrink-0 ${statusBadge.badge}`}>
            <span className={`size-1.5 rounded-full shrink-0 ${statusBadge.dot}`} />
            {statusLabel}
          </span>
        )}

        {moduleConf && ModuleIcon && moduleLabel && (
          <span
            className="inline-flex items-center gap-[5px] h-[22px] px-2 rounded-[7px] text-[11px] font-bold truncate"
            style={{ backgroundColor: `${moduleConf.color}14`, color: moduleConf.color }}
          >
            <ModuleIcon className="size-3 shrink-0" />
            <span className="truncate">{moduleLabel}</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {isEmployee && participantStatus === "COMPLETED" && campaign.score != null && (
          <span
            className="flex flex-col items-center px-2 py-0.5 rounded-lg shrink-0 border"
            style={{ backgroundColor: `${scoreColor(campaign.score)}15`, borderColor: `${scoreColor(campaign.score)}30` }}
          >
            <span className="text-[13px] font-extrabold leading-none" style={{ color: scoreColor(campaign.score) }}>{campaign.score}</span>
            <span className="text-[8px] font-semibold opacity-80" style={{ color: scoreColor(campaign.score) }}>/100</span>
          </span>
        )}

        {(showMenu || (isPublicLink && !isEmployee)) && (
          <MoreOptionsMenu
            size="xs"
            className="text-muted-foreground/50 hover:text-foreground hover:bg-muted"
            contentClassName="w-48 p-1 shadow-lg"
          >
              {isPublicLink && (
                <DropdownMenuItem
                  onClick={handleCopyLink}
                  className="gap-2 rounded-md px-2.5 py-2 cursor-pointer text-[13px] text-foreground focus:bg-muted focus:text-foreground"
                >
                  {linkCopied
                    ? <Check className="size-3.5 shrink-0 text-emerald-500" />
                    : <Link2 className="size-3.5 shrink-0 text-muted-foreground" />}
                  <span className="font-medium">
                    {linkCopied ? t(`${dp}.link_copied`) : t(`${dp}.copy_link_button`)}
                  </span>
                </DropdownMenuItem>
              )}

              {isPublicLink && (canPublish && transitions.length > 0 || canDelete) && (
                <DropdownMenuSeparator className="my-1" />
              )}

              {canPublish && transitions.map((s) => {
                const Icon = STATUS_ICONS[s];
                return (
                  <DropdownMenuItem
                    key={s}
                    onClick={(e) => { e.stopPropagation(); onStatusChange?.(campaign._id, campaign.title, campaign.status, s); }}
                    className="gap-2 rounded-md px-2.5 py-2 cursor-pointer text-[13px] text-foreground focus:bg-muted focus:text-foreground"
                  >
                    {Icon && <Icon className="size-3.5 shrink-0 text-muted-foreground" />}
                    <span className="font-medium">{t(`${p}.card.menu_transition.${s}`)}</span>
                  </DropdownMenuItem>
                );
              })}

              {canPublish && canDelete && transitions.length > 0 && (
                <DropdownMenuSeparator className="my-1" />
              )}

              {canDelete && (
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onDelete?.(campaign._id, campaign.title); }}
                  className="gap-2 rounded-md px-2.5 py-2 cursor-pointer text-[13px] text-foreground focus:bg-muted focus:text-foreground"
                >
                  <Trash2 className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="font-medium">{t(`${p}.card.menu_delete`)}</span>
                </DropdownMenuItem>
              )}
          </MoreOptionsMenu>
        )}
      </div>
    </div>
  );
};

export default CardTopRow;
