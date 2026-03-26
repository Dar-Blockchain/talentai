"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import {
  Box, Typography, Avatar, Skeleton, Alert, IconButton, Tooltip,
  LinearProgress, CircularProgress, Dialog, Select, MenuItem,
} from "@mui/material";
import SearchOutlined              from "@mui/icons-material/SearchOutlined";
import CloseOutlined               from "@mui/icons-material/CloseOutlined";
import PeopleAltOutlined           from "@mui/icons-material/PeopleAltOutlined";
import BusinessOutlined            from "@mui/icons-material/BusinessOutlined";
import CheckCircleOutlined         from "@mui/icons-material/CheckCircleOutlined";
import RadioButtonUncheckedOutlined from "@mui/icons-material/RadioButtonUncheckedOutlined";
import AccessTimeOutlined          from "@mui/icons-material/AccessTimeOutlined";
import EmailOutlined               from "@mui/icons-material/EmailOutlined";
import PersonAddOutlined           from "@mui/icons-material/PersonAddOutlined";
import DeleteOutlineOutlined       from "@mui/icons-material/DeleteOutlineOutlined";
import AddOutlined                 from "@mui/icons-material/AddOutlined";
import FilterListOutlined          from "@mui/icons-material/FilterListOutlined";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  fetchCampaignParticipants,
  selectCampaignParticipants,
  selectCampaignParticipantsLoading,
  selectCampaignParticipantsError,
  selectCampaignParticipantsTotal,
  addCampaignParticipant,
  removeCampaignParticipant,
  selectParticipantActionLoading,
  fetchNonParticipants,
  selectNonParticipants,
  selectNonParticipantsLoading,
  selectNonParticipantsError,
  selectNonParticipantsTotal,
} from "@/store/slices/campaignSlice";
import {
  fetchDepartments,
  selectDepartments,
} from "@/store/slices/departmentSlice";
import { CampaignParticipant, NonParticipant, ParticipantStatus } from "@/types/campaign";
import Pagination from "@/components/ui/Pagination";
import { ROLES } from "@/constants/employee";

// ─── Constants ────────────────────────────────────────────────────────────────

const PURPLE    = "#8310FF";
const PAGE_SIZE = 10;
const PICKER_PAGE_SIZE = 8;

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

const STATUS_CONFIG: Record<ParticipantStatus, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  IN_PROGRESS: { label: "In Progress", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", icon: AccessTimeOutlined },
  COMPLETED:   { label: "Completed",   color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0", icon: CheckCircleOutlined },
  INVITED:     { label: "Invited",     color: "#0891B2", bg: "#ECFDF5", border: "#A5F3FC", icon: RadioButtonUncheckedOutlined },
  DROPPED:     { label: "Dropped",     color: "#EF4444", bg: "#FEF2F2", border: "#FECACA", icon: RadioButtonUncheckedOutlined },
};

function scoreColor(s: number) { return s >= 70 ? "#16A34A" : s >= 40 ? "#D97706" : "#DC2626"; }
function scoreBg(s: number)    { return s >= 70 ? "#F0FDF4" : s >= 40 ? "#FFFBEB" : "#FEF2F2"; }

// ─── Skeleton rows ─────────────────────────────────────────────────────────────

const RowSkeleton: React.FC<{ showActions?: boolean }> = ({ showActions }) => (
  <Box sx={{
    display: "grid", gridTemplateColumns: showActions ? "1fr 130px 140px 80px 40px" : "1fr 130px 140px 80px",
    alignItems: "center", gap: 2, px: 3, py: 2, borderBottom: "1px solid #F3F4F6",
  }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Skeleton variant="circular" width={40} height={40} sx={{ flexShrink: 0 }} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="45%" height={14} />
        <Skeleton variant="text" width="62%" height={12} sx={{ mt: 0.5 }} />
      </Box>
    </Box>
    <Skeleton variant="rounded" width={90}  height={24} sx={{ borderRadius: "999px" }} />
    <Skeleton variant="rounded" width={100} height={24} sx={{ borderRadius: "999px" }} />
    <Skeleton variant="rounded" width={52}  height={24} sx={{ borderRadius: 1.5, ml: "auto" }} />
    {showActions && <Skeleton variant="circular" width={28} height={28} />}
  </Box>
);

const PickerRowSkeleton: React.FC = () => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 2, px: 3, py: 1.625, borderBottom: "1px solid #F3F4F6" }}>
    <Skeleton variant="circular" width={38} height={38} sx={{ flexShrink: 0 }} />
    <Box sx={{ flex: 1 }}>
      <Skeleton variant="text" width="38%" height={14} />
      <Skeleton variant="text" width="55%" height={11} sx={{ mt: 0.5 }} />
    </Box>
    <Skeleton variant="rounded" width={84} height={24} sx={{ borderRadius: "999px" }} />
    <Skeleton variant="rounded" width={72} height={32} sx={{ borderRadius: "9px" }} />
  </Box>
);

// ─── Participant row ──────────────────────────────────────────────────────────

const ParticipantRow: React.FC<{
  participant: CampaignParticipant;
  index: number;
  total: number;
  onRemove?: (id: string) => void;
  removing?: boolean;
}> = ({ participant: p, index, total, onRemove, removing }) => {
  const router = useRouter();
  const name       = (p.firstName && p.lastName) ? `${p.firstName} ${p.lastName}` : p.firstName || p.lastName || "Unknown";
  const email      = p.email ?? "";
  const letter     = name[0]?.toUpperCase() || "U";
  const dept       = p.department?.name ?? null;
  const roleStr    = (p.role ?? "") as string;
  const roleEntry  = ROLES.find((r) => r.value === roleStr || r.value === roleStr.toLowerCase());
  const roleColor  = roleEntry?.color ?? "#6B7280";
  const roleLabel  = roleEntry?.label || roleStr || "—";
  const RoleIcon   = roleEntry?.icon ?? null;
  const status     = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.INVITED;
  const StatusIcon = status.icon;

  return (
    <Box sx={{
      display: "grid",
      gridTemplateColumns: onRemove ? "1fr 130px 140px 80px 40px" : "1fr 130px 140px 80px",
      alignItems: "center", gap: 2, px: 3, py: 1.75,
      borderBottom: index < total - 1 ? "1px solid #F3F4F6" : "none",
      transition: "background-color 0.15s",
      "&:hover": { bgcolor: "#FAFBFF" },
    }}>
      <Box
        onClick={() => p.employeeId && router.push(`/company/employees/${p.employeeId}`)}
        sx={{
          display: "flex", alignItems: "center", gap: 1.5, minWidth: 0,
          cursor: p.employeeId ? "pointer" : "default",
          "&:hover .participant-name": p.employeeId ? { color: PURPLE, textDecoration: "underline" } : {},
        }}
      >
        <Avatar sx={{
          width: 40, height: 40, fontSize: "0.9rem", fontWeight: 800, color: "#fff",
          background: `linear-gradient(${pickGradient(email || name)})`,
          flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        }}>
          {letter}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography className="participant-name" sx={{ fontSize: "13px", fontWeight: 700, color: "#111827", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", transition: "color 0.15s" }}>
            {name}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.25, flexWrap: "nowrap", minWidth: 0 }}>
            {email && (
              <Tooltip title={email} placement="top" arrow>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, minWidth: 0 }}>
                  <EmailOutlined sx={{ fontSize: 10, color: "#CBD5E1", flexShrink: 0 }} />
                  <Typography sx={{ fontSize: "11px", color: "#9CA3AF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 160 }}>
                    {email}
                  </Typography>
                </Box>
              </Tooltip>
            )}
            {dept && (
              <>
                <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "#D1D5DB", flexShrink: 0 }} />
                <Box
                  onClick={(e) => {
                    if (p.department?.id) { e.stopPropagation(); router.push(`/company/departments/${p.department.id}`); }
                  }}
                  sx={{
                    display: "flex", alignItems: "center", gap: 0.35, flexShrink: 0,
                    px: 0.75, py: "2px", borderRadius: "6px", bgcolor: "#F1F5F9",
                    cursor: p.department?.id ? "pointer" : "default",
                    transition: "all 0.15s",
                    ...(p.department?.id && { "&:hover": { bgcolor: "#EEF2FF", "& .dept-text": { color: PURPLE } } }),
                  }}
                >
                  <BusinessOutlined sx={{ fontSize: 9, color: "#64748B" }} />
                  <Typography className="dept-text" sx={{ fontSize: "10px", fontWeight: 600, color: "#64748B", whiteSpace: "nowrap", transition: "color 0.15s" }}>{dept}</Typography>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>

      <Box>
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 1.25, py: "4px", borderRadius: "999px", bgcolor: `${roleColor}0F`, border: `1px solid ${roleColor}28`, minWidth: "max-content" }}>
          {RoleIcon && <Box sx={{ color: roleColor, display: "flex", alignItems: "center", "& svg": { fontSize: 11 } }}><RoleIcon /></Box>}
          <Typography sx={{ fontSize: "11px", fontWeight: 700, color: roleColor }}>{roleLabel}</Typography>
        </Box>
      </Box>

      <Box>
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.6, px: 1.25, py: "4px", borderRadius: "999px", bgcolor: status.bg, border: `1px solid ${status.border}` }}>
          <StatusIcon sx={{ fontSize: 12, color: status.color }} />
          <Typography sx={{ fontSize: "11px", fontWeight: 700, color: status.color }}>{status.label}</Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        {p.score !== undefined ? (
          <Box sx={{ px: 1.25, py: "4px", borderRadius: 1.5, minWidth: 46, textAlign: "center", bgcolor: scoreBg(p.score), border: `1px solid ${scoreColor(p.score)}28` }}>
            <Typography sx={{ fontSize: "12px", fontWeight: 800, color: scoreColor(p.score), lineHeight: 1 }}>{p.score}%</Typography>
          </Box>
        ) : (
          <Typography sx={{ fontSize: "12px", color: "#D1D5DB", pr: 0.5 }}>—</Typography>
        )}
      </Box>

      {onRemove && (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Tooltip title="Remove participant" placement="top" arrow>
            <IconButton
              size="small" onClick={() => onRemove(p._id)} disabled={removing}
              sx={{ width: 28, height: 28, color: "#EF4444", bgcolor: "#FEF2F2", border: "1px solid #FECACA", "&:hover": { bgcolor: "#FEE2E2" }, "&:disabled": { opacity: 0.5 } }}
            >
              {removing ? <CircularProgress size={12} sx={{ color: "#EF4444" }} /> : <DeleteOutlineOutlined sx={{ fontSize: 14 }} />}
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
};

// ─── Add Participant Dialog ───────────────────────────────────────────────────

interface AddDialogProps {
  open: boolean;
  campaignId: string;
  onClose: () => void;
  onAdded: () => void;
}

const AddParticipantDialog: React.FC<AddDialogProps> = ({ open, campaignId, onClose, onAdded }) => {
  const dispatch   = useDispatch<AppDispatch>();
  const employees  = useSelector(selectNonParticipants);
  const loading    = useSelector(selectNonParticipantsLoading);
  const error      = useSelector(selectNonParticipantsError);
  const total      = useSelector(selectNonParticipantsTotal);
  const adding     = useSelector(selectParticipantActionLoading);
  const departments = useSelector(selectDepartments);

  const [search,          setSearch]          = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [department,      setDepartment]      = useState("");
  const [role,            setRole]            = useState("");
  const [page,            setPage]            = useState(1);
  const [addingId,        setAddingId]        = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch departments once on open
  useEffect(() => {
    if (open) dispatch(fetchDepartments({ limit: 100 }));
  }, [open, dispatch]);

  // Reset filters when dialog opens
  useEffect(() => {
    if (open) {
      setSearch(""); setDebouncedSearch(""); setDepartment(""); setRole(""); setPage(1);
    }
  }, [open]);

  // Debounce search
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    clearTimeout(debounceRef.current!);
    debounceRef.current = setTimeout(() => { setDebouncedSearch(value); setPage(1); }, 300);
  }, []);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [debouncedSearch, department, role]);

  // Fetch non-participants whenever filters/page change (and dialog is open)
  useEffect(() => {
    if (!open) return;
    dispatch(fetchNonParticipants({
      campaignId,
      search:     debouncedSearch || undefined,
      department: department      || undefined,
      role:       role            || undefined,
      page,
      limit: PICKER_PAGE_SIZE,
    }));
  }, [open, dispatch, campaignId, debouncedSearch, department, role, page]);

  const handleAdd = useCallback(async (employeeId: string) => {
    setAddingId(employeeId);
    const result = await dispatch(addCampaignParticipant({ campaignId, employeeId }));
    setAddingId(null);
    if (addCampaignParticipant.fulfilled.match(result)) {
      onAdded();
      // Re-fetch non-participants to keep total count and pagination accurate
      dispatch(fetchNonParticipants({
        campaignId,
        search:     debouncedSearch || undefined,
        department: department      || undefined,
        role:       role            || undefined,
        page,
        limit: PICKER_PAGE_SIZE,
      }));
    }
  }, [dispatch, campaignId, onAdded, debouncedSearch, department, role, page]);

  const hasFilters = !!debouncedSearch || !!department || !!role;

  const activeDeptLabel = department ? departments.find((d) => d._id === department)?.name : null;
  const activeRoleLabel = role ? ROLES.find((r) => r.value === role)?.label : null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: "20px",
          width: 660,
          maxWidth: "96vw",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0,0,0,0.14)",
        },
      }}
    >
      {/* ── Header ── */}
      <Box sx={{
        px: 3, pt: 3, pb: 2.5,
        borderBottom: "1px solid #F1F3F6",
        background: `linear-gradient(135deg, ${PURPLE}06 0%, transparent 70%)`,
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: "12px",
            background: `linear-gradient(135deg, ${PURPLE}18, ${PURPLE}08)`,
            border: `1px solid ${PURPLE}22`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 4px 12px ${PURPLE}18`,
          }}>
            <PersonAddOutlined sx={{ fontSize: 19, color: PURPLE }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: "15px", color: "#0F172A", lineHeight: 1.25 }}>
              Add Participants
            </Typography>
            <Typography sx={{ fontSize: "12px", color: "#94A3B8", mt: 0.3, fontWeight: 500 }}>
              {loading
                ? "Loading available employees…"
                : total === 0
                  ? "No employees available to add"
                  : `${total} employee${total !== 1 ? "s" : ""} available to invite`}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            width: 30, height: 30, borderRadius: "8px",
            color: "#94A3B8", bgcolor: "#F8FAFC", border: "1px solid #E2E8F0",
            "&:hover": { bgcolor: "#F1F5F9", color: "#64748B" },
          }}
        >
          <CloseOutlined sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      {/* ── Filters ── */}
      <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #F1F3F6", bgcolor: "#FAFBFC", flexShrink: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap" }}>
          {/* Search */}
          <Box sx={{
            flex: 1, minWidth: 190, display: "flex", alignItems: "center",
            border: "1.5px solid #E5E7EB", borderRadius: "11px", px: 1.5, py: "7px",
            bgcolor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            "&:focus-within": { borderColor: PURPLE, boxShadow: `0 0 0 3px ${PURPLE}12` },
            transition: "all 0.18s",
          }}>
            <SearchOutlined sx={{ fontSize: 15, color: "#9CA3AF", flexShrink: 0, mr: 0.875 }} />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              autoFocus
              style={{ border: "none", outline: "none", background: "transparent", fontSize: "13px", color: "#111827", width: "100%", fontFamily: "inherit", padding: 0 }}
            />
            {search && (
              <IconButton size="small" onClick={() => handleSearchChange("")} sx={{ p: 0.25, ml: 0.5, color: "#9CA3AF", "&:hover": { color: "#64748B" } }}>
                <CloseOutlined sx={{ fontSize: 13 }} />
              </IconButton>
            )}
          </Box>

          {/* Department */}
          <Select
            size="small" displayEmpty value={department}
            onChange={(e) => setDepartment(e.target.value)}
            renderValue={(v) => v ? (departments.find((d) => d._id === v)?.name ?? "Department") : "Department"}
            sx={{
              fontSize: "12px", fontWeight: 600, minWidth: 140,
              bgcolor: department ? `${PURPLE}08` : "#fff",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: department ? `${PURPLE}40` : "#E5E7EB",
                borderRadius: "11px", borderWidth: "1.5px",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: department ? `${PURPLE}60` : "#D1D5DB" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: PURPLE },
              "& .MuiSelect-select": { py: "7px", px: 1.5, color: department ? PURPLE : "#6B7280" },
              "& .MuiSelect-icon": { color: department ? PURPLE : "#9CA3AF" },
            }}
          >
            <MenuItem value="" sx={{ fontSize: "12px", color: "#6B7280" }}>All departments</MenuItem>
            {departments.map((d) => (
              <MenuItem key={d._id} value={d._id} sx={{ fontSize: "12px" }}>{d.name}</MenuItem>
            ))}
          </Select>

          {/* Role */}
          <Select
            size="small" displayEmpty value={role}
            onChange={(e) => setRole(e.target.value)}
            renderValue={(v) => v ? (ROLES.find((r) => r.value === v)?.label ?? "Role") : "Role"}
            sx={{
              fontSize: "12px", fontWeight: 600, minWidth: 130,
              bgcolor: role ? `${PURPLE}08` : "#fff",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: role ? `${PURPLE}40` : "#E5E7EB",
                borderRadius: "11px", borderWidth: "1.5px",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: role ? `${PURPLE}60` : "#D1D5DB" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: PURPLE },
              "& .MuiSelect-select": { py: "7px", px: 1.5, color: role ? PURPLE : "#6B7280" },
              "& .MuiSelect-icon": { color: role ? PURPLE : "#9CA3AF" },
            }}
          >
            <MenuItem value="" sx={{ fontSize: "12px", color: "#6B7280" }}>All roles</MenuItem>
            {ROLES.map((r) => (
              <MenuItem key={r.value} value={r.value} sx={{ fontSize: "12px" }}>{r.label}</MenuItem>
            ))}
          </Select>
        </Box>

        {/* Active filter chips */}
        {(activeDeptLabel || activeRoleLabel) && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 1.25, flexWrap: "wrap" }}>
            <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", mr: 0.25 }}>
              Filters:
            </Typography>
            {activeDeptLabel && (
              <Box
                onClick={() => setDepartment("")}
                sx={{
                  display: "inline-flex", alignItems: "center", gap: 0.5,
                  px: 1, py: "3px", borderRadius: "999px",
                  bgcolor: `${PURPLE}10`, border: `1px solid ${PURPLE}25`,
                  cursor: "pointer", "&:hover": { bgcolor: `${PURPLE}18` }, transition: "all 0.15s",
                }}
              >
                <Typography sx={{ fontSize: "11px", fontWeight: 700, color: PURPLE }}>{activeDeptLabel}</Typography>
                <CloseOutlined sx={{ fontSize: 11, color: PURPLE }} />
              </Box>
            )}
            {activeRoleLabel && (
              <Box
                onClick={() => setRole("")}
                sx={{
                  display: "inline-flex", alignItems: "center", gap: 0.5,
                  px: 1, py: "3px", borderRadius: "999px",
                  bgcolor: `${PURPLE}10`, border: `1px solid ${PURPLE}25`,
                  cursor: "pointer", "&:hover": { bgcolor: `${PURPLE}18` }, transition: "all 0.15s",
                }}
              >
                <Typography sx={{ fontSize: "11px", fontWeight: 700, color: PURPLE }}>{activeRoleLabel}</Typography>
                <CloseOutlined sx={{ fontSize: 11, color: PURPLE }} />
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* ── Employee list ── */}
      <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0, bgcolor: "#fff" }}>
        {loading && <LinearProgress sx={{ height: 2, "& .MuiLinearProgress-bar": { bgcolor: PURPLE } }} />}

        {error ? (
          <Alert severity="error" sx={{ m: 2.5, borderRadius: "12px", fontSize: "13px" }}>{error}</Alert>
        ) : loading && employees.length === 0 ? (
          <Box sx={{ py: 1 }}>
            {Array.from({ length: PICKER_PAGE_SIZE }).map((_, i) => <PickerRowSkeleton key={i} />)}
          </Box>
        ) : employees.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8, px: 3 }}>
            <Box sx={{
              width: 56, height: 56, borderRadius: "16px",
              background: "linear-gradient(135deg, #F3F4F6, #E9ECEF)",
              display: "flex", alignItems: "center", justifyContent: "center",
              mx: "auto", mb: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}>
              <PeopleAltOutlined sx={{ fontSize: 25, color: "#9CA3AF" }} />
            </Box>
            <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#374151", mb: 0.75 }}>
              {hasFilters ? "No employees match your filters" : "All employees are already in this campaign"}
            </Typography>
            <Typography sx={{ fontSize: "12px", color: "#9CA3AF", lineHeight: 1.6 }}>
              {hasFilters
                ? "Try clearing one or more filters to see more results."
                : "Every member of your company has already been added."}
            </Typography>
            {hasFilters && (
              <Box
                onClick={() => { setSearch(""); setDebouncedSearch(""); setDepartment(""); setRole(""); }}
                sx={{
                  display: "inline-flex", alignItems: "center", gap: 0.5,
                  mt: 2, px: 1.5, py: 0.75, borderRadius: "9px",
                  bgcolor: `${PURPLE}10`, border: `1px solid ${PURPLE}25`,
                  cursor: "pointer", "&:hover": { bgcolor: `${PURPLE}18` }, transition: "all 0.15s",
                }}
              >
                <CloseOutlined sx={{ fontSize: 13, color: PURPLE }} />
                <Typography sx={{ fontSize: "12px", fontWeight: 700, color: PURPLE }}>Clear all filters</Typography>
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ py: 0.5 }}>
            {employees.map((emp, i) => (
              <EmployeePickerRow
                key={emp._id}
                employee={emp}
                isLast={i === employees.length - 1}
                onAdd={handleAdd}
                adding={addingId === emp._id}
                disabled={adding && addingId !== emp._id}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* ── Footer ── */}
      <Box sx={{
        px: 3, pt: 2, pb: 3,
        borderTop: "1px solid #F1F3F6",
        bgcolor: "#FAFBFC",
        flexShrink: 0,
        display: "flex", flexDirection: "column", gap: 1.5,
      }}>
        {/* Pagination (if needed) */}
        {!loading && total > PICKER_PAGE_SIZE && (
          <Pagination page={page} total={total} pageSize={PICKER_PAGE_SIZE} onPageChange={setPage} />
        )}

        {/* Done button row */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>
            {total > 0 ? `Showing ${Math.min((page - 1) * PICKER_PAGE_SIZE + 1, total)}–${Math.min(page * PICKER_PAGE_SIZE, total)} of ${total}` : ""}
          </Typography>
          <Box
            onClick={onClose}
            sx={{
              display: "inline-flex", alignItems: "center",
              px: 2.5, py: 1, borderRadius: "11px",
              bgcolor: PURPLE, cursor: "pointer",
              boxShadow: `0 4px 14px ${PURPLE}38`,
              "&:hover": { bgcolor: "#6D0FD6", boxShadow: `0 6px 18px ${PURPLE}45` },
              transition: "all 0.18s",
            }}
          >
            <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>Done</Typography>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
};

// ─── Employee picker row ──────────────────────────────────────────────────────

const EmployeePickerRow: React.FC<{
  employee: NonParticipant;
  isLast: boolean;
  onAdd: (id: string) => void;
  adding: boolean;
  disabled: boolean;
}> = ({ employee: e, isLast, onAdd, adding, disabled }) => {
  const name      = (e.firstName && e.lastName) ? `${e.firstName} ${e.lastName}` : e.firstName || e.username || "Unknown";
  const email     = e.email ?? "";
  const letter    = name[0]?.toUpperCase() || "U";
  const roleEntry = ROLES.find((r) => r.value === e.role || r.value === (e.role ?? "").toLowerCase());
  const roleColor = roleEntry?.color ?? "#6B7280";
  const roleLabel = roleEntry?.label || e.role || "—";
  const RoleIcon  = roleEntry?.icon ?? null;

  return (
    <Box sx={{
      display: "flex", alignItems: "center", gap: 2,
      px: 3, py: 1.625,
      borderBottom: isLast ? "none" : "1px solid #F3F4F6",
      transition: "background-color 0.15s",
      "&:hover": { bgcolor: "#F8F9FF" },
    }}>
      {/* Avatar */}
      <Avatar sx={{
        width: 38, height: 38, fontSize: "0.85rem", fontWeight: 800, color: "#fff",
        background: `linear-gradient(${pickGradient(email || name)})`,
        flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
      }}>
        {letter}
      </Avatar>

      {/* Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", lineHeight: 1.35, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {name}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.3, flexWrap: "nowrap", minWidth: 0 }}>
          {email && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, minWidth: 0 }}>
              <EmailOutlined sx={{ fontSize: 10, color: "#CBD5E1", flexShrink: 0 }} />
              <Typography sx={{ fontSize: "11px", color: "#94A3B8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 200 }}>{email}</Typography>
            </Box>
          )}
          {e.department && (
            <>
              <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "#E2E8F0", flexShrink: 0 }} />
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.35, flexShrink: 0, px: 0.75, py: "2px", borderRadius: "6px", bgcolor: "#F1F5F9", border: "1px solid #E2E8F0" }}>
                <BusinessOutlined sx={{ fontSize: 9, color: "#64748B" }} />
                <Typography sx={{ fontSize: "10px", fontWeight: 600, color: "#64748B", whiteSpace: "nowrap" }}>{e.department.name}</Typography>
              </Box>
            </>
          )}
        </Box>
      </Box>

      {/* Role badge */}
      <Box sx={{
        display: "inline-flex", alignItems: "center", gap: 0.5,
        px: 1.125, py: "4px", borderRadius: "999px",
        bgcolor: `${roleColor}0D`, border: `1px solid ${roleColor}28`,
        flexShrink: 0,
      }}>
        {RoleIcon && <Box sx={{ color: roleColor, display: "flex", alignItems: "center", "& svg": { fontSize: 10 } }}><RoleIcon /></Box>}
        <Typography sx={{ fontSize: "11px", fontWeight: 700, color: roleColor, whiteSpace: "nowrap" }}>{roleLabel}</Typography>
      </Box>

      {/* Add button */}
      <Box
        onClick={() => !adding && !disabled && onAdd(e._id)}
        sx={{
          display: "flex", alignItems: "center", gap: 0.625,
          px: 1.5, py: 0.75, borderRadius: "9px",
          cursor: adding || disabled ? "default" : "pointer",
          bgcolor: adding ? `${PURPLE}0A` : `${PURPLE}12`,
          border: `1.5px solid ${PURPLE}${adding ? "18" : "30"}`,
          opacity: disabled && !adding ? 0.4 : 1,
          transition: "all 0.15s",
          "&:hover": (!adding && !disabled) ? { bgcolor: `${PURPLE}1E`, borderColor: `${PURPLE}50`, boxShadow: `0 2px 8px ${PURPLE}20` } : {},
          flexShrink: 0,
          minWidth: 72,
          justifyContent: "center",
        }}
      >
        {adding
          ? <CircularProgress size={12} sx={{ color: PURPLE }} />
          : <AddOutlined sx={{ fontSize: 13, color: PURPLE }} />}
        <Typography sx={{ fontSize: "12px", fontWeight: 700, color: PURPLE, lineHeight: 1 }}>
          {adding ? "Adding…" : "Add"}
        </Typography>
      </Box>
    </Box>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

interface Props { campaignId: string; mode?: "company" | "employee" }

const CampaignParticipantsTab: React.FC<Props> = ({ campaignId, mode = "company" }) => {
  const dispatch     = useDispatch<AppDispatch>();
  const participants = useSelector(selectCampaignParticipants);
  const loading      = useSelector(selectCampaignParticipantsLoading);
  const error        = useSelector(selectCampaignParticipantsError);
  const total        = useSelector(selectCampaignParticipantsTotal);

  const isCompany = mode === "company";

  const [search,          setSearch]          = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page,            setPage]            = useState(1);
  const [addDialogOpen,   setAddDialogOpen]   = useState(false);
  const [removingId,      setRemovingId]      = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    clearTimeout(debounceRef.current!);
    debounceRef.current = setTimeout(() => { setDebouncedSearch(value); setPage(1); }, 300);
  }, []);

  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const refreshParticipants = useCallback(() => {
    dispatch(fetchCampaignParticipants({ campaignId, search: debouncedSearch || undefined, page, limit: PAGE_SIZE }));
  }, [dispatch, campaignId, debouncedSearch, page]);

  useEffect(() => { refreshParticipants(); }, [refreshParticipants]);

  const handleRemoveParticipant = useCallback(async (participantId: string) => {
    setRemovingId(participantId);
    const result = await dispatch(removeCampaignParticipant({ campaignId, participantId }));
    setRemovingId(null);
    if (removeCampaignParticipant.fulfilled.match(result)) refreshParticipants();
  }, [dispatch, campaignId, refreshParticipants]);

  const inProgressCount = participants.filter(p => p.status === "IN_PROGRESS").length;
  const completedCount  = participants.filter(p => p.status === "COMPLETED").length;
  const invitedCount    = participants.filter(p => p.status === "INVITED").length;
  const droppedCount    = participants.filter(p => p.status === "DROPPED").length;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

      {/* ── Toolbar ── */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, px: 1.5, py: 0.6, borderRadius: "999px", bgcolor: `${PURPLE}0D`, border: `1px solid ${PURPLE}20` }}>
            <PeopleAltOutlined sx={{ fontSize: 13, color: PURPLE }} />
            <Typography sx={{ fontSize: "12px", fontWeight: 700, color: PURPLE }}>
              {loading ? "…" : total} participant{total !== 1 ? "s" : ""}
            </Typography>
          </Box>
          {!loading && !error && participants.length > 0 && (
            (["INVITED", "IN_PROGRESS", "COMPLETED", "DROPPED"] as ParticipantStatus[]).map((s) => {
              const cfg   = STATUS_CONFIG[s];
              const count = s === "INVITED" ? invitedCount : s === "IN_PROGRESS" ? inProgressCount : s === "COMPLETED" ? completedCount : droppedCount;
              if (count === 0) return null;
              const Icon = cfg.icon;
              return (
                <Box key={s} sx={{ display: "inline-flex", alignItems: "center", gap: 0.6, px: 1.25, py: "4px", borderRadius: "999px", bgcolor: cfg.bg, border: `1px solid ${cfg.border}` }}>
                  <Icon sx={{ fontSize: 11, color: cfg.color }} />
                  <Typography sx={{ fontSize: "11px", fontWeight: 700, color: cfg.color }}>{count} {cfg.label}</Typography>
                </Box>
              );
            })
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{
            display: "flex", alignItems: "center",
            bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px",
            px: 1.5, py: 0.6, minWidth: 230,
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            "&:focus-within": { borderColor: PURPLE, boxShadow: `0 0 0 3px ${PURPLE}12` }, transition: "all 0.18s",
          }}>
            <SearchOutlined sx={{ fontSize: 15, color: "#9CA3AF", flexShrink: 0, mr: 1 }} />
            <input
              type="text" placeholder="Search participants…" value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{ border: "none", outline: "none", background: "transparent", fontSize: "13px", color: "#111827", width: "100%", fontFamily: "inherit", padding: "2px 0" }}
            />
            {search && (
              <IconButton size="small" onClick={() => handleSearchChange("")} sx={{ p: 0.25, color: "#9CA3AF" }}>
                <CloseOutlined sx={{ fontSize: 13 }} />
              </IconButton>
            )}
          </Box>

          {isCompany && (
            <Tooltip title="Add participants" arrow>
              <IconButton
                onClick={() => setAddDialogOpen(true)}
                sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: `${PURPLE}10`, border: `1px solid ${PURPLE}25`, color: PURPLE, "&:hover": { bgcolor: `${PURPLE}18` } }}
              >
                <PersonAddOutlined sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* ── Table card ── */}
      <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: 3, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
        {loading && <LinearProgress sx={{ height: 2, "& .MuiLinearProgress-bar": { bgcolor: PURPLE } }} />}

        <Box sx={{
          display: "grid", gridTemplateColumns: isCompany ? "1fr 130px 140px 80px 40px" : "1fr 130px 140px 80px",
          alignItems: "center", gap: 2, px: 3, py: 1.4,
          bgcolor: "#F8F9FB", borderBottom: "1px solid #E5E7EB",
        }}>
          {[...["Participant", "Role", "Status", "Score"], ...(isCompany ? [""] : [])].map((col, i) => (
            <Typography key={col || `col-${i}`} sx={{ fontSize: "10px", fontWeight: 800, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: i === 3 ? "right" : "left" }}>
              {col}
            </Typography>
          ))}
        </Box>

        {error ? (
          <Alert severity="error" sx={{ m: 2.5, borderRadius: 2 }}>{error}</Alert>
        ) : loading && participants.length === 0 ? (
          <Box>{Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} showActions={isCompany} />)}</Box>
        ) : participants.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 9 }}>
            <Box sx={{ width: 56, height: 56, borderRadius: "16px", bgcolor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
              <PeopleAltOutlined sx={{ fontSize: 26, color: "#9CA3AF" }} />
            </Box>
            <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#374151" }}>
              {debouncedSearch ? "No participants match your search" : "No participants yet"}
            </Typography>
            <Typography sx={{ fontSize: "12px", color: "#9CA3AF", mt: 0.5 }}>
              {debouncedSearch ? "Try a different name or email." : "Participants will appear here once they join."}
            </Typography>
          </Box>
        ) : (
          participants.map((p, i) => (
            <ParticipantRow
              key={p._id} participant={p} index={i} total={participants.length}
              onRemove={isCompany ? handleRemoveParticipant : undefined}
              removing={removingId === p._id}
            />
          ))
        )}
      </Box>

      {/* ── Pagination ── */}
      {!loading && total > PAGE_SIZE && (
        <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
      )}

      {/* ── Add Participant Dialog ── */}
      {isCompany && (
        <AddParticipantDialog
          open={addDialogOpen}
          campaignId={campaignId}
          onClose={() => setAddDialogOpen(false)}
          onAdded={refreshParticipants}
        />
      )}
    </Box>
  );
};

export default CampaignParticipantsTab;
