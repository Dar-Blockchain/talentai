import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import { clearPost, selectCreationType } from "@/store/slices/postGenerationSlice";
import { resetManualPost } from "@/store/slices/manualPostSlice";
import { resetFlow, resetSavePost } from "@/store/slices/postSlice";
import CreateMethodSelector from "@/components/features/company/posts/create/CreateMethodSelector";
import CreateStepper from "@/components/features/company/posts/create/CreateStepper";

const CreatePostPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [mounted, setMounted] = useState(false);
  const creationType = useSelector(selectCreationType);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    return () => {
      dispatch(clearPost());
      dispatch(resetManualPost());
      dispatch(resetFlow());
      dispatch(resetSavePost());
    };
  }, []);

  if (!mounted) return null;

  return (
      <DashboardLayout>
        {!creationType && <CreateMethodSelector />}
        {creationType && <CreateStepper />}
      </DashboardLayout>
  );
};

export default CreatePostPage;
