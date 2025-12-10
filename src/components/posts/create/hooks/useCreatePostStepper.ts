import { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { savePost, fetchJobMatches } from "@/store/slices/postSlice";
import { createHRAgent } from "@/store/slices/hrAgentsSlice";

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

    if (shouldContinue) {
      setModalOpen(false);
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

// ---------- UTILITY FUNCTION ----------

const getJobSkills = (job: any): string[] => {
  if (!job?.skillAnalysis) return [];

  const skills: string[] = [];

  if (job.skillAnalysis.requiredSkills) {
    skills.push(
      ...job.skillAnalysis.requiredSkills.map((skill: any) => skill.name)
    );
  }

  if (job.skillAnalysis.softSkills) {
    skills.push(
      ...job.skillAnalysis.softSkills.map((skill: any) => skill.name)
    );
  }

  return [...new Set(skills)];
};
