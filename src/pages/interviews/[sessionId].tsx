"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { type RootState } from "@/store/store";
import Header from "@/modules/shared/layouts/home/HomeHeader";
import DashboardHeader from "@/modules/shared/layouts/dashboard/DashboardHeader";
import InvalidInterviewLink from "@/modules/interviews/shared/components/InvalidInterviewLink";
import { PostInterviewFlow } from "@/modules/interviews/post-interview";
import { SkillInterviewFlow } from "@/modules/interviews/skill-interview";
import {
  decodeInterviewSession,
  type InterviewSessionParams,
} from "@/lib/interviewSession";

function InterviewPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"preview" | "interview">("preview");
  const isLoggedIn = !!useSelector((state: RootState) => state.user.connectedUser.user?._id);

  if (!router.isReady) return <div className="min-h-screen bg-background" />;

  const params: InterviewSessionParams | null =
    typeof router.query.sessionId === "string"
      ? decodeInterviewSession(router.query.sessionId)
      : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {phase !== "interview" && (
        isLoggedIn
          ? <DashboardHeader onOpenMobile={() => {}} hideMenuButton />
          : <Header forceSignup />
      )}
      <div className="flex-1 flex flex-col">
        {params?.type === "post" && params.jobId && (
          <PostInterviewFlow jobId={params.jobId} onPhaseChange={setPhase} />
        )}
        {params?.type === "skill" && params.skill && (
          <SkillInterviewFlow
            skill={params.skill}
            category={params.category}
            language={params.language}
            skillType={params.skillType}
            onPhaseChange={setPhase}
          />
        )}
        {!params && <InvalidInterviewLink />}
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(InterviewPage), { ssr: false });
