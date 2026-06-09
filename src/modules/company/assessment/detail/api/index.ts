import axiosInstance from "@/utils/axiosInstance";
import { apiCall } from "@/utils/apiCall";
import type { AssessmentDetail, StepsData } from "../types";

export const assessmentApi = {
  fetchDetail: (id: string) =>
    apiCall(async () => {
      const { data } = await axiosInstance.get(`post-interview-assessments/${id}`);
      const d = data?.data ?? data;
      return {
        assessment: (d?.assessment ?? d) as AssessmentDetail,
        stepsData:  (d?.stepsData ?? null) as StepsData | null,
      };
    }, "Failed to load assessment."),
};
