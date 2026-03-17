import React, { memo, useState, useCallback } from "react";
import {
  Box, Typography, TextField, InputAdornment, Alert, Skeleton,
  Chip, Menu, MenuItem, CircularProgress, Avatar, ListItemIcon, ListItemText, IconButton,
} from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import FilterListOutlined from "@mui/icons-material/FilterListOutlined";
import SortOutlined from "@mui/icons-material/SortOutlined";
import KeyboardArrowDownOutlined from "@mui/icons-material/KeyboardArrowDownOutlined";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import SendOutlined from "@mui/icons-material/SendOutlined";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import MoreVertOutlined from "@mui/icons-material/MoreVert";
import EmployeeCard, { ROLE_LABELS, ROLE_STYLES } from "./EmployeeCard";
import { Member } from "@/store/slices/memberSlice";
import { Invitation } from "@/types/employee";

const PURPLE = "#8310FF";
const AMBER  = "#D97706";

export type RoleFilter = "all" | "RH" | "TechLead" | "Supervisor" | "Manager" | "Owner";
export type SortOption = "newest" | "name-asc" | "name-desc";

const ROLE_FILTERS: { id: RoleFilter; label: string }[] = [
  { id: "all",        label: "All"      },
  { id: "Owner",      label: "Owner"    },
  { id: "Manager",    label: "Manager"  },
  { id: "TechLead",   label: "Tech Lead"},
  { id: "Supervisor", label: "Supervisor"},
  { id: "RH",         label: "HR"       },
];

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: "newest",    label: "Newest first" },
  { id: "name-asc",  label: "Name A → Z"  },
  { id: "name-desc", label: "Name Z → A"  },
];

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

interface EmployeesListProps {
  members: Member[];
  loading: boolean;
  error: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  roleFilter: RoleFilter;
  onRoleFilterChange: (f: RoleFilter) => void;
  sortBy: SortOption;
  onSortChange: (s: SortOption) => void;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
  onSelect: (member: Member) => void;
  invitations?: Invitation[];
  fetchingInvitations?: boolean;
  onResend?: (id: string) => Promise<void>;
  onCancel?: (id: string) => Promise<void>;
}

const GRID = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
  gap: 1.5,
};

const EmployeeSkeletonCard: React.FC = () => (
  <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: 3, p: 3, display: "flex", flexDirection: "column", gap: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Skeleton variant="circular" width={42} height={42} />
        <Box>
          <Skeleton variant="text" width={120} height={18} />
          <Skeleton variant="text" width={90} height={13} />
        </Box>
      </Box>
      <Skeleton variant="circular" width={28} height={28} />
    </Box>
    <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: "6px" }} />
    <Box sx={{ pt: 1.5, borderTop: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between" }}>
      <Skeleton variant="text" width={60} height={13} />
      <Skeleton variant="text" width={80} height={13} />
    </Box>
  </Box>
);

const SortButton: React.FC<{ sortBy: SortOption; onChange: (s: SortOption) => void }> = ({ sortBy, onChange }) => {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const current = SORT_OPTIONS.find((o) => o.id === sortBy)!;
  return (
    <>
      <Box
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{
          display: "flex", alignItems: "center", gap: 0.75,
          px: 1.5, py: 0.75, borderRadius: 2, cursor: "pointer",
          border: "1px solid #E5E7EB", bgcolor: "#fff",
          "&:hover": { borderColor: "#D1D5DB", bgcolor: "#F9FAFB" },
          transition: "all 0.15s", userSelect: "none",
        }}
      >
        <SortOutlined sx={{ fontSize: 16, color: "#6B7280" }} />
        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>{current.label}</Typography>
        <KeyboardArrowDownOutlined sx={{ fontSize: 15, color: "#9CA3AF" }} />
      </Box>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        PaperProps={{ sx: { borderRadius: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid #E5E7EB", minWidth: 160 } }}
      >
        {SORT_OPTIONS.map((o) => (
          <MenuItem
            key={o.id}
            selected={o.id === sortBy}
            onClick={() => { onChange(o.id); setAnchor(null); }}
            sx={{ fontSize: "13px", fontWeight: o.id === sortBy ? 700 : 500, color: o.id === sortBy ? PURPLE : "#374151" }}
          >
            {o.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

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
      bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: 3, p: 3,
      display: "flex", flexDirection: "column", gap: 2,
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      "&:hover": { boxShadow: "0 6px 24px rgba(0,0,0,0.10)", borderColor: `${AMBER}50`, transform: "translateY(-2px)" },
      transition: "all 0.2s",
    }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ width: 42, height: 42, fontWeight: 800, fontSize: "0.95rem", color: "#fff", background: `linear-gradient(${pickGradient(invitation.email)})`, flexShrink: 0 }}>
            {letter}
          </Avatar>
          <Box>
            <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#111827", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>
              {invitation.email}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, mt: 0.2 }}>
              <EmailOutlined sx={{ fontSize: 11, color: "#9CA3AF" }} />
              <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>Invitation sent</Typography>
            </Box>
          </Box>
        </Box>
        {busy ? (
          <CircularProgress size={18} sx={{ color: PURPLE, mt: 0.5, flexShrink: 0 }} />
        ) : (
          <>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); setAnchor(e.currentTarget); }}
              sx={{ color: "#CBD5E1", flexShrink: 0, "&:hover": { bgcolor: "#F8FAFC", color: "#64748B" } }}>
              <MoreVertOutlined sx={{ fontSize: 18 }} />
            </IconButton>
            <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              slotProps={{ paper: { elevation: 0, sx: { borderRadius: "12px", border: "1px solid #F1F5F9", boxShadow: "0 8px 28px rgba(0,0,0,0.10)", minWidth: 160, mt: 0.5 }}}}>
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

      <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
        <Chip label={roleLabel} size="small" sx={{
          fontWeight: 700, fontSize: "11px", height: 24,
          color: roleStyle.color, bgcolor: roleStyle.bg,
          border: `1px solid ${roleStyle.color}25`, borderRadius: "6px",
          "& .MuiChip-label": { px: 1 },
        }} />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pt: 1.5, borderTop: "1px solid #F3F4F6" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: AMBER }} />
          <Typography sx={{ fontSize: "11px", fontWeight: 600, color: AMBER }}>Pending</Typography>
        </Box>
      </Box>
    </Box>
  );
};

const EmployeesList: React.FC<EmployeesListProps> = memo(({
  members, loading, error, search, onSearchChange,
  roleFilter, onRoleFilterChange, sortBy, onSortChange,
  onEdit, onDelete, onSelect,
  invitations = [], fetchingInvitations = false, onResend, onCancel,
}) => {
  const showInvitations = invitations.length > 0 && onResend && onCancel;

  return (
    <Box>
      {/* Toolbar */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
        {/* Row 1: search + sort */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined sx={{ fontSize: 18, color: "#9CA3AF" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              flexGrow: 1, maxWidth: 420,
              "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "14px", bgcolor: "#fff" },
            }}
          />
          <SortButton sortBy={sortBy} onChange={onSortChange} />
        </Box>

        {/* Row 2: role filter chips */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mr: 0.5 }}>
            <FilterListOutlined sx={{ fontSize: 14, color: "#9CA3AF" }} />
            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#9CA3AF", whiteSpace: "nowrap" }}>
              Role:
            </Typography>
          </Box>
          {ROLE_FILTERS.map((f) => {
            const active = roleFilter === f.id;
            const rs     = f.id !== "all" ? ROLE_STYLES[f.id] : null;
            const color  = rs?.color ?? "#374151";
            const bg     = rs?.bg    ?? "#F3F4F6";
            return (
              <Chip
                key={f.id}
                label={f.label}
                size="small"
                onClick={() => onRoleFilterChange(f.id)}
                sx={{
                  fontWeight: 600, fontSize: "12px", height: 28, cursor: "pointer",
                  bgcolor: active ? bg : "#F9FAFB",
                  color: active ? color : "#6B7280",
                  border: active ? `1px solid ${color}40` : "1px solid #E5E7EB",
                  "&:hover": { bgcolor: bg, color },
                  transition: "all 0.15s",
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* White container */}
      <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: 3, p: 3 }}>
        {error ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
        ) : loading ? (
          <Box sx={GRID}>
            {Array.from({ length: 6 }).map((_, i) => <EmployeeSkeletonCard key={i} />)}
          </Box>
        ) : members.length === 0 && !showInvitations ? (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <PeopleAltOutlined sx={{ fontSize: 48, color: "#D1D5DB", mb: 2 }} />
            <Typography sx={{ fontSize: "15px", fontWeight: 600, color: "#374151" }}>
              {search ? "No members match your search" : "No team members yet"}
            </Typography>
            <Typography sx={{ fontSize: "13px", color: "#9CA3AF", mt: 0.5 }}>
              {search ? "Try different keywords or clear the search." : "Invite your first team member to get started."}
            </Typography>
          </Box>
        ) : (
          <>
            {members.length > 0 && (
              <Box sx={{ ...GRID, mb: showInvitations ? 3 : 0 }}>
                {members.map((m, i) => (
                  <EmployeeCard key={m._id} member={m} index={i} onEdit={onEdit} onDelete={onDelete} onSelect={onSelect} />
                ))}
              </Box>
            )}

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
                  <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress size={24} sx={{ color: AMBER }} />
                  </Box>
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
        )}
      </Box>
    </Box>
  );
});

EmployeesList.displayName = "EmployeesList";

export default EmployeesList;
