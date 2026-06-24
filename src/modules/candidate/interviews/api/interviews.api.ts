import { fetchCandidateApplications } from '@/modules/candidate/applications/api/applications.api';
import type { CandidateApplication } from '@/modules/candidate/applications/types/application.types';

export async function fetchJobInterviews(): Promise<CandidateApplication[]> {
  const [scheduled, completed] = await Promise.all([
    fetchCandidateApplications({ status: 'interview_scheduled', limit: 50 }),
    fetchCandidateApplications({ status: 'interview_completed', limit: 50 }),
  ]);
  const merged = [...scheduled.data, ...completed.data];
  merged.sort((a, b) => {
    const da = new Date(a.appliedAt ?? a.createdAt ?? 0).getTime();
    const db = new Date(b.appliedAt ?? b.createdAt ?? 0).getTime();
    return db - da;
  });
  return merged;
}
