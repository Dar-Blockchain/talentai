'use client';
import React, { useState } from "react";
import { useSelector } from "react-redux";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { useCompanyProfileManagement } from "@/hooks/useCompanyProfileManagement";
import { selectEmployeePermissions } from "@/store/slices/memberSlice";
import { Box, Tabs, Tab } from "@mui/material";
import ProfileBanner from "@/components/features/company/settings/ProfileBanner";
import CompanyInfoTab from "@/components/features/company/settings/CompanyInfoTab";
import ContactTab from "@/components/features/company/settings/ContactTab";
import ApiKeysTab from "@/components/features/company/settings/ApiKeysTab";
import { TEAL } from "@/components/features/company/settings/settingsConstants";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import KeyOutlined from "@mui/icons-material/KeyOutlined";

const SettingsPage: React.FC = () => {
  useCompanyAccess("canViewCompanyProfile");
  const empPerms = useSelector(selectEmployeePermissions);
  const {
    profile, loading, uploadingImage, fieldErrors, isEmployee,
    handleInputChange, handleImageUpload, handleSaveProfile, handleCancel,
  } = useCompanyProfileManagement();

  const canEdit = !isEmployee || !!empPerms?.canEditCompanyProfile;
  const [isEditing, setEditing] = useState(false);
  const [tab, setTab] = useState(0);

  return (
    <DashboardLayout>

      {/* Main settings card */}
      <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", overflow: "hidden" }}>
        <ProfileBanner
          profile={profile}
          loading={loading}
          uploadingImage={uploadingImage}
          isEditing={isEditing}
          onStartEdit={() => { if (canEdit) setEditing(true); }}
          onCancelEdit={() => { setEditing(false); handleCancel(); }}
          onSaveEdit={async () => { await handleSaveProfile(); setEditing(false); }}
          onImageUpload={handleImageUpload}
        />

        <Box sx={{ borderBottom: "1px solid #F3F4F6", px: 3 }}>
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
            <Tab label="Company Info"       icon={<BusinessOutlined    sx={{ fontSize: 15 }} />} iconPosition="start" />
            <Tab label="Contact & Presence" icon={<LocationOnOutlined  sx={{ fontSize: 15 }} />} iconPosition="start" data-tour="settings-tab-contact" />
            <Tab label="API Keys"           icon={<KeyOutlined         sx={{ fontSize: 15 }} />} iconPosition="start" data-tour="settings-tab-apikeys" />
          </Tabs>
        </Box>

        {tab === 0 && <CompanyInfoTab profile={profile} isEditing={isEditing} fieldErrors={fieldErrors} onInputChange={handleInputChange} />}
        {tab === 1 && <ContactTab     profile={profile} isEditing={isEditing} fieldErrors={fieldErrors} onInputChange={handleInputChange} />}
        {tab === 2 && <ApiKeysTab />}
      </Box>
    </DashboardLayout>
  );
};

export default SettingsPage;
