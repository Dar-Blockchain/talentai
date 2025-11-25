/**
 * Utility function to save interview data to the backend database
 *
 * This function takes interview analysis data and sends it to the backend
 * to be stored in the InterviewDetails collection in MongoDB
 */

interface InterviewDataPayload {
  candidate: string;
  company?: string;
  post?: string;
  type: string;
  interviewContext?: {
    targetCompany?: string;
    companyIndustry?: string;
    companyCulture?: string;
    targetRole?: string;
    experienceLevel?: string;
    interviewFormat?: string;
    simulationGoal?: string;
  };
  questions?: Array<{
    question: string;
    answer: string;
    status?: string;
    exampleCorrectAnswer?: string;
    partialCorrectPercentage?: number;
    partialCorrectReason?: string;
  }>;
  overallScore?: number;
  skillDetails?: Array<{
    name: string;
    type: string;
    requiredLevel?: number;
    proficiencyLevel?: number;
    experienceLevel?: string;
    confidenceScore?: number;
    questionAnswerList?: Array<{
      question: string;
      answer: string;
      status?: string;
      exampleCorrectAnswer?: string;
      partialCorrectPercentage?: number;
      partialCorrectReason?: string;
    }>;
  }>;
  recommendations?: string[];
  sessionId?: string;
}

interface SocketAnalysisData {
  finalReport?: {
    summary?: string;
    scores?: {
      overall?: number;
      technical?: number;
      communication?: number;
      problemSolving?: number;
    };
    coverage?: {
      areas?: {
        [key: string]: {
          percentage?: number;
          description?: string;
          indicators?: Array<{
            name: string;
            covered: boolean;
            proficiency?: string;
          }>;
        };
      };
    };
    recommendations?: {
      strengths?: string[];
      improvements?: string[];
      nextSteps?: string[];
    };
  };
  analytics?: {
    duration?: number;
    turnCount?: number;
    averageResponseTime?: number;
    questionsAsked?: number;
    questionsAnswered?: number;
    conversationQuality?: {
      clarity?: number;
      depth?: number;
      engagement?: number;
    };
  };
  sessionId?: string;
  interviewType?: string;
  timestamp?: string;
}

/**
 * Transform socket analysis data to backend API format
 */
function transformToBackendFormat(
  socketData: SocketAnalysisData,
  candidateId: string,
  skill?: string,
  role?: string
): InterviewDataPayload {
  const finalReport = socketData.finalReport || {};
  const recommendations = finalReport.recommendations || {};

  // Combine all recommendations into a single array
  const allRecommendations = [
    ...(recommendations.strengths || []),
    ...(recommendations.improvements || []),
    ...(recommendations.nextSteps || [])
  ];

  // Transform coverage areas into skillDetails
  const skillDetails: any[] = [];

  if (finalReport.coverage?.areas) {
    Object.entries(finalReport.coverage.areas).forEach(([areaName, areaData]: [string, any]) => {
      const skillDetail = {
        name: areaName.replace(/_/g, ' '),
        type: 'technical', // or 'soft' based on the area
        proficiencyLevel: Math.round((areaData.percentage || 0) / 20), // Convert percentage to 1-5 scale
        confidenceScore: areaData.percentage || 0,
        questionAnswerList: []
      };

      skillDetails.push(skillDetail);
    });
  }

  // Add primary skill if available
  if (skill || role) {
    const primarySkill = {
      name: skill || role || 'Primary Skill',
      type: 'technical',
      proficiencyLevel: Math.round((finalReport.scores?.overall || 0) / 20), // Convert to 1-5 scale
      confidenceScore: finalReport.scores?.overall || 0,
      questionAnswerList: []
    };

    skillDetails.unshift(primarySkill);
  }

  return {
    candidate: candidateId,
    type: socketData.interviewType || 'HR_INTERVIEW',
    overallScore: finalReport.scores?.overall || 0,
    skillDetails: skillDetails,
    recommendations: allRecommendations,
    sessionId: socketData.sessionId
  };
}

/**
 * Save interview data to backend API
 *
 * @param analysisData - The interview analysis data from socket event
 * @param candidateId - The ID of the candidate/user
 * @param token - Authentication token
 * @param skill - Optional: The skill being tested (e.g., "JavaScript", "React")
 * @param role - Optional: The role being interviewed for
 * @returns Promise with the saved interview details
 */
export async function saveInterviewData(
  analysisData: SocketAnalysisData,
  candidateId: string,
  token: string,
  skill?: string,
  role?: string
): Promise<any> {
  try {
    console.log('💾 [SaveInterview] Starting to save interview data...');
    console.log('📊 [SaveInterview] Analysis data:', analysisData);

    // Transform data to backend format
    const payload = transformToBackendFormat(analysisData, candidateId, skill, role);

    console.log('📤 [SaveInterview] Payload to send:', payload);
    console.log('📤 [SaveInterview] Payload JSON:', JSON.stringify(payload, null, 2));

    // Send to backend API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/interview-details`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [SaveInterview] Failed to save:', response.status, errorText);
      throw new Error(`Failed to save interview data: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ [SaveInterview] Successfully saved interview data:', result);

    // Store the interview ID for later retrieval
    if (result.data?._id || result._id) {
      const interviewId = result.data?._id || result._id;
      localStorage.setItem('last_interview_id', interviewId);
      console.log('💾 [SaveInterview] Stored interview ID:', interviewId);
    }

    return result;
  } catch (error) {
    console.error('❌ [SaveInterview] Error saving interview data:', error);
    throw error;
  }
}

/**
 * Save interview data from localStorage
 * Useful for saving data that was stored during the interview
 *
 * @param candidateId - The ID of the candidate/user
 * @param token - Authentication token
 * @returns Promise with the saved interview details or null if no data found
 */
export async function saveInterviewDataFromStorage(
  candidateId: string,
  token: string
): Promise<any | null> {
  try {
    // Get data from localStorage
    const storedData = localStorage.getItem('last_interview_analysis');

    if (!storedData) {
      console.warn('⚠️ [SaveInterview] No stored interview data found');
      return null;
    }

    const analysisData = JSON.parse(storedData);

    // Get skill and role from localStorage
    const skill = localStorage.getItem('interview_skill') || undefined;
    const role = localStorage.getItem('interview_role') || undefined;

    // Save to backend
    return await saveInterviewData(analysisData, candidateId, token, skill, role);
  } catch (error) {
    console.error('❌ [SaveInterview] Error saving from storage:', error);
    throw error;
  }
}

/**
 * Example usage in hr.tsx:
 *
 * ```typescript
 * import { saveInterviewData } from '@/utils/saveInterviewData';
 *
 * // In the 'interview_ended' socket event handler:
 * socket.on('interview_ended', async (data) => {
 *   console.log('🏁 Interview ended:', data);
 *
 *   // Store analysis data
 *   const analysisData = {
 *     finalReport: data.finalReport,
 *     analytics: data.analytics,
 *     sessionId: data.sessionId,
 *     interviewType: interviewConfig?.interviewType || 'HR_INTERVIEW',
 *     timestamp: new Date().toISOString()
 *   };
 *
 *   setInterviewAnalysis(analysisData);
 *   localStorage.setItem('last_interview_analysis', JSON.stringify(analysisData));
 *
 *   // Save to database
 *   try {
 *     const skill = localStorage.getItem('interview_skill');
 *     const role = localStorage.getItem('interview_role');
 *     const token = localStorage.getItem('api_token');
 *
 *     const savedInterview = await saveInterviewData(
 *       analysisData,
 *       session.user.id,
 *       token,
 *       skill,
 *       role
 *     );
 *
 *     console.log('✅ Interview saved to database:', savedInterview);
 *   } catch (error) {
 *     console.error('❌ Failed to save interview:', error);
 *     // Don't block the user, just log the error
 *   }
 * });
 * ```
 */
