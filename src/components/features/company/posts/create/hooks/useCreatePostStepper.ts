import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { AppDispatch } from "@/store/store";

import {
  savePost,
  postRecruitmentSteps,
  updatePost,
  updatePostStatus,
} from "@/store/slices/postSlice";
import { setCreationType } from "@/store/slices/postGenerationSlice";
import { getMyProfile } from "@/store/slices/userSlice";

import {
  buildRecruitmentSteps,
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
  manualPost: any,
  interviewLanguages: string[]
) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { showToast } = useToast();

  const { nodes, edges } = recruitmentFlow;

  const [activeStep, setActiveStep] = useState(() => (savedPost?.jobData?._id ? 1 : 0));
  // const [modalOpen, setModalOpen] = useState(false);
  // const [agentLoadingOpen, setAgentLoadingOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  // const [modalMode, setModalMode] = useState<"saving" | "matching" | "done">(
  //   "saving"
  // );

  const [isFinishing, setIsFinishing] = useState(false);
  const [pipelineWarningOpen, setPipelineWarningOpen] = useState(false);
  const [unconfiguredNodes, setUnconfiguredNodes] = useState<any[]>([]);

  /* -------------------- Helpers -------------------- */

  const validateStep0 = () => {
    return creationType === "ai"
      ? validateAIPostStep0(generatedPost, showToast)
      : validateManualPostStep0(manualPost, showToast);
  };

  const saveOrUpdatePost = async (languagesOverride?: string[]) => {
    const jobId = savedPost?.jobData?._id;
    const base = creationType === "ai" ? generatedPost : manualPost;
    const jobData = { ...base, interviewLanguages: languagesOverride ?? interviewLanguages };

    if (jobId) {
      return dispatch(updatePost({ jobId, jobData })).unwrap();
    }

    const result = await dispatch(savePost(jobData)).unwrap();
    dispatch(getMyProfile());
    return result;
  };

  const savePipeline = async () => {
    // --- Payment modal commented out (free during beta) ---
    // setPaymentModalOpen(true);

    setIsFinishing(true);
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


      router.push("/company/posts");
      showToast({
        message: "Job post saved as draft.",
        severity: "success",
      });
    } catch (error) {
      console.error("Pipeline save failed:", error);
      showToast({
        message: "Failed to save recruitment pipeline.",
        severity: "error",
      });
    } finally {
      setIsFinishing(false);
    }
  };

  const finalizeCreation = async (postId?: string) => {

    const resolvedPostId = postId || savedPost?.jobData?._id;

    try {

      if (creationType === "ai") {
        router.push("/company/posts");
        showToast({
          message: "Job post saved as draft.",
          severity: "success",
        });
        return;
      }

      setActiveStep(2);
    }  catch (error: any) {
  console.error("Error configuring hiring agent:", error);
  // setAgentLoadingOpen(false);
  showToast({ message: "Failed to configure hiring agent.", severity: "error" });
}
  };

  /* -------------------- Actions -------------------- */

  const handleNext = async (shouldContinue?: boolean, languagesOverride?: string[]) => {
    /* ---------- STEP 0: Job Details ---------- */
    if (activeStep === 0 && !shouldContinue) {
      if (!validateStep0()) return;

      // --- Matching flow modal commented out (not needed during beta) ---
      // setModalOpen(true);
      // setModalMode("saving");

      setIsFinishing(true);
      try {
        const result = await saveOrUpdatePost(languagesOverride);

        if (creationType === "ai") {
          await finalizeCreation(result.jobData._id);
          return;
        }

        setActiveStep(1);
      } catch (err: any) {
        const message = typeof err === "string" ? err : err?.message || "Failed to save job post.";
        showToast({ message, severity: "error" });
      } finally {
        setIsFinishing(false);
      }
      return;
    }

    // --- AI flow: after matching modal "Continue" (commented out - modal removed) ---
    // if (activeStep === 0 && shouldContinue && creationType === "ai") {
    //   setModalOpen(false);
    //   await finalizeCreation();
    //   return;
    // }

    /* ---------- STEP 1: Recruitment Flow (manual only) ---------- */
    if (activeStep === 1 && savedPost?.jobData?._id) {
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
      router.push("/company/posts");
      return;
    }
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  return {
    activeStep,
    isFinishing,
    // modalOpen,
    // modalMode,
    paymentModalOpen,
    // agentLoadingOpen,

    pipelineWarningOpen,
    unconfiguredNodes,

    setPipelineWarningOpen,
    // setModalOpen,
    setPaymentModalOpen,

    handleNext,
    handleBack,
    savePipeline,
  };
};