"use client";

import React, { memo, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { Avatar, Box, Chip, Paper, Typography } from "@mui/material";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutline";
import { ApplicationSummaryItem } from "@/store/slices/jobApplicationSlice";
import { ContactTarget } from "@/modules/company/posts/details/components/ContactCandidateModal";
import { AssessmentTarget } from "@/modules/company/assessment/modal";
import { InviteTarget } from "./InviteToInterviewModal";
import InviteToInterviewModal from "./InviteToInterviewModal";
import ApplicationCardActions from "./ApplicationCardActions";

// ─── Static constants ─────────────────────────────────────────────────────────

const TEAL = "#0D9488";

const PAPER_BASE_SX = {
  border: "1px solid #E5E7EB", borderRadius: "12px",
  p: "14px 16px", display: "flex", alignItems: "center", gap: 2,
  transition: "box-shadow 0.15s, border-color 0.15s",
} as const;

const PAPER_CLICKABLE_SX = {
  ...PAPER_BASE_SX,
  cursor: "pointer",
  "&:hover": { boxShadow: "0 2px 12px rgba(0,0,0,0.07)", borderColor: TEAL },
} as const;

const PAPER_SX = {
  ...PAPER_BASE_SX,
  "&:hover": { boxShadow: "0 2px 12px rgba(0,0,0,0.07)", borderColor: TEAL },
} as const;

const NAME_ROW_SX   = { display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" } as const;
const FLEX1_SX      = { flex: 1, minWidth: 0 } as const;
const EMAIL_SX      = { fontSize: "11px", color: "#6B7280", mt: 0.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } as const;
const DATE_SX       = { fontSize: "10px", color: "#9CA3AF", mt: 0.15 } as const;
const NAME_TEXT_SX  = { fontSize: "13px", fontWeight: 700, color: "#111827", lineHeight: 1.3 } as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

export const STATUS_STYLE: Record<string, { i18nKey: string; bg: string; color: string }> = {
  visited:             { i18nKey: "pages.applications.status.visited",             bg: "#EFF6FF", color: "#2563EB" },
  interview_completed: { i18nKey: "pages.applications.status.interview_completed", bg: "#D1FAE5", color: "#059669" },
};

// ─── Component ────────────────────────────────────────────────────────────────

export interface ApplicationCardProps {
  app: ApplicationSummaryItem;
  postId: string;
  showPostTitle?: boolean;
  onContact: (target: ContactTarget) => void;
  onAssessment: (target: AssessmentTarget) => void;
  invitedIds?: Set<string>;
  onInviteSuccess?: (appId: string) => void;
}

const ApplicationCard = memo<ApplicationCardProps>(({
  app, postId, showPostTitle = false,
  onContact, onAssessment,
  invitedIds: externalInvitedIds, onInviteSuccess,
}) => {
  const { t }  = useTranslation("dashboard");
  const router = useRouter();

  const [menuAnchor,   setMenuAnchor]   = useState<HTMLElement | null>(null);
  const [inviteTarget, setInviteTarget] = useState<InviteTarget | null>(null);
  const [localInvited, setLocalInvited] = useState(false);

  const name      = useMemo(() => `${app.firstName ?? ""} ${app.lastName ?? ""}`.trim() || "Unknown", [app.firstName, app.lastName]);
  const bgColor   = useMemo(() => avatarColor(name), [name]);
  const avatarUrl = useMemo(() =>
    app.userImage ? `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Users/${app.userImage}` : undefined,
  [app.userImage]);

  const appId     = useMemo(() => String(app.id), [app.id]);
  const statusDef = useMemo(() => STATUS_STYLE[app.status] ?? STATUS_STYLE.visited, [app.status]);
  const isInvited = useMemo(() => externalInvitedIds ? externalInvitedIds.has(appId) : localInvited, [externalInvitedIds, appId, localInvited]);
  const invitedSet = useMemo(() => (isInvited ? new Set([appId]) : new Set<string>()), [isInvited, appId]);

  const decisionChipSx = useMemo(() => ({
    bgcolor: app.recruiterDecision === "shortlisted" ? "#F0FDF4" : "#FEF2F2",
    color:   app.recruiterDecision === "shortlisted" ? "#16A34A" : "#DC2626",
    fontWeight: 600, fontSize: "10px", height: 18, borderRadius: "4px",
  }), [app.recruiterDecision]);

  const postChipSx = useMemo(() => ({
    bgcolor: `${TEAL}0F`, color: TEAL, fontWeight: 600, fontSize: "10px",
    height: 18, borderRadius: "4px",
    cursor: app.postId ? "pointer" : "default",
    "& .MuiChip-icon": { color: `${TEAL} !important` },
  }), [app.postId]);

  const handleInviteSuccess = useCallback(() => {
    if (!externalInvitedIds) setLocalInvited(true);
    onInviteSuccess?.(appId);
  }, [externalInvitedIds, onInviteSuccess, appId]);

  const handleContact = useCallback(() => {
    if (app.email) onContact({ name, email: app.email, candidateUserId: app.candidateUserId, avatarUrl, bgColor });
  }, [app.email, app.candidateUserId, name, avatarUrl, bgColor, onContact]);

  const handleAssessment = useCallback(() => {
    if (app.candidateUserId) onAssessment({
      applicationId: appId, postId,
      candidateUserId: app.candidateUserId,
      candidateName: name, candidateEmail: app.email || "",
      avatarUrl, bgColor,
    });
  }, [app.candidateUserId, app.email, appId, postId, name, avatarUrl, bgColor, onAssessment]);

  const handleInvite = useCallback(
    () => setInviteTarget({ applicationId: appId, name, postTitle: app.postTitle || "", postId }),
    [appId, name, app.postTitle, postId],
  );

  const handleMenuOpen  = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  }, []);
  const handleMenuClose = useCallback(() => setMenuAnchor(null), []);
  const closeInvite     = useCallback(() => setInviteTarget(null), []);

  const hasInterview = !!app.completedAt;

  const handleCardClick = useCallback(() => {
    if (!hasInterview) return;
    if (app.candidateUserId) handleAssessment();
  }, [hasInterview, app.candidateUserId, handleAssessment]);

  const handlePostClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (app.postId) router.push(`/company/posts/${app.postId}`);
  }, [app.postId, router]);

  return (
    <>
      <Paper elevation={0} sx={hasInterview ? PAPER_CLICKABLE_SX : PAPER_SX} onClick={handleCardClick}>
        <Avatar
          src={avatarUrl}
          sx={{ width: 40, height: 40, bgcolor: bgColor, fontSize: 13, fontWeight: 700, flexShrink: 0 }}
        >
          {initials(app.firstName, app.lastName)}
        </Avatar>

        <Box sx={FLEX1_SX}>
          <Box sx={NAME_ROW_SX}>
            <Typography sx={NAME_TEXT_SX}>{name}</Typography>
            <Chip
              label={t(statusDef.i18nKey)} size="small"
              sx={{ bgcolor: statusDef.bg, color: statusDef.color, fontWeight: 600, fontSize: "10px", height: 18, borderRadius: "4px" }}
            />
            {app.recruiterDecision && (
              <Chip
                label={app.recruiterDecision === "shortlisted" ? "Shortlisted" : "Rejected"} size="small"
                sx={decisionChipSx}
              />
            )}
            {showPostTitle && app.postTitle && (
              <Chip
                label={app.postTitle} size="small"
                icon={<WorkOutlineOutlined style={{ fontSize: 10 }} />}
                onClick={handlePostClick}
                sx={postChipSx}
              />
            )}
          </Box>

          <Typography sx={EMAIL_SX}>{app.email || "—"}</Typography>

          {app.appliedAt && (
            <Typography sx={DATE_SX}>
              {t("pages.applications.card.applied_date", { date: fmtDate(app.appliedAt) })}
              {app.completedAt && t("pages.applications.card.completed_date", { date: fmtDate(app.completedAt) })}
            </Typography>
          )}
        </Box>

        <ApplicationCardActions
          app={app} name={name} appId={appId}
          menuAnchorEl={menuAnchor} menuOpen={Boolean(menuAnchor)}
          onMenuOpen={handleMenuOpen} onMenuClose={handleMenuClose}
          onContact={handleContact} onAssessment={handleAssessment} onInvite={handleInvite}
          invitedIds={invitedSet}
        />
      </Paper>

      <InviteToInterviewModal
        open={!!inviteTarget}
        target={inviteTarget}
        onClose={closeInvite}
        onSuccess={handleInviteSuccess}
      />
    </>
  );
});
ApplicationCard.displayName = "ApplicationCard";

export default ApplicationCard;
