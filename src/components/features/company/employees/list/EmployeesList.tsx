import React, { useState, useCallback } from "react";
import {
  Box, Typography, TextField, InputAdornment, Alert,
  Avatar, Chip, CircularProgress, IconButton, Menu, MenuItem, ListItemIcon, ListItemText,
} from "@mui/material";
import SectionCard from "@/components/dashboard-workplace/ui/SectionCard";
import SectionHeader from "@/components/dashboard-workplace/ui/SectionHeader";
import LoadingOverlay from "@/components/dashboard-workplace/ui/LoadingOverlay";
import TabBar from "@/components/dashboard-workplace/ui/TabBar";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import SendOutlined from "@mui/icons-material/SendOutlined";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import MoreVertOutlined from "@mui/icons-material/MoreVert";
import EmployeeCard from "./EmployeeCard";
import { Member } from "@/store/slices/memberSlice";
import { Invitation } from "@/components/dashboard-company/PendingInvitationsList";

const PURPLE = "#8310FF";
const AMBER  = "#D97706";

const ROLE_LABELS: Record<string, string> = {
  RH: "HR", TechLead: "Tech Lead", Supervisor: "Supervisor", Manager: "Manager",
  hr: "HR", technical_leader: "Tech Lead", supervisor: "Supervisor", manager: "Manager",
};

const ROLE_STYLES: Record<string, { color: string; bg: string }> = {
  RH: { color: "#16A34A", bg: "#F0FDF4" }, TechLead: { color: "#0891B2", bg: "#ECFEFF" },
  Supervisor: { color: AMBER, bg: "#FFFBEB" }, Manager: { color: PURPLE, bg: "#F5F3FF" },
  hr: { color: "#16A34A", bg: "#F0FDF4" }, technical_leader: { color: "#0891B2", bg: "#ECFEFF" },
  supervisor: { color: AMBER, bg: "#FFFBEB" }, manager: { color: PURPLE, bg: "#F5F3FF" },
};

const AVATAR_GRADIENTS = [
  "135deg, #8310FF, #A855F7", "135deg, #0D9488, #34D399",
  "135deg, #0891B2, #38BDF8", "135deg, #D97706, #FCD34D",
  "135deg, #DC2626, #F87171",
];

function pickGradient(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_GRADIENTS[Math.abs(h) % AVATAR_GRADIENTS.length];
}

type TabType = "active" | "pending";
interface TabItem { id: string; label: string; count: number; }

interface EmployeesListProps {
  members: Member[];
  loading: boolean;
  error: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  tabItems: TabItem[];
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
  onSelect: (member: Member) => void;
  invitations?: Invitation[];
  fetchingInvitations?: boolean;
  onResend?: (id: string) => Promise<void>;
  onCancel?: (id: string) => Promise<void>;
}

/* ── Invitation card — same shell as EmployeeCard ── */
const InvitationCard: React.FC<{
  invitation: Invitation;
  onResend: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
}> = ({ invitation, onResend, onCancel }) => {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const [busy, setBusy]     = useState(false);

  const roleStyle = ROLE_STYLES[invitation.role] ?? { color: AMBER, bg: "#FFFBEB" };
  const roleLabel = ROLE_LABELS[invitation.role] || invitation.role;
  const letter    = invitation.email[0]?.toUpperCase() || "?";

  const handleResend = useCallback(async () => {
    setAnchor(null); setBusy(true);
    try { await onResend(invitation._id); } finally { setBusy(false); }
  }, [invitation._id, onResend]);

  const handleCancel = useCallback(async () => {
    setAnchor(null); setBusy(true);
    try { await onCancel(invitation._id); } finally { setBusy(false); }
  }, [invitation._id, onCancel]);

  return (
    <Box sx={{
      bgcolor: "#fff", borderRadius: "16px", border: "1px solid #F1F5F9",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)", overflow: "hidden",
      transition: "all 0.2s ease",
      "&:hover": { transform: "translateY(-2px)", boxShadow: "0 8px 24px rgba(215,119,6,0.10)", borderColor: "#FDE68A" },
    }}>
      <Box sx={{ height: 4, background: `linear-gradient(90deg, ${AMBER}, #FCD34D)` }} />
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
          <Avatar sx={{
            width: 52, height: 52, fontWeight: 800, fontSize: "1.2rem", color: "#fff",
            background: `linear-gradient(${pickGradient(invitation.email)})`,
            boxShadow: "0 4px 12px rgba(0,0,0,0.12)", border: "2px solid #fff",
          }}>{letter}</Avatar>

          {busy ? (
            <CircularProgress size={18} sx={{ color: PURPLE, mt: 0.5 }} />
          ) : (
            <>
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); setAnchor(e.currentTarget); }}
                sx={{ color: "#CBD5E1", "&:hover": { bgcolor: "#F8FAFC", color: "#64748B" } }}>
                <MoreVertOutlined sx={{ fontSize: 18 }} />
              </IconButton>
              <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                slotProps={{ paper: { elevation: 0, sx: {
                  borderRadius: "12px", border: "1px solid #F1F5F9",
                  boxShadow: "0 8px 28px rgba(0,0,0,0.10)", minWidth: 160, mt: 0.5,
                }}}}>
                <MenuItem onClick={handleResend} sx={{ py: 1.25, px: 2, gap: 1.5, "&:hover": { bgcolor: "#F5F3FF" } }}>
                  <ListItemIcon sx={{ minWidth: "auto" }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: "8px", bgcolor: "#F5F3FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <SendOutlined sx={{ fontSize: 14, color: PURPLE }} />
                    </Box>
                  </ListItemIcon>
                  <ListItemText slotProps={{ primary: { style: { fontSize: "13px", fontWeight: 600, color: "#374151" } } }}>Resend</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleCancel} sx={{ py: 1.25, px: 2, gap: 1.5, "&:hover": { bgcolor: "#FEF2F2" } }}>
                  <ListItemIcon sx={{ minWidth: "auto" }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: "8px", bgcolor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <DeleteOutlined sx={{ fontSize: 14, color: "#EF4444" }} />
                    </Box>
                  </ListItemIcon>
                  <ListItemText slotProps={{ primary: { style: { fontSize: "13px", fontWeight: 600, color: "#EF4444" } } }}>Cancel</ListItemText>
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>

        <Typography sx={{ fontWeight: 700, fontSize: "15px", color: "#111827", mb: 0.25 }}>
          {invitation.email}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 2 }}>
          <EmailOutlined sx={{ fontSize: 12, color: "#9CA3AF" }} />
          <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>Invitation sent</Typography>
        </Box>

        <Box sx={{ height: "1px", bgcolor: "#F1F5F9", mb: 2 }} />

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Chip label={roleLabel} size="small" sx={{
            fontWeight: 700, fontSize: "11px", height: 24,
            color: roleStyle.color, bgcolor: roleStyle.bg,
            border: `1px solid ${roleStyle.color}25`, borderRadius: "6px",
            "& .MuiChip-label": { px: 1 },
          }} />
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: AMBER }} />
            <Typography sx={{ fontSize: "11px", fontWeight: 600, color: AMBER }}>Pending</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const GRID = { display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(3, 1fr)" }, gap: 2 };

/* ── Main component ── */
const EmployeesList: React.FC<EmployeesListProps> = ({
  members, loading, error, search, onSearchChange,
  activeTab, onTabChange, tabItems, onEdit, onDelete, onSelect,
  invitations = [], fetchingInvitations = false, onResend, onCancel,
}) => {

  const showInvitations = activeTab === "pending" && invitations.length > 0 && onResend && onCancel;
  const totalShown = members.length + (showInvitations ? invitations.length : 0);

  const body = () => {
    if (loading) return <LoadingOverlay height={300} message="Loading team members…" color={PURPLE} />;
    if (error)   return <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>;

    const noMembers  = members.length === 0;
    const noInvites  = !showInvitations;

    if (noMembers && noInvites) return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 6, gap: 2 }}>
        <Box sx={{ width: 72, height: 72, borderRadius: "50%", bgcolor: "#F5F3FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <PeopleAltOutlined sx={{ fontSize: 36, color: "#C4B5FD" }} />
        </Box>
        <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#374151" }}>
          {search ? "No members match your search" : "No team members yet"}
        </Typography>
        <Typography sx={{ fontSize: "0.875rem", color: "#9CA3AF", textAlign: "center", maxWidth: 300 }}>
          {search ? "Try different keywords or clear the search." : "Invite your first team member to get started."}
        </Typography>
      </Box>
    );

    return (
      <>
        {/* Member cards */}
        {members.length > 0 && (
          <Box sx={{ ...GRID, mb: showInvitations ? 3 : 0 }}>
            {members.map((m) => (
              <EmployeeCard key={m._id} member={m} onEdit={onEdit} onDelete={onDelete} onSelect={onSelect} />
            ))}
          </Box>
        )}

        {/* Invitation cards (pending tab only) */}
        {showInvitations && (
          <>
            {members.length > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                <Box sx={{ height: 1, flex: 1, bgcolor: "#F1F5F9" }} />
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, px: 1.5, py: 0.5, borderRadius: 999, bgcolor: `${AMBER}12` }}>
                  <EmailOutlined sx={{ fontSize: 13, color: AMBER }} />
                  <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: AMBER }}>
                    {invitations.length} Invitation{invitations.length !== 1 ? "s" : ""}
                  </Typography>
                </Box>
                <Box sx={{ height: 1, flex: 1, bgcolor: "#F1F5F9" }} />
              </Box>
            )}
            {fetchingInvitations ? (
              <LoadingOverlay height={120} message="Loading invitations…" color={AMBER} />
            ) : (
              <Box sx={GRID}>
                {invitations.map((inv) => (
                  <InvitationCard key={inv._id} invitation={inv} onResend={onResend!} onCancel={onCancel!} />
                ))}
              </Box>
            )}
          </>
        )}
      </>
    );
  };

  return (
    <SectionCard>
      <SectionHeader
        title="Team Members"
        subtitle={`${totalShown} ${totalShown !== 1 ? "members" : "member"} shown`}
      />

      <TextField size="small" fullWidth placeholder="Search by name or email…"
        value={search} onChange={(e) => onSearchChange(e.target.value)}
        slotProps={{ input: { startAdornment: (
          <InputAdornment position="start">
            <SearchOutlined sx={{ fontSize: 18, color: "#9CA3AF" }} />
          </InputAdornment>
        )}}}
        sx={{
          mb: 2,
          "& .MuiOutlinedInput-root": {
            borderRadius: 2, bgcolor: "#F8FAFC",
            "& fieldset": { borderColor: "#E2E8F0" },
            "&:hover fieldset": { borderColor: "#CBD5E1" },
            "&.Mui-focused fieldset": { borderColor: PURPLE },
          },
        }}
      />

      <TabBar tabs={tabItems} activeTab={activeTab} onChange={(id) => onTabChange(id as TabType)} color={PURPLE} />

      {body()}
    </SectionCard>
  );
};

export default EmployeesList;
