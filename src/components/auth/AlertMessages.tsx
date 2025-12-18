import { Alert } from "@mui/material";

interface AlertMessagesProps {
  error?: string;
  success?: string;
}

export const AlertMessages: React.FC<AlertMessagesProps> = ({ error, success }) => {
  return (
    <>
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            bgcolor: "rgba(211, 47, 47, 0.08)",
            borderLeft: "4px solid #ff4444",
            "& .MuiAlert-icon": {
              color: "#ff4444",
            },
          }}
        >
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
            bgcolor: "rgba(46, 125, 50, 0.08)",
            borderLeft: "4px solid #00FFC3",
            "& .MuiAlert-icon": {
              color: "#00FFC3",
            },
          }}
        >
          {success}
        </Alert>
      )}
    </>
  );
};
