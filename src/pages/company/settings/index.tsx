'use client';
import React, { useRef, useState, useMemo, useEffect } from "react";
import {
  Box, Typography, Avatar, Button, TextField, MenuItem,
  Autocomplete, CircularProgress, Tabs, Tab, Chip, Divider,
  IconButton, Tooltip, Switch, Dialog, DialogTitle, DialogContent,
  DialogActions, InputAdornment, Alert,
} from "@mui/material";
import EditOutlined from "@mui/icons-material/EditOutlined";
import SaveOutlined from "@mui/icons-material/SaveOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import LanguageIcon from "@mui/icons-material/Language";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import AddOutlined from "@mui/icons-material/AddOutlined";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import ContentCopyOutlined from "@mui/icons-material/ContentCopyOutlined";
import KeyOutlined from "@mui/icons-material/KeyOutlined";
import RefreshOutlined from "@mui/icons-material/RefreshOutlined";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { type Dayjs } from "dayjs";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import { useCompanyProfileManagement } from "@/hooks/useCompanyProfileManagement";
import { getAllCountryNames } from "@/utils/countryMappings";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store/store";
import {
  fetchApiKeys, createApiKey, deleteApiKey, toggleApiKey, updateApiKey, regenerateApiKey, clearNewKey,
  selectApiKeys, selectApiKeysLoading, selectApiKeysCreating, selectApiKeysError, selectNewKey,
  type ApiKey,
} from "@/store/slices/apiKeySlice";

const TEAL        = "#0D9488";
const TEAL_BG     = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";

const COMPANY_SIZES     = ["1-10", "11-50", "51-200", "201-500", "500+"];
const EXPERIENCE_LEVELS = ["Entry Level", "Mid Level", "Senior Level", "Lead", "Executive"];
const EMPLOYMENT_TYPES  = ["Remote", "On-site", "Hybrid"];

const AVAILABLE_SCOPES = [
  "read:dashboard", "write:dashboard",
  "read:posts", "write:posts",
  "read:applications", "write:applications",
];

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    fontSize: "0.875rem",
    "&.Mui-focused fieldset": { borderColor: TEAL },
    "&.Mui-disabled": { bgcolor: "#F9FAFB" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: TEAL },
  "& .MuiInputLabel-root": { fontSize: "0.875rem" },
};

const FieldLabel = ({ text }: { text: string }) => (
  <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.75 }}>
    {text}
  </Typography>
);

const SectionTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <Box sx={{ mb: 2.5 }}>
    <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#111827" }}>{title}</Typography>
    {subtitle && <Typography sx={{ fontSize: "0.78rem", color: "#9CA3AF", mt: 0.25 }}>{subtitle}</Typography>}
  </Box>
);

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const SettingsPage: React.FC = () => {
  const {
    profile, loading, uploadingImage, fieldErrors,
    handleInputChange, handleImageUpload, handleSaveProfile, setIsEditing,
  } = useCompanyProfileManagement();

  const dispatch = useDispatch<AppDispatch>();
  const apiKeys   = useSelector(selectApiKeys);
  const keysLoading = useSelector(selectApiKeysLoading);
  const creating  = useSelector(selectApiKeysCreating);
  const apiError  = useSelector(selectApiKeysError);
  const newKey    = useSelector(selectNewKey);

  const [tab, setTab]           = useState(0);
  const [isEditing, setEditing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef            = useRef<HTMLInputElement>(null);
  const countries               = useMemo(() => getAllCountryNames(), []);

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    serviceName: "mobile-app",
    scopes: ["read:dashboard", "write:dashboard"] as string[],
    rateLimit: 5,
    expiresAt: "2027-12-31",
  });
  const [copied, setCopied] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [editForm, setEditForm] = useState({ name: "", serviceName: "", scopes: [] as string[], rateLimit: 5, expiresAt: "" });

  useEffect(() => {
    if (tab === 2) dispatch(fetchApiKeys());
  }, [tab, dispatch]);

  useEffect(() => {
    if (editingKey) {
      setEditForm({
        name: editingKey.name,
        serviceName: editingKey.serviceName,
        scopes: editingKey.scopes,
        rateLimit: editingKey.rateLimit,
        expiresAt: editingKey.expiresAt ? editingKey.expiresAt.slice(0, 10) : "",
      });
    }
  }, [editingKey]);

  const handleUpdate = async () => {
    if (!editingKey) return;
    await dispatch(updateApiKey({ id: editingKey.id, data: editForm }));
    setEditingKey(null);
  };

  const displayName = profile.name || profile.companyName || "Company";
  const initials    = displayName.charAt(0).toUpperCase();

  const startEdit  = () => { setEditing(true); setIsEditing(true); };
  const cancelEdit = () => { setEditing(false); setIsEditing(false); };
  const saveEdit   = async () => { await handleSaveProfile(); setEditing(false); };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const dt = new DataTransfer(); dt.items.add(file);
    handleImageUpload({ target: { files: dt.files } } as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  const handleCreate = async () => {
    await dispatch(createApiKey(form));
    setCreateOpen(false);
    setForm({ name: "", serviceName: "mobile-app", scopes: ["read:dashboard", "write:dashboard"], rateLimit: 5, expiresAt: "2027-12-31" });
  };

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleScope = (scope: string) => {
    setForm((f) => ({
      ...f,
      scopes: f.scopes.includes(scope) ? f.scopes.filter((s) => s !== scope) : [...f.scopes, scope],
    }));
  };

  return (
    <DashboardLayout>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: "#111827" }}>Settings</Typography>
        <Typography sx={{ fontSize: "0.82rem", color: "#9CA3AF", mt: 0.25 }}>Manage your company profile and API keys</Typography>
      </Box>

      <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", overflow: "hidden" }}>

        {/* ══════ Profile banner ══════ */}
        <Box sx={{ bgcolor: "#FAFAFA", borderBottom: "1px solid #E5E7EB", px: { xs: 3, md: 5 }, py: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, flexWrap: "wrap" }}>
            <Box
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              sx={{
                position: "relative", cursor: "pointer", flexShrink: 0,
                width: 72, height: 72, borderRadius: "16px",
                border: "3px solid #fff",
                boxShadow: dragOver ? `0 0 0 3px ${TEAL}` : "0 2px 8px rgba(0,0,0,0.1)",
                transition: "box-shadow 0.2s",
                "&:hover .upload-overlay": { opacity: 1 },
              }}
            >
              {uploadingImage ? (
                <Box sx={{ width: "100%", height: "100%", borderRadius: "13px", bgcolor: TEAL_BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CircularProgress size={22} sx={{ color: TEAL }} />
                </Box>
              ) : (
                <Avatar src={profile.avatar} variant="rounded" sx={{ width: "100%", height: "100%", borderRadius: "13px", bgcolor: TEAL, fontSize: "28px", fontWeight: 800, color: "#fff" }}>
                  {initials}
                </Avatar>
              )}
              <Box className="upload-overlay" sx={{ position: "absolute", inset: 0, borderRadius: "13px", bgcolor: "rgba(13,148,136,0.6)", opacity: 0, transition: "opacity 0.2s", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CloudUploadOutlined sx={{ fontSize: 20, color: "#fff" }} />
              </Box>
            </Box>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: "1.15rem", fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>{displayName}</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 0.5 }}>
                {profile.email && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <LanguageIcon sx={{ fontSize: 13, color: "#9CA3AF" }} />
                    <Typography sx={{ fontSize: "0.75rem", color: "#6B7280" }}>{profile.email}</Typography>
                  </Box>
                )}
                {profile.location && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <LocationOnOutlined sx={{ fontSize: 13, color: "#9CA3AF" }} />
                    <Typography sx={{ fontSize: "0.75rem", color: "#6B7280" }}>{profile.location}</Typography>
                  </Box>
                )}
                {profile.industry && (
                  <Chip label={profile.industry} size="small" sx={{ height: 20, fontSize: "0.67rem", fontWeight: 600, bgcolor: "rgba(13,148,136,0.08)", color: TEAL }} />
                )}
                {(profile.size || profile.companySize) && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <GroupsOutlined sx={{ fontSize: 13, color: "#9CA3AF" }} />
                    <Typography sx={{ fontSize: "0.75rem", color: "#6B7280" }}>{profile.size || profile.companySize} employees</Typography>
                  </Box>
                )}
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
              {!isEditing ? (
                <Button size="small" startIcon={<EditOutlined sx={{ fontSize: 14 }} />} onClick={startEdit}
                  sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.78rem", color: TEAL, border: `1px solid ${TEAL_BORDER}`, borderRadius: "9px", px: 2, bgcolor: TEAL_BG, "&:hover": { bgcolor: "#CCFBF1" } }}>
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button size="small" startIcon={<CloseOutlined sx={{ fontSize: 14 }} />} onClick={cancelEdit}
                    sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.78rem", color: "#6B7280", border: "1px solid #E5E7EB", borderRadius: "9px", px: 1.5 }}>
                    Cancel
                  </Button>
                  <Button size="small" variant="contained" startIcon={loading ? undefined : <SaveOutlined sx={{ fontSize: 14 }} />}
                    onClick={saveEdit} disabled={loading}
                    sx={{ textTransform: "none", fontWeight: 700, fontSize: "0.78rem", bgcolor: TEAL, color: "#fff", borderRadius: "9px", px: 2, boxShadow: "none", "&:hover": { bgcolor: "#0F766E", boxShadow: "none" } }}>
                    {loading ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : "Save"}
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Box>

        {/* ══════ Tabs ══════ */}
        <Box>
          <Box sx={{ borderBottom: "1px solid #F3F4F6", px: 3, display: "flex", alignItems: "center" }}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              sx={{
                minHeight: 48,
                "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.82rem", minHeight: 48, color: "#374151", px: 1.5, mr: 1 },
                "& .Mui-selected": { color: TEAL },
                "& .MuiTabs-indicator": { bgcolor: TEAL, height: 2 },
              }}
            >
              <Tab label="Company Info" />
              <Tab label="Contact & Presence" />
              <Tab label="API Keys" />
            </Tabs>
          </Box>

          {/* ── Tab 0: Company Info ── */}
          {tab === 0 && (
            <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
              <SectionTitle title="Company Information" subtitle="Your company's basic profile details" />
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 3 }}>
                <Box sx={{ gridColumn: "1 / -1" }}>
                  <FieldLabel text="Company Name" />
                  <TextField
                    value={profile.name || profile.companyName || ""}
                    onChange={(e) => { handleInputChange("name", e.target.value); handleInputChange("companyName", e.target.value); }}
                    disabled={!isEditing} fullWidth required
                    placeholder="Your company name"
                    error={!!fieldErrors.name || !!fieldErrors.companyName}
                    helperText={fieldErrors.name || fieldErrors.companyName || ""}
                    sx={fieldSx}
                  />
                </Box>
                <Box sx={{ gridColumn: "1 / -1" }}>
                  <FieldLabel text="Company Email" />
                  <TextField value={profile.email} disabled fullWidth helperText="Email cannot be changed" sx={fieldSx} />
                </Box>
                <Box>
                  <FieldLabel text="Industry" />
                  <TextField
                    value={profile.industry || ""}
                    onChange={(e) => handleInputChange("industry", e.target.value)}
                    disabled={!isEditing} fullWidth
                    placeholder="e.g. Technology, Finance..."
                    error={!!fieldErrors.industry} helperText={fieldErrors.industry || ""}
                    sx={fieldSx}
                  />
                </Box>
                <Box>
                  <FieldLabel text="Company Size" />
                  <TextField select value={profile.size || profile.companySize || ""}
                    onChange={(e) => { handleInputChange("size", e.target.value); handleInputChange("companySize", e.target.value); }}
                    disabled={!isEditing} fullWidth
                    error={!!fieldErrors.size} helperText={fieldErrors.size || ""}
                    sx={fieldSx}
                  >
                    {COMPANY_SIZES.map((s) => <MenuItem key={s} value={s}>{s} employees</MenuItem>)}
                  </TextField>
                </Box>
                <Box sx={{ gridColumn: "1 / -1" }}>
                  <FieldLabel text="Required Experience Level" />
                  <TextField select value={profile.requiredExperienceLevel || "Mid Level"}
                    onChange={(e) => handleInputChange("requiredExperienceLevel", e.target.value)}
                    disabled={!isEditing} fullWidth sx={fieldSx}
                  >
                    {EXPERIENCE_LEVELS.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                  </TextField>
                </Box>
              </Box>
            </Box>
          )}

          {/* ── Tab 1: Contact & Presence ── */}
          {tab === 1 && (
            <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
              <SectionTitle title="Contact & Presence" subtitle="Location, social links, and work preferences" />
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 3 }}>
                <Box sx={{ gridColumn: "1 / -1" }}>
                  <FieldLabel text="Country / Location" />
                  <Autocomplete
                    options={countries}
                    value={profile.location || null}
                    onChange={(_, v) => handleInputChange("location", v || "")}
                    disabled={!isEditing} fullWidth
                    renderInput={(params) => <TextField {...params} placeholder="Select country" sx={fieldSx} />}
                  />
                </Box>
                <Box>
                  <FieldLabel text="Employment Type" />
                  <TextField select value={profile.employmentType || "Remote"}
                    onChange={(e) => handleInputChange("employmentType", e.target.value)}
                    disabled={!isEditing} fullWidth
                    error={!!fieldErrors.employmentType} helperText={fieldErrors.employmentType || ""}
                    sx={fieldSx}
                  >
                    {EMPLOYMENT_TYPES.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                  </TextField>
                </Box>
                <Box>
                  <FieldLabel text="Company Size" />
                  <TextField select value={profile.size || ""}
                    onChange={(e) => handleInputChange("size", e.target.value)}
                    disabled={!isEditing} fullWidth
                    error={!!fieldErrors.size} helperText={fieldErrors.size || ""}
                    sx={fieldSx}
                  >
                    {COMPANY_SIZES.map((s) => <MenuItem key={s} value={s}>{s} employees</MenuItem>)}
                  </TextField>
                </Box>
                <Box sx={{ gridColumn: "1 / -1" }}>
                  <FieldLabel text="LinkedIn URL" />
                  <TextField
                    value={profile.linkedin || ""}
                    onChange={(e) => handleInputChange("linkedin", e.target.value)}
                    disabled={!isEditing} fullWidth type="url"
                    placeholder="https://linkedin.com/company/yourcompany"
                    error={!!fieldErrors.linkedin} helperText={fieldErrors.linkedin || ""}
                    sx={fieldSx}
                  />
                </Box>
                <Box sx={{ gridColumn: "1 / -1" }}>
                  <FieldLabel text="Company Website" />
                  <TextField
                    value={profile.website || ""}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    disabled={!isEditing} fullWidth type="url"
                    placeholder="https://yourcompany.com"
                    error={!!fieldErrors.website} helperText={fieldErrors.website || ""}
                    sx={fieldSx}
                  />
                </Box>
              </Box>
            </Box>
          )}

          {/* ── Tab 2: API Keys ── */}
          {tab === 2 && (
            <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2.5, flexWrap: "wrap", gap: 1.5 }}>
                <SectionTitle title="API Keys" subtitle="Manage API keys for external integrations" />
                <Button
                  size="small"
                  startIcon={<AddOutlined sx={{ fontSize: 15 }} />}
                  onClick={() => setCreateOpen(true)}
                  sx={{ textTransform: "none", fontWeight: 700, fontSize: "0.78rem", bgcolor: TEAL, color: "#fff", borderRadius: "9px", px: 2, boxShadow: "none", "&:hover": { bgcolor: "#0F766E", boxShadow: "none" } }}
                >
                  New API Key
                </Button>
              </Box>

              {/* One-time key banner */}
              {newKey && (
                <Alert
                  severity="success"
                  onClose={() => dispatch(clearNewKey())}
                  sx={{ mb: 2.5, borderRadius: "10px", fontSize: "0.82rem", "& .MuiAlert-message": { width: "100%" } }}
                  action={
                    <Tooltip title={copied ? "Copied!" : "Copy"}>
                      <IconButton size="small" onClick={() => handleCopy(newKey)}>
                        <ContentCopyOutlined sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  }
                >
                  <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, mb: 0.5 }}>API key created — copy it now, it won't be shown again</Typography>
                  <Box sx={{ fontFamily: "monospace", fontSize: "0.8rem", bgcolor: "#F0FDF4", px: 1.5, py: 0.75, borderRadius: "6px", wordBreak: "break-all" }}>
                    {newKey}
                  </Box>
                </Alert>
              )}

              {apiError && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: "10px", fontSize: "0.82rem" }}>{apiError}</Alert>
              )}

              {keysLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                  <CircularProgress size={28} sx={{ color: TEAL }} />
                </Box>
              ) : apiKeys.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 8, color: "#9CA3AF" }}>
                  <KeyOutlined sx={{ fontSize: 40, mb: 1, opacity: 0.4 }} />
                  <Typography sx={{ fontSize: "0.88rem" }}>No API keys yet</Typography>
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {apiKeys.map((k) => (
                    <Box key={k.id} sx={{ border: "1px solid #E5E7EB", borderRadius: "12px", p: 2, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                      <Box sx={{ width: 36, height: 36, borderRadius: "9px", bgcolor: k.isActive ? TEAL_BG : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <KeyOutlined sx={{ fontSize: 17, color: k.isActive ? TEAL : "#9CA3AF" }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                          <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: "#111827" }}>{k.name}</Typography>
                          <Chip label={k.serviceName} size="small" sx={{ height: 18, fontSize: "0.62rem", fontWeight: 600, bgcolor: "#F3F4F6", color: "#374151" }} />
                          <Chip
                            label={k.isActive ? "Active" : "Disabled"}
                            size="small"
                            sx={{ height: 18, fontSize: "0.62rem", fontWeight: 700, bgcolor: k.isActive ? "rgba(13,148,136,0.08)" : "#F3F4F6", color: k.isActive ? TEAL : "#9CA3AF" }}
                          />
                        </Box>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.6 }}>
                          {k.scopes.map((s) => (
                            <Chip key={s} label={s} size="small" sx={{ height: 17, fontSize: "0.6rem", bgcolor: "#EFF6FF", color: "#2563EB" }} />
                          ))}
                        </Box>
                        <Box sx={{ display: "flex", gap: 2, mt: 0.5 }}>
                          <Typography sx={{ fontSize: "0.68rem", color: "#9CA3AF" }}>
                            {k.keyPreview && `Key: ${k.keyPreview}`}
                          </Typography>
                          <Typography sx={{ fontSize: "0.68rem", color: "#9CA3AF" }}>
                            Rate limit: {k.rateLimit} req/s
                          </Typography>
                          {k.expiresAt && (
                            <Typography sx={{ fontSize: "0.68rem", color: "#9CA3AF" }}>
                              Expires: {fmtDate(k.expiresAt)}
                            </Typography>
                          )}
                          {k.lastUsed && (
                            <Typography sx={{ fontSize: "0.68rem", color: "#9CA3AF" }}>
                              Last used: {fmtDate(k.lastUsed)}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
                        <Tooltip title={k.isActive ? "Disable" : "Enable"}>
                          <Switch
                            size="small"
                            checked={k.isActive}
                            onChange={() => dispatch(toggleApiKey(k.id))}
                            sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: TEAL }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: TEAL } }}
                          />
                        </Tooltip>
                        <Tooltip title="Regenerate key">
                          <IconButton size="small" onClick={() => dispatch(regenerateApiKey(k.id))} sx={{ color: "#F59E0B", "&:hover": { bgcolor: "#FFFBEB" } }}>
                            <RefreshOutlined sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => setEditingKey(k)} sx={{ color: TEAL, "&:hover": { bgcolor: TEAL_BG } }}>
                            <EditOutlined sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => dispatch(deleteApiKey(k.id))} sx={{ color: "#EF4444", "&:hover": { bgcolor: "#FEF2F2" } }}>
                            <DeleteOutlined sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* ══════ Create API Key Dialog ══════ */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: "16px" } }}>
        <DialogTitle sx={{ fontSize: "1rem", fontWeight: 700, pb: 1 }}>Create API Key</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box>
              <FieldLabel text="Key Name" />
              <TextField
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                fullWidth placeholder="e.g. Mon app mobile"
                sx={fieldSx}
              />
            </Box>
            <Box>
              <FieldLabel text="Service Name" />
              <TextField
                value={form.serviceName}
                onChange={(e) => setForm((f) => ({ ...f, serviceName: e.target.value }))}
                fullWidth placeholder="e.g. mobile-app"
                sx={fieldSx}
              />
            </Box>
            <Box>
              <FieldLabel text="Scopes" />
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                {AVAILABLE_SCOPES.map((s) => (
                  <Chip
                    key={s} label={s} size="small" clickable
                    onClick={() => toggleScope(s)}
                    sx={{
                      height: 26, fontSize: "0.72rem", fontWeight: 600,
                      bgcolor: form.scopes.includes(s) ? "rgba(13,148,136,0.1)" : "#F3F4F6",
                      color: form.scopes.includes(s) ? TEAL : "#374151",
                      border: form.scopes.includes(s) ? `1px solid ${TEAL_BORDER}` : "1px solid transparent",
                    }}
                  />
                ))}
              </Box>
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <Box>
                <FieldLabel text="Rate Limit (req/s)" />
                <TextField
                  type="number"
                  value={form.rateLimit}
                  onChange={(e) => setForm((f) => ({ ...f, rateLimit: Number(e.target.value) }))}
                  fullWidth inputProps={{ min: 1 }}
                  sx={fieldSx}
                />
              </Box>
              <Box>
                <FieldLabel text="Expires At" />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={form.expiresAt ? dayjs(form.expiresAt) : null}
                    onChange={(v: Dayjs | null) => setForm((f) => ({ ...f, expiresAt: v ? v.format("YYYY-MM-DD") : "" }))}
                    disablePast
                    slotProps={{
                      textField: { fullWidth: true, sx: fieldSx },
                      popper: { sx: { "& .MuiPaper-root": { borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" } } },
                    }}
                  />
                </LocalizationProvider>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setCreateOpen(false)} size="small"
            sx={{ textTransform: "none", fontWeight: 600, color: "#6B7280", border: "1px solid #E5E7EB", borderRadius: "9px", px: 2 }}>
            Cancel
          </Button>
          <Button onClick={handleCreate} size="small" disabled={creating || !form.name.trim()}
            sx={{ textTransform: "none", fontWeight: 700, bgcolor: TEAL, color: "#fff", borderRadius: "9px", px: 2.5, boxShadow: "none", "&:hover": { bgcolor: "#0F766E", boxShadow: "none" }, "&.Mui-disabled": { bgcolor: "#E5E7EB" } }}>
            {creating ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : "Create Key"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══════ Edit API Key Dialog ══════ */}
      <Dialog open={!!editingKey} onClose={() => setEditingKey(null)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: "16px" } }}>
        <DialogTitle sx={{ fontSize: "1rem", fontWeight: 700, pb: 1 }}>Edit API Key</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box>
              <FieldLabel text="Key Name" />
              <TextField
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                fullWidth sx={fieldSx}
              />
            </Box>
            <Box>
              <FieldLabel text="Service Name" />
              <TextField
                value={editForm.serviceName}
                onChange={(e) => setEditForm((f) => ({ ...f, serviceName: e.target.value }))}
                fullWidth sx={fieldSx}
              />
            </Box>
            <Box>
              <FieldLabel text="Scopes" />
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                {AVAILABLE_SCOPES.map((s) => (
                  <Chip
                    key={s} label={s} size="small" clickable
                    onClick={() => setEditForm((f) => ({
                      ...f,
                      scopes: f.scopes.includes(s) ? f.scopes.filter((x) => x !== s) : [...f.scopes, s],
                    }))}
                    sx={{
                      height: 26, fontSize: "0.72rem", fontWeight: 600,
                      bgcolor: editForm.scopes.includes(s) ? "rgba(13,148,136,0.1)" : "#F3F4F6",
                      color: editForm.scopes.includes(s) ? TEAL : "#374151",
                      border: editForm.scopes.includes(s) ? `1px solid ${TEAL_BORDER}` : "1px solid transparent",
                    }}
                  />
                ))}
              </Box>
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <Box>
                <FieldLabel text="Rate Limit (req/s)" />
                <TextField
                  type="number"
                  value={editForm.rateLimit}
                  onChange={(e) => setEditForm((f) => ({ ...f, rateLimit: Number(e.target.value) }))}
                  fullWidth inputProps={{ min: 1 }} sx={fieldSx}
                />
              </Box>
              <Box>
                <FieldLabel text="Expires At" />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={editForm.expiresAt ? dayjs(editForm.expiresAt) : null}
                    onChange={(v: Dayjs | null) => setEditForm((f) => ({ ...f, expiresAt: v ? v.format("YYYY-MM-DD") : "" }))}
                    disablePast
                    slotProps={{
                      textField: { fullWidth: true, sx: fieldSx },
                      popper: { sx: { "& .MuiPaper-root": { borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" } } },
                    }}
                  />
                </LocalizationProvider>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setEditingKey(null)} size="small"
            sx={{ textTransform: "none", fontWeight: 600, color: "#6B7280", border: "1px solid #E5E7EB", borderRadius: "9px", px: 2 }}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} size="small" disabled={!editForm.name.trim()}
            sx={{ textTransform: "none", fontWeight: 700, bgcolor: TEAL, color: "#fff", borderRadius: "9px", px: 2.5, boxShadow: "none", "&:hover": { bgcolor: "#0F766E", boxShadow: "none" }, "&.Mui-disabled": { bgcolor: "#E5E7EB" } }}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default SettingsPage;
