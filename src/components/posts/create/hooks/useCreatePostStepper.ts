import { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { savePost, fetchJobMatches } from "@/store/slices/postSlice";
import { createHRAgent } from "@/store/slices/hrAgentsSlice";
import { getJobSkills } from "@/utils/postHelpers";
import { createAgentConfig } from "@/store/slices/agentConfigSlice";

export const useCreatePostStepper = (generatedPost: any, profile: any) => {
  const dispatch = useDispatch<AppDispatch>();

  const [activeStep, setActiveStep] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"saving" | "matching" | "done">(
    "saving"
  );

  const handleNext = async (shouldContinue?: boolean) => {
    // Step 0 => Post saving + Agent creation + Matching
    if (activeStep === 0 && !shouldContinue) {
      setModalOpen(true);
      setModalMode("saving");

      const result = await dispatch(savePost(generatedPost)).unwrap();
      if (!result?.success) {
        setModalOpen(false);
        return;
      }

      const agentData = {
        jobId: result?.jobData?._id,
        companyName: profile?.companyDetails?.name || "Company",
        postTitle: result?.jobData?.jobDetails?.title,
        companyId: profile?.userId,
        jobSkills: getJobSkills(result?.jobData),
      };

      await dispatch(createHRAgent(agentData)).unwrap();

      setModalMode("matching");
      await dispatch(fetchJobMatches(result.jobData._id)).unwrap();

      setModalMode("done");
    }

    if (activeStep === 0 && shouldContinue) {
      setModalOpen(false);
      setActiveStep((prev) => prev + 1);
    }

    if(activeStep === 1){
      await dispatch(createAgentConfig()).unwrap();
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  return {
    activeStep,
    handleNext,
    handleBack,
    modalOpen,
    modalMode,
    setModalOpen,
  };
};
