import React, { memo, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import {
  MessageCircle, Pencil, Trash2, ExternalLink,
  Calendar, Building2, Mail,
} from "lucide-react";
import { RootState } from "@/store/store";
import { useStartTeamChat } from "@/modules/chat/team-chat";
import { ROLES } from "@/modules/shared/constants/employee";
import { getRoleLabel } from "@/modules/company/employees/utils/employeeRoleI18n";
import type { ExtendedMember } from "@/modules/company/employees/types";
import { PURPLE, ROLE_STYLES } from "@/modules/company/employees/constants";
import { DropdownMenuItem } from "@/modules/shared/ui/shadcn/dropdown-menu";
import { MoreOptionsMenu } from "@/modules/shared/ui/MoreOptionsMenu";
import { cn } from "@/lib/utils";

export { ROLE_STYLES } from "@/modules/company/employees/constants";
export const ROLE_LABELS: Record<string, string> = {
  RH: "HR", TechLead: "Technical Leader",
  Supervisor: "Supervisor", Manager: "Manager", Owner: "Owner",
};

const STATUS_META: Record<string, { color: string; dot: string; bg: string }> = {
  active:   { color: "#16A34A", dot: "#22C55E", bg: "#DCFCE7" },
  pending:  { color: "#D97706", dot: "#F59E0B", bg: "#FEF9C3" },
  inactive: { color: "#6B7280", dot: "#D1D5DB", bg: "#F3F4F6" },
};

interface EmployeeCardProps {
  member: ExtendedMember;
  index?: number;
  onEdit: (member: ExtendedMember) => void;
  onDelete: (member: ExtendedMember) => void;
  onSelect: (member: ExtendedMember) => void;
  canAssignRoles?: boolean;
  canRemove?: boolean;
}

const EmployeeCard: React.FC<EmployeeCardProps> = memo(({
  member, index = 0, onEdit, onDelete, onSelect,
  canAssignRoles = true, canRemove = true,
}) => {
  const router        = useRouter();
  const startTeamChat = useStartTeamChat();
  const [menuOpen, setMenuOpen] = useState(false);
  const currentUserId = useSelector((state: RootState) => state.user.connectedUser.user?._id);
  const { t, i18n }  = useTranslation("dashboard");

  const locale = i18n.language?.startsWith("fr") ? "fr-FR" : "en-US";

  const fmtDate = useCallback((iso?: string) => {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });
  }, [locale]);

  const statusOf = useCallback((raw: string) => {
    const meta = STATUS_META[raw] ?? STATUS_META.pending!;
    const labelKey = raw === "active" ? "status_active" : raw === "inactive" ? "status_inactive" : "status_pending";
    return { ...meta, label: t(`pages.employees.card.${labelKey}`) };
  }, [t]);

  const name = useMemo(() => (
    (member.firstName && member.lastName)
      ? `${member.firstName} ${member.lastName}`
      : member.firstName || member.lastName || member.username || t("pages.employees.card.unnamed")
  ), [member.firstName, member.lastName, member.username, t]);

  const email   = member.email ?? "";
  const letter  = name[0]?.toUpperCase() ?? "U";

  const roleStr   = member.role as string;
  const roleEntry = useMemo(() => ROLES.find((r) => r.value === roleStr || r.value === roleStr.toLowerCase()), [roleStr]);
  const roleColor = roleEntry?.color ?? ROLE_STYLES[member.role]?.color ?? "#6B7280";
  const roleLabel = useMemo(() => getRoleLabel(roleStr, t), [roleStr, t]);
  const RoleIcon  = roleEntry?.icon ?? null;

  const status     = useMemo(() => statusOf(member.status), [member.status, statusOf]);
  const joinedDate = useMemo(() => fmtDate(member.createdAt), [member.createdAt, fmtDate]);
  const dept       = member.department?.name ?? member.departmentName ?? null;
  const canMessage = member.status === "active" && member.userId !== currentUserId;

  const handleSelect   = useCallback(() => onSelect(member), [onSelect, member]);
  const handleMessage  = useCallback(() => void startTeamChat(member.userId), [startTeamChat, member.userId]);
  const handleView     = useCallback(() => router.push(`/company/employees/${member.userId}`), [router, member.userId]);
  const handleEdit     = useCallback(() => onEdit(member), [onEdit, member]);
  const handleDelete   = useCallback(() => onDelete(member), [onDelete, member]);
  const handleDeptClick = useCallback((e: React.MouseEvent) => {
    const deptId = member.department?._id;
    if (deptId) { e.stopPropagation(); router.push(`/company/departments/${deptId}`); }
  }, [member.department?._id, router]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.28, ease: "easeOut" }}
      style={{ height: "100%" }}
    >
      <div
        onClick={handleSelect}
        className={cn(
          "group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#EEF0F3] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 ease-out hover:-translate-y-[3px] hover:border-transparent hover:shadow-[0_20px_40px_-8px_rgba(15,23,42,0.16)]",
          menuOpen && "blur-[1.5px] shadow-[0_20px_40px_-8px_rgba(15,23,42,0.16)]",
        )}
      >
        {/* Top row: status pill + menu */}
        <div className="relative flex items-center justify-between">
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1"
            style={{ backgroundColor: status.bg }}
          >
            <div className="size-[7px] rounded-full" style={{ backgroundColor: status.dot }} />
            <span className="text-[11.5px] font-bold" style={{ color: status.color }}>{status.label}</span>
          </div>

          <MoreOptionsMenu
            open={menuOpen}
            onOpenChange={setMenuOpen}
            label={t("pages.employees.card.actions_menu")}
            iconSize={18}
            className="text-[#94A3B8] hover:bg-[#F8FAFC] hover:text-[#475569] data-[state=open]:bg-[#F8FAFC]"
            contentClassName="rounded-[14px] border-[#E8EAED] shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
          >
                {canMessage && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleMessage(); }} className="cursor-pointer gap-2">
                    <MessageCircle className="size-[18px] text-teal-600" />
                    <span className="text-[13px] font-semibold">{t("pages.employees.card.message")}</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleView(); }} className="cursor-pointer gap-2">
                  <ExternalLink className="size-[18px] text-[#64748B]" />
                  <span className="text-[13px] font-semibold">{t("pages.employees.card.view")}</span>
                </DropdownMenuItem>
                {canAssignRoles && (
                  <DropdownMenuItem
                    onClick={(e) => { e.stopPropagation(); handleEdit(); }}
                    className="cursor-pointer gap-2 hover:bg-(--edit-hover-bg) focus:bg-(--edit-hover-bg)"
                    style={{ ["--edit-hover-bg" as string]: `${PURPLE}14` }}
                  >
                    <Pencil className="size-[18px]" style={{ color: PURPLE }} />
                    <span className="text-[13px] font-semibold">{t("pages.employees.card.edit")}</span>
                  </DropdownMenuItem>
                )}
                {canRemove && (
                  <DropdownMenuItem variant="destructive" onClick={(e) => { e.stopPropagation(); handleDelete(); }} className="cursor-pointer gap-2">
                    <Trash2 className="size-[18px] text-red-600" />
                    <span className="text-[13px] font-semibold text-red-600">{t("pages.employees.card.tooltip_remove")}</span>
                  </DropdownMenuItem>
                )}
          </MoreOptionsMenu>
        </div>

        {/* Centered avatar + identity */}
        <div className="relative mt-4 flex flex-col items-center text-center">
          <div
            className="flex size-20 items-center justify-center rounded-full text-2xl font-extrabold text-white"
            style={{ backgroundColor: PURPLE, boxShadow: `0 8px 20px -6px ${PURPLE}80` }}
          >
            {letter}
          </div>

          <p title={name} className="mt-3 max-w-full truncate text-[16px] font-bold leading-tight text-[#0F172A]">
            {name}
          </p>
          <div className="mt-1 inline-flex max-w-full items-center gap-1.5">
            {RoleIcon && (
              <span className="flex shrink-0 items-center" style={{ color: roleColor }}>
                <RoleIcon size={14} />
              </span>
            )}
            <span className="truncate text-[13px] font-semibold" style={{ color: roleColor }}>
              {roleLabel}
            </span>
          </div>
        </div>

        {/* Info panel */}
        <div className="relative mt-4 rounded-xl bg-[#F8FAFC] px-4 py-3.5">
          <div className="flex flex-col gap-2.5">
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-wide text-[#94A3B8]">
                {t("pages.employees.card.label_department", "Department")}
              </p>
              <div
                onClick={handleDeptClick}
                title={dept ?? undefined}
                className={cn(
                  "mt-1 flex items-start gap-1.5 text-[12.5px] font-bold leading-snug",
                  dept ? "text-[#334155]" : "italic text-[#CBD5E1]",
                  member.department?._id && "cursor-pointer hover:underline",
                )}
              >
                <Building2 className="mt-px size-3 shrink-0 text-[#94A3B8]" />
                <span className="wrap-break-word">{dept ?? t("pages.employees.card.no_department")}</span>
              </div>
            </div>

            {joinedDate && (
              <div>
                <p className="text-[10.5px] font-semibold uppercase tracking-wide text-[#94A3B8]">
                  {t("pages.employees.card.label_joined", "Joined")}
                </p>
                <div className="mt-1 flex items-center gap-1.5 text-[12.5px] font-bold text-[#334155]">
                  <Calendar className="size-3 shrink-0 text-[#94A3B8]" />
                  <span>{joinedDate}</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2 border-t border-[#EEF0F3] pt-3">
            <Mail className="size-3.5 shrink-0 text-[#94A3B8]" />
            <span title={email} className="truncate text-[12.5px] font-medium text-[#64748B]">{email}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

EmployeeCard.displayName = "EmployeeCard";
export default EmployeeCard;
