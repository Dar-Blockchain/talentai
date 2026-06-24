export interface AdminAssessmentSummary {
  _id: string;
  jobId?: any;
  jobName?: string;
  jobDescription?: string;
  numberOfAttempts: number;
  averageScore: number;
  totalQuestions: number;
  assessments: any[];
}
