"use client";
import React, { memo, useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { Send, Trash2 } from "lucide-react";
import { KpiCard } from "../KpiAtoms";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Spinner } from "@/modules/shared/ui/shadcn/spinner";
import { ROLES } from "@/modules/shared/constants/employee";
import { getRoleLabel } from "@/modules/company/employees/utils/employeeRoleI18n";
import { useInvitationsQuery, useResendInvitationMutation, useCancelInvitationMutation } from "@/modules/company/employees/queries";
import type { Invitation } from "@/modules/company/employees/types/employee";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

const MAX_SHOWN = 6;
const RESEND_COOLDOWN_MS = 48 * 60 * 60 * 1000;
const FALLBACK_COLOR = "#D97706";

function formatRemaining(ms: number): string {
  const hours = Math.ceil(ms / (60 * 60 * 1000));
  return hours >= 24 ? `${Math.ceil(hours / 24)}d` : `${hours}h`;
}

// Invitations auto-expire server-side (TTL index, ~2 days after creation) —
// surface how much runway is left so a stale invite doesn't silently vanish
// without anyone noticing.
type Urgency = { kind: "expired" | "hours" | "days"; count: number; color: string; bg: string };

function expiryUrgency(expiresAt: string | undefined, now: number): Urgency | null {
  if (!expiresAt) return null;
  const msLeft = new Date(expiresAt).getTime() - now;
  if (msLeft <= 0) return { kind: "expired", count: 0, color: "#EF4444", bg: "#FEF2F2" };
  const hoursLeft = msLeft / (60 * 60 * 1000);
  if (hoursLeft <= 6)  return { kind: "hours", count: Math.ceil(hoursLeft), color: "#EF4444", bg: "#FEF2F2" };
  if (hoursLeft <= 24) return { kind: "hours", count: Math.ceil(hoursLeft), color: "#F59E0B", bg: "#FFFBEB" };
  return { kind: "days", count: Math.ceil(hoursLeft / 24), color: "#64748B", bg: "#F8FAFC" };
}

interface RowProps {
  invitation: Invitation;
  onResend: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
}

const InvitationRow = memo<RowProps>(({ invitation, onResend, onCancel }) => {
  const { t, i18n } = useTranslation("dashboard");
  const router = useRouter();
  const [busyAction, setBusyAction] = useState<"resend" | "cancel" | null>(null);
  const busyRef = useRef(false);
  const storageKey = `invite_last_resend_${invitation._id}`;

  const [lastResendAt, setLastResendAt] = useState<number>(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null;
    if (stored) return Number(stored);
    return invitation.createdAt ? new Date(invitation.createdAt).getTime() : 0;
  });
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  const cooldownMs = Math.max(0, lastResendAt + RESEND_COOLDOWN_MS - now);
  const canResend = cooldownMs <= 0;

  const roleEntry = useMemo(
    () => ROLES.find((r) => r.value === invitation.role || r.value === invitation.role?.toLowerCase()),
    [invitation.role],
  );
  const roleColor = roleEntry?.color ?? FALLBACK_COLOR;
  const roleLabel = useMemo(() => getRoleLabel(invitation.role, t), [invitation.role, t]);
  const letter = invitation.email[0]?.toUpperCase() ?? "?";

  const sentLabel = useMemo(() =>
    invitation.createdAt
      ? new Date(invitation.createdAt).toLocaleDateString(
          i18n.language?.startsWith("fr") ? "fr-FR" : "en-US",
          { month: "short", day: "numeric" },
        )
      : null,
  [invitation.createdAt, i18n.language]);

  const urgency = useMemo(() => expiryUrgency(invitation.expiresAt, now), [invitation.expiresAt, now]);

  const handleResend = useCallback(async () => {
    if (busyRef.current || !canResend) return;
    busyRef.current = true; setBusyAction("resend");
    try {
      await onResend(invitation._id);
      const ts = Date.now();
      window.localStorage.setItem(storageKey, String(ts));
      setLastResendAt(ts);
    } finally { setBusyAction(null); busyRef.current = false; }
  }, [invitation._id, onResend, canResend, storageKey]);

  const handleCancel = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true; setBusyAction("cancel");
    try { await onCancel(invitation._id); } finally { setBusyAction(null); busyRef.current = false; }
  }, [invitation._id, onCancel]);

  const busy = busyAction !== null;

  // Pending invitees have no employee/member record yet — there's no
  // per-person detail page to deep-link to until they accept, so the row
  // opens the Employees page (where this invite is listed and manageable).
  const handleRowClick = useCallback(() => {
    router.push("/company/employees?tab=invitations");
  }, [router]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleRowClick}
      onKeyDown={(e) => e.key === "Enter" && handleRowClick()}
      className="group flex items-center gap-2 p-2 rounded-lg border border-slate-100 bg-white cursor-pointer transition-all duration-150 hover:border-slate-200 hover:shadow-[0_2px_8px_-4px_rgba(15,23,42,0.10)]"
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
        style={{ background: roleColor }}
      >
        {letter}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-[11.5px] font-semibold text-slate-700 truncate" title={invitation.email}>
          {invitation.email}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] font-bold" style={{ color: roleColor }}>{roleLabel}</span>
          {sentLabel && (
            <>
              <span className="text-[10px] text-slate-300">·</span>
              <span className="text-[10px] text-slate-400">{t("pages.employees.invitation.sent", { date: sentLabel })}</span>
            </>
          )}
        </div>
      </div>

      {urgency && (
        <span
          className="shrink-0 text-[10px] font-semibold px-1 py-[0.5px] rounded border whitespace-nowrap"
          style={{ color: urgency.color, background: urgency.bg, borderColor: `${urgency.color}33` }}
        >
          {urgency.kind === "expired"
            ? t("team.pending_invitations.expired", "Expired")
            : urgency.kind === "hours"
              ? t("team.pending_invitations.expires_hours", "{{count}}h left", { count: urgency.count })
              : t("team.pending_invitations.expires_days", "{{count}}d left", { count: urgency.count })}
        </span>
      )}

      <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost" size="icon-xs"
          onClick={!busy && canResend ? handleResend : undefined}
          disabled={busy || !canResend}
          title={!canResend
            ? t("pages.employees.invitation.resend_available_in", { time: formatRemaining(cooldownMs) })
            : t("pages.employees.invitation.resend")}
          className={cn("rounded-md text-slate-400", !busy && canResend && "hover:text-indigo-600 hover:bg-indigo-50")}
        >
          {busyAction === "resend" ? <Spinner className="size-3 text-indigo-600" /> : <Send size={12} />}
        </Button>
        <Button
          variant="ghost" size="icon-xs"
          onClick={!busy ? handleCancel : undefined}
          disabled={busy && busyAction !== "cancel"}
          title={t("pages.employees.invitation.cancel")}
          className="rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50"
        >
          {busyAction === "cancel" ? <Spinner className="size-3 text-red-600" /> : <Trash2 size={12} />}
        </Button>
      </div>
    </div>
  );
});
InvitationRow.displayName = "InvitationRow";

const PendingInvitations = memo(() => {
  const { t } = useTranslation("dashboard");
  const router = useRouter();
  const { showToast } = useToast();
  const { data, isLoading } = useInvitationsQuery();
  const resendMut = useResendInvitationMutation();
  const cancelMut = useCancelInvitationMutation();

  const pending = useMemo(
    () => ((data as Invitation[] | undefined) ?? [])
      .filter((inv) => inv.status === "pending")
      .sort((a, b) => {
        const aTime = a.expiresAt ? new Date(a.expiresAt).getTime() : Infinity;
        const bTime = b.expiresAt ? new Date(b.expiresAt).getTime() : Infinity;
        return aTime - bTime;
      }),
    [data],
  );

  const handleResend = useCallback(async (id: string) => {
    resendMut.mutate(id, {
      onSuccess: () => showToast({ message: t("pages.employees.resend_success"), severity: "success" }),
      onError:   () => showToast({ message: t("pages.employees.resend_error"),   severity: "error" }),
    });
  }, [resendMut, showToast, t]);

  const handleCancel = useCallback(async (id: string) => {
    cancelMut.mutate(id, {
      onSuccess: () => showToast({ message: t("pages.employees.cancel_success"), severity: "success" }),
      onError:   () => showToast({ message: t("pages.employees.cancel_error"),   severity: "error" }),
    });
  }, [cancelMut, showToast, t]);

  return (
    <KpiCard
      title={t("team.pending_invitations.title", "Pending Invitations")}
      subtitle={t("team.pending_invitations.subtitle", "Invites not yet accepted")}
      headerFilter={!isLoading && pending.length > 0 && (
        <Button
          variant="ghost" size="xs"
          onClick={() => router.push("/company/employees?tab=invitations")}
          className="text-[11px] font-semibold text-amber-600 hover:text-amber-700"
        >
          {t("team.pending_invitations.show_all", "Show all ({{count}})", { count: pending.length })}
        </Button>
      )}
    >
      {isLoading ? (
        <div className="space-y-1.5">
          {[1, 2, 3].map((k) => <Skeleton key={k} className="h-9 w-full rounded-lg" />)}
        </div>
      ) : pending.length === 0 ? (
        <div className="h-[120px] flex items-center justify-center">
          <span className="text-[0.82rem] text-slate-400">{t("team.pending_invitations.empty", "No pending invitations")}</span>
        </div>
      ) : (
        <div className="space-y-1.5">
          {pending.slice(0, MAX_SHOWN).map((inv) => (
            <InvitationRow key={inv._id} invitation={inv} onResend={handleResend} onCancel={handleCancel} />
          ))}
        </div>
      )}
    </KpiCard>
  );
});
PendingInvitations.displayName = "PendingInvitations";
export default PendingInvitations;
