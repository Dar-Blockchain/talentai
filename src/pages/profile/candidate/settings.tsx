"use client";
import React, { useState, useCallback } from "react";
import { Box, Card, CardContent, Typography, Breadcrumbs, Link } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import axios from "axios";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Header from "@/components/layout/Header";
import ProfileSidebar from "@/components/features/profile/ProfileSidebar";
import NotificationsTab from "@/components/features/profile/NotificationsTab";
import PersonalInformationTab from "@/components/features/profile/PersonalInformationTab";
import ContactInformationTab from "@/components/features/profile/ContactInformationTab";
import ProfileVisibilityTab from "@/components/features/profile/ProfileVisibilityTab";
import SnackbarNotifications from "@/components/features/profile/SnackbarNotifications";
import { useProfileManagement } from "@/hooks/useProfileManagement";
import PageContainer from "@/components/layout/PageContainer";

const CandidateSettingsPage: React.FC = () => {
  const {
    activeTab,
    isEditing,
    profile,
    loading,
    error,
    uploadingImage,
    saveSuccess,
    userId,
    fieldErrors,
    setActiveTab,
    setIsEditing,
    handleInputChange,
    handleSelectChange,
    handleImageUpload,
    handleSaveProfile,
    handleDismissError,
    handleDismissSuccess,
  } = useProfileManagement();

  const { profile: reduxProfile, companyMembership } = useSelector(
    (state: RootState) => state.user.connectedUser
  );

  const hasMembership = !!companyMembership?._id;

  const [isPublicProfile, setIsPublicProfile] = useState(
    reduxProfile?.isPublicProfile || false
  );

  // Update local state when redux profile changes
  React.useEffect(() => {
    if (reduxProfile?.isPublicProfile !== undefined) {
      setIsPublicProfile(reduxProfile.isPublicProfile);
    }
  }, [reduxProfile?.isPublicProfile]);

  // Handle visibility toggle
  const handleToggleVisibility = useCallback(async (newVisibility: boolean) => {
    try {
      const token = localStorage.getItem("api_token");
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/updateProfileVisibility`,
        { isPublicProfile: newVisibility },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setIsPublicProfile(newVisibility);
      } else {
        throw new Error(response.data.message || "Failed to update visibility");
      }
    } catch (err: any) {
      console.error("Error updating visibility:", err);
      throw new Error(
        err.response?.data?.message || "Failed to update profile visibility"
      );
    }
  }, []);

  return (
    <PageContainer>
      <Header />

      {/* Breadcrumbs Navigation */}
      <Box sx={{ mb: 2 }}>
        <Breadcrumbs
          separator={<NavigateNextIcon sx={{ fontSize: 14 }} />}
          aria-label="breadcrumb"
          sx={{ fontSize: '0.875rem' }}
        >
          <Link
            underline="hover"
            color="inherit"
            href="/dashboard/candidate"
            sx={{
              cursor: 'pointer',
              fontSize: '0.875rem',
              '&:hover': {
                color: '#8310FF',
              },
            }}
          >
            Dashboard
          </Link>
          <Typography sx={{ fontSize: '0.875rem', color: 'text.primary' }}>
            Settings
          </Typography>
        </Breadcrumbs>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 3,
          flexDirection: { xs: "column", md: "row" },
          alignItems: "stretch",
        }}
      >
        <ProfileSidebar
          activeTab={activeTab}
          profileType="Candidate"
          onTabChange={(tab) => setActiveTab(tab)}
          userId={userId}
        />

        <Box sx={{ flex: 1 }}>
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
              onCancel={() => setIsEditing(false)}
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
              onCancel={() => setIsEditing(false)}
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

          {activeTab !== "personal" &&
            activeTab !== "contact" &&
            activeTab !== "notifications" &&
            activeTab !== "visibility" && (
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  mb: 3,
                }}
              >
                <CardContent sx={{ p: 6, textAlign: "center" }}>
                  <Typography variant="h6" sx={{ color: "#6b7280", mb: 2 }}>
                    {activeTab.charAt(0).toUpperCase() +
                      activeTab.slice(1).replace(/([A-Z])/g, " $1")}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#9ca3af" }}>
                    This section is coming soon...
                  </Typography>
                </CardContent>
              </Card>
            )}
        </Box>
      </Box>

      <SnackbarNotifications
        error={error || null}
        saveSuccess={saveSuccess}
        onDismissError={handleDismissError}
        onDismissSuccess={handleDismissSuccess}
      />
    </PageContainer>
  );
};

export default CandidateSettingsPage;
