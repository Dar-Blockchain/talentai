export interface InterviewSessionParams {
  type: 'post' | 'skill';
  // post-interview
  jobId?: string;
  companyId?: string;
  ref?: string;
  // skill-interview
  skill?: string;
  category?: string;
  language?: string;
}

export function encodeInterviewSession(params: InterviewSessionParams): string {
  return btoa(JSON.stringify(params))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export function decodeInterviewSession(encoded: string): InterviewSessionParams | null {
  try {
    const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4;
    const parsed = JSON.parse(atob(pad ? b64 + '='.repeat(4 - pad) : b64));
    if (!parsed?.type) return null;
    return parsed as InterviewSessionParams;
  } catch {
    return null;
  }
}

export function buildInterviewUrl(params: InterviewSessionParams): string {
  return `/interviews/${encodeInterviewSession(params)}`;
}
