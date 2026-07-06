import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { daysLeft } from "@/utils/functions";
import { MODULE_CONFIG, STATUS_TRANSITIONS } from "@/modules/shared/constants/campaign";
import { Campaign, ModuleType } from "@/modules/company/campaigns/types/campaign";
import { STATUS_BADGE, PARTICIPANT_STATUS_BADGE } from "./constants";

export function useCampaignCard(
  campaign: Campaign,
  variant: "company" | "employee",
  canPublish: boolean,
  canDelete: boolean,
) {
  const { t } = useTranslation("dashboard");
  const p = "pages.campaigns";
  const isEmployee = variant === "employee";

  const statusBadge = useMemo(() => STATUS_BADGE[campaign.status] || STATUS_BADGE.DRAFT, [campaign.status]);
  const statusLabel = useMemo(() => t(`${p}.status.${campaign.status}`), [campaign.status, t]);

  const participantStatus = campaign.participantStatus ?? "INVITED";
  const participantBadge  = useMemo(() => PARTICIPANT_STATUS_BADGE[participantStatus], [participantStatus]);

  const remaining = useMemo(() => daysLeft(campaign.deadline), [campaign.deadline]);
  const isUrgent  = useMemo(() => remaining !== null && remaining <= 3 && remaining >= 0, [remaining]);
  const isToday   = useMemo(() =>
    campaign.deadline
      ? new Date(campaign.deadline).toDateString() === new Date().toDateString()
      : false,
  [campaign.deadline]);

  const isPaused = campaign.status === "PAUSED";
  const isClosed = campaign.status === "CLOSED";
  const campaignAccessible = !isPaused && !isClosed;
  const isExpired = useMemo(() => {
    if (!campaign.deadline) return false;
    const end = new Date(campaign.deadline);
    end.setHours(23, 59, 59, 999);
    return end.getTime() < Date.now();
  }, [campaign.deadline]);
  const canParticipantStart =
    (participantStatus === "INVITED" || participantStatus === "IN_PROGRESS") &&
    campaignAccessible && !isExpired;

  const moduleConf  = useMemo(() => campaign.module ? MODULE_CONFIG[campaign.module.type] : null, [campaign.module]);
  const moduleLabel = useMemo(() =>
    campaign.module?.type ? t(`${p}.module.${campaign.module.type as ModuleType}`) : null,
  [campaign.module?.type, t]);

  const transitions = useMemo(() => STATUS_TRANSITIONS[campaign.status] ?? [], [campaign.status]);
  const showMenu     = !isEmployee && (canPublish || canDelete);

  const total        = campaign.targetEmployeeCount ?? 0;
  const completed    = campaign.completedCount ?? 0;
  const pct          = total > 0 ? Math.round((completed / total) * 100) : 0;
  const showProgress = campaign.targetEmployeeCount != null && campaign.completedCount != null && total > 0;

  return {
    isEmployee,
    statusBadge, statusLabel,
    participantStatus, participantBadge,
    remaining, isUrgent, isToday,
    isPaused, isClosed, isExpired, canParticipantStart,
    moduleConf, moduleLabel,
    transitions, showMenu,
    total, completed, pct, showProgress,
  };
}

export type CampaignCardData = ReturnType<typeof useCampaignCard>;
