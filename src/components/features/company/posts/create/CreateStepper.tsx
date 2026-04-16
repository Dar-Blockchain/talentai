import React from "react";
import {
  Box,
  Button,
  Typography,
  Stepper,
  Step,
  StepLabel,
  styled,
  StepConnector,
} from "@mui/material";
import CheckOutlined from "@mui/icons-material/CheckOutlined";
import ArrowBackOutlined from "@mui/icons-material/ArrowBackOutlined";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { selectCreationType } from "@/store/slices/postGenerationSlice";
import { useCreatePostStepper } from "./hooks/useCreatePostStepper";
import PostDetailsStep from "./steps/post-details-step/PostDetailsStep";
import RecruitmentFlowStep from "./steps/recruitment-flow-step/RecruitmentFlowStep";
import PipelineWarningDialog from "./steps/recruitment-flow-step/PipelineWarningModal";
import SectionCard from "@/components/ui/SectionCard";

const TEAL        = "#0D9488";
const TEAL_LIGHT  = "#CCFBF1";

// ─── Custom connector ─────────────────────────────────────────────────────────
const TealConnector = styled(StepConnector)(() => ({
  [`& .MuiStepConnector-line`]: {
    height: 2,
    border: 0,
    borderRadius: 1,
    backgroundColor: "#E5E7EB",
  },
  [`&.Mui-active .MuiStepConnector-line,
    &.Mui-completed .MuiStepConnector-line`]: {
    backgroundColor: TEAL,
  },
}));

// ─── Custom step icon ─────────────────────────────────────────────────────────
const StepIconRoot = styled("div")<{
  ownerState: { active?: boolean; completed?: boolean };
}>(({ ownerState }) => ({
  width: 32, height: 32, borderRadius: "50%",
  display: "flex", alignItems: "center", justifyContent: "center",
  fontWeight: 700, fontSize: "13px",
  border: `2px solid ${ownerState.active || ownerState.completed ? TEAL : "#E5E7EB"}`,
  backgroundColor: ownerState.completed ? TEAL : ownerState.active ? "#F0FDFA" : "#fff",
  color: ownerState.completed ? "#fff" : ownerState.active ? TEAL : "#9CA3AF",
  transition: "all 0.2s",
}));

function CustomStepIcon(props: any) {
  const { active, completed, icon } = props;
  return (
    <StepIconRoot ownerState={{ active, completed }}>
      {completed ? <CheckOutlined sx={{ fontSize: 16 }} /> : icon}
    </StepIconRoot>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const CreateStepper: React.FC = () => {
  const { profile } = useSelector((state: RootState) => state.user.connectedUser);
  const { generatedPost } = useSelector((state: any) => state.postGeneration);
  const manualPost = useSelector((state: any) => state.manualPost);
  const recruitmentFlow = useSelector((state: any) => state.post.recruitmentFlow);
  const savedPost = useSelector((state: any) => state.post.savePost.savedPost);
  const creationType = useSelector(selectCreationType);

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
    manualPost
  );

  return (
    <Box>
      {/* ── Stepper header ───────────────────────────────────────────────────── */}
      <SectionCard sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1.5, md: 3 } }}>
          {/* Back button */}
          <Button
            startIcon={<ArrowBackOutlined sx={{ fontSize: 15 }} />}
            onClick={handleBack}
            sx={{
              textTransform: "none", fontWeight: 600, fontSize: "12px",
              color: "#6B7280", border: "1px solid #E5E7EB", borderRadius: 2,
              px: 2, py: 0.75, flexShrink: 0,
              "&:hover": { bgcolor: "#F9FAFB", borderColor: TEAL, color: TEAL },
            }}
          >
            Back
          </Button>

          {/* Stepper */}
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <Stepper
              activeStep={activeStep}
              connector={<TealConnector />}
              sx={{ maxWidth: 480, width: '100%', justifyContent: 'center' }}
            >
              {steps.map((label, i) => (
                <Step key={label} completed={i < activeStep}>
                  <StepLabel StepIconComponent={CustomStepIcon}>
                    <Typography
                      sx={{
                        fontSize: "12px", fontWeight: i === activeStep ? 700 : 500,
                        color: i === activeStep ? TEAL : i < activeStep ? "#374151" : "#9CA3AF",
                      }}
                    >
                      {label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Step counter */}
          <Box
            sx={{
              px: 2, py: 0.5, borderRadius: 2,
              bgcolor: "#F0FDFA", border: "1px solid #99F6E4", flexShrink: 0,
            }}
          >
            <Typography sx={{ fontSize: "12px", fontWeight: 700, color: TEAL }}>
              Step {activeStep + 1} / {steps.length}
            </Typography>
          </Box>
        </Box>
      </SectionCard>

      {/* ── Step content ─────────────────────────────────────────────────────── */}
      <Box sx={{ mb: 12 }}>
        {activeStep === 0 && <PostDetailsStep />}
        {activeStep === 1 && <RecruitmentFlowStep />}
      </Box>

      {/* ── Fixed bottom action bar ───────────────────────────────────────────── */}
      <Box
        sx={{
          position: "fixed", bottom: 0, left: 0, width: "100%",
          bgcolor: "#fff", borderTop: "1px solid #E5E7EB",
          py: 2, px: 4,
          display: "flex", justifyContent: "flex-end", alignItems: "center",
          gap: 2, zIndex: 1200,
        }}
      >
        <Button
          onClick={handleBack}
          sx={{
            textTransform: "none", fontWeight: 600, fontSize: "13px",
            borderRadius: "38px", height: 42, minWidth: 120,
            color: "#374151", border: "1px solid #D1D5DB",
            "&:hover": { bgcolor: "#F9FAFB" },
          }}
        >
          Back
        </Button>

        <Button
          variant="contained"
          onClick={() => handleNext(activeStep !== 0)}
          disabled={(!generatedPost && creationType === "ai") || isFinishing}
          sx={{
            textTransform: "none", fontWeight: 700, fontSize: "13px",
            borderRadius: "38px", height: 42, minWidth: 160,
            bgcolor: TEAL,
            color: "#fff",
            "&:hover": { bgcolor: "#0F766E" },
            "&:disabled": { bgcolor: "#E5E7EB", color: "#9CA3AF" },
          }}
        >
          {isFinishing
            ? "Saving…"
            : activeStep === steps.length - 1
            ? "Finish & Publish"
            : "Next Step →"}
        </Button>
      </Box>

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
