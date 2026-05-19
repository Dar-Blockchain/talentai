import React, { useMemo } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { Box, Snackbar, Alert, Container } from "@mui/material";
import QuestionPanel from "./QuestionPanel";
import CameraPreview from "./CameraPreview";
import InterviewControlsPanel from "./InterviewControlsPanel";
import InterviewConnectionBanner from "./InterviewConnectionBanner";
import InterviewSessionHeader from "./InterviewSessionHeader";
import CoverageDashboard from "./CoverageDashboard";
import GDPRConsentModal from "../modals/GDPRConsentModal";
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
}

export default function InterviewScreen({
  session,
  configData,
  notification,
  hideNotification,
}: InterviewScreenProps) {
  const router = useRouter();
  const { t } = useTranslation("modules/interview/hr");

  const {
    socket,
    audio,
    timer,
    camera,
    coverage,
    resultsReady,
    startInterview,
    endInterview,
    skipQuestion,
  } = session;

  const { jobData, interviewConfig } = configData;

  const isActive = socket.interviewStatus === "active";

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
        (m) => m.type === "question" || m.type === "follow_up",
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
          onEndInterview={endInterview}
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

        {/* ── 3-column grid — fills remaining space, capped so columns aren't too tall ── */}
        <Box sx={interviewScreenSx.grid(!!coverage)}>
          {/* LEFT — Coverage (only shown when data is available) */}
          {coverage && <CoverageDashboard coverage={coverage} />}

          <CameraPreview
            videoRef={camera.videoRef}
            cameraStatus={camera.cameraStatus}
            cameraError={camera.cameraError}
            isConnecting={audio.isConnecting}
            interviewStatus={socket.interviewStatus}
            audioContextRef={audio.audioContextRef}
            attachStream={camera.attachStream}
          />

          {/* RIGHT — AI controls */}
          <InterviewControlsPanel
            interviewStatus={socket.interviewStatus}
            isHydrated={socket.isHydrated}
            connectionStatus={socket.connectionStatus}
            cameraStatus={camera.cameraStatus}
            agentState={audio.agentState}
            currentTranscript={
              audio.accumulatedTranscript || audio.currentTranscript
            }
            resultsReady={resultsReady}
            isVoiceActive={audio.speechPhase === "speaking"}
            onStartInterview={startInterview}
            onSubmitAnswer={audio.sendAccumulatedAnswer}
            onSkipQuestion={skipQuestion}
          />
        </Box>
      </Container>

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
