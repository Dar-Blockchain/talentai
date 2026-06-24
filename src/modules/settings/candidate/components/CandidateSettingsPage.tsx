import React, { useState, useCallback, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/modules/shared/ui/shadcn/avatar";
import { useTranslation } from "react-i18next";
import NotificationsTab from "./NotificationsTab";
import PersonalInformationTab from "./PersonalInformationTab";
import ProfileVisibilityTab from "./ProfileVisibilityTab";
import SnackbarNotifications from "./SnackbarNotifications";
import { useProfileManagement } from "../hooks";
import { useUpdateCandidateVisibility } from "../queries";
import { LanguageTab } from "@/modules/settings/shared";
import { User, Globe, Bell, Eye, FileText } from "lucide-react";
import CvSection from "./CvSection";

const NAVY = "#0D1B2A";

const TAB_IDS = [
  { id: "personal",      key: "personal",      icon: User },
  { id: "resumes",       key: "resumes",       icon: FileText },
  { id: "language",      key: "language",      icon: Globe },
  { id: "notifications", key: "notifications", icon: Bell },
  { id: "visibility",    key: "visibility",    icon: Eye },
];

const CandidateSettingsPage: React.FC = () => {
  const { t } = useTranslation("dashboard");

  const TABS = TAB_IDS.map(tab => ({
    ...tab,
    label: t(`candidate_settings.tabs.${tab.key}`),
  }));

  const {
    activeTab, isEditing, profile, loading, error,
    uploadingImage, saveSuccess, userId,
    companyMembership, isPublicProfile,
    control, formErrors,
    setActiveTab, setIsEditing,
    handleInputChange, handleImageUpload, handleCvUpdated, handleCvDeleted,
    handleSaveProfile, handleSaveLanguage, handleCancel, handleDismissError, handleDismissSuccess,
  } = useProfileManagement();

  const hasMembership = !!companyMembership?._id;

  const updateVisibilityMutation = useUpdateCandidateVisibility();
  const [localIsPublic, setLocalIsPublic] = useState(isPublicProfile);

  useEffect(() => { setLocalIsPublic(isPublicProfile); }, [isPublicProfile]);

  const handleToggleVisibility = useCallback(async (newVisibility: boolean) => {
    setLocalIsPublic(newVisibility);
    await updateVisibilityMutation.mutateAsync({ userId, isPublicProfile: newVisibility });
  }, [updateVisibilityMutation, userId]);

  const displayName = profile.firstName
    ? `${profile.firstName}${profile.lastName ? ` ${profile.lastName}` : ""}`
    : profile.username || "Candidate";
  const initial   = displayName[0]?.toUpperCase() || "C";
  const avatarUrl = profile.avatar || undefined;

  return (
    <>
      <div className="grid grid-cols-[180px_1fr] md:grid-cols-[240px_1fr] gap-[20px] items-start">

        {/* LEFT: Profile + Nav */}
        <div className="flex flex-col gap-4 sticky top-4 max-h-[calc(100vh-96px)] overflow-y-auto custom-scrollbar">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <div
              className="h-14 relative"
              style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #0D9488 100%)` }}
            >
              <div className="absolute top-1/2 right-4 -translate-y-1/2 w-8 h-8 rounded-full bg-teal-600/20 border border-teal-600/30" />
            </div>
            <div className="px-4 pb-4">
              <div className="-mt-6 mb-2">
                <Avatar className="w-[52px] h-[52px] rounded-full border-[2.5px] border-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
                  <AvatarImage src={avatarUrl} alt={displayName} className="object-cover" />
                  <AvatarFallback className="rounded-full bg-teal-600 text-white text-[1.2rem] font-bold">
                    {initial}
                  </AvatarFallback>
                </Avatar>
              </div>
              <p className="font-extrabold text-[0.95rem] leading-tight" style={{ color: NAVY }}>{displayName}</p>
              {profile.email && <p className="text-[0.72rem] text-gray-400 mt-1">{profile.email}</p>}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-[10px] shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <p className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-wide px-2 pb-2">{t("candidate_settings.tabs.settings_label")}</p>
            <div className="flex flex-col gap-1">
              {TABS.map(({ id, label, icon: Icon }) => {
                const active = activeTab === id;
                return (
                  <div
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-[10px] cursor-pointer border transition-colors ${
                      active
                        ? "bg-teal-50 border-teal-200"
                        : "bg-transparent border-transparent hover:bg-gray-50 hover:border-gray-200"
                    }`}
                  >
                    <Icon size={16} className={active ? "text-teal-600" : "text-gray-500"} />
                    <span className={`text-[0.82rem] ${active ? "font-bold text-teal-600" : "font-medium text-gray-700"}`}>{label}</span>
                    {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-600" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: Tab content */}
        <div>
          {activeTab === "personal" && (
            <PersonalInformationTab
              profile={profile}
              control={control}
              formErrors={formErrors}
              isEditing={isEditing}
              loading={loading}
              saveSuccess={saveSuccess}
              error={error || null}
              uploadingImage={uploadingImage}
              onImageUpload={handleImageUpload}
              onSave={handleSaveProfile}
              onCancel={handleCancel}
              onEditToggle={() => setIsEditing(!isEditing)}
              onCvUpdated={handleCvUpdated}
              onCvDeleted={handleCvDeleted}
            />
          )}
          {activeTab === "resumes" && (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="px-4 md:px-6 py-4 border-b border-gray-100">
                <p className="font-bold text-[0.95rem] text-gray-900">{t("candidate_settings.tabs.resumes")}</p>
                <p className="text-[0.78rem] text-gray-400 mt-1">Upload your latest CV. It will be used for all new job applications.</p>
              </div>
              <div className="p-4 md:p-6">
                <CvSection
                  resumeFilename={profile.resume}
                  onUpdated={handleCvUpdated}
                  onDeleted={handleCvDeleted}
                />
              </div>
            </div>
          )}
          {activeTab === "language" && (
            <LanguageTab
              onInputChange={(key, value) => handleInputChange(key as keyof typeof profile, value)}
              onSaveLanguage={handleSaveLanguage}
              showGenerateLanguage={false}
              centerInterfaceVertically={true}
            />
          )}
          {activeTab === "notifications" && <NotificationsTab />}
          {activeTab === "visibility" && (
            <ProfileVisibilityTab
              userId={userId}
              effectiveIsPublicProfile={localIsPublic}
              onToggleVisibility={handleToggleVisibility}
              hasMembership={hasMembership}
            />
          )}
        </div>
      </div>

      <SnackbarNotifications
        error={error || null}
        saveSuccess={saveSuccess}
        onDismissError={handleDismissError}
        onDismissSuccess={handleDismissSuccess}
      />
    </>
  );
};

export default CandidateSettingsPage;
