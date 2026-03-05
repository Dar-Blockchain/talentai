export const getScoreColor = (score: number): string => {
  if (score >= 80) return '#667eea';
  if (score >= 60) return '#43e97b';
  return '#fa709a';
};

export const getScoreBg = (score: number): string => {
  if (score >= 80) return '#f3e7ff';
  if (score >= 60) return '#e8f5e9';
  return '#fff3e0';
};

export const getPerformanceMessage = (score: number): string => {
  if (score >= 90) return 'Outstanding performance! You demonstrate expert-level knowledge.';
  if (score >= 80) return 'Excellent work! You show advanced proficiency.';
  if (score >= 70) return 'Good performance! You have solid intermediate skills.';
  if (score >= 60) return 'Developing well! Continue practicing to improve.';
  if (score >= 50) return 'Basic understanding shown. Focus on strengthening fundamentals.';
  return 'Needs improvement. Consider additional study and practice.';
};

export const determineLevel = (score: number): string => {
  if (score === 0) return 'Not Assessed';
  if (score >= 90) return 'Expert';
  if (score >= 80) return 'Advanced';
  if (score >= 70) return 'Intermediate';
  if (score >= 60) return 'Developing';
  return 'Beginner';
};
