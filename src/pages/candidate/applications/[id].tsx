import React from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Box, Typography, Skeleton, Button } from "@mui/material";
import Header from "@/modules/shared/layouts/dashboard/DashboardHeader";
import { RootState } from "@/store/store";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutline";
import BusinessCenterOutlined from "@mui/icons-material/BusinessCenterOutlined";
import AssignmentOutlined from "@mui/icons-material/AssignmentOutlined";
import ChevronLeftOutlined from "@mui/icons-material/ChevronLeftOutlined";
import {
  useApplicationDetail, ProfileCard, ProfileStrengthCard, Section, InterviewBanner,
  JobHeaderCard, CvMatchScore, DetailsSidebar, STATUS_STYLE,
} from "@/modules/candidate/applications";

const CandidateApplicationDetailPage: React.FC = () => {
  const router  = useRouter();
  const { id }  = router.query;
  const { t }   = useTranslation("dashboard");
  const s = (k: string, opts?: any) => t(`candidate.application_detail.${k}`, opts) as string;
  const statusLabel = (st: string) => {
    const key = `candidate.my_applications.status.${st}`;
    const res = t(key) as string;
    return res === key ? st : res;
  };
  const profile = useSelector((state: RootState) => state.user.connectedUser.profile);
  const user    = useSelector((state: RootState) => state.user.connectedUser.user);

  const { app, loading } = useApplicationDetail(id);

  const displayName = profile?.firstName
    ? `${profile.firstName}${profile.lastName ? ` ${profile.lastName}` : ""}`
    : user?.username || "Candidate";
  const initial   = displayName[0]?.toUpperCase() || "C";
  const avatarUrl = profile?.user_image
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}uploads/images/${profile.user_image}`
    : undefined;
  const quota = profile?.quota ?? 0;
  const checklist = [
    { label: s("checklist.complete_profile"), done: !!(profile?.firstName && profile?.lastName) },
    { label: s("checklist.add_target_role"),  done: !!profile?.targetRole                       },
    { label: s("checklist.set_experience"),   done: !!profile?.requiredExperienceLevel          },
    { label: s("checklist.first_skill_test"), done: quota > 0                                   },
  ];

  const post           = app?.post || {};
  const jd             = post.jobDetails || {};
  const title          = jd.title || "—";
  const location       = jd.location || "";
  const employmentType = jd.employmentType || "";
  const workMode       = jd.workMode || "";
  const description    = jd.description || "";
  const requirements   = jd.requirements || [];
  const salary         = jd.salary || null;
  const rawStatus      = (app?.status || "applied").toLowerCase();
  const sc             = STATUS_STYLE[rawStatus] ?? STATUS_STYLE.applied;
  const isScheduled    = rawStatus === "interview_scheduled";
  const interviewDate  = app?.interviewDate || null;
  const interviewTime  = app?.interviewTime || null;
  const interviewLink  = app?.interviewLink || null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", bgcolor: "rgb(249 250 251)" }}>
      <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1200 }}>
        <Header onOpenMobile={() => {}} />
      </Box>

      <Box sx={{ flex: 1, mt: "64px", overflowY: "auto", overflowX: "hidden", p: { xs: 1.5, sm: 2.5, md: 3 } }} className="custom-scrollbar">
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "240px 1fr", lg: "260px 1fr 240px" }, gap: 2.5, alignItems: "start" }}>

          {/* ── LEFT: profile sidebar ── */}
          <Box sx={{ display: { xs: "none", md: "flex" }, flexDirection: "column", gap: 2, position: "sticky", top: 16, maxHeight: "calc(100vh - 96px)", overflowY: "auto" }} className="custom-scrollbar">
            <ProfileCard
              displayName={displayName} email={user?.email} initial={initial} avatarUrl={avatarUrl}
              targetRole={profile?.targetRole} experienceLevel={profile?.requiredExperienceLevel}
              stats={[
                { label: s("profile.applications"), value: 1, color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
                { label: s("profile.active"),       value: 1, color: "#0D9488", bg: "#F0FDFA", border: "#99F6E4" },
              ]}
            />
            <ProfileStrengthCard title={s("profile_strength")} checklist={checklist} />
          </Box>

          {/* ── CENTER: main content ── */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

            {/* Back nav */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button
                size="small"
                startIcon={<ChevronLeftOutlined sx={{ fontSize: "14px !important" }} />}
                onClick={() => router.push("/candidate/dashboard")}
                sx={{ textTransform: "none", fontWeight: 700, fontSize: "0.72rem", color: "#6B7280", bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "10px", px: 1.5, py: 0.5, "&:hover": { bgcolor: "#F3F4F6" }, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                {s("back_to_dashboard")}
              </Button>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, fontSize: "0.72rem", color: "#94A3B8" }}>
                <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8" }}>{t("candidate.nav.dashboard")}</Typography>
                <Typography sx={{ fontSize: "0.72rem", color: "#CBD5E1" }}>›</Typography>
                <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8" }}>{t("candidate.nav.applications")}</Typography>
                <Typography sx={{ fontSize: "0.72rem", color: "#CBD5E1" }}>›</Typography>
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: "#0D1B2A" }}>{loading ? s("loading_title") : title}</Typography>
              </Box>
            </Box>

            {loading ? (
              <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", p: 3, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <Skeleton variant="text" width="50%" height={28} />
                <Skeleton variant="text" width="30%" height={18} sx={{ mt: 1 }} />
                <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2, mt: 2 }} />
              </Box>
            ) : !app ? (
              <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", py: 10, textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <AssignmentOutlined sx={{ fontSize: 40, color: "#D1D5DB", mb: 1 }} />
                <Typography sx={{ color: "#9CA3AF", fontWeight: 600 }}>{s("not_found")}</Typography>
              </Box>
            ) : (
              <>
                {isScheduled && (
                  <InterviewBanner
                    title={s("interview_banner.title")}
                    joinLabel={s("interview_banner.join")}
                    interviewDate={interviewDate}
                    interviewTime={interviewTime}
                    interviewLink={interviewLink}
                  />
                )}

                <JobHeaderCard
                  title={title}
                  location={location}
                  employmentType={employmentType}
                  workMode={workMode}
                  salary={salary}
                  statusLabel={statusLabel(rawStatus)}
                  statusStyle={sc}
                  appliedAt={app.appliedAt || app.createdAt}
                  appliedOnLabel={(date) => s("applied_on", { date })}
                />

                {(app.matchScore != null || app.cvAnalysis?.analysisScore != null) && (
                  <CvMatchScore
                    score={app.matchScore ?? app.cvAnalysis?.analysisScore}
                    title={s("cv_match_score.title")}
                    strongLabel={s("cv_match_score.strong")}
                    goodLabel={s("cv_match_score.good")}
                    lowLabel={s("cv_match_score.low")}
                    subtitle={(score) => s("cv_match_score.subtitle", { score })}
                  />
                )}

                {description && (
                  <Section icon={<WorkOutlineOutlined sx={{ fontSize: 14, color: "#0D9488" }} />} title={s("job_description")}>
                    <Typography sx={{ fontSize: "0.85rem", color: "#4B5563", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{description}</Typography>
                  </Section>
                )}

                {requirements.length > 0 && (
                  <Section icon={<BusinessCenterOutlined sx={{ fontSize: 14, color: "#0D9488" }} />} title={s("requirements")}>
                    <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                      {requirements.map((r: string, i: number) => (
                        <Box component="li" key={i} sx={{ fontSize: "0.85rem", color: "#4B5563", lineHeight: 1.8 }}>{r}</Box>
                      ))}
                    </Box>
                  </Section>
                )}
              </>
            )}
          </Box>

          {/* ── RIGHT: status timeline ── */}
          <Box sx={{ display: { xs: "none", lg: "flex" }, flexDirection: "column", gap: 2, position: "sticky", top: 16 }}>
            {app && !loading && (
              <DetailsSidebar
                title={s("details")}
                location={location}
                employmentType={employmentType}
                workMode={workMode}
                appliedAt={app.appliedAt || app.createdAt}
                appliedOnLabel={(date) => s("applied_on", { date })}
              />
            )}
          </Box>

        </Box>
      </Box>
    </Box>
  );
};

export default dynamic(() => Promise.resolve(CandidateApplicationDetailPage), { ssr: false });
