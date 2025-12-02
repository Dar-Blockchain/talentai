import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, TextField, Alert, Divider } from "@mui/material";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface MatchingConfigProps {
  jobData: any;
  onChange?: (config: any) => void;
}

interface Weights {
  hardSkill: number;
  SoftSkill: number;
  experience: number;
  salary: number;
  workMode: number;
  contract: number;
}

interface ImportanceWeight {
  Junior: number;
  Mid_Level: number;
  Senior: number;
  Expert: number;
}

interface ExchangeRates {
  USD: number;
  EUR: number;
  TND: number;
}

const MatchingConfig: React.FC<MatchingConfigProps> = ({ jobData, onChange }) => {
  const [weights, setWeights] = useState<Weights>({
    hardSkill: 50,
    SoftSkill: 10,
    experience: 20,
    salary: 5,
    workMode: 5,
    contract: 10,
  });

  const [importanceWeight, setImportanceWeight] = useState<ImportanceWeight>({
    Junior: 1.5,
    Mid_Level: 1.2,
    Senior: 1,
    Expert: 0.8,
  });

  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({
    USD: 1,
    EUR: 1.09,
    TND: 0.33,
  });

  // Load initial data from jobData if available
  useEffect(() => {
    if (jobData?.matchingConfig) {
      if (jobData.matchingConfig.weights) {
        setWeights(jobData.matchingConfig.weights);
      }
      if (jobData.matchingConfig.importanceWeight) {
        setImportanceWeight(jobData.matchingConfig.importanceWeight);
      }
      if (jobData.matchingConfig.exchangeRates) {
        setExchangeRates(jobData.matchingConfig.exchangeRates);
      }
    }
  }, [jobData]);

  // Notify parent of changes
  useEffect(() => {
    if (onChange) {
      onChange({
        weights,
        importanceWeight,
        exchangeRates,
      });
    }
  }, [weights, importanceWeight, exchangeRates]);

  const handleWeightChange = (key: keyof Weights, value: string) => {
    const numValue = parseInt(value) || 0;
    setWeights((prev) => ({ ...prev, [key]: numValue }));
  };

  const handleImportanceChange = (key: keyof ImportanceWeight, value: string) => {
    const numValue = parseFloat(value) || 0;
    setImportanceWeight((prev) => ({ ...prev, [key]: numValue }));
  };

  const handleExchangeRateChange = (key: keyof ExchangeRates, value: string) => {
    const numValue = parseFloat(value) || 0;
    setExchangeRates((prev) => ({ ...prev, [key]: numValue }));
  };

  // Calculate total percentage
  const totalPercentage = Object.values(weights).reduce((sum, val) => sum + val, 0);
  const isValidTotal = totalPercentage === 100;

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1000px",
        mx: "auto",
        py: 3,
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            mb: 2,
            color: "#0F172A",
          }}
        >
          🎯 Matching Configuration
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "#64748b",
            lineHeight: 1.6,
            mb: 3,
          }}
        >
          Configure how candidates will be matched to your job posting. These settings control the algorithm that ranks and suggests the best candidates.
        </Typography>

        {/* Info Box */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            backgroundColor: "#f0f9ff",
            border: "1px solid #bae6fd",
            borderRadius: 2,
            display: "flex",
            gap: 2,
          }}
        >
          <InfoOutlinedIcon sx={{ color: "#0284c7", fontSize: 24, flexShrink: 0, mt: 0.3 }} />
          <Box>
            <Typography variant="body2" sx={{ color: "#0c4a6e", fontWeight: 600, mb: 0.5 }}>
              How Matching Works
            </Typography>
            <Typography variant="body2" sx={{ color: "#075985", lineHeight: 1.6 }}>
              The matching algorithm evaluates candidates based on multiple factors. Each factor has a weight that determines its importance.
              The system also applies multipliers based on skill importance levels to prioritize critical requirements.
            </Typography>
          </Box>
        </Paper>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Section 1: Matching Weights */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          border: "1px solid #e2e8f0",
          borderRadius: 3,
          backgroundColor: "#fefefe",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#0F172A",
                mb: 0.5,
              }}
            >
              ⚖️ Matching Weights
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              Define how much each factor contributes to the overall match score
            </Typography>
          </Box>
          <Box
            sx={{
              px: 2,
              py: 1,
              borderRadius: 2,
              backgroundColor: isValidTotal ? "#dcfce7" : "#fee2e2",
              border: `1px solid ${isValidTotal ? "#86efac" : "#fca5a5"}`,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: isValidTotal ? "#166534" : "#991b1b",
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              Total: {totalPercentage}%
            </Typography>
          </Box>
        </Box>

        {!isValidTotal && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <strong>Warning:</strong> Total percentage must equal 100%. Current total: <strong>{totalPercentage}%</strong>
            {totalPercentage < 100
              ? ` (Add ${100 - totalPercentage}% more)`
              : ` (Reduce by ${totalPercentage - 100}%)`}
          </Alert>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
            gap: 2.5,
            mt: 2,
          }}
        >
          {Object.entries(weights).map(([key, value]) => (
            <Box
              key={key}
              sx={{
                p: 2,
                backgroundColor: "#f8fafc",
                borderRadius: 2,
                border: "1px solid #e2e8f0",
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: "#cbd5e1",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                },
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "#475569",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  fontSize: "0.65rem",
                  letterSpacing: "0.5px",
                  display: "block",
                  mb: 1,
                }}
              >
                {key.replace(/([A-Z])/g, " $1").trim()}
              </Typography>
              <TextField
                type="number"
                value={value}
                onChange={(e) => handleWeightChange(key as keyof Weights, e.target.value)}
                fullWidth
                size="small"
                slotProps={{
                  input: {
                    endAdornment: <Typography sx={{ color: "#94a3b8", fontWeight: 600, fontSize: "1.1rem" }}>%</Typography>,
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    "& input": {
                      textAlign: "center",
                    },
                  },
                }}
              />
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Section 2: Importance Multipliers */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          border: "1px solid #e2e8f0",
          borderRadius: 3,
          backgroundColor: "#fefefe",
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "#0F172A",
              mb: 0.5,
            }}
          >
            🎚️ Importance Level Multipliers
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Boost or reduce the weight of skills based on their importance level
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            backgroundColor: "#fef3c7",
            border: "1px solid #fde68a",
            borderRadius: 2,
          }}
        >
          <Typography variant="caption" sx={{ color: "#92400e", display: "block", lineHeight: 1.5 }}>
            <strong>💡 Tip:</strong> Higher multipliers (e.g., 1.5x for Junior) give more weight to those skills.
            Lower multipliers (e.g., 0.8x for Expert) reduce their impact on the final score.
          </Typography>
        </Paper>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
            gap: 2.5,
          }}
        >
          {Object.entries(importanceWeight).map(([key, value]) => (
            <Box
              key={key}
              sx={{
                p: 2,
                backgroundColor: "#f8fafc",
                borderRadius: 2,
                border: "1px solid #e2e8f0",
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: "#cbd5e1",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                },
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "#475569",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  fontSize: "0.65rem",
                  letterSpacing: "0.5px",
                  display: "block",
                  mb: 1,
                }}
              >
                {key.replace("_", " ")}
              </Typography>
              <TextField
                type="number"
                value={value}
                onChange={(e) => handleImportanceChange(key as keyof ImportanceWeight, e.target.value)}
                fullWidth
                size="small"
                slotProps={{
                  input: {
                    step: 0.1,
                    endAdornment: <Typography sx={{ color: "#94a3b8", fontWeight: 600, fontSize: "1.1rem" }}>×</Typography>,
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    "& input": {
                      textAlign: "center",
                    },
                  },
                }}
              />
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Section 3: Exchange Rates */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          border: "1px solid #e2e8f0",
          borderRadius: 3,
          backgroundColor: "#fefefe",
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "#0F172A",
              mb: 0.5,
            }}
          >
            💱 Currency Exchange Rates
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Convert salary expectations to USD for fair comparison across currencies
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            gap: 2.5,
          }}
        >
          {Object.entries(exchangeRates).map(([currency, rate]) => (
            <Box
              key={currency}
              sx={{
                p: 2,
                backgroundColor: "#f8fafc",
                borderRadius: 2,
                border: "1px solid #e2e8f0",
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: "#cbd5e1",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                },
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "#475569",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  fontSize: "0.65rem",
                  letterSpacing: "0.5px",
                  display: "block",
                  mb: 1,
                }}
              >
                {currency}
              </Typography>
              <TextField
                type="number"
                value={rate}
                onChange={(e) => handleExchangeRateChange(currency as keyof ExchangeRates, e.target.value)}
                fullWidth
                size="small"
                slotProps={{
                  input: {
                    step: 0.01,
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    "& input": {
                      textAlign: "center",
                    },
                  },
                }}
              />
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default MatchingConfig;
