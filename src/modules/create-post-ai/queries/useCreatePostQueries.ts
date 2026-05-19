import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { AppDispatch } from "@/store/store";
import {
  clearPost,
  setGeneratedPost,
  PostGenerationResponse,
} from "../store/createPostSlice";
import { getMyProfile } from "@/store/slices/userSlice";
import { generatePost, savePost, updatePost, type GeneratePostPayload } from "../api";
import { inferExperienceLevelFromText, isKnownExperienceLevel } from "@/utils/postFormI18n";

// ── Generate ──────────────────────────────────────────────────────────────────

export const useGeneratePostMutation = () => {
  const dispatch = useDispatch<AppDispatch>();

  return useMutation({
    mutationFn: (payload: GeneratePostPayload) => generatePost(payload),
    onSuccess: (data, variables) => {
      const experienceLevel = data.jobDetails?.experienceLevel ?? "";
      const inferred = inferExperienceLevelFromText(
        [
          data.jobDetails?.title,
          data.jobDetails?.description,
          ...(data.jobDetails?.requirements ?? []),
          ...(data.jobDetails?.responsibilities ?? []),
        ]
          .filter(Boolean)
          .join(" "),
      );

      dispatch(
        setGeneratedPost({
          post: {
            ...data,
            jobDetails: {
              ...data.jobDetails,
              experienceLevel: isKnownExperienceLevel(experienceLevel)
                ? experienceLevel
                : inferred,
            },
          },
          language: variables.language ?? "en",
        }),
      );
    },
  });
};

// ── Save / Update ─────────────────────────────────────────────────────────────

interface SavePostPayload {
  jobData: PostGenerationResponse & { interviewLanguages: string[] };
  savedPostId: string | null;
}

export const useSavePostMutation = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ jobData, savedPostId }: SavePostPayload) =>
      savedPostId ? updatePost(savedPostId, jobData) : savePost(jobData),
    onSuccess: (_data, { savedPostId }) => {
      if (!savedPostId) dispatch(getMyProfile());
      dispatch(clearPost());
      router.push("/company/posts");
    },
  });
};
