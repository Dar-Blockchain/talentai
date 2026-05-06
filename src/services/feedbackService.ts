import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const isMongoObjectId = (id?: string | null): boolean =>
  !!id && /^[a-f\d]{24}$/i.test(id);

export const feedbackService = {
  submitFeedback: async (payload: { rating: number; comment: string; interviewId?: string }) => {
    const token = localStorage.getItem('api_token') || Cookies.get('api_token');
    const body: { rating: number; comment: string; interviewId?: string } = {
      rating: payload.rating,
      comment: payload.comment,
    };
    if (isMongoObjectId(payload.interviewId)) {
      body.interviewId = payload.interviewId;
    }
    const res = await axios.post(
      `${API_BASE_URL}feedback/addFeedback`,
      body,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return res.data;
  },
};
