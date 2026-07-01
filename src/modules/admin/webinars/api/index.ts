import axiosInstance from "@/utils/axiosInstance";
import { apiCall } from "@/utils/apiCall";
import type { Webinar, WebinarFormValues, WebinarListResponse, WebinarSubmissionsResponse } from "../types";

const BASE = "webinars";

export const adminWebinarApi = {
  list: (params: { page?: number; limit?: number; status?: string }) =>
    apiCall(async () => {
      const { data } = await axiosInstance.get(BASE, { params });
      return data as WebinarListResponse & { success: boolean };
    }, "Failed to load webinars."),

  get: (id: string) =>
    apiCall(async () => {
      const { data } = await axiosInstance.get(`${BASE}/${id}`);
      return data.data as Webinar;
    }, "Failed to load webinar."),

  create: (values: WebinarFormValues) =>
    apiCall(async () => {
      const { data } = await axiosInstance.post(BASE, values);
      return data.data as Webinar;
    }, "Failed to create webinar."),

  update: (id: string, values: Partial<WebinarFormValues>) =>
    apiCall(async () => {
      const { data } = await axiosInstance.patch(`${BASE}/${id}`, values);
      return data.data as Webinar;
    }, "Failed to update webinar."),

  remove: (id: string) =>
    apiCall(async () => {
      await axiosInstance.delete(`${BASE}/${id}`);
    }, "Failed to delete webinar."),

  verify: (id: string) =>
    apiCall(async () => {
      const { data } = await axiosInstance.patch(`${BASE}/${id}/verify`);
      return data.data as Webinar;
    }, "Failed to verify webinar."),

  archive: (id: string) =>
    apiCall(async () => {
      const { data } = await axiosInstance.patch(`${BASE}/${id}/archive`);
      return data.data as Webinar;
    }, "Failed to archive webinar."),

  refreshStats: (id: string) =>
    apiCall(async () => {
      const { data } = await axiosInstance.post(`${BASE}/${id}/refresh-stats`);
      return data.data as Webinar;
    }, "Failed to refresh stats."),

  listSubmissions: (id: string, params?: { page?: number; limit?: number; completed?: boolean }) =>
    apiCall(async () => {
      const { data } = await axiosInstance.get(`${BASE}/${id}/submissions`, { params });
      return data as WebinarSubmissionsResponse & { success: boolean };
    }, "Failed to load submissions."),
};
