import axiosInstance from '@/utils/axiosInstance';
import type { ParticipantResults } from '@/modules/company/campaigns/types/campaign';

export const apiStartQuestionnaire = async (campaignId: string, participantId: string): Promise<void> => {
  await axiosInstance.patch(`internal-campaigns/${campaignId}/start/${participantId}`);
};

export const apiFetchMyQuestionnaireResults = async (campaignId: string, participantId: string): Promise<ParticipantResults> => {
  const res = await axiosInstance.get(`internal-campaigns/${campaignId}/results/${participantId}`);
  return res.data.data;
};
