import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { generatePost, getPost, savePost, updatePost } from "../api";
import type { GeneratePostInput, GeneratePostResponse, SavePostPayload } from "../api";
import { PostGenerationResponse } from "../store/createPostSlice";
import { inferExperienceLevelFromText, isKnownExperienceLevel, normalizeExperienceLevel } from "../utils";
const POST_CACHE_MS = 5 * 60 * 1000;

// ── Query Keys ────────────────────────────────────────────────────────────────

export const postKeys = {
  detail: (id: string) => ["post", id] as const,
  generated: () => ["post", "generated"] as const,
};

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NormalizedGeneratedPost {
  post: PostGenerationResponse;
  language: string;
}

export interface SaveMutationPayload {
  jobData: PostGenerationResponse & { interviewLanguages: string[] };
  savedPostId: string | null;
  thresholdScore: number;
}

// ── Fetch existing post by ID ─────────────────────────────────────────────────

export const useGetPostQuery = (postId: string | null) =>
  useQuery({
    queryKey: postKeys.detail(postId ?? ""),
    queryFn: () => getPost(postId!),
    enabled: !!postId,
    staleTime: POST_CACHE_MS,
  });

// ── Normalization ─────────────────────────────────────────────────────────────

function normalizeGeneratedPost(data: GeneratePostResponse, variables: GeneratePostInput): NormalizedGeneratedPost {
  const { requiredSkills, softSkills, ...jobDetails } = data;
  const experienceLevel = jobDetails.experienceLevel ?? "";
  const inferred = inferExperienceLevelFromText(
    [jobDetails.title, jobDetails.description, ...(jobDetails.requirements ?? []), ...(jobDetails.responsibilities ?? [])]
      .filter(Boolean)
      .join(" "),
  );

  const isInternship = variables.contractType === "Internship" || jobDetails.employmentType === "Internship";
  const resolvedExperienceLevel =
    isKnownExperienceLevel(experienceLevel) ? normalizeExperienceLevel(experienceLevel)
    : inferred || (isInternship ? "Junior" : "");

  return {
    post: {
      creationType: "ai",
      expirationDate: null,
      jobDetails: { ...jobDetails, experienceLevel: resolvedExperienceLevel },
      skillAnalysis: {
        requiredSkills: requiredSkills ?? [],
        softSkills: softSkills ?? [],
      },
    },
    language: variables.language ?? "en",
  };
}

// ── Generate ──────────────────────────────────────────────────────────────────

export const useGeneratePostMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GeneratePostInput) => generatePost(payload),
    onSuccess: (data, variables) => {
      const result = normalizeGeneratedPost(data, variables);
      queryClient.setQueryData(postKeys.generated(), result);
    },
  });
};

// ── Save / Update ─────────────────────────────────────────────────────────────

export const useSavePostMutation = () => {
  const queryClient = useQueryClient();

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
      if (savedPostId) queryClient.invalidateQueries({ queryKey: postKeys.detail(savedPostId) });
      queryClient.removeQueries({ queryKey: postKeys.generated() });
    },
  });
};
