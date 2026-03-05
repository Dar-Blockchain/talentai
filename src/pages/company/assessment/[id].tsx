import React, { useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { Box, Alert, Chip, Typography } from "@mui/material";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import RoleGuard from "@/components/guards/RoleGuard";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import PageHeader from "@/components/layout/dashboard/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { AppDispatch } from "@/store/store";
import {
  fetchAssessmentDetails,
  clearAssessmentDetails,
  selectAssessmentDetails,
  selectAssessmentStepsData,
  selectAssessmentDetailsLoading,
  selectAssessmentDetailsError,
} from "@/store/slices/postSlice";
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

const TEAL        = "#0D9488";
const TEAL_BG     = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";

const scoreColor = (score: number) =>
  score >= 70 ? "#10B981" : score >= 50 ? "#F59E0B" : "#EF4444";

const formatDuration = (seconds: number) => {
  if (!seconds) return "N/A";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const CompanyAssessmentPage: React.FC = () => {
  const router   = useRouter();
  const { id }   = router.query;
  const dispatch = useDispatch<AppDispatch>();

  const assessment = useSelector(selectAssessmentDetails);
  const stepsData  = useSelector(selectAssessmentStepsData);
  const loading    = useSelector(selectAssessmentDetailsLoading);
  const error      = useSelector(selectAssessmentDetailsError);

  useEffect(() => {
    if (!id) return;
    dispatch(fetchAssessmentDetails(id as string));
    return () => { dispatch(clearAssessmentDetails()); };
  }, [id, dispatch]);

  const coverageAreas = useMemo(
    () => assessment?.interviewData?.finalReport?.coverage?.areas || {},
    [assessment]
  );
  const aiAnalysis = useMemo(
    () => assessment?.interviewData?.finalReport?.aiAnalysis || {},
    [assessment]
  );
  const requiredSkills  = useMemo(() => assessment?.post?.skillAnalysis?.requiredSkills  || [], [assessment]);
  const softSkills      = useMemo(() => assessment?.post?.skillAnalysis?.softSkills      || [], [assessment]);
  const suggestedSkills = useMemo(() => assessment?.post?.skillAnalysis?.suggestedSkills || {}, [assessment]);
  const summary         = useMemo(() => assessment?.interviewData?.finalReport?.summary  || "", [assessment]);
  const recommendations = useMemo(() => assessment?.interviewData?.finalReport?.recommendations || [], [assessment]);
  const jobDescription      = useMemo(() => assessment?.post?.jobDetails?.description       || "", [assessment]);
  const jobRequirements     = useMemo(() => assessment?.post?.jobDetails?.requirements,   [assessment]);
  const jobResponsibilities = useMemo(() => assessment?.post?.jobDetails?.responsibilities, [assessment]);

  const candidateName  = assessment?.candidate?.username || "Unknown Candidate";
  const jobTitle       = assessment?.post?.jobDetails?.title || "Unknown Job";
  const interviewType  = assessment?.interviewData?.interviewType || "HR_INTERVIEW";
  const coverageScore  = assessment?.interviewData?.finalReport?.coverage?.overall || 0;
  const analytics      = assessment?.interviewData?.analytics || {};
  const timestamp      = assessment?.createdAt
    ? new Date(assessment.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "—";

  return (
    <RoleGuard allowedRoles={["Company"]}>
      <DashboardLayout>
        <Box>
          {loading && <LoadingOverlay height={400} message="Loading assessment…" color={TEAL} />}

          {!loading && error && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
          )}

          {!loading && !error && assessment && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

              {/* ── PageHeader ── */}
              <PageHeader
                title="Interview Assessment"
                subtitle={`${candidateName} · ${jobTitle} · ${timestamp}`}
                breadcrumbs={[
                  { label: "Dashboard", href: "/company/dashboard" },
                  { label: "Job Posts", href: "/company/posts" },
                  { label: "Assessment" },
                ]}
                actions={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                    <Chip
                      label={interviewType.replace(/_/g, " ")}
                      size="small"
                      sx={{ height: 26, fontSize: "12px", fontWeight: 600, bgcolor: TEAL_BG, color: TEAL, border: `1px solid ${TEAL_BORDER}`, borderRadius: "13px" }}
                    />
                    {/* Score badge */}
                    <Box sx={{
                      width: 56, height: 56, borderRadius: "50%",
                      border: `3px solid ${scoreColor(coverageScore)}`,
                      bgcolor: `${scoreColor(coverageScore)}10`,
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <Typography sx={{ fontSize: "16px", fontWeight: 800, color: scoreColor(coverageScore), lineHeight: 1 }}>
                        {Math.round(coverageScore)}
                      </Typography>
                      <Typography sx={{ fontSize: "9px", fontWeight: 600, color: "#6B7280", mt: 0.25 }}>
                        Score
                      </Typography>
                    </Box>
                  </Box>
                }
              />

              {/* ── Meta + stats card ── */}
              <SectionCard>
                {/* Meta chips row */}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                  <MetaChip icon={<PersonOutlined sx={{ fontSize: 14 }} />} label={candidateName} />
                  <MetaChip icon={<WorkOutlined sx={{ fontSize: 14 }} />} label={jobTitle} />
                  <MetaChip icon={<CalendarTodayOutlined sx={{ fontSize: 14 }} />} label={timestamp} />
                  {analytics.duration > 0 && (
                    <MetaChip icon={<AccessTimeOutlined sx={{ fontSize: 14 }} />} label={formatDuration(analytics.duration)} />
                  )}
                </Box>

                {/* Analytics stats row */}
                {(analytics.messageCount || analytics.completedAreas || analytics.coveragePercentage) ? (
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 1.5 }}>
                    <StatBox label="Messages"      value={analytics.messageCount || 0}                                    color="#6366F1" />
                    <StatBox label="Areas Covered" value={`${analytics.completedAreas || 0}/${analytics.totalAreas || 4}`} color="#F59E0B" />
                    <StatBox label="Coverage"      value={`${Math.round(analytics.coveragePercentage || 0)}%`}             color="#8B5CF6" />
                    {analytics.duration > 0 && (
                      <StatBox label="Duration"    value={formatDuration(analytics.duration)}                              color={TEAL}    />
                    )}
                  </Box>
                ) : null}
              </SectionCard>

              {/* ── Pipeline steps ── */}
              {stepsData && <PipelineSteps stepsData={stepsData} />}

              {/* ── Coverage charts ── */}
              {Object.keys(coverageAreas).length > 0 && (
                <SectionCard>
                  <CoverageAnalysis coverageAreas={coverageAreas} />
                </SectionCard>
              )}

              {/* ── Coverage areas detail ── */}
              {Object.keys(coverageAreas).length > 0 && (
                <SectionCard>
                  <CoverageAreas coverageAreas={coverageAreas} />
                </SectionCard>
              )}

              {/* ── AI Analysis ── */}
              {Object.keys(aiAnalysis).length > 0 && (
                <SectionCard>
                  <AiAnalysisSection aiAnalysis={aiAnalysis} />
                </SectionCard>
              )}

              {/* ── Skills ── */}
              {(requiredSkills.length > 0 || softSkills.length > 0) && (
                <SectionCard>
                  <SkillsSection
                    requiredSkills={requiredSkills}
                    softSkills={softSkills}
                    suggestedSkills={suggestedSkills}
                  />
                </SectionCard>
              )}

              {/* ── Summary ── */}
              {summary && (
                <SectionCard>
                  <SummarySection summary={summary} />
                </SectionCard>
              )}

              {/* ── Job Details ── */}
              {(jobDescription || jobRequirements || jobResponsibilities) && (
                <SectionCard>
                  <JobDetailsSection
                    description={jobDescription}
                    requirements={jobRequirements}
                    responsibilities={jobResponsibilities}
                  />
                </SectionCard>
              )}

              {/* ── Recommendations ── */}
              {recommendations.length > 0 && (
                <SectionCard>
                  <RecommendationsSection recommendations={recommendations} />
                </SectionCard>
              )}
            </Box>
          )}
        </Box>
      </DashboardLayout>
    </RoleGuard>
  );
};

const MetaChip: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <Box sx={{
    display: "flex", alignItems: "center", gap: 0.5,
    bgcolor: "#F9FAFB", border: "1px solid #E5E7EB",
    borderRadius: "8px", px: 1, py: 0.375,
  }}>
    <Box sx={{ color: "#9CA3AF", display: "flex" }}>{icon}</Box>
    <Typography sx={{ fontSize: "12px", fontWeight: 500, color: "#374151" }}>{label}</Typography>
  </Box>
);

const StatBox: React.FC<{ label: string; value: string | number; color: string }> = ({ label, value, color }) => (
  <Box sx={{
    bgcolor: `${color}12`, border: `1px solid ${color}30`,
    borderRadius: 2, p: 1.5, textAlign: "center",
  }}>
    <Typography sx={{ fontSize: "16px", fontWeight: 700, color }}>{value}</Typography>
    <Typography sx={{ fontSize: "11px", fontWeight: 500, color: "#6B7280", mt: 0.25 }}>{label}</Typography>
  </Box>
);

export default dynamic(() => Promise.resolve(CompanyAssessmentPage), { ssr: false });
