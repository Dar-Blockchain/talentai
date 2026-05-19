import React, { useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { useNotification } from "@/hooks/useNotification";
import { type RootState } from "@/store/store";
import { useInterviewConfig } from "../hooks/useInterviewConfig";
import { useInterviewSession } from "../hooks/useInterviewSession";
import InterviewScreen from "./session/InterviewScreen";
import JobPreviewPanel from "./job-preview/JobInterviewPanel";

export default function InterviewFlow() {
  const router = useRouter();
  const authUser = useSelector(
    (state: RootState) => state.user.connectedUser.user,
  );

  const hasJobId =
    router.isReady &&
    typeof router.query.jobId === "string" &&
    !!router.query.jobId;

  const [step, setStep] = useState<"preview" | "interview">("preview");

  const { notification, showNotification, hideNotification } =
    useNotification();

  const { interviewConfig, setInterviewConfig, jobData } = useInterviewConfig({
    showNotification,
  });

  const session = useInterviewSession({
    interviewConfig,
    setInterviewConfig,
    authUser,
    jobData,
    notify: showNotification,
  });

  const handleStartInterview = useCallback(() => {
    const langs = jobData?.interviewLanguages as string[] | undefined;
    const lang = langs?.[0] || "en";
    setInterviewConfig({
      ...interviewConfig,
      sessionSettings: { ...interviewConfig.sessionSettings, language: lang },
    });
    setStep("interview");
  }, [jobData, interviewConfig, setInterviewConfig]);

  // Show job preview when there is a jobId and the interview hasn't started
  if (hasJobId && step !== "interview") {
    if (!jobData) return null;
    return (
      <JobPreviewPanel
        jobData={jobData}
        onStartInterview={authUser ? handleStartInterview : undefined}
      />
    );
  }

  return (
    <InterviewScreen
      session={session}
      configData={{ jobData, interviewConfig }}
      notification={notification}
      hideNotification={hideNotification}
    />
  );
}
