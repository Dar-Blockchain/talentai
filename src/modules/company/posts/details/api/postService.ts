import axiosInstance from "@/utils/axiosInstance";

const INTERVIEW_TYPE_MAP: Record<string, string> = {
  TECHNICAL_SKILL:  "TECHNICAL_INTERVIEW",
  SOFT_SKILL:       "ASSESSMENT",
  SALARY_INTERVIEW: "HR_INTERVIEW",
  PSYCHOTECHNIC:    "EVALUATION",
};

export const postService = {
  updatePost: async (jobId: string | number, jobData: any) => {
    if (!jobData || !jobId) throw new Error("Job ID or data is missing");
    const res = await axiosInstance.put(`post/updatePost/${jobId}`, jobData);
    const job = res.data.data || res.data;
    return { success: true, jobData: job };
  },

  fetchJobById: async (jobId: string) => {
    const res = await axiosInstance.get(`post/details/${jobId}`);
    return res.data?.data;
  },

  savePostInterviewAssessment: async (postId: string, interviewData: any) => {
    const normalizedInterviewData = interviewData?.interviewType
      ? { ...interviewData, interviewType: INTERVIEW_TYPE_MAP[interviewData.interviewType] ?? interviewData.interviewType }
      : interviewData;
    const res = await axiosInstance.post("post-interview-assessments", { post: postId, interviewData: normalizedInterviewData });
    return res.data;
  },

  fetchCandidateAssessments: async (params: { page?: number; limit?: number } = {}) => {
    const { page = 1, limit = 10 } = params;
    const queryParams = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    const res = await axiosInstance.get(`post-interview-assessments/candidate/my?${queryParams}`);
    const data = res.data;
    const results: any[] = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    return {
      items: results,
      pagination: {
        total: data.pagination?.totalCount || data.total || data.count || results.length,
        page: data.pagination?.page || page, limit: data.pagination?.limit || limit,
        totalPages: data.pagination?.totalPages || Math.ceil((data.count || results.length) / limit),
        hasNextPage: data.pagination?.hasNextPage || false, hasPrevPage: data.pagination?.hasPrevPage || false,
      },
    };
  },

  fetchCompanyAssessments: async (params: { page?: number; limit?: number } = {}) => {
    const { page = 1, limit = 50 } = params;
    const res = await axiosInstance.get("post-interview-assessments/company/mine");
    const data = res.data;
    const rawData = data?.data || data;
    let normalized: any[] = [];
    if (Array.isArray(rawData)) {
      if (rawData.length > 0 && rawData[0]?.assessments && rawData[0]?.post) {
        rawData.forEach((group: any) => {
          const assessments = group.assessments || [];
          if (!assessments.length) return;
          const sorted = [...assessments].sort((a: any, b: any) =>
            new Date(b.createdAt || b.assessment?.createdAt || 0).getTime() - new Date(a.createdAt || a.assessment?.createdAt || 0).getTime()
          );
          const latest = sorted[0];
          const a = latest.assessment || latest;
          normalized.push({ ...a, post: a.post || group.post, candidatePostStepProgress: latest.candidatePostStepProgress || null, assessmentsCount: assessments.length });
        });
      } else {
        normalized = rawData;
      }
    } else if (Array.isArray(rawData?.results)) {
      normalized = rawData.results;
    } else if (Array.isArray(rawData?.assessments)) {
      normalized = rawData.assessments;
    }
    const items = normalized.map((a: any) => ({
      _id: a._id, candidate: a.candidate, candidateName: a.candidate?.username || "",
      candidateEmail: a.candidate?.email || "", post: a.post, jobTitle: a.post?.jobDetails?.title || "",
      jobStatus: a.post?.status || "", interviewData: a.interviewData,
      interviewType: a.interviewData?.interviewType || "HR_INTERVIEW",
      coverageScore: a.interviewData?.finalReport?.coverage?.overall || 0,
      analytics: a.interviewData?.analytics, duration: a.interviewData?.analytics?.duration || 0,
      messageCount: a.interviewData?.analytics?.messageCount || 0,
      timestamp: a.createdAt || a.timestamp, createdAt: a.createdAt, updatedAt: a.updatedAt,
      summary: a.interviewData?.finalReport?.summary || "",
      recommendations: a.interviewData?.finalReport?.recommendations || [],
      coverageAreas: a.interviewData?.finalReport?.coverage?.areas || {},
      aiAnalysis: a.interviewData?.finalReport?.aiAnalysis || {},
      completed: a.completed, candidatePostStepProgress: a.candidatePostStepProgress,
      assessmentsCount: a.assessmentsCount,
    }));
    return {
      items,
      pagination: {
        total: data.count || items.length, page, limit,
        totalPages: Math.ceil((data.count || items.length) / limit),
        hasNextPage: false, hasPrevPage: false,
      },
    };
  },

  fetchAssessmentDetails: async (id: string) => {
    const res = await axiosInstance.get(`post-interview-assessments/${id}`);
    const responseData = res.data.data || res.data;
    return { assessment: responseData.assessment || responseData, stepsData: responseData.stepsData || null };
  },
};
