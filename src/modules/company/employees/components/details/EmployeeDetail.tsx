import React, { memo, useState, useCallback, useEffect, useMemo } from "react";
import { useUpdatePermissionsMutation } from "@/modules/company/employees/queries";
import { Avatar, AvatarFallback } from "@/modules/shared/ui/shadcn/avatar";
import { AnimatePresence } from "framer-motion";
import {
  ArrowLeft as ArrowBackOutlined,
  Pencil as EditOutlined,
  Trash2 as DeleteOutlineOutlined,
  MessageCircle as ChatBubbleOutlineOutlined,
  Building2 as BusinessOutlined,
  Calendar as CalendarTodayOutlined,
  SlidersHorizontal as TuneOutlined,
  User as PersonOutlined,
} from "lucide-react";
import { useStartTeamChat } from "@/modules/chat/team-chat";
import { useTranslation } from "react-i18next";
import { ROLES } from "@/modules/shared/constants/employee";
import { getRoleLabel } from '@/modules/company/employees/utils/employeeRoleI18n';
import { DEFAULT_EMPLOYEE_PERMISSIONS } from "@/modules/company/employees/types/permissions";
import type { EmployeePermission } from "@/modules/company/employees/types/permissions";
import type { ExtendedMember } from "@/modules/company/employees/types";
import { employeesApi } from "@/modules/company/employees/api";
import { PURPLE, ROLE_STYLES, STATUS_STYLES, pickPalette, fmtDate } from "@/modules/company/employees/constants";
import DetailTab from "./DetailTab";
import OverviewTab from "./OverviewTab";
import PermissionsTab from "./PermissionsTab";

interface EmployeeDetailProps {
  member: ExtendedMember;
  onBack: () => void;
  onEdit: (member: ExtendedMember) => void;
  onDelete: (member: ExtendedMember) => void;
  canAssignRoles?: boolean;
  canRemove?: boolean;
  canManagePermissions?: boolean;
  isOwner?: boolean;
  isSelf?: boolean;
}

const EmployeeDetail: React.FC<EmployeeDetailProps> = memo(({
  member, onBack, onEdit, onDelete,
  canAssignRoles = true, canRemove = true,
  canManagePermissions = true, isOwner = false, isSelf = false,
}) => {
  const userId         = member.userId;
  const startTeamChat  = useStartTeamChat();
  const updatePermMut  = useUpdatePermissionsMutation(userId ?? "");
  const updatingPerms  = updatePermMut.isPending;
  const { t } = useTranslation("dashboard");

  const [tab,           setTab]           = useState<"overview" | "permissions">("overview");
  const [permissions,   setPermissions]   = useState<Partial<EmployeePermission>>(DEFAULT_EMPLOYEE_PERMISSIONS);
  const [fetchingPerms, setFetchingPerms] = useState(false);
  const [saved,         setSaved]         = useState(false);

  useEffect(() => {
    if (tab !== "permissions" || isSelf) return;
    setFetchingPerms(true);
    employeesApi
      .fetchPermissions(userId)
      .then((data) => { if (data) setPermissions(data); })
      .catch(() => {/* keep defaults */})
      .finally(() => setFetchingPerms(false));
  }, [tab, userId, isSelf]);

  const name = useMemo(() => (
    (member.firstName && member.lastName)
      ? `${member.firstName} ${member.lastName}`
      : member.firstName || member.lastName || member.username || "Unnamed"
  ), [member.firstName, member.lastName, member.username]);

  const email   = member.email || "—";
  const letter  = name[0]?.toUpperCase() || "U";
  const palette = useMemo(() => pickPalette(email || name), [email, name]);

  const roleStr   = member.role as string;
  const roleEntry = useMemo(() => ROLES.find((r) => r.value === roleStr || r.value === roleStr.toLowerCase()), [roleStr]);
  const roleColor = roleEntry?.color ?? ROLE_STYLES[member.role]?.color ?? "#6B7280";
  const roleLabel = useMemo(() => getRoleLabel(roleStr, t), [roleStr, t]);
  const status    = STATUS_STYLES[member.status] ?? STATUS_STYLES.pending!;
  const dept      = member.department?.name ?? member.departmentName ?? null;

  const heroStyle = useMemo(() => ({
    background: `linear-gradient(135deg, ${palette.from}07 0%, transparent 50%)`,
  }), [palette.from]);

  const avatarStyle = useMemo(() => ({
    background: `linear-gradient(145deg, ${palette.from}, ${palette.to})`,
    boxShadow: `0 4px 18px ${palette.to}38`,
  }), [palette.from, palette.to]);

  const rolePillStyle = useMemo(() => ({
    backgroundColor: `${roleColor}10`,
    borderColor: `${roleColor}22`,
  }), [roleColor]);

  const handleSavePermissions = useCallback(() => {
    updatePermMut.mutate(permissions, {
      onSuccess: (updated: any) => {
        setSaved(true);
        const p = (updated as any)?.data ?? updated;
        if (p) setPermissions(p as Partial<EmployeePermission>);
        setTimeout(() => setSaved(false), 2500);
      },
    });
  }, [updatePermMut, permissions]);

  const handleChatClick    = useCallback(() => { void startTeamChat(member.userId); }, [startTeamChat, member.userId]);
  const handleEditClick    = useCallback(() => onEdit(member),   [onEdit, member]);
  const handleDeleteClick  = useCallback(() => onDelete(member), [onDelete, member]);
  const setOverviewTab     = useCallback(() => setTab("overview"),     []);
  const setPermissionsTab  = useCallback(() => setTab("permissions"),  []);

  return (
    <div>
      <div
        className="mb-2.5 overflow-hidden rounded-[22px] border border-[#EDEEF0] bg-white shadow-[0_1px_6px_rgba(0,0,0,0.05)]"
        style={heroStyle}
      >
        <div className="px-5 pt-5 pb-6 sm:px-7">
          <div className="mb-6 flex items-center justify-between">
            <div onClick={onBack} className="inline-flex cursor-pointer items-center gap-1.5 text-[#94A3B8] transition-colors hover:text-[#475569]">
              <ArrowBackOutlined size={15} />
              <span className="text-[0.8rem] font-semibold text-inherit">Employees</span>
            </div>

            <div className="flex items-center gap-[7px]">
              {!isSelf && member.status === "active" && (
                <div
                  onClick={handleChatClick}
                  className="group flex cursor-pointer items-center gap-[5px] rounded-[10px] border border-[#CCFBF1] bg-[#F0FDFA] px-[13px] py-3 transition-all hover:border-[#99F6E4] hover:bg-[#CCFBF1]"
                >
                  <ChatBubbleOutlineOutlined size={14} className="text-[#0D9488] group-hover:text-[#0F766E]" />
                  <span className="text-[0.775rem] font-semibold text-[#0F766E]">Message</span>
                </div>
              )}
              {canAssignRoles && (
                <div
                  onClick={handleEditClick}
                  className="group flex cursor-pointer items-center gap-[5px] rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] px-[13px] py-3 transition-all hover:border-[#8310FF]/30 hover:bg-[#8310FF]/[0.03]"
                >
                  <EditOutlined size={14} className="text-[#64748B] group-hover:text-[#8310FF]" />
                  <span className="text-[0.775rem] font-semibold text-[#475569] group-hover:text-[#8310FF]">Edit</span>
                </div>
              )}
              {canRemove && (
                <div
                  onClick={handleDeleteClick}
                  className="group flex cursor-pointer items-center gap-[5px] rounded-[10px] border border-[#FECACA] bg-[#FEF7F7] px-[13px] py-3 transition-all hover:border-[#FCA5A5] hover:bg-[#FEE2E2]"
                >
                  <DeleteOutlineOutlined size={14} color="#F87171" />
                  <span className="text-[0.775rem] font-semibold text-[#EF4444]">Remove</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <div className="relative shrink-0">
              <Avatar className="size-[72px]" style={avatarStyle}>
                <AvatarFallback
                  className="bg-transparent text-[1.6rem] font-extrabold text-white"
                  style={avatarStyle}
                >
                  {letter}
                </AvatarFallback>
              </Avatar>
              <div
                className="absolute bottom-0.5 right-0.5 size-3.5 rounded-full border-[2.5px] border-white"
                style={{ backgroundColor: status.dot }}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[1.125rem] font-bold leading-tight text-[#0F172A]">{name}</p>
              <p className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-[0.8125rem] text-[#94A3B8]">{email}</p>

              <div className="mt-[10px] flex flex-wrap items-center gap-1.5">
                <div className="inline-flex items-center gap-1 rounded-full border px-[9px] py-[3px]" style={rolePillStyle}>
                  <div className="size-[5px] rounded-full" style={{ backgroundColor: roleColor }} />
                  <span className="text-[11px] font-bold" style={{ color: roleColor }}>{roleLabel}</span>
                </div>

                <div className="inline-flex items-center gap-1 rounded-full px-[9px] py-[3px]" style={{ backgroundColor: status.bg }}>
                  <div className="size-1.5 rounded-full" style={{ backgroundColor: status.dot }} />
                  <span className="text-[11.5px] font-bold" style={{ color: status.color }}>{status.label}</span>
                </div>

                {dept && (
                  <div className="inline-flex items-center gap-1 rounded-full border border-[#E2E8F0] bg-[#F1F5F9] px-2.5 py-1">
                    <BusinessOutlined size={11} color="#64748B" />
                    <span className="text-[11.5px] font-semibold text-[#475569]">{dept}</span>
                  </div>
                )}

                {member.createdAt && (
                  <div className="inline-flex items-center gap-1">
                    <CalendarTodayOutlined size={11} color="#CBD5E1" />
                    <span className="text-[11.5px] font-medium text-[#94A3B8]">Joined {fmtDate(member.createdAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-5 flex w-fit items-center gap-1 rounded-xl bg-[#F3F4F6] p-1">
        <DetailTab active={tab === "overview"}    label="Overview"    icon={<PersonOutlined />} onClick={setOverviewTab} />
        {canManagePermissions && (
          <DetailTab active={tab === "permissions"} label="Permissions" icon={<TuneOutlined />} onClick={setPermissionsTab} />
        )}
      </div>

      <AnimatePresence mode="wait">
        {tab === "overview" && (
          <OverviewTab member={member} email={email} roleLabel={roleLabel} roleColor={roleColor} dept={dept} />
        )}
        {tab === "permissions" && (
          <PermissionsTab
            name={name} isSelf={isSelf} isOwner={isOwner}
            permissions={permissions} onChange={setPermissions}
            onSave={handleSavePermissions} saving={updatingPerms} saved={saved} loading={fetchingPerms}
          />
        )}
      </AnimatePresence>
    </div>
  );
});

EmployeeDetail.displayName = "EmployeeDetail";
export default EmployeeDetail;
