import React, { memo, useCallback, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  ArrowLeft, Trash2, Pencil, Play, Pause, Square, Calendar, TriangleAlert, Megaphone, MoreVertical,
  Link2, Lock, EyeOff, Eye, Users, CalendarPlus,
} from "lucide-react";
import {
  Tooltip, TooltipContent, TooltipTrigger, TooltipProvider,
} from "@/modules/shared/ui/shadcn/tooltip";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/modules/shared/ui/shadcn/dropdown-menu";
import { Card } from "@/modules/shared/ui/shadcn/card";
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

const fmtDate = (d: string | undefined, locale: string) =>
  d
    ? new Date(d).toLocaleDateString(locale.startsWith("fr") ? "fr-FR" : "en-US", {
      month: "short", day: "numeric", year: "numeric",
    })
    : null;

const CampaignHeader: React.FC<Props> = memo(({
  campaign, onChangeStatus, onDeleteClick, onEditClick,
  backUrl = "/company/campaigns", backLabel, actionsNode,
}) => {
  const router = useRouter();
  const { t, i18n } = useTranslation("dashboard");
  const tp = "pages.campaigns.detail";
  const cp = "pages.campaigns.card";
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

  const createdDate = useMemo(() => fmtDate(campaign.createdAt, i18n.language), [campaign.createdAt, i18n.language]);

  return (
    <TooltipProvider delayDuration={200}>
      <Card className="p-0 gap-0 overflow-hidden rounded-2xl">
        {/* Type accent bar */}
        <div className="h-[3px] w-full shrink-0" style={{ background: typeColor }} />

        <div className="p-5 sm:p-6">
          {/* Nav row */}
          <div className="flex items-center justify-between mb-5">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground/70 transition-colors"
            >
              <ArrowLeft className="size-[15px]" />
              <span className="text-[0.8rem] font-semibold">{resolvedBackLabel}</span>
            </button>

            {actionsNode ?? (
              (onEditClick || onChangeStatus || onDeleteClick) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="size-8 rounded-[10px] flex items-center justify-center border border-border bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer outline-none"
                    >
                      <MoreVertical className="size-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-1 shadow-lg">
                    {onEditClick && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span tabIndex={0}>
                            <DropdownMenuItem
                              disabled={campaign.status !== "DRAFT"}
                              onClick={onEditClick}
                              className="gap-2 rounded-md px-2.5 py-2 cursor-pointer text-[13px] text-foreground focus:bg-muted focus:text-foreground"
                            >
                              <Pencil className="size-3.5 shrink-0 text-muted-foreground" />
                              <span className="font-medium">{t(`${tp}.edit`)}</span>
                            </DropdownMenuItem>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          {campaign.status === "DRAFT" ? t(`${tp}.edit_tooltip`) : t(`${tp}.edit_draft_only_tooltip`)}
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {onChangeStatus && transitions.map((s) => {
                      const blocked = s === "ACTIVE" && !moduleConfigured;
                      const Icon    = STATUS_ICONS[s];
                      return (
                        <DropdownMenuItem
                          key={s}
                          disabled={blocked}
                          onClick={() => setPendingStatus(s)}
                          className="gap-2 rounded-md px-2.5 py-2 cursor-pointer text-[13px] text-foreground focus:bg-muted focus:text-foreground"
                        >
                          {Icon && <Icon className="size-3.5 shrink-0 text-muted-foreground" />}
                          <span className="font-medium">{t(`${tp}.transition.${s}`)}</span>
                        </DropdownMenuItem>
                      );
                    })}

                    {onDeleteClick && (
                      <>
                        {(onEditClick || (onChangeStatus && transitions.length > 0)) && (
                          <DropdownMenuSeparator className="my-1" />
                        )}
                        <DropdownMenuItem
                          onClick={onDeleteClick}
                          className="gap-2 rounded-md px-2.5 py-2 cursor-pointer text-[13px] text-foreground focus:bg-muted focus:text-foreground"
                        >
                          <Trash2 className="size-3.5 shrink-0 text-muted-foreground" />
                          <span className="font-medium">{t(`${tp}.delete`)}</span>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )
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

              {/* Details row */}
              <div className="flex items-center gap-x-4 gap-y-1.5 mt-2.5 flex-wrap">
                {campaign.accessMethod && (
                  <span className="inline-flex items-center gap-1.5">
                    {campaign.accessMethod === "LINK"
                      ? <Link2 className="size-[11px] text-slate-300" />
                      : <Lock className="size-[11px] text-slate-300" />}
                    <span className="text-[11.5px] text-muted-foreground font-medium">
                      {campaign.accessMethod === "LINK" ? t(`${cp}.access_public_link`) : t(`${cp}.access_accounts_only`)}
                    </span>
                  </span>
                )}
                {campaign.anonymityMode && (
                  <span className="inline-flex items-center gap-1.5">
                    {campaign.anonymityMode === "ANONYMOUS"
                      ? <EyeOff className="size-[11px] text-slate-300" />
                      : <Eye className="size-[11px] text-slate-300" />}
                    <span className="text-[11.5px] text-muted-foreground font-medium">
                      {campaign.anonymityMode === "ANONYMOUS" ? t(`${cp}.privacy_anonymous`) : t(`${cp}.privacy_nominative`)}
                    </span>
                  </span>
                )}
                {campaign.participantCount != null && (
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="size-[11px] text-slate-300" />
                    <span className="text-[11.5px] text-muted-foreground font-medium">
                      {t(`${tp}.participants_count`, { count: campaign.participantCount })}
                    </span>
                  </span>
                )}
                {createdDate && (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarPlus className="size-[11px] text-slate-300" />
                    <span className="text-[11.5px] text-muted-foreground font-medium">
                      {t(`${tp}.created_on`, { date: createdDate })}
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
      </Card>
    </TooltipProvider>
  );
});

CampaignHeader.displayName = "CampaignHeader";
export default CampaignHeader;
