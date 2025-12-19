import { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  savePost,
  fetchJobMatches,
  postRecruitmentSteps,
  updatePost,
} from "@/store/slices/postSlice";
import { createHRAgent } from "@/store/slices/hrAgentsSlice";
import { getJobSkills } from "@/utils/postHelpers";
import { createAgentConfig } from "@/store/slices/agentConfigSlice";
import { useToast } from "@/hooks/useToast";
import { setCreationType } from "@/store/slices/postGenerationSlice";
import { useRouter } from "next/router";
import {
  validateAIPostStep0,
  validateManualPostStep0,
} from "@/validations/postValidation";

export const useCreatePostStepper = (
  generatedPost: any,
  profile: any,
  recruitmentFlow: any,
  savedPost: any,
  creationType: any,
  manualPost: any
) => {
  const { showToast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const [activeStep, setActiveStep] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"saving" | "matching" | "done">(
    "saving"
  );

  const { nodes, edges } = recruitmentFlow;

  const handleNext = async (shouldContinue?: boolean) => {
    if (activeStep === 0 && !shouldContinue) {
      const isValid =
        creationType === "ai"
          ? validateAIPostStep0(generatedPost, showToast)
          : validateManualPostStep0(manualPost, showToast);
      if (!isValid) return;

      setModalOpen(true);
      setModalMode("saving");

      try {
        const jobId = savedPost?.jobData?._id;
        const jobData = creationType === "ai" ? generatedPost : manualPost;

        let result: any;

        if (jobId) {
          result = await dispatch(updatePost({ jobId, jobData })).unwrap();
        } else {
          result = await dispatch(savePost(jobData)).unwrap();
          const agentData = {
            jobId: result.jobData._id,
            companyName: profile?.companyDetails?.name || "Company",
            postTitle: result.jobData?.jobDetails?.title,
            companyId: profile?.userId,
            jobSkills: getJobSkills(result.jobData),
          };
          await dispatch(createHRAgent(agentData)).unwrap();
        }
        if (!result?.success) {
          setModalOpen(false);
          return;
        }

        if (creationType === "ai") {
          setModalMode("matching");
          await dispatch(fetchJobMatches(result.jobData._id)).unwrap();
          setModalMode("done");
        }else{
          setModalOpen(false);
          setActiveStep((prev) => prev + 1);
        }
      } catch (error) {
        setModalOpen(false);
      }
    }

    // ✅ Continue after modal
    if (activeStep === 0 && shouldContinue && creationType === "ai") {
      setModalOpen(false);
      setActiveStep((prev) => prev + 1);
    }

    // ✅ STEP 1
    if ((activeStep === 1 && creationType === "ai") || (activeStep === 2 && creationType === "manual")) {
      await dispatch(createAgentConfig()).unwrap();
      router.push("/dashboard/company");
      showToast({
        message: "Job post created successfully.",
        severity: "success",
      });
      return;
    }

    // ✅ STEP 2 — Recruitment flow
    if (activeStep === 1 && savedPost?.jobData?._id) {
      setPaymentModalOpen(true);
      const sequenceData = nodes.map((node: any, index: number) => ({
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

      await dispatch(
        postRecruitmentSteps({
          postId: savedPost.jobData._id,
          steps: sequenceData,
        })
      );
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
    setModalOpen,
    setPaymentModalOpen,
    handleNext,
    handleBack,
  };
};