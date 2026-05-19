import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { AppDispatch } from "@/store/store";
import { clearPost } from "@/store/slices/postGenerationSlice";
import { getMyProfile } from "@/store/slices/userSlice";
import { validateAIPostStep0 } from "@/validations/postValidation";
import { useToast } from "@/hooks/useToast";
import { savePost, updatePost } from "../api";
import { PostGenerationResponse } from "@/store/slices/postGenerationSlice";

export const useAiPostStepper = (
  generatedPost: PostGenerationResponse | null,
  savedPostId: string | null,
  interviewLanguages: string[]
) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { showToast } = useToast();
  const [isFinishing, setIsFinishing] = useState(false);

  const handleNext = async (languagesOverride?: string[]) => {
    if (!validateAIPostStep0(generatedPost, showToast)) return;

    setIsFinishing(true);
    try {
      const jobData = { ...generatedPost, interviewLanguages: languagesOverride ?? interviewLanguages };
      if (savedPostId) {
        await updatePost(savedPostId, jobData);
      } else {
        await savePost(jobData);
        dispatch(getMyProfile());
      }
      dispatch(clearPost());
      router.push("/company/posts");
      showToast({ message: "Job post saved as draft.", severity: "success" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : typeof err === "string" ? err : "Failed to save job post.";
      showToast({ message, severity: "error" });
    } finally {
      setIsFinishing(false);
    }
  };

  const handleBack = () => router.push("/company/posts");

  return { isFinishing, handleNext, handleBack };
};
