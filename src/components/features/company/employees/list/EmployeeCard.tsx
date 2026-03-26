import React, { memo } from "react";
import {
  Box, Typography, Avatar, Tooltip,
} from "@mui/material";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import OpenInNewOutlined from "@mui/icons-material/OpenInNewOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import { Member } from "@/store/slices/memberSlice";
import { ROLES } from "@/constants/employee";

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

const STATUS_STYLES: Record<string, { color: string; dot: string; label: string; bg: string }> = {
  active:   { color: "#16A34A", dot: "#22C55E", label: "Active",   bg: "#DCFCE7" },
  pending:  { color: "#D97706", dot: "#F59E0B", label: "Pending",  bg: "#FEF9C3" },
  inactive: { color: "#6B7280", dot: "#D1D5DB", label: "Inactive", bg: "#F3F4F6" },
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

const fmtDate = (iso?: string) => {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

interface EmployeeCardProps {
  member: Member;
  index?: number;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
  onSelect: (member: Member) => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = memo(({ member, index = 0, onEdit, onDelete, onSelect }) => {
  const router = useRouter();
  const name    = (member.firstName && member.lastName)
    ? `${member.firstName} ${member.lastName}`
    : member.firstName || member.lastName || member.username || "Unnamed";
  const email   = member.email   || "";
  const letter  = name[0]?.toUpperCase() || "U";
  const palette = pickPalette(email || name);

  const roleStr   = member.role as string;
  const roleEntry = ROLES.find((r) => r.value === roleStr || r.value === roleStr.toLowerCase());
  const roleColor = roleEntry?.color ?? ROLE_STYLES[member.role]?.color ?? "#6B7280";
  const roleLabel = roleEntry?.label ?? ROLE_LABELS[member.role] ?? member.role;
  const RoleIcon  = roleEntry?.icon ?? null;

  const status     = STATUS_STYLES[member.status] ?? STATUS_STYLES.pending;
  const joinedDate = fmtDate((member as any).createdAt);
  const dept       = (member as any).department?.name ?? (member as any).departmentName ?? null;

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
            "& .card-actions": { opacity: 1, transform: "translateY(0px)" },
            "& .top-strip": { opacity: 1 },
          },
        }}
      >
        {/* ── Top gradient strip ───────────────────────────────── */}
        <Box
          className="top-strip"
          sx={{
            height: 4,
            background: `linear-gradient(90deg, ${palette.from}, ${palette.to})`,
            opacity: 0.6,
            transition: "opacity 0.24s",
          }}
        />

        {/* ── Header ───────────────────────────────────────────── */}
        <Box sx={{
          px: 2.5, pt: 2.5, pb: 2,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5,
          position: "relative",
          background: `radial-gradient(ellipse 160% 100% at 50% 0%, ${palette.from}0A 0%, transparent 65%)`,
        }}>

          {/* Avatar with gradient ring */}
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
            {/* Status dot */}
            <Box sx={{
              position: "absolute", bottom: 3, right: 3,
              width: 14, height: 14, borderRadius: "50%",
              bgcolor: status.dot, border: "2.5px solid #fff",
              boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
            }} />
          </Box>

          {/* Name + email */}
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

          {/* Role pill */}
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

        {/* ── Divider ───────────────────────────────────────────── */}
        <Box sx={{ mx: 2.5, height: "1px", bgcolor: "#F1F5F9" }} />

        {/* ── Body ─────────────────────────────────────────────── */}
        <Box sx={{ px: 2.5, pt: 1.75, pb: 2, display: "flex", flexDirection: "column", gap: 1.5, flex: 1 }}>

          {/* Department */}
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
              {dept ?? "No department assigned"}
            </Typography>
          </Box>

          {/* Footer: status pill + date */}
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

          {/* ── Action buttons (revealed on hover) ─────────────── */}
          <Box
            className="card-actions"
            onClick={(e) => e.stopPropagation()}
            sx={{
              display: "flex", gap: 0.75,
              opacity: 0,
              transform: "translateY(6px)",
              transition: "all 0.22s cubic-bezier(.4,0,.2,1)",
            }}
          >
            {/* View */}
            <Tooltip title="View profile" placement="top" arrow>
              <Box
                onClick={() => router.push(`/company/employees/${member.userId}`)}
                sx={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5,
                  py: 0.875, borderRadius: "10px",
                  bgcolor: "#F8FAFC", border: "1px solid #E8EAED",
                  cursor: "pointer", transition: "all 0.15s",
                  "&:hover": { bgcolor: "#F1F5F9", borderColor: "#CBD5E1" },
                }}
              >
                <OpenInNewOutlined sx={{ fontSize: 13, color: "#64748B" }} />
                <Typography sx={{ fontSize: "11.5px", fontWeight: 600, color: "#475569" }}>View</Typography>
              </Box>
            </Tooltip>

            {/* Edit */}
            <Tooltip title="Edit role" placement="top" arrow>
              <Box
                onClick={() => onEdit(member)}
                sx={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5,
                  py: 0.875, borderRadius: "10px",
                  bgcolor: `${PURPLE}08`, border: `1px solid ${PURPLE}20`,
                  cursor: "pointer", transition: "all 0.15s",
                  "&:hover": { bgcolor: `${PURPLE}15`, borderColor: `${PURPLE}40` },
                }}
              >
                <EditOutlined sx={{ fontSize: 13, color: PURPLE }} />
                <Typography sx={{ fontSize: "11.5px", fontWeight: 600, color: PURPLE }}>Edit</Typography>
              </Box>
            </Tooltip>

            {/* Delete */}
            <Tooltip title="Remove member" placement="top" arrow>
              <Box
                onClick={() => onDelete(member)}
                sx={{
                  width: 34, display: "flex", alignItems: "center", justifyContent: "center",
                  py: 0.875, borderRadius: "10px",
                  bgcolor: "#FEF2F2", border: "1px solid #FECACA",
                  cursor: "pointer", transition: "all 0.15s", flexShrink: 0,
                  "&:hover": { bgcolor: "#FEE2E2", borderColor: "#FCA5A5" },
                }}
              >
                <DeleteOutlineOutlined sx={{ fontSize: 14, color: "#EF4444" }} />
              </Box>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
});

EmployeeCard.displayName = "EmployeeCard";
export default EmployeeCard;
