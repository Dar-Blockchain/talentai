import React from 'react';
import InterviewContainer from './InterviewContainer';
import AgentStatusPanel from './AgentStatusPanel';
import {
  type InterviewStatus,
  type ConnectionStatus,
  type CameraStatus,
  type AgentState,
} from '../../types/interview';

interface InterviewControlsPanelProps {
  interviewStatus: InterviewStatus;
  isHydrated: boolean;
  connectionStatus: ConnectionStatus;
  cameraStatus: CameraStatus;
  agentState: AgentState;
  currentTranscript?: string;
  canSubmit?: boolean;
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
  canSubmit,
  resultsReady,
  isVoiceActive,
  isInReadingTime,
  readingTimeLeft,
  onStartInterview,
  onSubmitAnswer,
  onSkipQuestion,
}) => (
  <div className="order-2 md:order-3 flex flex-col gap-2 min-h-0">
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
      currentTranscript={currentTranscript}
      canSubmit={canSubmit}
      isInReadingTime={isInReadingTime}
      readingTimeLeft={readingTimeLeft}
      onSubmitAnswer={onSubmitAnswer}
      onSkipQuestion={onSkipQuestion}
    />
  </div>
);

export default InterviewControlsPanel;
