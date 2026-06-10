"use client";

import React, { memo, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box, CircularProgress, Divider, IconButton, ListItemIcon, Menu, MenuItem, Typography,
} from "@mui/material";
import EmailOutlined      from "@mui/icons-material/EmailOutlined";
import AssessmentOutlined from "@mui/icons-material/AssessmentOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import VideoCallOutlined  from "@mui/icons-material/VideoCallOutlined";
import MoreVertOutlined   from "@mui/icons-material/MoreVert";
import StarOutlined       from "@mui/icons-material/StarOutlined";
import CancelOutlined     from "@mui/icons-material/CancelOutlined";
import CheckOutlined      from "@mui/icons-material/CheckOutlined";
import { useQueryClient } from "@tanstack/react-query";
import { ApplicationSummaryItem } from "@/store/slices/jobApplicationSlice";
import { applicationsApi } from "@/modules/company/applications/api";

// ─── Static constants ─────────────────────────────────────────────────────────

const TEAL   = "#0D9488";
const PURPLE = "#7C3AED";

const SCORES_BOX_SX    = { display: "flex", gap: 2.5, flexShrink: 0 } as const;
const DECISION_BOX_SX  = { display: "flex", gap: 0.75, flexShrink: 0 } as const;
const DIVIDER_SX       = { width: "1px", height: 40, bgcolor: "#F3F4F6", flexShrink: 0 } as const;
const ACTION_BOX_SX    = { display: "flex", alignItems: "center", gap: 0.75, flexShrink: 0 } as const;
const MORE_BTN_SX      = { flexShrink: 0, width: 30, height: 30, borderRadius: "8px", color: "#6B7280", "&:hover": { bgcolor: "#F3F4F6" } } as const;
const MENU_PAPER_SX    = { borderRadius: "12px", boxShadow: "0 12px 32px rgba(0,0,0,0.12)", minWidth: 210, mt: 0.75, border: "1px solid #E5E7EB", overflow: "hidden" } as const;
const MENU_HEADER_SX   = { px: 2, py: 1.25, borderBottom: "1px solid #F3F4F6" } as const;
const MENU_HEADER_TEXT = { fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em" } as const;
const MENU_BODY_SX     = { py: 0.75 } as const;
const MENU_DIVIDER_SX  = { my: 0.5, borderColor: "#F3F4F6" } as const;
const SCORE_ABS_SX     = { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: "11px", fontWeight: 700 } as const;

// ─── ScoreCircle ──────────────────────────────────────────────────────────────

export function ScoreCircle({ value, label }: { value: number | null; label: string }) {
  const pct   = value !== null ? Math.min(Math.round(value), 100) : null;
  const color = pct === null ? "#E5E7EB" : pct >= 70 ? "#059669" : pct >= 40 ? "#D97706" : "#DC2626";
  const circumference = 2 * Math.PI * 18;
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.25 }}>
      <Box sx={{ position: "relative", width: 44, height: 44 }}>
        <svg width="44" height="44" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="22" cy="22" r="18" fill="none" stroke={pct === null ? "#F3F4F6" : `${color}22`} strokeWidth="4" />
          <circle cx="22" cy="22" r="18" fill="none" stroke={color}
            strokeWidth="4" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - (pct ?? 0) / 100)}
          />
        </svg>
        <Typography sx={{ ...SCORE_ABS_SX, color: pct !== null ? color : "#9CA3AF" }}>
          {pct !== null ? `${pct}%` : "—"}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: "10px", color: "#9CA3AF", fontWeight: 500 }}>{label}</Typography>
    </Box>
  );
}

// ─── DecisionButton ───────────────────────────────────────────────────────────

interface DecisionButtonProps {
  active: boolean;
  loading: boolean;
  disabled: boolean;
  activeColor: string;
  activeBg: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const DecisionButton = memo<DecisionButtonProps>(({ active, loading, disabled, activeColor, activeBg, icon, label, onClick }) => (
  <Box
    component="button"
    onClick={onClick}
    disabled={disabled}
    title={label}
    sx={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5,
      height: 28, px: 1.1, outline: "none", borderRadius: "7px", cursor: "pointer",
      border: `1px solid ${active ? activeColor : "#D1D5DB"}`,
      bgcolor: active ? activeBg : "#F9FAFB",
      color: active ? activeColor : "#6B7280",
      transition: "all 0.15s",
      "&:hover:not(:disabled)": { borderColor: activeColor, bgcolor: activeBg, color: activeColor },
      "&:disabled": { opacity: 0.5, cursor: "not-allowed" },
    }}
  >
    {loading ? <CircularProgress size={11} sx={{ color: "inherit" }} /> : icon}
    <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "inherit", lineHeight: 1 }}>{label}</Typography>
  </Box>
));
DecisionButton.displayName = "DecisionButton";

// ─── ActionButton ─────────────────────────────────────────────────────────────

const BTN_BASE_SX = {
  display: "flex", alignItems: "center", justifyContent: "center", gap: 0.6,
  height: 30, width: 108, flexShrink: 0, outline: "none", borderRadius: "8px",
  transition: "all 0.15s",
} as const;

const INVITED_BTN_SX = { ...BTN_BASE_SX, border: "1px solid #6EE7B7", bgcolor: "#ECFDF5", color: "#059669", cursor: "default" } as const;
const INVITE_BTN_SX  = { ...BTN_BASE_SX, cursor: "pointer", border: "1px solid #DDD6FE", bgcolor: "#F5F3FF", color: PURPLE, "&:hover": { bgcolor: "#EDE9FE", borderColor: "#A78BFA" } } as const;

interface ActionButtonProps {
  isInvited: boolean; isVisited: boolean; hasEmail: boolean;
  onInvite: () => void; onContact: () => void;
  sendInviteLabel: string; contactLabel: string;
}

const ActionButton = memo<ActionButtonProps>(({ isInvited, isVisited, hasEmail, onInvite, onContact, sendInviteLabel, contactLabel }) => {
  if (isInvited) {
    return (
      <Box sx={INVITED_BTN_SX}>
        <CheckOutlined sx={{ fontSize: 14 }} />
        <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "inherit", lineHeight: 1, whiteSpace: "nowrap" }}>
          Invited
        </Typography>
      </Box>
    );
  }

  if (isVisited) {
    return (
      <Box component="button" onClick={onInvite} sx={INVITE_BTN_SX}>
        <VideoCallOutlined sx={{ fontSize: 14 }} />
        <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "inherit", lineHeight: 1, whiteSpace: "nowrap" }}>
          {sendInviteLabel}
        </Typography>
      </Box>
    );
  }

  return (
    <Box component="button" disabled={!hasEmail} onClick={onContact} sx={{
      ...BTN_BASE_SX,
      border: "1px solid #BFDBFE",
      bgcolor: hasEmail ? "#EFF6FF" : "#F9FAFB",
      color: hasEmail ? "#2563EB" : "#9CA3AF",
      cursor: hasEmail ? "pointer" : "not-allowed",
      opacity: hasEmail ? 1 : 0.55,
      "&:hover:not(:disabled)": { bgcolor: "#DBEAFE", borderColor: "#93C5FD" },
    }}>
      <EmailOutlined sx={{ fontSize: 14, color: "inherit" }} />
      <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "inherit", lineHeight: 1, whiteSpace: "nowrap" }}>
        {contactLabel}
      </Typography>
    </Box>
  );
});
ActionButton.displayName = "ActionButton";

// ─── MenuRow ──────────────────────────────────────────────────────────────────

interface MenuRowProps {
  icon: React.ReactNode; color: string; active: boolean;
  title: string; subtitle: string; onClick?: () => void; disabled?: boolean;
}

const MenuRow = memo<MenuRowProps>(({ icon, color, active, title, subtitle, onClick, disabled }) => (
  <MenuItem disabled={disabled} onClick={onClick} sx={{
    gap: 1, py: 0.875, px: 1.5, mx: 0.5, borderRadius: "8px", alignItems: "flex-start",
    "&:hover": { bgcolor: `${color}0D` }, "&.Mui-disabled": { opacity: 0.5 },
  }}>
    <ListItemIcon sx={{ minWidth: 30 }}>
      <Box sx={{ width: 26, height: 26, borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center",
        bgcolor: active ? `${color}14` : "#F3F4F6" }}>
        {icon}
      </Box>
    </ListItemIcon>
    <Box>
      <Typography sx={{ fontSize: "13px", fontWeight: 600, color: active ? "#111827" : "#9CA3AF", lineHeight: 1.3 }}>{title}</Typography>
      <Typography sx={{ fontSize: "11px", color: "#9CA3AF", lineHeight: 1.2 }}>{subtitle}</Typography>
    </Box>
  </MenuItem>
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
  onAssessment: () => void;
  onInvite: () => void;
  invitedIds?: Set<string>;
}

type SummaryPage = { data: ApplicationSummaryItem[]; pagination: { currentPage: number; totalPages: number; totalCount: number } };

const ApplicationCardActions = memo<ApplicationCardActionsProps>(({
  app, name, appId,
  menuAnchorEl, menuOpen, onMenuOpen, onMenuClose,
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

  const patchSummary = useCallback((decision: "shortlisted" | "rejected" | null) => {
    qc.setQueriesData<SummaryPage>(
      { queryKey: ["applications", "summary"] },
      (prev) => prev
        ? { ...prev, data: prev.data.map((item) => String(item.id) === appId ? { ...item, recruiterDecision: decision } : item) }
        : prev,
    );
  }, [qc, appId]);

  const handleDecision = useCallback(async (decision: "shortlisted" | "rejected") => {
    onMenuClose();
    const prev = app.recruiterDecision as "shortlisted" | "rejected" | null | undefined;
    decision === "shortlisted" ? setDecidingShortlist(true) : setDecidingReject(true);
    patchSummary(decision);
    try {
      await applicationsApi.updateDecision(appId, decision);
    } catch {
      patchSummary(prev ?? null);
    } finally {
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
      <Box sx={SCORES_BOX_SX}>
        <ScoreCircle value={app.matchScore}     label={t("pages.applications.actions.score_match")} />
        <ScoreCircle value={app.interviewScore} label={t("pages.applications.actions.score_interview")} />
      </Box>

      {/* Shortlist / Reject */}
      <Box onClick={stopProp} sx={DECISION_BOX_SX}>
        <DecisionButton
          active={isShortlisted} loading={decidingShortlist} disabled={busy}
          activeColor="#059669" activeBg="#ECFDF5"
          icon={<StarOutlined sx={{ fontSize: 13 }} />}
          label={isShortlisted ? "Shortlisted" : "Shortlist"}
          onClick={handleShortlist}
        />
        <DecisionButton
          active={isRejected} loading={decidingReject} disabled={busy}
          activeColor="#DC2626" activeBg="#FEF2F2"
          icon={<CancelOutlined sx={{ fontSize: 13 }} />}
          label={isRejected ? "Rejected" : "Reject"}
          onClick={handleReject}
        />
      </Box>

      <Box sx={DIVIDER_SX} />

      {/* Primary action + more menu */}
      <Box onClick={stopProp} sx={ACTION_BOX_SX}>
        <ActionButton
          isInvited={isInvited} isVisited={isVisited} hasEmail={!!app.email}
          onInvite={onInvite} onContact={onContact}
          sendInviteLabel={t("pages.applications.actions.send_invite")}
          contactLabel={t("pages.applications.actions.contact")}
        />
        <IconButton
          size="small"
          onClick={onMenuOpen}
          sx={MORE_BTN_SX}
        >
          <MoreVertOutlined sx={{ fontSize: 17 }} />
        </IconButton>
      </Box>

      {/* Dropdown menu */}
      <Menu
        anchorEl={menuAnchorEl} open={menuOpen} onClose={onMenuClose}
        onClick={stopProp}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{ paper: { sx: MENU_PAPER_SX } }}
      >
        <Box sx={MENU_HEADER_SX}>
          <Typography sx={MENU_HEADER_TEXT}>{name}</Typography>
        </Box>

        <Box sx={MENU_BODY_SX}>
          <MenuRow
            color={PURPLE} active={hasInterview}
            icon={<AssessmentOutlined sx={{ fontSize: 14, color: hasInterview ? PURPLE : "#D1D5DB" }} />}
            title={t("pages.applications.actions.menu.view_results_title")}
            subtitle={hasInterview ? t("pages.applications.actions.menu.view_results_desc_done") : t("pages.applications.actions.menu.view_results_desc_pending")}
            disabled={!hasInterview}
            onClick={handleViewResults}
          />

          <MenuRow
            color="#D97706" active={!!app.resumeFile}
            icon={<DescriptionOutlined sx={{ fontSize: 14, color: app.resumeFile ? "#D97706" : "#D1D5DB" }} />}
            title={t("pages.applications.actions.menu.download_cv_title")}
            subtitle={app.resumeFile ? t("pages.applications.actions.menu.download_cv_desc_done") : t("pages.applications.actions.menu.download_cv_desc_none")}
            disabled={!app.resumeFile}
            onClick={handleDownloadCV}
          />

          <Divider sx={MENU_DIVIDER_SX} />

          <MenuRow
            color="#2563EB" active={!!app.email}
            icon={<EmailOutlined sx={{ fontSize: 14, color: "#2563EB" }} />}
            title={t("pages.applications.actions.menu.contact_title")}
            subtitle={app.email || t("pages.applications.actions.menu.contact_desc_none")}
            disabled={!app.email}
            onClick={handleContactMenu}
          />
        </Box>
      </Menu>
    </>
  );
});
ApplicationCardActions.displayName = "ApplicationCardActions";

export default ApplicationCardActions;
