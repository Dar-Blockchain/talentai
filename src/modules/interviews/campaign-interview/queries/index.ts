import { useQuery } from '@tanstack/react-query';
import { apiFetchMyInterviewResults } from '../api';

export const useMyInterviewResultsQuery = (campaignId: string, participantId: string, enabled: boolean) =>
  useQuery({
    queryKey: ['campaign-interview', 'my-results', campaignId, participantId] as const,
    queryFn:  () => apiFetchMyInterviewResults(campaignId, participantId),
    enabled:  enabled && !!campaignId && !!participantId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data?.response) return 2000;
      const stillScoring = data.response.aiScore == null && !data.response.aiSummary;
      return stillScoring ? 2000 : false;
    },
  });
