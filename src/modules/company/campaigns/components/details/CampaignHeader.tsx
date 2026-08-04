import React, { memo, useCallback, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  ArrowLeft, Trash2, Pencil, Play, Pause, Square, Calendar, TriangleAlert, Megaphone,
  Link2, Lock, EyeOff, Eye, Users, CalendarPlus, Copy, Check,
} from "lucide-react";
import {
  Tooltip, TooltipContent, TooltipTrigger, TooltipProvider,
} from "@/modules/shared/ui/shadcn/tooltip";
import {
  DropdownMenuItem, DropdownMenuSeparator,
} from "@/modules/shared/ui/shadcn/dropdown-menu";
import { MoreOptionsMenu } from "@/modules/shared/ui/MoreOptionsMenu";
import { Card } from "@/modules/shared/ui/shadcn/card";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Campaign, CampaignStatus } from "@/modules/company/campaigns/types/campaign";
import { STATUS_COLORS, STATUS_TRANSITIONS, CAMPAIGN_TYPES } from "@/modules/shared/constants/campaign";
import { daysLeft } from "@/utils/functions";
import { buildCampaignSessionUrl } from "@/lib/campaignSession";
import { useToast } from "@/hooks/useToast";
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
  const { showToast } = useToast();
  const tp = "pages.campaigns.detail";
  const cp = "pages.campaigns.card";
  const [pendingStatus, setPendingStatus] = useState<CampaignStatus | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const resolvedBackLabel = backLabel ?? t(`${tp}.back_company`);

  const handleBack = useCallback(() => router.push(backUrl), [router, backUrl]);
  const closePending = useCallback(() => setPendingStatus(null), []);
  const handleStatusConfirm = useCallback(() => {
    if (pendingStatus) onChangeStatus?.(campaign._id, pendingStatus);
    setPendingStatus(null);
  }, [onChangeStatus, campaign._id, pendingStatus]);

  const handleCopyLink = useCallback(async () => {
    if (!campaign.linkToken) return;
    const url = `${window.location.origin}${buildCampaignSessionUrl(campaign._id, campaign.linkToken)}`;
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      showToast({ message: t(`${tp}.link_copied`), severity: "success" });
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      showToast({ message: t(`${tp}.link_copy_failed`), severity: "error" });
    }
  }, [campaign._id, campaign.linkToken, showToast, t, tp]);

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
  const isPublicLink = campaign.accessMethod === "LINK" && !!campaign.linkToken;

  return (
    <TooltipProvider delayDuration={200}>
      <Card className="p-0 gap-0 overflow-hidden rounded-2xl">
        {/* Type accent bar */}
        <div className="h-[3px] w-full shrink-0" style={{ background: typeColor }} />

        <div className="px-[18px] py-4">
          {/* Nav row */}
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="p-0 h-auto text-muted-foreground hover:bg-transparent hover:text-foreground/70"
            >
              <ArrowLeft className="size-[14px]" />
              <span className="text-[12.5px] font-semibold">{resolvedBackLabel}</span>
            </Button>

            {actionsNode ?? (
              <div className="flex items-center gap-1.5">
                {isPublicLink && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    className={linkCopied
                      ? "h-8 gap-1.5 px-2.5 text-xs font-semibold border-gray-200 bg-gray-100 text-gray-700"
                      : "h-8 gap-1.5 px-2.5 text-xs font-semibold border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700"}
                  >
                    {linkCopied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    {linkCopied ? t(`${tp}.link_copied`) : t(`${tp}.copy_link_button`)}
                  </Button>
                )}

                {(onEditClick || onChangeStatus || onDeleteClick) && (
                <MoreOptionsMenu
                  size="xs"
                  iconSize={14}
                  bordered
                  className="border-border bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted"
                  contentClassName="w-56 p-1 shadow-lg"
                >
                    {isPublicLink && (
                      <DropdownMenuItem
                        onClick={handleCopyLink}
                        className="gap-2 rounded-md px-2.5 py-2 cursor-pointer text-[13px] text-foreground focus:bg-muted focus:text-foreground"
                      >
                        {linkCopied
                          ? <Check className="size-3.5 shrink-0 text-emerald-500" />
                          : <Copy className="size-3.5 shrink-0 text-muted-foreground" />}
                        <span className="font-medium">
                          {linkCopied ? t(`${tp}.link_copied`) : t(`${tp}.copy_link_button`)}
                        </span>
                      </DropdownMenuItem>
                    )}

                    {isPublicLink && (onEditClick || (onChangeStatus && transitions.length > 0) || onDeleteClick) && (
                      <DropdownMenuSeparator className="my-1" />
                    )}

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
                </MoreOptionsMenu>
                )}
              </div>
            )}
          </div>

          {/* Identity row */}
          <div className="flex items-start gap-3">
            <div
              className="flex items-center justify-center size-[42px] rounded-xl shrink-0 border"
              style={{ background: `${typeColor}10`, borderColor: `${typeColor}22` }}
            >
              {TypeIcon
                ? <TypeIcon className="!size-5" style={{ color: typeColor }} />
                : <Megaphone className="size-5" style={{ color: typeColor }} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-[15.5px] text-foreground leading-tight">{campaign.title}</p>
                <span className="inline-flex items-center gap-1.5 h-5 px-2 rounded-full shrink-0" style={{ background: sc.bg }}>
                  <span className="size-1.5 rounded-full" style={{ background: sc.fg }} />
                  <span className="text-[11px] font-bold" style={{ color: sc.fg }}>{t(`pages.campaigns.status.${campaign.status}`)}</span>
                </span>
                {modLabel && (
                  <span className="inline-flex items-center h-5 px-2 rounded-full bg-slate-100 border border-slate-200 shrink-0">
                    <span className="text-[11px] font-semibold text-slate-600">{modLabel}</span>
                  </span>
                )}
                {campaign.status === "DRAFT" && !moduleConfigured && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center gap-1 h-5 px-2 rounded-full bg-amber-50 border border-amber-200 cursor-default shrink-0">
                        <TriangleAlert className="size-[10px] text-amber-600" />
                        <span className="text-[10.5px] font-bold text-amber-600">{t(`${tp}.module_not_configured_badge`)}</span>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>{t(`${tp}.module_not_configured_tooltip`)}</TooltipContent>
                  </Tooltip>
                )}
                {remaining !== null && (
                  <span className="inline-flex items-center gap-1 shrink-0">
                    <Calendar className="size-[11px] text-slate-300" />
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {remaining === 0 ? t(`${tp}.deadline_passed`) : t(`${tp}.days_left_short`, { count: remaining })}
                    </span>
                  </span>
                )}
              </div>
              {campaign.description && (
                <p className="text-[12px] text-muted-foreground mt-0.5 max-w-[520px] leading-relaxed">{campaign.description}</p>
              )}
            </div>
          </div>

          {/* Fact strip */}
          {(campaign.accessMethod || campaign.anonymityMode || campaign.participantCount != null || createdDate) && (
            <div className="flex rounded-xl border border-border overflow-hidden bg-muted mt-3">
              {campaign.accessMethod && (
                <div className="flex-1 min-w-0 px-[11px] py-2.5 border-r border-border/60 last:border-r-0">
                  <div className="flex items-center gap-1.5">
                    {campaign.accessMethod === "LINK"
                      ? <Link2 className="size-3 text-muted-foreground shrink-0" />
                      : <Lock className="size-3 text-muted-foreground shrink-0" />}
                    <span className="text-[10px] font-bold uppercase tracking-[0.04em] text-muted-foreground/70 truncate">
                      {t(`${tp}.access_method_label`)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-1.5 mt-0.5">
                    <span className="text-[12.5px] font-bold text-foreground truncate">
                      {campaign.accessMethod === "LINK" ? t(`${cp}.access_public_link`) : t(`${cp}.access_accounts_only`)}
                    </span>
                    {campaign.accessMethod === "LINK" && campaign.linkToken && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={handleCopyLink}
                            className="inline-flex items-center gap-1 h-[19px] px-1.5 rounded-full text-[10px] font-bold shrink-0 bg-primary/10 text-primary hover:bg-primary/15 transition-colors cursor-pointer outline-none"
                          >
                            {linkCopied ? <Check className="size-[9px]" /> : <Copy className="size-[9px]" />}
                            {linkCopied ? t(`${tp}.link_copied`) : t(`${tp}.copy_link_button`)}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>{t(`${tp}.copy_link_tooltip`)}</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
              )}
              {campaign.anonymityMode && (
                <div className="flex-1 min-w-0 px-[11px] py-2.5 border-r border-border/60 last:border-r-0">
                  <div className="flex items-center gap-1.5">
                    {campaign.anonymityMode === "ANONYMOUS"
                      ? <EyeOff className="size-3 text-muted-foreground shrink-0" />
                      : <Eye className="size-3 text-muted-foreground shrink-0" />}
                    <span className="text-[10px] font-bold uppercase tracking-[0.04em] text-muted-foreground/70 truncate">
                      {t(`${tp}.anonymity_label`)}
                    </span>
                  </div>
                  <p className="text-[12.5px] font-bold text-foreground truncate mt-0.5">
                    {campaign.anonymityMode === "ANONYMOUS" ? t(`${cp}.privacy_anonymous`) : t(`${cp}.privacy_nominative`)}
                  </p>
                </div>
              )}
              {campaign.participantCount != null && (
                <div className="flex-1 min-w-0 px-[11px] py-2.5 border-r border-border/60 last:border-r-0">
                  <div className="flex items-center gap-1.5">
                    <Users className="size-3 text-muted-foreground shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.04em] text-muted-foreground/70 truncate">
                      {t(`${tp}.stats_participants`)}
                    </span>
                  </div>
                  <p className="text-[12.5px] font-bold text-foreground truncate mt-0.5 tabular-nums">{campaign.participantCount}</p>
                </div>
              )}
              {createdDate && (
                <div className="flex-1 min-w-0 px-[11px] py-2.5">
                  <div className="flex items-center gap-1.5">
                    <CalendarPlus className="size-3 text-muted-foreground shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.04em] text-muted-foreground/70 truncate">
                      {t(`${tp}.fact_created`)}
                    </span>
                  </div>
                  <p className="text-[12.5px] font-bold text-foreground truncate mt-0.5">{createdDate}</p>
                </div>
              )}
            </div>
          )}
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
