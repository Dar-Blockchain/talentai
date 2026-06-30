import axiosInstance from '@/utils/axiosInstance';

const SKILL_TYPES = ['TECHNICAL_SKILL', 'SOFT_SKILL', 'ASSESSMENT', 'EVALUATION'];

const isMongoObjectId = (id?: string | null): boolean =>
  !!id && /^[a-f\d]{24}$/i.test(id);

const toBackendInterviewType = (type?: string): string | undefined => {
  if (!type) return undefined;
  return SKILL_TYPES.includes(type) ? 'SkillInterviewAssessment' : 'PostInterviewAssessment';
};

export async function submitFeedback(payload: {
  rating: number;
  comment: string;
  interviewId?: string;
  interviewType?: string;
}) {
  const body: Record<string, unknown> = { rating: payload.rating };
  if (payload.comment?.trim()) body.comment = payload.comment.trim();
  const mappedType = toBackendInterviewType(payload.interviewType);
  if (isMongoObjectId(payload.interviewId) && mappedType) {
    body.interviewId   = payload.interviewId;
    body.interviewType = mappedType;
  }
  const res = await axiosInstance.post('feedbacks/', body);
  return res.data;
}
