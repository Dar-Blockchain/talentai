"use client";
import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import Header from "@/components/layout/Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import PersonalInformationTab from "@/components/profile/PersonalInformationTab";
import ContactInformationTab from "@/components/profile/ContactInformationTab";
import TeamMembersTab from "@/components/profile/TeamMembersTab";
import SnackbarNotifications from "@/components/profile/SnackbarNotifications";
import { useCompanyProfileManagement } from "@/hooks/useCompanyProfileManagement";
import PageContainer from "@/components/layout/PageContainer";

const CompanySettingsPage: React.FC = () => {
  const {
    activeTab,
    isEditing,
    profile,
    loading,
    error,
    uploadingImage,
    saveSuccess,
    userId,
    setActiveTab,
    setIsEditing,
    handleInputChange,
    handleSelectChange,
    handleImageUpload,
    handleSaveProfile,
    handleDismissError,
    handleDismissSuccess,
  } = useCompanyProfileManagement();

  return (
    <PageContainer>
      <Header />

      <Box
        sx={{
          display: "flex",
          gap: 3,
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        <ProfileSidebar
          activeTab={activeTab}
          profileType="Company"
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
              onInputChange={handleInputChange}
              onSave={handleSaveProfile}
              onCancel={() => setIsEditing(false)}
              onEditToggle={() => setIsEditing(!isEditing)}
            />
          )}

          {activeTab === "team" && <TeamMembersTab />}

          {activeTab !== "personal" &&
            activeTab !== "contact" &&
            activeTab !== "team" && (
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

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </PageContainer>
  );
};

export default CompanySettingsPage;
