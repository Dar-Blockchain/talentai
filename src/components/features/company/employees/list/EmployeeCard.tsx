import React, { memo, useState } from "react";
import {
  Box, Typography, Avatar, IconButton, Menu, MenuItem, ListItemIcon, ListItemText,
} from "@mui/material";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import ChatBubbleOutlineOutlined from "@mui/icons-material/ChatBubbleOutlineOutlined";
import { RootState } from "@/store/store";
import { useStartTeamChat } from "@/modules/team-chat";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import OpenInNewOutlined from "@mui/icons-material/OpenInNewOutlined";
import MoreVertOutlined from "@mui/icons-material/MoreVertOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import { Member } from "@/store/slices/memberSlice";
import { ROLES } from "@/constants/employee";
import { getRoleLabel } from "@/utils/employeeRoleI18n";

const PURPLE = "#8310FF";

export const ROLE_LABELS: Record<string, string> = {
  RH: "HR", TechLead: "Technical Leader",
  Supervisor: "Supervisor", Manager: "Manager", Owner: "Owner",
};

export const ROLE_STYLES: Record<string, { color: string; bg: string }> = {
  RH:         { color: "#16A34A", bg: "#F0FDF4" },
  TechLead:   { color: "#0891B2", bg: "#ECFEFF" },
  Supervisor: { color: "#D97706", bg: "#FFFBEB" },
  Manager:    { color: PURPLE,    bg: "#F5F3FF" },
  Owner:      { color: "#DC2626", bg: "#FEF2F2" },
};

const STATUS_META: Record<string, { color: string; dot: string; bg: string }> = {
  active:   { color: "#16A34A", dot: "#22C55E", bg: "#DCFCE7" },
  pending:  { color: "#D97706", dot: "#F59E0B", bg: "#FEF9C3" },
  inactive: { color: "#6B7280", dot: "#D1D5DB", bg: "#F3F4F6" },
};

const AVATAR_PALETTES = [
  { from: "#A78BFA", to: "#6D28D9" },
  { from: "#34D399", to: "#059669" },
  { from: "#38BDF8", to: "#0284C7" },
  { from: "#F87171", to: "#DC2626" },
  { from: "#FCD34D", to: "#B45309" },
];

function pickPalette(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_PALETTES[Math.abs(h) % AVATAR_PALETTES.length];
}

interface EmployeeCardProps {
  member: Member;
  index?: number;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
  onSelect: (member: Member) => void;
  canAssignRoles?: boolean;
  canRemove?: boolean;
}

const EmployeeCard: React.FC<EmployeeCardProps> = memo(({ member, index = 0, onEdit, onDelete, onSelect, canAssignRoles = true, canRemove = true }) => {
  const router = useRouter();
  const startTeamChat = useStartTeamChat();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const currentUserId = useSelector((state: RootState) => state.user.connectedUser.user?._id);
  const { t, i18n } = useTranslation("dashboard");
  const fmtDate = (iso?: string) => {
    if (!iso) return null;
    const loc = i18n.language?.startsWith("fr") ? "fr-FR" : "en-US";
    return new Date(iso).toLocaleDateString(loc, { month: "short", day: "numeric", year: "numeric" });
  };
  const statusOf = (raw: string) => {
    const m = STATUS_META[raw] ?? STATUS_META.pending!;
    const labelKey = raw === "active" ? "status_active" : raw === "inactive" ? "status_inactive" : "status_pending";
    return { ...m, label: t(`pages.employees.card.${labelKey}`) };
  };
  const name    = (member.firstName && member.lastName)
    ? `${member.firstName} ${member.lastName}`
    : member.firstName || member.lastName || member.username || t("pages.employees.card.unnamed");
  const email   = member.email   || "";
  const letter  = name[0]?.toUpperCase() || "U";
  const palette = pickPalette(email || name);

  const roleStr   = member.role as string;
  const roleEntry = ROLES.find((r) => r.value === roleStr || r.value === roleStr.toLowerCase());
  const roleColor = roleEntry?.color ?? ROLE_STYLES[member.role]?.color ?? "#6B7280";
  const roleLabel = getRoleLabel(roleStr, t);
  const RoleIcon  = roleEntry?.icon ?? null;

  const status = statusOf(member.status);
  const joinedDate = fmtDate((member as any).createdAt);
  const dept       = (member as any).department?.name ?? (member as any).departmentName ?? null;
  const canMessage = member.status === "active" && member.userId !== currentUserId;

  const closeMenu = () => setMenuAnchor(null);

  const handleMessage = (event: React.MouseEvent) => {
    event.stopPropagation();
    closeMenu();
    void startTeamChat(member.userId);
  };

  const handleView = (event: React.MouseEvent) => {
    event.stopPropagation();
    closeMenu();
    router.push(`/company/employees/${member.userId}`);
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    closeMenu();
    onEdit(member);
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    closeMenu();
    onDelete(member);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.28, ease: "easeOut" }}
      style={{ height: "100%" }}
    >
      <Box
        onClick={() => onSelect(member)}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          borderRadius: "20px",
          cursor: "pointer",
          bgcolor: "#fff",
          border: "1px solid #E8EAED",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          overflow: "hidden",
          transition: "all 0.24s cubic-bezier(.4,0,.2,1)",
          "&:hover": {
            borderColor: `${palette.to}50`,
            boxShadow: `0 16px 40px rgba(0,0,0,0.10), 0 0 0 1px ${palette.to}20`,
            transform: "translateY(-5px)",
            "& .top-strip": { opacity: 1 },
          },
        }}
      >
        <IconButton
          size="small"
          aria-label={t("pages.employees.card.actions_menu")}
          onClick={(event) => {
            event.stopPropagation();
            setMenuAnchor(event.currentTarget);
          }}
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 2,
            color: "#64748B",
            bgcolor: "rgba(255,255,255,0.96)",
            border: "1px solid #E8EAED",
            boxShadow: "0 2px 8px rgba(15,23,42,0.08)",
            "&:hover": { bgcolor: "#F8FAFC" },
          }}
        >
          <MoreVertOutlined sx={{ fontSize: 18 }} />
        </IconButton>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={(event: Event | React.SyntheticEvent) => {
            event.stopPropagation();
            closeMenu();
          }}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            paper: {
              sx: {
                mt: 0.5,
                minWidth: 188,
                borderRadius: "14px",
                border: "1px solid #E8EAED",
                boxShadow: "0 16px 40px rgba(15,23,42,0.12)",
              },
            },
          }}
        >
          {canMessage && (
            <MenuItem onClick={handleMessage}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <ChatBubbleOutlineOutlined sx={{ fontSize: 18, color: "#0D9488" }} />
              </ListItemIcon>
              <ListItemText
                primary={t("pages.employees.card.message")}
                primaryTypographyProps={{ fontSize: "13px", fontWeight: 600 }}
              />
            </MenuItem>
          )}
          <MenuItem onClick={handleView}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <OpenInNewOutlined sx={{ fontSize: 18, color: "#64748B" }} />
            </ListItemIcon>
            <ListItemText
              primary={t("pages.employees.card.view")}
              primaryTypographyProps={{ fontSize: "13px", fontWeight: 600 }}
            />
          </MenuItem>
          {canAssignRoles && (
            <MenuItem onClick={handleEdit}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <EditOutlined sx={{ fontSize: 18, color: PURPLE }} />
              </ListItemIcon>
              <ListItemText
                primary={t("pages.employees.card.edit")}
                primaryTypographyProps={{ fontSize: "13px", fontWeight: 600 }}
              />
            </MenuItem>
          )}
          {canRemove && (
            <MenuItem onClick={handleDelete} sx={{ color: "#DC2626" }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <DeleteOutlineOutlined sx={{ fontSize: 18, color: "#DC2626" }} />
              </ListItemIcon>
              <ListItemText
                primary={t("pages.employees.card.tooltip_remove")}
                primaryTypographyProps={{ fontSize: "13px", fontWeight: 600, color: "#DC2626" }}
              />
            </MenuItem>
          )}
        </Menu>

        <Box
          className="top-strip"
          sx={{
            height: 4,
            background: `linear-gradient(90deg, ${palette.from}, ${palette.to})`,
            opacity: 0.6,
            transition: "opacity 0.24s",
          }}
        />

        <Box sx={{
          px: 2.5, pt: 2.5, pb: 2,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5,
          background: `radial-gradient(ellipse 160% 100% at 50% 0%, ${palette.from}0A 0%, transparent 65%)`,
        }}>
          <Box sx={{ position: "relative", mt: 0.5 }}>
            <Box sx={{
              width: 76, height: 76, borderRadius: "50%",
              background: `linear-gradient(145deg, ${palette.from}, ${palette.to})`,
              p: "2.5px",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 6px 20px ${palette.to}40`,
            }}>
              <Avatar sx={{
                width: 71, height: 71,
                fontSize: "1.55rem", fontWeight: 800, color: "#fff",
                background: `linear-gradient(145deg, ${palette.from}CC, ${palette.to})`,
              }}>
                {letter}
              </Avatar>
            </Box>
            <Box sx={{
              position: "absolute", bottom: 3, right: 3,
              width: 14, height: 14, borderRadius: "50%",
              bgcolor: status.dot, border: "2.5px solid #fff",
              boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
            }} />
          </Box>

          <Box sx={{ textAlign: "center", width: "100%", px: 0.5 }}>
            <Typography sx={{
              fontSize: "15px", fontWeight: 700, color: "#0F172A",
              lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {name}
            </Typography>
            <Typography sx={{
              fontSize: "11.5px", color: "#94A3B8", mt: 0.4,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              letterSpacing: "0.01em",
            }}>
              {email}
            </Typography>
          </Box>

          <Box sx={{
            display: "inline-flex", alignItems: "center", gap: 0.6,
            px: 1.5, py: "5px", borderRadius: "999px",
            bgcolor: `${roleColor}10`, border: `1.5px solid ${roleColor}25`,
          }}>
            {RoleIcon && (
              <Box sx={{ color: roleColor, display: "flex", alignItems: "center", "& svg": { fontSize: 12 } }}>
                <RoleIcon />
              </Box>
            )}
            <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: roleColor, letterSpacing: "0.01em" }}>
              {roleLabel}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mx: 2.5, height: "1px", bgcolor: "#F1F5F9" }} />

        <Box sx={{ px: 2.5, pt: 1.75, pb: 2, display: "flex", flexDirection: "column", gap: 1.5, flex: 1 }}>
          <Box
            onClick={(e) => {
              const deptId = (member as any).department?._id;
              if (deptId) { e.stopPropagation(); router.push(`/company/departments/${deptId}`); }
            }}
            sx={{
              display: "flex", alignItems: "center", gap: 0.75,
              px: 1.25, py: 0.875, borderRadius: "10px",
              bgcolor: dept ? "#F8FAFC" : "transparent",
              border: `1px solid ${dept ? "#E8EAED" : "#F1F5F9"}`,
              cursor: (member as any).department?._id ? "pointer" : "default",
              transition: "all 0.15s",
              ...((member as any).department?._id && {
                "&:hover": { bgcolor: "#EEF2FF", borderColor: "#C7D2FE" },
              }),
            }}
          >
            <BusinessOutlined sx={{ fontSize: 13, color: dept ? "#94A3B8" : "#CBD5E1", flexShrink: 0 }} />
            <Typography sx={{
              fontSize: "12px", fontWeight: 600,
              color: dept ? "#475569" : "#CBD5E1",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              fontStyle: dept ? "normal" : "italic",
            }}>
              {dept ?? t("pages.employees.card.no_department")}
            </Typography>
          </Box>

          <Box sx={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            mt: "auto", pt: dept ? 0 : 0.5,
          }}>
            <Box sx={{
              display: "inline-flex", alignItems: "center", gap: 0.5,
              px: 1, py: "3px", borderRadius: "999px",
              bgcolor: status.bg,
            }}>
              <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: status.dot }} />
              <Typography sx={{ fontSize: "10.5px", fontWeight: 700, color: status.color }}>
                {status.label}
              </Typography>
            </Box>
            {joinedDate && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                <CalendarTodayOutlined sx={{ fontSize: 10, color: "#CBD5E1" }} />
                <Typography sx={{ fontSize: "10.5px", color: "#CBD5E1", fontWeight: 500 }}>
                  {joinedDate}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
});

EmployeeCard.displayName = "EmployeeCard";
export default EmployeeCard;
