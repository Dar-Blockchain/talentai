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
import { useRouter } from "next/router";
import PostDetailsStep from "./PostDetailsStep";
import RecruitmentFlowStep from "./RecruitmentFlowStep";
import { fetchJobMatches, savePost } from "@/store/slices/postSlice";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import MatchingFlowModal from "./components/MatchingFlowModal";
import { useState } from "react";
import { createHRAgent } from "@/store/slices/hrAgentsSlice";

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
  backgroundColor: ownerState?.active
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
  const dispatch = useDispatch<AppDispatch>();
  const { profile } = useSelector((state: RootState) => state.auth);
  const { generatedPost } = useSelector((state: any) => state.postGeneration);
  const { loading, error, savedPost } = useSelector(
    (state: any) => state.post.savePost
  );
  const steps = ["Job Details", "Agent Configuration", "Recruitment Flow"];
  const [activeStep, setActiveStep] = React.useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"saving" | "matching" | "done">(
    "saving"
  );

  const getJobSkills = (job: any): string[] => {
    if (!job?.skillAnalysis) return [];

    const skills: string[] = [];

    if (job.skillAnalysis.requiredSkills) {
      skills.push(
        ...job.skillAnalysis.requiredSkills.map((skill) => skill.name)
      );
    }

    if(job.skillAnalysis.softSkills) {
      skills.push(
        ...job.skillAnalysis.softSkills.map((skill) => skill.name)
      );
    }
    return [...new Set(skills)];
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      setModalOpen(true);
      setModalMode("saving");
      const result = await dispatch(savePost(generatedPost)).unwrap();
      if (!result.success) {
        setModalOpen(false);
        return;
      }
      const agentData = {
        jobId: result?.jobData?._id,
        companyName: profile?.companyDetails?.name || "Company",
        postTitle: result?.jobData?.jobDetails?.title,
        companyId: profile?.userId,
        jobSkills: getJobSkills(result?.jobData),
      };
      const agentResult = await dispatch(createHRAgent(agentData)).unwrap();
      setModalMode("matching");
      await dispatch(fetchJobMatches(result.jobData._id)).unwrap();
      setModalMode("done");
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <Box sx={{ my: 5, position: "relative", pb: 10 }}>
      <Box
        sx={{
          px: 3,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <Box sx={{ flex: 1, display: { xs: "none", md: "flex" } }}>
          <Button
            startIcon={<ArrowBack sx={{ color: "#10b981" }} />}
            onClick={() => router.back()}
            sx={{
              textTransform: "none",
              px: 0,
              py: 0,
              "&:hover": { background: "transparent", color: "#059669" },
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

      <Box sx={{ mt: 2 }}>
        {activeStep === 0 && <PostDetailsStep />}
        {/* {activeStep === 1 &&           
        <AgentConfigurationForm
            value={agentConfig}
            onChange={handleAgentConfigChange}
            disabled={!savedJobId || isSavingAgentConfig || isRegisteringAgent}
            loading={isSavingAgentConfig}
            errorMessage={activeStep === 1 ? saveError : null}
            agentSummary={{
              agentName: registeredAgentName ?? undefined,
            }}
          />} */}
        {activeStep === 2 && <RecruitmentFlowStep />}
      </Box>

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
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Button
          disabled={activeStep === 0}
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
          onClick={handleNext}
          sx={{
            textTransform: "none",
            height: "42px",
            width: "100%",
            maxWidth: "230px",
            borderRadius: "38px",
            background: "rgba(0, 234, 144, 1)",
            color: "black",
          }}
          disabled={!generatedPost}
        >
          {activeStep === steps.length - 1 ? "Finish" : "Next"}
        </Button>
      </Box>
      <MatchingFlowModal open={modalOpen} mode={modalMode} />
    </Box>
  );
};

export default CreatePostStepper;
