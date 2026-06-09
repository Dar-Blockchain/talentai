"use client";

import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { Avatar, Box, Chip, Paper, Typography } from "@mui/material";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutline";
import { ApplicationSummaryItem } from "@/store/slices/jobApplicationSlice";
import { ContactTarget } from "@/modules/posts/details/components/ContactCandidateModal";
import { AssessmentTarget } from "@/modules/company/assessment/modal";
import { InviteTarget } from "./InviteToInterviewModal";
import InviteToInterviewModal from "./InviteToInterviewModal";
import ApplicationCardActions from "./ApplicationCardActions";

const TEAL = "#0D9488";

export const STATUS_STYLE: Record<string, { i18nKey: string; bg: string; color: string }> = {
  visited:             { i18nKey: "pages.applications.status.visited",             bg: "#EFF6FF", color: "#2563EB" },
  interview_completed: { i18nKey: "pages.applications.status.interview_completed", bg: "#D1FAE5", color: "#059669" },
};

const AVATAR_COLORS = ["#0D9488", "#3B82F6", "#8B5CF6", "#F59E0B", "#EC4899", "#10B981", "#EF4444"];

export function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

export function fmtDate(iso: string | null | undefined) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function initials(first?: string | null, last?: string | null) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?";
}

export interface ApplicationCardProps {
  app: ApplicationSummaryItem;
  postId: string;
  showPostTitle?: boolean;
  onContact: (target: ContactTarget) => void;
  onAssessment: (target: AssessmentTarget) => void;
  /**
   * If provided, the parent owns invited state (survives list re-fetches).
   * onInviteSuccess receives the applicationId so the parent can add it to its Set.
   */
  invitedIds?: Set<string>;
  onInviteSuccess?: (appId: string) => void;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({
  app,
  postId,
  showPostTitle = false,
  onContact,
  onAssessment,
  invitedIds: externalInvitedIds,
  onInviteSuccess,
}) => {
  const { t } = useTranslation("dashboard");
  const router = useRouter();

  const [menuAnchor,   setMenuAnchor]   = useState<HTMLElement | null>(null);
  const [inviteTarget, setInviteTarget] = useState<InviteTarget | null>(null);
  // Local fallback invited state (used when no external Set is provided)
  const [localInvited, setLocalInvited] = useState(false);

  const name      = `${app.firstName ?? ""} ${app.lastName ?? ""}`.trim() || "Unknown";
  const bgColor   = avatarColor(name);
  const avatarUrl = app.userImage
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Users/${app.userImage}`
    : undefined;
  const appId     = String(app.id);
  const statusDef = STATUS_STYLE[app.status] ?? STATUS_STYLE.visited;

  // Resolve whether this card is invited from the external Set (page-level) or local state
  const isInvited = externalInvitedIds ? externalInvitedIds.has(appId) : localInvited;

  const handleInviteSuccess = useCallback(() => {
    if (externalInvitedIds !== undefined) {
      // Parent owns the state — notify it
      onInviteSuccess?.(appId);
    } else {
      // No parent Set — fall back to local state
      setLocalInvited(true);
      onInviteSuccess?.(appId);
    }
  }, [externalInvitedIds, onInviteSuccess, appId]);

  // Build Set for ApplicationCardActions
  const invitedSet: Set<string> = isInvited ? new Set([appId]) : new Set();

  return (
    <>
      <Paper
        elevation={0}
        onClick={() => router.push(`/company/applications/${appId}`)}
        sx={{
          border: "1px solid #E5E7EB", borderRadius: "12px",
          p: "14px 16px", display: "flex", alignItems: "center", gap: 2,
          transition: "box-shadow 0.15s, border-color 0.15s",
          cursor: "pointer",
          "&:hover": { boxShadow: "0 2px 12px rgba(0,0,0,0.07)", borderColor: TEAL },
        }}
      >
        {/* Avatar */}
        <Avatar
          src={avatarUrl}
          sx={{ width: 40, height: 40, bgcolor: bgColor, fontSize: 13, fontWeight: 700, flexShrink: 0 }}
        >
          {initials(app.firstName, app.lastName)}
        </Avatar>

        {/* Name + chips + email + date */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Typography
              sx={{ fontSize: "13px", fontWeight: 700, color: "#111827", lineHeight: 1.3 }}
            >
              {name}
            </Typography>
            <Chip
              label={t(statusDef.i18nKey)}
              size="small"
              sx={{ bgcolor: statusDef.bg, color: statusDef.color, fontWeight: 600, fontSize: "10px", height: 18, borderRadius: "4px" }}
            />
            {app.recruiterDecision && (
              <Chip
                label={app.recruiterDecision === "shortlisted" ? "Shortlisted" : "Rejected"}
                size="small"
                sx={{
                  bgcolor: app.recruiterDecision === "shortlisted" ? "#F0FDF4" : "#FEF2F2",
                  color:   app.recruiterDecision === "shortlisted" ? "#16A34A" : "#DC2626",
                  fontWeight: 600, fontSize: "10px", height: 18, borderRadius: "4px",
                }}
              />
            )}
            {showPostTitle && app.postTitle && (
              <Chip
                label={app.postTitle}
                size="small"
                icon={<WorkOutlineOutlined style={{ fontSize: 10 }} />}
                onClick={(e) => { e.stopPropagation(); if (app.postId) router.push(`/company/posts/${app.postId}`); }}
                sx={{
                  bgcolor: `${TEAL}0F`, color: TEAL, fontWeight: 600, fontSize: "10px",
                  height: 18, borderRadius: "4px",
                  cursor: app.postId ? "pointer" : "default",
                  "& .MuiChip-icon": { color: `${TEAL} !important` },
                }}
              />
            )}
          </Box>

          <Typography sx={{ fontSize: "11px", color: "#6B7280", mt: 0.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {app.email || "—"}
          </Typography>

          {app.appliedAt && (
            <Typography sx={{ fontSize: "10px", color: "#9CA3AF", mt: 0.15 }}>
              {t("pages.applications.card.applied_date", { date: fmtDate(app.appliedAt) })}
              {app.completedAt && t("pages.applications.card.completed_date", { date: fmtDate(app.completedAt) })}
            </Typography>
          )}
        </Box>

        <ApplicationCardActions
          app={app}
          name={name}
          appId={appId}
          postId={postId}
          avatarUrl={avatarUrl}
          bgColor={bgColor}
          menuAnchorEl={menuAnchor}
          menuOpen={Boolean(menuAnchor)}
          onMenuOpen={(e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); }}
          onMenuClose={() => setMenuAnchor(null)}
          onContact={() => {
            if (app.email) onContact({ name, email: app.email, candidateUserId: app.candidateUserId, avatarUrl, bgColor });
          }}
          onAssessment={() => {
            if (app.candidateUserId) onAssessment({
              applicationId: appId,
              postId,
              candidateUserId: app.candidateUserId,
              candidateName: name,
              candidateEmail: app.email || "",
              avatarUrl,
              bgColor,
            });
          }}
          onInvite={() => setInviteTarget({ applicationId: appId, name, postTitle: app.postTitle || "", postId })}
          invitedIds={invitedSet}
        />
      </Paper>

      <InviteToInterviewModal
        open={!!inviteTarget}
        target={inviteTarget}
        onClose={() => setInviteTarget(null)}
        onSuccess={handleInviteSuccess}
      />
    </>
  );
};

export default ApplicationCard;
