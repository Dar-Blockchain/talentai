import React from "react";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import CreateAiPageContent from "@/modules/create-post-ai/components/CreateAiPageContent";
import { useCreatePostPage } from "@/modules/create-post-ai/hooks";

const CreateAiPage: React.FC = () => {
  const { postsUsed, postsLimit, atLimit } = useCreatePostPage();

  return (
    <DashboardLayout>
      <CreateAiPageContent postsUsed={postsUsed} postsLimit={postsLimit} atLimit={atLimit} />
    </DashboardLayout>
  );
};

export default CreateAiPage;
