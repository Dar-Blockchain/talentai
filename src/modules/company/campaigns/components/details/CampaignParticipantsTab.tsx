"use client";

import React, { memo, useState, useRef, useCallback, useMemo } from "react";
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
import AssessmentOutlined          from "@mui/icons-material/AssessmentOutlined";
import AddOutlined                 from "@mui/icons-material/AddOutlined";
import {
  useCampaignParticipantsQuery,
  useNonParticipantsQuery,
  useAddParticipantMutation,
  useRemoveParticipantMutation,
} from "../../queries";
import { useDepartmentsQuery } from "@/modules/company/employees/queries";
import { CampaignParticipant, NonParticipant, ParticipantStatus } from "@/types/campaign";
import Pagination from "@/components/ui/Pagination";
import { ROLES } from "@/constants/employee";
import { useTranslation } from "react-i18next";

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
] as const;

function pickGradient(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_GRADIENTS[Math.abs(h) % AVATAR_GRADIENTS.length];
}

const PARTICIPANT_STATUS_META: Record<ParticipantStatus, { color: string; bg: string; border: string; icon: React.ElementType }> = {
  IN_PROGRESS: { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", icon: AccessTimeOutlined },
  COMPLETED:   { color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0", icon: CheckCircleOutlined },
  INVITED:     { color: "#0891B2", bg: "#ECFDF5", border: "#A5F3FC", icon: RadioButtonUncheckedOutlined },
  DROPPED:     { color: "#EF4444", bg: "#FEF2F2", border: "#FECACA", icon: RadioButtonUncheckedOutlined },
};

const ROW_SKELETON_GRID_COMPANY  = "44px 1fr 140px 120px 110px" as const;
const ROW_SKELETON_GRID_EMPLOYEE = "44px 1fr 140px 120px" as const;

const SKELETON_ROWS_5  = Array.from({ length: 5 });
const SKELETON_ROWS_8  = Array.from({ length: PICKER_PAGE_SIZE });

const FILTER_CHIP_SX = {
  display: "inline-flex", alignItems: "center", gap: 0.5,
  px: 1, py: "3px", borderRadius: "999px",
  bgcolor: `${PURPLE}10`, border: `1px solid ${PURPLE}25`,
  cursor: "pointer", "&:hover": { bgcolor: `${PURPLE}18` }, transition: "all 0.15s",
} as const;

const TOOLBAR_TOTAL_SX = {
  display: "flex", alignItems: "center", gap: 0.625,
  px: 1.25, py: 0.5, borderRadius: "10px",
  bgcolor: "#F8FAFC", border: "1px solid #E2E8F0",
} as const;

const SEARCH_BOX_SX = {
  display: "flex", alignItems: "center",
  bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px",
  px: 1.5, py: 0.6, minWidth: 220,
  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  "&:focus-within": { borderColor: PURPLE, boxShadow: `0 0 0 3px ${PURPLE}12` },
  transition: "all 0.18s",
} as const;

const ADD_BTN_SX = {
  display: "flex", alignItems: "center", gap: 0.625,
  px: 1.5, py: 0.75, borderRadius: "10px", cursor: "pointer",
  bgcolor: PURPLE, boxShadow: `0 3px 10px ${PURPLE}38`,
  transition: "all 0.15s", "&:hover": { opacity: 0.9, boxShadow: `0 4px 14px ${PURPLE}50` },
} as const;

const TABLE_CARD_SX = {
  bgcolor: "#fff", border: "1px solid #E5E7EB",
  borderRadius: 3, overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
} as const;

const PROGRESS_SX = { height: 2, "& .MuiLinearProgress-bar": { bgcolor: PURPLE } } as const;

const EMPTY_STATE_ICON_SX = {
  width: 56, height: 56, borderRadius: "16px",
  bgcolor: "#F3F4F6", display: "flex",
  alignItems: "center", justifyContent: "center",
  mx: "auto", mb: 2,
} as const;

const COL_HEADER_SX_BASE = {
  fontSize: "10px", fontWeight: 800, color: "#94A3B8",
  textTransform: "uppercase", letterSpacing: "0.08em",
} as const;

const DIALOG_HEADER_BG = `linear-gradient(135deg, ${PURPLE}06 0%, transparent 70%)` as const;

const DIALOG_ICON_BOX_SX = {
  width: 40, height: 40, borderRadius: "12px",
  background: `linear-gradient(135deg, ${PURPLE}18, ${PURPLE}08)`,
  border: `1px solid ${PURPLE}22`,
  display: "flex", alignItems: "center", justifyContent: "center",
  boxShadow: `0 4px 12px ${PURPLE}18`,
} as const;

const DIALOG_CLOSE_BTN_SX = {
  width: 30, height: 30, borderRadius: "8px",
  color: "#94A3B8", bgcolor: "#F8FAFC", border: "1px solid #E2E8F0",
  "&:hover": { bgcolor: "#F1F5F9", color: "#64748B" },
} as const;

const PICKER_EMPTY_ICON_SX = {
  width: 56, height: 56, borderRadius: "16px",
  background: "linear-gradient(135deg, #F3F4F6, #E9ECEF)",
  display: "flex", alignItems: "center", justifyContent: "center",
  mx: "auto", mb: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
} as const;

const DONE_BTN_SX = {
  display: "inline-flex", alignItems: "center",
  px: 2.5, py: 1, borderRadius: "11px",
  bgcolor: PURPLE, cursor: "pointer",
  boxShadow: `0 4px 14px ${PURPLE}38`,
  "&:hover": { bgcolor: "#6D0FD6", boxShadow: `0 6px 18px ${PURPLE}45` },
  transition: "all 0.18s",
} as const;

const CLEAR_FILTERS_BTN_SX = {
  display: "inline-flex", alignItems: "center", gap: 0.5,
  mt: 2, px: 1.5, py: 0.75, borderRadius: "9px",
  bgcolor: `${PURPLE}10`, border: `1px solid ${PURPLE}25`,
  cursor: "pointer", "&:hover": { bgcolor: `${PURPLE}18` }, transition: "all 0.15s",
} as const;

// ─── Skeleton rows ─────────────────────────────────────────────────────────────

const RowSkeleton = memo<{ showActions?: boolean }>(({ showActions }) => (
  <Box sx={{
    display: "grid",
    gridTemplateColumns: showActions ? ROW_SKELETON_GRID_COMPANY : ROW_SKELETON_GRID_EMPLOYEE,
    alignItems: "center", gap: 2, px: 3, py: 1.875, borderBottom: "1px solid #F3F4F6",
  }}>
    <Skeleton variant="rounded" width={22} height={18} sx={{ borderRadius: "6px" }} />
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Skeleton variant="circular" width={40} height={40} sx={{ flexShrink: 0 }} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="45%" height={14} />
        <Skeleton variant="text" width="62%" height={12} sx={{ mt: 0.5 }} />
      </Box>
    </Box>
    <Box sx={{ display: "flex", justifyContent: "center" }}><Skeleton variant="rounded" width={100} height={24} sx={{ borderRadius: "999px" }} /></Box>
    <Box sx={{ display: "flex", justifyContent: "center" }}><Skeleton variant="rounded" width={90} height={24} sx={{ borderRadius: "999px" }} /></Box>
    {showActions && <Box sx={{ display: "flex", justifyContent: "center", gap: 0.75 }}><Skeleton variant="circular" width={28} height={28} /><Skeleton variant="circular" width={28} height={28} /></Box>}
  </Box>
));
RowSkeleton.displayName = "RowSkeleton";

const PickerRowSkeleton = memo(() => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 2, px: 3, py: 1.625, borderBottom: "1px solid #F3F4F6" }}>
    <Skeleton variant="circular" width={38} height={38} sx={{ flexShrink: 0 }} />
    <Box sx={{ flex: 1 }}>
      <Skeleton variant="text" width="38%" height={14} />
      <Skeleton variant="text" width="55%" height={11} sx={{ mt: 0.5 }} />
    </Box>
    <Skeleton variant="rounded" width={84} height={24} sx={{ borderRadius: "999px" }} />
    <Skeleton variant="rounded" width={72} height={32} sx={{ borderRadius: "9px" }} />
  </Box>
));
PickerRowSkeleton.displayName = "PickerRowSkeleton";

// ─── Participant row ──────────────────────────────────────────────────────────

interface ParticipantRowProps {
  participant: CampaignParticipant;
  index: number;
  total: number;
  campaignId: string;
  onRemove?: (id: string) => void;
  removing?: boolean;
}

const ParticipantRow = memo<ParticipantRowProps>(({ participant: p, index, total, campaignId, onRemove, removing }) => {
  const router = useRouter();
  const { t } = useTranslation("dashboard");
  const pp = "pages.campaigns.detail.participants";
  const du = "pages.campaigns.detail";

  const name      = useMemo(() => (p.firstName && p.lastName) ? `${p.firstName} ${p.lastName}` : p.firstName || p.lastName || t(`${du}.unknown_user`), [p.firstName, p.lastName, t, du]);
  const email     = useMemo(() => p.email ?? "", [p.email]);
  const letter    = useMemo(() => name[0]?.toUpperCase() || "U", [name]);
  const dept      = useMemo(() => p.department?.name ?? null, [p.department]);
  const roleStr   = useMemo(() => (p.role ?? "") as string, [p.role]);
  const roleEntry = useMemo(() => ROLES.find((r) => r.value === roleStr || r.value === roleStr.toLowerCase()), [roleStr]);
  const roleColor = useMemo(() => roleEntry?.color ?? "#6B7280", [roleEntry]);
  const roleLabel = useMemo(() => roleEntry?.label || roleStr || "—", [roleEntry, roleStr]);
  const RoleIcon  = useMemo(() => roleEntry?.icon ?? null, [roleEntry]);
  const status    = useMemo(() => p.status as ParticipantStatus | undefined, [p.status]);
  const sc        = useMemo(() => status ? PARTICIPANT_STATUS_META[status] : null, [status]);
  const StatusIcon = useMemo(() => sc?.icon ?? null, [sc]);
  const isLast    = useMemo(() => index === total - 1, [index, total]);
  const gradient  = useMemo(() => pickGradient(email || name), [email, name]);

  const rowSx = useMemo(() => ({
    display: "grid",
    gridTemplateColumns: onRemove ? ROW_SKELETON_GRID_COMPANY : ROW_SKELETON_GRID_EMPLOYEE,
    alignItems: "center", gap: 2, px: 3, py: 1.75,
    borderBottom: isLast ? "none" : "1px solid #F3F4F6",
    transition: "background-color 0.15s",
    "&:hover": { bgcolor: "#FAFBFF" },
  }), [onRemove, isLast]);

  const avatarSx = useMemo(() => ({
    width: 38, height: 38, fontSize: "0.85rem", fontWeight: 800, color: "#fff",
    background: `linear-gradient(${gradient})`,
    flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
  }), [gradient]);

  const statusBadgeSx = useMemo(() => sc ? ({
    display: "inline-flex", alignItems: "center", gap: 0.5,
    px: 1.125, py: "4px", borderRadius: "999px",
    bgcolor: sc.bg, border: `1px solid ${sc.border}`,
  }) : null, [sc]);

  const roleBadgeSx = useMemo(() => ({
    display: "inline-flex", alignItems: "center", gap: 0.5,
    px: 1.125, py: "4px", borderRadius: "999px",
    bgcolor: `${roleColor}0F`, border: `1px solid ${roleColor}28`,
  }), [roleColor]);

  const handleNavigateEmployee = useCallback(() => {
    if (p.employeeId) router.push(`/company/employees/${p.employeeId}`);
  }, [p.employeeId, router]);

  const handleNavigateDept = useCallback((e: React.MouseEvent) => {
    if (p.department?.id) { e.stopPropagation(); router.push(`/company/departments/${p.department.id}`); }
  }, [p.department?.id, router]);

  const handleRemove = useCallback(() => onRemove?.(p._id), [onRemove, p._id]);

  const handleViewResults = useCallback(() => {
    if (p.employeeId) router.push(`/company/campaigns/${campaignId}/results?userId=${p.employeeId}`);
  }, [p.employeeId, campaignId, router]);

  const infoBoxSx = useMemo(() => ({
    display: "flex", alignItems: "center", gap: 1.5, minWidth: 0,
    cursor: p.employeeId ? "pointer" : "default",
    "&:hover .participant-name": p.employeeId ? { color: PURPLE } : {},
  }), [p.employeeId]);

  const deptBoxSx = useMemo(() => ({
    display: "flex", alignItems: "center", gap: 0.35, flexShrink: 0,
    px: 0.75, py: "2px", borderRadius: "6px", bgcolor: "#F1F5F9",
    cursor: p.department?.id ? "pointer" : "default",
    transition: "all 0.15s",
    ...(p.department?.id && { "&:hover": { bgcolor: "#EEF2FF", "& .dept-text": { color: PURPLE } } }),
  }), [p.department?.id]);

  return (
    <Box sx={rowSx}>
      <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#CBD5E1", textAlign: "center" }}>
        {index + 1}
      </Typography>

      <Box onClick={handleNavigateEmployee} sx={infoBoxSx}>
        <Avatar sx={avatarSx}>{letter}</Avatar>
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
                <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "#E2E8F0", flexShrink: 0 }} />
                <Box onClick={handleNavigateDept} sx={deptBoxSx}>
                  <BusinessOutlined sx={{ fontSize: 9, color: "#64748B" }} />
                  <Typography className="dept-text" sx={{ fontSize: "10px", fontWeight: 600, color: "#64748B", whiteSpace: "nowrap", transition: "color 0.15s" }}>{dept}</Typography>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center" }}>
        {statusBadgeSx ? (
          <Box sx={statusBadgeSx}>
            {StatusIcon && <StatusIcon sx={{ fontSize: 11, color: sc!.color }} />}
            <Typography sx={{ fontSize: "11px", fontWeight: 700, color: sc!.color, whiteSpace: "nowrap" }}>{status && t(`${pp}.participant_status.${status}`)}</Typography>
          </Box>
        ) : (
          <Typography sx={{ fontSize: "11px", color: "#CBD5E1" }}>—</Typography>
        )}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Box sx={roleBadgeSx}>
          {RoleIcon && <Box sx={{ color: roleColor, display: "flex", alignItems: "center", "& svg": { fontSize: 11 } }}><RoleIcon /></Box>}
          <Typography sx={{ fontSize: "11px", fontWeight: 700, color: roleColor, whiteSpace: "nowrap" }}>{roleLabel}</Typography>
        </Box>
      </Box>

      {onRemove && (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 0.75 }}>
          {p.status === "COMPLETED" && p.employeeId && (
            <Tooltip title={t(`${pp}.tooltip_view_results`)} placement="top" arrow>
              <IconButton size="small" onClick={handleViewResults} sx={{ width: 28, height: 28, color: "#7C3AED", bgcolor: "#F5F3FF", border: "1px solid #DDD6FE", "&:hover": { bgcolor: "#EDE9FE" } }}>
                <AssessmentOutlined sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={t(`${pp}.tooltip_remove`)} placement="top" arrow>
            <IconButton
              size="small" onClick={handleRemove} disabled={removing}
              sx={{ width: 28, height: 28, color: "#EF4444", bgcolor: "#FEF2F2", border: "1px solid #FECACA", "&:hover": { bgcolor: "#FEE2E2" }, "&:disabled": { opacity: 0.5 } }}
            >
              {removing ? <CircularProgress size={12} sx={{ color: "#EF4444" }} /> : <DeleteOutlineOutlined sx={{ fontSize: 14 }} />}
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
});
ParticipantRow.displayName = "ParticipantRow";

// ─── Employee picker row ──────────────────────────────────────────────────────

interface EmployeePickerRowProps {
  employee: NonParticipant;
  isLast: boolean;
  onAdd: (id: string) => void;
  adding: boolean;
  disabled: boolean;
}

const EmployeePickerRow = memo<EmployeePickerRowProps>(({ employee: e, isLast, onAdd, adding, disabled }) => {
  const { t } = useTranslation("dashboard");
  const pp = "pages.campaigns.detail.participants";
  const du = "pages.campaigns.detail";

  const name      = useMemo(() => (e.firstName && e.lastName) ? `${e.firstName} ${e.lastName}` : e.firstName || e.username || t(`${du}.unknown_user`), [e.firstName, e.lastName, e.username, t, du]);
  const email     = useMemo(() => e.email ?? "", [e.email]);
  const letter    = useMemo(() => name[0]?.toUpperCase() || "U", [name]);
  const roleEntry = useMemo(() => ROLES.find((r) => r.value === e.role || r.value === (e.role ?? "").toLowerCase()), [e.role]);
  const roleColor = useMemo(() => roleEntry?.color ?? "#6B7280", [roleEntry]);
  const roleLabel = useMemo(() => roleEntry?.label || e.role || "—", [roleEntry, e.role]);
  const RoleIcon  = useMemo(() => roleEntry?.icon ?? null, [roleEntry]);
  const gradient  = useMemo(() => pickGradient(email || name), [email, name]);

  const rowSx = useMemo(() => ({
    display: "flex", alignItems: "center", gap: 2,
    px: 3, py: 1.625,
    borderBottom: isLast ? "none" : "1px solid #F3F4F6",
    transition: "background-color 0.15s",
    "&:hover": { bgcolor: "#F8F9FF" },
  }), [isLast]);

  const avatarSx = useMemo(() => ({
    width: 38, height: 38, fontSize: "0.85rem", fontWeight: 800, color: "#fff",
    background: `linear-gradient(${gradient})`,
    flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
  }), [gradient]);

  const roleBadgeSx = useMemo(() => ({
    display: "inline-flex", alignItems: "center", gap: 0.5,
    px: 1.125, py: "4px", borderRadius: "999px",
    bgcolor: `${roleColor}0D`, border: `1px solid ${roleColor}28`,
    flexShrink: 0,
  }), [roleColor]);

  const addBtnSx = useMemo(() => ({
    display: "flex", alignItems: "center", gap: 0.625,
    px: 1.5, py: 0.75, borderRadius: "9px",
    cursor: adding || disabled ? "default" : "pointer",
    bgcolor: adding ? `${PURPLE}0A` : `${PURPLE}12`,
    border: `1.5px solid ${PURPLE}${adding ? "18" : "30"}`,
    opacity: disabled && !adding ? 0.4 : 1,
    transition: "all 0.15s",
    "&:hover": (!adding && !disabled) ? { bgcolor: `${PURPLE}1E`, borderColor: `${PURPLE}50`, boxShadow: `0 2px 8px ${PURPLE}20` } : {},
    flexShrink: 0, minWidth: 72, justifyContent: "center",
  }), [adding, disabled]);

  const handleAdd = useCallback(() => {
    if (!adding && !disabled) onAdd(e._id);
  }, [adding, disabled, onAdd, e._id]);

  return (
    <Box sx={rowSx}>
      <Avatar sx={avatarSx}>{letter}</Avatar>

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

      <Box sx={roleBadgeSx}>
        {RoleIcon && <Box sx={{ color: roleColor, display: "flex", alignItems: "center", "& svg": { fontSize: 10 } }}><RoleIcon /></Box>}
        <Typography sx={{ fontSize: "11px", fontWeight: 700, color: roleColor, whiteSpace: "nowrap" }}>{roleLabel}</Typography>
      </Box>

      <Box onClick={handleAdd} sx={addBtnSx}>
        {adding
          ? <CircularProgress size={12} sx={{ color: PURPLE }} />
          : <AddOutlined sx={{ fontSize: 13, color: PURPLE }} />}
        <Typography sx={{ fontSize: "12px", fontWeight: 700, color: PURPLE, lineHeight: 1 }}>
          {adding ? t(`${pp}.adding`) : t(`${pp}.add_button`)}
        </Typography>
      </Box>
    </Box>
  );
});
EmployeePickerRow.displayName = "EmployeePickerRow";

// ─── Add Participant Dialog ───────────────────────────────────────────────────

interface AddDialogProps {
  open: boolean;
  campaignId: string;
  onClose: () => void;
}

const AddParticipantDialog = memo<AddDialogProps>(({ open, campaignId, onClose }) => {
  const { t } = useTranslation("dashboard");
  const pp = "pages.campaigns.detail.participants";

  const [search,          setSearch]          = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [department,      setDepartment]      = useState("");
  const [role,            setRole]            = useState("");
  const [page,            setPage]            = useState(1);
  const [addingId,        setAddingId]        = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nonParticipantParams = useMemo(() => ({
    campaignId,
    search:     debouncedSearch || undefined,
    department: department      || undefined,
    role:       role            || undefined,
    page,
    limit: PICKER_PAGE_SIZE,
  }), [campaignId, debouncedSearch, department, role, page]);

  const { data: nonParticipantsRaw, isLoading: loading, error: queryError } = useNonParticipantsQuery(
    open ? nonParticipantParams : { campaignId: "", page: 1 },
  );
  const { data: deptsRaw } = useDepartmentsQuery();
  const addMut = useAddParticipantMutation(campaignId);

  const nonParticipantsData = (nonParticipantsRaw as any)?.data ?? nonParticipantsRaw;
  const employees   = nonParticipantsData?.employees ?? nonParticipantsData?.members ?? nonParticipantsData ?? [];
  const total       = nonParticipantsData?.total ?? 0;
  const error       = queryError ? String(queryError) : null;
  const departments = (Array.isArray(deptsRaw) ? deptsRaw : (deptsRaw as any)?.data) ?? [];

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    clearTimeout(debounceRef.current!);
    debounceRef.current = setTimeout(() => { setDebouncedSearch(value); setPage(1); }, 300);
  }, []);

  const handleAdd = useCallback(async (employeeId: string) => {
    setAddingId(employeeId);
    addMut.mutate(employeeId, {
      onSettled: () => setAddingId(null),
    });
  }, [addMut]);

  const clearAllFilters = useCallback(() => {
    setSearch(""); setDebouncedSearch(""); setDepartment(""); setRole("");
  }, []);

  const clearDept = useCallback(() => setDepartment(""), []);
  const clearRole = useCallback(() => setRole(""), []);

  const hasFilters = useMemo(() => !!debouncedSearch || !!department || !!role, [debouncedSearch, department, role]);
  const activeDeptLabel = useMemo(() => department ? (departments as any[]).find((d) => d._id === department)?.name : null, [department, departments]);
  const activeRoleLabel = useMemo(() => role ? ROLES.find((r) => r.value === role)?.label : null, [role]);

  const deptSelectSx = useMemo(() => ({
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
  }), [department]);

  const roleSelectSx = useMemo(() => ({
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
  }), [role]);

  const subtitleText = useMemo(() => loading
    ? t(`${pp}.add_loading_hint`)
    : total === 0
      ? t(`${pp}.add_none_available`)
      : t(`${pp}.add_available`, { count: total }), [loading, total, t, pp]);

  const paginationText = useMemo(() => total > 0 ? t(`${pp}.pagination_showing`, {
    from: Math.min((page - 1) * PICKER_PAGE_SIZE + 1, total),
    to: Math.min(page * PICKER_PAGE_SIZE, total),
    total,
  }) : "", [total, page, t, pp]);

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
        background: DIALOG_HEADER_BG,
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={DIALOG_ICON_BOX_SX}>
            <PersonAddOutlined sx={{ fontSize: 19, color: PURPLE }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: "15px", color: "#0F172A", lineHeight: 1.25 }}>
              {t(`${pp}.add_dialog_title`)}
            </Typography>
            <Typography sx={{ fontSize: "12px", color: "#94A3B8", mt: 0.3, fontWeight: 500 }}>
              {subtitleText}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={DIALOG_CLOSE_BTN_SX}>
          <CloseOutlined sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      {/* ── Filters ── */}
      <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #F1F3F6", bgcolor: "#FAFBFC", flexShrink: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap" }}>
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
              placeholder={t(`${pp}.search_placeholder`)}
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

          <Select
            size="small" displayEmpty value={department}
            onChange={(e) => setDepartment(e.target.value)}
            renderValue={(v) => v ? ((departments as any[]).find((d) => d._id === v)?.name ?? t(`${pp}.department_filter`)) : t(`${pp}.department_filter`)}
            sx={deptSelectSx}
          >
            <MenuItem value="" sx={{ fontSize: "12px", color: "#6B7280" }}>{t(`${pp}.all_departments`)}</MenuItem>
            {(departments as any[]).map((d) => (
              <MenuItem key={d._id} value={d._id} sx={{ fontSize: "12px" }}>{d.name}</MenuItem>
            ))}
          </Select>

          <Select
            size="small" displayEmpty value={role}
            onChange={(e) => setRole(e.target.value)}
            renderValue={(v) => v ? (ROLES.find((r) => r.value === v)?.label ?? t(`${pp}.role_filter`)) : t(`${pp}.role_filter`)}
            sx={roleSelectSx}
          >
            <MenuItem value="" sx={{ fontSize: "12px", color: "#6B7280" }}>{t(`${pp}.all_roles`)}</MenuItem>
            {ROLES.map((r) => (
              <MenuItem key={r.value} value={r.value} sx={{ fontSize: "12px" }}>{r.label}</MenuItem>
            ))}
          </Select>
        </Box>

        {(activeDeptLabel || activeRoleLabel) && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 1.25, flexWrap: "wrap" }}>
            <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", mr: 0.25 }}>
              {t(`${pp}.filters_label`)}
            </Typography>
            {activeDeptLabel && (
              <Box onClick={clearDept} sx={FILTER_CHIP_SX}>
                <Typography sx={{ fontSize: "11px", fontWeight: 700, color: PURPLE }}>{activeDeptLabel}</Typography>
                <CloseOutlined sx={{ fontSize: 11, color: PURPLE }} />
              </Box>
            )}
            {activeRoleLabel && (
              <Box onClick={clearRole} sx={FILTER_CHIP_SX}>
                <Typography sx={{ fontSize: "11px", fontWeight: 700, color: PURPLE }}>{activeRoleLabel}</Typography>
                <CloseOutlined sx={{ fontSize: 11, color: PURPLE }} />
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* ── Employee list ── */}
      <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0, bgcolor: "#fff" }}>
        {loading && <LinearProgress sx={PROGRESS_SX} />}

        {error ? (
          <Alert severity="error" sx={{ m: 2.5, borderRadius: "12px", fontSize: "13px" }}>{error}</Alert>
        ) : loading && (employees as any[]).length === 0 ? (
          <Box sx={{ py: 1 }}>
            {SKELETON_ROWS_8.map((_, i) => <PickerRowSkeleton key={i} />)}
          </Box>
        ) : (employees as any[]).length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8, px: 3 }}>
            <Box sx={PICKER_EMPTY_ICON_SX}>
              <PeopleAltOutlined sx={{ fontSize: 25, color: "#9CA3AF" }} />
            </Box>
            <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#374151", mb: 0.75 }}>
              {hasFilters ? t(`${pp}.empty_filtered_title`) : t(`${pp}.empty_all_added_title`)}
            </Typography>
            <Typography sx={{ fontSize: "12px", color: "#9CA3AF", lineHeight: 1.6 }}>
              {hasFilters ? t(`${pp}.empty_filtered_hint`) : t(`${pp}.empty_all_added_hint`)}
            </Typography>
            {hasFilters && (
              <Box onClick={clearAllFilters} sx={CLEAR_FILTERS_BTN_SX}>
                <CloseOutlined sx={{ fontSize: 13, color: PURPLE }} />
                <Typography sx={{ fontSize: "12px", fontWeight: 700, color: PURPLE }}>{t(`${pp}.clear_all_filters`)}</Typography>
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ py: 0.5 }}>
            {(employees as NonParticipant[]).map((emp, i) => (
              <EmployeePickerRow
                key={emp._id}
                employee={emp}
                isLast={i === (employees as any[]).length - 1}
                onAdd={handleAdd}
                adding={addingId === emp._id}
                disabled={!!(addMut.isPending && addingId !== emp._id)}
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
        {!loading && total > PICKER_PAGE_SIZE && (
          <Pagination page={page} total={total} pageSize={PICKER_PAGE_SIZE} onPageChange={setPage} />
        )}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>{paginationText}</Typography>
          <Box onClick={onClose} sx={DONE_BTN_SX}>
            <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>{t(`${pp}.done`)}</Typography>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
});
AddParticipantDialog.displayName = "AddParticipantDialog";

// ─── Main component ───────────────────────────────────────────────────────────

interface Props { campaignId: string; mode?: "company" | "employee"; anonymityMode?: string }

const CampaignParticipantsTab = memo<Props>(({ campaignId, mode = "company" }) => {
  const { t } = useTranslation("dashboard");
  const pp = "pages.campaigns.detail.participants";

  const isCompany = mode === "company";

  const [search,          setSearch]          = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page,            setPage]            = useState(1);
  const [addDialogOpen,   setAddDialogOpen]   = useState(false);
  const [removingId,      setRemovingId]      = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const participantParams = useMemo(() => ({
    campaignId,
    search: debouncedSearch || undefined,
    page,
    limit: PAGE_SIZE,
  }), [campaignId, debouncedSearch, page]);

  const { data: participantsRaw, isLoading: loading, error: queryError } = useCampaignParticipantsQuery(participantParams);
  const removeMut = useRemoveParticipantMutation(campaignId);

  const participantsData = (participantsRaw as any)?.data ?? participantsRaw;
  const participants     = participantsData?.participants ?? participantsData?.data ?? participantsData ?? [];
  const total            = participantsData?.total ?? 0;
  const error            = queryError ? String(queryError) : null;

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    clearTimeout(debounceRef.current!);
    debounceRef.current = setTimeout(() => { setDebouncedSearch(value); setPage(1); }, 300);
  }, []);

  const handleRemoveParticipant = useCallback((participantId: string) => {
    setRemovingId(participantId);
    removeMut.mutate(participantId, {
      onSettled: () => setRemovingId(null),
    });
  }, [removeMut]);

  const openAddDialog  = useCallback(() => setAddDialogOpen(true), []);
  const closeAddDialog = useCallback(() => setAddDialogOpen(false), []);
  const clearSearch    = useCallback(() => handleSearchChange(""), [handleSearchChange]);

  const tableHeaderCols = useMemo(() => [
    t(`${pp}.col_hash`),
    t(`${pp}.col_participant`),
    t(`${pp}.col_status`),
    t(`${pp}.col_role`),
    ...(isCompany ? [t(`${pp}.col_actions`)] : []),
  ], [t, pp, isCompany]);

  const tableGridCols = isCompany ? ROW_SKELETON_GRID_COMPANY : ROW_SKELETON_GRID_EMPLOYEE;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

      {/* ── Toolbar ── */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Box sx={TOOLBAR_TOTAL_SX}>
            <PeopleAltOutlined sx={{ fontSize: 13, color: "#64748B" }} />
            <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#374151" }}>
              {loading ? "…" : total}
            </Typography>
            <Typography sx={{ fontSize: "11px", color: "#94A3B8", fontWeight: 500 }}>{t(`${pp}.toolbar_total`)}</Typography>
          </Box>
          {!loading && (participants as CampaignParticipant[]).length > 0 && (
            <>
              {(["COMPLETED", "IN_PROGRESS", "INVITED"] as ParticipantStatus[]).map((s) => {
                const count = (participants as CampaignParticipant[]).filter((p) => p.status === s).length;
                if (!count) return null;
                const sc = PARTICIPANT_STATUS_META[s];
                return (
                  <Box key={s} sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 1.125, py: "4px", borderRadius: "999px", bgcolor: sc.bg, border: `1px solid ${sc.border}` }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: sc.color }} />
                    <Typography sx={{ fontSize: "11px", fontWeight: 700, color: sc.color }}>{count} {t(`${pp}.participant_status.${s}`)}</Typography>
                  </Box>
                );
              })}
            </>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={SEARCH_BOX_SX}>
            <SearchOutlined sx={{ fontSize: 15, color: "#9CA3AF", flexShrink: 0, mr: 1 }} />
            <input
              type="text" placeholder={t(`${pp}.search_participants_placeholder`)} value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{ border: "none", outline: "none", background: "transparent", fontSize: "13px", color: "#111827", width: "100%", fontFamily: "inherit", padding: "2px 0" }}
            />
            {search && (
              <IconButton size="small" onClick={clearSearch} sx={{ p: 0.25, color: "#9CA3AF" }}>
                <CloseOutlined sx={{ fontSize: 13 }} />
              </IconButton>
            )}
          </Box>

          {isCompany && (
            <Box onClick={openAddDialog} sx={ADD_BTN_SX}>
              <PersonAddOutlined sx={{ fontSize: 15, color: "#fff" }} />
              <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: "#fff" }}>{t(`${pp}.add_button`)}</Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* ── Table card ── */}
      <Box sx={TABLE_CARD_SX}>
        {loading && <LinearProgress sx={PROGRESS_SX} />}

        <Box sx={{
          display: "grid",
          gridTemplateColumns: tableGridCols,
          alignItems: "center", gap: 2, px: 3, py: 1.5,
          background: "linear-gradient(135deg, #F8F9FB 0%, #F3F4F8 100%)",
          borderBottom: "1px solid #E5E7EB",
        }}>
          {tableHeaderCols.map((col, i) => (
            <Typography
              key={col}
              sx={{ ...COL_HEADER_SX_BASE, textAlign: i === 1 ? "left" : "center" }}
            >
              {col}
            </Typography>
          ))}
        </Box>

        {error ? (
          <Alert severity="error" sx={{ m: 2.5, borderRadius: 2 }}>{error}</Alert>
        ) : loading && (participants as any[]).length === 0 ? (
          <Box>{SKELETON_ROWS_5.map((_, i) => <RowSkeleton key={i} showActions={isCompany} />)}</Box>
        ) : (participants as any[]).length === 0 ? (
          <Box sx={{ textAlign: "center", py: 9 }}>
            <Box sx={EMPTY_STATE_ICON_SX}>
              <PeopleAltOutlined sx={{ fontSize: 26, color: "#9CA3AF" }} />
            </Box>
            <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#374151" }}>
              {debouncedSearch ? t(`${pp}.empty_search_title`) : t(`${pp}.empty_title`)}
            </Typography>
            <Typography sx={{ fontSize: "12px", color: "#9CA3AF", mt: 0.5 }}>
              {debouncedSearch ? t(`${pp}.empty_search_hint`) : t(`${pp}.empty_hint`)}
            </Typography>
          </Box>
        ) : (
          (participants as CampaignParticipant[]).map((p, i) => (
            <ParticipantRow
              key={p._id} participant={p} index={i} total={(participants as any[]).length}
              campaignId={campaignId}
              onRemove={isCompany ? handleRemoveParticipant : undefined}
              removing={removingId === p._id}
            />
          ))
        )}
      </Box>

      {!loading && total > PAGE_SIZE && (
        <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
      )}

      {isCompany && (
        <AddParticipantDialog
          open={addDialogOpen}
          campaignId={campaignId}
          onClose={closeAddDialog}
        />
      )}
    </Box>
  );
});
CampaignParticipantsTab.displayName = "CampaignParticipantsTab";

export default CampaignParticipantsTab;
