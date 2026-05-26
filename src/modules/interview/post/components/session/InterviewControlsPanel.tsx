import React from "react";
import { Box } from "@mui/material";
import InterviewContainer from "./InterviewContainer";
import AgentStatusPanel from "./AgentStatusPanel";
import {
  type InterviewStatus,
  type ConnectionStatus,
  type CameraStatus,
  type AgentState,
} from "../../types/interview";

interface InterviewControlsPanelProps {
  interviewStatus: InterviewStatus;
  isHydrated: boolean;
  connectionStatus: ConnectionStatus;
  cameraStatus: CameraStatus;
  agentState: AgentState;
  currentTranscript?: string;
  resultsReady: boolean;
  isVoiceActive: boolean;
  isInReadingTime?: boolean;
  readingTimeLeft?: number;
  onStartInterview: () => void;
  onSubmitAnswer: () => void;
  onSkipQuestion: () => void;
}

const InterviewControlsPanel: React.FC<InterviewControlsPanelProps> = ({
  interviewStatus,
  isHydrated,
  connectionStatus,
  cameraStatus,
  agentState,
  currentTranscript,
  resultsReady,
  isVoiceActive,
  isInReadingTime,
  readingTimeLeft,
  onStartInterview,
  onSubmitAnswer,
  onSkipQuestion,
}) => (
  <Box
    sx={{
      order: { xs: 2, md: 3 },
      display: "flex",
      flexDirection: "column",
      gap: 1,
      minHeight: 0,
    }}
  >
    <InterviewContainer
      interviewStatus={interviewStatus}
      isHydrated={isHydrated}
      connectionStatus={connectionStatus}
      cameraStatus={cameraStatus}
      agentState={agentState}
      currentTranscript={currentTranscript}
      resultsReady={resultsReady}
      onStartInterview={onStartInterview}
    />
    <AgentStatusPanel
      interviewStatus={interviewStatus}
      agentState={agentState}
      isVoiceActive={isVoiceActive}
      isInReadingTime={isInReadingTime}
      readingTimeLeft={readingTimeLeft}
      onSubmitAnswer={onSubmitAnswer}
      onSkipQuestion={onSkipQuestion}
    />
  </Box>
);

export default InterviewControlsPanel;
