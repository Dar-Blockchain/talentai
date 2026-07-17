import axiosInstance from "@/utils/axiosInstance";
import { apiCall } from "@/utils/apiCall";
import type { Webinar, WebinarFormValues, WebinarListResponse, WebinarSubmissionsResponse } from "../types";

const BASE = "webinars";

/** The form collects a plain calendar day plus separate "HH:mm" start/end
 * times — compose them into the full `date`/`end_date` datetimes the backend
 * actually stores before sending. */
function toPayload(values: Partial<WebinarFormValues>): Record<string, unknown> {
  const { start_time, end_time, date, ...rest } = values;
  const payload: Record<string, unknown> = { ...rest };
  if (date !== undefined) {
    payload.date = date && start_time ? `${date}T${start_time}` : (date || null);
  }
  if (end_time !== undefined) {
    payload.end_date = date && end_time ? `${date}T${end_time}` : null;
  }
  return payload;
}

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
      const { data } = await axiosInstance.post(BASE, toPayload(values));
      return data.data as Webinar;
    }, "Failed to create webinar."),

  update: (id: string, values: Partial<WebinarFormValues>) =>
    apiCall(async () => {
      const { data } = await axiosInstance.patch(`${BASE}/${id}`, toPayload(values));
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

  sendLinkReminder: (id: string) =>
    apiCall(async () => {
      const { data } = await axiosInstance.post(`${BASE}/${id}/send-link`);
      return data.data as { sent: number; failed: number; total: number };
    }, "Failed to send reminder."),

  invite: (id: string, emails: string[]) =>
    apiCall(async () => {
      const { data } = await axiosInstance.post(`${BASE}/${id}/invite`, { emails });
      return data.data as { sent: number; failed: number; total: number };
    }, "Failed to send invitations."),

  listSubmissions: (id: string, params?: { page?: number; limit?: number; completed?: boolean }) =>
    apiCall(async () => {
      const { data } = await axiosInstance.get(`${BASE}/${id}/submissions`, { params });
      return data as WebinarSubmissionsResponse & { success: boolean };
    }, "Failed to load submissions."),
};
