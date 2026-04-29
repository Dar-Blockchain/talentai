import React, { useState } from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutlineOutlined";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { AppDispatch } from "@/store/store";
import {
  selectCreationType,
  setInterviewLanguages,
} from "@/store/slices/postGenerationSlice";
import { useCreatePostStepper } from "./hooks/useCreatePostStepper";
import PostDetailsStep from "./steps/post-details-step/PostDetailsStep";
import RecruitmentFlowStep from "./steps/recruitment-flow-step/RecruitmentFlowStep";
import PipelineWarningDialog from "./steps/recruitment-flow-step/PipelineWarningModal";
import InterviewLanguagesModal from "./InterviewLanguagesModal";
import PageHeader from "@/components/layout/dashboard/PageHeader";

const TEAL = "#0D9488";

const CreateStepper: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile } = useSelector((state: RootState) => state.user.connectedUser);
  const { generatedPost, interviewLanguages } = useSelector((state: any) => state.postGeneration);
  const manualPost = useSelector((state: any) => state.manualPost);
  const recruitmentFlow = useSelector((state: any) => state.post.recruitmentFlow);
  const savedPost = useSelector((state: any) => state.post.savePost.savedPost);
  const creationType = useSelector(selectCreationType);

  const [langModalOpen, setLangModalOpen] = useState(false);
  const { t } = useTranslation("dashboard");

  const steps = creationType === "ai" ? ["Job Details"] : ["Job Details", "Recruitment Flow"];

  const {
    activeStep,
    isFinishing,
    pipelineWarningOpen,
    unconfiguredNodes,
    handleNext,
    handleBack,
    setPipelineWarningOpen,
    savePipeline,
  } = useCreatePostStepper(
    generatedPost,
    profile,
    recruitmentFlow,
    savedPost,
    creationType,
    manualPost,
    interviewLanguages
  );

  const isLastStep = activeStep === steps.length - 1;
  const canPublish = creationType === "ai" ? !!generatedPost : true;

  const handleSaveClick = () => {
    if (isLastStep) {
      setLangModalOpen(true);
    } else {
      handleNext(true);
    }
  };

  const handleLanguageConfirm = (languages: string[]) => {
    dispatch(setInterviewLanguages(languages));
    setLangModalOpen(false);
    handleNext(activeStep !== 0);
  };

  return (
    <Box>
      <PageHeader
        title={t("pages.posts.create.title")}
        subtitle={t("pages.posts.create.subtitle")}
        icon={WorkOutlineOutlined}
        breadcrumbs={[
          { label: t("pages.common.dashboard"), href: "/company/dashboard" },
          { label: t("pages.posts.title"), href: "/company/posts" },
          { label: t("pages.posts.create.title") },
        ]}
      />

      {/* Step content */}
      <Box sx={{ mb: 12 }}>
        {activeStep === 0 && <PostDetailsStep />}
        {activeStep === 1 && <RecruitmentFlowStep />}
      </Box>

      {/* Fixed bottom action bar */}
      <Box
        sx={{
          position: "fixed", bottom: 0,
          left: "var(--layout-sidebar-width, 0px)",
          width: "calc(100% - var(--layout-sidebar-width, 0px))",
          bgcolor: "#fff", borderTop: "1px solid #E5E7EB",
          py: 2, px: { xs: 2, md: 4 },
          display: "flex", justifyContent: "flex-end", alignItems: "center",
          gap: 2, zIndex: 1200,
          transition: "left 0.3s, width 0.3s",
        }}
      >
        <Button
          onClick={handleBack}
          disabled={isFinishing}
          sx={{
            textTransform: "none", fontWeight: 600, fontSize: "13px",
            borderRadius: "10px", height: 42, px: 3,
            color: "#374151", border: "1px solid #D1D5DB",
            "&:hover": { bgcolor: "#F9FAFB", borderColor: "#9CA3AF" },
          }}
        >
          {t("pages.posts.create.btn_cancel")}
        </Button>

        <Button
          variant="contained"
          onClick={handleSaveClick}
          disabled={!canPublish || isFinishing}
          sx={{
            textTransform: "none", fontWeight: 700, fontSize: "13px",
            borderRadius: "10px", height: 42, px: 4,
            bgcolor: TEAL, color: "#fff",
            "&:hover": { bgcolor: "#0F766E" },
            "&:disabled": { bgcolor: "#E5E7EB", color: "#9CA3AF" },
          }}
        >
          {isFinishing ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={14} sx={{ color: "#9CA3AF" }} />
              {t("pages.posts.create.btn_saving")}
            </Box>
          ) : isLastStep ? (
            t("pages.posts.create.btn_save_draft")
          ) : (
            t("pages.posts.create.btn_next")
          )}
        </Button>
      </Box>

      <InterviewLanguagesModal
        open={langModalOpen}
        onConfirm={handleLanguageConfirm}
        onClose={() => setLangModalOpen(false)}
      />

      <PipelineWarningDialog
        open={pipelineWarningOpen}
        nodes={unconfiguredNodes}
        totalNodes={recruitmentFlow.nodes.length}
        onCancel={() => setPipelineWarningOpen(false)}
        onConfirm={async () => {
          setPipelineWarningOpen(false);
          await savePipeline();
        }}
      />
    </Box>
  );
};

export default CreateStepper;
