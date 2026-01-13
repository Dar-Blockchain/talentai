"use client";
import * as React from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  Typography,
  styled,
  Button,
} from "@mui/material";
import Check from "@mui/icons-material/Check";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { useSelector } from "react-redux";
import RecruitmentFlowStep from "./steps/recruitment-flow-step/RecruitmentFlowStep";
import MatchingFlowModal from "./steps/post-details-step/MatchingFlowModal";
import { RootState } from "@/store/store";
import { useCreatePostStepper } from "./hooks/useCreatePostStepper";
import PaymentConfirmationModal from "./steps/recruitment-flow-step/PaymentConfirmationModal";
import { selectCreationType } from "@/store/slices/postGenerationSlice";
import { useRouter } from "next/router";
import TokenPurchaseModal from "@/components/token-purchase/TokenPurchaseModal";
import PostDetailsStep from "./steps/post-details-step/PostDetailsStep";
import AgentConfigurationStep from "./steps/agent-configuration-step/AgentConfigurationStep";
import AgentConfigurationLoadingModal from "./steps/agent-configuration-step/LoadingModal";
import PipelineWarningDialog from "./steps/recruitment-flow-step/PipelineWarningModal";

// ------- Custom Stepper Styles -------
const SplitLineConnector = styled(StepConnector)(() => ({
  [`&.MuiStepConnector-root`]: {
    top: "14px",
    transform: "translateY(-50%)",
    position: "absolute",
    left: "calc(-50% + 22.5px)",
    right: "calc(50% + 22.5px)",
    zIndex: 0,
    padding: "0 5px",
  },
  [`& .MuiStepConnector-line`]: {
    position: "relative",
    height: "8px",
    border: 0,
    borderRadius: "8px",
    backgroundColor: "transparent",
  },
  [`& .MuiStepConnector-line::before,& .MuiStepConnector-line::after`]: {
    content: '""',
    position: "absolute",
    top: 0,
    height: "8px",
    width: "48%",
    borderRadius: "8px",
    backgroundColor: "rgba(210, 225, 238, 1)",
  },
  [`& .MuiStepConnector-line::before`]: { left: 0 },
  [`& .MuiStepConnector-line::after`]: { right: 0 },
  [`&.Mui-active .MuiStepConnector-line::before,
     &.Mui-active .MuiStepConnector-line::after,
     &.Mui-completed .MuiStepConnector-line::before,
     &.Mui-completed .MuiStepConnector-line::after`]: {
    backgroundColor: "rgba(76, 217, 163, 1)",
  },
}));

const StepIconRoot = styled("div")<{
  ownerState: { active?: boolean; completed?: boolean };
}>(({ ownerState }) => ({
  zIndex: 1,
  backgroundColor:
    ownerState?.active || ownerState?.completed
      ? "rgba(76, 217, 163, 0.5)"
      : "rgba(210, 225, 238, 1)",
  color: "#fff",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: 27,
  height: 27,
  borderRadius: "50%",
  fontWeight: 600,
  fontSize: "15px",
  transition: "all 0.3s ease",
}));

function CustomStepIcon(props: any) {
  const { active, completed, className } = props;

  return (
    <StepIconRoot ownerState={{ active, completed }} className={className}>
      {completed ? <Check fontSize="small" /> : props.icon}
    </StepIconRoot>
  );
}

const CreatePostStepper: React.FC = () => {
  const router = useRouter();
  const { profile } = useSelector((state: RootState) => state.user.connectedUser);
  const { generatedPost } = useSelector((state: any) => state.postGeneration);
  const manualPost = useSelector((state: any) => state.manualPost);
  const { status: createConfigStatus } = useSelector(
    (state: RootState) => state.agentConfig.createConfig
  );
  const recruitmentFlow = useSelector(
    (state: any) => state.post.recruitmentFlow
  );
  const savedPost = useSelector((state: any) => state.post.savePost.savedPost);
  const creationType = useSelector(selectCreationType);
  const steps =
    creationType === "ai"
      ? ["Job Details", "Agent Configuration"]
      : ["Job Details", "Agent Configuration", "Recruitment Flow"];

  const {
    activeStep,
    modalOpen,
    modalMode,
    agentLoadingOpen,
    paymentModalOpen,
    pipelineWarningOpen,
    unconfiguredNodes,
    handleNext,
    handleBack,
    setModalOpen,
    setPipelineWarningOpen,
    savePipeline,
    setPaymentModalOpen,
  } = useCreatePostStepper(
    generatedPost,
    profile,
    recruitmentFlow,
    savedPost,
    creationType,
    manualPost
  );

  return (
    <Box sx={{ my: 5, position: "relative", pb: 10 }}>
      {/* Header Section */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <Box sx={{ flex: 1, display: { xs: "none", md: "flex" } }}>
          <Button
            startIcon={
              <ArrowBack
                sx={{
                  color: "#10b981",
                  transition: "transform 0.2s easeIn",
                  "&:hover": { transform: "scale(1.1)" },
                }}
              />
            }
            onClick={() => router.back()}
            sx={{
              textTransform: "none",
              px: 0,
              py: 0,
              color: "black",
              transition: "transform 0.2s easeIn",
              "&:hover": {
                background: "transparent",
                color: "black",
                transform: "scale(1.1)",
              },
            }}
          >
            Back
          </Button>
        </Box>

        <Box sx={{ flex: 2, display: "flex", justifyContent: "center" }}>
          <Stepper
            alternativeLabel
            activeStep={activeStep}
            connector={<SplitLineConnector />}
            sx={{ maxWidth: 800, width: "100%" }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel
                  StepIconComponent={(props) => <CustomStepIcon {...props} />}
                >
                  <Typography
                    sx={{
                      fontWeight: 500,
                      fontSize: "12px",
                      lineHeight: "10px",
                      color:
                        steps.indexOf(label) === activeStep
                          ? "rgba(76,217,163,1)"
                          : "rgba(210,225,238,1)",
                    }}
                  >
                    {label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Box sx={{ flex: 1 }} />
      </Box>

      {/* Step Content */}
      <Box sx={{ mt: 2 }}>
        {activeStep === 0 && <PostDetailsStep />}
        {activeStep === 1 && <AgentConfigurationStep />}
        {activeStep === 2 && <RecruitmentFlowStep />}
      </Box>

      {/* Bottom Buttons */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          background: "#ffffff",
          borderTop: "1px solid #e5e7eb",
          py: 2,
          px: 3,
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
          zIndex: 3,
        }}
      >
        <Button
          onClick={handleBack}
          sx={{
            textTransform: "none",
            height: "42px",
            width: "100%",
            maxWidth: "230px",
            borderRadius: "38px",
            border: "1px solid rgba(25, 25, 25, 1)",
            color: "black",
            "&:disabled": { border: "1px solid rgba(0, 0, 0, 0.26)" },
          }}
        >
          Back
        </Button>

        <Button
          variant="contained"
          onClick={() => handleNext(activeStep !== 0)}
          sx={{
            textTransform: "none",
            height: "42px",
            width: "100%",
            maxWidth: "230px",
            borderRadius: "38px",
            background: "rgba(0, 234, 144, 1)",
            color: "black",
          }}
          disabled={!generatedPost && creationType === "ai"}
          loading={createConfigStatus === "loading"}
        >
          {activeStep === steps.length - 1 ? "Finish" : "Next"}
        </Button>
      </Box>

      <MatchingFlowModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        onContinue={handleNext}
      />
      <AgentConfigurationLoadingModal open={agentLoadingOpen} />
      <PipelineWarningDialog
        open={pipelineWarningOpen}
        nodes={unconfiguredNodes}
        onCancel={() => setPipelineWarningOpen(false)}
        onConfirm={async () => {
          setPipelineWarningOpen(false);
          await savePipeline();
        }}
      />
      <PaymentConfirmationModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
      />
      <TokenPurchaseModal />
    </Box>
  );
};

export default CreatePostStepper;