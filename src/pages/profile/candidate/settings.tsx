"use client";
import React, { useState, useCallback, useEffect } from "react";
import { Box, Typography, Avatar, Divider } from "@mui/material";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { RootState } from "@/store/store";
import axios from "axios";
import Header from "@/components/layout/dashboard/Header";
import NotificationsTab from "@/components/features/profile/NotificationsTab";
import PersonalInformationTab from "@/components/features/profile/PersonalInformationTab";
import ContactInformationTab from "@/components/features/profile/ContactInformationTab";
import ProfileVisibilityTab from "@/components/features/profile/ProfileVisibilityTab";
import SnackbarNotifications from "@/components/features/profile/SnackbarNotifications";
import { useProfileManagement } from "@/hooks/useProfileManagement";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import ContactMailOutlined from "@mui/icons-material/ContactMailOutlined";
import NotificationsOutlined from "@mui/icons-material/NotificationsOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";

const T    = "#0D9488";
const TL   = "#14B8A6";
const TBG  = "#F0FDFA";
const TBRD = "#99F6E4";
const NAVY = "#0D1B2A";

const TAB_IDS = [
  { id: "personal",      key: "personal",      icon: PersonOutlined },
  { id: "contact",       key: "contact",        icon: ContactMailOutlined },
  { id: "notifications", key: "notifications",  icon: NotificationsOutlined },
  { id: "visibility",    key: "visibility",     icon: VisibilityOutlined },
];

const CandidateSettingsPage: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const router = useRouter();

  const TABS = TAB_IDS.map(tab => ({
    ...tab,
    label: t(`candidate_settings.tabs.${tab.key}`),
  }));
  const {
    activeTab, isEditing, profile, loading, error,
    uploadingImage, saveSuccess, userId, fieldErrors,
    setActiveTab, setIsEditing,
    handleInputChange, handleSelectChange, handleImageUpload,
    handleSaveProfile, handleCancel, handleDismissError, handleDismissSuccess,
  } = useProfileManagement();

  const { profile: reduxProfile, companyMembership } = useSelector((state: RootState) => state.user.connectedUser);
  const user = useSelector((state: RootState) => state.user.connectedUser.user);
  const hasMembership = !!companyMembership?._id;

  const [isPublicProfile, setIsPublicProfile] = useState(reduxProfile?.isPublicProfile || false);

  React.useEffect(() => {
    if (reduxProfile?.isPublicProfile !== undefined) setIsPublicProfile(reduxProfile.isPublicProfile);
  }, [reduxProfile?.isPublicProfile]);

  useEffect(() => {
    const tab = router.query.tab as string;
    if (tab && TABS.some(t => t.id === tab)) setActiveTab(tab);
  }, [router.query.tab]);

  const handleToggleVisibility = useCallback(async (newVisibility: boolean) => {
    try {
      const token = localStorage.getItem("api_token");
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/updateProfileVisibility`,
        { isPublicProfile: newVisibility },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) setIsPublicProfile(newVisibility);
      else throw new Error(res.data.message || "Failed");
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Failed to update profile visibility");
    }
  }, []);

  const displayName = reduxProfile?.firstName
    ? `${reduxProfile.firstName}${reduxProfile.lastName ? ` ${reduxProfile.lastName}` : ""}`
    : user?.username || "Candidate";
  const initial  = displayName[0]?.toUpperCase() || "C";
  const avatarUrl = reduxProfile?.user_image
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Users/${reduxProfile.user_image}`
    : undefined;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", bgcolor: "rgb(249 250 251)" }}>
      <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1200 }}>
        <Header onOpenMobile={() => {}} />
      </Box>

      <Box sx={{ flex: 1, mt: "64px", overflowY: "auto", overflowX: "hidden", p: { xs: 1.5, sm: 2.5, md: 3 } }} className="custom-scrollbar">
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "220px 1fr" }, gap: 2.5, alignItems: "start" }}>

          {/* ── LEFT: Profile + Nav ── */}
          <Box sx={{ display: { xs: "none", md: "flex" }, flexDirection: "column", gap: 2, position: "sticky", top: 16 }}>

            {/* Profile card */}
            <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <Box sx={{ height: 56, background: `linear-gradient(135deg, ${NAVY} 0%, ${T} 100%)`, position: "relative" }}>
                <Box sx={{ position: "absolute", top: "50%", right: 16, transform: "translateY(-50%)", width: 32, height: 32, borderRadius: "50%", bgcolor: `${TL}30`, border: `1px solid ${TL}40` }} />
              </Box>
              <Box sx={{ px: 2, pb: 2 }}>
                <Box sx={{ mt: -3, mb: 1 }}>
                  <Avatar src={avatarUrl} sx={{ width: 52, height: 52, bgcolor: T, fontSize: "1.2rem", fontWeight: 700, border: "2.5px solid #fff", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
                    {initial}
                  </Avatar>
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", color: NAVY, lineHeight: 1.2 }}>{displayName}</Typography>
                {user?.email && <Typography sx={{ fontSize: "0.72rem", color: "#9CA3AF", mt: 0.25 }}>{user.email}</Typography>}
              </Box>
            </Box>

            {/* Tab nav */}
            <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", p: 1.25, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", px: 1, pb: 1 }}>{t("candidate_settings.tabs.settings_label")}</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {TABS.map(({ id, label, icon: Icon }) => {
                  const active = activeTab === id;
                  return (
                    <Box
                      key={id}
                      onClick={() => setActiveTab(id)}
                      sx={{
                        display: "flex", alignItems: "center", gap: 1.25,
                        px: 1.5, py: 1, borderRadius: "10px", cursor: "pointer",
                        bgcolor: active ? TBG : "transparent",
                        border: `1px solid ${active ? TBRD : "transparent"}`,
                        transition: "all 0.15s",
                        "&:hover": { bgcolor: active ? TBG : "#F8FAFC", borderColor: active ? TBRD : "#E5E7EB" },
                      }}
                    >
                      <Icon sx={{ fontSize: 16, color: active ? T : "#6B7280" }} />
                      <Typography sx={{ fontSize: "0.82rem", fontWeight: active ? 700 : 500, color: active ? T : "#374151" }}>{label}</Typography>
                      {active && <Box sx={{ ml: "auto", width: 6, height: 6, borderRadius: "50%", bgcolor: T }} />}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>

          {/* ── RIGHT: Tab content ── */}
          <Box>
            {activeTab === "personal" && (
              <PersonalInformationTab
                profile={profile}
                isEditing={isEditing}
                loading={loading}
                saveSuccess={saveSuccess}
                error={error || null}
                uploadingImage={uploadingImage}
                onInputChange={handleInputChange}
                onSelectChange={handleSelectChange}
                onImageUpload={handleImageUpload}
                onSave={handleSaveProfile}
                onCancel={handleCancel}
                onEditToggle={() => setIsEditing(!isEditing)}
              />
            )}
            {activeTab === "contact" && (
              <ContactInformationTab
                profile={profile}
                isEditing={isEditing}
                loading={loading}
                fieldErrors={fieldErrors}
                onInputChange={handleInputChange}
                onSave={handleSaveProfile}
                onCancel={handleCancel}
                onEditToggle={() => setIsEditing(!isEditing)}
              />
            )}
            {activeTab === "notifications" && <NotificationsTab />}
            {activeTab === "visibility" && (
              <ProfileVisibilityTab
                userId={userId}
                isPublicProfile={isPublicProfile}
                onToggleVisibility={handleToggleVisibility}
                hasMembership={hasMembership}
              />
            )}
          </Box>

        </Box>
      </Box>

      <SnackbarNotifications
        error={error || null}
        saveSuccess={saveSuccess}
        onDismissError={handleDismissError}
        onDismissSuccess={handleDismissSuccess}
      />
    </Box>
  );
};

export default CandidateSettingsPage;
