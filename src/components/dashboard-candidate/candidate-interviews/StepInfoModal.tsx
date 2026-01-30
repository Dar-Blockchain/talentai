import React from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  LinearProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { PostAssessment } from "./AssessmentCard";

interface StepInfoModalProps {
  open: boolean;
  onClose: () => void;
  onStart: () => void;
  assessment: PostAssessment | null;
}

const getStepIcon = (status: string) => {
  switch (status) {
    case "done":
    case "passed":
      return <CheckCircleOutlineIcon sx={{ fontSize: 20, color: "#10b981" }} />;
    case "inProgress":
      return <HourglassEmptyIcon sx={{ fontSize: 20, color: "#f59e0b" }} />;
    default:
      return <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: "#9ca3af" }} />;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "done":
    case "passed":
      return "Completed";
    case "inProgress":
      return "In Progress";
    default:
      return "Pending";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "done":
    case "passed":
      return { bg: "#d1fae5", color: "#065f46" };
    case "inProgress":
      return { bg: "#fef3c7", color: "#92400e" };
    default:
      return { bg: "#f3f4f6", color: "#6b7280" };
  }
};

const StepInfoModal: React.FC<StepInfoModalProps> = ({
  open,
  onClose,
  onStart,
  assessment,
}) => {
  if (!assessment) return null;

  const stepProgress = assessment.candidatePostStepProgress;
  const currentStep = stepProgress?.currentStep;
  const steps = stepProgress?.steps || [];

  // Find the current step details from the steps array
  const currentStepData = steps.find(
    (s: any) => s.stepId?._id === currentStep?._id || s.stepId?.id === currentStep?._id
  );

  const stepLabel =
    currentStepData?.stepId?.data?.label ||
    currentStepData?.stepId?.data?.config?.title ||
    "Next Step";
  const stepType = currentStepData?.stepId?.data?.type || "interview";
  const stepConfig = currentStepData?.stepId?.data?.config || {};

  // Calculate overall progress
  const completedSteps = steps.filter(
    (s: any) => s.status === "done" || s.status === "passed"
  ).length;
  const progressPercent = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

  // Sort steps by order
  const sortedSteps = [...steps].sort(
    (a: any, b: any) => (a.stepId?.order ?? 999) - (b.stepId?.order ?? 999)
  );

  // Find current step index
  const currentStepIndex = sortedSteps.findIndex(
    (s: any) => s.stepId?._id === currentStep?._id || s.stepId?.id === currentStep?._id
  );

  const jobTitle = assessment.post?.jobDetails?.title || "Job Application";

  // Skills data from post
  const skillAnalysis = assessment.post?.skillAnalysis;
  const requiredSkills = skillAnalysis?.requiredSkills || [];
  const softSkills = skillAnalysis?.softSkills || [];
  const suggestedSkills = skillAnalysis?.suggestedSkills || {};
  const hasSkills =
    requiredSkills.length > 0 ||
    softSkills.length > 0 ||
    (suggestedSkills.technical?.length || 0) > 0 ||
    (suggestedSkills.frameworks?.length || 0) > 0 ||
    (suggestedSkills.tools?.length || 0) > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          border: "1px solid rgba(211, 224, 245, 1)",
          boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.08)",
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 3,
          py: 2,
          borderBottom: "1px solid rgba(211, 224, 245, 0.5)",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "18px",
              color: "rgba(62, 70, 82, 1)",
            }}
          >
            {jobTitle}
          </Typography>
          <Typography
            sx={{
              fontWeight: 400,
              fontSize: "13px",
              color: "rgba(100, 113, 131, 1)",
              mt: 0.25,
            }}
          >
            Step {completedSteps} of {sortedSteps.length}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "#6b7280" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 3, py: 2.5 }}>
        {/* Progress */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography
              sx={{ fontSize: "12px", fontWeight: 500, color: "#6b7280" }}
            >
              Overall Progress
            </Typography>
            <Typography
              sx={{ fontSize: "12px", fontWeight: 600, color: "rgba(189, 133, 255, 1)" }}
            >
              {completedSteps}/{steps.length} completed
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: "rgba(243, 245, 247, 1)",
              "& .MuiLinearProgress-bar": {
                borderRadius: 3,
                backgroundColor: "rgba(189, 133, 255, 1)",
              },
            }}
          />
        </Box>

        {/* Steps list */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {sortedSteps.map((step: any, index: number) => {
            const isCurrentStep =
              step.stepId?._id === currentStep?._id ||
              step.stepId?.id === currentStep?._id;
            const label =
              step.stepId?.data?.label ||
              step.stepId?.data?.config?.title ||
              `Step ${index + 1}`;
            const type = step.stepId?.data?.type || "interview";
            const statusColors = getStatusColor(step.status);

            return (
              <Box
                key={step._id || index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: "10px",
                  border: isCurrentStep
                    ? "1.5px solid rgba(189, 133, 255, 0.5)"
                    : "1px solid rgba(211, 224, 245, 0.5)",
                  backgroundColor: isCurrentStep
                    ? "rgba(189, 133, 255, 0.04)"
                    : "transparent",
                }}
              >
                {/* Step number / icon */}
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "8px",
                    backgroundColor:
                      step.status === "done" || step.status === "passed"
                        ? "rgba(16, 185, 129, 0.1)"
                        : isCurrentStep
                        ? "rgba(189, 133, 255, 0.1)"
                        : "rgba(243, 245, 247, 1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {step.status === "done" || step.status === "passed" ? (
                    getStepIcon(step.status)
                  ) : (
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "13px",
                        color: isCurrentStep
                          ? "rgba(189, 133, 255, 1)"
                          : "#9ca3af",
                      }}
                    >
                      {index + 1}
                    </Typography>
                  )}
                </Box>

                {/* Step info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontWeight: isCurrentStep ? 600 : 500,
                      fontSize: "14px",
                      color: isCurrentStep
                        ? "rgba(62, 70, 82, 1)"
                        : "#6b7280",
                    }}
                  >
                    {label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "11px",
                      color: "#9ca3af",
                      textTransform: "capitalize",
                    }}
                  >
                    {type}
                  </Typography>
                </Box>

                {/* Status chip */}
                <Chip
                  label={
                    isCurrentStep && step.status !== "done" && step.status !== "passed"
                      ? "Current"
                      : getStatusLabel(step.status)
                  }
                  size="small"
                  sx={{
                    backgroundColor: isCurrentStep && step.status !== "done" && step.status !== "passed"
                      ? "rgba(189, 133, 255, 0.12)"
                      : statusColors.bg,
                    color: isCurrentStep && step.status !== "done" && step.status !== "passed"
                      ? "rgba(189, 133, 255, 1)"
                      : statusColors.color,
                    fontWeight: 600,
                    fontSize: "0.7rem",
                    height: 22,
                    borderRadius: "6px",
                  }}
                />
              </Box>
            );
          })}
        </Box>

        {/* Skills */}
        {hasSkills && (
          <Box sx={{ mt: 2.5 }}>
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 600,
                color: "rgba(62, 70, 82, 1)",
                mb: 1,
              }}
            >
              Skills to be assessed
            </Typography>

            {requiredSkills.length > 0 && (
              <Box sx={{ mb: 1.5 }}>
                <Typography
                  sx={{ fontSize: "11px", fontWeight: 500, color: "#6b7280", mb: 0.5 }}
                >
                  Required Skills
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {requiredSkills.map((skill: any, i: number) => (
                    <Chip
                      key={skill._id || i}
                      label={skill.name}
                      size="small"
                      sx={{
                        backgroundColor: "rgba(99, 102, 241, 0.08)",
                        color: "#6366f1",
                        fontWeight: 500,
                        fontSize: "0.7rem",
                        height: 22,
                        border: "1px solid rgba(99, 102, 241, 0.2)",
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {softSkills.length > 0 && (
              <Box sx={{ mb: 1.5 }}>
                <Typography
                  sx={{ fontSize: "11px", fontWeight: 500, color: "#6b7280", mb: 0.5 }}
                >
                  Soft Skills
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {softSkills.map((skill: any, i: number) => (
                    <Chip
                      key={skill._id || i}
                      label={skill.name}
                      size="small"
                      sx={{
                        backgroundColor: "rgba(16, 185, 129, 0.08)",
                        color: "#10b981",
                        fontWeight: 500,
                        fontSize: "0.7rem",
                        height: 22,
                        border: "1px solid rgba(16, 185, 129, 0.2)",
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {(suggestedSkills.technical?.length > 0 ||
              suggestedSkills.frameworks?.length > 0 ||
              suggestedSkills.tools?.length > 0) && (
              <Box>
                <Typography
                  sx={{ fontSize: "11px", fontWeight: 500, color: "#6b7280", mb: 0.5 }}
                >
                  Suggested Skills
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {suggestedSkills.technical?.map((s: any, i: number) => (
                    <Chip
                      key={`tech-${i}`}
                      label={s.name}
                      size="small"
                      sx={{
                        backgroundColor: "rgba(139, 92, 246, 0.08)",
                        color: "#8b5cf6",
                        fontWeight: 500,
                        fontSize: "0.7rem",
                        height: 22,
                        border: "1px solid rgba(139, 92, 246, 0.2)",
                      }}
                    />
                  ))}
                  {suggestedSkills.frameworks?.map((s: any, i: number) => (
                    <Chip
                      key={`fw-${i}`}
                      label={s.name}
                      size="small"
                      sx={{
                        backgroundColor: "rgba(245, 158, 11, 0.08)",
                        color: "#f59e0b",
                        fontWeight: 500,
                        fontSize: "0.7rem",
                        height: 22,
                        border: "1px solid rgba(245, 158, 11, 0.2)",
                      }}
                    />
                  ))}
                  {suggestedSkills.tools?.map((s: any, i: number) => (
                    <Chip
                      key={`tool-${i}`}
                      label={s.name}
                      size="small"
                      sx={{
                        backgroundColor: "rgba(20, 184, 166, 0.08)",
                        color: "#14b8a6",
                        fontWeight: 500,
                        fontSize: "0.7rem",
                        height: 22,
                        border: "1px solid rgba(20, 184, 166, 0.2)",
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* Current step description */}
        {(stepConfig.description || stepConfig.interviewType) && (
          <Box
            sx={{
              mt: 2.5,
              p: 2,
              backgroundColor: "rgba(189, 133, 255, 0.04)",
              borderRadius: "10px",
              border: "1px solid rgba(189, 133, 255, 0.15)",
            }}
          >
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 600,
                color: "rgba(62, 70, 82, 1)",
                mb: 0.5,
              }}
            >
              About this step
            </Typography>
            {stepConfig.interviewType && (
              <Typography
                sx={{ fontSize: "12px", color: "#6b7280", mb: 0.5 }}
              >
                Type: {stepConfig.interviewType.replace(/_/g, " ")}
              </Typography>
            )}
            {stepConfig.description && (
              <Typography sx={{ fontSize: "12px", color: "#6b7280", lineHeight: 1.5 }}>
                {stepConfig.description}
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: "1px solid rgba(211, 224, 245, 0.5)",
          gap: 1.5,
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            textTransform: "none",
            color: "rgba(100, 113, 131, 1)",
            fontWeight: 500,
            fontSize: "0.875rem",
            borderRadius: "38px",
            px: 3,
            "&:hover": {
              backgroundColor: "rgba(243, 245, 247, 1)",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onStart}
          variant="contained"
          startIcon={<PlayArrowIcon />}
          sx={{
            textTransform: "none",
            backgroundColor: "rgba(189, 133, 255, 1)",
            color: "white",
            fontWeight: 600,
            fontSize: "0.875rem",
            borderRadius: "38px",
            px: 3,
            height: "42px",
            boxShadow: "none",
            "&:hover": {
              backgroundColor: "rgba(160, 100, 230, 1)",
              boxShadow: "none",
            },
          }}
        >
          Start {stepLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StepInfoModal;
