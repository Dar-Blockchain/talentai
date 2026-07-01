import React, { memo, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import {
  MessageCircle, Pencil, Trash2, ExternalLink, MoreVertical,
  Calendar, Building2,
} from "lucide-react";
import { RootState } from "@/store/store";
import { useStartTeamChat } from "@/modules/chat/team-chat";
import { ROLES } from "@/modules/shared/constants/employee";
import { getRoleLabel } from "@/modules/company/employees/utils/employeeRoleI18n";
import type { ExtendedMember } from "@/modules/company/employees/types";
import { PURPLE, ROLE_STYLES, pickPalette } from "@/modules/company/employees/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/modules/shared/ui/shadcn/dropdown-menu";
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
  const palette = useMemo(() => pickPalette(email || name), [email, name]);

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
        className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[20px] border border-[#E8EAED] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-[240ms] cubic-bezier-[.4,0,.2,1] hover:-translate-y-[5px] hover:shadow-[0_16px_40px_rgba(0,0,0,0.10)]"
      >
        {/* Actions menu */}
        <div className="absolute top-3 right-3 z-10" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                aria-label={t("pages.employees.card.actions_menu")}
                className="flex size-7 items-center justify-center rounded-lg border border-[#E8EAED] bg-white/96 text-[#64748B] shadow-[0_2px_8px_rgba(15,23,42,0.08)] transition-colors hover:bg-[#F8FAFC]"
              >
                <MoreVertical className="size-[18px]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[188px] rounded-[14px] border-[#E8EAED] shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
              {canMessage && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleMessage(); }} className="gap-2">
                  <MessageCircle className="size-[18px] text-teal-600" />
                  <span className="text-[13px] font-semibold">{t("pages.employees.card.message")}</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleView(); }} className="gap-2">
                <ExternalLink className="size-[18px] text-[#64748B]" />
                <span className="text-[13px] font-semibold">{t("pages.employees.card.view")}</span>
              </DropdownMenuItem>
              {canAssignRoles && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(); }} className="gap-2">
                  <Pencil className="size-[18px]" style={{ color: PURPLE }} />
                  <span className="text-[13px] font-semibold">{t("pages.employees.card.edit")}</span>
                </DropdownMenuItem>
              )}
              {canRemove && (
                <DropdownMenuItem variant="destructive" onClick={(e) => { e.stopPropagation(); handleDelete(); }} className="gap-2">
                  <Trash2 className="size-[18px] text-red-600" />
                  <span className="text-[13px] font-semibold text-red-600">{t("pages.employees.card.tooltip_remove")}</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Color strip */}
        <div
          className="h-1 opacity-60 transition-opacity duration-[240ms] group-hover:opacity-100"
          style={{ background: `linear-gradient(90deg, ${palette.from}, ${palette.to})` }}
        />

        {/* Header */}
        <div
          className="flex flex-col items-center gap-1.5 px-2.5 pt-2.5 pb-2"
          style={{ background: `radial-gradient(ellipse 160% 100% at 50% 0%, ${palette.from}0A 0%, transparent 65%)` }}
        >
          {/* Avatar ring */}
          <div className="relative mt-0.5">
            <div
              className="flex size-[76px] items-center justify-center rounded-full p-[2.5px]"
              style={{
                background: `linear-gradient(145deg, ${palette.from}, ${palette.to})`,
                boxShadow: `0 6px 20px ${palette.to}40`,
              }}
            >
              <div
                className="flex size-[71px] items-center justify-center rounded-full text-[1.55rem] font-extrabold text-white"
                style={{ background: `linear-gradient(145deg, ${palette.from}CC, ${palette.to})` }}
              >
                {letter}
              </div>
            </div>
            <div
              className="absolute right-[3px] bottom-[3px] size-[14px] rounded-full border-[2.5px] border-white shadow-[0_1px_4px_rgba(0,0,0,0.15)]"
              style={{ backgroundColor: status.dot }}
            />
          </div>

          <div className="w-full px-0.5 text-center">
            <p className="truncate text-[15px] font-bold leading-[1.3] text-[#0F172A]">{name}</p>
            <p className="mt-[3px] truncate text-[11.5px] tracking-[0.01em] text-[#94A3B8]">{email}</p>
          </div>

          {/* Role pill */}
          <div
            className="inline-flex items-center gap-[6px] rounded-full border-[1.5px] px-[10px] py-[5px]"
            style={{ backgroundColor: `${roleColor}10`, borderColor: `${roleColor}25` }}
          >
            {RoleIcon && (
              <span className="flex items-center" style={{ color: roleColor }}>
                <RoleIcon style={{ fontSize: 12 }} />
              </span>
            )}
            <span className="text-[11.5px] font-bold tracking-[0.01em]" style={{ color: roleColor }}>
              {roleLabel}
            </span>
          </div>
        </div>

        <div className="mx-2.5 h-px bg-[#F1F5F9]" />

        {/* Body */}
        <div className="flex flex-1 flex-col gap-1.5 px-2.5 pt-[14px] pb-2">
          {/* Department */}
          <div
            onClick={handleDeptClick}
            className={cn(
              "flex items-center gap-[6px] rounded-[10px] border px-[10px] py-[7px] transition-all duration-150",
              dept ? "border-[#E8EAED] bg-[#F8FAFC]" : "border-[#F1F5F9] bg-transparent",
              member.department?._id && "cursor-pointer hover:border-[#C7D2FE] hover:bg-[#EEF2FF]",
            )}
          >
            <Building2 className={cn("size-[13px] shrink-0", dept ? "text-[#94A3B8]" : "text-[#CBD5E1]")} />
            <span
              className={cn(
                "truncate text-xs font-semibold",
                dept ? "text-[#475569]" : "italic text-[#CBD5E1]",
              )}
            >
              {dept ?? t("pages.employees.card.no_department")}
            </span>
          </div>

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between">
            <div
              className="inline-flex items-center gap-[5px] rounded-full px-2 py-[3px]"
              style={{ backgroundColor: status.bg }}
            >
              <div className="size-[5px] rounded-full" style={{ backgroundColor: status.dot }} />
              <span className="text-[10.5px] font-bold" style={{ color: status.color }}>{status.label}</span>
            </div>
            {joinedDate && (
              <div className="flex items-center gap-[3px]">
                <Calendar className="size-[10px] text-[#CBD5E1]" />
                <span className="text-[10.5px] font-medium text-[#CBD5E1]">{joinedDate}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

EmployeeCard.displayName = "EmployeeCard";
export default EmployeeCard;
