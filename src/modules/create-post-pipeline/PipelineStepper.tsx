import React from "react";
import { Box, Button, CircularProgress, Step, StepLabel, Stepper } from "@mui/material";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutlineOutlined";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { usePipelineStepper } from "./hooks/usePipelineStepper";
import ManualPostForm from "@/modules/create-post/steps/post-details-step/ManualPostForm";
import RecruitmentFlowStep from "./steps/pipeline-step/RecruitmentFlowStep";
import PipelineWarningDialog from "./steps/pipeline-step/PipelineWarningModal";
import PageHeader from "@/components/layout/dashboard/PageHeader";

const STEPS = ["Job Details", "Recruitment Flow"];
const INDIGO = "#6366F1";

const PipelineStepper: React.FC = () => {
  const { t } = useTranslation("posts");
  const { t: td } = useTranslation("dashboard");

  const manualPost    = useSelector((state: any) => state.manualPost);
  const recruitmentFlow = useSelector((state: any) => state.post.recruitmentFlow);
  const savedPost     = useSelector((state: any) => state.post.savePost.savedPost);

  const { activeStep, isFinishing, pipelineWarningOpen, unconfiguredNodes, handleNext, handleBack, setPipelineWarningOpen, savePipeline } = usePipelineStepper(manualPost, recruitmentFlow, savedPost);

  return (
    <Box>
      <PageHeader
        title="Create Pipeline Post"
        subtitle="Build your job post and design the recruitment pipeline."
        icon={WorkOutlineOutlined}
        breadcrumbs={[
          { label: td("pages.common.dashboard"), href: "/company/dashboard" },
          { label: t("title"), href: "/company/posts" },
          { label: "Create Pipeline Post" },
        ]}
      />

      {/* Stepper indicator */}
      <Box sx={{ maxWidth: 500, mx: "auto", mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel sx={{ "& .MuiStepLabel-label": { fontSize: "12px", fontWeight: 600 }, "& .MuiStepIcon-root.Mui-active": { color: INDIGO }, "& .MuiStepIcon-root.Mui-completed": { color: INDIGO } }}>
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Box sx={{ mb: 12 }}>
        {activeStep === 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
            <ManualPostForm />
          </Box>
        )}
        {activeStep === 1 && <RecruitmentFlowStep />}
      </Box>

      {/* Fixed bottom action bar */}
      <Box sx={{ position: "fixed", bottom: 0, left: "var(--layout-sidebar-width, 0px)", width: "calc(100% - var(--layout-sidebar-width, 0px))", bgcolor: "#fff", borderTop: "1px solid #E5E7EB", py: 2, px: { xs: 2, md: 4 }, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 2, zIndex: 1200, transition: "left 0.3s, width 0.3s" }}>
        <Button onClick={handleBack} disabled={isFinishing} sx={{ textTransform: "none", fontWeight: 600, fontSize: "13px", borderRadius: "10px", height: 42, px: 3, color: "#374151", border: "1px solid #D1D5DB", "&:hover": { bgcolor: "#F9FAFB", borderColor: "#9CA3AF" } }}>
          {activeStep === 0 ? t("create.btn_cancel") : "Back"}
        </Button>

        <Button variant="contained" onClick={handleNext} disabled={isFinishing} sx={{ textTransform: "none", fontWeight: 700, fontSize: "13px", borderRadius: "10px", height: 42, px: 4, bgcolor: INDIGO, color: "#fff", "&:hover": { bgcolor: "#4F46E5" }, "&:disabled": { bgcolor: "#E5E7EB", color: "#9CA3AF" } }}>
          {isFinishing ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={14} sx={{ color: "#9CA3AF" }} />
              {t("create.btn_saving")}
            </Box>
          ) : activeStep === 0 ? t("create.btn_next") : t("create.btn_save_draft")}
        </Button>
      </Box>

      <PipelineWarningDialog
        open={pipelineWarningOpen}
        nodes={unconfiguredNodes}
        totalNodes={recruitmentFlow.nodes.length}
        onCancel={() => setPipelineWarningOpen(false)}
        onConfirm={async () => { setPipelineWarningOpen(false); await savePipeline(); }}
      />
    </Box>
  );
};

export default PipelineStepper;
