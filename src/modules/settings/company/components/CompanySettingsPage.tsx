import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import DashboardLayout from "@/modules/shared/layouts/dashboard/DashboardLayout";
import PageHeader from "@/modules/shared/layouts/dashboard/PageHeader";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { useCompanyProfileManagement } from "../hooks";
import { selectEmployeePermissions } from "@/store/slices/memberSlice";
import { Box, Tabs, Tab } from "@mui/material";
import ProfileBanner from "./ProfileBanner";
import CompanyInfoTab from "./CompanyInfoTab";
import ApiKeysTab from "./ApiKeysTab";
import { LanguageTab, TEAL } from "@/modules/settings/shared";
import AppButton from "@/components/ui/AppButton";
import AppUserInfo from "@/modules/shared/ui/AppUserInfo";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import KeyOutlined from "@mui/icons-material/KeyOutlined";
import CreditCardOutlined from "@mui/icons-material/CreditCardOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import LanguageIcon from "@mui/icons-material/Language";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import CategoryOutlined from "@mui/icons-material/CategoryOutlined";

const CompanySettingsPage: React.FC = () => {
  const { t } = useTranslation("dashboard");
  useCompanyAccess("canViewCompanyProfile");
  const empPerms = useSelector(selectEmployeePermissions);
  const {
    profile, loading, uploadingImage, isEmployee, isEditing, control,
    handleInputChange, handleImageUpload, handleSaveProfile, handleSaveLanguage, handleCancel,
    setIsEditing,
  } = useCompanyProfileManagement();

  const canEdit = !isEmployee || !!empPerms?.canEditCompanyProfile;
  const [tab, setTab] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, v: number) => {
    if (isEditing) { setIsEditing(false); handleCancel(); }
    setTab(v);
  };

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

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
        {[
          { name: profile?.companyName || profile?.name || "—", subtitle: t("pages.settings.stats.company_name"), icon: <BusinessOutlined sx={{ fontSize: 20, color: "#0D9488" }} />, iconBgColor: "#F0FDFA" },
          { name: profile?.industry || "—", subtitle: t("pages.settings.stats.industry"), icon: <CategoryOutlined sx={{ fontSize: 20, color: "#7C3AED" }} />, iconBgColor: "#F5F3FF" },
          { name: profile?.country || profile?.location || "—", subtitle: t("pages.settings.stats.location"), icon: <LocationOnOutlined sx={{ fontSize: 20, color: "#0891B2" }} />, iconBgColor: "#F0F9FF" },
          { name: profile?.companySize || profile?.size ? `${profile?.companySize || profile?.size} ${t("pages.settings.employees_suffix")}` : "—", subtitle: t("pages.settings.stats.team_size"), icon: <GroupsOutlined sx={{ fontSize: 20, color: "#D97706" }} />, iconBgColor: "#FFFBEB" },
        ].map((item) => (
          <Box key={item.subtitle} sx={{ bgcolor: "#fff", border: "1px solid #F3F4F6", borderRadius: 2.5, px: 2, py: 1.75, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <AppUserInfo name={item.name} subtitle={item.subtitle} icon={item.icon} iconBgColor={item.iconBgColor} />
          </Box>
        ))}
      </Box>

      <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", overflow: "hidden" }}>
        <ProfileBanner
          profile={profile}
          loading={loading}
          uploadingImage={uploadingImage}
          isEditing={isEditing}
          showEditActions={tab === 0 && canEdit}
          onStartEdit={() => setIsEditing(true)}
          onCancelEdit={() => { setIsEditing(false); handleCancel(); }}
          onSaveEdit={async () => { const ok = await handleSaveProfile(); if (ok) setIsEditing(false); }}
          onImageUpload={handleImageUpload}
        />

        <Box sx={{ borderBottom: "1px solid #F3F4F6", px: 3 }}>
          <Tabs
            value={tab}
            onChange={handleTabChange}
            sx={{
              minHeight: 48,
              "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.82rem", minHeight: 48, color: "#374151", px: 1.5, mr: 1 },
              "& .Mui-selected": { color: TEAL },
              "& .MuiTabs-indicator": { bgcolor: TEAL, height: 2 },
            }}
          >
            <Tab label={t("pages.settings.tabs.company_info")} icon={<BusinessOutlined sx={{ fontSize: 15 }} />} iconPosition="start" />
            <Tab label={t("pages.settings.tabs.api_keys")}     icon={<KeyOutlined      sx={{ fontSize: 15 }} />} iconPosition="start" data-tour="settings-tab-apikeys" />
            <Tab label={t("pages.settings.tabs.language")}     icon={<LanguageIcon     sx={{ fontSize: 15 }} />} iconPosition="start" />
          </Tabs>
        </Box>

        {tab === 0 && <CompanyInfoTab profile={profile} isEditing={isEditing} control={control} />}
        {tab === 1 && <ApiKeysTab />}
        {tab === 2 && <LanguageTab onInputChange={handleInputChange} onSaveLanguage={handleSaveLanguage} />}
      </Box>
    </DashboardLayout>
  );
};

export default CompanySettingsPage;
