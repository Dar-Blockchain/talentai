import React, { useCallback, useRef, useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Chip,
  Divider,
  IconButton,
  Autocomplete,
  Alert,
} from "@mui/material";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import ContactMailOutlined from "@mui/icons-material/ContactMailOutlined";
import PeopleOutlined from "@mui/icons-material/PeopleOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import SaveOutlined from "@mui/icons-material/SaveOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import LanguageIcon from "@mui/icons-material/Language";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import MoreVertOutlined from "@mui/icons-material/MoreVertOutlined";
import PersonAddOutlined from "@mui/icons-material/PersonAddOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import { useCompanyProfileManagement } from "@/hooks/useCompanyProfileManagement";
import { getAllCountryNames } from "@/utils/countryMappings";
import AddMemberModal from "@/components/dashboard-company/AddMemberModal";
import EditRoleModal from "@/components/dashboard-company/EditRoleModal";
import DeleteMemberDialog from "@/components/profile/team-members/DeleteMemberDialog";
import PendingInvitationsList from "@/components/dashboard-company/PendingInvitationsList";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  addEmployee, updateMemberRole, deleteMember,
  fetchMembers, fetchInvitations, resendInvitation, cancelInvitation,
  selectMembers, clearAddMemberSuccess, clearUpdateRoleSuccess, clearDeleteMemberSuccess,
  Member, MemberRole,
} from "@/store/slices/memberSlice";
import { useToast } from "@/hooks/useToast";

import {
  SectionCard,
  SectionHeader,
  PageBanner,
  StatusBadge,
  EmptyState,
  LoadingOverlay,
  InfoBanner,
} from "./ui";

// ─── Design tokens ─────────────────────────────────────────────────────────────
const TEAL        = "#0D9488";
const TEAL_BG     = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    "&.Mui-focused fieldset": { borderColor: TEAL },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: TEAL },
};

const ROLE_LABELS: Record<string, string> = {
  RH: "HR", TechLead: "Tech Lead", Supervisor: "Supervisor",
  Manager: "Manager", Owner: "Owner", hr: "HR", technical_leader: "Tech Lead",
};
const ROLE_COLORS: Record<string, string> = {
  Owner: "#7C3AED", Manager: "#0D9488", TechLead: "#2563EB",
  Supervisor: "#D97706", RH: "#DC2626", hr: "#DC2626", technical_leader: "#2563EB",
};

const NAV_ITEMS = [
  { id: "company", label: "Company Info",    icon: BusinessOutlined,     desc: "Logo & basic details" },
  { id: "contact", label: "Contact & Links", icon: ContactMailOutlined,  desc: "Location, social, web" },
  { id: "team",    label: "Team Members",    icon: PeopleOutlined,       desc: "Manage your team" },
];

// ─── Edit/Cancel/Save buttons ─────────────────────────────────────────────────
const EditActions: React.FC<{
  isEditing: boolean;
  loading: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}> = ({ isEditing, loading, onEdit, onCancel, onSave }) =>
  !isEditing ? (
    <Button
      size="small" startIcon={<EditOutlined sx={{ fontSize: 14 }} />}
      onClick={onEdit}
      sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600, fontSize: "12px", color: TEAL, border: `1px solid ${TEAL_BORDER}`, "&:hover": { bgcolor: TEAL_BG } }}
    >
      Edit
    </Button>
  ) : (
    <Box sx={{ display: "flex", gap: 1 }}>
      <Button
        size="small" startIcon={<CloseOutlined sx={{ fontSize: 14 }} />}
        onClick={onCancel}
        sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600, fontSize: "12px", color: "#6B7280", border: "1px solid #E5E7EB" }}
      >
        Cancel
      </Button>
      <Button
        size="small" variant="contained"
        startIcon={loading ? undefined : <SaveOutlined sx={{ fontSize: 14 }} />}
        onClick={onSave} disabled={loading}
        sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600, fontSize: "12px", bgcolor: TEAL, "&:hover": { bgcolor: "#0F766E" } }}
      >
        {loading ? <CircularProgress size={14} color="inherit" /> : "Save"}
      </Button>
    </Box>
  );

// ─── Company Info Tab ─────────────────────────────────────────────────────────
const CompanyInfoTab: React.FC<{ hook: ReturnType<typeof useCompanyProfileManagement> }> = ({ hook }) => {
  const {
    profile, isEditing, loading, saveSuccess, error, uploadingImage,
    fieldErrors, handleInputChange, handleImageUpload, handleSaveProfile, setIsEditing,
  } = hook;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const dt = new DataTransfer();
    dt.items.add(file);
    handleImageUpload({ target: { files: dt.files } } as unknown as React.ChangeEvent<HTMLInputElement>);
  }, [handleImageUpload]);

  const displayName = profile.name || profile.companyName || "Company Name";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {saveSuccess && (
        <Alert severity="success" icon={<CheckCircleOutlined />} sx={{ borderRadius: 2 }}>
          Company info saved successfully!
        </Alert>
      )}
      {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

      {/* Logo */}
      <SectionCard>
        <SectionHeader title="Company Logo" subtitle="Drag & drop or click to upload. Max 5 MB." compact />
        <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
          <Box
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              width: 100, height: 100, borderRadius: 3,
              border: `2px dashed ${dragOver ? TEAL : TEAL_BORDER}`,
              bgcolor: dragOver ? TEAL_BG : "#FAFAFA",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "all 0.2s", overflow: "hidden",
              "&:hover": { bgcolor: TEAL_BG, borderColor: TEAL },
            }}
          >
            {uploadingImage ? (
              <CircularProgress size={24} sx={{ color: TEAL }} />
            ) : profile.avatar ? (
              <Avatar src={profile.avatar} sx={{ width: "100%", height: "100%", borderRadius: 2 }} />
            ) : (
              <>
                <CloudUploadOutlined sx={{ fontSize: 26, color: TEAL, mb: 0.5 }} />
                <Typography sx={{ fontSize: "10px", color: "#6B7280", textAlign: "center", px: 1 }}>Drop or click</Typography>
              </>
            )}
          </Box>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />

          <Box>
            <Avatar src={profile.avatar} sx={{ width: 56, height: 56, bgcolor: TEAL, fontSize: "22px", fontWeight: 700, mb: 1 }}>
              {initials}
            </Avatar>
            <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>{displayName}</Typography>
            <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>{profile.email}</Typography>
          </Box>
        </Box>
      </SectionCard>

      {/* Details */}
      <SectionCard>
        <SectionHeader
          title="Company Details"
          subtitle="Manage your company name and profile settings"
          action={
            <EditActions
              isEditing={isEditing} loading={loading}
              onEdit={() => setIsEditing(true)} onCancel={() => setIsEditing(false)} onSave={handleSaveProfile}
            />
          }
        />
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
          <TextField
            label="Company Name"
            value={profile.name || profile.companyName || ""}
            onChange={(e) => { handleInputChange("name", e.target.value); handleInputChange("companyName", e.target.value); }}
            disabled={!isEditing} fullWidth required
            error={!!fieldErrors.name || !!fieldErrors.companyName}
            helperText={fieldErrors.name || fieldErrors.companyName || ""}
            sx={{ gridColumn: "1 / -1", ...fieldSx }}
          />
          <TextField
            label="Company Email" value={profile.email} disabled fullWidth
            helperText="Email cannot be changed"
            sx={{ gridColumn: "1 / -1", ...fieldSx }}
          />
          <TextField
            select label="Required Experience Level"
            value={profile.requiredExperienceLevel || "Mid Level"}
            onChange={(e) => handleInputChange("requiredExperienceLevel", e.target.value)}
            disabled={!isEditing} fullWidth sx={{ gridColumn: "1 / -1", ...fieldSx }}
          >
            {["Entry Level", "Mid Level", "Senior Level", "Lead", "Executive"].map((l) => (
              <MenuItem key={l} value={l}>{l}</MenuItem>
            ))}
          </TextField>
        </Box>
      </SectionCard>
    </Box>
  );
};

// ─── Contact Tab ──────────────────────────────────────────────────────────────
const ContactTab: React.FC<{ hook: ReturnType<typeof useCompanyProfileManagement> }> = ({ hook }) => {
  const { profile, isEditing, loading, fieldErrors, handleInputChange, handleSaveProfile, setIsEditing } = hook;
  const countries = useMemo(() => getAllCountryNames(), []);

  return (
    <SectionCard>
      <SectionHeader
        title="Contact & Presence"
        subtitle="Location, social links, and company details"
        action={
          <EditActions
            isEditing={isEditing} loading={loading}
            onEdit={() => setIsEditing(true)} onCancel={() => setIsEditing(false)} onSave={handleSaveProfile}
          />
        }
      />
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, gridColumn: "1 / -1" }}>
          <LocationOnOutlined sx={{ fontSize: 20, color: TEAL, mt: 2 }} />
          <Autocomplete
            options={countries} value={profile.location || null}
            onChange={(_, v) => handleInputChange("location", v || "")}
            disabled={!isEditing} fullWidth
            renderInput={(params) => (
              <TextField {...params} label="Country / Location" placeholder="Select country" sx={fieldSx} />
            )}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
          <WorkOutlined sx={{ fontSize: 20, color: TEAL, mt: 2 }} />
          <TextField
            select label="Employment Type" value={profile.employmentType || "Remote"}
            onChange={(e) => handleInputChange("employmentType", e.target.value)}
            disabled={!isEditing} fullWidth sx={fieldSx}
            error={!!fieldErrors.employmentType} helperText={fieldErrors.employmentType || ""}
          >
            {["Remote", "On-site", "Hybrid"].map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
          </TextField>
        </Box>

        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
          <GroupsOutlined sx={{ fontSize: 20, color: TEAL, mt: 2 }} />
          <TextField
            select label="Company Size" value={profile.size || ""}
            onChange={(e) => handleInputChange("size", e.target.value)}
            disabled={!isEditing} fullWidth sx={fieldSx}
            error={!!fieldErrors.size} helperText={fieldErrors.size || ""}
          >
            {["1-10", "11-50", "51-200", "201-500", "500+"].map((s) => (
              <MenuItem key={s} value={s}>{s} employees</MenuItem>
            ))}
          </TextField>
        </Box>

        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, gridColumn: "1 / -1" }}>
          <WorkOutlined sx={{ fontSize: 20, color: TEAL, mt: 2 }} />
          <TextField
            label="Industry" value={profile.industry || ""}
            onChange={(e) => handleInputChange("industry", e.target.value)}
            disabled={!isEditing} fullWidth placeholder="e.g. Technology, Finance…"
            sx={fieldSx} error={!!fieldErrors.industry} helperText={fieldErrors.industry || ""}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, gridColumn: "1 / -1" }}>
          <LinkedInIcon sx={{ fontSize: 20, color: "#0A66C2", mt: 2 }} />
          <TextField
            label="LinkedIn URL" value={profile.linkedin || ""}
            onChange={(e) => handleInputChange("linkedin", e.target.value)}
            disabled={!isEditing} fullWidth type="url"
            placeholder="https://linkedin.com/company/yourcompany"
            sx={fieldSx} error={!!fieldErrors.linkedin} helperText={fieldErrors.linkedin || ""}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, gridColumn: "1 / -1" }}>
          <LanguageIcon sx={{ fontSize: 20, color: TEAL, mt: 2 }} />
          <TextField
            label="Company Website" value={profile.website || ""}
            onChange={(e) => handleInputChange("website", e.target.value)}
            disabled={!isEditing} fullWidth type="url"
            placeholder="https://yourcompany.com"
            sx={fieldSx} error={!!fieldErrors.website} helperText={fieldErrors.website || ""}
          />
        </Box>
      </Box>
    </SectionCard>
  );
};

// ─── Team Members Tab ─────────────────────────────────────────────────────────
const TeamTab: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { members, loading, error, invitations, fetchingInvitations,
    addMemberSuccess, updateRoleSuccess, deleteMemberSuccess } = useSelector(selectMembers);
  const { showToast } = useToast();

  const [addOpen,    setAddOpen]    = useState(false);
  const [editOpen,   setEditOpen]   = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected,   setSelected]   = useState<Member | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchMembers());
    dispatch(fetchInvitations());
  }, [dispatch]);

  useEffect(() => {
    if (addMemberSuccess) {
      setAddOpen(false);
      dispatch(clearAddMemberSuccess());
      showToast({ message: "Team member invited!", severity: "success" });
      dispatch(fetchInvitations());
      dispatch(fetchMembers());
    }
  }, [addMemberSuccess, dispatch, showToast]);

  useEffect(() => {
    if (updateRoleSuccess) {
      setEditOpen(false); setSelected(null);
      dispatch(clearUpdateRoleSuccess());
      showToast({ message: "Role updated!", severity: "success" });
      dispatch(fetchMembers());
    }
  }, [updateRoleSuccess, dispatch, showToast]);

  useEffect(() => {
    if (deleteMemberSuccess) {
      setDeleteOpen(false); setSelected(null);
      dispatch(clearDeleteMemberSuccess());
      showToast({ message: "Member removed!", severity: "success" });
      dispatch(fetchMembers());
    }
  }, [deleteMemberSuccess, dispatch, showToast]);

  const roleMapping: Record<string, MemberRole> = {
    hr: "RH", technical_leader: "TechLead", supervisor: "Supervisor", manager: "Manager",
  };

  const handleAdd = useCallback(async (email: string, role: string) => {
    const result = await dispatch(addEmployee({ email, role: roleMapping[role] || "RH" }));
    if (addEmployee.rejected.match(result)) throw new Error(result.payload as string || "Failed");
  }, [dispatch]);

  const handleUpdateRole = useCallback(async (role: string) => {
    if (!selected) throw new Error("No member selected");
    await dispatch(updateMemberRole({ membershipId: selected._id, role: role as MemberRole })).unwrap();
  }, [dispatch, selected]);

  const handleConfirmDelete = useCallback(async () => {
    if (!selected) return;
    try { await dispatch(deleteMember({ membershipId: selected._id })).unwrap(); } catch { /* handled */ }
  }, [dispatch, selected]);

  const handleResend = useCallback(async (id: string) => {
    try { await dispatch(resendInvitation(id)).unwrap(); showToast({ message: "Invitation resent!", severity: "success" }); }
    catch { showToast({ message: "Failed to resend", severity: "error" }); }
  }, [dispatch, showToast]);

  const handleCancelInv = useCallback(async (id: string) => {
    try { await dispatch(cancelInvitation(id)).unwrap(); showToast({ message: "Invitation cancelled", severity: "success" }); }
    catch { showToast({ message: "Failed to cancel", severity: "error" }); }
  }, [dispatch, showToast]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <SectionCard>
        <SectionHeader
          title="Team Members"
          subtitle={`${members.length} member${members.length !== 1 ? "s" : ""} in your organisation`}
          action={
            <Button
              size="small" variant="contained"
              startIcon={<PersonAddOutlined sx={{ fontSize: 15 }} />}
              onClick={() => setAddOpen(true)}
              sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600, fontSize: "12px", bgcolor: TEAL, "&:hover": { bgcolor: "#0F766E" } }}
            >
              Invite Member
            </Button>
          }
        />

        {loading ? (
          <LoadingOverlay height={200} message="Loading team members…" color={TEAL} />
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
        ) : members.length === 0 ? (
          <EmptyState
            icon={<PeopleOutlined />}
            title="No team members yet"
            description="Invite your first member to get started"
            minHeight={160}
          />
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {members.map((m) => {
              const roleColor = ROLE_COLORS[m.role] || TEAL;
              const initials  = m.user?.username
                ? m.user.username.slice(0, 2).toUpperCase()
                : (m.user?.email?.charAt(0) ?? "?").toUpperCase();
              return (
                <Box
                  key={m._id}
                  sx={{
                    display: "flex", alignItems: "center", gap: 2, p: 1.75,
                    bgcolor: "#FAFAFA", borderRadius: 2.5, border: "1px solid #F3F4F6",
                    position: "relative",
                    "&:hover": { borderColor: TEAL_BORDER, bgcolor: TEAL_BG },
                    transition: "all 0.15s",
                  }}
                >
                  {/* Role accent line */}
                  <Box sx={{ width: 3, alignSelf: "stretch", borderRadius: 4, bgcolor: roleColor, flexShrink: 0 }} />

                  <Avatar sx={{ width: 38, height: 38, bgcolor: roleColor, fontSize: "13px", fontWeight: 700 }}>
                    {initials}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>
                      {m.user?.username ?? "Unknown"}
                    </Typography>
                    <Typography sx={{ fontSize: "11px", color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {m.user?.email ?? ""}
                    </Typography>
                  </Box>
                  <Chip
                    label={ROLE_LABELS[m.role] || m.role}
                    size="small"
                    sx={{ fontSize: "10px", fontWeight: 700, height: 20, bgcolor: `${roleColor}15`, color: roleColor, border: `1px solid ${roleColor}30` }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => { setSelected(m); setMenuOpenId(menuOpenId === m._id ? null : m._id); }}
                    sx={{ color: "#9CA3AF", "&:hover": { color: TEAL } }}
                  >
                    <MoreVertOutlined sx={{ fontSize: 17 }} />
                  </IconButton>
                  {menuOpenId === m._id && (
                    <Box sx={{
                      position: "absolute", right: 40, top: "50%", transform: "translateY(-50%)",
                      zIndex: 20, bgcolor: "#fff", border: "1px solid #E5E7EB",
                      borderRadius: 2, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", overflow: "hidden", minWidth: 120,
                    }}>
                      <Box
                        onClick={() => { setEditOpen(true); setMenuOpenId(null); }}
                        sx={{ px: 2, py: 1.25, fontSize: "12px", cursor: "pointer", "&:hover": { bgcolor: TEAL_BG }, color: "#374151" }}
                      >
                        Edit Role
                      </Box>
                      <Divider />
                      <Box
                        onClick={() => { setDeleteOpen(true); setMenuOpenId(null); }}
                        sx={{ px: 2, py: 1.25, fontSize: "12px", cursor: "pointer", "&:hover": { bgcolor: "#FEF2F2" }, color: "#EF4444" }}
                      >
                        Remove
                      </Box>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </SectionCard>

      {invitations.length > 0 && (
        <SectionCard>
          <SectionHeader title="Pending Invitations" subtitle="Waiting for acceptance" compact />
          <PendingInvitationsList
            invitations={invitations} loading={fetchingInvitations} error={null}
            onResend={handleResend} onCancel={handleCancelInv}
          />
        </SectionCard>
      )}

      <AddMemberModal open={addOpen} onClose={() => setAddOpen(false)} onSave={handleAdd} />
      {selected && (
        <EditRoleModal
          open={editOpen}
          onClose={() => { setEditOpen(false); setSelected(null); }}
          onSave={handleUpdateRole}
          currentRole={selected.role}
          memberName={selected.user?.username || selected.user?.email || "Member"}
        />
      )}
      <DeleteMemberDialog
        open={deleteOpen}
        memberName={selected?.user?.username || selected?.user?.email || "this member"}
        onCancel={() => { setDeleteOpen(false); setSelected(null); }}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
};

// ─── Main CompanySettings ─────────────────────────────────────────────────────
const CompanySettings: React.FC = () => {
  const [activeSection, setActiveSection] = useState("company");
  const hook = useCompanyProfileManagement();

  const displayName = hook.profile.name || hook.profile.companyName || "Company";
  const initials    = displayName.charAt(0).toUpperCase();
  const activeNav   = NAV_ITEMS.find((n) => n.id === activeSection);

  return (
    <Box>
      {/* Banner */}
      <PageBanner
        title="Settings"
        subtitle="Manage your company profile, contact details, and team."
        icon={<SettingsOutlined />}
        gradient="135deg, #0D9488 0%, #0891B2 100%"
        stats={[]}
      />

      <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start", flexDirection: { xs: "column", md: "row" } }}>

        {/* ── LEFT SIDEBAR ───────────────────────────────────────────────────── */}
        <Box sx={{ width: { xs: "100%", md: 240 }, flexShrink: 0, position: { md: "sticky" }, top: 24, display: "flex", flexDirection: "column", gap: 2 }}>

          {/* Company profile card */}
          <SectionCard>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", py: 1 }}>
              <Avatar
                src={hook.profile.avatar}
                sx={{ width: 64, height: 64, bgcolor: TEAL, fontSize: "24px", fontWeight: 700, mb: 1.5, boxShadow: `0 0 0 3px ${TEAL_BORDER}` }}
              >
                {initials}
              </Avatar>
              <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{displayName}</Typography>
              <Typography sx={{ fontSize: "11px", color: "#6B7280", mb: 1.5 }}>{hook.profile.email}</Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "center" }}>
                {hook.profile.location && (
                  <Chip
                    icon={<LocationOnOutlined sx={{ fontSize: 12 }} />}
                    label={hook.profile.location}
                    size="small"
                    sx={{ fontSize: "10px", height: 20, bgcolor: TEAL_BG, color: TEAL, border: `1px solid ${TEAL_BORDER}` }}
                  />
                )}
                {hook.profile.size && (
                  <Chip
                    icon={<GroupsOutlined sx={{ fontSize: 12 }} />}
                    label={hook.profile.size}
                    size="small"
                    sx={{ fontSize: "10px", height: 20, bgcolor: "#F3F4F6", color: "#6B7280" }}
                  />
                )}
              </Box>
            </Box>
          </SectionCard>

          {/* Navigation */}
          <SectionCard>
            <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", mb: 1.5 }}>
              Navigation
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {NAV_ITEMS.map(({ id, label, icon: Icon, desc }) => {
                const active = activeSection === id;
                return (
                  <Box
                    key={id}
                    onClick={() => setActiveSection(id)}
                    sx={{
                      display: "flex", alignItems: "center", gap: 1.5,
                      px: 1.5, py: 1.25, borderRadius: 2, cursor: "pointer",
                      bgcolor: active ? TEAL_BG : "transparent",
                      border: `1px solid ${active ? TEAL_BORDER : "transparent"}`,
                      color: active ? TEAL : "#6B7280",
                      transition: "all 0.15s",
                      "&:hover": { bgcolor: TEAL_BG, color: TEAL, border: `1px solid ${TEAL_BORDER}` },
                    }}
                  >
                    <Box
                      sx={{
                        width: 32, height: 32, borderRadius: 1.5, flexShrink: 0,
                        bgcolor: active ? `${TEAL}20` : "#F3F4F6",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <Icon sx={{ fontSize: 17, color: active ? TEAL : "#9CA3AF" }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: "12px", fontWeight: active ? 700 : 500, lineHeight: 1.2 }}>{label}</Typography>
                      <Typography sx={{ fontSize: "10px", color: "#9CA3AF", lineHeight: 1.2 }}>{desc}</Typography>
                    </Box>
                    {active && (
                      <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: TEAL, ml: "auto", flexShrink: 0 }} />
                    )}
                  </Box>
                );
              })}
            </Box>
          </SectionCard>

          {/* Hint */}
          <InfoBanner type="info" message="Changes are saved per section. Click Edit to modify a section." />
        </Box>

        {/* ── CONTENT ──────────────────────────────────────────────────────── */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Section title breadcrumb */}
          {activeNav && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: TEAL_BG, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${TEAL_BORDER}` }}>
                <activeNav.icon sx={{ fontSize: 17, color: TEAL }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>{activeNav.label}</Typography>
                <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>{activeNav.desc}</Typography>
              </Box>
            </Box>
          )}

          {activeSection === "company" && <CompanyInfoTab hook={hook} />}
          {activeSection === "contact" && <ContactTab hook={hook} />}
          {activeSection === "team"    && <TeamTab />}
        </Box>
      </Box>
    </Box>
  );
};

export default CompanySettings;
