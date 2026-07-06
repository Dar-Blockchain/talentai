"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import InterviewHeader from "@/modules/interviews/shared/components/layout/InterviewHeader";
import InvalidInterviewLink from "@/modules/interviews/shared/components/InvalidInterviewLink";
import { PostInterviewFlow } from "@/modules/interviews/post-interview";
import { SkillInterviewFlow } from "@/modules/interviews/skill-interview";
import {
  decodeInterviewSession,
  type InterviewSessionParams,
} from "@/lib/interviewSession";

function InterviewPage() {
  const router = useRouter();

  if (!router.isReady) return <div className="min-h-screen bg-background" />;

  const params: InterviewSessionParams | null =
    typeof router.query.sessionId === "string"
      ? decodeInterviewSession(router.query.sessionId)
      : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <InterviewHeader />
      <div className="flex-1 flex flex-col">
        {params?.type === "post" && params.jobId && (
          <PostInterviewFlow jobId={params.jobId} />
        )}
        {params?.type === "skill" && params.skill && (
          <SkillInterviewFlow
            skill={params.skill}
            category={params.category}
            language={params.language}
          />
        )}
        {!params && <InvalidInterviewLink />}
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(InterviewPage), { ssr: false });
