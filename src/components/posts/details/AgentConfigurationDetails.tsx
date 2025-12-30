import React from "react";
import { Box, Typography, Stack, Chip, Divider, Button } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DoNotDisturbAltIcon from "@mui/icons-material/DoNotDisturbAlt";
import { useSelector } from "react-redux";
import { selectCurrentJob } from "@/store/slices/postSlice";
import Image from "next/image";
import { PersonOff } from "@mui/icons-material";

const InfoChip = ({ label }: { label: string }) => (
  <Chip
    label={label}
    size="small"
    sx={{
      backgroundColor: "rgba(95, 168, 211, 0.1)",
      color: "rgba(84, 98, 116, 1)",
      fontWeight: 500,
      fontSize: "0.75rem",
      height: 24,
      border: "0.25px solid rgba(95, 168, 211, 1)",
    }}
  />
);

interface Props {
  onEdit: () => void;
}

const AgentConfigurationDetails: React.FC<Props> = ({ onEdit }) => {
  const job = useSelector(selectCurrentJob);
  const config = React.useMemo(() => job?.agentConfig, [job]);

  return (
    <Box
      sx={{
        border: "1px solid rgba(98, 111, 134, 0.18)",
        backgroundColor: "rgba(253, 253, 253, 1)",
        borderRadius: "12px",
        px: 2,
        py: 1.5,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Title */}
          <Typography
            variant="h5"
            sx={{
              position: "relative",
              fontWeight: 600,
              fontSize: "20px",
              lineHeight: "45px",
              color: "rgba(23, 43, 77, 1)",
              "&::after": {
                content: '""',
                position: "absolute",
                left: 0,
                bottom: 0,
                width: "38px",
                height: "5px",
                backgroundColor: "rgba(41, 210, 145, 0.83)",
                borderRadius: "2px",
              },
            }}
          >
            Agent Configuration
          </Typography>
          {/* Status */}
          {config && (
            <Stack direction="row" spacing={1} alignItems="center">
              {config?.isActive ? (
                <Chip
                  icon={
                    <CheckCircleOutlineIcon
                      sx={{ color: "rgba(77, 217, 163, 1)!important" }}
                    />
                  }
                  label="Agent Active"
                  size="small"
                  sx={{
                    backgroundColor: "rgba(77, 217, 163, 0.15)",
                    color: "rgba(84, 98, 116, 1)",
                    fontWeight: 400,
                    fontSize: "13px",
                  }}
                />
              ) : (
                <Chip
                  icon={
                    <DoNotDisturbAltIcon
                      sx={{ color: "rgba(224, 62, 92, 1)!important" }}
                    />
                  }
                  label="Agent Inactive"
                  size="small"
                  sx={{
                    backgroundColor: "rgba(224, 62, 92, 0.12)",
                    color: "rgba(84, 98, 116, 1)",
                    fontWeight: 400,
                    fontSize: "13px",
                  }}
                />
              )}
            </Stack>
          )}
        </Box>
        <Button
          variant="outlined"
          fullWidth
          onClick={onEdit}
          startIcon={
            <Image
              src={config ? "/icons/edit.svg" : "/icons/plus.svg"}
              alt="edit"
              width={20}
              height={20}
            />
          }
          sx={{
            textTransform: "none",
            fontWeight: 500,
            fontSize: "13px",
            py: 1.25,
            borderRadius: "38px",
            width: "230px",
            height: "42px",
            backgroundColor: "rgba(241, 252, 248, 1)",
            borderColor: "rgba(77, 217, 163, 1)",
            color: "rgba(77, 217, 163, 1)",
            "&:hover": {
              borderColor: "rgba(77, 217, 163, 1)",
              backgroundColor: "rgba(241, 252, 248, 0.8)",
            },
          }}
        >
          {config ? "Edit Agent Configuration" : "Create Agent"}
        </Button>
      </Box>
      {!config && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 8,
            px: 4,
            backgroundColor: "rgba(62, 233, 167, 0.03)",
            borderRadius: "8px",
            border: "1px solid rgba(98, 111, 134, 0.18)",
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              mb: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(76, 217, 163, 0.2)",
              width: 100,
              height: 100,
              borderRadius: "50%",
            }}
          >
            <PersonOff
              sx={{ fontSize: 48, color: "rgba(19, 163, 108, 0.83)" }}
            />
          </Box>

          <Typography
            variant="h5"
            sx={{
              color: "rgba(19, 163, 108, 0.83)",
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: "20px",
              lineHeight: "28px",
              mb: 2,
            }}
          >
            No Agent Created Yet
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "rgba(147, 147, 147, 1)",
              maxWidth: "500px",
              mb: 4,
              fontFamily: "Poppins",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "25px",
              textAlign: "center",
            }}
          >
            You haven’t created your agent yet. Create it to start bidding on candidates.
          </Typography>
        </Box>
      )}
      {config && (
        <>
          {/* Matching Rules */}
          <Typography
            variant="subtitle2"
            sx={{
              color: "rgba(98, 111, 134, 1)",
              fontSize: "15px",
              fontWeight: 500,
              lineHeight: "42px",
            }}
          >
            Matching Rules
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
            <InfoChip label={`Threshold ≥ ${config.thresholdPercent}%`} />
            <InfoChip label={`Max candidates · ${config.maxCandidatesToBid}`} />
            <InfoChip
              label={`Auto-submit · ${
                config.autoSubmitTopMatch ? "Enabled" : "Disabled"
              }`}
            />
          </Stack>

          <Divider sx={{ my: 1.5 }} />

          {/* Budget */}
          <Typography
            variant="subtitle2"
            sx={{
              color: "rgba(98, 111, 134, 1)",
              fontSize: "15px",
              fontWeight: 500,
              lineHeight: "42px",
            }}
          >
            Bidding & Budget
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
            <InfoChip
              label={`Bid range · $${config.bidBudgetMin} – $${config.bidBudgetMax}`}
            />
            <InfoChip label={`Bid step · $${config.bidStep}`} />
            <InfoChip label={`Daily limit · $${config.maxDailySpending}`} />
          </Stack>

          <Divider sx={{ my: 1.5 }} />

          {/* Lifetimes */}
          <Typography
            variant="subtitle2"
            sx={{
              color: "rgba(98, 111, 134, 1)",
              fontSize: "15px",
              fontWeight: 500,
              lineHeight: "42px",
            }}
          >
            Lifetimes
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <InfoChip
              label={`Agent lifetime · ${config.agentLifetimeDays} days`}
            />
            <InfoChip label={`Bid lifetime · ${config.bidLifetimeDays} days`} />
          </Stack>
        </>
      )}
    </Box>
  );
};

export default AgentConfigurationDetails;
