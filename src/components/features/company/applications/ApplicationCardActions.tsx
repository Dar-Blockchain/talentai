"use client";

import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box, CircularProgress, Divider, IconButton, ListItemIcon, Menu, MenuItem, Typography,
} from "@mui/material";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import AccountCircleOutlined from "@mui/icons-material/AccountCircleOutlined";
import AssessmentOutlined from "@mui/icons-material/AssessmentOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import VideoCallOutlined from "@mui/icons-material/VideoCallOutlined";
import MoreVertOutlined from "@mui/icons-material/MoreVert";
import StarOutlined from "@mui/icons-material/StarOutlined";
import CancelOutlined from "@mui/icons-material/CancelOutlined";
import CheckOutlined from "@mui/icons-material/CheckOutlined";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import { ApplicationSummaryItem } from "@/store/slices/jobApplicationSlice";
import { applicationsApi } from "@/modules/company/applications/api";

// ── Constants ──────────────────────────────────────────────────────────────────
const TEAL   = "#0D9488";
const PURPLE = "#7C3AED";

// ── ScoreCircle ────────────────────────────────────────────────────────────────
export function ScoreCircle({ value, label }: { value: number | null; label: string }) {
  const pct = value !== null ? Math.min(Math.round(value), 100) : null;
  const color = pct === null ? "#E5E7EB" : pct >= 70 ? "#059669" : pct >= 40 ? "#D97706" : "#DC2626";
  const trackColor = pct === null ? "#F3F4F6" : `${color}22`;
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.25 }}>
      <Box sx={{ position: "relative", width: 44, height: 44 }}>
        <svg width="44" height="44" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="22" cy="22" r="18" fill="none" stroke={trackColor} strokeWidth="4" />
          <circle cx="22" cy="22" r="18" fill="none"
            stroke={pct !== null ? color : "#E5E7EB"}
            strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 18}`}
            strokeDashoffset={`${2 * Math.PI * 18 * (1 - (pct ?? 0) / 100)}`}
            strokeLinecap="round"
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

// ── Props ──────────────────────────────────────────────────────────────────────
export interface ApplicationCardActionsProps {
  app: ApplicationSummaryItem;
  name: string;
  appId: string;
  postId: string;
  avatarUrl?: string;
  bgColor: string;
  menuAnchorEl: HTMLElement | null;
  menuOpen: boolean;
  onMenuOpen: (e: React.MouseEvent<HTMLElement>) => void;
  onMenuClose: () => void;
  onContact: () => void;
  onAssessment: () => void;
  onInvite: () => void;
  /** Set of applicationIds that were already invited this session */
  invitedIds?: Set<string>;
}

// ── menuItemSx helper ──────────────────────────────────────────────────────────
const menuItemSx = (color: string) => ({
  gap: 1, py: 0.875, px: 1.5, mx: 0.5, borderRadius: "8px", alignItems: "flex-start",
  "&:hover": { bgcolor: `${color}0D` },
  "&.Mui-disabled": { opacity: 0.5 },
});

type SummaryPage = { data: ApplicationSummaryItem[]; pagination: { currentPage: number; totalPages: number; totalCount: number } };

// ── Component ──────────────────────────────────────────────────────────────────
const ApplicationCardActions: React.FC<ApplicationCardActionsProps> = ({
  app, name, appId, postId, avatarUrl, bgColor,
  menuAnchorEl, menuOpen, onMenuOpen, onMenuClose,
  onContact, onAssessment, onInvite,
  invitedIds,
}) => {
  const { t } = useTranslation("dashboard");
  const router        = useRouter();
  const qc            = useQueryClient();
  const hasInterview  = !!app.completedAt;
  const isVisited     = app.status === "visited";
  const isInvited     = invitedIds ? invitedIds.has(appId) : false;
  const [decidingShortlist, setDecidingShortlist] = useState(false);
  const [decidingReject,    setDecidingReject]    = useState(false);
  const isShortlisted = app.recruiterDecision === "shortlisted";
  const isRejected    = app.recruiterDecision === "rejected";

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
    if (decision === "shortlisted") setDecidingShortlist(true);
    else setDecidingReject(true);

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
    const url  = `${process.env.NEXT_PUBLIC_API_BASE_URL}resume/${app.resumeFile}`;
    const link = document.createElement("a");
    link.href = url;
    link.download = app.resumeFile;
    link.target = "_blank";
    link.click();
  }, [app.resumeFile, onMenuClose]);

  // ── Render invite / contact button ─────────────────────────────────────────
  const renderActionButton = () => {
    if (isInvited) {
      return (
        <Box sx={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 0.6,
          height: 30, width: 108, flexShrink: 0,
          border: "1px solid #6EE7B7", borderRadius: "8px",
          bgcolor: "#ECFDF5", color: "#059669", cursor: "default",
        }}>
          <CheckOutlined sx={{ fontSize: 14 }} />
          <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "inherit", lineHeight: 1, whiteSpace: "nowrap" }}>
            Invited
          </Typography>
        </Box>
      );
    }

    if (isVisited) {
      return (
        <Box
          component="button"
          onClick={onInvite}
          sx={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 0.6,
            height: 30, width: 108, flexShrink: 0, outline: "none",
            border: "1px solid #DDD6FE", borderRadius: "8px",
            cursor: "pointer", bgcolor: "#F5F3FF", color: PURPLE,
            transition: "all 0.15s",
            "&:hover": { bgcolor: "#EDE9FE", borderColor: "#A78BFA" },
          }}
        >
          <VideoCallOutlined sx={{ fontSize: 14 }} />
          <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "inherit", lineHeight: 1, whiteSpace: "nowrap" }}>
            {t("pages.applications.actions.send_invite")}
          </Typography>
        </Box>
      );
    }

    return (
      <Box
        component="button"
        disabled={!app.email}
        onClick={() => { if (app.email) onContact(); }}
        sx={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 0.6,
          height: 30, width: 108, flexShrink: 0, outline: "none",
          border: "1px solid #BFDBFE", borderRadius: "8px",
          cursor: app.email ? "pointer" : "not-allowed",
          bgcolor: app.email ? "#EFF6FF" : "#F9FAFB",
          color: app.email ? "#2563EB" : "#9CA3AF",
          transition: "all 0.15s",
          opacity: app.email ? 1 : 0.55,
          "&:hover:not(:disabled)": { bgcolor: "#DBEAFE", borderColor: "#93C5FD" },
        }}
      >
        <EmailOutlined sx={{ fontSize: 14, color: "inherit" }} />
        <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "inherit", lineHeight: 1, whiteSpace: "nowrap" }}>
          {t("pages.applications.actions.contact")}
        </Typography>
      </Box>
    );
  };

  return (
    <>
      {/* Score circles */}
      <Box sx={{ display: "flex", gap: 2.5, flexShrink: 0 }}>
        <ScoreCircle value={app.matchScore}     label={t("pages.applications.actions.score_match")} />
        <ScoreCircle value={app.interviewScore} label={t("pages.applications.actions.score_interview")} />
      </Box>

      {/* Shortlist / Reject quick buttons */}
      <Box onClick={(e) => e.stopPropagation()} sx={{ display: "flex", gap: 0.75, flexShrink: 0 }}>
        <Box
          component="button"
          onClick={() => handleDecision("shortlisted")}
          disabled={decidingShortlist || decidingReject}
          title={isShortlisted ? "Shortlisted" : "Shortlist"}
          sx={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5,
            height: 28, px: 1.1, outline: "none", borderRadius: "7px", cursor: "pointer",
            border: `1px solid ${isShortlisted ? "#059669" : "#D1D5DB"}`,
            bgcolor: isShortlisted ? "#ECFDF5" : "#F9FAFB",
            color: isShortlisted ? "#059669" : "#6B7280",
            transition: "all 0.15s",
            "&:hover:not(:disabled)": { borderColor: "#059669", bgcolor: "#F0FDF4", color: "#059669" },
            "&:disabled": { opacity: 0.5, cursor: "not-allowed" },
          }}
        >
          {decidingShortlist
            ? <CircularProgress size={11} sx={{ color: "inherit" }} />
            : <StarOutlined sx={{ fontSize: 13 }} />}
          <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "inherit", lineHeight: 1 }}>
            {isShortlisted ? "Shortlisted" : "Shortlist"}
          </Typography>
        </Box>

        <Box
          component="button"
          onClick={() => handleDecision("rejected")}
          disabled={decidingShortlist || decidingReject}
          title={isRejected ? "Rejected" : "Reject"}
          sx={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5,
            height: 28, px: 1.1, outline: "none", borderRadius: "7px", cursor: "pointer",
            border: `1px solid ${isRejected ? "#DC2626" : "#D1D5DB"}`,
            bgcolor: isRejected ? "#FEF2F2" : "#F9FAFB",
            color: isRejected ? "#DC2626" : "#6B7280",
            transition: "all 0.15s",
            "&:hover:not(:disabled)": { borderColor: "#DC2626", bgcolor: "#FEF2F2", color: "#DC2626" },
            "&:disabled": { opacity: 0.5, cursor: "not-allowed" },
          }}
        >
          {decidingReject
            ? <CircularProgress size={11} sx={{ color: "inherit" }} />
            : <CancelOutlined sx={{ fontSize: 13 }} />}
          <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "inherit", lineHeight: 1 }}>
            {isRejected ? "Rejected" : "Reject"}
          </Typography>
        </Box>
      </Box>

      {/* Divider */}
      <Box sx={{ width: "1px", height: 40, bgcolor: "#F3F4F6", flexShrink: 0 }} />

      {/* Action button + more menu */}
      <Box onClick={(e) => e.stopPropagation()} sx={{ display: "flex", alignItems: "center", gap: 0.75, flexShrink: 0 }}>
        {renderActionButton()}
        <IconButton
          size="small"
          onClick={onMenuOpen}
          sx={{ flexShrink: 0, width: 30, height: 30, borderRadius: "8px", color: "#6B7280", "&:hover": { bgcolor: "#F3F4F6" } }}
        >
          <MoreVertOutlined sx={{ fontSize: 17 }} />
        </IconButton>
      </Box>

      {/* Dropdown menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={menuOpen}
        onClose={onMenuClose}
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
          <MenuItem
            onClick={() => { onMenuClose(); router.push(`/company/applications/${appId}`); }}
            sx={menuItemSx(TEAL)}
          >
            <ListItemIcon sx={{ minWidth: 30 }}>
              <Box sx={{ width: 26, height: 26, borderRadius: "7px", bgcolor: `${TEAL}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AccountCircleOutlined sx={{ fontSize: 14, color: TEAL }} />
              </Box>
            </ListItemIcon>
            <Box>
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827", lineHeight: 1.3 }}>{t("pages.applications.actions.menu.view_profile_title")}</Typography>
              <Typography sx={{ fontSize: "11px", color: "#9CA3AF", lineHeight: 1.2 }}>{t("pages.applications.actions.menu.view_profile_desc")}</Typography>
            </Box>
          </MenuItem>

          <MenuItem
            disabled={!hasInterview}
            onClick={() => { if (hasInterview) { onMenuClose(); onAssessment(); } }}
            sx={menuItemSx(PURPLE)}
          >
            <ListItemIcon sx={{ minWidth: 30 }}>
              <Box sx={{ width: 26, height: 26, borderRadius: "7px", bgcolor: hasInterview ? "#F5F3FF" : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AssessmentOutlined sx={{ fontSize: 14, color: hasInterview ? PURPLE : "#D1D5DB" }} />
              </Box>
            </ListItemIcon>
            <Box>
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: hasInterview ? "#111827" : "#9CA3AF", lineHeight: 1.3 }}>{t("pages.applications.actions.menu.view_results_title")}</Typography>
              <Typography sx={{ fontSize: "11px", color: "#9CA3AF", lineHeight: 1.2 }}>
                {hasInterview ? t("pages.applications.actions.menu.view_results_desc_done") : t("pages.applications.actions.menu.view_results_desc_pending")}
              </Typography>
            </Box>
          </MenuItem>

          <MenuItem
            disabled={!app.resumeFile}
            onClick={handleDownloadCV}
            sx={menuItemSx("#D97706")}
          >
            <ListItemIcon sx={{ minWidth: 30 }}>
              <Box sx={{ width: 26, height: 26, borderRadius: "7px", bgcolor: app.resumeFile ? "#FFFBEB" : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <DescriptionOutlined sx={{ fontSize: 14, color: app.resumeFile ? "#D97706" : "#D1D5DB" }} />
              </Box>
            </ListItemIcon>
            <Box>
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: app.resumeFile ? "#111827" : "#9CA3AF", lineHeight: 1.3 }}>{t("pages.applications.actions.menu.download_cv_title")}</Typography>
              <Typography sx={{ fontSize: "11px", color: "#9CA3AF", lineHeight: 1.2 }}>
                {app.resumeFile ? t("pages.applications.actions.menu.download_cv_desc_done") : t("pages.applications.actions.menu.download_cv_desc_none")}
              </Typography>
            </Box>
          </MenuItem>

          <Divider sx={{ my: 0.5, borderColor: "#F3F4F6" }} />

          <MenuItem
            disabled={!app.email}
            onClick={() => { onMenuClose(); if (app.email) onContact(); }}
            sx={menuItemSx("#2563EB")}
          >
            <ListItemIcon sx={{ minWidth: 30 }}>
              <Box sx={{ width: 26, height: 26, borderRadius: "7px", bgcolor: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <EmailOutlined sx={{ fontSize: 14, color: "#2563EB" }} />
              </Box>
            </ListItemIcon>
            <Box>
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827", lineHeight: 1.3 }}>{t("pages.applications.actions.menu.contact_title")}</Typography>
              <Typography sx={{ fontSize: "11px", color: "#9CA3AF", lineHeight: 1.2 }}>{app.email || t("pages.applications.actions.menu.contact_desc_none")}</Typography>
            </Box>
          </MenuItem>
        </Box>
      </Menu>
    </>
  );
};

export default ApplicationCardActions;
