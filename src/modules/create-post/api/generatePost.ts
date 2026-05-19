import axiosInstance from "@/utils/axiosInstance";
import type { GeneratePostPayload, GeneratePostResponse } from "../types";

export async function generatePost(payload: GeneratePostPayload): Promise<GeneratePostResponse> {
  const { jobDescription, salary, contractType, workMode, language } = payload;

  const salaryText = `\n\nSalary Range: ${salary.currency}${salary.min?.toLocaleString()} - ${salary.currency}${salary.max?.toLocaleString()}`;
  const contractTypeText = contractType ? `\nContract Type: ${contractType}` : "";
  const workModeText = workMode ? `\nWork Mode: ${workMode}` : "";
  const descriptionWithDetails = jobDescription + salaryText + contractTypeText + workModeText;

  const res = await axiosInstance.post("post/generate-job-post", {
    description: descriptionWithDetails,
    contractType,
    workMode,
    language,
  });

  return res.data;
}
