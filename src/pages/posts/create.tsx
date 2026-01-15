"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import { resetCreateConfig } from "@/store/slices/agentConfigSlice";
import { clearPost, selectCreationType } from "@/store/slices/postGenerationSlice";
import JobPostCreationMethod from "@/components/posts/create/JobPostCreationMethod";
import Header from "@/components/layout/Header";
import CreatePostStepper from "@/components/posts/create/CreatePostStepper";
import { resetManualPost } from "@/store/slices/manualPostSlice";
import { resetFlow, resetSavePost } from "@/store/slices/postSlice";
import PageContainer from "@/components/layout/PageContainer";

const CreateJobPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [mounted, setMounted] = useState(false);
  const creationType = useSelector(selectCreationType);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    return () => {
      dispatch(resetCreateConfig());
      dispatch(clearPost())
      dispatch(resetManualPost())
      dispatch(resetFlow())
      dispatch(resetSavePost())
    };
  }, []);

  if (!mounted) return null;

  return (
    <PageContainer>
      <Header />
      {!creationType && <JobPostCreationMethod/>}
      {creationType && <CreatePostStepper />}
    </PageContainer>
  );
};

export default CreateJobPage;
