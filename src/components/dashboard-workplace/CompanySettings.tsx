import React, { useCallback, useRef, useState } from "react";
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
import { useCompanyProfileManagement } from "@/hooks/useCompanyProfileManagement";
import { getAllCountryNames } from "@/utils/countryMappings";
import AddMemberModal from "@/components/dashboard-company/AddMemberModal";
import EditRoleModal from "@/components/dashboard-company/EditRoleModal";
import DeleteMemberDialog from "@/components/profile/team-members/DeleteMemberDialog";
import PendingInvitationsList from "@/components/dashboard-company/PendingInvitationsList";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  addEmployee,
  updateMemberRole,
  deleteMember,
  fetchMembers,
  fetchInvitations,
  resendInvitation,
  cancelInvitation,
  selectMembers,
  clearAddMemberSuccess,
  clearUpdateRoleSuccess,
  clearDeleteMemberSuccess,
  Member,
  MemberRole,
} from "@/store/slices/memberSlice";
import { useToast } from "@/hooks/useToast";
import { useEffect, useMemo } from "react";

// ─── Accent & style tokens ────────────────────────────────────────────────────
const TEAL = "#0D9488";
const TEAL_BG = "#F0FDFA";
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

// ─── Sidebar nav items ────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "company",  label: "Company Info",   icon: BusinessOutlined },
  { id: "contact",  label: "Contact & Links", icon: ContactMailOutlined },
  { id: "team",     label: "Team Members",    icon: PeopleOutlined },
];

// ─── Section wrapper ──────────────────────────────────────────────────────────
const Section: React.FC<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}> = ({ title, subtitle, children, action }) => (
  <Box sx={{ mb: 4 }}>
    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
      <Box>
        <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>{title}</Typography>
        {subtitle && <Typography sx={{ fontSize: "12px", color: "#6B7280", mt: 0.25 }}>{subtitle}</Typography>}
      </Box>
      {action}
    </Box>
    {children}
  </Box>
);

// ─── Company Info Tab ─────────────────────────────────────────────────────────
const CompanyInfoTab: React.FC<{ hook: ReturnType<typeof useCompanyProfileManagement> }> = ({ hook }) => {
  const {
    profile, isEditing, loading, saveSuccess, error, uploadingImage,
    fieldErrors, handleInputChange, handleImageUpload,
    handleSaveProfile, setIsEditing,
  } = hook;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    // Simulate a change event
    const dt = new DataTransfer();
    dt.items.add(file);
    const syntheticEvent = {
      target: { files: dt.files },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleImageUpload(syntheticEvent);
  }, [handleImageUpload]);

  const displayName = profile.name || profile.companyName || "Company Name";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <Box>
      {saveSuccess && (
        <Alert severity="success" icon={<CheckCircleOutlined />} sx={{ mb: 3, borderRadius: 2 }}>
          Company info saved successfully!
        </Alert>
      )}
      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {/* Logo Upload */}
      <Section title="Company Logo" subtitle="Drag & drop or click to upload. Max 5 MB.">
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          {/* Drop zone */}
          <Box
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              width: 110, height: 110, borderRadius: 3, border: `2px dashed ${dragOver ? TEAL : TEAL_BORDER}`,
              bgcolor: dragOver ? TEAL_BG : "#FAFAFA",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "all 0.2s", position: "relative", overflow: "hidden",
              "&:hover": { bgcolor: TEAL_BG, borderColor: TEAL },
            }}
          >
            {uploadingImage ? (
              <CircularProgress size={28} sx={{ color: TEAL }} />
            ) : profile.avatar ? (
              <Avatar src={profile.avatar} sx={{ width: "100%", height: "100%", borderRadius: 2 }} />
            ) : (
              <>
                <CloudUploadOutlined sx={{ fontSize: 28, color: TEAL, mb: 0.5 }} />
                <Typography sx={{ fontSize: "10px", color: "#6B7280", textAlign: "center", px: 1 }}>
                  Drop or click
                </Typography>
              </>
            )}
          </Box>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageUpload}
          />

          {/* Avatar preview + info */}
          <Box>
            <Avatar
              src={profile.avatar}
              sx={{ width: 64, height: 64, bgcolor: TEAL, fontSize: "26px", fontWeight: 700, mb: 1 }}
            >
              {initials}
            </Avatar>
            <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>{displayName}</Typography>
            <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>{profile.email}</Typography>
          </Box>
        </Box>
      </Section>

      <Divider sx={{ mb: 4 }} />

      {/* Details */}
      <Section
        title="Company Details"
        subtitle="Manage your company name and profile settings"
        action={
          !isEditing ? (
            <Button
              size="small" startIcon={<EditOutlined sx={{ fontSize: 15 }} />}
              onClick={() => setIsEditing(true)}
              sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600, color: TEAL, border: `1px solid ${TEAL_BORDER}`, "&:hover": { bgcolor: TEAL_BG } }}
            >
              Edit
            </Button>
          ) : (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                size="small" startIcon={<CloseOutlined sx={{ fontSize: 15 }} />}
                onClick={() => setIsEditing(false)}
                sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600, color: "#6B7280", border: "1px solid #E5E7EB" }}
              >
                Cancel
              </Button>
              <Button
                size="small" variant="contained" startIcon={loading ? undefined : <SaveOutlined sx={{ fontSize: 15 }} />}
                onClick={handleSaveProfile} disabled={loading}
                sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600, bgcolor: TEAL, "&:hover": { bgcolor: "#0F766E" } }}
              >
                {loading ? <CircularProgress size={16} color="inherit" /> : "Save"}
              </Button>
            </Box>
          )
        }
      >
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
          <TextField
            label="Company Name" value={profile.name || profile.companyName || ""}
            onChange={(e) => { handleInputChange("name", e.target.value); handleInputChange("companyName", e.target.value); }}
            disabled={!isEditing} fullWidth required
            error={!!fieldErrors.name || !!fieldErrors.companyName}
            helperText={fieldErrors.name || fieldErrors.companyName || ""}
            sx={{ gridColumn: "1 / -1", ...fieldSx }}
          />
          <TextField
            label="Company Email" value={profile.email} disabled fullWidth
            helperText="Email cannot be changed" sx={{ gridColumn: "1 / -1", ...fieldSx }}
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
      </Section>
    </Box>
  );
};

// ─── Contact Tab ──────────────────────────────────────────────────────────────
const ContactTab: React.FC<{ hook: ReturnType<typeof useCompanyProfileManagement> }> = ({ hook }) => {
  const {
    profile, isEditing, loading, fieldErrors,
    handleInputChange, handleSaveProfile, setIsEditing,
  } = hook;
  const countries = useMemo(() => getAllCountryNames(), []);

  return (
    <Box>
      <Section
        title="Contact & Presence"
        subtitle="Location, social links, and company details"
        action={
          !isEditing ? (
            <Button
              size="small" startIcon={<EditOutlined sx={{ fontSize: 15 }} />}
              onClick={() => setIsEditing(true)}
              sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600, color: TEAL, border: `1px solid ${TEAL_BORDER}`, "&:hover": { bgcolor: TEAL_BG } }}
            >
              Edit
            </Button>
          ) : (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                size="small" startIcon={<CloseOutlined sx={{ fontSize: 15 }} />}
                onClick={() => setIsEditing(false)}
                sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600, color: "#6B7280", border: "1px solid #E5E7EB" }}
              >
                Cancel
              </Button>
              <Button
                size="small" variant="contained" startIcon={loading ? undefined : <SaveOutlined sx={{ fontSize: 15 }} />}
                onClick={handleSaveProfile} disabled={loading}
                sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600, bgcolor: TEAL, "&:hover": { bgcolor: "#0F766E" } }}
              >
                {loading ? <CircularProgress size={16} color="inherit" /> : "Save"}
              </Button>
            </Box>
          )
        }
      >
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
          {/* Location */}
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

          {/* Employment type */}
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
            <WorkOutlined sx={{ fontSize: 20, color: TEAL, mt: 2 }} />
            <TextField
              select label="Employment Type" value={profile.employmentType || "Remote"}
              onChange={(e) => handleInputChange("employmentType", e.target.value)}
              disabled={!isEditing} fullWidth sx={fieldSx}
              error={!!fieldErrors.employmentType} helperText={fieldErrors.employmentType || ""}
            >
              <MenuItem value="Remote">Remote</MenuItem>
              <MenuItem value="On-site">On-site</MenuItem>
              <MenuItem value="Hybrid">Hybrid</MenuItem>
            </TextField>
          </Box>

          {/* Company size */}
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

          {/* Industry */}
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, gridColumn: "1 / -1" }}>
            <WorkOutlined sx={{ fontSize: 20, color: TEAL, mt: 2 }} />
            <TextField
              label="Industry" value={profile.industry || ""}
              onChange={(e) => handleInputChange("industry", e.target.value)}
              disabled={!isEditing} fullWidth placeholder="e.g. Technology, Finance…"
              sx={fieldSx} error={!!fieldErrors.industry} helperText={fieldErrors.industry || ""}
            />
          </Box>

          {/* LinkedIn */}
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

          {/* Website */}
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
      </Section>
    </Box>
  );
};

// ─── Team Members Tab ─────────────────────────────────────────────────────────
const TeamTab: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { members, loading, error, invitations, fetchingInvitations,
    addMemberSuccess, updateRoleSuccess, deleteMemberSuccess } = useSelector(selectMembers);
  const { showToast } = useToast();

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Member | null>(null);
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
      setEditOpen(false);
      setSelected(null);
      dispatch(clearUpdateRoleSuccess());
      showToast({ message: "Role updated!", severity: "success" });
      dispatch(fetchMembers());
    }
  }, [updateRoleSuccess, dispatch, showToast]);

  useEffect(() => {
    if (deleteMemberSuccess) {
      setDeleteOpen(false);
      setSelected(null);
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
    try { await dispatch(deleteMember({ membershipId: selected._id })).unwrap(); }
    catch { /* handled via slice */ }
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
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>Team Members</Typography>
          <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>
            {members.length} member{members.length !== 1 ? "s" : ""} in your organisation
          </Typography>
        </Box>
        <Button
          size="small" variant="contained" startIcon={<PersonAddOutlined sx={{ fontSize: 16 }} />}
          onClick={() => setAddOpen(true)}
          sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600, bgcolor: TEAL, "&:hover": { bgcolor: "#0F766E" } }}
        >
          Invite Member
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: TEAL }} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
      ) : members.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8, bgcolor: TEAL_BG, borderRadius: 3, border: `1px dashed ${TEAL_BORDER}` }}>
          <PeopleOutlined sx={{ fontSize: 48, color: TEAL, opacity: 0.5, mb: 1 }} />
          <Typography sx={{ color: "#6B7280", fontWeight: 500 }}>No team members yet</Typography>
          <Typography sx={{ color: "#9CA3AF", fontSize: "13px", mt: 0.5 }}>Invite your first member to get started</Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {members.map((m) => {
            const roleColor = ROLE_COLORS[m.role] || TEAL;
            const initials = m.user?.username
              ? m.user.username.slice(0, 2).toUpperCase()
              : (m.user?.email?.charAt(0) ?? "?").toUpperCase();
            return (
              <Box
                key={m._id}
                sx={{
                  display: "flex", alignItems: "center", gap: 2, p: 2,
                  bgcolor: "#fff", borderRadius: 2.5, border: "1px solid #E5E7EB",
                  "&:hover": { borderColor: TEAL_BORDER, bgcolor: TEAL_BG },
                  transition: "all 0.15s",
                }}
              >
                <Avatar sx={{ width: 40, height: 40, bgcolor: roleColor, fontSize: "14px", fontWeight: 700 }}>
                  {initials}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
                    {m.user?.username ?? "Unknown"}
                  </Typography>
                  <Typography sx={{ fontSize: "12px", color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.user?.email ?? ""}
                  </Typography>
                </Box>
                <Chip
                  label={ROLE_LABELS[m.role] || m.role}
                  size="small"
                  sx={{ fontSize: "10px", fontWeight: 700, height: 22, bgcolor: `${roleColor}15`, color: roleColor, border: `1px solid ${roleColor}30` }}
                />
                <IconButton
                  size="small"
                  onClick={() => { setSelected(m); setMenuOpenId(menuOpenId === m._id ? null : m._id); }}
                  sx={{ color: "#9CA3AF" }}
                >
                  <MoreVertOutlined sx={{ fontSize: 18 }} />
                </IconButton>
                {/* Inline mini-menu */}
                {menuOpenId === m._id && (
                  <Box sx={{
                    position: "absolute", right: 48, zIndex: 10,
                    bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: 2,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.1)", overflow: "hidden",
                    minWidth: 120,
                  }}>
                    <Box
                      onClick={() => { setEditOpen(true); setMenuOpenId(null); }}
                      sx={{ px: 2, py: 1.2, fontSize: "13px", cursor: "pointer", "&:hover": { bgcolor: TEAL_BG }, color: "#374151" }}
                    >
                      Edit Role
                    </Box>
                    <Box
                      onClick={() => { setDeleteOpen(true); setMenuOpenId(null); }}
                      sx={{ px: 2, py: 1.2, fontSize: "13px", cursor: "pointer", "&:hover": { bgcolor: "#FEF2F2" }, color: "#EF4444" }}
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

      {/* Pending invitations */}
      {invitations.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <PendingInvitationsList
            invitations={invitations} loading={fetchingInvitations} error={null}
            onResend={handleResend} onCancel={handleCancelInv}
          />
        </Box>
      )}

      {/* Modals */}
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

  return (
    <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start", flexDirection: { xs: "column", md: "row" } }}>
      {/* ── Sidebar ── */}
      <Box
        sx={{
          width: { xs: "100%", md: 220 },
          flexShrink: 0,
          bgcolor: "#fff",
          borderRadius: 3,
          border: "1px solid #E5E7EB",
          overflow: "hidden",
          position: { md: "sticky" },
          top: 24,
        }}
      >
        {/* Sidebar header */}
        <Box sx={{ px: 2.5, py: 2, borderBottom: "1px solid #F3F4F6" }}>
          <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Settings
          </Typography>
        </Box>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = activeSection === id;
          return (
            <Box
              key={id}
              onClick={() => setActiveSection(id)}
              sx={{
                display: "flex", alignItems: "center", gap: 1.5, px: 2.5, py: 1.8,
                cursor: "pointer", borderLeft: `3px solid ${active ? TEAL : "transparent"}`,
                bgcolor: active ? TEAL_BG : "transparent", color: active ? TEAL : "#6B7280",
                transition: "all 0.15s",
                "&:hover": { bgcolor: TEAL_BG, color: TEAL },
              }}
            >
              <Icon sx={{ fontSize: 18 }} />
              <Typography sx={{ fontSize: "13px", fontWeight: active ? 700 : 500 }}>{label}</Typography>
            </Box>
          );
        })}
      </Box>

      {/* ── Content panel ── */}
      <Box
        sx={{
          flex: 1,
          bgcolor: "#fff",
          borderRadius: 3,
          border: "1px solid #E5E7EB",
          p: 3,
          minHeight: 400,
          position: "relative",
        }}
        // Close inline menus when clicking outside
        onClick={() => {
          // handled inside TeamTab
        }}
      >
        {activeSection === "company" && <CompanyInfoTab hook={hook} />}
        {activeSection === "contact" && <ContactTab hook={hook} />}
        {activeSection === "team"    && <TeamTab />}
      </Box>
    </Box>
  );
};

export default CompanySettings;
