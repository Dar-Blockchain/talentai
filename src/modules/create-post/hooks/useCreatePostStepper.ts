import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { AppDispatch } from "@/store/store";
import { clearPost } from "@/store/slices/postGenerationSlice";
import { getMyProfile } from "@/store/slices/userSlice";
import { validateAIPostStep0 } from "@/validations/postValidation";
import { useToast } from "@/hooks/useToast";
import { savePost, updatePost } from "../api/savePost";

export const useCreatePostStepper = (
  generatedPost: any,
  savedPostId: string | null,
  interviewLanguages: string[]
) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { showToast } = useToast();

  const [isFinishing, setIsFinishing] = useState(false);

  const saveOrUpdate = async (languagesOverride?: string[]) => {
    const jobData = {
      ...generatedPost,
      interviewLanguages: languagesOverride ?? interviewLanguages,
    };

    if (savedPostId) {
      return updatePost(savedPostId, jobData);
    }

    const result = await savePost(jobData);
    dispatch(getMyProfile());
    return result;
  };

  const handleNext = async (languagesOverride?: string[]) => {
    if (!validateAIPostStep0(generatedPost, showToast)) return;

    setIsFinishing(true);
    try {
      await saveOrUpdate(languagesOverride);
      dispatch(clearPost());
      router.push("/company/posts");
      showToast({ message: "Job post saved as draft.", severity: "success" });
    } catch (err: any) {
      const message = typeof err === "string" ? err : err?.message || "Failed to save job post.";
      showToast({ message, severity: "error" });
    } finally {
      setIsFinishing(false);
    }
  };

  const handleBack = () => {
    router.push("/company/posts");
  };

  return { isFinishing, handleNext, handleBack };
};
