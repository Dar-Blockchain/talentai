"use client";

import React, { useCallback, useState } from "react";
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

const TEAL   = "#0D9488";
const PURPLE = "#7C3AED";

// ── ScoreCircle ────────────────────────────────────────────────────────────────

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
        <Typography sx={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          fontSize: "11px", fontWeight: 700, color: pct !== null ? color : "#9CA3AF",
        }}>
          {pct !== null ? `${pct}%` : "—"}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: "10px", color: "#9CA3AF", fontWeight: 500 }}>{label}</Typography>
    </Box>
  );
}

// ── DecisionButton ─────────────────────────────────────────────────────────────

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

function DecisionButton({ active, loading, disabled, activeColor, activeBg, icon, label, onClick }: DecisionButtonProps) {
  return (
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
  );
}

// ── ActionButton ───────────────────────────────────────────────────────────────

function ActionButton({ isInvited, isVisited, hasEmail, onInvite, onContact, sendInviteLabel, contactLabel }: {
  isInvited: boolean; isVisited: boolean; hasEmail: boolean;
  onInvite: () => void; onContact: () => void;
  sendInviteLabel: string; contactLabel: string;
}) {
  const btnBase = {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 0.6,
    height: 30, width: 108, flexShrink: 0, outline: "none", borderRadius: "8px",
    transition: "all 0.15s",
  } as const;

  if (isInvited) {
    return (
      <Box sx={{ ...btnBase, border: "1px solid #6EE7B7", bgcolor: "#ECFDF5", color: "#059669", cursor: "default" }}>
        <CheckOutlined sx={{ fontSize: 14 }} />
        <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "inherit", lineHeight: 1, whiteSpace: "nowrap" }}>
          Invited
        </Typography>
      </Box>
    );
  }

  if (isVisited) {
    return (
      <Box component="button" onClick={onInvite} sx={{
        ...btnBase, cursor: "pointer",
        border: "1px solid #DDD6FE", bgcolor: "#F5F3FF", color: PURPLE,
        "&:hover": { bgcolor: "#EDE9FE", borderColor: "#A78BFA" },
      }}>
        <VideoCallOutlined sx={{ fontSize: 14 }} />
        <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "inherit", lineHeight: 1, whiteSpace: "nowrap" }}>
          {sendInviteLabel}
        </Typography>
      </Box>
    );
  }

  return (
    <Box component="button" disabled={!hasEmail} onClick={onContact} sx={{
      ...btnBase,
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
}

// ── MenuRow ────────────────────────────────────────────────────────────────────

function MenuRow({ icon, color, active, title, subtitle, onClick, disabled }: {
  icon: React.ReactNode; color: string; active: boolean;
  title: string; subtitle: string; onClick?: () => void; disabled?: boolean;
}) {
  return (
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
  );
}

// ── Props & main component ─────────────────────────────────────────────────────

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

const ApplicationCardActions: React.FC<ApplicationCardActionsProps> = ({
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

  const busy = decidingShortlist || decidingReject;

  return (
    <>
      {/* Score circles */}
      <Box sx={{ display: "flex", gap: 2.5, flexShrink: 0 }}>
        <ScoreCircle value={app.matchScore}     label={t("pages.applications.actions.score_match")} />
        <ScoreCircle value={app.interviewScore} label={t("pages.applications.actions.score_interview")} />
      </Box>

      {/* Shortlist / Reject */}
      <Box onClick={(e) => e.stopPropagation()} sx={{ display: "flex", gap: 0.75, flexShrink: 0 }}>
        <DecisionButton
          active={isShortlisted} loading={decidingShortlist} disabled={busy}
          activeColor="#059669" activeBg="#ECFDF5"
          icon={<StarOutlined sx={{ fontSize: 13 }} />}
          label={isShortlisted ? "Shortlisted" : "Shortlist"}
          onClick={() => handleDecision("shortlisted")}
        />
        <DecisionButton
          active={isRejected} loading={decidingReject} disabled={busy}
          activeColor="#DC2626" activeBg="#FEF2F2"
          icon={<CancelOutlined sx={{ fontSize: 13 }} />}
          label={isRejected ? "Rejected" : "Reject"}
          onClick={() => handleDecision("rejected")}
        />
      </Box>

      <Box sx={{ width: "1px", height: 40, bgcolor: "#F3F4F6", flexShrink: 0 }} />

      {/* Primary action + more menu */}
      <Box onClick={(e) => e.stopPropagation()} sx={{ display: "flex", alignItems: "center", gap: 0.75, flexShrink: 0 }}>
        <ActionButton
          isInvited={isInvited} isVisited={isVisited} hasEmail={!!app.email}
          onInvite={onInvite} onContact={onContact}
          sendInviteLabel={t("pages.applications.actions.send_invite")}
          contactLabel={t("pages.applications.actions.contact")}
        />
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); onMenuOpen(e); }}
          sx={{ flexShrink: 0, width: 30, height: 30, borderRadius: "8px", color: "#6B7280", "&:hover": { bgcolor: "#F3F4F6" } }}
        >
          <MoreVertOutlined sx={{ fontSize: 17 }} />
        </IconButton>
      </Box>

      {/* Dropdown menu */}
      <Menu
        anchorEl={menuAnchorEl} open={menuOpen} onClose={onMenuClose}
        onClick={(e) => e.stopPropagation()}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{ paper: { sx: { borderRadius: "12px", boxShadow: "0 12px 32px rgba(0,0,0,0.12)", minWidth: 210, mt: 0.75, border: "1px solid #E5E7EB", overflow: "hidden" } } }}
      >
        <Box sx={{ px: 2, py: 1.25, borderBottom: "1px solid #F3F4F6" }}>
          <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {name}
          </Typography>
        </Box>

        <Box sx={{ py: 0.75 }}>
          <MenuRow
            color={PURPLE} active={hasInterview}
            icon={<AssessmentOutlined sx={{ fontSize: 14, color: hasInterview ? PURPLE : "#D1D5DB" }} />}
            title={t("pages.applications.actions.menu.view_results_title")}
            subtitle={hasInterview ? t("pages.applications.actions.menu.view_results_desc_done") : t("pages.applications.actions.menu.view_results_desc_pending")}
            disabled={!hasInterview}
            onClick={() => { onMenuClose(); onAssessment(); }}
          />

          <MenuRow
            color="#D97706" active={!!app.resumeFile}
            icon={<DescriptionOutlined sx={{ fontSize: 14, color: app.resumeFile ? "#D97706" : "#D1D5DB" }} />}
            title={t("pages.applications.actions.menu.download_cv_title")}
            subtitle={app.resumeFile ? t("pages.applications.actions.menu.download_cv_desc_done") : t("pages.applications.actions.menu.download_cv_desc_none")}
            disabled={!app.resumeFile}
            onClick={handleDownloadCV}
          />

          <Divider sx={{ my: 0.5, borderColor: "#F3F4F6" }} />

          <MenuRow
            color="#2563EB" active={!!app.email}
            icon={<EmailOutlined sx={{ fontSize: 14, color: "#2563EB" }} />}
            title={t("pages.applications.actions.menu.contact_title")}
            subtitle={app.email || t("pages.applications.actions.menu.contact_desc_none")}
            disabled={!app.email}
            onClick={() => { onMenuClose(); onContact(); }}
          />
        </Box>
      </Menu>
    </>
  );
};

export default ApplicationCardActions;
