import axiosInstance from "@/utils/axiosInstance";
import { apiCall } from "@/utils/apiCall";
import { ApplicationDetail } from "../types";

export const candidateApplicationsApi = {
  getById: (id: string) =>
    apiCall(
      async () => {
        const { data } = await axiosInstance.get(`job-applications/${id}`);
        return (data?.data ?? data) as ApplicationDetail;
      },
      "Failed to load application.",
    ),
};
