'use client';
import React, { useState } from "react";
import { useSelector } from "react-redux";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import SettingsProfileCard from "@/components/features/company/settings/SettingsProfileCard";
import CompanyInfoCard from "@/components/features/company/settings/CompanyInfoCard";
import ContactCard from "@/components/features/company/settings/ContactCard";
import { useCompanyProfileManagement } from "@/hooks/useCompanyProfileManagement";
import { selectEmployeePermissions } from "@/store/slices/memberSlice";

import { Box, Typography, Tabs, Tab } from "@mui/material";
import ProfileBanner from "@/components/features/company/settings/ProfileBanner";
import CompanyInfoTab from "@/components/features/company/settings/CompanyInfoTab";
import ContactTab from "@/components/features/company/settings/ContactTab";
import ApiKeysTab from "@/components/features/company/settings/ApiKeysTab";
import { TEAL } from "@/components/features/company/settings/settingsConstants";

type EditSection = "company" | "contact" | null;

const SettingsPage: React.FC = () => {
  useCompanyAccess("canViewCompanyProfile");
  const empPerms = useSelector(selectEmployeePermissions);
  const {
    profile, loading, uploadingImage, fieldErrors, isEmployee,
    handleInputChange, handleImageUpload, handleSaveProfile, setIsEditing,
  } = useCompanyProfileManagement();

  const canEdit = !isEmployee || !!empPerms?.canEditCompanyProfile;
  const readOnly = !canEdit;

  const [editSection, setEditSection] = useState<EditSection>(null);

  const startEdit  = (s: any) => { if (readOnly) return; setEditSection(s); setIsEditing(true); };
  const cancelEdit = () => { setEditSection(null); setIsEditing(false); };
  const saveEdit   = async () => { await handleSaveProfile(); setEditSection(null); };
  const [tab, setTab]           = useState(0);
  const [isEditing, setEditing] = useState(false);


  return (
    <DashboardLayout>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: "#111827" }}>Settings</Typography>
        <Typography sx={{ fontSize: "0.82rem", color: "#9CA3AF", mt: 0.25 }}>Manage your company profile and API keys</Typography>
      </Box>

      <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", overflow: "hidden" }}>
        <ProfileBanner
          profile={profile}
          loading={loading}
          uploadingImage={uploadingImage}
          isEditing={isEditing}
          onStartEdit={startEdit}
          onCancelEdit={cancelEdit}
          onSaveEdit={saveEdit}
          onImageUpload={handleImageUpload}
        />

        <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start", flexDirection: { xs: "column", md: "row" } }}>

          {/* Left: sticky profile card */}
          <Box sx={{ width: { xs: "100%", md: 240 }, flexShrink: 0, position: { md: "sticky" }, top: 24 }}>
            <SettingsProfileCard
              profile={profile}
              uploadingImage={uploadingImage}
              onImageUpload={handleImageUpload}
              readOnly={readOnly}
            />
          </Box>

          {/* Right: editable sections */}
          <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
            <CompanyInfoCard
              profile={profile}
              isEditing={editSection === "company"}
              loading={loading}
              fieldErrors={fieldErrors}
              onEdit={() => startEdit("company")}
              onCancel={cancelEdit}
              onSave={saveEdit}
              onInputChange={handleInputChange}
              readOnly={readOnly}
            />

            <ContactCard
              profile={profile}
              isEditing={editSection === "contact"}
              loading={loading}
              fieldErrors={fieldErrors}
              onEdit={() => startEdit("contact")}
              onCancel={cancelEdit}
              onSave={saveEdit}
              onInputChange={handleInputChange}
              readOnly={readOnly}
            />
          </Box>
          <Box sx={{ borderBottom: "1px solid #F3F4F6", px: 3 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{
              minHeight: 48,
              "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.82rem", minHeight: 48, color: "#374151", px: 1.5, mr: 1 },
              "& .Mui-selected": { color: TEAL },
              "& .MuiTabs-indicator": { bgcolor: TEAL, height: 2 },
            }}>
              <Tab label="Company Info" />
              <Tab label="Contact & Presence" data-tour="settings-tab-contact" />
              <Tab label="API Keys" data-tour="settings-tab-apikeys" />
            </Tabs>
          </Box>

          {tab === 0 && <CompanyInfoTab profile={profile} isEditing={isEditing} fieldErrors={fieldErrors} onInputChange={handleInputChange} />}
          {tab === 1 && <ContactTab    profile={profile} isEditing={isEditing} fieldErrors={fieldErrors} onInputChange={handleInputChange} />}
          {tab === 2 && <ApiKeysTab />}
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default SettingsPage;
