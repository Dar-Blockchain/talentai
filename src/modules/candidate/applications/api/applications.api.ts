import axiosInstance from '@/utils/axiosInstance';
import type { ApplicationsParams } from '../types/application.types';

export async function fetchCandidateApplications(params: ApplicationsParams = {}) {
  const q = new URLSearchParams();
  if (params.page)                    q.set('page',      String(params.page));
  if (params.limit)                   q.set('limit',     String(params.limit));
  if (params.status)                  q.set('status',    params.status);
  if (params.search)                  q.set('search',    params.search);
  if (params.sortBy)                  q.set('sortBy',    params.sortBy);
  if (params.scoreMin !== undefined)  q.set('scoreMin',  String(params.scoreMin));
  if (params.scoreMax !== undefined)  q.set('scoreMax',  String(params.scoreMax));
  if (params.dateFrom)                q.set('dateFrom',  params.dateFrom);
  if (params.dateTo)                  q.set('dateTo',    params.dateTo);
  const res = await axiosInstance.get(`job-applications/candidate/my${q.toString() ? `?${q}` : ''}`);
  return { data: Array.isArray(res.data?.data) ? res.data.data : [], pagination: res.data?.pagination ?? {} };
}

export async function fetchCandidateApplicationStats() {
  const res = await axiosInstance.get('job-applications/candidate/my/stats');
  return res.data;
}

export async function fetchApplicationById(id: string) {
  const res = await axiosInstance.get(`job-applications/${id}`);
  return (res.data?.data ?? res.data) as any;
}

export async function withdrawCandidateApplication(applicationId: string) {
  const res = await axiosInstance.patch(`job-applications/${applicationId}/withdraw`);
  return res.data;
}

export async function reactivateCandidateApplication(applicationId: string) {
  const res = await axiosInstance.patch(`job-applications/${applicationId}/reactivate`);
  return res.data;
}
