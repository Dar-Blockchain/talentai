import React from "react";
import dynamic from "next/dynamic";
import { Box, Alert, Chip } from "@mui/material";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import PageHeader from "@/components/layout/dashboard/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import {
  CoverageAnalysis,
  CoverageAreas,
  AiAnalysisSection,
  SkillsSection,
  SummarySection,
  JobDetailsSection,
  RecommendationsSection,
  PipelineSteps,
} from "@/components/features/interview/assessment";
import { useAssessmentDetail } from "@/modules/company/assessment/detail/hooks/useAssessmentDetail";
import { MetaChip, StatBox, ScoreBadge } from "@/modules/company/assessment/detail/components";
import { TEAL, TEAL_BG, TEAL_BORDER, fmtDuration } from "@/modules/company/assessment/detail/components/constants";

const CompanyAssessmentPage: React.FC = () => {
  const { stepsData, loading, isError, derived } = useAssessmentDetail();

  return (
    <DashboardLayout>
      <Box>
        {loading && <LoadingOverlay height={400} message="Loading assessment…" color={TEAL} />}

        {!loading && isError && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>Failed to load assessment.</Alert>
        )}

        {!loading && !isError && derived && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

            <PageHeader
              title="Interview Assessment"
              subtitle={`${derived.candidateName} · ${derived.jobTitle} · ${derived.timestamp}`}
              breadcrumbs={[
                { label: "Dashboard", href: "/company/dashboard" },
                { label: "Job Posts", href: "/company/posts" },
                { label: "Assessment" },
              ]}
              actions={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                  <Chip
                    label={derived.interviewType.replace(/_/g, " ")}
                    size="small"
                    sx={{ height: 26, fontSize: "12px", fontWeight: 600, bgcolor: TEAL_BG, color: TEAL, border: `1px solid ${TEAL_BORDER}`, borderRadius: "13px" }}
                  />
                  <ScoreBadge score={derived.coverageScore} />
                </Box>
              }
            />

            {/* Meta + analytics */}
            <SectionCard>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                <MetaChip icon={<PersonOutlined sx={{ fontSize: 14 }} />}          label={derived.candidateName} />
                <MetaChip icon={<WorkOutlined sx={{ fontSize: 14 }} />}            label={derived.jobTitle} />
                <MetaChip icon={<CalendarTodayOutlined sx={{ fontSize: 14 }} />}   label={derived.timestamp} />
                {(derived.analytics.duration ?? 0) > 0 && (
                  <MetaChip icon={<AccessTimeOutlined sx={{ fontSize: 14 }} />}    label={fmtDuration(derived.analytics.duration!)} />
                )}
              </Box>
              {(derived.analytics.messageCount || derived.analytics.completedAreas || derived.analytics.coveragePercentage) ? (
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 1.5 }}>
                  <StatBox label="Messages"      value={derived.analytics.messageCount ?? 0}                                                    color="#6366F1" />
                  <StatBox label="Areas Covered" value={`${derived.analytics.completedAreas ?? 0}/${derived.analytics.totalAreas ?? 4}`}         color="#F59E0B" />
                  <StatBox label="Coverage"      value={`${Math.round(derived.analytics.coveragePercentage ?? 0)}%`}                             color="#8B5CF6" />
                  {(derived.analytics.duration ?? 0) > 0 && (
                    <StatBox label="Duration"    value={fmtDuration(derived.analytics.duration!)}                                                 color={TEAL} />
                  )}
                </Box>
              ) : null}
            </SectionCard>

            {stepsData && <PipelineSteps stepsData={stepsData} />}

            {Object.keys(derived.coverageAreas).length > 0 && (
              <SectionCard><CoverageAnalysis coverageAreas={derived.coverageAreas} /></SectionCard>
            )}
            {Object.keys(derived.coverageAreas).length > 0 && (
              <SectionCard><CoverageAreas coverageAreas={derived.coverageAreas} /></SectionCard>
            )}
            {Object.keys(derived.aiAnalysis).length > 0 && (
              <SectionCard><AiAnalysisSection aiAnalysis={derived.aiAnalysis} /></SectionCard>
            )}
            {(derived.requiredSkills.length > 0 || derived.softSkills.length > 0) && (
              <SectionCard>
                <SkillsSection requiredSkills={derived.requiredSkills} softSkills={derived.softSkills} />
              </SectionCard>
            )}
            {derived.summary && (
              <SectionCard><SummarySection summary={derived.summary} /></SectionCard>
            )}
            {(derived.jobDescription || derived.jobRequirements || derived.jobResponsibilities) && (
              <SectionCard>
                <JobDetailsSection
                  description={derived.jobDescription}
                  requirements={derived.jobRequirements}
                  responsibilities={derived.jobResponsibilities}
                />
              </SectionCard>
            )}
            {derived.recommendations.length > 0 && (
              <SectionCard><RecommendationsSection recommendations={derived.recommendations} /></SectionCard>
            )}

          </Box>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default dynamic(() => Promise.resolve(CompanyAssessmentPage), { ssr: false });
