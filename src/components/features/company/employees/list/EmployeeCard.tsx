import React, { memo, useState } from "react";
import {
  Box, Typography, Avatar, IconButton,
  Menu, MenuItem, ListItemIcon, ListItemText,
} from "@mui/material";
import { motion } from "framer-motion";
import MoreVertOutlined from "@mui/icons-material/MoreVert";
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

const STATUS_STYLES: Record<string, { color: string; dot: string; label: string }> = {
  active:   { color: "#16A34A", dot: "#22C55E", label: "Active"   },
  pending:  { color: "#D97706", dot: "#F59E0B", label: "Pending"  },
  inactive: { color: "#9CA3AF", dot: "#D1D5DB", label: "Inactive" },
};

// Soft muted avatar palettes — no harsh saturation
const AVATAR_PALETTES = [
  { from: "#A78BFA", to: "#7C3AED" }, // soft violet
  { from: "#6EE7B7", to: "#059669" }, // soft emerald
  { from: "#7DD3FC", to: "#0369A1" }, // soft sky
  { from: "#FCA5A5", to: "#DC2626" }, // soft rose
  { from: "#FCD34D", to: "#B45309" }, // soft amber
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
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const name    = member.user?.username || "Unnamed";
  const email   = member.user?.email    || "";
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.26, ease: "easeOut" }}
      style={{ height: "100%" }}
    >
      <Box
        onClick={() => onSelect(member)}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: "18px",
          cursor: "pointer",
          bgcolor: "#fff",
          border: "1px solid #EBEBEB",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          transition: "all 0.22s ease",
          "&:hover": {
            borderColor: "#D8D8DC",
            boxShadow: "0 8px 28px rgba(0,0,0,0.08)",
            transform: "translateY(-3px)",
            "& .menu-btn": { opacity: 1 },
          },
        }}
      >
        {/* ── Header ───────────────────────────────────────────── */}
        <Box sx={{
          bgcolor: "#F7F7F8",
          borderRadius: "18px 18px 0 0",
          pt: 3.5, pb: 3, px: 2.5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1.5,
          position: "relative",
          borderBottom: "1px solid #EBEBEB",
        }}>

          {/* Menu */}
          <IconButton
            size="small"
            className="menu-btn"
            onClick={(e) => { e.stopPropagation(); setAnchor(e.currentTarget); }}
            sx={{
              position: "absolute", top: 10, right: 10,
              opacity: 0, transition: "opacity 0.18s",
              color: "#9CA3AF", p: "5px", borderRadius: "9px",
              "&:hover": { bgcolor: "#EBEBEB", color: "#374151" },
            }}
          >
            <MoreVertOutlined sx={{ fontSize: 16 }} />
          </IconButton>

          <Menu
            anchorEl={anchor}
            open={Boolean(anchor)}
            onClose={() => setAnchor(null)}
            onClick={(e) => e.stopPropagation()}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            slotProps={{ paper: { elevation: 0, sx: {
              borderRadius: "14px",
              border: "1px solid #EBEBEB",
              boxShadow: "0 12px 36px rgba(0,0,0,0.09)",
              minWidth: 168, mt: 0.5,
            }}}}
          >
            <MenuItem onClick={() => { setAnchor(null); onSelect(member); }}
              sx={{ py: 1.125, px: 1.75, gap: 1.25, "&:hover": { bgcolor: "#F7F7F8" } }}>
              <ListItemIcon sx={{ minWidth: "auto" }}>
                <Box sx={{ width: 26, height: 26, borderRadius: "8px", bgcolor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <OpenInNewOutlined sx={{ fontSize: 13, color: "#6B7280" }} />
                </Box>
              </ListItemIcon>
              <ListItemText slotProps={{ primary: { style: { fontSize: "13px", fontWeight: 600, color: "#374151" } } }}>View Profile</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { setAnchor(null); onEdit(member); }}
              sx={{ py: 1.125, px: 1.75, gap: 1.25, "&:hover": { bgcolor: "#F5F3FF" } }}>
              <ListItemIcon sx={{ minWidth: "auto" }}>
                <Box sx={{ width: 26, height: 26, borderRadius: "8px", bgcolor: "#F5F3FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <EditOutlined sx={{ fontSize: 13, color: PURPLE }} />
                </Box>
              </ListItemIcon>
              <ListItemText slotProps={{ primary: { style: { fontSize: "13px", fontWeight: 600, color: "#374151" } } }}>Edit Role</ListItemText>
            </MenuItem>
            <Box sx={{ mx: 1.25, my: 0.5, height: "1px", bgcolor: "#F3F4F6" }} />
            <MenuItem onClick={() => { setAnchor(null); onDelete(member); }}
              sx={{ py: 1.125, px: 1.75, gap: 1.25, "&:hover": { bgcolor: "#FEF2F2" } }}>
              <ListItemIcon sx={{ minWidth: "auto" }}>
                <Box sx={{ width: 26, height: 26, borderRadius: "8px", bgcolor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <DeleteOutlineOutlined sx={{ fontSize: 13, color: "#EF4444" }} />
                </Box>
              </ListItemIcon>
              <ListItemText slotProps={{ primary: { style: { fontSize: "13px", fontWeight: 600, color: "#EF4444" } } }}>Remove</ListItemText>
            </MenuItem>
          </Menu>

          {/* Avatar */}
          <Box sx={{ position: "relative" }}>
            <Avatar sx={{
              width: 64, height: 64,
              fontSize: "1.35rem", fontWeight: 800, color: "#fff",
              background: `linear-gradient(145deg, ${palette.from}, ${palette.to})`,
              boxShadow: "0 4px 14px rgba(0,0,0,0.10)",
            }}>
              {letter}
            </Avatar>
            <Box sx={{
              position: "absolute", bottom: 2, right: 2,
              width: 12, height: 12, borderRadius: "50%",
              bgcolor: status.dot,
              border: "2.5px solid #F7F7F8",
            }} />
          </Box>

          {/* Name + email */}
          <Box sx={{ textAlign: "center", width: "100%", px: 0.5 }}>
            <Typography sx={{
              fontSize: "14.5px", fontWeight: 700, color: "#1A1A2E",
              lineHeight: 1.35,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {name}
            </Typography>
            <Typography sx={{
              fontSize: "12px", color: "#B0B7C3", mt: 0.4,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              letterSpacing: "0.01em",
            }}>
              {email}
            </Typography>
          </Box>
        </Box>

        {/* ── Body ─────────────────────────────────────────────── */}
        <Box sx={{ px: 2.5, pt: 2, pb: 2.5, display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>

          {/* Role + Department — 2-column info grid */}
          <Box sx={{
            display: "grid",
            gridTemplateColumns: dept ? "1fr 1px 1fr" : "1fr",
            bgcolor: "#F7F7F8",
            borderRadius: "12px",
            border: "1px solid #EBEBEB",
            overflow: "hidden",
          }}>
            {/* Role cell */}
            <Box sx={{ px: 1.5, py: 1.25, display: "flex", flexDirection: "column", gap: 0.4 }}>
              <Typography sx={{ fontSize: "10px", fontWeight: 600, color: "#B0B7C3", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Role
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {RoleIcon && (
                  <Box sx={{ display: "flex", alignItems: "center", color: roleColor, flexShrink: 0, "& svg": { fontSize: 12 } }}>
                    <RoleIcon />
                  </Box>
                )}
                <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {roleLabel}
                </Typography>
              </Box>
            </Box>

            {/* Vertical divider */}
            {dept && <Box sx={{ bgcolor: "#EBEBEB", width: "1px" }} />}

            {/* Department cell */}
            {dept && (
              <Box sx={{ px: 1.5, py: 1.25, display: "flex", flexDirection: "column", gap: 0.4 }}>
                <Typography sx={{ fontSize: "10px", fontWeight: 600, color: "#B0B7C3", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Dept
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <BusinessOutlined sx={{ fontSize: 12, color: "#9CA3AF", flexShrink: 0 }} />
                  <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {dept}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          {/* Footer */}
          <Box sx={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            pt: 1.75, mt: "auto", borderTop: "1px solid #F3F4F6",
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: status.dot }} />
              <Typography sx={{ fontSize: "11.5px", fontWeight: 600, color: status.color }}>
                {status.label}
              </Typography>
            </Box>
            {joinedDate && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                <CalendarTodayOutlined sx={{ fontSize: 10, color: "#D1D5DB" }} />
                <Typography sx={{ fontSize: "11px", color: "#C4C9D4" }}>
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
