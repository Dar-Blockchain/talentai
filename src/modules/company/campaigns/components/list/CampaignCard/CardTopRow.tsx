import React from "react";
import { MoreVertical, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Campaign, CampaignStatus } from "@/modules/company/campaigns/types/campaign";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/modules/shared/ui/shadcn/dropdown-menu";
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
  const { isEmployee, statusBadge, statusLabel, participantStatus, participantBadge, transitions, showMenu } = data;

  return (
    <div className="flex items-center justify-between">
      {isEmployee ? (
        <span className={`inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-full text-[11px] font-bold tracking-wide ${participantBadge.badge}`}>
          <span className={`size-1.5 rounded-full shrink-0 ${participantBadge.dot}`} />
          {t(`pages.campaigns.detail.participants.participant_status.${participantStatus}`)}
        </span>
      ) : (
        <span className={`inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-full text-[11px] font-bold tracking-wide ${statusBadge.badge}`}>
          <span className={`size-1.5 rounded-full shrink-0 ${statusBadge.dot}`} />
          {statusLabel}
        </span>
      )}

      {isEmployee && participantStatus === "COMPLETED" && campaign.score != null && (
        <span
          className="flex flex-col items-center px-2 py-0.5 rounded-lg shrink-0 border"
          style={{ backgroundColor: `${scoreColor(campaign.score)}15`, borderColor: `${scoreColor(campaign.score)}30` }}
        >
          <span className="text-[13px] font-extrabold leading-none" style={{ color: scoreColor(campaign.score) }}>{campaign.score}</span>
          <span className="text-[8px] font-semibold opacity-80" style={{ color: scoreColor(campaign.score) }}>/100</span>
        </span>
      )}

      {showMenu && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="size-7 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-muted transition-colors cursor-pointer outline-none"
            >
              <MoreVertical className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 p-1 shadow-lg">
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
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default CardTopRow;
