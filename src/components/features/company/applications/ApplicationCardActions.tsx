"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import {
  Box, Divider, IconButton, ListItemIcon, Menu, MenuItem, Typography,
} from "@mui/material";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import AccountCircleOutlined from "@mui/icons-material/AccountCircleOutlined";
import AssessmentOutlined from "@mui/icons-material/AssessmentOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import VideoCallOutlined from "@mui/icons-material/VideoCallOutlined";
import MoreVertOutlined from "@mui/icons-material/MoreVert";
import { useRouter } from "next/router";
import { ApplicationSummaryItem } from "@/store/slices/jobApplicationSlice";

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
}

// ── menuItemSx helper ──────────────────────────────────────────────────────────
const menuItemSx = (color: string) => ({
  gap: 1, py: 0.875, px: 1.5, mx: 0.5, borderRadius: "8px", alignItems: "flex-start",
  "&:hover": { bgcolor: `${color}0D` },
  "&.Mui-disabled": { opacity: 0.5 },
});

// ── Component ──────────────────────────────────────────────────────────────────
const ApplicationCardActions: React.FC<ApplicationCardActionsProps> = ({
  app, name, appId, postId, avatarUrl, bgColor,
  menuAnchorEl, menuOpen, onMenuOpen, onMenuClose,
  onContact, onAssessment, onInvite,
}) => {
  const { t } = useTranslation("dashboard");
  const router       = useRouter();
  const hasInterview = !!app.completedAt;
  const isVisited    = app.status === "visited";

  const handleDownloadCV = () => {
    if (!app.resumeFile) return;
    onMenuClose();
    const url  = `${process.env.NEXT_PUBLIC_API_BASE_URL}resume/${app.resumeFile}`;
    const link = document.createElement("a");
    link.href = url;
    link.download = app.resumeFile;
    link.target = "_blank";
    link.click();
  };

  return (
    <>
      {/* Score circles */}
      <Box sx={{ display: "flex", gap: 2.5, flexShrink: 0 }}>
        <ScoreCircle value={app.matchScore}     label={t("pages.applications.actions.score_match")} />
        <ScoreCircle value={app.interviewScore} label={t("pages.applications.actions.score_interview")} />
      </Box>

      {/* Divider */}
      <Box sx={{ width: "1px", height: 40, bgcolor: "#F3F4F6", flexShrink: 0 }} />

      {/* Action button: Send Invite (visited) OR Contact (others) */}
      {isVisited ? (
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
      ) : (
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
      )}

      {/* More menu button */}
      <IconButton
        size="small"
        onClick={onMenuOpen}
        sx={{ flexShrink: 0, width: 30, height: 30, borderRadius: "8px", color: "#6B7280", "&:hover": { bgcolor: "#F3F4F6" } }}
      >
        <MoreVertOutlined sx={{ fontSize: 17 }} />
      </IconButton>

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
          {/* 1 — View Profile */}
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

          {/* 2 — View Results */}
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

          {/* 3 — Download CV */}
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

          {/* 4 — Contact Candidate */}
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
