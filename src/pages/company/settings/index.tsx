'use client';
import React, { useRef, useState, useMemo } from "react";
import {
  Box, Typography, Avatar, Button, TextField, MenuItem,
  Autocomplete, CircularProgress, Tabs, Tab, Chip, Divider,
} from "@mui/material";
import EditOutlined from "@mui/icons-material/EditOutlined";
import SaveOutlined from "@mui/icons-material/SaveOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import LanguageIcon from "@mui/icons-material/Language";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import { useCompanyProfileManagement } from "@/hooks/useCompanyProfileManagement";
import { getAllCountryNames } from "@/utils/countryMappings";

const TEAL        = "#0D9488";
const TEAL_BG     = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";

const COMPANY_SIZES     = ["1-10", "11-50", "51-200", "201-500", "500+"];
const EXPERIENCE_LEVELS = ["Entry Level", "Mid Level", "Senior Level", "Lead", "Executive"];
const EMPLOYMENT_TYPES  = ["Remote", "On-site", "Hybrid"];

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

/* ── Small label above each field ─────────────────────────── */
const FieldLabel = ({ text }: { text: string }) => (
  <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.75 }}>
    {text}
  </Typography>
);

/* ── Section title ─────────────────────────────────────────── */
const SectionTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <Box sx={{ mb: 2.5 }}>
    <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#111827" }}>{title}</Typography>
    {subtitle && <Typography sx={{ fontSize: "0.78rem", color: "#9CA3AF", mt: 0.25 }}>{subtitle}</Typography>}
  </Box>
);

const SettingsPage: React.FC = () => {
  const {
    profile, loading, uploadingImage, fieldErrors,
    handleInputChange, handleImageUpload, handleSaveProfile, setIsEditing,
  } = useCompanyProfileManagement();

  const [tab, setTab]           = useState(0);
  const [isEditing, setEditing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef            = useRef<HTMLInputElement>(null);
  const countries               = useMemo(() => getAllCountryNames(), []);

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

  return (
    <DashboardLayout>
      {/* ── Page header ── */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: "#111827" }}>Settings</Typography>
        <Typography sx={{ fontSize: "0.82rem", color: "#9CA3AF", mt: 0.25 }}>Manage your company profile and contact details</Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start", flexDirection: { xs: "column", lg: "row" } }}>

        {/* ══════════════ LEFT — Profile card ══════════════ */}
        <Box sx={{ width: { xs: "100%", lg: 260 }, flexShrink: 0, position: { lg: "sticky" }, top: 24 }}>
          <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", overflow: "hidden" }}>

            {/* Cover gradient */}
            <Box sx={{ height: 72, background: `linear-gradient(135deg, ${TEAL} 0%, #0891B2 100%)`, position: "relative" }} />

            {/* Avatar — overlaps cover */}
            <Box sx={{ px: 3, pb: 3 }}>
              <Box
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  position: "relative", cursor: "pointer",
                  width: 72, height: 72, borderRadius: "50%",
                  mt: "-36px", mb: 1.5,
                  border: `3px solid #fff`,
                  boxShadow: dragOver ? `0 0 0 3px ${TEAL}` : "0 2px 8px rgba(0,0,0,0.12)",
                  transition: "box-shadow 0.2s",
                  "&:hover .upload-overlay": { opacity: 1 },
                }}
              >
                {uploadingImage ? (
                  <Box sx={{ width: "100%", height: "100%", borderRadius: "50%", bgcolor: TEAL_BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CircularProgress size={22} sx={{ color: TEAL }} />
                  </Box>
                ) : (
                  <Avatar src={profile.avatar} sx={{ width: "100%", height: "100%", bgcolor: TEAL, fontSize: "26px", fontWeight: 800 }}>
                    {initials}
                  </Avatar>
                )}
                <Box className="upload-overlay" sx={{ position: "absolute", inset: 0, borderRadius: "50%", bgcolor: "rgba(13,148,136,0.75)", opacity: 0, transition: "opacity 0.2s", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CloudUploadOutlined sx={{ fontSize: 20, color: "#fff" }} />
                </Box>
              </Box>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />

              <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#111827", lineHeight: 1.3 }}>{displayName}</Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "#6B7280", mt: 0.25 }}>{profile.email}</Typography>

              {/* Quick chips */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1.5 }}>
                {profile.location && (
                  <Chip icon={<LocationOnOutlined sx={{ fontSize: "11px !important" }} />} label={profile.location} size="small"
                    sx={{ fontSize: "0.68rem", height: 22, bgcolor: TEAL_BG, color: TEAL, border: `1px solid ${TEAL_BORDER}`, "& .MuiChip-icon": { color: `${TEAL} !important` } }} />
                )}
                {(profile.size || profile.companySize) && (
                  <Chip icon={<GroupsOutlined sx={{ fontSize: "11px !important" }} />} label={profile.size || profile.companySize} size="small"
                    sx={{ fontSize: "0.68rem", height: 22, bgcolor: "#F3F4F6", color: "#6B7280" }} />
                )}
                {profile.industry && (
                  <Chip label={profile.industry} size="small"
                    sx={{ fontSize: "0.68rem", height: 22, bgcolor: "#F3F4F6", color: "#6B7280" }} />
                )}
              </Box>

              <Divider sx={{ my: 2, borderColor: "#F3F4F6" }} />

              {/* Links */}
              {(profile.linkedin || profile.website) && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {profile.linkedin && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LinkedInIcon sx={{ fontSize: 15, color: "#0A66C2" }} />
                      <Typography component="a" href={profile.linkedin} target="_blank" rel="noreferrer"
                        sx={{ fontSize: "0.72rem", color: "#0A66C2", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", "&:hover": { textDecoration: "underline" } }}>
                        LinkedIn
                      </Typography>
                    </Box>
                  )}
                  {profile.website && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LanguageIcon sx={{ fontSize: 15, color: TEAL }} />
                      <Typography component="a" href={profile.website} target="_blank" rel="noreferrer"
                        sx={{ fontSize: "0.72rem", color: TEAL, textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", "&:hover": { textDecoration: "underline" } }}>
                        Website
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              <Typography sx={{ fontSize: "0.68rem", color: "#D1D5DB", mt: 2 }}>
                Click avatar to upload · drag & drop supported
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ══════════════ RIGHT — Tabs + forms ══════════════ */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", overflow: "hidden" }}>

            {/* Tab bar */}
            <Box sx={{ borderBottom: "1px solid #F3F4F6", px: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                sx={{
                  minHeight: 48,
                  "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.82rem", minHeight: 48, color: "#9CA3AF", px: 0, mr: 3 },
                  "& .Mui-selected": { color: TEAL },
                  "& .MuiTabs-indicator": { bgcolor: TEAL, height: 2 },
                }}
              >
                <Tab label="Company Info" />
                <Tab label="Contact & Presence" />
              </Tabs>

              {/* Edit / Save / Cancel */}
              {!isEditing ? (
                <Button size="small" startIcon={<EditOutlined sx={{ fontSize: 14 }} />} onClick={startEdit}
                  sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.78rem", color: TEAL, border: `1px solid ${TEAL_BORDER}`, borderRadius: "8px", px: 1.5, "&:hover": { bgcolor: TEAL_BG } }}>
                  Edit
                </Button>
              ) : (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button size="small" startIcon={<CloseOutlined sx={{ fontSize: 14 }} />} onClick={cancelEdit}
                    sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.78rem", color: "#6B7280", border: "1px solid #E5E7EB", borderRadius: "8px", px: 1.5 }}>
                    Cancel
                  </Button>
                  <Button size="small" variant="contained" startIcon={loading ? undefined : <SaveOutlined sx={{ fontSize: 14 }} />}
                    onClick={saveEdit} disabled={loading}
                    sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.78rem", bgcolor: TEAL, color: "#fff", borderRadius: "8px", px: 1.5, boxShadow: "none", "&:hover": { bgcolor: "#0F766E", boxShadow: "none" } }}>
                    {loading ? <CircularProgress size={14} color="inherit" /> : "Save changes"}
                  </Button>
                </Box>
              )}
            </Box>

            {/* ── Tab 0: Company Info ── */}
            {tab === 0 && (
              <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <SectionTitle title="Company Information" subtitle="Your company's basic profile details" />

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 3 }}>

                  {/* Company Name */}
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

                  {/* Email (read-only) */}
                  <Box sx={{ gridColumn: "1 / -1" }}>
                    <FieldLabel text="Company Email" />
                    <TextField value={profile.email} disabled fullWidth helperText="Email cannot be changed" sx={fieldSx} />
                  </Box>

                  {/* Industry */}
                  <Box>
                    <FieldLabel text="Industry" />
                    <TextField
                      value={profile.industry || ""}
                      onChange={(e) => handleInputChange("industry", e.target.value)}
                      disabled={!isEditing} fullWidth
                      placeholder="e.g. Technology, Finance…"
                      error={!!fieldErrors.industry}
                      helperText={fieldErrors.industry || ""}
                      sx={fieldSx}
                    />
                  </Box>

                  {/* Company Size */}
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

                  {/* Required Experience Level */}
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

                  {/* Location */}
                  <Box sx={{ gridColumn: "1 / -1" }}>
                    <FieldLabel text="Country / Location" />
                    <Autocomplete
                      options={countries}
                      value={profile.location || null}
                      onChange={(_, v) => handleInputChange("location", v || "")}
                      disabled={!isEditing}
                      fullWidth
                      renderInput={(params) => (
                        <TextField {...params} placeholder="Select country" sx={fieldSx} />
                      )}
                    />
                  </Box>

                  {/* Employment Type */}
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

                  {/* Company Size */}
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

                  {/* LinkedIn */}
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

                  {/* Website */}
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

          </Box>
        </Box>

      </Box>
    </DashboardLayout>
  );
};

export default SettingsPage;
