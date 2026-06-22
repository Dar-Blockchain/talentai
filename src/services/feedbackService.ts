import axios from 'axios';
import { getToken } from '@/modules/auth/shared/utils/token';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const isMongoObjectId = (id?: string | null): boolean =>
  !!id && /^[a-f\d]{24}$/i.test(id);

const SKILL_TYPES = ['TECHNICAL_SKILL', 'SOFT_SKILL', 'ASSESSMENT', 'EVALUATION'];

const toBackendInterviewType = (type?: string): string | undefined => {
  if (!type) return undefined;
  if (SKILL_TYPES.includes(type)) return 'SkillInterviewAssessment';
  return 'PostInterviewAssessment';
};

export const feedbackService = {
  submitFeedback: async (payload: { rating: number; comment: string; interviewId?: string; interviewType?: string }) => {
    const token = getToken();
    const body: Record<string, unknown> = {
      rating: payload.rating,
    };
    if (payload.comment?.trim()) body.comment = payload.comment.trim();
    const mappedType = toBackendInterviewType(payload.interviewType);
    if (isMongoObjectId(payload.interviewId) && mappedType) {
      body.interviewId = payload.interviewId;
      body.interviewType = mappedType;
    }
    const res = await axios.post(
      `${API_BASE_URL}feedbacks/`,
      body,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return res.data;
  },
};
