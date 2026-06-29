import React, { memo, useState, useCallback, useMemo } from "react";
import { Box, Typography, Alert, CircularProgress, useMediaQuery } from "@mui/material";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import { useTranslation } from "react-i18next";
import EmployeeCard from "./EmployeeCard";
import EmployeeSkeletonCard from "./EmployeeSkeletonCard";
import InvitationCard from "./InvitationCard";
import EmployeesFilterBar from "./EmployeesFilterBar";
import type { ExtendedMember } from "@/modules/company/employees/types";
import { Invitation } from "@/types/employee";
import { Department } from "@/modules/company/departments/types";
import { PURPLE, AMBER, GRID } from "./constants";
import Pagination from "@/components/ui/Pagination";

export type RoleFilter = "all" | string;
export type SortOption = "newest" | "name-asc" | "name-desc";

// ─── Module-level constants ────────────────────────────────────────────────────

const BLINK_SX = {
  "@keyframes blink": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.3 } },
} as const;

const TOP_BAR_SX   = { display: "flex", alignItems: "center", gap: 1.5, mb: 2.5, flexWrap: "wrap" } as const;
const TAB_STRIP_SX = { display: "inline-flex", alignItems: "center", bgcolor: "#F3F4F6", borderRadius: "12px", p: 0.5, gap: 0.5, flexShrink: 0 } as const;
const PANEL_SX     = { bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", p: { xs: 2, sm: 3 } } as const;
const EMPTY_SX     = { textAlign: "center", py: 10 } as const;
const EMPTY_ICON_SX = { fontSize: 48, color: "#D1D5DB", mb: 2 } as const;
const EMPTY_TITLE_SX = { fontSize: "15px", fontWeight: 600, color: "#374151" } as const;
const EMPTY_HINT_SX  = { fontSize: "13px", color: "#9CA3AF", mt: 0.5 } as const;
const ALERT_SX     = { borderRadius: 2 } as const;
const INV_LOADER_SX = { display: "flex", justifyContent: "center", py: 8 } as const;
const MOBILE_BREAK_SX = { width: "100%" } as const;
const TAB_BASE_SX  = {
  display: "flex", alignItems: "center", gap: 1,
  px: 2, py: 0.875, borderRadius: "9px", cursor: "pointer",
  transition: "all 0.18s ease",
} as const;
const TAB_ICON_SX  = { display: "flex", fontSize: 16 } as const;
const TAB_COUNT_SX = { minWidth: 20, height: 20, borderRadius: "6px", px: 0.75, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" } as const;
const DOT_BASE_SX  = { position: "absolute", top: -3, right: -3, width: 7, height: 7, borderRadius: "50%", border: "1.5px solid #F3F4F6", animation: "blink 1.8s ease-in-out infinite" } as const;

// Pre-built skeleton arrays — allocated once at module load
const SKELETONS_6 = Array.from({ length: 6 }, (_, i) => <EmployeeSkeletonCard key={i} />);

// ─── TabPill ──────────────────────────────────────────────────────────────────

interface TabPillProps {
  id: "employees" | "invitations";
  label: string;
  icon: React.ReactNode;
  count: number | string;
  color: string;
  pulse?: boolean;
  active: boolean;
  onClick: (id: "employees" | "invitations") => void;
}

const TabPill: React.FC<TabPillProps> = memo(({ id, label, icon, count, color, pulse = false, active, onClick }) => {
  const handleClick = useCallback(() => onClick(id), [onClick, id]);

  const containerSx = useMemo(() => ({
    ...TAB_BASE_SX,
    bgcolor: active ? "#fff" : "transparent",
    boxShadow: active ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
    "&:hover": !active ? { bgcolor: "#EAECF0" } : {},
  }), [active]);

  const iconSx = useMemo(() => ({ ...TAB_ICON_SX, color: active ? color : "#6B7280" }), [active, color]);

  const labelSx = useMemo(() => ({
    fontSize: "13px", fontWeight: 700,
    color: active ? "#111827" : "#6B7280", whiteSpace: "nowrap",
  }), [active]);

  const badgeSx = useMemo(() => ({
    ...TAB_COUNT_SX,
    bgcolor: active ? `${color}18` : (pulse ? `${color}15` : "#E5E7EB"),
  }), [active, color, pulse]);

  const countSx = useMemo(() => ({
    fontSize: "11px", fontWeight: 800,
    color: active ? color : (pulse ? color : "#9CA3AF"),
  }), [active, color, pulse]);

  const dotSx = useMemo(() => ({ ...DOT_BASE_SX, bgcolor: color, ...BLINK_SX }), [color]);

  return (
    <Box onClick={handleClick} sx={containerSx}>
      <Box sx={iconSx}>{icon}</Box>
      <Typography sx={labelSx}>{label}</Typography>
      <Box sx={badgeSx}>
        <Typography sx={countSx}>{count}</Typography>
        {pulse && !active && <Box sx={dotSx} />}
      </Box>
    </Box>
  );
});
TabPill.displayName = "TabPill";

// ─── Main component ───────────────────────────────────────────────────────────

interface EmployeesListProps {
  members: ExtendedMember[];
  loading: boolean;
  error: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  roleFilter: RoleFilter;
  onRoleFilterChange: (f: RoleFilter) => void;
  departmentFilter: string;
  onDepartmentFilterChange: (d: string) => void;
  departments: Department[];
  sortBy: SortOption;
  onSortChange: (s: SortOption) => void;
  onEdit: (member: ExtendedMember) => void;
  onDelete: (member: ExtendedMember) => void;
  onSelect: (member: ExtendedMember) => void;
  canInvite?: boolean;
  canAssignRoles?: boolean;
  canRemove?: boolean;
  invitations?: Invitation[];
  fetchingInvitations?: boolean;
  onResend?: (id: string) => Promise<void>;
  onCancel?: (id: string) => Promise<void>;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
}

const EmployeesList: React.FC<EmployeesListProps> = memo(({
  members, loading, error, search, onSearchChange,
  roleFilter, onRoleFilterChange,
  departmentFilter, onDepartmentFilterChange, departments,
  sortBy, onSortChange,
  onEdit, onDelete, onSelect,
  canInvite = true, canAssignRoles = true, canRemove = true,
  invitations = [], fetchingInvitations = false, onResend, onCancel,
  total, page, pageSize, onPageChange,
}) => {
  const { t } = useTranslation("dashboard");
  const isMobile = useMediaQuery("(max-width:650px)");
  const [tab, setTab] = useState<"employees" | "invitations">("employees");
  const handleTabChange = useCallback((id: "employees" | "invitations") => setTab(id), []);

  const hasAnyFilter = roleFilter !== "all" || departmentFilter !== "all" || search.trim().length > 0;

  const memberCards = useMemo(() => members.map((m, i) => (
    <EmployeeCard key={m._id} member={m} index={i} onEdit={onEdit} onDelete={onDelete} onSelect={onSelect} canAssignRoles={canAssignRoles} canRemove={canRemove} />
  )), [members, onEdit, onDelete, onSelect, canAssignRoles, canRemove]);

  const invitationCards = useMemo(() => (onResend && onCancel)
    ? invitations.map((inv) => <InvitationCard key={inv._id} invitation={inv} onResend={onResend} onCancel={onCancel} />)
    : null,
  [invitations, onResend, onCancel]);

  const empCount = loading ? "…" : total;
  const invCount = fetchingInvitations ? "…" : invitations.length;
  const invPulse = invitations.length > 0;

  return (
    <Box>
      <Box sx={TOP_BAR_SX}>
        <Box sx={TAB_STRIP_SX}>
          <TabPill
            id="employees" active={tab === "employees"}
            label={t("pages.employees.list.tab_employees")}
            icon={<PeopleAltOutlined sx={{ fontSize: 16 }} />}
            count={empCount} color={PURPLE}
            onClick={handleTabChange}
          />
          {canInvite && (
            <TabPill
              id="invitations" active={tab === "invitations"}
              label={t("pages.employees.list.tab_invitations")}
              icon={<EmailOutlined sx={{ fontSize: 16 }} />}
              count={invCount} color={AMBER} pulse={invPulse}
              onClick={handleTabChange}
            />
          )}
        </Box>

        {tab === "employees" && (
          <EmployeesFilterBar
            search={search} onSearchChange={onSearchChange}
            roleFilter={roleFilter} onRoleFilterChange={onRoleFilterChange}
            departmentFilter={departmentFilter} onDepartmentFilterChange={onDepartmentFilterChange}
            departments={departments}
            sortBy={sortBy} onSortChange={onSortChange}
            resultCount={total}
          />
        )}

        {tab === "employees" && isMobile && <Box sx={MOBILE_BREAK_SX} />}
      </Box>

      <Box sx={PANEL_SX}>
        {tab === "employees" && (
          error ? (
            <Alert severity="error" sx={ALERT_SX}>{error}</Alert>
          ) : loading ? (
            <Box sx={GRID}>{SKELETONS_6}</Box>
          ) : members.length === 0 ? (
            <Box sx={EMPTY_SX}>
              <PeopleAltOutlined sx={EMPTY_ICON_SX} />
              <Typography sx={EMPTY_TITLE_SX}>
                {hasAnyFilter ? t("pages.employees.list.empty_employees_filtered") : t("pages.employees.list.empty_employees_none")}
              </Typography>
              <Typography sx={EMPTY_HINT_SX}>
                {hasAnyFilter ? t("pages.employees.list.empty_employees_filtered_hint") : t("pages.employees.list.empty_employees_hint")}
              </Typography>
            </Box>
          ) : (
            <Box sx={GRID}>{memberCards}</Box>
          )
        )}

        {tab === "invitations" && (
          fetchingInvitations ? (
            <Box sx={INV_LOADER_SX}><CircularProgress size={28} sx={{ color: AMBER }} /></Box>
          ) : invitations.length === 0 ? (
            <Box sx={EMPTY_SX}>
              <EmailOutlined sx={EMPTY_ICON_SX} />
              <Typography sx={EMPTY_TITLE_SX}>{t("pages.employees.list.empty_invitations_title")}</Typography>
              <Typography sx={EMPTY_HINT_SX}>{t("pages.employees.list.empty_invitations_sub")}</Typography>
            </Box>
          ) : (
            <Box sx={GRID}>{invitationCards}</Box>
          )
        )}
      </Box>

      {tab === "employees" && !loading && !error && (
        <Pagination page={page} total={total} pageSize={pageSize} onPageChange={onPageChange} />
      )}
    </Box>
  );
});

EmployeesList.displayName = "EmployeesList";
export default EmployeesList;
