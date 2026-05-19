import React, { useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import { useDispatch, useSelector } from "react-redux";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { AppDispatch } from "@/store/store";
import { clearPost } from "@/store/slices/postGenerationSlice";
import { resetSavePost } from "@/store/slices/postSlice";
import { fetchCombinedSubscriptionDetails, selectCombinedDetails } from "@/store/slices/paymentSlice";
import { CreatePostPageContent } from "@/modules/create-post";

const CreatePostPage: React.FC = () => {
  useCompanyAccess("canCreateJobPosts");
  const dispatch = useDispatch<AppDispatch>();
  const combined = useSelector(selectCombinedDetails);

  const postsUsed  = combined?.combined.usage.posts.used ?? 0;
  const postsLimit = combined?.combined.usage.posts.limit ?? Infinity;
  const atLimit    = !!(combined && postsLimit !== Infinity && postsLimit !== -1 && postsUsed >= postsLimit);

  useEffect(() => {
    dispatch(fetchCombinedSubscriptionDetails());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearPost());
      dispatch(resetSavePost());
    };
  }, []);

  return (
    <DashboardLayout>
      <CreatePostPageContent
        postsUsed={postsUsed}
        postsLimit={postsLimit}
        atLimit={atLimit}
      />
    </DashboardLayout>
  );
};

export default CreatePostPage;
