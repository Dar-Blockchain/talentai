import { useMutation, useQuery } from '@tanstack/react-query';
import { apiStartQuestionnaire, apiFetchMyQuestionnaireResults } from '../api';

export const useStartQuestionnaireMutation = () =>
  useMutation({
    mutationFn: ({ campaignId, participantId }: { campaignId: string; participantId: string }) =>
      apiStartQuestionnaire(campaignId, participantId),
  });

export const useMyQuestionnaireResultsQuery = (campaignId: string, participantId: string, enabled: boolean) =>
  useQuery({
    queryKey: ['questionnaire', 'my-results', campaignId, participantId] as const,
    queryFn:  () => apiFetchMyQuestionnaireResults(campaignId, participantId),
    enabled:  enabled && !!campaignId && !!participantId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data?.response) return false;
      const stillScoring = data.response.aiScore == null && !data.response.aiSummary;
      return stillScoring ? 3000 : false;
    },
  });
