import React, { memo, useCallback, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  ArrowLeft, Trash2, Pencil, Play, Pause, Square, Calendar, TriangleAlert, Megaphone,
} from "lucide-react";
import {
  Tooltip, TooltipContent, TooltipTrigger, TooltipProvider,
} from "@/modules/shared/ui/shadcn/tooltip";
import { Campaign, CampaignStatus } from "@/modules/company/campaigns/types/campaign";
import { STATUS_COLORS, STATUS_TRANSITIONS, CAMPAIGN_TYPES } from "@/modules/shared/constants/campaign";
import { daysLeft } from "@/utils/functions";
import ConfirmStatusChangeDialog from "./ConfirmStatusChangeDialog";
import { useTranslation } from "react-i18next";

// ─── Static constants ─────────────────────────────────────────────────────────

const STATUS_ICONS: Partial<Record<CampaignStatus, React.ElementType>> = {
  ACTIVE: Play,
  PAUSED: Pause,
  CLOSED: Square,
};

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  campaign: Campaign;
  onChangeStatus?: (id: string, status: CampaignStatus) => void;
  onDeleteClick?: () => void;
  onEditClick?: () => void;
  backLabel?: string;
  backUrl?: string;
  actionsNode?: React.ReactNode;
}

const CampaignHeader: React.FC<Props> = memo(({
  campaign, onChangeStatus, onDeleteClick, onEditClick,
  backUrl = "/company/campaigns", backLabel, actionsNode,
}) => {
  const router = useRouter();
  const { t } = useTranslation("dashboard");
  const tp = "pages.campaigns.detail";
  const [pendingStatus, setPendingStatus] = useState<CampaignStatus | null>(null);

  const resolvedBackLabel = backLabel ?? t(`${tp}.back_company`);

  const handleBack = useCallback(() => router.push(backUrl), [router, backUrl]);
  const closePending = useCallback(() => setPendingStatus(null), []);
  const handleStatusConfirm = useCallback(() => {
    if (pendingStatus) onChangeStatus?.(campaign._id, pendingStatus);
    setPendingStatus(null);
  }, [onChangeStatus, campaign._id, pendingStatus]);

  const sc             = useMemo(() => STATUS_COLORS[campaign.status] ?? STATUS_COLORS.DRAFT, [campaign.status]);
  const typeEntry      = useMemo(() => CAMPAIGN_TYPES.find((ct) => ct.value === campaign.type), [campaign.type]);
  const TypeIcon       = typeEntry?.icon;
  const typeColor      = typeEntry?.color ?? "#6B7280";
  const transitions    = useMemo(() => STATUS_TRANSITIONS[campaign.status] ?? [], [campaign.status]);
  const remaining      = useMemo(() => daysLeft(campaign.deadline), [campaign.deadline]);
  const moduleConfigured = campaign.module?.config != null;

  const modLabel = useMemo(() =>
    campaign.module?.type != null ? t(`pages.campaigns.module.${campaign.module.type}`) : campaign.module?.type,
  [campaign.module?.type, t]);

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className="bg-background border border-border rounded-[22px] overflow-hidden shadow-sm"
        style={{ background: `linear-gradient(135deg, ${typeColor}07 0%, transparent 50%)` }}
      >
        <div className="px-5 sm:px-7 pt-5 pb-6">

          {/* Nav row */}
          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground/70 transition-colors"
            >
              <ArrowLeft className="size-[15px]" />
              <span className="text-[0.8rem] font-semibold">{resolvedBackLabel}</span>
            </button>

            {actionsNode ?? (
              <div className="flex items-center gap-2">
                {onEditClick && (
                  campaign.status === "DRAFT" ? (
                    <button
                      type="button"
                      onClick={onEditClick}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] cursor-pointer border border-border bg-muted/40 hover:bg-indigo-50 hover:border-indigo-200 transition-colors [&_svg]:hover:text-indigo-500 [&_span]:hover:text-indigo-500"
                    >
                      <Pencil className="size-3.5 text-slate-500" />
                      <span className="text-[0.775rem] font-semibold text-slate-600">{t(`${tp}.edit`)}</span>
                    </button>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] cursor-not-allowed border border-border bg-muted/40 opacity-45">
                          <Pencil className="size-3.5 text-muted-foreground" />
                          <span className="text-[0.775rem] font-semibold text-muted-foreground">{t(`${tp}.edit`)}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>{t(`${tp}.edit_draft_only_tooltip`)}</TooltipContent>
                    </Tooltip>
                  )
                )}

                {onChangeStatus && transitions.map((s) => {
                  const blocked = s === "ACTIVE" && !moduleConfigured;
                  const sColor  = STATUS_COLORS[s];
                  const Icon    = STATUS_ICONS[s];
                  const label   = t(`${tp}.transition.${s}`);
                  const btn = (
                    <button
                      type="button"
                      key={s}
                      onClick={() => !blocked && setPendingStatus(s)}
                      disabled={blocked}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] border transition-colors"
                      style={{
                        cursor: blocked ? "not-allowed" : "pointer",
                        borderColor: `${sColor?.fg ?? "#E2E8F0"}30`,
                        background: sColor?.bg ?? "#F8FAFC",
                        opacity: blocked ? 0.5 : 1,
                      }}
                    >
                      {Icon && <Icon className="size-3.5" style={{ color: sColor?.fg ?? "#6B7280" }} />}
                      <span className="text-[0.775rem] font-bold" style={{ color: sColor?.fg ?? "#475569" }}>{label}</span>
                    </button>
                  );
                  return blocked ? (
                    <Tooltip key={s}>
                      <TooltipTrigger asChild><span>{btn}</span></TooltipTrigger>
                      <TooltipContent>{t(`${tp}.activate_blocked_tooltip`)}</TooltipContent>
                    </Tooltip>
                  ) : btn;
                })}

                {onDeleteClick && (
                  <button
                    type="button"
                    onClick={onDeleteClick}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] cursor-pointer border border-red-200 bg-red-50/60 hover:bg-red-100 hover:border-red-300 transition-colors"
                  >
                    <Trash2 className="size-3.5 text-red-400" />
                    <span className="text-[0.775rem] font-semibold text-destructive">{t(`${tp}.delete`)}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Identity row */}
          <div className="flex items-center gap-5 flex-wrap">
            <div
              className="flex items-center justify-center size-[72px] rounded-[18px] shrink-0 border"
              style={{ background: `${typeColor}10`, borderColor: `${typeColor}22`, boxShadow: `0 4px 18px ${typeColor}20` }}
            >
              {TypeIcon
                ? <TypeIcon className="!size-8" style={{ color: typeColor }} />
                : <Megaphone className="size-8" style={{ color: typeColor }} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[1.125rem] text-foreground leading-tight">{campaign.title}</p>
              {campaign.description && (
                <p className="text-[0.8125rem] text-muted-foreground mt-1 max-w-[520px] leading-relaxed">{campaign.description}</p>
              )}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full" style={{ background: sc.bg }}>
                  <span className="size-1.5 rounded-full" style={{ background: sc.fg }} />
                  <span className="text-[11px] font-bold" style={{ color: sc.fg }}>{t(`pages.campaigns.status.${campaign.status}`)}</span>
                </span>
                {modLabel && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                    <span className="text-[11.5px] font-semibold text-slate-600">{modLabel}</span>
                  </span>
                )}
                {campaign.status === "DRAFT" && !moduleConfigured && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 cursor-default">
                        <TriangleAlert className="size-[11px] text-amber-600" />
                        <span className="text-[11px] font-bold text-amber-600">{t(`${tp}.module_not_configured_badge`)}</span>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>{t(`${tp}.module_not_configured_tooltip`)}</TooltipContent>
                  </Tooltip>
                )}
                {remaining !== null && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="size-[11px] text-slate-300" />
                    <span className="text-[11.5px] text-muted-foreground font-medium">
                      {remaining === 0 ? t(`${tp}.deadline_passed`) : t(`${tp}.days_left_short`, { count: remaining })}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {pendingStatus && (
          <ConfirmStatusChangeDialog
            open
            campaignTitle={campaign.title}
            currentStatus={campaign.status}
            targetStatus={pendingStatus}
            onClose={closePending}
            onConfirm={handleStatusConfirm}
          />
        )}
      </div>
    </TooltipProvider>
  );
});

CampaignHeader.displayName = "CampaignHeader";
export default CampaignHeader;
