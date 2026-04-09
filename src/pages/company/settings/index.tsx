import React, { useState } from "react";
import { Box } from "@mui/material";
import { useSelector } from "react-redux";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import PageHeader from "@/components/layout/dashboard/PageHeader";
import SettingsProfileCard from "@/components/features/company/settings/SettingsProfileCard";
import CompanyInfoCard from "@/components/features/company/settings/CompanyInfoCard";
import ContactCard from "@/components/features/company/settings/ContactCard";
import { useCompanyProfileManagement } from "@/hooks/useCompanyProfileManagement";
import { selectEmployeePermissions } from "@/store/slices/memberSlice";

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

  const startEdit  = (s: "company" | "contact") => { if (readOnly) return; setEditSection(s); setIsEditing(true); };
  const cancelEdit = () => { setEditSection(null); setIsEditing(false); };
  const saveEdit   = async () => { await handleSaveProfile(); setEditSection(null); };

  return (
      <DashboardLayout>
        <PageHeader
          title="Settings"
          subtitle="Manage your company profile and contact details."
          breadcrumbs={[
            { label: "Dashboard", href: "/company/dashboard" },
            { label: "Settings" },
          ]}
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

        </Box>
      </DashboardLayout>
  );
};

export default SettingsPage;
