'use client';
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import PageHeader from "@/components/layout/dashboard/PageHeader";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { useCompanyProfileManagement } from "@/hooks/useCompanyProfileManagement";
import { selectEmployeePermissions } from "@/store/slices/memberSlice";
import { Box, Tabs, Tab } from "@mui/material";
import ProfileBanner from "@/components/features/company/settings/ProfileBanner";
import CompanyInfoTab from "@/components/features/company/settings/CompanyInfoTab";
import ContactTab from "@/components/features/company/settings/ContactTab";
import ApiKeysTab from "@/components/features/company/settings/ApiKeysTab";
import LanguageTab from "@/components/features/company/settings/LanguageTab";
import { TEAL } from "@/components/features/company/settings/settingsConstants";
import AppButton from "@/components/ui/AppButton";
import StatCard from "@/components/ui/StatCard";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import KeyOutlined from "@mui/icons-material/KeyOutlined"; // used in Tabs
import CreditCardOutlined from "@mui/icons-material/CreditCardOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import LanguageIcon from "@mui/icons-material/Language";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import CategoryOutlined from "@mui/icons-material/CategoryOutlined";

const SettingsPage: React.FC = () => {
  const { t } = useTranslation("dashboard");
  useCompanyAccess("canViewCompanyProfile");
  const empPerms = useSelector(selectEmployeePermissions);
  const {
    profile, loading, uploadingImage, fieldErrors, isEmployee,
    handleInputChange, handleImageUpload, handleSaveProfile, handleSaveLanguage, handleCancel,
  } = useCompanyProfileManagement();

  const canEdit = !isEmployee || !!empPerms?.canEditCompanyProfile;
  const [isEditing, setEditing] = useState(false);
  const [tab, setTab] = useState(0);

  return (
    <DashboardLayout>
      <PageHeader
        title={t("pages.settings.title")}
        subtitle={t("pages.settings.subtitle")}
        breadcrumbs={[
          { label: t("pages.common.dashboard"), href: "/company/dashboard" },
          { label: t("pages.settings.title") },
        ]}
        icon={SettingsOutlined}
        actions={[
          <Link key="plans" href="/company/plans">
            <AppButton
              label={t("pages.settings.view_plans")}
              variant="outlined"
              startIcon={<CreditCardOutlined />}
              size="medium"
            />
          </Link>,
        ]}
      />

      {/* Stats grid */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
        <StatCard
          icon={<BusinessOutlined />}
          label={t("pages.settings.stats.company_name")}
          value={profile?.companyName || profile?.name || "—"}
          color="#0D9488"
        />
        <StatCard
          icon={<CategoryOutlined />}
          label={t("pages.settings.stats.industry")}
          value={profile?.industry || "—"}
          color="#7C3AED"
        />
        <StatCard
          icon={<LocationOnOutlined />}
          label={t("pages.settings.stats.location")}
          value={profile?.country || profile?.location || "—"}
          color="#0891B2"
        />
        <StatCard
          icon={<GroupsOutlined />}
          label={t("pages.settings.stats.team_size")}
          value={profile?.companySize || profile?.size ? `${profile?.companySize || profile?.size} ${t("pages.settings.employees_suffix")}` : "—"}
          color="#D97706"
        />
      </Box>

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
            <Tab label={t("pages.settings.tabs.company_info")} icon={<BusinessOutlined    sx={{ fontSize: 15 }} />} iconPosition="start" />
            <Tab label={t("pages.settings.tabs.contact")}      icon={<LocationOnOutlined  sx={{ fontSize: 15 }} />} iconPosition="start" data-tour="settings-tab-contact" />
            <Tab label={t("pages.settings.tabs.api_keys")}     icon={<KeyOutlined         sx={{ fontSize: 15 }} />} iconPosition="start" data-tour="settings-tab-apikeys" />
            <Tab label={t("pages.settings.tabs.language")}     icon={<LanguageIcon        sx={{ fontSize: 15 }} />} iconPosition="start" />
          </Tabs>
        </Box>

        {tab === 0 && <CompanyInfoTab profile={profile} isEditing={isEditing} fieldErrors={fieldErrors} onInputChange={handleInputChange} />}
        {tab === 1 && <ContactTab     profile={profile} isEditing={isEditing} fieldErrors={fieldErrors} onInputChange={handleInputChange} />}
        {tab === 2 && <ApiKeysTab />}
        {tab === 3 && <LanguageTab onInputChange={handleInputChange} onSaveLanguage={handleSaveLanguage} />}
      </Box>
    </DashboardLayout>
  );
};

export default SettingsPage;
