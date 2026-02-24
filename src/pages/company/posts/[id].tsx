import React from "react";
import RoleGuard from "@/components/guards/RoleGuard";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";

const PostDetailsPage: React.FC = () => {
  return (
    <RoleGuard allowedRoles={["Company"]}>
      <DashboardLayout>
        <p>Here the post details page</p>
      </DashboardLayout>
    </RoleGuard>
  );
};

export default PostDetailsPage;