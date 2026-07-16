"use client";

import React, { memo, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { Briefcase } from "lucide-react";
import { ApplicationSummaryItem } from "@/modules/company/applications/types";
import { ContactTarget } from "./ContactCandidateModal";
import { InviteTarget } from "./InviteToInterviewModal";
import InviteToInterviewModal from "./InviteToInterviewModal";
import ApplicationCardActions from "./ApplicationCardActions";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/modules/shared/ui/shadcn/avatar";
import { Button } from "@/modules/shared/ui/shadcn/button";

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
  withdrawn:           { i18nKey: "pages.applications.status.withdrawn",           bg: "#F3F4F6", color: "#6B7280" },
};

const DECISION_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  shortlisted: { bg: "#F0FDF4", color: "#16A34A", label: "Shortlisted" },
  rejected:    { bg: "#FEF2F2", color: "#DC2626", label: "Rejected" },
  not_matched: { bg: "#F8FAFC", color: "#64748B", label: "Not Matched" },
};

// ─── Component ────────────────────────────────────────────────────────────────

export interface ApplicationCardProps {
  app: ApplicationSummaryItem;
  postId: string;
  showPostTitle?: boolean;
  onContact: (target: ContactTarget) => void;
  invitedIds?: Set<string>;
  onInviteSuccess?: (appId: string) => void;
}

const ApplicationCard = memo<ApplicationCardProps>(({
  app, postId, showPostTitle = false,
  onContact,
  invitedIds: externalInvitedIds, onInviteSuccess,
}) => {
  const { t }  = useTranslation("dashboard");
  const router = useRouter();

  const [menuOpen,     setMenuOpen]     = useState(false);
  const [menuAnchor,   setMenuAnchor]   = useState<HTMLElement | null>(null);
  const [inviteTarget, setInviteTarget] = useState<InviteTarget | null>(null);
  const [localInvited, setLocalInvited] = useState(false);
  const name      = useMemo(() => `${app.firstName ?? ""} ${app.lastName ?? ""}`.trim() || "Unknown", [app.firstName, app.lastName]);
  const bgColor   = useMemo(() => avatarColor(name), [name]);
  const avatarUrl = useMemo(() =>
    app.userImage ? `${process.env.NEXT_PUBLIC_API_BASE_URL}uploads/images/${app.userImage}` : undefined,
  [app.userImage]);

  const appId     = useMemo(() => String(app.id), [app.id]);
  const statusDef = useMemo(() => STATUS_STYLE[app.status] ?? STATUS_STYLE.visited, [app.status]);
  const isInvited = useMemo(() => externalInvitedIds ? externalInvitedIds.has(appId) : localInvited, [externalInvitedIds, appId, localInvited]);
  const invitedSet = useMemo(() => (isInvited ? new Set([appId]) : new Set<string>()), [isInvited, appId]);

  const hasInterview = !!app.completedAt;

  const handleInviteSuccess = useCallback(() => {
    if (!externalInvitedIds) setLocalInvited(true);
    onInviteSuccess?.(appId);
  }, [externalInvitedIds, onInviteSuccess, appId]);

  const handleContact = useCallback(() => {
    if (app.email) onContact({ name, email: app.email, candidateUserId: app.candidateUserId, avatarUrl, bgColor });
  }, [app.email, app.candidateUserId, name, avatarUrl, bgColor, onContact]);

  const handleAssessment = useCallback(() => {
    if (!app.candidateUserId) return;
    router.push(`/company/applications/${appId}/assessment`);
  }, [app.candidateUserId, appId, router]);

  const handleInvite = useCallback(
    () => setInviteTarget({ applicationId: appId, name, postTitle: app.postTitle || "", postId }),
    [appId, name, app.postTitle, postId],
  );

  const handleMenuOpen  = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuOpen(true);
  }, []);
  const handleMenuClose = useCallback(() => { setMenuOpen(false); setMenuAnchor(null); }, []);
  const closeInvite     = useCallback(() => setInviteTarget(null), []);

  const handleCardClick = useCallback(() => {
    if (!hasInterview) return;
    if (app.candidateUserId) handleAssessment();
  }, [hasInterview, app.candidateUserId, handleAssessment]);

  const handlePostClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (app.postId) router.push(`/company/posts/${app.postId}`);
  }, [app.postId, router]);

  const decisionStyle = app.recruiterDecision ? DECISION_STYLE[app.recruiterDecision] : null;

  return (
    <>
      <div
        onClick={handleCardClick}
        className={cn(
          "bg-white border border-slate-200 rounded-xl px-4 py-3.5 flex items-center gap-4 transition-all duration-150",
          hasInterview ? "cursor-pointer hover:shadow-[0_2px_12px_rgba(0,0,0,0.07)] hover:border-teal-500" : "hover:shadow-[0_2px_12px_rgba(0,0,0,0.07)] hover:border-teal-500",
        )}
      >
        {/* Avatar */}
        <Avatar className="w-10 h-10 rounded-full shrink-0">
          <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
          <AvatarFallback
            className="rounded-full text-white text-[13px] font-bold"
            style={{ backgroundColor: bgColor }}
          >
            {initials(app.firstName, app.lastName)}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[13px] font-bold text-slate-900 leading-snug">{name}</span>

            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
              style={{ backgroundColor: statusDef.bg, color: statusDef.color }}
            >
              {t(statusDef.i18nKey)}
            </span>

            {decisionStyle && (
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                style={{ backgroundColor: decisionStyle.bg, color: decisionStyle.color }}
              >
                {decisionStyle.label}
              </span>
            )}

            {showPostTitle && app.postTitle && (
              <Button
                variant="ghost"
                onClick={handlePostClick}
                className="h-auto gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                style={{ backgroundColor: "#F0FDFA", color: "#0D9488" }}
              >
                <Briefcase size={10} />
                {app.postTitle}
              </Button>
            )}
          </div>

          <div className="text-[11px] text-slate-500 mt-0.5 truncate">{app.email || "—"}</div>

          {app.appliedAt && (
            <div className="text-[10px] text-slate-400 mt-0.5">
              {t("pages.applications.card.applied_date", { date: fmtDate(app.appliedAt) })}
              {app.completedAt && t("pages.applications.card.completed_date", { date: fmtDate(app.completedAt) })}
            </div>
          )}
        </div>

        <ApplicationCardActions
          app={app} name={name} appId={appId}
          menuAnchorEl={menuAnchor} menuOpen={menuOpen}
          onMenuOpen={handleMenuOpen} onMenuClose={handleMenuClose}
          onContact={handleContact} onAssessment={handleAssessment} onInvite={handleInvite}
          invitedIds={invitedSet}
        />
      </div>

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
