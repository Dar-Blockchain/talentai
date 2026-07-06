import type { WebinarContact, WebinarSubmission } from "./types";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const BASE    = `${BACKEND}/webinar-agent`;

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || `Request failed: ${res.status}`);
  return json as T;
}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || `Request failed: ${res.status}`);
  return json as T;
}

export const webinarApi = {
  saveProgress: (params: {
    submissionId?: string;
    webinarId: string;
    contact?: WebinarContact;
    lang?: string;
    consent?: boolean;
    answers?: Record<string, unknown>;
    source?: Record<string, string>;
  }) =>
    post<{ success: boolean; submissionId: string }>(`${BASE}/progress`, params),

  getProgress: (submissionId: string) =>
    get<{ success: boolean; submission: WebinarSubmission }>(`${BASE}/progress/${submissionId}`)
      .then(d => d.submission),

  complete: (submissionId: string, answers: Record<string, unknown>) =>
    post<{ success: boolean; submission: WebinarSubmission }>(
      `${BASE}/complete/${submissionId}`,
      { answers },
    ).then(d => d.submission),
};
