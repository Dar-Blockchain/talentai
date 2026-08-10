import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { validateAIPostStep0 } from "@/modules/company/posts/utils/postValidation";
import { useToast } from "@/hooks/useToast";
import { useSavePostMutation } from "../queries/useCreatePostQueries";
import { clearPost, PostGenerationResponse } from "../store/createPostSlice";
import { getMyProfile } from "@/store/slices/userSlice";

export const useAiPostStepper = (
  generatedPost: PostGenerationResponse | null,
  savedPostId: string | null,
  interviewLanguages: string[]
) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();
  const thresholdScore = useSelector((state: RootState) => state.postGeneration.thresholdScore);
  const generatedLanguage = useSelector((state: RootState) => state.postGeneration.generatedLanguage);

  const saveMutation = useSavePostMutation();

  // forcedLanguages: when the language modal overrides the stored interviewLanguages (e.g. first-time generate)
  const handleNext = (forcedLanguages?: string[]) => {
    if (!validateAIPostStep0(generatedPost, showToast)) return;
    if (!generatedPost) return;

    saveMutation.mutate(
      {
        jobData: { ...generatedPost, interviewLanguages: forcedLanguages ?? interviewLanguages },
        savedPostId,
        thresholdScore,
        language: generatedLanguage,
      },
      {
        onSuccess: (data, { savedPostId: id }) => {
          showToast({ message: "Job post saved as draft.", severity: "success" });
          if (!id) dispatch(getMyProfile());
          dispatch(clearPost());
          const postId = data?.data?._id ?? id;
          router.push(postId ? `/company/posts/${postId}` : "/company/posts");
        },
        onError: (err: unknown) => {
          const message =
            err instanceof Error ? err.message
            : typeof err === "string" ? err
            : "Failed to save job post.";
          showToast({ message, severity: "error" });
        },
      }
    );
  };

  const handleBack = () => router.push("/company/posts");

  return { isFinishing: saveMutation.isPending, handleNext, handleBack };
};
