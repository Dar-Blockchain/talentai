import React, { useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft as ArrowBackOutlined,
  ClipboardList as AssessmentOutlined,
  BarChart3 as BarChartOutlined,
  Layers as LayersOutlined,
  Sparkles as AutoAwesomeOutlined,
  MessagesSquare as ForumOutlined,
} from "lucide-react";
import { DashboardLayout }        from "@/modules/shared/layouts";
import { usePostAssessmentQuery } from "@/modules/company/assessment/modal/queries";
import { useAssessmentModal }     from "@/modules/company/assessment/modal/hooks/useAssessmentModal";
import { AssessmentTarget }       from "@/modules/company/assessment/modal/types";
import { useJobApplicationQuery } from "@/modules/company/applications/hooks";
import AssessmentHero             from "@/modules/company/assessment/modal/components/AssessmentHero";
import ScoresTab                  from "@/modules/company/assessment/modal/components/ScoresTab";
import CoverageTab                from "@/modules/company/assessment/modal/components/CoverageTab";
import AiReportTab                from "@/modules/company/assessment/modal/components/AiReportTab";
import TranscriptTab              from "@/modules/company/assessment/modal/components/TranscriptTab";
import { Spinner } from "@/modules/shared/ui/shadcn/spinner";
import { Button } from "@/modules/shared/ui/shadcn/button";

const TAB_ICONS = [BarChartOutlined, LayersOutlined, AutoAwesomeOutlined, ForumOutlined];

const AssessmentPage: React.FC = () => {
  const router = useRouter();
  const { t }  = useTranslation("dashboard");
  const [tab, setTab] = useState(0);

  const { applicationId } = router.query as Record<string, string>;

  const {
    data: application,
    isLoading: isApplicationLoading,
    isError: isApplicationError,
    error: applicationError,
  } = useJobApplicationQuery(applicationId ?? null);

  const postId = application?.post?._id ?? null;
  const candidateUserId = typeof application?.profile?.userId === "object"
    ? application.profile.userId._id
    : application?.profile?.userId ?? null;

  const target: AssessmentTarget | null = postId && candidateUserId
    ? { applicationId, postId, candidateUserId }
    : null;

  const {
    data: assessment,
    isLoading: isAssessmentLoading,
    isError: isAssessmentError,
    error: assessmentError,
  } = usePostAssessmentQuery(postId, candidateUserId);

  const isLoading = isApplicationLoading || isAssessmentLoading;
  const isError   = isApplicationError || isAssessmentError;
  const error     = applicationError || assessmentError;

  const {
    name, email, letter, g1, g2, avatarUrl, bgColor,
    jobTitle, interviewType, createdAt,
    verdict, overallScore, vt, st, verdictLabel,
    scores, analytics, coverage, aiAssessment, requiredSkills, candidateProfile, recruiterReview, conversation,
    hasAreas, hasAiData, hasTranscript,
    TAB_SCORES, TAB_COVERAGE, TAB_REPORT, TAB_TRANSCRIPT,
  } = useAssessmentModal(assessment, target);

  const tabs = [
    { idx: TAB_SCORES,     label: t("pages.applications.assessment_modal.tab_scores")    },
    { idx: TAB_COVERAGE,   label: t("pages.applications.assessment_modal.tab_coverage"),  skip: !hasAreas },
    { idx: TAB_REPORT,     label: t("pages.applications.assessment_modal.tab_ai_report"), skip: !hasAiData },
    { idx: TAB_TRANSCRIPT, label: "Transcript",                                           skip: !hasTranscript },
  ].filter(t => !t.skip && t.idx >= 0);

  return (
    <DashboardLayout>
      {/* Top nav */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 hover:shadow-sm"
        >
          <ArrowBackOutlined size={16} />
        </Button>
        <div>
          <div className="text-[0.6rem] text-slate-400 font-bold uppercase tracking-widest">Interview Assessment</div>
          <div className="text-[0.95rem] font-black text-slate-900 leading-tight">{name || "Candidate"}</div>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Spinner className="size-10 text-violet-500" />
          <span className="text-sm text-slate-400 font-medium">{t("pages.applications.assessment_modal.loading")}</span>
        </div>
      )}

      {/* Error */}
      {!isLoading && isError && (
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
            <AssessmentOutlined size={28} color="#CBD5E1" />
          </div>
          <span className="text-sm font-semibold text-slate-700">{t("pages.applications.assessment_modal.not_found")}</span>
          <span className="text-xs text-slate-400">{error instanceof Error ? error.message : ""}</span>
        </div>
      )}

      {/* Content */}
      {!isLoading && assessment && target && (
        <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white">

          <AssessmentHero
            g1={g1} g2={g2} letter={letter} name={name} email={email}
            avatarUrl={avatarUrl} bgColor={bgColor}
            jobTitle={jobTitle} interviewType={interviewType} createdAt={createdAt}
            analytics={analytics} recruiterReview={recruiterReview}
            overallScore={overallScore}
            vt={vt} verdictLabel={verdictLabel}
          />

          {/* Tab bar */}
          <div className="flex border-b border-slate-100 bg-white px-6">
            {tabs.map(({ idx, label }, i) => {
              const Icon   = TAB_ICONS[i] ?? BarChartOutlined;
              const active = tab === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setTab(idx)}
                  className={`relative flex items-center gap-1.5 px-4 py-3.5 text-[0.8rem] font-semibold transition-colors outline-none bg-transparent border-none ${active ? "" : "text-slate-400 hover:text-slate-600"}`}
                  style={{ color: active ? vt.color : undefined }}
                >
                  <Icon size={15} />
                  {label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t-full" style={{ backgroundColor: vt.color }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab panels */}
          <div className="bg-slate-50/50">
            {tab === TAB_SCORES && (
              <ScoresTab
                verdict={verdict} overallScore={overallScore} vt={vt} st={st} verdictLabel={verdictLabel}
                scores={scores} analytics={analytics}
                requiredSkills={requiredSkills} aiAssessment={aiAssessment}
                scoreOverallLabel={t("pages.applications.assessment_modal.score_overall")}
                scoreCoverageLabel={t("pages.applications.assessment_modal.score_coverage")}
                scoreBreakdownLabel={t("pages.applications.assessment_modal.score_breakdown")}
                strengthsLabel={t("pages.applications.assessment_modal.strengths")}
                weakAreasLabel={t("pages.applications.assessment_modal.weak_areas")}
              />
            )}
            {tab === TAB_COVERAGE && hasAreas && (
              <CoverageTab coverage={coverage} overallCoverageLabel={t("pages.applications.assessment_modal.overall_coverage")} />
            )}
            {tab === TAB_REPORT && hasAiData && (
              <AiReportTab aiAssessment={aiAssessment} candidateProfile={candidateProfile} aiSummaryTitle={t("pages.applications.assessment_modal.ai_summary_title")} />
            )}
            {tab === TAB_TRANSCRIPT && hasTranscript && (
              <TranscriptTab conversation={conversation} />
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AssessmentPage;
