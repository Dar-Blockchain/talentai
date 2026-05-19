import React, { useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import { useDispatch } from "react-redux";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { AppDispatch } from "@/store/store";
import { resetManualPost } from "@/store/slices/manualPostSlice";
import { resetFlow, resetSavePost } from "@/store/slices/postSlice";
import { usePostLimitCheck } from "@/hooks/usePostLimitCheck";
import CreatePipelinePageContent from "@/modules/create-post-pipeline/components/CreatePipelinePageContent";

const CreatePipelinePage: React.FC = () => {
  useCompanyAccess("canCreateJobPosts");
  const dispatch = useDispatch<AppDispatch>();
  const { postsUsed, postsLimit, atLimit } = usePostLimitCheck();

  useEffect(() => {
    return () => {
      dispatch(resetManualPost());
      dispatch(resetFlow());
      dispatch(resetSavePost());
    };
  }, [dispatch]);

  return (
    <DashboardLayout>
      <CreatePipelinePageContent postsUsed={postsUsed} postsLimit={postsLimit} atLimit={atLimit} />
    </DashboardLayout>
  );
};

export default CreatePipelinePage;
