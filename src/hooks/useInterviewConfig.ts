import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import { RootState } from '@/store/store';
import { InterviewConfig } from '@/types/interview';
import { buildInterviewConfigFromURL, URLParams } from '@/utils/interviewConfigBuilder';

export interface UseInterviewConfigReturn {
  interviewConfig: InterviewConfig;
  setInterviewConfig: (config: InterviewConfig) => void;
  isPipelineJob: boolean;
  candidateProgress: any;
  currentPipelineStep: number | null;
  pipelineLoading: boolean;
  configLoading: boolean;
  showBlockedModal: boolean;
  showFailedModal: boolean;
  blockMessage: string;
  setShowBlockedModal: (show: boolean) => void;
  setShowFailedModal: (show: boolean) => void;
  jobData: any | null;
  limitReached: boolean;
  limitMessage: string;
  limitJobTitle: string;
  isExpired: boolean;
}

export interface UseInterviewConfigOptions {
  showNotification: (message: string, severity: 'error' | 'warning' | 'info') => void;
}

const DEFAULT_CONFIG: InterviewConfig = {
  interviewType: 'HR_INTERVIEW',
  testReason: 'Preparing for software engineer behavioral interview',
  context: {
    targetCompany: 'Google',
    targetRole: 'Software Engineer',
    experienceLevel: 'Mid-Level',
    interviewGoal: 'Assess behavioral competencies and cultural fit'
  },
  models: {
    fastModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    thinkingModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    analysisModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo'
  },
  sessionSettings: {
    duration: 30,
    language: 'en',
    difficulty: 'intermediate',
    silenceTimeout: 5,
    silenceIntelligence: {
      enabled: true,
      adaptiveThresholds: true,
      maxSilencePrompts: 3,
      naturalPauseDetection: true,
      contextAwareThresholds: true
    }
  }
};

export const useInterviewConfig = ({
  showNotification,
}: UseInterviewConfigOptions): UseInterviewConfigReturn => {
  const router = useRouter();
  const authUser = useSelector((state: RootState) => state.user.connectedUser.user);
  const profile = useSelector((state: RootState) => state.user.connectedUser.profile);

  const [interviewConfig, setInterviewConfig] = useState<InterviewConfig>(DEFAULT_CONFIG);
  const [isPipelineJob, setIsPipelineJob] = useState(false);
  const [candidateProgress, setCandidateProgress] = useState<any>(null);
  const [currentPipelineStep, setCurrentPipelineStep] = useState<number | null>(null);
  const [pipelineLoading, setPipelineLoading] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [showFailedModal, setShowFailedModal] = useState(false);
  const [blockMessage, setBlockMessage] = useState('');
  const [jobData, setJobData] = useState<any | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [limitMessage, setLimitMessage] = useState('');
  const [limitJobTitle, setLimitJobTitle] = useState('');
  const [configLoading, setConfigLoading] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  const fetchJobInterviewConfig = async (jobId: string) => {
    setConfigLoading(true);
    try {
      const token = Cookies.get('api_token');
      const ref = router.query.ref as string | undefined;
      const isPublicLink = !ref || ref === 'link';

      // Public interview link (ref=link) — no login required, proceed without token
      if (!token && !isPublicLink) {
        const returnUrl = window.location.pathname + window.location.search;
        router.push(`/signin?returnUrl=${encodeURIComponent(returnUrl)}`);
        setConfigLoading(false);
        return;
      }

      setPipelineLoading(true);

      console.log('🔍 Fetching interview config for jobId:', jobId);

      // 1. Check if this is a pipeline job
      // Guests (no token) use the public endpoint; authenticated users use the protected one
      const postUrl = token
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}post/getPostById/${jobId}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}post/details/${jobId}`;

      const postHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) postHeaders['Authorization'] = `Bearer ${token}`;

      const postResponse = await fetch(postUrl, { headers: postHeaders });

      if (!postResponse.ok) {
        if ((postResponse.status === 401 || postResponse.status === 403) && token) {
          const returnUrl = window.location.pathname + window.location.search;
          router.push(`/signin?returnUrl=${encodeURIComponent(returnUrl)}`);
          return;
        }
        throw new Error('Failed to fetch job details');
      }

      const postData = await postResponse.json();
      console.log('📋 Raw post data:', postData);
      // post/details wraps in data.data, post/getPostById wraps in data.data or data.post
      const post = postData.data?.data || postData.data || postData.post || postData;
      setJobData(post);

      // Check expiry from post data directly — same logic as the backend controller.
      // This fires for both authenticated and unauthenticated users before any
      // further API calls, so the expired screen is always shown.
      if (post.expirationDate && new Date(post.expirationDate) < new Date()) {
        setIsExpired(true);
        setPipelineLoading(false);
        setConfigLoading(false);
        return;
      }

      const isPipeline = post?.creationType === 'pipeline';

      console.log('📋 Job detection:', {
        postId: post._id,
        creationType: post.creationType,
        isPipeline: isPipeline,
        hasPostSteps: !!post.PostSteps,
        postStepsCount: post.PostSteps?.length || 0
      });
      console.log('📋 Job type:', isPipeline ? 'Pipeline ⚡' : 'Regular');
      setIsPipelineJob(isPipeline);

      if (isPipeline) {
        const candidateId = profile?.userId?._id || profile?.userId || authUser?._id;

        if (!candidateId) {
          throw new Error('Pipeline jobs require authentication. Please log in to start the interview.');
        }

        console.log('🔍 Fetching candidate progress for candidateId (User ID):', candidateId);

        let progressResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}api/pipeline-interview/progress/${candidateId}/${jobId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          }
        );

        let progressData;

        if (!progressResponse.ok) {
          console.log('📋 No existing progress found, initializing...');

          const initResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}api/pipeline-interview/progress/initialize`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                candidateId,
                jobId
              })
            }
          );

          if (!initResponse.ok) {
            const errorData = await initResponse.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to initialize interview progress.');
          }

          const initData = await initResponse.json();
          console.log('✅ Progress initialized:', initData.isNew ? 'new record' : 'existing record');

          progressResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}api/pipeline-interview/progress/${candidateId}/${jobId}`,
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              }
            }
          );

          if (!progressResponse.ok) {
            throw new Error('Failed to fetch progress after initialization.');
          }
        }

        progressData = await progressResponse.json();
        console.log('✅ Progress fetched - current step:', progressData.currentStep?.stepNumber);

        const currentStep = progressData.currentStep;

        console.log('🎯 Current step config:', {
          stepNumber: currentStep.stepNumber,
          stepType: currentStep.stepType,
          hasSkills: !!currentStep.interviewParams.skills,
          hasSoftSkills: !!currentStep.interviewParams.softSkills,
          passThreshold: currentStep.passThreshold
        });

        const dynamicConfig = buildInterviewConfigFromURL({
          type: currentStep.stepType,
          ...currentStep.interviewParams,
          skills: currentStep.interviewParams.skills,
          categories: currentStep.interviewParams.categories,
          assessmentLevel: currentStep.interviewParams.assessmentLevel,
          passThreshold: currentStep.interviewParams.passThreshold || currentStep.passThreshold,
          softSkills: currentStep.interviewParams.softSkills
        } as any);

        setInterviewConfig(dynamicConfig);
        setCandidateProgress(progressData.progress);
        setCurrentPipelineStep(currentStep.stepNumber);
        console.log('step4444', currentStep.stepNumber);

        localStorage.setItem('interview_jobId', jobId);
        localStorage.setItem('interview_stepId', currentStep.stepId);
        localStorage.setItem('interview_stepNumber', currentStep.stepNumber.toString());
        localStorage.setItem('interview_passThreshold', (currentStep.passThreshold || 70).toString());
        localStorage.setItem('interview_source', 'pipeline');

        console.log('✅ Pipeline interview configured');

      } else {
        console.log('📋 Regular interview - fetching standard config...');

        const configHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) configHeaders['Authorization'] = `Bearer ${token}`;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}post/interview-config/${jobId}`,
          { headers: configHeaders }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ Error from interview-config endpoint:', errorData);

          if (response.status === 429) {
            setLimitReached(true);
            setLimitMessage(errorData.message || 'Your company has reached the monthly interview limit.');
            setLimitJobTitle(errorData.jobTitle || '');
            setPipelineLoading(false);
            setConfigLoading(false);
            return;
          }

          if (errorData.isPipeline) {
            throw new Error('This is a pipeline job - please refresh the page. The interview configuration is being loaded from the pipeline steps.');
          }

          if (response.status === 410) {
            setIsExpired(true);
            setPipelineLoading(false);
            setConfigLoading(false);
            return;
          }

          // Guest without token — endpoint requires auth but we still want to proceed
          // with default HR config so the interview can start
          if (response.status === 401 && !token) {
            console.warn('⚠️ interview-config requires auth — using default config for guest');
            const defaultConfig = buildInterviewConfigFromURL({ type: 'hr' });
            setInterviewConfig(defaultConfig);
            localStorage.setItem('interview_jobId', jobId);
            localStorage.setItem('interview_type', 'hr');
            setPipelineLoading(false);
            setConfigLoading(false);
            return;
          }

          const errMsg = errorData.message || errorData.error || response.statusText;
          throw new Error(`Failed to fetch job config: ${errMsg}`);
        }

        const config = await response.json();
        console.log('✅ Fetched standard interview config');

        setInterviewConfig(config);

        localStorage.setItem('interview_jobId', jobId);
        localStorage.setItem('interview_type', 'hr');
      }

      setPipelineLoading(false);
      setConfigLoading(false);

    } catch (error) {
      console.error('❌ Error fetching job interview config:', error);
      setPipelineLoading(false);
      setConfigLoading(false);
      showNotification('Failed to load interview configuration', 'error');

      const defaultConfig = buildInterviewConfigFromURL({ type: 'hr' });
      setInterviewConfig(defaultConfig);
    }
  };

  useEffect(() => {
    if (!router.isReady) return;

    const { jobId } = router.query;

    if (jobId && typeof jobId === 'string') {
      console.log('🎯 Job-based interview detected, jobId:', jobId);
      fetchJobInterviewConfig(jobId);
      return;
    }

    const urlParams: URLParams = {
      type: router.query.type as any,
      skill: router.query.skill as string,
      proficiency: router.query.proficiency as string,
      category: router.query.category as string,
      company: router.query.company as string,
      role: router.query.role as string,
      language: router.query.language as string,
      difficulty: router.query.difficulty as string,
      duration: router.query.duration as string,
      deep: router.query.deep as string,
    };

    console.log('📋 Building interview config from URL params:', urlParams);

    if (urlParams.type || urlParams.skill) {
      const dynamicConfig = buildInterviewConfigFromURL(urlParams);
      console.log('✅ Generated dynamic interview config:', dynamicConfig);
      setInterviewConfig(dynamicConfig);

      localStorage.removeItem('interview_type');
      localStorage.removeItem('interview_skill');
      localStorage.removeItem('interview_category');
      localStorage.removeItem('interview_proficiency');
      localStorage.removeItem('interview_role');
      localStorage.removeItem('interview_jobId');

      if (urlParams.type) {
        localStorage.setItem('interview_type', urlParams.type);
        console.log('💾 Stored type in localStorage:', urlParams.type);
      }
      if (urlParams.skill) {
        localStorage.setItem('interview_skill', urlParams.skill);
        console.log('💾 Stored skill in localStorage:', urlParams.skill);
      }
      if (urlParams.category) {
        localStorage.setItem('interview_category', urlParams.category);
        console.log('💾 Stored category in localStorage:', urlParams.category);
      }
      if (urlParams.proficiency) {
        localStorage.setItem('interview_proficiency', urlParams.proficiency);
        console.log('💾 Stored proficiency in localStorage:', urlParams.proficiency);
      }
      if (urlParams.role) {
        localStorage.setItem('interview_role', urlParams.role);
        console.log('💾 Stored role in localStorage:', urlParams.role);
      }
    } else {
      console.log('ℹ️  No URL params detected, using default HR interview config');
    }
  }, [router.isReady, router.query]);

  return {
    interviewConfig,
    setInterviewConfig,
    isPipelineJob,
    candidateProgress,
    currentPipelineStep,
    pipelineLoading,
    configLoading,
    showBlockedModal,
    showFailedModal,
    blockMessage,
    setShowBlockedModal,
    setShowFailedModal,
    jobData,
    limitReached,
    limitMessage,
    limitJobTitle,
    isExpired,
  };
};
