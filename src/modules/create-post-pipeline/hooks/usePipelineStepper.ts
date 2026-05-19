import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { AppDispatch } from "@/store/store";
import { savePost, updatePost, postRecruitmentSteps } from "@/store/slices/postSlice";
import { getMyProfile } from "@/store/slices/userSlice";
import { useToast } from "@/hooks/useToast";
import { validateManualPostStep0 } from "@/validations/postValidation";
import { validatePipelineNodes, buildRecruitmentSteps } from "@/utils/postHelpers";
import { extractSkillsFromPipeline } from "@/utils/jobHelpers";

export const usePipelineStepper = (
  manualPost: any,
  recruitmentFlow: any,
  savedPost: any
) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { showToast } = useToast();

  const [activeStep, setActiveStep]               = useState(() => (savedPost?.jobData?._id ? 1 : 0));
  const [isFinishing, setIsFinishing]             = useState(false);
  const [pipelineWarningOpen, setPipelineWarningOpen] = useState(false);
  const [unconfiguredNodes, setUnconfiguredNodes] = useState<any[]>([]);

  const { nodes, edges } = recruitmentFlow;

  const handleNext = async () => {
    if (activeStep === 0) {
      if (!validateManualPostStep0(manualPost, showToast)) return;
      setIsFinishing(true);
      try {
        const jobId = savedPost?.jobData?._id;
        if (jobId) {
          await dispatch(updatePost({ jobId, jobData: manualPost })).unwrap();
        } else {
          await dispatch(savePost(manualPost)).unwrap();
          dispatch(getMyProfile());
        }
        setActiveStep(1);
      } catch (err: any) {
        showToast({ message: err?.message || "Failed to save job post.", severity: "error" });
      } finally {
        setIsFinishing(false);
      }
      return;
    }

    if (activeStep === 1 && savedPost?.jobData?._id) {
      const { isValid, unconfiguredNodes: invalid } = validatePipelineNodes(nodes);
      if (!isValid) {
        setUnconfiguredNodes(invalid);
        setPipelineWarningOpen(true);
        return;
      }
      await savePipeline();
    }
  };

  const savePipeline = async () => {
    setIsFinishing(true);
    try {
      await dispatch(postRecruitmentSteps({
        postId: savedPost.jobData._id,
        steps: buildRecruitmentSteps(nodes, edges),
      })).unwrap();

      const { technicalSkills, softSkills } = extractSkillsFromPipeline(nodes);
      const jobDetails = { ...savedPost.jobData.jobDetails };
      if (!jobDetails.workMode) jobDetails.workMode = jobDetails.location === "Remote" ? "remote" : "onsite";

      const updatePayload: any = { creationType: "pipeline", jobDetails };
      if (technicalSkills.length > 0 || softSkills.length > 0) {
        updatePayload.skillAnalysis = {};
        if (technicalSkills.length > 0) updatePayload.skillAnalysis.requiredSkills = technicalSkills;
        if (softSkills.length > 0)      updatePayload.skillAnalysis.softSkills = softSkills;
      }

      await dispatch(updatePost({ jobId: savedPost.jobData._id, jobData: updatePayload })).unwrap();

      router.push("/company/posts");
      showToast({ message: "Job post saved as draft.", severity: "success" });
    } catch {
      showToast({ message: "Failed to save recruitment pipeline.", severity: "error" });
    } finally {
      setIsFinishing(false);
    }
  };

  const handleBack = () => {
    if (activeStep === 0) router.push("/company/posts");
    else setActiveStep(0);
  };

  return { activeStep, isFinishing, pipelineWarningOpen, unconfiguredNodes, handleNext, handleBack, setPipelineWarningOpen, savePipeline };
};
