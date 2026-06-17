import React, { useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { useNotification } from "@/hooks/useNotification";
import { type RootState } from "@/store/store";
import { useInterviewConfig } from "../hooks/useInterviewConfig";
import { useInterviewSession } from "../hooks/useInterviewSession";
import InterviewScreen from "../../shared/components/session/InterviewScreen";
import JobPreviewPanel from "./job-preview/JobInterviewPanel";
import InterviewLoadingScreen from "../../shared/components/layout/InterviewLoadingScreen";
import LoadingState from "@/components/ui/LoadingState";
import { useTranslation } from "react-i18next";

interface InterviewFlowProps {
  jobId?: string;
}

export default function InterviewFlow({ jobId: propJobId }: InterviewFlowProps = {}) {
  const { t } = useTranslation("modules/interview/interview");

  const router = useRouter();
  const authUser = useSelector(
    (state: RootState) => state.user.connectedUser.user,
  );

  const resolvedJobId = propJobId
    ?? (router.isReady && typeof router.query.jobId === "string" ? router.query.jobId : undefined);

  const hasJobId = !!resolvedJobId;

  const [step, setStep] = useState<"preview" | "interview">("preview");

  const { notification, showNotification, hideNotification } =
    useNotification();

  const { interviewConfig, setInterviewConfig, jobData, isJobLoading, isConfigLoading } = useInterviewConfig({
    showNotification,
    jobId: propJobId !== undefined ? propJobId : undefined,
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

  // Guard: router.query is empty on the first SSR/hydration render.
  if (!propJobId && !router.isReady) return <LoadingState message={t("loading")} />;

  if (hasJobId && step !== "interview") {
    if (!jobData) return (
      <InterviewLoadingScreen
        title="Loading interview"
        subtitle="Fetching job details, please wait a moment."
      />
    );
    return (
      <JobPreviewPanel
        jobData={jobData}
        isConfigLoading={isConfigLoading}
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
      onBack={() => setStep("preview")}
    />
  );
}
