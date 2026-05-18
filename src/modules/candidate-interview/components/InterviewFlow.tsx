import React, { useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { useNotification } from "@/hooks/useNotification";
import { type RootState } from "@/store/store";
import { useInterviewConfig } from "../hooks/useInterviewConfig";
import { useInterviewSession } from "../hooks/useInterviewSession";
import InterviewIntroStep from "./intro/InterviewIntroStep";
import InterviewScreen from "./session/InterviewScreen";
import JobPreviewPanel from "./job-preview/JobInterviewPanel";

export default function InterviewFlow() {
  const router = useRouter();
  const authUser = useSelector(
    (state: RootState) => state.user.connectedUser.user,
  );
  const profile = useSelector(
    (state: RootState) => state.user.connectedUser.profile,
  );

  const hasJobId =
    router.isReady &&
    typeof router.query.jobId === "string" &&
    !!router.query.jobId;

  const [step, setStep] = useState<"intro" | "interview">("intro");

  const { notification, showNotification, hideNotification } =
    useNotification();

  const {
    interviewConfig,
    setInterviewConfig,
    isPipelineJob,
    candidateProgress,
    currentPipelineStep,
    pipelineLoading,
    showBlockedModal,
    showFailedModal,
    blockMessage,
    jobData,
  } = useInterviewConfig({ showNotification });

  const session = useInterviewSession({
    interviewConfig,
    setInterviewConfig,
    isPipelineJob,
    profile,
    authUser,
    jobData,
    notify: showNotification,
  });

  // Unauthenticated visitor with a job link — wait for jobData, then show preview
  if (!authUser && hasJobId) {
    if (!jobData) return null;
    return <JobPreviewPanel jobData={jobData} />;
  }

  if (step === "intro") {
    return (
      <InterviewIntroStep
        interviewConfig={interviewConfig}
        setInterviewConfig={setInterviewConfig}
        jobData={jobData}
        onDone={() => setStep("interview")}
      />
    );
  }

  return (
    <InterviewScreen
      session={session}
      configData={{
        interviewConfig,
        isPipelineJob,
        candidateProgress,
        currentPipelineStep,
        pipelineLoading,
        showBlockedModal,
        showFailedModal,
        blockMessage,
        jobData,
      }}
      notification={notification}
      hideNotification={hideNotification}
    />
  );
}
