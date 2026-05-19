import React, { useMemo } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { Box, Snackbar, Alert, Container } from "@mui/material";
import QuestionPanel from "./QuestionPanel";
import CameraPreview from "./CameraPreview";
import AgentStatusPanel from "./AgentStatusPanel";
import InterviewContainer from "./InterviewContainer";
import InterviewConnectionBanner from "./InterviewConnectionBanner";
import InterviewSessionHeader from "./InterviewSessionHeader";
import InterviewProgressBar from "./InterviewProgressBar";
import SecurityModals from "../modals/SecurityModals";
import CoverageDashboard from "./CoverageDashboard";
import GDPRConsentModal from "../modals/GDPRConsentModal";
import {
  type Coverage,
  type InterviewMessage,
} from "../../types/interview";
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
    startInterview: () => Promise<void>;
    endInterview: () => void;
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
    security,
    coverage,
    startInterview,
    endInterview,
  } = session;

  const { jobData, interviewConfig } = configData;

  const isActive = socket.interviewStatus === "active";

  console.log("jobData:", jobData);

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
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#fff",
        userSelect: "none",
        WebkitUserSelect: "none",
        pt: 6,
      }}
    >
      {/* Yellow banner shown when the WebSocket is not yet connected or has dropped */}
      {socket.isHydrated && socket.connectionStatus !== "connected" && (
        <InterviewConnectionBanner text={connectionBannerText} />
      )}

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 2 } }}>
        {/* Top bar: interview title, company subtitle, elapsed timer, end button */}
        <InterviewSessionHeader
          jobData={jobData}
          interviewConfig={interviewConfig}
          isActive={isActive}
          elapsedTime={timer.elapsedTime}
          timeWarning={timer.timeWarning}
          onEndInterview={endInterview}
          endInterviewLabel={t("end_interview")}
        />

        {/* Coverage progress bar â€” shows overall topic completion percentage, visible only while active */}
        {isActive && (
          <InterviewProgressBar
            overall={coverage?.overall ?? 0}
            label={t("interview_completion")}
          />
        )}

        {/* â”€â”€ Main interview card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Box
          sx={{
            bgcolor: "#fff",
            borderRadius: "20px",
            border: "1px solid #c8eedd",
          }}
        >
          {/* Current question / follow-up text with reading countdown â€” hidden until interview starts */}
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

          {/* Two-column grid: camera feed (70%) | sidebar (30%) */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "7fr 3fr" },
              gap: 0,
            }}
          >
            {/* Left â€” live camera feed with mic-activity visualizer */}
            <Box sx={{ borderRight: { md: "1px solid #e6f8f1" }, p: 2.5 }}>
              <CameraPreview
                videoRef={camera.videoRef}
                cameraStatus={camera.cameraStatus}
                cameraError={camera.cameraError}
                isConnecting={audio.isConnecting}
                interviewStatus={socket.interviewStatus}
                audioContextRef={audio.audioContextRef}
                attachStream={camera.attachStream}
              />
            </Box>

            {/* Right â€” start / end / results controls + live transcript + AI voice indicator */}
            <Box
              sx={{
                p: 2.5,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {/* State-driven panel: shows start button, live transcript, or results link */}
              <InterviewContainer
                interviewStatus={socket.interviewStatus}
                isHydrated={socket.isHydrated}
                connectionStatus={socket.connectionStatus}
                cameraStatus={camera.cameraStatus}
                agentState={audio.agentState}
                currentTranscript={
                  audio.accumulatedTranscript || audio.currentTranscript
                }
                onStartInterview={startInterview}
              />
              {/* AI agent speaking / listening status and manual answer submit */}
              <AgentStatusPanel
                interviewStatus={socket.interviewStatus}
                agentState={audio.agentState}
                isVoiceActive={audio.speechPhase === "speaking"}
                onSubmitAnswer={audio.sendAccumulatedAnswer}
              />
            </Box>
          </Box>
        </Box>

        {/* Expandable topic-coverage breakdown â€” only rendered once coverage data arrives */}
        {coverage && <CoverageDashboard coverage={coverage} />}
      </Container>

      {/* GDPR consent gate â€” must be accepted before camera stream is attached */}
      <GDPRConsentModal
        open={!camera.consentGiven}
        onAccept={camera.giveConsent}
        onDecline={() => router.back()}
      />

      {/* Tab-switch / copy-paste violation warnings; second modal force-ends the session */}
      <SecurityModals
        showFirstViolationModal={security.showFirstViolationModal}
        showSecurityModal={security.showSecurityModal}
        violationType={security.violationType}
        securityViolationCount={security.securityViolationCount}
        onDismissFirst={() => security.setShowFirstViolationModal(false)}
        onReturnToDashboard={() => router.push("/candidate/dashboard")}
      />

      {/* Bottom-center toast for transient success / error / warning messages */}
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
