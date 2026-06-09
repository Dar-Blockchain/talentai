import React, { memo, useState, useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import { Box, Typography, Avatar } from "@mui/material";
import { AnimatePresence } from "framer-motion";
import ArrowBackOutlined from "@mui/icons-material/ArrowBackOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import ChatBubbleOutlineOutlined from "@mui/icons-material/ChatBubbleOutlineOutlined";
import { useStartTeamChat } from "@/modules/chat/team-chat";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import TuneOutlined from "@mui/icons-material/TuneOutlined";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import { useTranslation } from "react-i18next";
import { updateEmployeePermissions, selectUpdatingPermissions } from "@/store/slices/memberSlice";
import { ROLES } from "@/constants/employee";
import { getRoleLabel } from "@/utils/employeeRoleI18n";
import { DEFAULT_EMPLOYEE_PERMISSIONS } from "@/types/employeePermissions";
import type { EmployeePermission } from "@/types/employeePermissions";
import type { ExtendedMember } from "@/modules/company/employees/types";
import { employeesApi } from "@/modules/company/employees/api";
import { PURPLE, ROLE_STYLES, STATUS_STYLES, pickPalette, fmtDate } from "@/modules/company/employees/constants";
import DetailTab from "./DetailTab";
import OverviewTab from "./OverviewTab";
import PermissionsTab from "./PermissionsTab";

const NAV_ROW_SX   = { display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 } as const;
const ACTIONS_SX   = { display: "flex", gap: 0.875 } as const;
const IDENTITY_SX  = { display: "flex", alignItems: "center", gap: 2.5, flexWrap: "wrap" } as const;
const AVATAR_POS   = { position: "relative" as const, flexShrink: 0 } as const;
const INFO_BOX_SX  = { flex: 1, minWidth: 0 } as const;
const BADGES_SX    = { display: "flex", alignItems: "center", gap: 0.75, mt: 1.25, flexWrap: "wrap" } as const;
const BACK_SX      = { display: "inline-flex", alignItems: "center", gap: 0.75, cursor: "pointer", color: "#94A3B8", transition: "color 0.15s", "&:hover": { color: "#475569" } } as const;
const TAB_BAR_SX   = { display: "flex", alignItems: "center", gap: 0.5, mb: 2.5, bgcolor: "#F3F4F6", borderRadius: "12px", p: 0.5, width: "fit-content" } as const;
const MSG_BTN_BASE = { display: "flex", alignItems: "center", gap: 0.625, px: 1.625, py: 0.75, borderRadius: "10px", cursor: "pointer", transition: "all 0.15s" } as const;

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
  const startTeamChat = useStartTeamChat();
  const dispatch      = useDispatch<AppDispatch>();
  const updatingPerms = useSelector(selectUpdatingPermissions);
  const { t } = useTranslation("dashboard");

  const userId = member.userId;

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

  const heroBg = useMemo(() => ({
    bgcolor: "#fff", border: "1px solid #EDEEF0", borderRadius: "22px",
    overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", mb: 2.5,
    background: `linear-gradient(135deg, ${palette.from}07 0%, transparent 50%)`,
  }), [palette.from]);

  const avatarSx = useMemo(() => ({
    width: 72, height: 72, fontSize: "1.6rem", fontWeight: 800, color: "#fff",
    background: `linear-gradient(145deg, ${palette.from}, ${palette.to})`,
    boxShadow: `0 4px 18px ${palette.to}38`,
  }), [palette.from, palette.to]);

  const rolePillSx = useMemo(() => ({
    display: "inline-flex", alignItems: "center", gap: 0.5,
    px: 1.125, py: "3px", borderRadius: "999px",
    bgcolor: `${roleColor}10`, border: `1px solid ${roleColor}22`,
  }), [roleColor]);

  const handleSavePermissions = useCallback(async () => {
    const result = await dispatch(updateEmployeePermissions({ memberId: userId, permissions }));
    if (updateEmployeePermissions.fulfilled.match(result)) {
      setSaved(true);
      const updated = result.payload as Partial<EmployeePermission>;
      if (updated) setPermissions(updated);
      setTimeout(() => setSaved(false), 2500);
    }
  }, [dispatch, permissions, userId]);

  const handleChatClick    = useCallback(() => { void startTeamChat(member.userId); }, [startTeamChat, member.userId]);
  const handleEditClick    = useCallback(() => onEdit(member),   [onEdit, member]);
  const handleDeleteClick  = useCallback(() => onDelete(member), [onDelete, member]);
  const setOverviewTab     = useCallback(() => setTab("overview"),     []);
  const setPermissionsTab  = useCallback(() => setTab("permissions"),  []);

  return (
    <Box>
      <Box sx={heroBg}>
        <Box sx={{ px: { xs: 2.5, sm: 3.5 }, pt: 2.5, pb: 3 }}>
          <Box sx={NAV_ROW_SX}>
            <Box onClick={onBack} sx={BACK_SX}>
              <ArrowBackOutlined sx={{ fontSize: 15 }} />
              <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "inherit" }}>Employees</Typography>
            </Box>

            <Box sx={ACTIONS_SX}>
              {!isSelf && member.status === "active" && (
                <Box onClick={handleChatClick} sx={{ ...MSG_BTN_BASE, border: "1px solid #CCFBF1", bgcolor: "#F0FDFA", "&:hover": { bgcolor: "#CCFBF1", borderColor: "#99F6E4", "& *": { color: "#0F766E" } } }}>
                  <ChatBubbleOutlineOutlined sx={{ fontSize: 14, color: "#0D9488" }} />
                  <Typography sx={{ fontSize: "0.775rem", fontWeight: 600, color: "#0F766E" }}>Message</Typography>
                </Box>
              )}
              {canAssignRoles && (
                <Box onClick={handleEditClick} sx={{ ...MSG_BTN_BASE, border: "1px solid #E2E8F0", bgcolor: "#F8FAFC", "&:hover": { bgcolor: `${PURPLE}08`, borderColor: `${PURPLE}30`, "& *": { color: PURPLE } } }}>
                  <EditOutlined sx={{ fontSize: 14, color: "#64748B" }} />
                  <Typography sx={{ fontSize: "0.775rem", fontWeight: 600, color: "#475569" }}>Edit</Typography>
                </Box>
              )}
              {canRemove && (
                <Box onClick={handleDeleteClick} sx={{ ...MSG_BTN_BASE, border: "1px solid #FECACA", bgcolor: "#FEF7F7", "&:hover": { bgcolor: "#FEE2E2", borderColor: "#FCA5A5" } }}>
                  <DeleteOutlineOutlined sx={{ fontSize: 14, color: "#F87171" }} />
                  <Typography sx={{ fontSize: "0.775rem", fontWeight: 600, color: "#EF4444" }}>Remove</Typography>
                </Box>
              )}
            </Box>
          </Box>

          <Box sx={IDENTITY_SX}>
            <Box sx={AVATAR_POS}>
              <Avatar sx={avatarSx}>{letter}</Avatar>
              <Box sx={{ position: "absolute", bottom: 2, right: 2, width: 14, height: 14, borderRadius: "50%", bgcolor: status.dot, border: "2.5px solid #fff" }} />
            </Box>

            <Box sx={INFO_BOX_SX}>
              <Typography sx={{ fontWeight: 700, fontSize: "1.125rem", color: "#0F172A", lineHeight: 1.25 }}>{name}</Typography>
              <Typography sx={{ fontSize: "0.8125rem", color: "#94A3B8", mt: 0.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email}</Typography>

              <Box sx={BADGES_SX}>
                <Box sx={rolePillSx}>
                  <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: roleColor }} />
                  <Typography sx={{ fontSize: "11px", fontWeight: 700, color: roleColor }}>{roleLabel}</Typography>
                </Box>

                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 1.125, py: "3px", borderRadius: "999px", bgcolor: status.bg }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: status.dot }} />
                  <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: status.color }}>{status.label}</Typography>
                </Box>

                {dept && (
                  <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 1.25, py: "4px", borderRadius: "999px", bgcolor: "#F1F5F9", border: "1px solid #E2E8F0" }}>
                    <BusinessOutlined sx={{ fontSize: 11, color: "#64748B" }} />
                    <Typography sx={{ fontSize: "11.5px", fontWeight: 600, color: "#475569" }}>{dept}</Typography>
                  </Box>
                )}

                {member.createdAt && (
                  <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                    <CalendarTodayOutlined sx={{ fontSize: 11, color: "#CBD5E1" }} />
                    <Typography sx={{ fontSize: "11.5px", color: "#94A3B8", fontWeight: 500 }}>Joined {fmtDate(member.createdAt)}</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box sx={TAB_BAR_SX}>
        <DetailTab active={tab === "overview"}    label="Overview"    icon={<PersonOutlined />} onClick={setOverviewTab} />
        {canManagePermissions && (
          <DetailTab active={tab === "permissions"} label="Permissions" icon={<TuneOutlined />} onClick={setPermissionsTab} />
        )}
      </Box>

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
    </Box>
  );
});

EmployeeDetail.displayName = "EmployeeDetail";
export default EmployeeDetail;
