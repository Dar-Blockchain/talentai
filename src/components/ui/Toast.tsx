import React from "react";
import { Snackbar, Alert, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface MuiToastProps {
  open: boolean;
  message: string;
  severity?: "success" | "error" | "warning" | "info";
  onClose: () => void;
}

// Light degree colors
const lightSeverityColors = {
  success: "rgba(0, 234, 144, 1)", // light green
  error: "rgba(220, 54, 46, 1)",   // light red
  warning: "rgba(233, 103, 37, 1)", // light orange
  info: "rgba(241, 251, 253, 1)",    // very light cyan
};

const textColors = {
  success: "white",
  error: "white",
  warning: "white",
  info: "black", // slightly darker for readability
};

const MuiToast: React.FC<MuiToastProps> = ({
  open,
  message,
  severity = "info",
  onClose,
}) => {
  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      onClose={onClose}
    //   autoHideDuration={4000}
    >
      <Alert
        severity={severity}
        variant="filled"
        onClose={onClose}
        sx={{
          bgcolor: lightSeverityColors[severity],
          color: textColors[severity],
          borderRadius: "16px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          display: "flex",
          alignItems: "center",
          minWidth: "320px",
          fontWeight: 500,
          fontSize: "0.95rem",
          backdropFilter: "blur(8px)",
        }}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={onClose}
            sx={{
              marginLeft: "8px",
              color: "white",
              transition: "color 0.2s",
              "&:hover": { color: "rgba(0,0,0,0.7)" },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default MuiToast;
