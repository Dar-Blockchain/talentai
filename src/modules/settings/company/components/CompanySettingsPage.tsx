import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import PageHeader from "@/modules/shared/layouts/dashboard/PageHeader";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { useCompanyProfileManagement } from "../hooks";
import { selectEmployeePermissions } from "@/store/slices/memberSlice";
import ProfileBanner from "./ProfileBanner";
import CompanyInfoTab from "./CompanyInfoTab";
import ApiKeysTab from "./ApiKeysTab";
import { LanguageTab } from "@/modules/settings/shared";
import AppButton from "@/components/ui/AppButton";
import AppUserInfo from "@/modules/shared/ui/AppUserInfo";
import {
  Building2, MapPin, Key, CreditCard, Globe, Users, Tag,
} from "lucide-react";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";

const TEAL = "#0D9488";

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

  const handleTabChange = (v: number) => {
    if (isEditing) { setIsEditing(false); handleCancel(); }
    setTab(v);
  };

  const TABS = [
    { label: t("pages.settings.tabs.company_info"), icon: Building2 },
    { label: t("pages.settings.tabs.api_keys"),     icon: Key, dataTour: "settings-tab-apikeys" },
    { label: t("pages.settings.tabs.language"),     icon: Globe },
  ];

  return (
    <>
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
              startIcon={<CreditCard size={18} />}
              size="medium"
            />
          </Link>,
        ]}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { name: profile?.companyName || profile?.name || "—", subtitle: t("pages.settings.stats.company_name"), icon: <Building2 size={20} className="text-teal-600" />, iconBgColor: "#F0FDFA" },
          { name: profile?.industry || "—", subtitle: t("pages.settings.stats.industry"), icon: <Tag size={20} className="text-violet-600" />, iconBgColor: "#F5F3FF" },
          { name: profile?.country || profile?.location || "—", subtitle: t("pages.settings.stats.location"), icon: <MapPin size={20} className="text-cyan-600" />, iconBgColor: "#F0F9FF" },
          { name: profile?.companySize || profile?.size ? `${profile?.companySize || profile?.size} ${t("pages.settings.employees_suffix")}` : "—", subtitle: t("pages.settings.stats.team_size"), icon: <Users size={20} className="text-amber-600" />, iconBgColor: "#FFFBEB" },
        ].map((item) => (
          <div key={item.subtitle} className="bg-white border border-gray-100 rounded-xl px-4 py-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <AppUserInfo name={item.name} subtitle={item.subtitle} icon={item.icon} iconBgColor={item.iconBgColor} />
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
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

        <div className="border-b border-gray-100 px-6">
          <div className="flex gap-1 -mb-px">
            {TABS.map(({ label, icon: Icon, dataTour }, i) => {
              const active = tab === i;
              return (
                <button
                  key={label}
                  type="button"
                  data-tour={dataTour}
                  onClick={() => handleTabChange(i)}
                  className={`inline-flex items-center gap-1.5 px-3 py-3 text-[0.82rem] font-semibold border-b-2 transition-colors ${
                    active ? "border-teal-600 text-teal-600" : "border-transparent text-gray-700 hover:text-gray-900"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {tab === 0 && <CompanyInfoTab profile={profile} isEditing={isEditing} control={control} />}
        {tab === 1 && <ApiKeysTab />}
        {tab === 2 && <LanguageTab onInputChange={handleInputChange} onSaveLanguage={handleSaveLanguage} />}
      </div>
    </>
  );
};

export default CompanySettingsPage;
