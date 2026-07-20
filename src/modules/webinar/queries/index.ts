import { useMutation, useQuery } from "@tanstack/react-query";
import { webinarApi } from "../api";

export const usePublicWebinarQuery = (id: string, enabled = true) =>
  useQuery({
    queryKey: ["webinar", "public", id],
    queryFn:  () => webinarApi.getPublic(id),
    enabled:  enabled && !!id,
    staleTime: 30_000,
  });

export const useSaveWebinarProgressMutation = () =>
  useMutation({ mutationFn: webinarApi.saveProgress });

export const useCompleteWebinarMutation = () =>
  useMutation({
    mutationFn: ({ submissionId, answers }: { submissionId: string; answers: Record<string, unknown> }) =>
      webinarApi.complete(submissionId, answers),
  });
