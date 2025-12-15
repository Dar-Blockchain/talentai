import { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  savePost,
  fetchJobMatches,
  postRecruitmentSteps,
} from "@/store/slices/postSlice";
import { createHRAgent } from "@/store/slices/hrAgentsSlice";
import { getJobSkills } from "@/utils/postHelpers";
import { createAgentConfig } from "@/store/slices/agentConfigSlice";
import { useToast } from "@/hooks/useToast";

export const useCreatePostStepper = (
  generatedPost: any,
  profile: any,
  recruitmentFlow: any,
  savedPost: any
) => {
  const { showToast } = useToast();
  const dispatch = useDispatch<AppDispatch>();

  const [activeStep, setActiveStep] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"saving" | "matching" | "done">(
    "saving"
  );

  const { nodes, edges } = recruitmentFlow;

  // ✅ STEP 0 VALIDATION
  const validateStep0 = () => {
    const jobDetails = generatedPost?.jobDetails;
    const hardSkills = generatedPost?.skillAnalysis?.requiredSkills || [];
    const softSkills = generatedPost?.skillAnalysis?.softSkills || [];

    if (!jobDetails?.title?.trim()) {
      showToast({ message: "Job title is required", severity: "error" });
      return false;
    }

    if (!jobDetails?.experienceLevel) {
      showToast({ message: "Experience level is required", severity: "error" });
      return false;
    }

    if (!jobDetails?.description?.trim()) {
      showToast({ message: "Job description is required", severity: "error" });
      return false;
    }

    if (hardSkills.length === 0) {
      showToast({
        message: "At least one hard skill is required",
        severity: "error",
      });
      return false;
    }

    if (softSkills.length === 0) {
      showToast({
        message: "At least one soft skill is required",
        severity: "error",
      });
      return false;
    }

    const allSkills = [...hardSkills, ...softSkills];
    const total = allSkills.reduce(
      (sum, s) => sum + (s.percentage || 0),
      0
    );

    if (total !== 100) {
      showToast({
        message: `Total skill percentage must equal 100%. Current total: ${total}%`,
        severity: "error",
      });
      return false;
    }

    if (!jobDetails?.requirements?.length) {
      showToast({
        message: "At least one requirement is required",
        severity: "error",
      });
      return false;
    }

    if (!jobDetails?.responsibilities?.length) {
      showToast({
        message: "At least one responsibility is required",
        severity: "error",
      });
      return false;
    }

    return true;
  };

  const handleNext = async (shouldContinue?: boolean) => {
    if (activeStep === 0 && !shouldContinue) {
      const isValid = validateStep0();
      if (!isValid) return;

      setModalOpen(true);
      setModalMode("saving");

      try {
        const result = await dispatch(savePost(generatedPost)).unwrap();

        if (!result?.success) {
          setModalOpen(false);
          return;
        }

        const agentData = {
          jobId: result.jobData._id,
          companyName: profile?.companyDetails?.name || "Company",
          postTitle: result.jobData?.jobDetails?.title,
          companyId: profile?.userId,
          jobSkills: getJobSkills(result.jobData),
        };

        await dispatch(createHRAgent(agentData)).unwrap();

        setModalMode("matching");
        await dispatch(fetchJobMatches(result.jobData._id)).unwrap();

        setModalMode("done");
      } catch (error) {
        setModalOpen(false);
      }
    }

    // ✅ Continue after modal
    if (activeStep === 0 && shouldContinue) {
      setModalOpen(false);
      setActiveStep((prev) => prev + 1);
    }

    // ✅ STEP 1
    if (activeStep === 1) {
      await dispatch(createAgentConfig()).unwrap();
      setActiveStep((prev) => prev + 1);
    }

    // ✅ STEP 2 — Recruitment flow
    if (activeStep === 2 && savedPost?.jobData?._id) {
      const sequenceData = nodes.map((node: any, index: number) => ({
        ...node,
        order: index,
        connections: edges
          .filter(
            (edge: any) =>
              edge.source === node.id || edge.target === node.id
          )
          .map((edge: any) => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            type: edge.source === node.id ? "outgoing" : "incoming",
          })),
      }));

      await dispatch(
        postRecruitmentSteps({
          postId: savedPost.jobData._id,
          steps: sequenceData,
        })
      );
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
