import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { AppDispatch } from "@/store/store";
import {
  savePost,
  fetchJobMatches,
  postRecruitmentSteps,
  updatePost,
} from "@/store/slices/postSlice";
import { createHRAgent } from "@/store/slices/hrAgentsSlice";
import { createAgentConfig } from "@/store/slices/agentConfigSlice";
import { setCreationType } from "@/store/slices/postGenerationSlice";
import { getJobSkills } from "@/utils/postHelpers";
import { useToast } from "@/hooks/useToast";
import {
  validateAIPostStep0,
  validateManualPostStep0,
} from "@/validations/postValidation";
import { extractSkillsFromPipeline } from "@/utils/jobHelpers";

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

  const [activeStep, setActiveStep] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [agentLoadingOpen, setAgentLoadingOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"saving" | "matching" | "done">(
    "saving"
  );

  const { nodes, edges } = recruitmentFlow;

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

    return result;
  };

  const finalizeCreation = async (creationType: any) => {
    setAgentLoadingOpen(true);
    try {
    await dispatch(
      createHRAgent({
        jobId: savedPost?.jobData?._id,
        companyName: profile?.companyDetails?.name || "Company",
        postTitle: savedPost?.jobData?.jobDetails?.title,
        companyId: profile?.userId,
        jobSkills: getJobSkills(savedPost?.jobData),
      })
    ).unwrap();
    await dispatch(createAgentConfig()).unwrap();
    if (creationType === "ai") {
      setAgentLoadingOpen(false);
      router.push("/dashboard/company");
      showToast({
        message: "Job post created successfully.",
        severity: "success",
      });
      return;
    }
    setAgentLoadingOpen(false);
    setActiveStep(2);
    } catch (error) {
    setAgentLoadingOpen(false);
    showToast({
      message: "Failed to configure hiring agent.",
      severity: "error",
    });
  }
  };

  const buildRecruitmentSteps = () =>
    nodes.map((node: any, index: number) => ({
      ...node,
      order: index,
      connections: edges
        .filter(
          (edge: any) => edge.source === node.id || edge.target === node.id
        )
        .map((edge: any) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.source === node.id ? "outgoing" : "incoming",
        })),
    }));

  /* -------------------- Actions -------------------- */

  const handleNext = async (shouldContinue?: boolean) => {
    /* ---------- STEP 0 ---------- */
    if (activeStep === 0 && !shouldContinue) {
      if (!validateStep0()) return;

      setModalOpen(true);
      setModalMode("saving");

      try {
        const result = await saveOrUpdatePost();
        if (!result?.success) throw new Error();

        if (creationType === "ai") {
          setModalMode("matching");
          await dispatch(fetchJobMatches(result.jobData._id)).unwrap();
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
      await finalizeCreation(creationType);
      return;
    }

    /* ---------- STEP 2 ---------- */
    if (activeStep === 2 && savedPost?.jobData?._id) {
      setPaymentModalOpen(true);

      try {
        await dispatch(
          postRecruitmentSteps({
            postId: savedPost.jobData._id,
            steps: buildRecruitmentSteps(),
          })
        ).unwrap();

        const pipelineSkills = extractSkillsFromPipeline(nodes);

        const updatePayload: any = {
          creationType: "pipeline",
        };

        if (pipelineSkills.length > 0) {
          updatePayload["skillAnalysis.requiredSkills"] = pipelineSkills;
        }

        await dispatch(
          updatePost({ jobId: savedPost.jobData._id, jobData: updatePayload })
        ).unwrap();

        console.log("Recruitment steps and post updated successfully.");
      } catch (error) {
        console.error(
          "Failed to save recruitment steps or update post:",
          error
        );
      }
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
    setModalOpen,
    setPaymentModalOpen,
    handleNext,
    handleBack,
  };
};
