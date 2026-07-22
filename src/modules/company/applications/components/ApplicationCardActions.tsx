"use client";

import React, { memo, useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Mail, BarChart3, FileText, Video, Star, XCircle, Check } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ApplicationSummaryItem } from "@/modules/company/applications/types";
import { applicationsApi } from "@/modules/company/applications/api";
import { ScoreCircle, DecisionButton } from "@/modules/shared/ui/shadcn/score-circle";
import { Button } from "@/modules/shared/ui/shadcn/button";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/modules/shared/ui/shadcn/dropdown-menu";
import { MoreOptionsMenu } from "@/modules/shared/ui/MoreOptionsMenu";

const TEAL   = "#0D9488";
const PURPLE = "#7C3AED";

// ─── ActionButton ─────────────────────────────────────────────────────────────

interface ActionButtonProps {
  isInvited: boolean; isVisited: boolean; hasEmail: boolean;
  onInvite: () => void; onContact: () => void;
  sendInviteLabel: string; contactLabel: string;
}

const ActionButton = memo<ActionButtonProps>(({ isInvited, isVisited, hasEmail, onInvite, onContact, sendInviteLabel, contactLabel }) => {
  if (isInvited) {
    return (
      <div className="flex items-center justify-center gap-1 h-[30px] w-29.5 shrink-0 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600">
        <Check size={14} />
        <span className="text-[12px] font-semibold whitespace-nowrap">Invited</span>
      </div>
    );
  }

  if (isVisited) {
    return (
      <Button variant="secondary" size="sm" className="w-29.5 shrink-0" onClick={onInvite}>
        <Video size={14} />
        {sendInviteLabel}
      </Button>
    );
  }

  return (
    <Button variant="outline" size="sm" className="w-29.5 shrink-0" disabled={!hasEmail} onClick={onContact}>
      <Mail size={14} />
      {contactLabel}
    </Button>
  );
});
ActionButton.displayName = "ActionButton";

// ─── MenuRow ──────────────────────────────────────────────────────────────────

interface MenuRowProps {
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  disabled?: boolean;
  onClick?: () => void;
}

const MenuRow = memo<MenuRowProps>(({ icon, iconColor, iconBg, title, subtitle, disabled, onClick }) => (
  <DropdownMenuItem
    disabled={disabled}
    onClick={onClick}
    className="flex items-start gap-2 py-[7px] px-3 mx-1 rounded-lg cursor-pointer"
  >
    <div
      className="w-[26px] h-[26px] rounded-[7px] flex items-center justify-center shrink-0"
      style={{ backgroundColor: iconBg }}
    >
      <span style={{ color: iconColor }}>{icon}</span>
    </div>
    <div>
      <div className="text-[13px] font-semibold text-slate-800 leading-snug">{title}</div>
      <div className="text-[11px] text-slate-400 leading-tight">{subtitle}</div>
    </div>
  </DropdownMenuItem>
));
MenuRow.displayName = "MenuRow";

// ─── Main component ───────────────────────────────────────────────────────────

export interface ApplicationCardActionsProps {
  app: ApplicationSummaryItem;
  name: string;
  appId: string;
  menuAnchorEl: HTMLElement | null;
  menuOpen: boolean;
  onMenuOpen: (e: React.MouseEvent<HTMLElement>) => void;
  onMenuClose: () => void;
  onContact: () => void;
  onAssessment: () => void;  // navigates to assessment page
  onInvite: () => void;
  invitedIds?: Set<string>;
}

type SummaryPage = { data: ApplicationSummaryItem[]; pagination: { currentPage: number; totalPages: number; totalCount: number } };

const ApplicationCardActions = memo<ApplicationCardActionsProps>(({
  app, name, appId,
  menuOpen, onMenuOpen, onMenuClose,
  onContact, onAssessment, onInvite, invitedIds,
}) => {
  const { t } = useTranslation("dashboard");
  const qc = useQueryClient();

  const hasInterview  = !!app.completedAt;
  const isVisited     = app.status === "visited";
  const isInvited     = invitedIds?.has(appId) ?? false;
  const isShortlisted = app.recruiterDecision === "shortlisted";
  const isRejected    = app.recruiterDecision === "rejected";

  const [decidingShortlist, setDecidingShortlist] = useState(false);
  const [decidingReject,    setDecidingReject]    = useState(false);
  const requestInFlight = useRef(false);

  const patchSummary = useCallback((decision: "shortlisted" | "rejected" | null) => {
    qc.setQueriesData<SummaryPage>(
      { queryKey: ["applications", "summary"] },
      (prev) => prev
        ? { ...prev, data: prev.data.map((item) => String(item.id) === appId ? { ...item, recruiterDecision: decision } : item) }
        : prev,
    );
  }, [qc, appId]);

  const handleDecision = useCallback(async (decision: "shortlisted" | "rejected") => {
    if (requestInFlight.current) return;
    requestInFlight.current = true;
    onMenuClose();
    const prev = app.recruiterDecision as "shortlisted" | "rejected" | null | undefined;
    decision === "shortlisted" ? setDecidingShortlist(true) : setDecidingReject(true);
    patchSummary(decision);
    try {
      await applicationsApi.updateDecision(appId, decision);
    } catch {
      patchSummary(prev ?? null);
    } finally {
      requestInFlight.current = false;
      setDecidingShortlist(false);
      setDecidingReject(false);
    }
  }, [appId, app.recruiterDecision, onMenuClose, patchSummary]);

  const handleShortlist = useCallback(() => handleDecision("shortlisted"), [handleDecision]);
  const handleReject    = useCallback(() => handleDecision("rejected"),    [handleDecision]);

  const handleDownloadCV = useCallback(() => {
    if (!app.resumeFile) return;
    onMenuClose();
    const link = Object.assign(document.createElement("a"), {
      href:     `${process.env.NEXT_PUBLIC_API_BASE_URL}resume/${app.resumeFile}`,
      download: app.resumeFile,
      target:   "_blank",
    });
    link.click();
  }, [app.resumeFile, onMenuClose]);

  const handleViewResults = useCallback(() => { onMenuClose(); onAssessment(); }, [onMenuClose, onAssessment]);
  const handleContactMenu = useCallback(() => { onMenuClose(); onContact(); },    [onMenuClose, onContact]);

  const stopProp = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

  const busy = decidingShortlist || decidingReject;

  return (
    <>
      {/* Score circles */}
      <div className="flex gap-5 shrink-0">
        <ScoreCircle value={app.matchScore}     label={t("pages.applications.actions.score_match")} />
        <ScoreCircle value={app.interviewScore} label={t("pages.applications.actions.score_interview")} />
      </div>

      {/* Shortlist / Reject */}
      <div className="flex gap-1.5 shrink-0" onClick={stopProp}>
        <DecisionButton
          active={isShortlisted} loading={decidingShortlist} disabled={busy || isShortlisted}
          activeColor="#059669" activeBg="#ECFDF5"
          icon={<Star size={13} />}
          label={isShortlisted ? "Shortlisted" : "Shortlist"}
          onClick={handleShortlist}
        />
        <DecisionButton
          active={isRejected} loading={decidingReject} disabled={busy || isRejected}
          activeColor="#DC2626" activeBg="#FEF2F2"
          icon={<XCircle size={13} />}
          label={isRejected ? "Rejected" : "Reject"}
          onClick={handleReject}
        />
      </div>

      <div className="w-px h-10 bg-slate-100 shrink-0" />

      {/* Primary action + more menu */}
      <div className="flex items-center gap-1.5 shrink-0" onClick={stopProp}>
        <ActionButton
          isInvited={isInvited} isVisited={isVisited} hasEmail={!!app.email}
          onInvite={onInvite} onContact={onContact}
          sendInviteLabel={t("pages.applications.actions.send_invite")}
          contactLabel={t("pages.applications.actions.contact")}
        />

        <MoreOptionsMenu
          open={menuOpen}
          onOpenChange={(o) => { if (!o) onMenuClose(); }}
          onTriggerClick={onMenuOpen}
          className="text-slate-500"
          contentClassName="min-w-[210px] rounded-xl border border-slate-200 shadow-[0_12px_32px_rgba(0,0,0,0.12)] p-0 overflow-hidden"
        >
            <div className="px-3 py-2.5 border-b border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{name}</span>
            </div>
            <div className="py-1.5">
              <MenuRow
                iconColor={hasInterview ? PURPLE : "#D1D5DB"}
                iconBg={hasInterview ? `${PURPLE}14` : "#F3F4F6"}
                icon={<BarChart3 size={14} />}
                title={t("pages.applications.actions.menu.view_results_title")}
                subtitle={hasInterview ? t("pages.applications.actions.menu.view_results_desc_done") : t("pages.applications.actions.menu.view_results_desc_pending")}
                disabled={!hasInterview}
                onClick={handleViewResults}
              />
              <MenuRow
                iconColor={app.resumeFile ? "#D97706" : "#D1D5DB"}
                iconBg={app.resumeFile ? "#FEF3C714" : "#F3F4F6"}
                icon={<FileText size={14} />}
                title={t("pages.applications.actions.menu.download_cv_title")}
                subtitle={app.resumeFile ? t("pages.applications.actions.menu.download_cv_desc_done") : t("pages.applications.actions.menu.download_cv_desc_none")}
                disabled={!app.resumeFile}
                onClick={handleDownloadCV}
              />
              <DropdownMenuSeparator className="my-1 bg-slate-100" />
              <MenuRow
                iconColor="#2563EB"
                iconBg="#EFF6FF"
                icon={<Mail size={14} />}
                title={t("pages.applications.actions.menu.contact_title")}
                subtitle={app.email || t("pages.applications.actions.menu.contact_desc_none")}
                disabled={!app.email}
                onClick={handleContactMenu}
              />
            </div>
        </MoreOptionsMenu>
      </div>
    </>
  );
});
ApplicationCardActions.displayName = "ApplicationCardActions";

export default ApplicationCardActions;
