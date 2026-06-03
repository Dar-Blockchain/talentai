import React from "react";
import { Box, Button, Typography } from "@mui/material";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, px: 3, textAlign: "center" }}>
        <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, fontFamily: "Poppins", color: "#0F172A" }}>
          Something went wrong
        </Typography>
        <Typography sx={{ fontSize: "0.875rem", color: "#6B7280", fontFamily: "Poppins" }}>
          An unexpected error occurred. Please reload the page.
        </Typography>
        <Button
          variant="outlined"
          onClick={() => window.location.reload()}
          sx={{ textTransform: "none", fontFamily: "Poppins", borderRadius: "10px", mt: 1 }}
        >
          Reload page
        </Button>
      </Box>
    );
  }
}

export default ErrorBoundary;
