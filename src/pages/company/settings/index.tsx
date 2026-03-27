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

      <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", overflow: "hidden" }}>

        {/* ══════ Profile banner ══════ */}
        <Box sx={{ bgcolor: "#FAFAFA", borderBottom: "1px solid #E5E7EB", px: { xs: 3, md: 5 }, py: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, flexWrap: "wrap" }}>
            {/* Avatar */}
            <Box
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              sx={{
                position: "relative", cursor: "pointer", flexShrink: 0,
                width: 72, height: 72, borderRadius: "16px",
                border: "3px solid #fff",
                boxShadow: dragOver ? "0 0 0 3px #8310FF" : "0 2px 8px rgba(0,0,0,0.1)",
                transition: "box-shadow 0.2s",
                "&:hover .upload-overlay": { opacity: 1 },
              }}
            >
              {uploadingImage ? (
                <Box sx={{ width: "100%", height: "100%", borderRadius: "13px", bgcolor: "#F5F0FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CircularProgress size={22} sx={{ color: "#0D9488" }} />
                </Box>
              ) : (
                <Avatar src={profile.avatar} variant="rounded" sx={{ width: "100%", height: "100%", borderRadius: "13px", bgcolor: "#0D9488", fontSize: "28px", fontWeight: 800, color: "#fff" }}>
                  {initials}
                </Avatar>
              )}
              <Box className="upload-overlay" sx={{ position: "absolute", inset: 0, borderRadius: "13px", bgcolor: "rgba(13,148,136,0.6)", opacity: 0, transition: "opacity 0.2s", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CloudUploadOutlined sx={{ fontSize: 20, color: "#fff" }} />
              </Box>
            </Box>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />

            {/* Name + meta */}
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
                  <Chip label={profile.industry} size="small" sx={{ height: 20, fontSize: "0.67rem", fontWeight: 600, bgcolor: "rgba(13,148,136,0.08)", color: "#0D9488" }} />
                )}
                {(profile.size || profile.companySize) && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <GroupsOutlined sx={{ fontSize: 13, color: "#9CA3AF" }} />
                    <Typography sx={{ fontSize: "0.75rem", color: "#6B7280" }}>{profile.size || profile.companySize} employees</Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Edit / Save / Cancel */}
            <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
              {!isEditing ? (
                <Button size="small" startIcon={<EditOutlined sx={{ fontSize: 14 }} />} onClick={startEdit}
                  sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.78rem", color: "#0D9488", border: "1px solid #99F6E4", borderRadius: "9px", px: 2, bgcolor: "#F0FDFA", "&:hover": { bgcolor: "#CCFBF1" } }}>
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
                    sx={{ textTransform: "none", fontWeight: 700, fontSize: "0.78rem", bgcolor: "#0D9488", color: "#fff", borderRadius: "9px", px: 2, boxShadow: "none", "&:hover": { bgcolor: "#0F766E", boxShadow: "none" } }}>
                    {loading ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : "Save"}
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Box>

        {/* ══════ Tabs + forms ══════ */}
        <Box>
            {/* Tab bar */}
            <Box sx={{ borderBottom: "1px solid #F3F4F6", px: 3, display: "flex", alignItems: "center" }}>
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                sx={{
                  minHeight: 48,
                  "& .MuiTab-root": {
                    textTransform: "none", fontWeight: 600, fontSize: "0.82rem",
                    minHeight: 48, color: "#374151", px: 1.5, mr: 1,
                    borderRadius: "8px",
                  },
                  "& .Mui-selected": { color: "#0D9488" },
                  "& .MuiTabs-indicator": { bgcolor: "#0D9488", height: 2 },
                }}
              >
                <Tab label="Company Info" />
                <Tab label="Contact & Presence" />
              </Tabs>
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
                      placeholder="e.g. Technology, Finance..."
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
    </DashboardLayout>
  );
};

export default SettingsPage;
