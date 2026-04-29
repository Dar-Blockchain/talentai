import React, { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import { Box, Typography, Avatar, Button, CircularProgress, Chip } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import ArrowBackOutlined from "@mui/icons-material/ArrowBackOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import BadgeOutlined from "@mui/icons-material/BadgeOutlined";
import UpdateOutlined from "@mui/icons-material/UpdateOutlined";
import CampaignOutlined from "@mui/icons-material/CampaignOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import PsychologyOutlined from "@mui/icons-material/PsychologyOutlined";
import WorkHistoryOutlined from "@mui/icons-material/WorkHistoryOutlined";
import TuneOutlined from "@mui/icons-material/TuneOutlined";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import CheckOutlined from "@mui/icons-material/CheckOutlined";
import { useTranslation } from "react-i18next";
import {
  Member,
  updateEmployeePermissions,
  selectUpdatingPermissions,
} from "@/store/slices/memberSlice";
import axiosInstance from "@/utils/axiosInstance";
import { ROLES } from "@/constants/employee";
import { getRoleLabel } from "@/utils/employeeRoleI18n";
import { EmployeePermission, DEFAULT_EMPLOYEE_PERMISSIONS } from "@/types/employeePermissions";
import PermissionsPanel from "../permissions/PermissionsPanel";

const PURPLE = "#8310FF";

/* ── helpers ─────────────────────────────────────────── */
const ROLE_STYLES: Record<string, { color: string; bg: string }> = {
  RH:         { color: "#16A34A", bg: "#F0FDF4" },
  TechLead:   { color: "#0891B2", bg: "#ECFEFF" },
  Supervisor: { color: "#D97706", bg: "#FFFBEB" },
  Manager:    { color: PURPLE,    bg: "#F5F3FF" },
  Owner:      { color: "#DC2626", bg: "#FEF2F2" },
};
const STATUS_STYLES: Record<string, { color: string; bg: string; dot: string; label: string }> = {
  active:   { color: "#16A34A", bg: "#DCFCE7", dot: "#22C55E", label: "Active"   },
  pending:  { color: "#D97706", bg: "#FEF9C3", dot: "#F59E0B", label: "Pending"  },
  inactive: { color: "#6B7280", bg: "#F3F4F6", dot: "#D1D5DB", label: "Inactive" },
};
const AVATAR_PALETTES = [
  { from: "#A78BFA", to: "#6D28D9" },
  { from: "#34D399", to: "#059669" },
  { from: "#38BDF8", to: "#0284C7" },
  { from: "#F87171", to: "#DC2626" },
  { from: "#FCD34D", to: "#B45309" },
];
function pickPalette(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_PALETTES[Math.abs(h) % AVATAR_PALETTES.length];
}
const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

/* ── Info stat card ───────────────────────────────────── */
const StatCard: React.FC<{
  icon: React.ReactNode; iconColor: string; label: string; value: React.ReactNode;
}> = ({ icon, iconColor, label, value }) => (
  <Box sx={{
    display: "flex", alignItems: "center", gap: 1.5,
    p: 1.75, borderRadius: "14px",
    bgcolor: "#fff", border: "1px solid #E8EAED",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  }}>
    <Box sx={{
      width: 38, height: 38, borderRadius: "10px", flexShrink: 0,
      bgcolor: `${iconColor}10`, border: `1px solid ${iconColor}18`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: iconColor,
    }}>
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: "0.7rem", color: "#94A3B8", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

/* ── Metric card (big number) ─────────────────────────── */
const MetricCard: React.FC<{
  icon: React.ReactNode; iconColor: string; label: string; value: number | string; sub?: string;
}> = ({ icon, iconColor, label, value, sub }) => (
  <Box sx={{
    p: 2.25, borderRadius: "16px",
    bgcolor: "#fff", border: "1px solid #E8EAED",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  }}>
    <Box sx={{
      width: 40, height: 40, borderRadius: "11px", mb: 1.75,
      bgcolor: `${iconColor}10`, border: `1px solid ${iconColor}18`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: iconColor,
    }}>
      {icon}
    </Box>
    <Typography sx={{ fontSize: "1.625rem", fontWeight: 800, color: "#0F172A", lineHeight: 1 }}>
      {value}
    </Typography>
    <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#374151", mt: 0.5 }}>
      {label}
    </Typography>
    {sub && (
      <Typography sx={{ fontSize: "0.7rem", color: "#94A3B8", mt: 0.25 }}>{sub}</Typography>
    )}
  </Box>
);

/* ── Tab pill ─────────────────────────────────────────── */
const Tab: React.FC<{
  active: boolean; label: string; icon: React.ReactNode; onClick: () => void;
}> = ({ active, label, icon, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      display: "flex", alignItems: "center", gap: 0.875,
      px: 2, py: 0.875, borderRadius: "10px", cursor: "pointer",
      bgcolor: active ? "#fff" : "transparent",
      boxShadow: active ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
      color: active ? PURPLE : "#6B7280",
      transition: "all 0.18s ease",
      "&:hover": !active ? { bgcolor: "#EAECF0" } : {},
    }}
  >
    <Box sx={{ display: "flex", "& svg": { fontSize: 16 } }}>{icon}</Box>
    <Typography sx={{ fontSize: "13px", fontWeight: 700, color: active ? "#111827" : "#6B7280", whiteSpace: "nowrap" }}>
      {label}
    </Typography>
  </Box>
);

/* ── Props ────────────────────────────────────────────── */
interface EmployeeDetailProps {
  member: Member;
  onBack: () => void;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
  canAssignRoles?: boolean;
  canRemove?: boolean;
  canManagePermissions?: boolean;
  isOwner?: boolean;
  isSelf?: boolean;
}

/* ── Component ────────────────────────────────────────── */
const EmployeeDetail: React.FC<EmployeeDetailProps> = ({ member, onBack, onEdit, onDelete, canAssignRoles = true, canRemove = true, canManagePermissions = true, isOwner = false, isSelf = false }) => {
  const dispatch = useDispatch<AppDispatch>();
  const updatingPerms = useSelector(selectUpdatingPermissions);
  const { t } = useTranslation("dashboard");

  const userId = member.userId;

  const [tab, setTab]               = useState<"overview" | "permissions">("overview");
  const [permissions, setPermissions] = useState<Partial<EmployeePermission>>(DEFAULT_EMPLOYEE_PERMISSIONS);
  const [fetchingPerms, setFetchingPerms] = useState(false);
  const [saved,   setSaved]   = useState(false);

  // Fetch viewed member's permissions directly — avoids overwriting the viewer's
  // own permissions in the shared Redux employeePermissions store.
  useEffect(() => {
    if (tab !== "permissions" || isSelf) return;
    setFetchingPerms(true);
    axiosInstance
      .get(`employee-permissions/${userId}`)
      .then((res) => {
        const data = res.data?.data ?? res.data;
        if (data) setPermissions(data);
      })
      .catch(() => {/* no permissions yet — keep defaults */})
      .finally(() => setFetchingPerms(false));
  }, [tab, userId, isSelf]);

  const name    = (member.firstName && member.lastName)
    ? `${member.firstName} ${member.lastName}`
    : member.firstName || member.lastName || member.username || "Unnamed";
  const email   = member.email   || "—";
  const letter  = name[0]?.toUpperCase() || "U";
  const palette = pickPalette(email || name);

  const roleStr    = member.role as string;
  const roleEntry  = ROLES.find((r) => r.value === roleStr || r.value === roleStr.toLowerCase());
  const roleColor  = roleEntry?.color ?? ROLE_STYLES[member.role]?.color ?? "#6B7280";
  const roleLabel  = getRoleLabel(roleStr, t);
  const status     = STATUS_STYLES[member.status] ?? STATUS_STYLES.pending;
  const dept       = (member as any).department?.name ?? (member as any).departmentName ?? null;

  const handleSavePermissions = useCallback(async () => {
    const result = await dispatch(updateEmployeePermissions({ memberId: userId, permissions }));
    if (updateEmployeePermissions.fulfilled.match(result)) {
      setSaved(true);
      // Sync local state from the returned payload so UI stays consistent
      const saved = (result as any).payload as Partial<EmployeePermission>;
      if (saved) setPermissions(saved);
      setTimeout(() => setSaved(false), 2500);
    }
  }, [dispatch, permissions, userId]);

  return (
    <Box>
      {/* ── Profile hero card ───────────────────────────── */}
      <Box sx={{
        bgcolor: "#fff",
        border: "1px solid #EDEEF0",
        borderRadius: "22px",
        overflow: "hidden",
        boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
        mb: 2.5,
        background: `linear-gradient(135deg, ${palette.from}07 0%, transparent 50%)`,
      }}>
        <Box sx={{ px: { xs: 2.5, sm: 3.5 }, pt: 2.5, pb: 3 }}>

          {/* ── Nav row: back + actions ── */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
            <Box
              onClick={onBack}
              sx={{
                display: "inline-flex", alignItems: "center", gap: 0.75,
                cursor: "pointer", color: "#94A3B8",
                transition: "color 0.15s",
                "&:hover": { color: "#475569" },
              }}
            >
              <ArrowBackOutlined sx={{ fontSize: 15 }} />
              <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "inherit" }}>
                Employees
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 0.875 }}>
              {canAssignRoles && (
                <Box
                  onClick={() => onEdit(member)}
                  sx={{
                    display: "flex", alignItems: "center", gap: 0.625,
                    px: 1.625, py: 0.75, borderRadius: "10px", cursor: "pointer",
                    border: "1px solid #E2E8F0", bgcolor: "#F8FAFC",
                    transition: "all 0.15s",
                    "&:hover": { bgcolor: `${PURPLE}08`, borderColor: `${PURPLE}30`, "& *": { color: PURPLE } },
                  }}
                >
                  <EditOutlined sx={{ fontSize: 14, color: "#64748B" }} />
                  <Typography sx={{ fontSize: "0.775rem", fontWeight: 600, color: "#475569" }}>Edit</Typography>
                </Box>
              )}
              {canRemove && (
                <Box
                  onClick={() => onDelete(member)}
                  sx={{
                    display: "flex", alignItems: "center", gap: 0.625,
                    px: 1.625, py: 0.75, borderRadius: "10px", cursor: "pointer",
                    border: "1px solid #FECACA", bgcolor: "#FEF7F7",
                    transition: "all 0.15s",
                    "&:hover": { bgcolor: "#FEE2E2", borderColor: "#FCA5A5" },
                  }}
                >
                  <DeleteOutlineOutlined sx={{ fontSize: 14, color: "#F87171" }} />
                  <Typography sx={{ fontSize: "0.775rem", fontWeight: 600, color: "#EF4444" }}>Remove</Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* ── Identity row ── */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, flexWrap: "wrap" }}>
            {/* Avatar */}
            <Box sx={{ position: "relative", flexShrink: 0 }}>
              <Avatar sx={{
                width: 72, height: 72,
                fontSize: "1.6rem", fontWeight: 800, color: "#fff",
                background: `linear-gradient(145deg, ${palette.from}, ${palette.to})`,
                boxShadow: `0 4px 18px ${palette.to}38`,
              }}>
                {letter}
              </Avatar>
              <Box sx={{
                position: "absolute", bottom: 2, right: 2,
                width: 14, height: 14, borderRadius: "50%",
                bgcolor: status.dot, border: "2.5px solid #fff",
              }} />
            </Box>

            {/* Name / email / meta */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: "1.125rem", color: "#0F172A", lineHeight: 1.25 }}>
                {name}
              </Typography>
              <Typography sx={{ fontSize: "0.8125rem", color: "#94A3B8", mt: 0.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {email}
              </Typography>

              {/* Pills */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 1.25, flexWrap: "wrap" }}>
                {/* Role */}
                <Box sx={{
                  display: "inline-flex", alignItems: "center", gap: 0.5,
                  px: 1.125, py: "3px", borderRadius: "999px",
                  bgcolor: `${roleColor}10`, border: `1px solid ${roleColor}22`,
                }}>
                  <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: roleColor }} />
                  <Typography sx={{ fontSize: "11px", fontWeight: 700, color: roleColor }}>{roleLabel}</Typography>
                </Box>

                {/* Status */}
                <Box sx={{
                  display: "inline-flex", alignItems: "center", gap: 0.5,
                  px: 1.125, py: "3px", borderRadius: "999px",
                  bgcolor: status.bg,
              }}>
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: status.dot }} />
                <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: status.color }}>{status.label}</Typography>
              </Box>

              {/* Dept */}
              {dept && (
                <Box sx={{
                  display: "inline-flex", alignItems: "center", gap: 0.5,
                  px: 1.25, py: "4px", borderRadius: "999px",
                  bgcolor: "#F1F5F9", border: "1px solid #E2E8F0",
                }}>
                  <BusinessOutlined sx={{ fontSize: 11, color: "#64748B" }} />
                  <Typography sx={{ fontSize: "11.5px", fontWeight: 600, color: "#475569" }}>{dept}</Typography>
                </Box>
              )}

              {/* Joined */}
              {member.createdAt && (
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                  <CalendarTodayOutlined sx={{ fontSize: 11, color: "#CBD5E1" }} />
                  <Typography sx={{ fontSize: "11.5px", color: "#94A3B8", fontWeight: 500 }}>
                    Joined {fmtDate(member.createdAt)}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
      </Box>

      {/* ── Tabs ────────────────────────────────────────── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 2.5, bgcolor: "#F3F4F6", borderRadius: "12px", p: 0.5, width: "fit-content" }}>
        <Tab active={tab === "overview"}    label="Overview"    icon={<PersonOutlined />} onClick={() => setTab("overview")} />
        {canManagePermissions && <Tab active={tab === "permissions"} label="Permissions" icon={<TuneOutlined />}   onClick={() => setTab("permissions")} />}
      </Box>

      {/* ── Tab panels ──────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {tab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {/* ── Activity metrics ── */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: 1.5, mb: 2 }}>
              <MetricCard
                icon={<CampaignOutlined sx={{ fontSize: 20 }} />}
                iconColor="#8310FF"
                label="Campaigns"
                value={(member as any).campaignsCount ?? (member as any).campaigns?.length ?? "—"}
                sub="participated in"
              />
              <MetricCard
                icon={<CheckCircleOutlined sx={{ fontSize: 20 }} />}
                iconColor="#16A34A"
                label="Interviews"
                value={(member as any).interviewsPassed ?? "—"}
                sub="passed"
              />
              <MetricCard
                icon={<PsychologyOutlined sx={{ fontSize: 20 }} />}
                iconColor="#0891B2"
                label="Skills"
                value={((member as any).skills as string[] | undefined)?.length ?? "—"}
                sub="listed"
              />
              <MetricCard
                icon={<WorkHistoryOutlined sx={{ fontSize: 20 }} />}
                iconColor="#D97706"
                label="Job Posts"
                value={(member as any).jobPostsCount ?? "—"}
                sub="created"
              />
            </Box>

            {/* ── Skills chips ── */}
            {Array.isArray((member as any).skills) && (member as any).skills.length > 0 && (
              <Box sx={{ bgcolor: "#fff", border: "1px solid #E8EAED", borderRadius: "16px", p: 2.25, mb: 2 }}>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", mb: 1.25 }}>
                  Skills
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                  {((member as any).skills as string[]).map((skill) => (
                    <Chip
                      key={skill}
                      label={skill}
                      size="small"
                      sx={{
                        fontSize: "12px", fontWeight: 600,
                        bgcolor: `${PURPLE}0C`, color: PURPLE,
                        border: `1px solid ${PURPLE}20`,
                        borderRadius: "8px",
                        height: 26,
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* ── Member info ── */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, gap: 1.5 }}>
              <StatCard icon={<EmailOutlined sx={{ fontSize: 18 }} />}          iconColor="#0891B2" label="Email"        value={email} />
              <StatCard icon={<BadgeOutlined sx={{ fontSize: 18 }} />}           iconColor={roleColor} label="Role"      value={roleLabel} />
              <StatCard icon={<BusinessOutlined sx={{ fontSize: 18 }} />}       iconColor="#8B5CF6" label="Department"   value={dept ?? "No department"} />
              <StatCard icon={<CalendarTodayOutlined sx={{ fontSize: 18 }} />}  iconColor="#16A34A" label="Joined"       value={fmtDate(member.createdAt)} />
              <StatCard icon={<UpdateOutlined sx={{ fontSize: 18 }} />}         iconColor="#D97706" label="Last Updated" value={fmtDate(member.updatedAt)} />
            </Box>
          </motion.div>
        )}

        {tab === "permissions" && isSelf && (
          <motion.div key="permissions-self" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Box sx={{ py: 6, textAlign: "center" }}>
              <TuneOutlined sx={{ fontSize: 40, color: "#E2E8F0", mb: 1.5 }} />
              <Typography sx={{ fontWeight: 700, fontSize: "0.9375rem", color: "#0F172A", mb: 0.5 }}>
                You cannot manage your own permissions
              </Typography>
              <Typography sx={{ fontSize: "0.8rem", color: "#94A3B8" }}>
                Ask the company owner to update your permissions.
              </Typography>
            </Box>
          </motion.div>
        )}

        {tab === "permissions" && !isSelf && (
          <motion.div
            key="permissions"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {/* Intro */}
            <Box sx={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              mb: 2, flexWrap: "wrap", gap: 1.5,
            }}>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: "0.9375rem", color: "#0F172A" }}>
                  Member Permissions
                </Typography>
                <Typography sx={{ fontSize: "0.775rem", color: "#94A3B8", mt: 0.25 }}>
                  Control what <strong style={{ color: "#475569" }}>{name}</strong> can access and modify in the workspace.
                </Typography>
              </Box>

              <Button
                onClick={handleSavePermissions}
                disabled={updatingPerms || fetchingPerms}
                variant="contained"
                startIcon={
                  updatingPerms ? <CircularProgress size={14} sx={{ color: "#fff" }} />
                  : saved        ? <CheckOutlined sx={{ fontSize: 16 }} />
                  : undefined
                }
                sx={{
                  textTransform: "none", fontWeight: 700, borderRadius: "12px",
                  px: 3, py: 1, fontSize: "0.8125rem",
                  bgcolor: saved ? "#16A34A" : PURPLE,
                  color: "#fff",
                  boxShadow: `0 4px 14px ${saved ? "rgba(22,163,74,0.35)" : "rgba(131,16,255,0.3)"}`,
                  "&:hover": { bgcolor: saved ? "#15803D" : "#7209E6" },
                  "&.Mui-disabled": { bgcolor: "#E5E7EB", color: "#9CA3AF", boxShadow: "none" },
                  transition: "all 0.2s",
                  minWidth: 140,
                }}
              >
                {updatingPerms ? "Saving…" : saved ? "Saved!" : "Save Permissions"}
              </Button>
            </Box>

            {fetchingPerms ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress size={32} sx={{ color: PURPLE }} />
              </Box>
            ) : (
              <PermissionsPanel
                value={permissions}
                onChange={setPermissions}
                disabled={updatingPerms}
                isOwner={isOwner}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default EmployeeDetail;
