import React from "react";
import { Box, Typography } from "@mui/material";
import { Button } from "@/modules/shared/ui/shadcn/button";

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
        <Button variant="outline" onClick={() => window.location.reload()} className="mt-1 rounded-[10px] font-[Poppins]">
          Reload page
        </Button>
      </Box>
    );
  }
}

export default ErrorBoundary;
