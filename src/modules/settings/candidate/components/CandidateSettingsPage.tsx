import React, { useState, useCallback, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/modules/shared/ui/shadcn/avatar";
import { useTranslation } from "react-i18next";
import { Menu } from "lucide-react";
import NotificationsTab from "./NotificationsTab";
import PersonalInformationTab from "./PersonalInformationTab";
import ProfileVisibilityTab from "./ProfileVisibilityTab";
import SnackbarNotifications from "./SnackbarNotifications";
import { useProfileManagement } from "../hooks";
import { useUpdateCandidateVisibility } from "../queries";
import { LanguageTab } from "@/modules/settings/shared";
import { User, Globe, Bell, Eye, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import CvSection from "./CvSection";
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle,
} from "@/modules/shared/ui/shadcn/drawer";

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
  const [drawerOpen,    setDrawerOpen]    = useState(false);

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

  const activeLabel = TABS.find(t => t.id === activeTab)?.label ?? "";

  // ── Shared sidebar content ─────────────────────────────────────────────────

  const SidebarContent = ({ onSelect }: { onSelect?: () => void }) => (
    <div className="flex flex-col gap-4">
      {/* Profile card */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="h-14 relative bg-gradient-to-br from-primary-dark to-primary overflow-hidden">
          <div className="absolute top-1/2 right-4 -translate-y-1/2 size-8 rounded-full bg-primary-foreground/10" />
          <div className="absolute -top-2 -left-2 size-12 rounded-full bg-primary/20" />
        </div>
        <div className="px-4 pb-4">
          <div className="-mt-6 mb-2">
            <Avatar className="size-[52px] border-2 border-card shadow-md">
              <AvatarImage src={avatarUrl} alt={displayName} className="object-cover" />
              <AvatarFallback className="rounded-full bg-primary text-primary-foreground text-lg font-bold">
                {initial}
              </AvatarFallback>
            </Avatar>
          </div>
          <p className="font-extrabold text-sm leading-tight text-foreground">{displayName}</p>
          {profile.email && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{profile.email}</p>
          )}
        </div>
      </div>

      {/* Nav */}
      <div className="bg-card rounded-2xl border border-border p-2.5 shadow-sm">
        <p className="text-[0.6rem] font-bold text-muted-foreground uppercase tracking-wide px-2 pb-2">
          {t("candidate_settings.tabs.settings_label")}
        </p>
        <div className="flex flex-col gap-0.5">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => { setActiveTab(id); onSelect?.(); }}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer border text-left transition-colors",
                  active
                    ? "bg-primary-light border-primary-border"
                    : "bg-transparent border-transparent hover:bg-muted hover:border-border",
                )}
              >
                <Icon size={15} className={active ? "text-primary-dark" : "text-muted-foreground"} />
                <span className={cn(
                  "text-xs",
                  active ? "font-bold text-primary-dark" : "font-medium text-foreground",
                )}>
                  {label}
                </span>
                {active && <span className="ml-auto size-1.5 rounded-full bg-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile top bar ──────────────────────────────────────────────── */}
      <div className="md:hidden flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3 shadow-sm">
        <Avatar className="size-8 border border-border shrink-0">
          <AvatarImage src={avatarUrl} alt={displayName} className="object-cover" />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
            {initial}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground truncate">{displayName}</p>
          <p className="text-[0.65rem] text-primary-dark font-semibold">{activeLabel}</p>
        </div>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex items-center justify-center size-8 rounded-lg bg-muted hover:bg-muted/80 transition-colors cursor-pointer"
        >
          <Menu size={16} className="text-foreground" />
        </button>
      </div>

      {/* ── Mobile drawer ───────────────────────────────────────────────── */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="w-[280px] p-0 flex flex-col">
          <DrawerHeader className="px-4 pt-4 pb-2">
            <DrawerTitle className="text-sm font-bold text-foreground">
              {t("candidate_settings.tabs.settings_label")}
            </DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-6">
            <SidebarContent onSelect={() => setDrawerOpen(false)} />
          </div>
        </DrawerContent>
      </Drawer>

      {/* ── Desktop layout ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-5 items-start">

        {/* LEFT: sticky sidebar — desktop only */}
        <div className="hidden md:flex flex-col gap-4 sticky top-4 max-h-[calc(100vh-96px)] overflow-y-auto custom-scrollbar">
          <SidebarContent />
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
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-4 md:px-6 py-4 border-b border-border">
                <p className="font-bold text-sm text-foreground">{t("candidate_settings.tabs.resumes")}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Upload your latest CV. It will be used for all new job applications.
                </p>
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
