"use client";
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";

interface AgentConfigurationLoadingModalProps {
  open: boolean;
}

const AgentConfigurationLoadingModal: React.FC<
  AgentConfigurationLoadingModalProps
> = ({ open }) => {
  return (
    <Dialog
      open={open}
      fullWidth
      PaperProps={{
        sx: {
          maxWidth: "540px",
          width: "100%",
        },
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: "1px solid rgba(227, 229, 233, 1)",
        }}
      >
        <Typography
          sx={{
            color: "rgba(41, 210, 145, 1)",
            fontFamily: "Poppins",
            fontWeight: 600,
            fontSize: "20px",
            lineHeight: "25px",
          }}
        >
          Configuring Hiring Agent
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box py={4} textAlign="center">
          <CircularProgress
            size={80}
            thickness={2}
            sx={{ color: "rgba(41, 210, 145, 1)" }}
          />

          <Typography
            sx={{
              mt: 3,
              fontSize: "16px",
              fontWeight: 500,
              lineHeight: "22px",
              color: "rgba(24, 25, 28, 1)",
            }}
          >
            Setting up your hiring agent…
          </Typography>

          <Typography
            sx={{
              mt: 1,
              fontSize: "14px",
              fontWeight: 400,
              lineHeight: "22px",
              color: "rgba(84, 98, 116, 0.8)",
            }}
          >
            We’re configuring workflows, rules, and automation to help you hire
            faster.
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AgentConfigurationLoadingModal;
