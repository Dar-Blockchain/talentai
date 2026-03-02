import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  Chip,
  alpha,
  Fade,
} from "@mui/material";
import {
  ArrowForward as ArrowForwardIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import AppButton from "@/components/ui/AppButton";
import { CampaignStatus } from "@/types/campaign";
import {
  STATUS_COLORS,
  STATUS_TRANSITIONS,
  STATUS_TRANSITION_LABELS,
} from "@/constants/campaign";

interface Props {
  open: boolean;
  campaignTitle: string;
  currentStatus: CampaignStatus;
  onClose: () => void;
  onConfirm: (newStatus: CampaignStatus) => void;
}

const ChangeStatusDialog: React.FC<Props> = ({
  open,
  campaignTitle,
  currentStatus,
  onClose,
  onConfirm,
}) => {
  const available = STATUS_TRANSITIONS[currentStatus] ?? [];
  const [selected, setSelected] = useState<CampaignStatus | null>(
    available[0] ?? null
  );
  const [isHovering, setIsHovering] = useState<CampaignStatus | null>(null);

  useEffect(() => {
    setSelected(available[0] ?? null);
    setIsHovering(null);
  }, [currentStatus, open]);

  const currentColors = STATUS_COLORS[currentStatus] || STATUS_COLORS.DRAFT;

  const handleConfirm = () => {
    if (selected) {
      onConfirm(selected);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Fade}
      transitionDuration={300}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            maxWidth: 440,
            width: "100%",
            backgroundColor: "#FFFFFF",
            boxShadow: "0px 24px 48px -12px rgba(0, 0, 0, 0.25)",
            overflow: "hidden",
            animation: "slideUp 0.3s ease",
            "@keyframes slideUp": {
              "0%": {
                opacity: 0,
                transform: "translateY(20px)",
              },
              "100%": {
                opacity: 1,
                transform: "translateY(0)",
              },
            },
          },
        },
      }}
    >
      {/* Decorative header gradient */}
      <Box
        sx={{
          height: 6,
          width: "100%",
          background: `linear-gradient(90deg, ${currentColors.fg} 0%, ${currentColors.fg}80 100%)`,
        }}
      />

      <DialogTitle
        sx={{
          fontSize: 18,
          fontWeight: 600,
          color: "#0F172A",
          pb: 0.5,
          pt: 2.5,
          px: 3,
        }}
      >
        Change campaign status
      </DialogTitle>

      <DialogContent sx={{ pt: 1, pb: 2, px: 3 }}>
        <Typography
          sx={{
            fontSize: 14,
            color: "#64748B",
            mb: 3,
            lineHeight: 1.5,
          }}
        >
          Update status for{" "}
          <Box
            component="span"
            sx={{
              color: "#0F172A",
              fontWeight: 500,
              backgroundColor: "#F1F5F9",
              px: 0.75,
              py: 0.25,
              borderRadius: 0.75,
            }}
          >
            {campaignTitle}
          </Box>
        </Typography>

        {/* Current status card */}
        <Box
          sx={{
            mb: 3,
            p: 2,
            backgroundColor: "#F8FAFC",
            borderRadius: 2.5,
            border: "1px solid #E2E8F0",
          }}
        >
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 500,
              color: "#64748B",
              mb: 1,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Current status
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              label={currentStatus}
              size="small"
              sx={{
                height: 28,
                fontSize: 13,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 0.4,
                bgcolor: alpha(currentColors.fg, 0.08),
                color: currentColors.fg,
                border: `1px solid ${alpha(currentColors.fg, 0.2)}`,
                "& .MuiChip-label": {
                  px: 1.5,
                },
              }}
            />
            {available.length > 0 && (
              <Fade in={available.length > 0}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <ArrowForwardIcon
                    sx={{
                      fontSize: 16,
                      color: "#94A3B8",
                      mx: 0.5,
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "#64748B",
                      fontStyle: "italic",
                    }}
                  >
                    Can be changed to:
                  </Typography>
                </Box>
              </Fade>
            )}
          </Box>
        </Box>

        {/* Target status selection */}
        {available.length > 0 ? (
          <Box>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 500,
                color: "#64748B",
                mb: 1.5,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Select new status
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                gap: 1,
              }}
            >
              {available.map((status) => {
                const sc = STATUS_COLORS[status];
                const isSelected = selected === status;
                const isHovered = isHovering === status;

                return (
                  <Box
                    key={status}
                    onClick={() => setSelected(status)}
                    onMouseEnter={() => setIsHovering(status)}
                    onMouseLeave={() => setIsHovering(null)}
                    sx={{
                      position: "relative",
                      p: 1.5,
                      borderRadius: 2,
                      cursor: "pointer",
                      backgroundColor: isSelected
                        ? alpha(sc.fg, 0.04)
                        : "transparent",
                      border: "1px solid",
                      borderColor: isSelected
                        ? sc.fg
                        : isHovered
                        ? alpha(sc.fg, 0.3)
                        : "#E2E8F0",
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      "&:hover": {
                        backgroundColor: alpha(sc.fg, 0.02),
                        borderColor: alpha(sc.fg, 0.5),
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          backgroundColor: sc.fg,
                          opacity: 0.8,
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: isSelected ? 600 : 500,
                          color: isSelected ? sc.fg : "#1E293B",
                        }}
                      >
                        {STATUS_TRANSITION_LABELS[status]}
                      </Typography>
                    </Box>
                    {isSelected && (
                      <Fade in={isSelected}>
                        <CheckIcon sx={{ fontSize: 16, color: sc.fg }} />
                      </Fade>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              p: 3,
              backgroundColor: "#F8FAFC",
              borderRadius: 2,
              textAlign: "center",
              border: "1px dashed #CBD5E1",
            }}
          >
            <Typography
              sx={{
                fontSize: 14,
                color: "#64748B",
              }}
            >
              No status transitions available
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          gap: 1.5,
          borderTop: "1px solid #E2E8F0",
          backgroundColor: "#F8FAFC",
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            fontSize: 14,
            fontWeight: 500,
            color: "#64748B",
            textTransform: "none",
            px: 2,
            py: 1,
            borderRadius: 2,
            "&:hover": {
              backgroundColor: "#F1F5F9",
            },
          }}
        >
          Cancel
        </Button>

        <AppButton
          label="Confirm Change"
          size="medium"
          disabled={!selected}
          onClick={handleConfirm}
          sx={{
            px: 3,
            py: 1,
            borderRadius: 2,
            fontSize: 14,
            fontWeight: 600,
            textTransform: "none",
            boxShadow: "none",
            backgroundColor: selected ? STATUS_COLORS[selected]?.fg : "#94A3B8",
            "&:hover": {
              backgroundColor: selected
                ? alpha(STATUS_COLORS[selected]?.fg, 0.9)
                : "#94A3B8",
              boxShadow: "none",
            },
            "&.Mui-disabled": {
              backgroundColor: "#E2E8F0",
              color: "#94A3B8",
            },
          }}
        />
      </DialogActions>
    </Dialog>
  );
};

export default ChangeStatusDialog;