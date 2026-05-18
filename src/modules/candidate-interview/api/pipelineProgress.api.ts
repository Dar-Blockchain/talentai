import axiosInstance from '@/utils/axiosInstance';
import {
  PipelineProgressResponse,
  InitializePipelineResponse,
  UpdatePipelineStepPayload,
  UpdatePipelineStepResponse,
} from '../types/api';

export async function fetchPipelineProgress(
  candidateId: string,
  jobId: string,
): Promise<PipelineProgressResponse> {
  const { data } = await axiosInstance.get(
    `api/pipeline-interview/progress/${candidateId}/${jobId}`,
  );
  return data;
}

export async function initializePipelineProgress(
  candidateId: string,
  jobId: string,
): Promise<InitializePipelineResponse> {
  const { data } = await axiosInstance.post(
    `api/pipeline-interview/progress/initialize`,
    { candidateId, jobId },
  );
  return data;
}

export async function updatePipelineStep(
  payload: UpdatePipelineStepPayload,
): Promise<UpdatePipelineStepResponse> {
  const { data } = await axiosInstance.put(
    `api/pipeline-interview/progress/update-step`,
    payload,
  );
  return data;
}
