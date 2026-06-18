import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { type RootState } from '@/store/store';
import { Progress } from '@/modules/shared/ui/shadcn/progress';
import QuestionPanel from './QuestionPanel';
import CameraPreview from './CameraPreview';
import InterviewControlsPanel from './InterviewControlsPanel';
import InterviewContainer from './InterviewContainer';
import InterviewConnectionBanner from './InterviewConnectionBanner';
import InterviewSessionHeader from './InterviewSessionHeader';
import GDPRConsentModal from '../modals/GDPRConsentModal';
import SecurityModals from '../modals/SecurityModals';
import ConfirmLeaveModal from './ConfirmLeaveModal';
import { interviewScreenStyles } from '../../styles/interviewScreen.styles';
import { type Coverage, type InterviewMessage, type InterviewConfig } from '../../types/interview';
import { type UseInterviewSocketReturn } from '../../types/hooks';
import { type UseAudioTranscriptionReturn } from '../../types/hooks';
import { type UseInterviewTimerReturn } from '../../types/hooks';
import { type UseCameraReturn } from '../../types/hooks';
import { type UseSecurityMonitoringReturn } from '../../types/hooks';

interface InterviewScreenProps {
  session: {
    socket: UseInterviewSocketReturn;
    audio: UseAudioTranscriptionReturn;
    timer: UseInterviewTimerReturn;
    camera: UseCameraReturn;
    security: UseSecurityMonitoringReturn;
    coverage: Coverage | null;
    resultsReady: boolean;
    assessmentId?: string | null;
    startInterview: () => Promise<void>;
    endInterview: () => void;
    skipQuestion: () => void;
  };
  configData: {
    jobData: any;
    interviewConfig: InterviewConfig | null;
  };
  onBack?: () => void;
}

export default function InterviewScreen({
  session,
  configData,
  onBack,
}: InterviewScreenProps) {
  const router = useRouter();
  const { t } = useTranslation('modules/interview/interview');
  const userRole = useSelector((state: RootState) => state.user.connectedUser.user?.role);
  const dashboardPath =
    userRole === 'Admin'    ? '/admin/dashboard'    :
    userRole === 'Employee' ? '/employee/dashboard'  :
    userRole === 'Company'  ? '/company/dashboard'   :
                              '/candidate/dashboard';

  const handleBack = onBack ?? (() => {
    const ref = router.query.ref as string | undefined;
    if (ref) {
      router.push(ref, undefined, { shallow: false, scroll: false });
    } else {
      router.back();
    }
  });

  const {
    socket, audio, timer, camera, security,
    coverage, resultsReady, assessmentId,
    startInterview, endInterview, skipQuestion,
  } = session;

  const { jobData, interviewConfig } = configData;

  const SKILL_TYPES = ['TECHNICAL_SKILL', 'SOFT_SKILL', 'ASSESSMENT', 'EVALUATION'];
  const isSkillInterview = !!interviewConfig && SKILL_TYPES.includes(interviewConfig.interviewType);
  const reportPath = isSkillInterview && assessmentId
    ? `/candidate/skill-interview/report/${assessmentId}`
    : undefined;

  const isActive = socket.interviewStatus === 'active';

  // Confirm-leave + feedback modals
  const [confirmOpen, setConfirmOpen] = useState(false);
  const pendingUrlRef = useRef<string | null>(null);
  const confirmedRef  = useRef(false);

  useEffect(() => {
    if (!isActive) return;
    const handleRouteChange = (url: string) => {
      if (confirmedRef.current) { confirmedRef.current = false; return; }
      pendingUrlRef.current = url;
      setConfirmOpen(true);
      throw new Error('interview-leave-cancelled');
    };
    router.events.on('routeChangeStart', handleRouteChange);
    return () => router.events.off('routeChangeStart', handleRouteChange);
  }, [isActive, router.events]);

  const handleConfirmLeave = useCallback(() => {
    confirmedRef.current = true;
    setConfirmOpen(false);
    endInterview();
  }, [endInterview]);

  const handleCancelLeave = useCallback(() => {
    setConfirmOpen(false);
    pendingUrlRef.current = null;
  }, []);

  const connectionBannerText = useMemo(() => {
    switch (socket.connectionStatus) {
      case 'connecting':  return t('connection.connecting');
      case 'error':       return t('connection.error');
      default:            return t('connection.reconnecting');
    }
  }, [socket.connectionStatus, t]);

  const lastQuestion = useMemo((): InterviewMessage | null => {
    const visible = audio.conversationHistory.filter((m) => m.type !== 'system');
    return visible.at(-1) ?? null;
  }, [audio.conversationHistory]);

  const questionCount = useMemo(
    () => audio.conversationHistory.filter(
      (m) => m.type === 'question' || m.type === 'follow_up' || m.type === 'new_topic',
    ).length,
    [audio.conversationHistory],
  );

  return (
    <div className={interviewScreenStyles.root}>
      {/* Connection warning banner */}
      {socket.isHydrated && socket.connectionStatus !== 'connected' && (
        <InterviewConnectionBanner text={connectionBannerText} />
      )}

      {/* Main content */}
      <div className={`max-w-[1536px] mx-auto w-full ${interviewScreenStyles.container}`}>
        {/* Header */}
        <InterviewSessionHeader
          jobData={jobData}
          interviewConfig={interviewConfig}
          isActive={isActive}
          elapsedTime={timer.elapsedTime}
          timeWarning={timer.timeWarning}
          coverage={coverage ? Math.round(coverage.overall || 0) : null}
          onEndInterview={() => setConfirmOpen(true)}
          endInterviewLabel={t('end_interview')}
        />

        {/* Question strip (active only) */}
        {isActive && lastQuestion && (
          <QuestionPanel
            currentMessage={lastQuestion}
            isInReadingTime={audio.isInReadingTime}
            readingTimeLeft={audio.readingTimeLeft}
            questionHighlight={audio.questionHighlight}
            questionAnswerElapsed={audio.questionAnswerElapsed}
            questionAnswerRemaining={audio.questionAnswerRemaining}
            agentState={audio.agentState}
            questionNumber={
              lastQuestion.type === 'question' || lastQuestion.type === 'follow_up'
                ? questionCount
                : 0
            }
          />
        )}

        {/* Silence warning banner */}
        {isActive && audio.silenceWarning !== null && (
          <div
            className="mb-2 px-4 py-3 rounded-[12px] border"
            style={{
              background:   audio.silenceWarning === 0 ? '#F0FDF4' : '#FEF3C7',
              borderColor:  audio.silenceWarning === 0 ? '#6EE7B7' : '#F59E0B',
            }}
          >
            <p
              className="font-sans font-semibold text-[0.8rem] mb-2"
              style={{ color: audio.silenceWarning === 0 ? '#065F46' : '#92400E' }}
            >
              {audio.silenceWarning === 0
                ? 'Generating next question…'
                : `Still silent? Moving to the next question in ${audio.silenceWarning}s`}
            </p>
            <Progress
              value={audio.silenceWarning === 0 ? undefined : (audio.silenceWarning / 30) * 100}
              className="h-1 rounded-full"
              style={{
                background: audio.silenceWarning === 0 ? '#A7F3D0' : '#FDE68A',
              } as React.CSSProperties}
            />
          </div>
        )}

        {/* 2-column grid */}
        <div className={interviewScreenStyles.grid}>
          {/* Left: Camera */}
          <div className="bg-white rounded-[20px] border border-[rgba(106,211,156,0.15)] shadow-[0_2px_16px_rgba(16,69,63,0.06)] p-4 md:p-[1.75rem] flex flex-col min-h-0 h-full">
            <CameraPreview
              videoRef={camera.videoRef}
              cameraStatus={camera.cameraStatus}
              cameraError={camera.cameraError}
              isConnecting={audio.isConnecting}
              interviewStatus={socket.interviewStatus}
              audioContextRef={audio.audioContextRef}
              audioStreamRef={audio.audioStreamRef}
              attachStream={camera.attachStream}
            />
          </div>

          {/* Right: controls or lobby */}
          {isActive ? (
            <InterviewControlsPanel
              interviewStatus={socket.interviewStatus}
              isHydrated={socket.isHydrated}
              connectionStatus={socket.connectionStatus}
              cameraStatus={camera.cameraStatus}
              agentState={audio.agentState}
              currentTranscript={audio.currentTranscript}
              canSubmit={audio.canSubmit}
              resultsReady={resultsReady}
              isVoiceActive={audio.isVoiceActive}
              isInReadingTime={audio.isInReadingTime}
              readingTimeLeft={audio.readingTimeLeft}
              onStartInterview={startInterview}
              onSubmitAnswer={audio.sendAccumulatedAnswer}
              onSkipQuestion={skipQuestion}
            />
          ) : (
            <div className={`${interviewScreenStyles.lobbyCard} overflow-hidden`}>
              <div className={interviewScreenStyles.lobbyAccentBar} />
              <div className="p-4 md:p-5">
                <InterviewContainer
                  noBorder
                  interviewStatus={socket.interviewStatus}
                  isHydrated={socket.isHydrated}
                  connectionStatus={socket.connectionStatus}
                  cameraStatus={camera.cameraStatus}
                  agentState={audio.agentState}
                  currentTranscript={audio.currentTranscript}
                  resultsReady={resultsReady}
                  onStartInterview={startInterview}
                  onBack={handleBack}
                  dashboardPath={dashboardPath}
                  reportPath={reportPath}
                  jobTitle={jobData?.jobDetails?.title || jobData?.title || ''}
                  companyName={
                    jobData?.createdBy?.name ||
                    jobData?.companyName ||
                    interviewConfig?.context?.targetCompany ||
                    jobData?.user?.username ||
                    ''
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmLeaveModal open={confirmOpen} onConfirm={handleConfirmLeave} onCancel={handleCancelLeave} />


      {/* <SecurityModals
        showFirstViolationModal={security.showFirstViolationModal}
        showSecurityModal={security.showSecurityModal}
        violationType={security.violationType}
        securityViolationCount={security.securityViolationCount}
        onDismissFirst={() => security.setShowFirstViolationModal(false)}
        onReturnToDashboard={() => router.push(dashboardPath)}
      /> */}

      <GDPRConsentModal
        open={!camera.consentGiven}
        onAccept={camera.giveConsent}
        onDecline={handleBack}
      />

      {/* Interview complete overlay */}
      {resultsReady && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="relative bg-white w-full max-w-md mx-4 rounded-3xl shadow-2xl overflow-hidden">
            {/* Top accent */}
            <div className="h-1.5 w-full bg-linear-to-r from-violet-500 via-purple-500 to-indigo-500" />

            <div className="flex flex-col items-center gap-6 px-8 py-10">
              {/* Icon */}
              <div className="relative flex items-center justify-center">
                <span className="absolute w-24 h-24 rounded-full bg-green-100 animate-ping opacity-30" />
                <div className="relative w-20 h-20 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center shadow-lg">
                  <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Interview Complete</h2>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                  Your responses have been recorded<br />and analyzed successfully.
                </p>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-gray-100" />

              {/* Highlights */}
              <div className="w-full flex flex-col gap-2.5">
                {[
                  { emoji: '🤖', label: 'Your interview has been analyzed by AI' },
                  { emoji: '📊', label: 'Your skill profile has been updated' },
                  { emoji: '✅', label: 'Full report is ready to view' },
                ].map(({ emoji, label }) => (
                  <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="text-base">{emoji}</span>
                    <span className="text-sm text-gray-600 font-medium">{label}</span>
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div className="w-full flex gap-3 mt-1">
                {reportPath && (
                  <button
                    onClick={() => router.push(reportPath)}
                    className="flex-1 py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-700 active:scale-95 text-white text-sm font-bold transition-all shadow-md shadow-violet-200 cursor-pointer"
                  >
                    View Report
                  </button>
                )}
                <button
                  onClick={() => router.push(dashboardPath)}
                  className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
