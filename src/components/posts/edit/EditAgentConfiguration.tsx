import React, { ChangeEvent } from "react";
import {
  Box,
  Typography,
  TextField,
  Tooltip,
  Alert,
  Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import Image from "next/image";
import {
  selectCurrentJob,
  updateAgentConfigInCurrentJob,
  updatePostStatus,
} from "@/store/slices/postSlice";
import { Formik } from "formik";
import {
  AgentConfigUpdatePayload,
  DEFAULT_AGENT_CONFIG,
  updateAgentConfig,
} from "@/store/slices/agentConfigSlice";
import { AGENT_CONFIG_NUMBER_FIELDS } from "@/constants/post";
import { validateAgentConfig } from "@/validations/agentValidation";
import { useToast } from "@/hooks/useToast";
import { createHRAgent } from "@/store/slices/hrAgentsSlice";
import { getJobSkills } from "@/utils/postHelpers";

/* ------------------------------- STYLES ------------------------------- */

const SectionTitle = styled(Typography)(() => ({
  color: "rgba(84, 98, 116, 1)",
  fontWeight: 600,
  fontSize: "16px",
}));

const SubtleText = styled(Typography)(() => ({
  color: "#64748b",
  fontSize: "0.75rem",
  marginTop: 4,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    height: "42px",
    borderRadius: 4,
    "& fieldset": {
      borderColor: "#cbd5e1",
    },
    "&:hover fieldset": {
      borderColor: "#94a3b8",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#3b82f6",
      borderWidth: 2,
    },
  },
  "& .MuiInputLabel-root": {
    fontWeight: 500,
    color: "#475569",
  },
  "& .MuiFormHelperText-root": {
    marginLeft: "0!important",
    fontSize: "0.75rem",
    color: "#64748b",
  },
}));

const MainLayout = styled(Box)(({ theme }) => ({
  display: "grid",
  gap: theme.spacing(4),
  gridTemplateColumns: "1fr",
  marginTop: "25px",
}));

const FieldGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gap: theme.spacing(2.5),
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
}));

/* ------------------------------- COMPONENT ------------------------------- */

export interface EditAgentConfigurationProps {
  onCancel: () => void;
}

const EditAgentConfiguration: React.FC<EditAgentConfigurationProps> = ({
  onCancel,
}) => {
  const { showToast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const job = useSelector(selectCurrentJob);
  const config = React.useMemo(() => job?.agentConfig, [job]);
  const { profile } = useSelector((state: RootState) => state.user.connectedUser);

  const initialValues = React.useMemo(() => {
    if (!config) {
      return DEFAULT_AGENT_CONFIG;
    }
    return {
      thresholdPercent: job?.agentConfig?.thresholdPercent,
      bidBudgetMin: job?.agentConfig?.bidBudgetMin,
      bidBudgetMax: job?.agentConfig?.bidBudgetMax,
      bidStep: job?.agentConfig?.bidStep,
      maxCandidatesToBid: job?.agentConfig?.maxCandidatesToBid,
      agentLifetimeDays: job?.agentConfig?.agentLifetimeDays,
      bidLifetimeDays: job?.agentConfig?.bidLifetimeDays,
      maxDailySpending: job?.agentConfig?.maxDailySpending,
      autoSubmitTopMatch: job?.agentConfig?.autoSubmitTopMatch,
      isActive: job?.agentConfig?.isActive,
    };
  }, [job]);

  const { error: errorMessage, loading } = useSelector(
    (state: any) => state.agentConfig.createConfig
  );

  const renderNumericField = (
    key: keyof AgentConfigUpdatePayload,
    value: number,
    onChange: (e: ChangeEvent<any>) => void
  ) => {
    const config = AGENT_CONFIG_NUMBER_FIELDS.find(
      (field) => field.key === key
    );
    if (!config) return null;
    return (
      <StyledTextField
        key={config.key}
        type="number"
        name={config.key}
        label={config.label}
        fullWidth
        value={(value ?? "") as number | string}
        onChange={onChange}
        inputProps={{
          min: config.min,
          max: config.max,
          step: config.step,
        }}
        disabled={loading}
        helperText={config.helper}
      />
    );
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values, { resetForm }) => {
        if (!validateAgentConfig(values, showToast)) return;
        if (!config) {
          await dispatch(
            createHRAgent({
              agentData: {
                jobId: job?._id,
                companyName: profile?.companyDetails?.name || "Company",
                postTitle: job?.jobDetails?.title,
                companyId: profile?.userId,
                jobSkills: getJobSkills(job),
              },
              configData: values,
            })
          ).unwrap();
          if (job?.creationType === "ai") {
            await dispatch(
              updatePostStatus({ postId: job?._id, status: "open" })
            ).unwrap();
          }
        } else {
          await dispatch(
            updateAgentConfig({
              id: job?.agentConfig?._id,
              data: values,
            })
          ).unwrap();
          showToast({
            message: "Agent saved successfully. The settings are now active.",
            severity: "success",
          });
        }
        dispatch(updateAgentConfigInCurrentJob(values));
        resetForm();
        onCancel();
      }}
    >
      {({ values, isSubmitting, handleChange, handleSubmit, resetForm }) => (
        <Box sx={{ pb: 2, width: "100%" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            {/* Title */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  background: "rgba(234, 255, 247, 1)",
                  width: 45,
                  height: 45,
                  borderRadius: "5px",
                }}
              >
                <Image
                  src="/icons/edit.svg"
                  alt="file"
                  width={25}
                  height={25}
                />
              </Box>

              <Box>
                <Typography
                  sx={{
                    color: "rgba(41, 210, 145, 1)",
                    fontWeight: 600,
                    fontSize: "20px",
                  }}
                >
                  Edit Agent Configuration
                </Typography>

                <Typography sx={{ fontSize: "12px", color: "#546274" }}>
                  Update the settings for your recruitment agent below.
                </Typography>
              </Box>
            </Box>

            {/* Actions */}
            <Box sx={{ display: "flex", gap: 1 }}>
              {/* Cancel */}

              <Button
                variant="outlined"
                onClick={() => {
                  resetForm();
                  onCancel();
                }}
                sx={{
                  border: "none",
                  background: "none",
                  color: "rgba(133, 169, 227, 1)",
                  textDecoration: "none",
                  "&:hover": {
                    background: "none",
                    textDecoration: "none",
                    color: "rgba(133, 169, 227, 0.8)",
                  },
                }}
              >
                Cancel
              </Button>

              {/* Save */}
              <Button
                variant="contained"
                disabled={isSubmitting}
                loading={isSubmitting}
                onClick={() => handleSubmit()}
                sx={{
                  textTransform: "none",
                  height: "42px",
                  width: "120px",
                  maxWidth: "230px",
                  borderRadius: "38px",
                  background: "rgba(0, 234, 144, 1)",
                  color: "white",
                }}
              >
                Save
              </Button>
            </Box>
          </Box>

          <MainLayout>
            {/* Identity & Safeguards */}
            <Box>
              <Box display="flex" alignItems="center" gap={1}>
                <SectionTitle>Identity & Safeguards</SectionTitle>
                <Tooltip title="" arrow>
                  <InfoOutlinedIcon
                    sx={{ color: "#94a3b8", width: "16px", height: "16px" }}
                  />
                </Tooltip>
              </Box>

              <SubtleText>
                Connect this configuration to the originating post and define
                qualification thresholds.
              </SubtleText>

              <FieldGrid sx={{ mt: 2 }}>
                {renderNumericField(
                  "thresholdPercent",
                  values.thresholdPercent,
                  handleChange
                )}
                {renderNumericField(
                  "maxCandidatesToBid",
                  values.maxCandidatesToBid,
                  handleChange
                )}
              </FieldGrid>
            </Box>

            {/* Bidding Envelope */}
            <Box>
              <Box display="flex" alignItems="center" gap={1}>
                <SectionTitle>Bidding Envelope</SectionTitle>
                <AutoGraphIcon
                  sx={{ color: "#94a3b8", width: "16px", height: "16px" }}
                />
              </Box>

              <SubtleText>
                Control budget boundaries and pacing for candidate interactions.
              </SubtleText>

              <FieldGrid sx={{ mt: 2 }}>
                {renderNumericField(
                  "bidBudgetMin",
                  values.bidBudgetMin,
                  handleChange
                )}
                {renderNumericField(
                  "bidBudgetMax",
                  values.bidBudgetMax,
                  handleChange
                )}
                {renderNumericField("bidStep", values.bidStep, handleChange)}
                {renderNumericField(
                  "maxDailySpending",
                  values.maxDailySpending,
                  handleChange
                )}
              </FieldGrid>
            </Box>

            {/* Lifecycle Policies */}
            <Box>
              <Box display="flex" alignItems="center" gap={1}>
                <SectionTitle>Lifecycle Policies</SectionTitle>
                <TrendingUpIcon
                  sx={{ color: "#94a3b8", width: "16px", height: "16px" }}
                />
              </Box>

              <SubtleText>
                Define how long the agent remains active and how long bids
                remain valid.
              </SubtleText>

              <FieldGrid sx={{ mt: 2 }}>
                {renderNumericField(
                  "agentLifetimeDays",
                  values.agentLifetimeDays,
                  handleChange
                )}
                {renderNumericField(
                  "bidLifetimeDays",
                  values.bidLifetimeDays,
                  handleChange
                )}
              </FieldGrid>
            </Box>
          </MainLayout>

          {/* Errors */}
          {errorMessage && (
            <Alert severity="error" sx={{ mt: 4, borderRadius: 2 }}>
              {errorMessage}
            </Alert>
          )}
        </Box>
      )}
    </Formik>
  );
};

export default EditAgentConfiguration;