import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { type RootState } from '@/store/store';
import { Progress } from '@/modules/shared/ui/shadcn/progress';
import { Button } from '@/modules/shared/ui/shadcn/button';
import QuestionPanel from './QuestionPanel';
import CameraPreview from './CameraPreview';
import FaceAlertOverlay from './FaceAlertOverlay';
import InterviewControlsPanel from './InterviewControlsPanel';
import InterviewContainer from './InterviewContainer';
import InterviewConnectionBanner from './InterviewConnectionBanner';
import InterviewSessionHeader from './InterviewSessionHeader';
import GDPRConsentModal from '../modals/GDPRConsentModal';
import SecurityModals from '../modals/SecurityModals';
import ConfirmLeaveModal from './ConfirmLeaveModal';
import FeedbackModal from './FeedbackModal';
import { interviewScreenStyles } from '../../styles/interviewScreen.styles';
import { type Coverage, type InterviewMessage, type InterviewConfig } from '../../types/interview';
import { type UseInterviewSocketReturn } from '../../types/hooks';
import { type UseAudioTranscriptionReturn } from '../../types/hooks';
import { type UseInterviewTimerReturn } from '../../types/hooks';
import { type UseCameraReturn } from '../../types/hooks';
import { type UseSecurityMonitoringReturn } from '../../types/hooks';
import type { UseIdentityGuardReturn } from '../../hooks/useIdentityGuard';
import type { UseCameraGuardReturn } from '../../hooks/useCameraGuard';

interface InterviewScreenProps {
  session: {
    socket: UseInterviewSocketReturn;
    audio: UseAudioTranscriptionReturn;
    timer: UseInterviewTimerReturn;
    camera: UseCameraReturn;
    security: UseSecurityMonitoringReturn;
    identityGuard?: UseIdentityGuardReturn;
    cameraGuard?: UseCameraGuardReturn;
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
  /** Overrides the header's computed job/assessment title (e.g. campaign title + module type for campaign interviews). */
  titleOverride?: string;
  /** Overrides the lobby's "Back to post details" label (e.g. "Back to campaign" for campaign interviews). */
  backLabel?: string;
  onBack?: () => void;
}

export default function InterviewScreen({
  session,
  configData,
  titleOverride,
  backLabel,
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
    socket, audio, timer, camera, security, identityGuard, cameraGuard,
    coverage, resultsReady, assessmentId,
    startInterview, endInterview, skipQuestion,
  } = session;

  const { jobData, interviewConfig } = configData;

  const faceDetected = !!identityGuard && identityGuard.status === 'watching' && identityGuard.faceCount === 1;

  const SKILL_TYPES = ['TECHNICAL_SKILL', 'SOFT_SKILL', 'ASSESSMENT', 'EVALUATION'];
  const isSkillInterview = !!interviewConfig && SKILL_TYPES.includes(interviewConfig.interviewType);
  const reportPath = isSkillInterview && assessmentId
    ? `/candidate/skills/interviews/${assessmentId}`
    : undefined;

  const isActive = socket.interviewStatus === 'active';

  // Camera is on but no face is currently visible — blocks the whole screen
  // (and, via the audio hook's cameraLive gate below, pauses mic/submit too)
  // until the candidate is back in frame.
  const noFaceBlocking = isActive && identityGuard?.status === 'watching' && identityGuard.faceCount === 0;
  const canSpeak = (cameraGuard?.cameraLive ?? true) && !noFaceBlocking;

  // Confirm-leave + feedback modal
  const [confirmOpen,  setConfirmOpen]  = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const pendingUrlRef = useRef<string | null>(null);
  const confirmedRef  = useRef(false);

  useEffect(() => {
    if (resultsReady && (!isSkillInterview || assessmentId)) setFeedbackOpen(true);
  }, [resultsReady, assessmentId, isSkillInterview]);

  useEffect(() => {
    if (!isActive) return;
    const handleRouteChange = (url: string) => {
      if (confirmedRef.current) { confirmedRef.current = false; return; }
      pendingUrlRef.current = url;
      setConfirmOpen(true);
      // cancelled: true tells Next.js this is intentional — suppresses the dev error overlay
      throw Object.assign(new Error('interview-leave-cancelled'), { cancelled: true });
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
          titleOverride={titleOverride}
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
              lastQuestion.type === 'question' || lastQuestion.type === 'follow_up' || lastQuestion.type === 'new_topic'
                ? questionCount
                : 0  // greeting shows with generic label, no number
            }
            allowCopy={isSkillInterview}
          />
        )}

        {/* Silence warning — fixed popup bottom-center */}
        {isActive && audio.silenceWarning !== null && audio.silenceWarning > 0 && (
          <div
            className="fixed bottom-6 left-1/2 z-50"
            style={{ transform: 'translateX(-50%)', animation: 'iv-fade-in 0.25s ease' }}
          >
            <div
              className="rounded-2xl border overflow-hidden"
              style={{
                background: '#fff',
                borderColor: 'rgba(245,158,11,0.5)',
                boxShadow: '0 8px 40px rgba(245,158,11,0.18)',
                minWidth: 280,
              }}
            >
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg,#fde68a,#f59e0b)' }} />
              <div className="px-5 py-3.5">
                <p className="font-sans font-bold text-[0.88rem] text-[#111827] leading-tight mb-0.5">
                  No response detected
                </p>
                <p className="font-sans text-[0.75rem] text-[#6b7280] mb-3">
                  Moving to the next question in <span className="font-bold text-[#d97706]">{audio.silenceWarning}s</span>
                </p>
                <div className="h-1.5 rounded-full overflow-hidden bg-[rgba(245,158,11,0.12)]">
                  <div
                    className="h-full rounded-full transition-[width] duration-500 ease-linear"
                    style={{
                      width: `${(audio.silenceWarning / 30) * 100}%`,
                      background: 'linear-gradient(90deg,#fde68a,#f59e0b)',
                    }}
                  />
                </div>
              </div>
            </div>
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
              identityGuard={identityGuard}
              cameraGuard={cameraGuard}
            />
          </div>

          {/* Right: interview complete / controls / lobby */}
          {(resultsReady && (!isSkillInterview || assessmentId)) ? (
            <div className="bg-white rounded-[20px] border border-[rgba(106,211,156,0.15)] shadow-[0_2px_16px_rgba(16,69,63,0.06)] flex flex-col items-center justify-center gap-5 p-6 min-h-0 h-full">
              {/* Animated check */}
              <div className="relative flex items-center justify-center">
                <span className="absolute w-20 h-20 rounded-full bg-green-100 animate-ping opacity-20" />
                <div className="relative w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center shadow-md">
                  <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Interview Complete</h2>
                <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                  Your responses have been recorded<br />and analyzed successfully.
                </p>
              </div>

              <div className="w-full h-px bg-gray-100" />

              <div className="w-full flex flex-col gap-2">
                {(isSkillInterview ? [
                  { emoji: '🤖', label: 'Your interview has been analyzed by AI' },
                  { emoji: '📊', label: 'Your skill profile has been updated' },
                  { emoji: '✅', label: 'Full report is ready to view' },
                ] : [
                  { emoji: '🤖', label: 'Your interview has been analyzed by AI' },
                  { emoji: '✅', label: 'Your responses have been saved successfully' },
                ]).map(({ emoji, label }) => (
                  <div key={label} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-base">{emoji}</span>
                    <span className="text-sm text-gray-600 font-medium">{label}</span>
                  </div>
                ))}
              </div>

              <div className="w-full flex flex-col gap-2.5">
                {reportPath && (
                  <Button variant="ghost" onClick={() => router.push(reportPath)}
                    className="w-full h-auto py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 active:scale-95 text-white hover:text-white text-sm font-bold shadow-md shadow-violet-200">
                    View Report
                  </Button>
                )}
                <Button variant="outline" onClick={() => router.push(dashboardPath)}
                  className="w-full h-auto py-3 rounded-2xl text-gray-600 text-sm font-semibold active:scale-95">
                  Go to Dashboard
                </Button>
              </div>
            </div>
          ) : isActive ? (
            <InterviewControlsPanel
              interviewStatus={socket.interviewStatus}
              isHydrated={socket.isHydrated}
              connectionStatus={socket.connectionStatus}
              cameraStatus={camera.cameraStatus}
              agentState={audio.agentState}
              currentTranscript={audio.currentTranscript}
              canSubmit={audio.canSubmit}
              cameraLive={canSpeak}
              cameraBlockedSubmit={audio.cameraBlockedSubmit}
              resultsReady={resultsReady}
              isVoiceActive={audio.isVoiceActive}
              isInReadingTime={audio.isInReadingTime}
              readingTimeLeft={audio.readingTimeLeft}
              onStartInterview={startInterview}
              onSubmitAnswer={audio.sendAccumulatedAnswer}
              onSkipQuestion={skipQuestion}
            />
          ) : socket.interviewStatus === 'ended' ? (
            <div className="bg-white rounded-[20px] border border-[rgba(106,211,156,0.15)] shadow-[0_2px_16px_rgba(16,69,63,0.06)] flex flex-col items-center justify-center p-6 min-h-0 h-full">
              <InterviewContainer
                noBorder
                interviewStatus={socket.interviewStatus}
                isHydrated={socket.isHydrated}
                connectionStatus={socket.connectionStatus}
                cameraStatus={camera.cameraStatus}
                agentState={audio.agentState}
                currentTranscript={audio.currentTranscript}
                resultsReady={false}
                faceDetected={faceDetected}
                onStartInterview={startInterview}
              />
            </div>
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
                  faceDetected={faceDetected}
                  onStartInterview={startInterview}
                  onBack={handleBack}
                  backLabel={backLabel}
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

      <FaceAlertOverlay active={noFaceBlocking} onComplete={endInterview} />

      <ConfirmLeaveModal open={confirmOpen} onConfirm={handleConfirmLeave} onCancel={handleCancelLeave} />

      <GDPRConsentModal
        open={!camera.consentGiven}
        onAccept={camera.giveConsent}
        onDecline={handleBack}
      />

      {/* Feedback modal (star rating popup) */}
      <FeedbackModal
        open={feedbackOpen}
        interviewId={assessmentId ?? undefined}
        interviewType={interviewConfig?.interviewType}
        onDone={() => setFeedbackOpen(false)}
      />

    </div>
  );
}
