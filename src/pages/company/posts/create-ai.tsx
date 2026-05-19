import React, { useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import { useDispatch } from "react-redux";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { AppDispatch } from "@/store/store";
import { clearPost } from "@/store/slices/postGenerationSlice";
import { resetSavePost } from "@/store/slices/postSlice";
import { usePostLimitCheck } from "@/hooks/usePostLimitCheck";
import CreateAiPageContent from "@/modules/create-post-ai/components/CreateAiPageContent";

const CreateAiPage: React.FC = () => {
  useCompanyAccess("canCreateJobPosts");
  const dispatch = useDispatch<AppDispatch>();
  const { postsUsed, postsLimit, atLimit } = usePostLimitCheck();

  useEffect(() => {
    return () => {
      dispatch(clearPost());
      dispatch(resetSavePost());
    };
  }, [dispatch]);

  return (
    <DashboardLayout>
      <CreateAiPageContent postsUsed={postsUsed} postsLimit={postsLimit} atLimit={atLimit} />
    </DashboardLayout>
  );
};

export default CreateAiPage;
