import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { validateAIPostStep0 } from "@/validations/postValidation";
import { useToast } from "@/hooks/useToast";
import { useSavePostMutation } from "../queries/useCreatePostQueries";
import { PostGenerationResponse } from "../store/createPostSlice";

export const useAiPostStepper = (
  generatedPost: PostGenerationResponse | null,
  savedPostId: string | null,
  interviewLanguages: string[]
) => {
  const router = useRouter();
  const { showToast } = useToast();
  const saveMutation = useSavePostMutation();
  const thresholdScore = useSelector((state: any) => state.postGeneration.thresholdScore);

  const handleNext = (languagesOverride?: string[]) => {
    if (!validateAIPostStep0(generatedPost, showToast)) return;

    saveMutation.mutate(
      {
        jobData: { ...generatedPost!, interviewLanguages: languagesOverride ?? interviewLanguages },
        savedPostId,
        thresholdScore,
      },
      {
        onSuccess: () =>
          showToast({ message: "Job post saved as draft.", severity: "success" }),
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
