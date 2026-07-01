import React, { memo, useState, useCallback, useMemo } from "react";
import { Send, Trash2 } from "lucide-react";
import { Invitation } from "@/modules/company/employees/types/employee";
import { ROLES } from "@/modules/shared/constants/employee";
import { ROLE_STYLES } from "./EmployeeCard";
import { getRoleLabel } from "@/modules/company/employees/utils/employeeRoleI18n";
import { useTranslation } from "react-i18next";
import { AMBER } from "./constants";
import { Spinner } from "@/modules/shared/ui/shadcn/spinner";
import { cn } from "@/lib/utils";

interface Props {
  invitation: Invitation;
  onResend: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
}

const InvitationCard: React.FC<Props> = memo(({ invitation, onResend, onCancel }) => {
  const { t, i18n } = useTranslation("dashboard");
  const [busy, setBusy] = useState(false);
  const [busyAction, setBusyAction] = useState<"resend" | "cancel" | null>(null);

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
    setBusy(true); setBusyAction("resend");
    try { await onResend(invitation._id); } finally { setBusy(false); setBusyAction(null); }
  }, [invitation._id, onResend]);

  const handleCancel = useCallback(async () => {
    setBusy(true); setBusyAction("cancel");
    try { await onCancel(invitation._id); } finally { setBusy(false); setBusyAction(null); }
  }, [invitation._id, onCancel]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[18px] border border-[#EBEBEB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-[220ms] hover:-translate-y-[3px] hover:border-[#D8D8DC] hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)]">

      {/* Header */}
      <div className="relative flex flex-col items-center gap-1.5 rounded-t-[18px] border-b border-[#EBEBEB] bg-[#F7F7F8] px-2.5 pt-[14px] pb-5">
        {/* Pending badge */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full border border-[#F5E5A8] bg-[#FEF9EC] px-2 py-[3px]">
          <span className="size-[5px] animate-pulse rounded-full bg-[#C9920A]" />
          <span className="text-[10px] font-bold tracking-[0.03em] text-[#A87000]">
            {t("pages.employees.invitation.pending")}
          </span>
        </div>

        {/* Avatar */}
        <div className="relative mt-4">
          <div
            className="flex size-16 items-center justify-center rounded-full text-[1.35rem] font-extrabold text-white shadow-[0_4px_14px_rgba(0,0,0,0.10)]"
            style={{ background: "linear-gradient(145deg, #F5D78A, #C9920A)" }}
          >
            {letter}
          </div>
          <div className="absolute right-0.5 bottom-0.5 size-3 rounded-full border-[2.5px] border-[#F7F7F8] bg-[#FEF9EC]" />
        </div>

        {/* Email */}
        <div className="w-full px-0.5 text-center">
          <p className="truncate text-sm font-bold leading-[1.35] text-[#1A1A2E]">{invitation.email}</p>
          {sentDate && (
            <p className="mt-[3px] text-xs tracking-[0.01em] text-[#B0B7C3]">
              {t("pages.employees.invitation.sent", { date: sentDate })}
            </p>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-4 px-2.5 pt-4 pb-5">
        {/* Role */}
        <div className="flex flex-col gap-[3px] rounded-xl border border-[#EBEBEB] bg-[#F7F7F8] px-3 py-[10px]">
          <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#B0B7C3]">
            {t("pages.employees.invitation.invited_as")}
          </span>
          <div className="flex items-center gap-1">
            {RoleIcon && (
              <span className="flex items-center" style={{ color: roleStyle.color }}>
                <RoleIcon style={{ fontSize: 12 }} />
              </span>
            )}
            <span className="text-[12.5px] font-bold text-[#374151]">{roleLabel}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto flex gap-2 border-t border-[#F3F4F6] pt-[14px]">
          <button
            onClick={!busy ? handleResend : undefined}
            disabled={busy}
            className={cn(
              "flex flex-1 items-center justify-center gap-[5px] rounded-[10px] border py-[7px] transition-all duration-150",
              busyAction === "resend"
                ? "cursor-default border-[#C7D2FE] bg-[#EEF2FF]"
                : "border-[#E5E7EB] bg-[#F3F4F6]",
              !busy && "cursor-pointer hover:border-[#D1D5DB] hover:bg-[#EAECF0]",
              busy && busyAction !== "resend" && "opacity-45 cursor-default",
            )}
          >
            <Spinner
              className={cn(
                "size-3 transition-opacity duration-150",
                busyAction === "resend" ? "opacity-100 text-[#6366F1]" : "opacity-0 size-0",
              )}
            />
            {busyAction !== "resend" && <Send className="size-[13px] text-[#6B7280]" />}
            <span className={cn(
              "text-xs font-semibold transition-colors",
              busyAction === "resend" ? "text-[#6366F1]" : "text-[#374151]",
            )}>
              {busyAction === "resend"
                ? t("pages.employees.invitation.resending")
                : t("pages.employees.invitation.resend")}
            </span>
          </button>

          <button
            onClick={!busy ? handleCancel : undefined}
            disabled={busy && busyAction !== "cancel"}
            className={cn(
              "flex flex-1 items-center justify-center gap-[5px] rounded-[10px] border border-[#FBDADA] bg-[#FDF2F2] py-[7px] transition-all duration-150",
              !busy && "cursor-pointer hover:border-[#F5C6C6] hover:bg-[#FAE8E8]",
              busy && busyAction !== "cancel" && "opacity-45 cursor-default",
            )}
          >
            {busy && busyAction === "cancel"
              ? <Spinner className="size-3 text-[#B45454]" />
              : <Trash2 className="size-[13px] text-[#B45454]" />
            }
            <span className="text-xs font-semibold text-[#B45454]">
              {t("pages.employees.invitation.cancel")}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
});

InvitationCard.displayName = "InvitationCard";
export default InvitationCard;
