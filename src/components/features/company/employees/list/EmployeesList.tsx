import React, { memo, useState } from "react";
import { Box, Typography, Alert, CircularProgress, useMediaQuery } from "@mui/material";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import { useTranslation } from "react-i18next";
import EmployeeCard from "./EmployeeCard";
import EmployeeSkeletonCard from "./EmployeeSkeletonCard";
import InvitationCard from "./InvitationCard";
import EmployeesFilterBar from "./EmployeesFilterBar";
import { Member } from "@/store/slices/memberSlice";
import { Invitation } from "@/types/employee";
import { Department } from "@/store/slices/departmentSlice";
import { PURPLE, AMBER, GRID } from "./constants";
import Pagination from "@/components/ui/Pagination";

export type RoleFilter = "all" | string;
export type SortOption = "newest" | "name-asc" | "name-desc";

interface EmployeesListProps {
  members: Member[];
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
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
  onSelect: (member: Member) => void;
  canInvite?: boolean;
  canAssignRoles?: boolean;
  canRemove?: boolean;
  invitations?: Invitation[];
  fetchingInvitations?: boolean;
  onResend?: (id: string) => Promise<void>;
  onCancel?: (id: string) => Promise<void>;
  /** Backend-driven pagination */
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

  const hasAnyFilter = roleFilter !== "all" || departmentFilter !== "all" || search.trim().length > 0;

  /* ── Tab pill ── */
  const TabPill = ({ id, label, icon, count, color, pulse }: {
    id: "employees" | "invitations"; label: string;
    icon: React.ReactNode; count: number | string; color: string; pulse?: boolean;
  }) => (
    <Box onClick={() => setTab(id)} sx={{
      display: "flex", alignItems: "center", gap: 1,
      px: 2, py: 0.875, borderRadius: "9px", cursor: "pointer",
      transition: "all 0.18s ease",
      bgcolor: tab === id ? "#fff" : "transparent",
      boxShadow: tab === id ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
      "&:hover": tab !== id ? { bgcolor: "#EAECF0" } : {},
    }}>
      <Box sx={{ color: tab === id ? color : "#6B7280", display: "flex", fontSize: 16 }}>{icon}</Box>
      <Typography sx={{ fontSize: "13px", fontWeight: 700, color: tab === id ? "#111827" : "#6B7280", whiteSpace: "nowrap" }}>
        {label}
      </Typography>
      <Box sx={{
        minWidth: 20, height: 20, borderRadius: "6px", px: 0.75, position: "relative",
        display: "flex", alignItems: "center", justifyContent: "center",
        bgcolor: tab === id ? `${color}18` : (pulse ? `${color}15` : "#E5E7EB"),
      }}>
        <Typography sx={{ fontSize: "11px", fontWeight: 800, color: tab === id ? color : (pulse ? color : "#9CA3AF") }}>
          {count}
        </Typography>
        {pulse && tab !== id && (
          <Box sx={{
            position: "absolute", top: -3, right: -3, width: 7, height: 7, borderRadius: "50%",
            bgcolor: color, border: "1.5px solid #F3F4F6",
            animation: "blink 1.8s ease-in-out infinite",
            "@keyframes blink": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.3 } },
          }} />
        )}
      </Box>
    </Box>
  );

  return (
    <Box>
      {/* ── Top bar: tabs + filter bar ──────────────────────────────── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5, flexWrap: "wrap" }}>

        {/* Tabs */}
        <Box sx={{ display: "inline-flex", alignItems: "center", bgcolor: "#F3F4F6", borderRadius: "12px", p: 0.5, gap: 0.5, flexShrink: 0 }}>
          <TabPill id="employees"   label={t("pages.employees.list.tab_employees")} icon={<PeopleAltOutlined sx={{ fontSize: 16 }} />} count={loading ? "…" : total} color={PURPLE} />
          {canInvite && <TabPill id="invitations" label={t("pages.employees.list.tab_invitations")} icon={<EmailOutlined sx={{ fontSize: 16 }} />}    count={fetchingInvitations ? "…" : invitations.length} color={AMBER} pulse={invitations.length > 0} />}
        </Box>

        {/* Filter bar (employees tab only) */}
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

        {/* Mobile spacer so filter bar wraps to its own row */}
        {tab === "employees" && isMobile && <Box sx={{ width: "100%" }} />}
      </Box>

      {/* ── Tab panels ──────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", p: { xs: 2, sm: 3 } }}>
        {tab === "employees" && (
          error ? (
            <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
          ) : loading ? (
            <Box sx={GRID}>{Array.from({ length: 6 }).map((_, i) => <EmployeeSkeletonCard key={i} />)}</Box>
          ) : members.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 10 }}>
              <PeopleAltOutlined sx={{ fontSize: 48, color: "#D1D5DB", mb: 2 }} />
              <Typography sx={{ fontSize: "15px", fontWeight: 600, color: "#374151" }}>
                {hasAnyFilter ? t("pages.employees.list.empty_employees_filtered") : t("pages.employees.list.empty_employees_none")}
              </Typography>
              <Typography sx={{ fontSize: "13px", color: "#9CA3AF", mt: 0.5 }}>
                {hasAnyFilter ? t("pages.employees.list.empty_employees_filtered_hint") : t("pages.employees.list.empty_employees_hint")}
              </Typography>
            </Box>
          ) : (
            <Box sx={GRID}>{members.map((m: Member, i: number) => <EmployeeCard key={m._id} member={m} index={i} onEdit={onEdit} onDelete={onDelete} onSelect={onSelect} canAssignRoles={canAssignRoles} canRemove={canRemove} />)}</Box>
          )
        )}

        {tab === "invitations" && (
          fetchingInvitations ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress size={28} sx={{ color: AMBER }} /></Box>
          ) : invitations.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 10 }}>
              <EmailOutlined sx={{ fontSize: 48, color: "#D1D5DB", mb: 2 }} />
              <Typography sx={{ fontSize: "15px", fontWeight: 600, color: "#374151" }}>{t("pages.employees.list.empty_invitations_title")}</Typography>
              <Typography sx={{ fontSize: "13px", color: "#9CA3AF", mt: 0.5 }}>{t("pages.employees.list.empty_invitations_sub")}</Typography>
            </Box>
          ) : onResend && onCancel ? (
            <Box sx={GRID}>{invitations.map((inv) => <InvitationCard key={inv._id} invitation={inv} onResend={onResend} onCancel={onCancel} />)}</Box>
          ) : null
        )}
      </Box>

      {/* ── Pagination ──────────────────────────────────────────────── */}
      {tab === "employees" && !loading && !error && (
        <Pagination page={page} total={total} pageSize={pageSize} onPageChange={onPageChange} />
      )}
    </Box>
  );
});

EmployeesList.displayName = "EmployeesList";
export default EmployeesList;
