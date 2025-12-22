import React from "react";
import {
  Box,
  Typography,
  TextField,
  Tooltip,
  Alert,
  Stack,
  Chip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import { useSelector } from "react-redux";

export interface AgentConfigurationFormValues {
  agentId: string;
  postId: string;
  thresholdPercent?: number;
  bidBudgetMin?: number;
  bidBudgetMax?: number;
  bidStep?: number;
  maxCandidatesToBid?: number;
  agentLifetimeDays?: number;
  bidLifetimeDays?: number;
  autoSubmitTopMatch: boolean;
  maxDailySpending?: number;
  isActive: boolean;
}

export interface AgentConfigurationFormProps {
  value: AgentConfigurationFormValues;
  onChange: (update: Partial<AgentConfigurationFormValues>) => void;
}

const numberFields = [
  {
    key: "thresholdPercent",
    label: "Match Threshold (%)",
    helper: "Score required before automated actions can run",
    min: 0,
    max: 100,
    step: 1,
  },
  {
    key: "bidBudgetMin",
    label: "Minimum Bid Budget ($)",
    helper: "Lowest amount the agent can bid",
    min: 0,
    step: 1,
  },
  {
    key: "bidBudgetMax",
    label: "Maximum Bid Budget ($)",
    helper: "Highest allowed bid",
    min: 0,
    step: 1,
  },
  {
    key: "bidStep",
    label: "Bid Increment ($)",
    helper: "Increment used when increasing bids",
    min: 1,
    step: 1,
  },
  {
    key: "maxCandidatesToBid",
    label: "Max Candidates to Bid",
    helper: "Concurrent candidates the agent can engage",
    min: 1,
    step: 1,
  },
  {
    key: "maxDailySpending",
    label: "Daily Spending Limit ($)",
    helper: "Maximum daily agent spending",
    min: 0,
    step: 1,
  },
  {
    key: "agentLifetimeDays",
    label: "Agent Lifetime (days)",
    helper: "Auto-deactivation period",
    min: 1,
    step: 1,
  },
  {
    key: "bidLifetimeDays",
    label: "Bid Lifetime (days)",
    helper: "How long a bid remains valid",
    min: 1,
    step: 1,
  },
];

/* ------------------------------- STYLES ------------------------------- */

const SectionTitle = styled(Typography)(() => ({
  fontWeight: 600,
  color: "#0f172a",
  fontSize: "1.1rem",
}));

const SubtleText = styled(Typography)(() => ({
  color: "#64748b",
  fontSize: "0.85rem",
  marginTop: 4,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 10,
    backgroundColor: "#fff",
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
    fontSize: "0.75rem",
    color: "#64748b",
  },
}));

const MainLayout = styled(Box)(({ theme }) => ({
  display: "grid",
  gap: theme.spacing(4),
  gridTemplateColumns: "1fr",
}));

const FieldGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gap: theme.spacing(2.5),
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
}));

/* ------------------------------- COMPONENT ------------------------------- */

const AgentConfigurationForm: React.FC<AgentConfigurationFormProps> = ({
  value,
  onChange,
}) => {
    const {error: errorMessage, loading} = useSelector(
      (state: any) => state.agentConfig.createConfig
    );
  const handleNumberChange =
    (key: keyof AgentConfigurationFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = event.target.value;
      const parsed = raw === "" ? undefined : Number(raw);
      onChange({
        [key]: Number.isNaN(parsed as number) ? undefined : parsed,
      });
    };

  const renderNumericField = (key: keyof AgentConfigurationFormValues) => {
    const config = numberFields.find((field) => field.key === key);
    if (!config) return null;

    return (
      <StyledTextField
        key={config.key}
        type="number"
        label={config.label}
        fullWidth
        value={(value[key] ?? "") as number | string}
        onChange={handleNumberChange(key)}
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
    <Box sx={{ pb: 2, width: "100%" }}>
      {/* ------------------ HEADER ------------------ */}
      <Box
        sx={{
          p: 3,
          borderRadius: 2,
          backgroundColor: "#ffffff",
          mb: 4,
          border: "1px solid #eef0f2",
        }}
      >
        {/* HEADER ROW */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {/* ICON BLOCK */}
          <Box
            sx={{
              width: 45,
              height: 45,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(223, 246, 237, 1)",
            }}
          >
            <SmartToyIcon sx={{ fontSize: 26, color: "#0ea5e9" }} />
          </Box>

          {/* TEXT BLOCK */}
          <Box>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "20px",
                color: "#0f172a",
              }}
            >
              Agent Control Center
            </Typography>

            <Typography
              sx={{
                fontSize: "13px",
                color: "#64748b",
                mt: 0.3,
              }}
            >
              Configure bidding behavior, automation rules, and spending limits.
            </Typography>
          </Box>
        </Box>

        {/* CHIPS ROW */}
        <Box sx={{ mt: 2, display: "flex", gap: 1.2, flexWrap: "wrap" }}>
          <Chip
            label={value.isActive ? "Status: Active" : "Status: Paused"}
            size="small"
            sx={{
              backgroundColor: value.isActive ? "#ecfeff" : "#f1f5f9",
              color: value.isActive ? "#0e7490" : "#334155",
              borderRadius: 2,
            }}
          />

          <Chip
            label={
              value.autoSubmitTopMatch
                ? "Automation: Enabled"
                : "Automation: Manual"
            }
            size="small"
            sx={{
              backgroundColor: value.autoSubmitTopMatch ? "#eef2ff" : "#f1f5f9",
              color: value.autoSubmitTopMatch ? "#4f46e5" : "#334155",
              borderRadius: 2,
            }}
          />
        </Box>
      </Box>

      {/* ------------------ MAIN LAYOUT ------------------ */}
      <MainLayout>
        {/* Identity & Safeguards */}
        <Box>
          <Box display="flex" alignItems="center" gap={1}>
            <SectionTitle>Identity & Safeguards</SectionTitle>
            <Tooltip
              title=""
              arrow
            >
              <InfoOutlinedIcon sx={{ color: "#94a3b8" }} />
            </Tooltip>
          </Box>

          <SubtleText>
            Connect this configuration to the originating post and define
            qualification thresholds.
          </SubtleText>

          <FieldGrid sx={{ mt: 2 }}>
            {renderNumericField("thresholdPercent")}
            {renderNumericField("maxCandidatesToBid")}
          </FieldGrid>
        </Box>

        {/* Bidding Envelope */}
        <Box>
          <Box display="flex" alignItems="center" gap={1}>
            <SectionTitle>Bidding Envelope</SectionTitle>
            <AutoGraphIcon sx={{ color: "#94a3b8" }} />
          </Box>

          <SubtleText>
            Control budget boundaries and pacing for candidate interactions.
          </SubtleText>

          <FieldGrid sx={{ mt: 2 }}>
            {renderNumericField("bidBudgetMin")}
            {renderNumericField("bidBudgetMax")}
            {renderNumericField("bidStep")}
            {renderNumericField("maxDailySpending")}
          </FieldGrid>
        </Box>

        {/* Lifecycle Policies */}
        <Box>
          <Box display="flex" alignItems="center" gap={1}>
            <SectionTitle>Lifecycle Policies</SectionTitle>
            <TrendingUpIcon sx={{ color: "#94a3b8" }} />
          </Box>

          <SubtleText>
            Define how long the agent remains active and how long bids remain
            valid.
          </SubtleText>

          <FieldGrid sx={{ mt: 2 }}>
            {renderNumericField("agentLifetimeDays")}
            {renderNumericField("bidLifetimeDays")}
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
  );
};

export default AgentConfigurationForm;
