import React from "react";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { PostsPageContent } from "@/modules/company/posts";

const PostsPage: React.FC = () => {
  useCompanyAccess("canViewJobPosts");
  return (
    <DashboardLayout>
      <PostsPageContent />
    </DashboardLayout>
  );
};

export default PostsPage;
