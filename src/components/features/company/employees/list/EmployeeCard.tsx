import React, { memo, useState } from "react";
import { useRouter } from "next/router";
import {
  Box, Typography, Avatar, Chip, IconButton,
  Menu, MenuItem, ListItemIcon, ListItemText,
} from "@mui/material";
import { motion } from "framer-motion";
import MoreVertOutlined from "@mui/icons-material/MoreVert";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import { Member } from "@/store/slices/memberSlice";

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

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
  active:   { color: "#16A34A", bg: "#DCFCE7" },
  pending:  { color: "#D97706", bg: "#FEF3C7" },
  inactive: { color: "#9CA3AF", bg: "#F3F4F6" },
};

const AVATAR_GRADIENTS = [
  "135deg, #8310FF, #A855F7",
  "135deg, #0D9488, #34D399",
  "135deg, #0891B2, #38BDF8",
  "135deg, #D97706, #FCD34D",
  "135deg, #DC2626, #F87171",
];

function pickGradient(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_GRADIENTS[Math.abs(h) % AVATAR_GRADIENTS.length];
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
  const router  = useRouter();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const name        = member.user?.username || "Pending";
  const email       = member.user?.email    || "No email";
  const letter      = name[0]?.toUpperCase() || "U";
  const roleStyle   = ROLE_STYLES[member.role]     ?? ROLE_STYLES.Manager;
  const statusStyle = STATUS_STYLES[member.status] ?? STATUS_STYLES.pending;
  const roleLabel   = ROLE_LABELS[member.role]     ?? member.role;
  const statusLabel = member.status.charAt(0).toUpperCase() + member.status.slice(1);
  const joinedDate  = fmtDate((member as any).createdAt);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      style={{ height: "100%" }}
    >
      <Box
        onClick={() => router.push(`/company/employees/${member._id}`)}
        sx={{
          bgcolor: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: 3,
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          height: "100%",
          cursor: "pointer",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          "&:hover": { boxShadow: "0 6px 24px rgba(0,0,0,0.10)", borderColor: `${roleStyle.color}50`, transform: "translateY(-2px)" },
          transition: "all 0.2s",
        }}
      >
        {/* Header: avatar + name + menu */}
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar sx={{
              width: 42, height: 42, fontWeight: 800, fontSize: "0.95rem", color: "#fff",
              background: `linear-gradient(${pickGradient(email)})`,
              flexShrink: 0,
            }}>
              {letter}
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827", lineHeight: 1.3 }}>
                {name}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, mt: 0.2 }}>
                <EmailOutlined sx={{ fontSize: 11, color: "#9CA3AF" }} />
                <Typography sx={{ fontSize: "11px", color: "#9CA3AF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>
                  {email}
                </Typography>
              </Box>
            </Box>
          </Box>

          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); setAnchor(e.currentTarget); }}
            sx={{ color: "#CBD5E1", flexShrink: 0, "&:hover": { bgcolor: "#F8FAFC", color: "#64748B" } }}
          >
            <MoreVertOutlined sx={{ fontSize: 18 }} />
          </IconButton>

          <Menu
            anchorEl={anchor}
            open={Boolean(anchor)}
            onClose={() => setAnchor(null)}
            onClick={(e) => e.stopPropagation()}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            slotProps={{ paper: { elevation: 0, sx: {
              borderRadius: "12px", border: "1px solid #F1F5F9",
              boxShadow: "0 8px 28px rgba(0,0,0,0.10)", minWidth: 160, mt: 0.5,
            }}}}
          >
            <MenuItem onClick={() => { setAnchor(null); onEdit(member); }} sx={{ py: 1.25, px: 2, gap: 1.5, "&:hover": { bgcolor: "#F5F3FF" } }}>
              <ListItemIcon sx={{ minWidth: "auto" }}>
                <Box sx={{ width: 28, height: 28, borderRadius: "8px", bgcolor: "#F5F3FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <EditOutlined sx={{ fontSize: 14, color: PURPLE }} />
                </Box>
              </ListItemIcon>
              <ListItemText slotProps={{ primary: { style: { fontSize: "13px", fontWeight: 600, color: "#374151" } } }}>Edit Role</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { setAnchor(null); onDelete(member); }} sx={{ py: 1.25, px: 2, gap: 1.5, "&:hover": { bgcolor: "#FEF2F2" } }}>
              <ListItemIcon sx={{ minWidth: "auto" }}>
                <Box sx={{ width: 28, height: 28, borderRadius: "8px", bgcolor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <DeleteOutlineOutlined sx={{ fontSize: 14, color: "#EF4444" }} />
                </Box>
              </ListItemIcon>
              <ListItemText slotProps={{ primary: { style: { fontSize: "13px", fontWeight: 600, color: "#EF4444" } } }}>Remove</ListItemText>
            </MenuItem>
          </Menu>
        </Box>

        {/* Role chip — body */}
        <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
          <Chip
            label={roleLabel}
            size="small"
            sx={{
              fontWeight: 700, fontSize: "11px", height: 24,
              color: roleStyle.color, bgcolor: roleStyle.bg,
              border: `1px solid ${roleStyle.color}25`, borderRadius: "6px",
              "& .MuiChip-label": { px: 1 },
            }}
          />
        </Box>

        {/* Footer: status dot + joined date */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pt: 1.5, borderTop: "1px solid #F3F4F6" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: statusStyle.color }} />
            <Typography sx={{ fontSize: "11px", fontWeight: 600, color: statusStyle.color }}>
              {statusLabel}
            </Typography>
          </Box>
          {joinedDate && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <CalendarTodayOutlined sx={{ fontSize: 11, color: "#9CA3AF" }} />
              <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>{joinedDate}</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </motion.div>
  );
});

export default EmployeeCard;
