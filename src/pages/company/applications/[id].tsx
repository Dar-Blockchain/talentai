import React, { useMemo, useState } from "react";
import { Box, Skeleton } from "@mui/material";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import PageHeader from "@/components/layout/dashboard/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import {
  useApplicationDetail,
  useApplicationActions,
  useInviteModal,
} from "@/modules/company/applications/hooks";
import {
  AppCard,
  CandidateHeader,
  InviteModal,
  OverviewTab,
  CvTab,
  AiMatchTab,
  InterviewTab,
} from "@/modules/company/applications/components";

// ─── Loading skeleton ─────────────────────────────────────────────────────────
const DetailSkeleton: React.FC = () => (
  <AppCard sx={{ p: 3 }}>
    <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
      <Skeleton variant="circular" width={64} height={64} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="40%" height={24} />
        <Skeleton variant="text" width="25%" height={16} sx={{ mt: 0.5 }} />
        <Skeleton variant="text" width="35%" height={14} sx={{ mt: 0.5 }} />
      </Box>
    </Box>
    <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 2, mb: 2 }} />
    <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
  </AppCard>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
const ApplicationDetailPage: React.FC = () => {
  const { id, app, patchApp, loading, derived } = useApplicationDetail();
  const { deciding, handleDecision }            = useApplicationActions(id, patchApp);
  const invite                                = useInviteModal(id);
  const [tab, setTab]                         = useState(0);

  const tabs = useMemo(() => [
    { label: "Overview" },
    { label: "CV" },
    ...(derived?.cvScore != null           ? [{ label: "AI Match" }]   : []),
    ...(app?.interviewAssessment           ? [{ label: "Interview" }]  : []),
  ], [derived?.cvScore, app?.interviewAssessment]);

  const tabIndex = (label: string) => tabs.findIndex((t) => t.label === label);

  if (loading) {
    return (
      <DashboardLayout>
        <PageHeader title="Application" subtitle="" breadcrumbs={[
          { label: "Applications", href: "/company/applications" }, { label: "…" },
        ]} />
        <DetailSkeleton />
      </DashboardLayout>
    );
  }

  if (!app || !derived) {
    return (
      <DashboardLayout>
        <PageHeader title="Application" subtitle="" breadcrumbs={[
          { label: "Applications", href: "/company/applications" }, { label: "Not found" },
        ]} />
        <EmptyState icon={<PersonOutlined />} title="Application not found" description="This application may have been removed or doesn't exist." />
      </DashboardLayout>
    );
  }

  const handleInviteClick = () => {
    const postId    = app.post?._id ?? "";
    const companyId = (app.company as any)?._id ?? app.post?.user ?? "";
    const ref       = derived.email ? encodeURIComponent(derived.email) : "link";
    const base      = typeof window !== "undefined" ? window.location.origin : "";
    invite.openModal(postId ? `${base}/candidate/interview?jobId=${postId}&companyId=${companyId}&ref=${ref}` : "");
  };

  return (
    <DashboardLayout>
      <PageHeader title="" subtitle="" breadcrumbs={[
        { label: "Dashboard", href: "/company/dashboard" },
        { label: "Applications", href: "/company/applications" },
        { label: derived.name },
      ]} />

      <CandidateHeader
        app={app}
        derived={derived}
        tab={tab}
        tabs={tabs}
        deciding={deciding}
        invitedThisSession={invite.done}
        onTabChange={setTab}
        onDownloadCv={() => window.open(derived.cvUrl!, "_blank")}
        onInviteClick={handleInviteClick}
        onDecision={handleDecision}
      />

      {tab === tabIndex("Overview")  && <OverviewTab derived={derived} />}
      {tab === tabIndex("CV")        && <CvTab derived={derived} />}
      {tab === tabIndex("AI Match")  && <AiMatchTab derived={derived} requiredSkills={app.post?.skillAnalysis?.requiredSkills} />}
      {tab === tabIndex("Interview") && <InterviewTab derived={derived} />}

      <InviteModal
        open={invite.open}
        name={derived.name}
        postTitle={derived.postTitle}
        sending={invite.sending}
        done={invite.done}
        hasLink={!!invite.link}
        onClose={invite.closeModal}
        onSend={invite.handleSend}
      />
    </DashboardLayout>
  );
};

export default ApplicationDetailPage;
