// PostInterviewAssessmentData is defined locally in PostInterviewAssessments.tsx
// since its shape is specific to that component's API response.

export interface AdminPostInterviewStats {
  total: number;
  excellent: number;
  satisfactory: number;
  needsWork: number;
  archived: number;
}
