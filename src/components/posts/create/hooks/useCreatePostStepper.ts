import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { AppDispatch } from "@/store/store";

import {
  savePost,
  fetchJobMatches,
  postRecruitmentSteps,
  updatePost,
  updatePostStatus,
} from "@/store/slices/postSlice";
import { createHRAgent } from "@/store/slices/hrAgentsSlice";
import { createAgentConfig } from "@/store/slices/agentConfigSlice";
import { setCreationType } from "@/store/slices/postGenerationSlice";
import { getMyProfile } from "@/store/slices/userSlice";

import {
  buildRecruitmentSteps,
  getJobSkills,
  validatePipelineNodes,
} from "@/utils/postHelpers";
import { extractSkillsFromPipeline } from "@/utils/jobHelpers";

import {
  validateAIPostStep0,
  validateManualPostStep0,
} from "@/validations/postValidation";

import { useToast } from "@/hooks/useToast";

export const useCreatePostStepper = (
  generatedPost: any,
  profile: any,
  recruitmentFlow: any,
  savedPost: any,
  creationType: "ai" | "manual",
  manualPost: any
) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { showToast } = useToast();

  const { nodes, edges } = recruitmentFlow;

  const [activeStep, setActiveStep] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [agentLoadingOpen, setAgentLoadingOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"saving" | "matching" | "done">(
    "saving"
  );

  const [pipelineWarningOpen, setPipelineWarningOpen] = useState(false);
  const [unconfiguredNodes, setUnconfiguredNodes] = useState<any[]>([]);

  /* -------------------- Helpers -------------------- */

  const validateStep0 = () => {
    return creationType === "ai"
      ? validateAIPostStep0(generatedPost, showToast)
      : validateManualPostStep0(manualPost, showToast);
  };

  const saveOrUpdatePost = async () => {
    const jobId = savedPost?.jobData?._id;
    const jobData = creationType === "ai" ? generatedPost : manualPost;

    if (jobId) {
      return dispatch(updatePost({ jobId, jobData })).unwrap();
    }

    const result = await dispatch(savePost(jobData)).unwrap();
    dispatch(getMyProfile());
    return result;
  };

  const savePipeline = async () => {
    setPaymentModalOpen(true);

    try {
      await dispatch(
        postRecruitmentSteps({
          postId: savedPost.jobData._id,
          steps: buildRecruitmentSteps(nodes, edges),
        })
      ).unwrap();

      const { technicalSkills, softSkills } = extractSkillsFromPipeline(nodes);

      console.log("📦 Pipeline skills extracted:", { technicalSkills, softSkills });

      // Build update payload with required fields from backend validation
      const jobDetails = { ...savedPost.jobData.jobDetails };
      // Ensure workMode has a valid value
      if (!jobDetails.workMode) {
        jobDetails.workMode = jobDetails.location === "Remote" ? "remote" : "onsite";
      }

      const updatePayload: any = {
        creationType: "pipeline",
        jobDetails,
        linkedinPost: savedPost.jobData.linkedinPost,
      };

      if (technicalSkills.length > 0 || softSkills.length > 0) {
        updatePayload.skillAnalysis = {};

        if (technicalSkills.length > 0) {
          updatePayload.skillAnalysis.requiredSkills = technicalSkills;
        }

        if (softSkills.length > 0) {
          updatePayload.skillAnalysis.softSkills = softSkills;
        }
      }

      console.log("📤 Update payload:", JSON.stringify(updatePayload, null, 2));

      await dispatch(
        updatePost({
          jobId: savedPost.jobData._id,
          jobData: updatePayload,
        })
      ).unwrap();
    } catch (error) {
      console.error("Pipeline save failed:", error);
      showToast({
        message: "Failed to save recruitment pipeline.",
        severity: "error",
      });
    }
  };

  const finalizeCreation = async () => {
    setAgentLoadingOpen(true);

    try {
      await dispatch(
        createHRAgent({
          agentData: {
            jobId: savedPost?.jobData?._id,
            companyName: profile?.companyDetails?.name || "Company",
            postTitle: savedPost?.jobData?.jobDetails?.title,
            companyId: profile?.userId,
            jobSkills: getJobSkills(savedPost?.jobData),
          },
          configData: null,
        })
      ).unwrap();

      await dispatch(createAgentConfig()).unwrap();

      if (creationType === "ai") {
        await dispatch(
          updatePostStatus({ postId: savedPost?.jobData?._id, status: "open" })
        ).unwrap();
      }

      setAgentLoadingOpen(false);

      if (creationType === "ai") {
        router.push("/dashboard/company");
        showToast({
          message: "Job post created successfully.",
          severity: "success",
        });
        return;
      }

      setActiveStep(2);
    }  catch (error: any) {
  console.error("Error configuring hiring agent:", error);
  setAgentLoadingOpen(false);
  showToast({ message: "Failed to configure hiring agent.", severity: "error" });
}
  };

  /* -------------------- Actions -------------------- */

  const handleNext = async (shouldContinue?: boolean) => {
    /* ---------- STEP 0 ---------- */
    if (activeStep === 0 && !shouldContinue) {
      if (!validateStep0()) return;

      setModalOpen(true);
      setModalMode("saving");

      try {
        const result = await saveOrUpdatePost();

        if (creationType === "ai") {
          setModalMode("matching");
          await dispatch(
            fetchJobMatches({
              selectedJobId: result.jobData._id,
              page: 1,
              limit: 10,
            })
          ).unwrap();
          setModalMode("done");
          return;
        }

        setModalOpen(false);
        setActiveStep(1);
      } catch {
        setModalOpen(false);
      }
      return;
    }

    if (activeStep === 0 && shouldContinue && creationType === "ai") {
      setModalOpen(false);
      setActiveStep(1);
      return;
    }

    /* ---------- STEP 1 ---------- */
    if (activeStep === 1) {
      await finalizeCreation();
      return;
    }

    /* ---------- STEP 2 ---------- */
    if (activeStep === 2 && savedPost?.jobData?._id) {
      const { isValid, unconfiguredNodes } = validatePipelineNodes(nodes);

      if (!isValid) {
        setUnconfiguredNodes(unconfiguredNodes);
        setPipelineWarningOpen(true);
        return; // ⛔ block until user confirms
      }

      await savePipeline();
    }
  };

  const handleBack = () => {
    if (activeStep === 0) {
      dispatch(setCreationType(null));
      return;
    }
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  return {
    activeStep,
    modalOpen,
    modalMode,
    paymentModalOpen,
    agentLoadingOpen,

    pipelineWarningOpen,
    unconfiguredNodes,

    setPipelineWarningOpen,
    setModalOpen,
    setPaymentModalOpen,

    handleNext,
    handleBack,
    savePipeline,
  };
};