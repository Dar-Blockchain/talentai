import React from "react";
import { Snackbar, Alert, IconButton, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import PriorityHighSharpIcon from "@mui/icons-material/PriorityHighSharp";

// Custom info icon
export const InfoIconCustom = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
    <text
      x="50%"
      y="50%"
      dominantBaseline="middle"
      textAnchor="middle"
      fontSize="16"
      fontWeight="bold"
    >
      i
    </text>
  </svg>
);

interface MuiToastProps {
  open: boolean;
  message: string;
  severity?: "success" | "error" | "warning" | "info";
  onClose: () => void;
}

// Common styles
const lightSeverityColors = {
  success: "rgba(246, 255, 249, 1)",
  error: "rgba(255, 245, 243, 1)",
  warning: "rgba(255, 248, 236, 1)",
  info: "rgba(245, 249, 255, 1)",
};

const textColors = {
  success: "rgba(47, 63, 83, 1)",
  error: "rgba(47, 63, 83, 1)",
  warning: "rgba(47, 63, 83, 1)",
  info: "rgba(47, 63, 83, 1)",
};

const borderColors = {
  success: "rgba(72, 193, 181, 1)",
  error: "rgba(244, 176, 161, 1)",
  warning: "rgba(247, 217, 164, 1)",
  info: "rgba(157, 192, 238, 1)",
};

// Reusable function to render icon box
const IconBox: React.FC<{ bgColor: string; icon: React.ReactNode }> = ({
  bgColor,
  icon,
}) => (
  <Box
    sx={{
      backgroundColor: bgColor,
      borderRadius: "6px",
      width: 24,
      height: 24,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    {icon}
  </Box>
);

// Mapping severity to icons
const severityIcons = {
  success: <IconBox bgColor="rgba(0,234,144,1)" icon={<CheckIcon sx={{ color: "#fff", width: 15, height: 13 }} />} />,
  error: <IconBox bgColor="rgba(222,69,35,1)" icon={<CloseIcon sx={{ color: "#fff", width: 15, height: 13 }} />} />,
  warning: <IconBox bgColor="rgba(255,180,36,1)" icon={<PriorityHighSharpIcon sx={{ color: "#fff", width: 15, height: 13 }} />} />,
  info: <IconBox bgColor="rgba(77,202,255,1)" icon={<InfoIconCustom />} />,
};

const MuiToast: React.FC<MuiToastProps> = ({
  open,
  message,
  severity = "info",
  onClose,
}) => (
  <Snackbar open={open} anchorOrigin={{ vertical: "top", horizontal: "right" }} onClose={onClose} >
    <Alert
      severity={severity}
      variant="filled"
      icon={severityIcons[severity]}
      onClose={onClose}
      sx={{
        bgcolor: lightSeverityColors[severity],
        color: textColors[severity],
        borderRadius: "12px",
        border: `1px solid ${borderColors[severity]}`,
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        display: "flex",
        alignItems: "flex-start",
        minWidth: 280,
        maxWidth: 360,
        fontWeight: 400,
        fontSize: 12,
        backdropFilter: "blur(8px)",
      }}
      action={
        <IconButton
          size="small"
          aria-label="close"
          onClick={onClose}
          sx={{
            ml: 1,
            color: "rgba(151,159,169,1)",
            "&:hover": { color: "rgba(0,0,0,0.3)" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      }
    >
      <span style={{ whiteSpace: "pre-line" }}>
        {message.length > 100 ? message.slice(0, 100).trimEnd() + "…" : message}
      </span>
    </Alert>
  </Snackbar>
);

export default MuiToast;