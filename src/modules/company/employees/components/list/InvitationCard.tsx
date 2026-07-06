import React, { memo, useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Send, Trash2, Mail } from "lucide-react";
import { Invitation } from "@/modules/company/employees/types/employee";
import { ROLES } from "@/modules/shared/constants/employee";
import { ROLE_STYLES } from "./EmployeeCard";
import { getRoleLabel } from "@/modules/company/employees/utils/employeeRoleI18n";
import { useTranslation } from "react-i18next";
import { AMBER } from "./constants";
import { Spinner } from "@/modules/shared/ui/shadcn/spinner";
import { cn } from "@/lib/utils";

const RESEND_COOLDOWN_MS = 48 * 60 * 60 * 1000;

function formatRemaining(ms: number): string {
  const hours = Math.ceil(ms / (60 * 60 * 1000));
  if (hours >= 24) {
    const days = Math.ceil(hours / 24);
    return `${days}d`;
  }
  return `${hours}h`;
}

interface Props {
  invitation: Invitation;
  onResend: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
}

const InvitationCard: React.FC<Props> = memo(({ invitation, onResend, onCancel }) => {
  const { t, i18n } = useTranslation("dashboard");
  const [busy, setBusy] = useState(false);
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

  const cooldownRemainingMs = Math.max(0, lastResendAt + RESEND_COOLDOWN_MS - now);
  const canResend = cooldownRemainingMs <= 0;

  const roleEntry = useMemo(() =>
    ROLES.find((r) => r.value === invitation.role || r.value === invitation.role?.toLowerCase()),
  [invitation.role]);

  const roleStyle = useMemo(() =>
    roleEntry
      ? { color: roleEntry.color, bg: `${roleEntry.color}12` }
      : (ROLE_STYLES[invitation.role] ?? { color: AMBER, bg: "#FFFBEB" }),
  [roleEntry, invitation.role]);

  const roleLabel = useMemo(() => getRoleLabel(invitation.role, t), [invitation.role, t]);
  const RoleIcon = roleEntry?.icon ?? null;
  const letter = invitation.email[0]?.toUpperCase() ?? "?";

  const sentDate = useMemo(() =>
    invitation.createdAt
      ? new Date(invitation.createdAt).toLocaleDateString(
          i18n.language?.startsWith("fr") ? "fr-FR" : "en-US",
          { month: "short", day: "numeric" },
        )
      : null,
  [invitation.createdAt, i18n.language]);

  const handleResend = useCallback(async () => {
    if (busyRef.current || !canResend) return;
    busyRef.current = true;
    setBusy(true); setBusyAction("resend");
    try {
      await onResend(invitation._id);
      const ts = Date.now();
      window.localStorage.setItem(storageKey, String(ts));
      setLastResendAt(ts);
    } finally {
      setBusy(false); setBusyAction(null); busyRef.current = false;
    }
  }, [invitation._id, onResend, canResend, storageKey]);

  const handleCancel = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true); setBusyAction("cancel");
    try { await onCancel(invitation._id); } finally { setBusy(false); setBusyAction(null); busyRef.current = false; }
  }, [invitation._id, onCancel]);

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#EEF0F3] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 ease-out hover:-translate-y-[3px] hover:border-transparent hover:shadow-[0_20px_40px_-8px_rgba(15,23,42,0.16)]">

      {/* Top row: pending pill */}
      <div className="relative flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF9EC] px-2.5 py-[3px]">
          <span className="size-[6px] animate-pulse rounded-full bg-[#C9920A]" />
          <span className="text-[10.5px] font-bold text-[#A87000]">
            {t("pages.employees.invitation.pending")}
          </span>
        </div>
        {sentDate && (
          <span className="text-[10.5px] font-medium text-[#B0B7C3]">
            {t("pages.employees.invitation.sent", { date: sentDate })}
          </span>
        )}
      </div>

      {/* Centered avatar + identity */}
      <div className="relative mt-3 flex flex-col items-center text-center">
        <div
          className="flex size-14 items-center justify-center rounded-full text-lg font-extrabold text-white"
          style={{
            background: "linear-gradient(145deg, #F5D78A, #C9920A)",
            boxShadow: "0 6px 16px -6px rgba(201,146,10,0.5)",
          }}
        >
          {letter}
        </div>

        <p title={invitation.email} className="mt-2.5 flex max-w-full items-center gap-1.5 truncate text-[13.5px] font-bold leading-tight text-[#0F172A]">
          <Mail className="size-3 shrink-0 text-[#94A3B8]" />
          <span className="truncate">{invitation.email}</span>
        </p>
        <div className="mt-1 inline-flex max-w-full items-center gap-1.5">
          {RoleIcon && (
            <span className="flex shrink-0 items-center" style={{ color: roleStyle.color }}>
              <RoleIcon size={13} />
            </span>
          )}
          <span className="truncate text-[12px] font-semibold" style={{ color: roleStyle.color }}>
            {roleLabel}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="relative mt-3.5 flex gap-2 border-t border-[#F1F5F9] pt-3.5">
        <button
          onClick={!busy && canResend ? handleResend : undefined}
          disabled={busy || !canResend}
          title={!canResend ? t("pages.employees.invitation.resend_available_in", { time: formatRemaining(cooldownRemainingMs) }) : undefined}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2 transition-all duration-150",
            busyAction === "resend"
              ? "cursor-default border-[#C7D2FE] bg-[#EEF2FF]"
              : "border-[#E5E7EB] bg-[#F8FAFC]",
            !busy && canResend && "cursor-pointer hover:border-[#D1D5DB] hover:bg-[#F1F5F9]",
            (busy && busyAction !== "resend") || !canResend ? "cursor-default opacity-45" : "",
          )}
        >
          <Spinner
            className={cn(
              "size-3 transition-opacity duration-150",
              busyAction === "resend" ? "opacity-100 text-[#6366F1]" : "size-0 opacity-0",
            )}
          />
          {busyAction !== "resend" && <Send className="size-[13px] text-[#6B7280]" />}
          <span className={cn(
            "text-xs font-semibold transition-colors",
            busyAction === "resend" ? "text-[#6366F1]" : "text-[#374151]",
          )}>
            {busyAction === "resend"
              ? t("pages.employees.invitation.resending")
              : !canResend
                ? t("pages.employees.invitation.resend_available_in", { time: formatRemaining(cooldownRemainingMs) })
                : t("pages.employees.invitation.resend")}
          </span>
        </button>

        <button
          onClick={!busy ? handleCancel : undefined}
          disabled={busy && busyAction !== "cancel"}
          className={cn(
            "flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-red-100 bg-red-50 py-2 transition-all duration-150",
            !busy && "hover:border-red-200 hover:bg-red-100",
            busy && busyAction !== "cancel" && "cursor-default opacity-45",
          )}
        >
          {busy && busyAction === "cancel"
            ? <Spinner className="size-3 text-red-600" />
            : <Trash2 className="size-[13px] text-red-600" />
          }
          <span className="text-xs font-semibold text-red-600">
            {t("pages.employees.invitation.cancel")}
          </span>
        </button>
      </div>
    </div>
  );
});

InvitationCard.displayName = "InvitationCard";
export default InvitationCard;
