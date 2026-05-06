import axiosInstance from '@/utils/axiosInstance';

export const postGenerationService = {
  generatePost: async (payload: {
    jobDescription: string;
    salary: { min: number | null; max: number | null; currency: string };
    contractType?: string;
    workMode?: string;
    language?: string;
  }) => {
    const { jobDescription, salary, contractType, workMode, language } = payload;
    const salaryText = `\n\nSalary Range: ${salary.currency}${salary.min?.toLocaleString()} - ${salary.currency}${salary.max?.toLocaleString()}`;
    const contractTypeText = contractType ? `\nContract Type: ${contractType}` : '';
    const workModeText = workMode ? `\nWork Mode: ${workMode}` : '';
    const descriptionWithDetails = jobDescription + salaryText + contractTypeText + workModeText;
    const res = await axiosInstance.post('post/generate-job-post', {
      description: descriptionWithDetails,
      contractType,
      workMode,
      language,
    });
    return res.data;
  },
};
