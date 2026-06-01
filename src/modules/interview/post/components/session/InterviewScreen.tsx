import React, { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { type RootState } from "@/store/store";
import { Box, Snackbar, Alert, Container, LinearProgress, Typography } from "@mui/material";
import QuestionPanel from "./QuestionPanel";
import CameraPreview from "./CameraPreview";
import InterviewControlsPanel from "./InterviewControlsPanel";
import InterviewContainer from "./InterviewContainer";
import InterviewConnectionBanner from "./InterviewConnectionBanner";
import InterviewSessionHeader from "./InterviewSessionHeader";
import GDPRConsentModal from "../modals/GDPRConsentModal";
import SecurityModals from "../modals/SecurityModals";
import ConfirmLeaveModal from "./ConfirmLeaveModal";
import { interviewScreenSx } from "../../styles/interviewScreen.styles";
import { type Coverage, type InterviewMessage } from "../../types/interview";
import { type JobPost } from "../../types/api";
import { type InterviewConfig } from "../../types/interview";
import { type UseInterviewSocketReturn } from "../../hooks/useInterviewSocket";
import { type UseAudioTranscriptionReturn } from "../../hooks/useAudioTranscription";
import { type UseInterviewTimerReturn } from "../../hooks/useInterviewTimer";
import { type UseCameraReturn } from "../../hooks/useCamera";
import { type UseSecurityMonitoringReturn } from "../../hooks/useSecurityMonitoring";

interface InterviewScreenProps {
  session: {
    socket: UseInterviewSocketReturn;
    audio: UseAudioTranscriptionReturn;
    timer: UseInterviewTimerReturn;
    camera: UseCameraReturn;
    security: UseSecurityMonitoringReturn;
    coverage: Coverage | null;
    resultsReady: boolean;
    startInterview: () => Promise<void>;
    endInterview: () => void;
    skipQuestion: () => void;
  };
  configData: {
    jobData: JobPost | null;
    interviewConfig: InterviewConfig | null;
  };
  notification: {
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  };
  hideNotification: () => void;
  onBack?: () => void;
}

export default function InterviewScreen({
  session,
  configData,
  notification,
  hideNotification,
  onBack,
}: InterviewScreenProps) {
  const router = useRouter();
  const { t } = useTranslation("modules/interview/interview");
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
    socket,
    audio,
    timer,
    camera,
    security,
    coverage,
    resultsReady,
    startInterview,
    endInterview,
    skipQuestion,
  } = session;

  const { jobData, interviewConfig } = configData;

  const isActive = socket.interviewStatus === "active";

  // ── Confirm-leave modal ────────────────────────────────────────────────────
  const [confirmOpen, setConfirmOpen] = useState(false);
  const pendingUrlRef  = useRef<string | null>(null);
  const confirmedRef   = useRef(false);

  // Intercept Next.js client-side navigation while interview is active
  useEffect(() => {
    if (!isActive) return;
    const handleRouteChange = (url: string) => {
      if (confirmedRef.current) { confirmedRef.current = false; return; }
      pendingUrlRef.current = url;
      setConfirmOpen(true);
      // Throwing cancels the navigation in Next.js router
      throw new Error("interview-leave-cancelled");
    };
    router.events.on("routeChangeStart", handleRouteChange);
    return () => router.events.off("routeChangeStart", handleRouteChange);
  }, [isActive, router.events]);

  const handleConfirmLeave = useCallback(() => {
    confirmedRef.current = true;
    setConfirmOpen(false);
    endInterview();
    const url = pendingUrlRef.current;
    pendingUrlRef.current = null;
    if (url) router.push(url);
  }, [endInterview, router]);

  const handleCancelLeave = useCallback(() => {
    setConfirmOpen(false);
    pendingUrlRef.current = null;
  }, []);
  // ──────────────────────────────────────────────────────────────────────────

  const connectionBannerText = useMemo(() => {
    switch (socket.connectionStatus) {
      case "connecting":
        return t("connection.connecting");
      case "error":
        return t("connection.error");
      default:
        return t("connection.reconnecting");
    }
  }, [socket.connectionStatus, t]);

  const lastQuestion = useMemo((): InterviewMessage | null => {
    const visible = audio.conversationHistory.filter(
      (m) => m.type !== "system",
    );
    return visible.at(-1) ?? null;
  }, [audio.conversationHistory]);

  const questionCount = useMemo(
    () =>
      audio.conversationHistory.filter(
        (m) => m.type === "question" || m.type === "follow_up" || m.type === "new_topic",
      ).length,
    [audio.conversationHistory],
  );

  return (
    /* Root — locks to viewport, no page scroll on md+ */
    <Box sx={interviewScreenSx.root}>
      {/* Connection warning banner */}
      {socket.isHydrated && socket.connectionStatus !== "connected" && (
        <InterviewConnectionBanner text={connectionBannerText} />
      )}

      {/* Main content fills remaining height */}
      <Container maxWidth="xl" sx={interviewScreenSx.container}>
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <InterviewSessionHeader
          jobData={jobData}
          interviewConfig={interviewConfig}
          isActive={isActive}
          elapsedTime={timer.elapsedTime}
          timeWarning={timer.timeWarning}
          coverage={coverage ? Math.round(coverage.overall || 0) : null}
          onEndInterview={() => setConfirmOpen(true)}
          endInterviewLabel={t("end_interview")}
        />

        {/* ── Question strip (active only) ─────────────────────────────── */}
        {isActive && lastQuestion && (
          <QuestionPanel
            currentMessage={lastQuestion}
            isInReadingTime={audio.isInReadingTime}
            readingTimeLeft={audio.readingTimeLeft}
            questionHighlight={audio.questionHighlight}
            questionNumber={
              lastQuestion.type === "question" ||
              lastQuestion.type === "follow_up"
                ? questionCount
                : 0
            }
          />
        )}

        {/* ── Silence warning banner ───────────────────────────────────── */}
        {isActive && audio.silenceWarning !== null && (
          <Box sx={{ mb: 1, px: 2, py: 1.25, bgcolor: audio.silenceWarning === 0 ? '#F0FDF4' : '#FEF3C7', border: `1px solid ${audio.silenceWarning === 0 ? '#6EE7B7' : '#F59E0B'}`, borderRadius: '12px' }}>
            <Typography sx={{ fontSize: '0.8rem', color: audio.silenceWarning === 0 ? '#065F46' : '#92400E', fontWeight: 600, mb: 0.75 }}>
              {audio.silenceWarning === 0
                ? 'Generating next question…'
                : `Still silent? Moving to the next question in ${audio.silenceWarning}s`}
            </Typography>
            <LinearProgress
              variant={audio.silenceWarning === 0 ? 'indeterminate' : 'determinate'}
              value={audio.silenceWarning === 0 ? undefined : (audio.silenceWarning / 30) * 100}
              sx={{
                height: 4, borderRadius: 2,
                bgcolor: audio.silenceWarning === 0 ? '#A7F3D0' : '#FDE68A',
                '& .MuiLinearProgress-bar': { bgcolor: audio.silenceWarning === 0 ? '#10B981' : '#F59E0B' },
              }}
            />
          </Box>
        )}

        {/* ── 2-column grid — same layout in both active and lobby ─────── */}
        <Box sx={interviewScreenSx.grid}>
          {/* Left: Camera */}
          <Box sx={{ bgcolor: "#fff", borderRadius: "20px", border: "1px solid rgba(106,211,156,0.15)", boxShadow: "0 2px 16px rgba(16,69,63,0.06)", p: { xs: 1.5, md: 1.75 }, display: "flex", flexDirection: "column", minHeight: 0, height: "100%" }}>
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
          </Box>

          {/* Right: controls when active, readiness card when lobby */}
          {isActive ? (
            <InterviewControlsPanel
              interviewStatus={socket.interviewStatus}
              isHydrated={socket.isHydrated}
              connectionStatus={socket.connectionStatus}
              cameraStatus={camera.cameraStatus}
              agentState={audio.agentState}
              currentTranscript={audio.currentTranscript}
              resultsReady={resultsReady}
              isVoiceActive={audio.isVoiceActive}
              isInReadingTime={audio.isInReadingTime}
              readingTimeLeft={audio.readingTimeLeft}
              onStartInterview={startInterview}
              onSubmitAnswer={audio.sendAccumulatedAnswer}
              onSkipQuestion={skipQuestion}
            />
          ) : (
            <Box sx={{ ...interviewScreenSx.lobbyCard, overflow: "hidden" }}>
              <Box sx={interviewScreenSx.lobbyAccentBar} />
              <Box sx={{ p: { xs: 2, md: 2.5 } }}>
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
                  jobTitle={jobData?.jobDetails?.title || jobData?.title || ""}
                  companyName={
                    jobData?.companyName ||
                    interviewConfig?.context?.targetCompany ||
                    jobData?.user?.companyName ||
                    jobData?.user?.username ||
                    ""
                  }
                />
              </Box>
            </Box>
          )}
        </Box>
      </Container>

      <ConfirmLeaveModal
        open={confirmOpen}
        onConfirm={handleConfirmLeave}
        onCancel={handleCancelLeave}
      />

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
        onDecline={() => router.back()}
      />

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={hideNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={notification.severity} onClose={hideNotification}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
