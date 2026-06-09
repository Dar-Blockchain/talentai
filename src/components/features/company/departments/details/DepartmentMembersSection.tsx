import React, { memo, useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Box, Typography, Alert, CircularProgress } from "@mui/material";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import PersonAddOutlined  from "@mui/icons-material/PersonAddOutlined";
import EmailOutlined      from "@mui/icons-material/EmailOutlined";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { AppDispatch } from "@/store/store";
import {
  fetchMembers, selectMembers, addEmployee,
  fetchInvitationsByDepartment, cancelInvitation, resendInvitation,
  Member,
} from "@/store/slices/memberSlice";
import { RoleFilter, SortOption } from "@/modules/company/employees/components/list/EmployeesList";
import EmployeesFilterBar   from "@/modules/company/employees/components/list/EmployeesFilterBar";
import EmployeeCard         from "@/modules/company/employees/components/list/EmployeeCard";
import EmployeeSkeletonCard from "@/modules/company/employees/components/list/EmployeeSkeletonCard";
import InvitationCard       from "@/modules/company/employees/components/list/InvitationCard";
import Pagination           from "@/components/ui/Pagination";
import { PURPLE, AMBER, GRID } from "@/modules/company/employees/components/list/constants";
import AddEmployeeModal     from "@/modules/company/employees/components/create/AddEmployeeModal";
import AppButton            from "@/components/ui/AppButton";
import { useToast }         from "@/hooks/useToast";
import { Invitation as InvitationType } from "@/types/employee";

const PAGE_SIZE = 9;

const SORT_MAP: Record<SortOption, { sortBy: "date" | "name"; order: "asc" | "desc" }> = {
  newest:      { sortBy: "date", order: "desc" },
  "name-asc":  { sortBy: "name", order: "asc"  },
  "name-desc": { sortBy: "name", order: "desc" },
};

// ─── Module-level sx constants ────────────────────────────────────────────────

const TOP_BAR_SX      = { display: "flex", alignItems: "center", gap: 1.5, mb: 2.5, flexWrap: "wrap" } as const;
const TAB_STRIP_SX    = { display: "inline-flex", alignItems: "center", bgcolor: "#F3F4F6", borderRadius: "12px", p: 0.5, gap: 0.5, flexShrink: 0 } as const;
const INVITE_BTN_SX   = { ml: "auto" } as const;
const PANEL_SX        = { bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", p: { xs: 2, sm: 3 } } as const;
const EMPTY_SX        = { textAlign: "center", py: 10 } as const;
const INV_LOADER_SX   = { display: "flex", justifyContent: "center", py: 8 } as const;
const ALERT_SX        = { borderRadius: 2 } as const;
const PEOPLE_ICON_SX  = { fontSize: 48, color: "#D1D5DB", mb: 2 } as const;
const EMAIL_ICON_SX   = { fontSize: 48, color: "#D1D5DB", mb: 2 } as const;
const EMPTY_TITLE_SX  = { fontSize: "15px", fontWeight: 600, color: "#374151" } as const;
const EMPTY_HINT_SX   = { fontSize: "13px", color: "#9CA3AF", mt: 0.5 } as const;

// Pre-built skeleton array — same length every time, never reallocated
const SKELETONS = Array.from({ length: PAGE_SIZE }, (_, i) => <EmployeeSkeletonCard key={i} />);

// ─── TabPill ──────────────────────────────────────────────────────────────────

const BLINK_SX = {
  "@keyframes blink": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.3 } },
} as const;

const TAB_BASE_SX = {
  display: "flex", alignItems: "center", gap: 1,
  px: 2, py: 0.875, borderRadius: "9px", cursor: "pointer",
  transition: "all 0.18s ease",
} as const;

const ICON_BOX_SX  = { display: "flex", fontSize: 16 } as const;
const BADGE_BOX_SX = { minWidth: 20, height: 20, borderRadius: "6px", px: 0.75, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" } as const;
const DOT_BASE_SX  = { position: "absolute", top: -3, right: -3, width: 7, height: 7, borderRadius: "50%", border: "1.5px solid #F3F4F6", animation: "blink 1.8s ease-in-out infinite" } as const;

interface TabPillProps {
  active:  boolean;
  label:   string;
  icon:    React.ReactNode;
  count:   number | string;
  color:   string;
  pulse?:  boolean;
  onClick: () => void;
}

const TabPill: React.FC<TabPillProps> = memo(({ active, label, icon, count, color, pulse, onClick }) => {
  const containerSx = useMemo(() => ({
    ...TAB_BASE_SX,
    bgcolor: active ? "#fff" : "transparent",
    boxShadow: active ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
    "&:hover": !active ? { bgcolor: "#EAECF0" } : {},
  }), [active]);

  const iconBoxSx = useMemo(() => ({
    ...ICON_BOX_SX,
    color: active ? color : "#6B7280",
  }), [active, color]);

  const labelSx = useMemo(() => ({
    fontSize: "13px", fontWeight: 700,
    color: active ? "#111827" : "#6B7280",
    whiteSpace: "nowrap",
  }), [active]);

  const badgeSx = useMemo(() => ({
    ...BADGE_BOX_SX,
    bgcolor: active ? `${color}18` : (pulse ? `${color}15` : "#E5E7EB"),
  }), [active, color, pulse]);

  const countSx = useMemo(() => ({
    fontSize: "11px", fontWeight: 800,
    color: active ? color : (pulse ? color : "#9CA3AF"),
  }), [active, color, pulse]);

  const dotSx = useMemo(() => ({
    ...DOT_BASE_SX,
    bgcolor: color,
    ...BLINK_SX,
  }), [color]);

  return (
    <Box onClick={onClick} sx={containerSx}>
      <Box sx={iconBoxSx}>{icon}</Box>
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

interface DepartmentMembersSectionProps {
  departmentId:    string;
  canManage?:      boolean;
  canAssignRoles?: boolean;
  canRemove?:      boolean;
  onEdit?:   (member: Member) => void;
  onDelete?: (member: Member) => void;
}

const EMPTY_DEPTS: never[] = [];

const DepartmentMembersSection: React.FC<DepartmentMembersSectionProps> = memo(({
  departmentId, canManage = true, canAssignRoles = true, canRemove = true,
  onEdit, onDelete,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation("dashboard");
  const { showToast } = useToast();
  const { members, pageTotal, loading, error } = useSelector(selectMembers);

  const [tab,             setTab]             = useState<"members" | "invitations">("members");
  const [search,          setSearch]          = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter,      setRoleFilter]      = useState<RoleFilter>("all");
  const [sortBy,          setSortBy]          = useState<SortOption>("newest");
  const [page,            setPage]            = useState(1);
  const [inviteOpen,      setInviteOpen]      = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [invitations, setInvitations] = useState<InvitationType[]>([]);
  const [invLoading,  setInvLoading]  = useState(false);

  const loadInvitations = useCallback(async () => {
    setInvLoading(true);
    try {
      const result = await dispatch(fetchInvitationsByDepartment(departmentId)).unwrap();
      setInvitations(result as unknown as InvitationType[]);
    } catch { /* silent */ }
    finally { setInvLoading(false); }
  }, [dispatch, departmentId]);

  useEffect(() => { loadInvitations(); }, [loadInvitations]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    clearTimeout(debounceRef.current!);
    debounceRef.current = setTimeout(() => { setDebouncedSearch(value); setPage(1); }, 300);
  }, []);

  useEffect(() => { setPage(1); }, [debouncedSearch, roleFilter, sortBy]);

  const refreshMembers = useCallback(() => {
    const { sortBy: sb, order } = SORT_MAP[sortBy];
    dispatch(fetchMembers({
      departmentId,
      search:  debouncedSearch || undefined,
      role:    roleFilter !== "all" ? roleFilter : undefined,
      sortBy: sb, order, page, limit: PAGE_SIZE,
    }));
  }, [dispatch, departmentId, sortBy, debouncedSearch, roleFilter, page]);

  useEffect(() => { refreshMembers(); }, [refreshMembers]);

  const handleInvite = useCallback(async (email: string, role: string, deptId?: string) => {
    await dispatch(addEmployee({ email, role, departmentId: deptId || departmentId })).unwrap();
    setInviteOpen(false);
    showToast({ message: t("pages.departments.members_panel.toast_invite_sent"), severity: "success" });
    refreshMembers();
    loadInvitations();
  }, [dispatch, departmentId, refreshMembers, loadInvitations, showToast, t]);

  const handleResend = useCallback(async (id: string) => {
    await dispatch(resendInvitation(id)).unwrap();
    showToast({ message: t("pages.departments.members_panel.toast_invite_resent"), severity: "success" });
    loadInvitations();
  }, [dispatch, showToast, loadInvitations, t]);

  const handleCancel = useCallback(async (id: string) => {
    await dispatch(cancelInvitation(id)).unwrap();
    setInvitations((prev) => prev.filter((i) => i._id !== id));
    showToast({ message: t("pages.departments.members_panel.toast_invite_cancelled"), severity: "info" });
  }, [dispatch, showToast, t]);

  const handleRoleFilterChange = useCallback((f: RoleFilter) => { setRoleFilter(f); setPage(1); }, []);
  const handleSortChange       = useCallback((s: SortOption) => { setSortBy(s); setPage(1); }, []);
  const openInviteModal        = useCallback(() => setInviteOpen(true), []);
  const closeInviteModal       = useCallback(() => setInviteOpen(false), []);
  const showMembers            = useCallback(() => setTab("members"), []);
  const showInvitations        = useCallback(() => setTab("invitations"), []);
  const handleEdit             = useCallback((m: Member) => onEdit?.(m),   [onEdit]);
  const handleDelete           = useCallback((m: Member) => onDelete?.(m), [onDelete]);
  const handleSelect           = useCallback(() => {}, []);
  const noDeptChange           = useCallback(() => {}, []);

  const hasFilter = search || roleFilter !== "all";

  // Stable memoized member cards — only rebuilt when members array reference changes
  const memberCards = useMemo(() => members.map((m, i) => (
    <EmployeeCard
      key={m._id}
      member={m as Member}
      index={i}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onSelect={handleSelect}
      canAssignRoles={canAssignRoles}
      canRemove={canRemove}
    />
  )), [members, handleEdit, handleDelete, handleSelect, canAssignRoles, canRemove]);

  // Stable memoized invitation cards
  const invitationCards = useMemo(() => invitations.map((inv) => (
    <InvitationCard key={inv._id} invitation={inv} onResend={handleResend} onCancel={handleCancel} />
  )), [invitations, handleResend, handleCancel]);

  const memberCount     = loading     ? t("pages.departments.detail.loading_short") : pageTotal;
  const invitationCount = invLoading  ? t("pages.departments.detail.loading_short") : invitations.length;
  const invitationPulse = invitations.length > 0;

  const inviteBtnIcon = useMemo(() => <PersonAddOutlined sx={{ fontSize: 15 }} />, []);

  return (
    <Box>
      <Box sx={TOP_BAR_SX}>
        <Box sx={TAB_STRIP_SX}>
          <TabPill
            active={tab === "members"}
            label={t("pages.departments.members_panel.tab_members")}
            icon={<PeopleAltOutlined sx={{ fontSize: 16 }} />}
            count={memberCount}
            color={PURPLE}
            onClick={showMembers}
          />
          <TabPill
            active={tab === "invitations"}
            label={t("pages.departments.members_panel.tab_invitations")}
            icon={<EmailOutlined sx={{ fontSize: 16 }} />}
            count={invitationCount}
            color={AMBER}
            pulse={invitationPulse}
            onClick={showInvitations}
          />
        </Box>

        {tab === "members" && (
          <EmployeesFilterBar
            search={search}          onSearchChange={handleSearchChange}
            roleFilter={roleFilter}  onRoleFilterChange={handleRoleFilterChange}
            departmentFilter="all"   onDepartmentFilterChange={noDeptChange}
            departments={EMPTY_DEPTS}
            sortBy={sortBy}          onSortChange={handleSortChange}
            resultCount={pageTotal}
            hideDepartmentFilter
          />
        )}

        {canManage && (
          <Box sx={INVITE_BTN_SX}>
            <AppButton
              label={t("pages.departments.members_panel.invite_employee")}
              variant="contained"
              size="small"
              startIcon={inviteBtnIcon}
              onClick={openInviteModal}
            />
          </Box>
        )}
      </Box>

      <Box sx={PANEL_SX}>
        {tab === "members" && (
          error ? (
            <Alert severity="error" sx={ALERT_SX}>{error}</Alert>
          ) : loading ? (
            <Box sx={GRID}>{SKELETONS}</Box>
          ) : members.length === 0 ? (
            <Box sx={EMPTY_SX}>
              <PeopleAltOutlined sx={PEOPLE_ICON_SX} />
              <Typography sx={EMPTY_TITLE_SX}>
                {hasFilter ? t("pages.departments.members_panel.empty_members_filtered_title") : t("pages.departments.members_panel.empty_members_title")}
              </Typography>
              <Typography sx={EMPTY_HINT_SX}>
                {hasFilter ? t("pages.departments.members_panel.empty_members_filtered_hint") : t("pages.departments.members_panel.empty_members_hint")}
              </Typography>
            </Box>
          ) : (
            <Box sx={GRID}>{memberCards}</Box>
          )
        )}

        {tab === "invitations" && (
          invLoading ? (
            <Box sx={INV_LOADER_SX}>
              <CircularProgress size={28} sx={{ color: AMBER }} />
            </Box>
          ) : invitations.length === 0 ? (
            <Box sx={EMPTY_SX}>
              <EmailOutlined sx={EMAIL_ICON_SX} />
              <Typography sx={EMPTY_TITLE_SX}>
                {t("pages.departments.members_panel.empty_invitations_title")}
              </Typography>
              <Typography sx={EMPTY_HINT_SX}>
                {t("pages.departments.members_panel.empty_invitations_hint")}
              </Typography>
            </Box>
          ) : (
            <Box sx={GRID}>{invitationCards}</Box>
          )
        )}
      </Box>

      {tab === "members" && !loading && !error && (
        <Pagination page={page} total={pageTotal} pageSize={PAGE_SIZE} onPageChange={setPage} />
      )}

      <AddEmployeeModal
        open={inviteOpen}
        onClose={closeInviteModal}
        onSave={handleInvite}
        defaultDepartmentId={departmentId}
      />
    </Box>
  );
});

DepartmentMembersSection.displayName = "DepartmentMembersSection";
export default DepartmentMembersSection;
