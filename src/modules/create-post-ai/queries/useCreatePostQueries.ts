import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { AppDispatch } from "@/store/store";
import { clearPost, setGeneratedPost, PostGenerationResponse } from "../store/createPostSlice";
import { getMyProfile } from "@/store/slices/userSlice";
import { generatePost, savePost, updatePost } from "../api";
import type { GeneratePostInput, SavePostPayload } from "../api";
import { inferExperienceLevelFromText, isKnownExperienceLevel } from "../utils";

// ── Generate ──────────────────────────────────────────────────────────────────

export const useGeneratePostMutation = () => {
  const dispatch = useDispatch<AppDispatch>();

  return useMutation({
    mutationFn: (payload: GeneratePostInput) => generatePost(payload),
    onSuccess: (data, variables) => {
      const { requiredSkills, softSkills, ...jobDetails } = data;
      const experienceLevel = jobDetails.experienceLevel ?? "";
      const inferred = inferExperienceLevelFromText(
        [jobDetails.title, jobDetails.description, ...(jobDetails.requirements ?? []), ...(jobDetails.responsibilities ?? [])]
          .filter(Boolean)
          .join(" "),
      );

      dispatch(
        setGeneratedPost({
          post: {
            creationType: "ai",
            expirationDate: null,
            jobDetails: {
              ...jobDetails,
              experienceLevel: isKnownExperienceLevel(experienceLevel) ? experienceLevel : inferred,
            },
            skillAnalysis: {
              requiredSkills: requiredSkills ?? [],
              softSkills: softSkills ?? [],
            },
          },
          language: variables.language ?? "en",
        }),
      );
    },
  });
};

// ── Save / Update ─────────────────────────────────────────────────────────────

interface SaveMutationPayload {
  jobData: PostGenerationResponse & { interviewLanguages: string[] };
  savedPostId: string | null;
  thresholdScore: number;
}

export const useSavePostMutation = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ jobData, savedPostId, thresholdScore }: SaveMutationPayload) => {
      const payload: SavePostPayload = {
        ...jobData.jobDetails,
        requiredSkills: jobData.skillAnalysis.requiredSkills,
        softSkills: jobData.skillAnalysis.softSkills,
        creationType: jobData.creationType,
        interviewLanguages: jobData.interviewLanguages,
        expirationDate: jobData.expirationDate ?? null,
        thresholdScore,
      };
      return savedPostId ? updatePost(savedPostId, payload) : savePost(payload);
    },
    onSuccess: (_data, { savedPostId }) => {
      if (!savedPostId) dispatch(getMyProfile());
      dispatch(clearPost());
      router.push("/company/posts");
    },
  });
};
