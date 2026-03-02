import React from "react";
import { Box, Typography, Avatar, Chip, Button } from "@mui/material";
import ArrowBackOutlined from "@mui/icons-material/ArrowBackOutlined";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import BadgeOutlined from "@mui/icons-material/BadgeOutlined";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import UpdateOutlined from "@mui/icons-material/UpdateOutlined";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { Member } from "@/store/slices/memberSlice";

const PURPLE = "#8310FF";

const ROLE_LABELS: Record<string, string> = {
  RH: "HR", TechLead: "Technical Leader",
  Supervisor: "Supervisor", Manager: "Manager", Owner: "Owner",
};

const ROLE_STYLES: Record<string, { color: string; bg: string }> = {
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

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

/* ── Exact same card shell as EmployeeCard ── */
const ECard: React.FC<{ children: React.ReactNode; c1?: string; c2?: string }> = ({ children }) => (
  <Box sx={{
    bgcolor: "#fff",
    borderRadius: "16px",
    border: "1px solid #F1F5F9",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    overflow: "hidden",
  }}>
    <Box sx={{ p: 2.5 }}>{children}</Box>
  </Box>
);

/* ── StatCard-style info row (icon box + label + value) ── */
const InfoRow: React.FC<{ icon: React.ReactNode; iconColor: string; label: string; value: string; valueColor?: string }> = ({
  icon, iconColor, label, value, valueColor,
}) => (
  <Box sx={{
    display: "flex", alignItems: "center", gap: 1.5,
    px: 2, py: 1.5,
    borderRadius: "12px",
    border: "1px solid #F1F5F9",
    bgcolor: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  }}>
    {/* Icon box — StatCard style */}
    <Box sx={{
      width: 40, height: 40, borderRadius: 2, flexShrink: 0,
      bgcolor: `${iconColor}18`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: iconColor, "& svg": { fontSize: 20 },
    }}>
      {icon}
    </Box>
    {/* Label + value */}
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontSize: "0.72rem", color: "#9CA3AF", fontWeight: 500, lineHeight: 1.2 }}>
        {label}
      </Typography>
      <Typography sx={{
        fontSize: "0.875rem", fontWeight: 700,
        color: valueColor ?? "#111827",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

interface EmployeeDetailProps {
  member: Member;
  onBack: () => void;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
}

const EmployeeDetail: React.FC<EmployeeDetailProps> = ({ member, onBack, onEdit, onDelete }) => {
  const name        = member.user?.username || "Pending";
  const email       = member.user?.email    || "No email";
  const letter      = name[0]?.toUpperCase() || "U";
  const roleStyle   = ROLE_STYLES[member.role]     ?? ROLE_STYLES.Manager;
  const statusStyle = STATUS_STYLES[member.status] ?? STATUS_STYLES.pending;
  const roleLabel   = ROLE_LABELS[member.role]     ?? member.role;
  const statusLabel = member.status.charAt(0).toUpperCase() + member.status.slice(1);

  return (
    <Box>
      {/* Back */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackOutlined />}
          onClick={onBack}
          sx={{
            textTransform: "none", fontWeight: 600, color: "#6B7280", fontSize: "0.875rem",
            "&:hover": { bgcolor: "#F3F4F6", color: "#374151" },
            borderRadius: "10px", px: 2,
          }}
        >
          Back to Employees
        </Button>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "300px 1fr" }, gap: 2.5, alignItems: "start" }}>

        {/* ── Left: profile card (same as EmployeeCard) ── */}
        <ECard c1={roleStyle.color} c2={statusStyle.color}>
          {/* Avatar + name + email */}
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
            <Avatar sx={{
              width: 52, height: 52, fontWeight: 800, fontSize: "1.2rem", color: "#fff",
              background: `linear-gradient(${pickGradient(email)})`,
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)", border: "2px solid #fff",
            }}>
              {letter}
            </Avatar>
          </Box>

          <Typography sx={{ fontWeight: 700, fontSize: "15px", color: "#111827", mb: 0.25 }}>
            {name}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 2 }}>
            <EmailOutlined sx={{ fontSize: 12, color: "#9CA3AF" }} />
            <Typography sx={{ fontSize: "12px", color: "#9CA3AF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {email}
            </Typography>
          </Box>

          {/* Divider */}
          <Box sx={{ height: "1px", bgcolor: "#F1F5F9", mb: 2 }} />

          {/* Role + Status — same as EmployeeCard bottom row */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
            <Chip label={roleLabel} size="small" sx={{
              fontWeight: 700, fontSize: "11px", height: 24,
              color: roleStyle.color, bgcolor: roleStyle.bg,
              border: `1px solid ${roleStyle.color}25`, borderRadius: "6px",
              "& .MuiChip-label": { px: 1 },
            }} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: statusStyle.color }} />
              <Typography sx={{ fontSize: "11px", fontWeight: 600, color: statusStyle.color }}>
                {statusLabel}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ height: "1px", bgcolor: "#F1F5F9", mb: 2 }} />

          {/* Actions */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Button
              fullWidth startIcon={<EditOutlined />} onClick={() => onEdit(member)}
              variant="outlined"
              sx={{
                textTransform: "none", fontWeight: 600, borderRadius: "10px", fontSize: "0.8rem",
                borderColor: PURPLE, color: PURPLE,
                "&:hover": { bgcolor: "#F5F3FF", borderColor: PURPLE },
              }}
            >
              Edit Role
            </Button>
            <Button
              fullWidth startIcon={<DeleteOutlineOutlined />} onClick={() => onDelete(member)}
              variant="outlined"
              sx={{
                textTransform: "none", fontWeight: 600, borderRadius: "10px", fontSize: "0.8rem",
                borderColor: "#FECACA", color: "#EF4444",
                "&:hover": { bgcolor: "#FEF2F2", borderColor: "#EF4444" },
              }}
            >
              Remove Member
            </Button>
          </Box>
        </ECard>

        {/* ── Right: info cards ── */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

          {/* Member Information card */}
          <ECard c1={PURPLE} c2="#A855F7">
            <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#111827", mb: 2 }}>
              Member Information
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <InfoRow icon={<EmailOutlined />}          iconColor="#0891B2" label="Email"        value={email} />
              <InfoRow icon={<BadgeOutlined />}          iconColor={roleStyle.color}  label="Role"  value={roleLabel} />
              <InfoRow
                icon={<FiberManualRecordIcon sx={{ fontSize: "12px !important" }} />}
                iconColor={statusStyle.color} label="Status" value={statusLabel} valueColor={statusStyle.color}
              />
              <InfoRow icon={<CalendarTodayOutlined />}  iconColor="#16A34A" label="Joined"       value={member.createdAt ? fmtDate(member.createdAt) : "—"} />
              <InfoRow icon={<UpdateOutlined />}         iconColor="#D97706" label="Last Updated"  value={member.updatedAt ? fmtDate(member.updatedAt) : "—"} />
            </Box>
          </ECard>

          {/* Organization card */}
          <ECard c1="#0891B2" c2="#22D3EE">
            <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#111827", mb: 2 }}>
              Organization
            </Typography>
            <InfoRow
              icon={<WorkOutlined />}
              iconColor={PURPLE}
              label="Organization ID"
              value={member.Organization || "—"}
            />
          </ECard>

        </Box>
      </Box>
    </Box>
  );
};

export default EmployeeDetail;
