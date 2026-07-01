import React, { memo, useCallback, useMemo } from "react";
import {
  MoreVertical, Clock, Users, Link2, Lock,
  EyeOff, Eye, Trash2, ArrowRight, Play, Pause, Square,
} from "lucide-react";
import { daysLeft, fmtDate } from "@/utils/functions";
import { MODULE_CONFIG, STATUS_COLORS, STATUS_TRANSITIONS } from "@/modules/shared/constants/campaign";
import { CampaignStatus, ModuleType, Campaign } from "@/modules/company/campaigns/types/campaign";
import { Card } from "@/modules/shared/ui/shadcn/card";
import { Button } from "@/modules/shared/ui/shadcn/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/modules/shared/ui/shadcn/dropdown-menu";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/modules/shared/ui/shadcn/tooltip";
import Link from "next/link";
import { useTranslation } from "react-i18next";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_ICONS: Partial<Record<CampaignStatus, React.ElementType>> = {
  ACTIVE: Play,
  PAUSED: Pause,
  CLOSED: Square,
};

const STATUS_BADGE: Record<string, { badge: string; dot: string }> = {
  DRAFT:   { badge: "bg-slate-100 text-slate-600 border border-slate-200",     dot: "bg-slate-400"   },
  ACTIVE:  { badge: "bg-emerald-100 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" },
  PAUSED:  { badge: "bg-amber-100 text-amber-700 border border-amber-200",       dot: "bg-amber-500"   },
  CLOSED:  { badge: "bg-blue-100 text-blue-700 border border-blue-200",          dot: "bg-blue-600"    },
  EXPIRED: { badge: "bg-red-100 text-red-700 border border-red-200",             dot: "bg-red-500"     },
};

// ─── Component ────────────────────────────────────────────────────────────────

interface CampaignCardProps {
  campaign: Campaign;
  onViewDetails: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onStatusChange: (id: string, title: string, currentStatus: Campaign["status"], targetStatus: CampaignStatus) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canPublish?: boolean;
}

const CampaignCard: React.FC<CampaignCardProps> = memo(({
  campaign, onDelete, onStatusChange, canDelete = true, canPublish = true,
}) => {
  const { t } = useTranslation("dashboard");
  const p = "pages.campaigns";

  const statusBadge = useMemo(() => STATUS_BADGE[campaign.status] || STATUS_BADGE.DRAFT, [campaign.status]);
  const remaining = useMemo(() => daysLeft(campaign.deadline), [campaign.deadline]);
  const isUrgent  = useMemo(() => remaining !== null && remaining <= 3 && remaining >= 0, [remaining]);
  const isToday   = useMemo(() =>
    campaign.deadline
      ? new Date(campaign.deadline).toDateString() === new Date().toDateString()
      : false,
  [campaign.deadline]);

  const moduleConf  = useMemo(() => campaign.module ? MODULE_CONFIG[campaign.module.type] : null, [campaign.module]);
  const ModuleIcon  = moduleConf?.icon;
  const moduleLabel = useMemo(() =>
    campaign.module?.type ? t(`${p}.module.${campaign.module.type as ModuleType}`) : null,
  [campaign.module?.type, t]);

  const statusLabel = useMemo(() => t(`${p}.status.${campaign.status}`), [campaign.status, t]);
  const transitions = useMemo(() => STATUS_TRANSITIONS[campaign.status] ?? [], [campaign.status]);
  const showMenu    = canPublish || canDelete;

  const handleDelete = useCallback(() => {
    onDelete(campaign._id, campaign.title);
  }, [onDelete, campaign._id, campaign.title]);

  const deadlineNode = useMemo(() => {
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
      <span className="text-muted-foreground">
        {t(`${p}.card.due_prefix`)}{" "}
        <span className="font-medium text-foreground/80">{dateStr}</span>
      </span>
    );
  }, [campaign.deadline, remaining, isToday, t]);

  return (
    <Card className="gap-0 py-0 overflow-hidden flex flex-col h-full group transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:-translate-y-px">
      {/* Body */}
      <div className="flex-1 flex flex-col gap-4 p-5">

        {/* Row 1: status badge + menu */}
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[11px] font-bold ${statusBadge.badge}`}>
            <span className={`size-1.5 rounded-full shrink-0 ${statusBadge.dot}`} />
            {statusLabel}
          </span>

          {showMenu && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="size-7 rounded-lg flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                  <MoreVertical className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 p-1">
                {canPublish && transitions.map((s) => {
                  const sColor = STATUS_COLORS[s];
                  const Icon   = STATUS_ICONS[s];
                  return (
                    <DropdownMenuItem
                      key={s}
                      onClick={() => onStatusChange(campaign._id, campaign.title, campaign.status, s)}
                      className="gap-2 rounded-md px-2.5 py-2 cursor-pointer text-[13px] focus:bg-[var(--item-hover)]"
                      style={{ "--item-hover": sColor?.bg } as React.CSSProperties}
                    >
                      {Icon && (
                        <Icon className="size-3.5 shrink-0" style={{ color: sColor?.fg }} />
                      )}
                      <span className="font-medium" style={{ color: sColor?.fg }}>
                        {t(`${p}.card.menu_transition.${s}`)}
                      </span>
                    </DropdownMenuItem>
                  );
                })}

                {canPublish && canDelete && transitions.length > 0 && (
                  <DropdownMenuSeparator className="my-1" />
                )}

                {canDelete && (
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="gap-2 rounded-md px-2.5 py-2 cursor-pointer text-[13px] text-destructive focus:text-destructive focus:bg-destructive/8"
                  >
                    <Trash2 className="size-3.5 shrink-0" />
                    <span className="font-medium">{t(`${p}.card.menu_delete`)}</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Row 2: title + description */}
        <div className="space-y-1.5">
          <p className="text-[15px] font-bold text-card-foreground leading-snug tracking-tight">
            {campaign.title}
          </p>
          {campaign.description && (
            <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2">
              {campaign.description}
            </p>
          )}
        </div>

        {/* Row 3: module + participant count */}
        <div className="flex items-center gap-3">
          {moduleConf && ModuleIcon && moduleLabel && (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium"
              style={{
                backgroundColor: `${moduleConf.color}12`,
                color:           moduleConf.color,
              }}
            >
              <ModuleIcon style={{ fontSize: 13, color: moduleConf.color }} />
              {moduleLabel}
            </span>
          )}

          {campaign.targetEmployeeCount != null && (
            <span className="inline-flex items-center gap-1 text-[12px] text-muted-foreground">
              <Users className="size-3.5 shrink-0" />
              <strong className="text-foreground font-semibold">{campaign.targetEmployeeCount}</strong>
              {" participants"}
            </span>
          )}
        </div>

        {/* Row 4: access + anonymity badges */}
        {(campaign.accessMethod || campaign.anonymityMode) && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {campaign.accessMethod && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium"
                style={campaign.accessMethod === "LINK"
                  ? { backgroundColor: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" }
                  : { backgroundColor: "#F5F3FF", color: "#5B21B6", borderColor: "#DDD6FE" }}
              >
                {campaign.accessMethod === "LINK"
                  ? <Link2 className="size-2.5" />
                  : <Lock className="size-2.5" />}
                {campaign.accessMethod === "LINK"
                  ? t(`${p}.card.access_public_link`)
                  : t(`${p}.card.access_accounts_only`)}
              </span>
            )}
            {campaign.anonymityMode && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium"
                style={campaign.anonymityMode === "ANONYMOUS"
                  ? { backgroundColor: "#FFF7ED", color: "#9A3412", borderColor: "#FED7AA" }
                  : { backgroundColor: "#F0FDF4", color: "#166534", borderColor: "#BBF7D0" }}
              >
                {campaign.anonymityMode === "ANONYMOUS"
                  ? <EyeOff className="size-2.5" />
                  : <Eye className="size-2.5" />}
                {campaign.anonymityMode === "ANONYMOUS"
                  ? t(`${p}.card.privacy_anonymous`)
                  : t(`${p}.card.privacy_nominative`)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3.5 border-t border-border/60">
        <div className="flex items-center gap-1.5 text-[12px]">
          <Clock
            className="size-3.5 shrink-0 text-muted-foreground/70"
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

        <Link href={`/company/campaigns/${campaign._id}`}>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2.5 gap-1 text-xs text-muted-foreground hover:text-foreground rounded-lg"
          >
            {t(`${p}.card.view`)}
            <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </div>
    </Card>
  );
});

CampaignCard.displayName = "CampaignCard";
export default CampaignCard;
