import React from "react";
import { Box, Container } from "@mui/material";

type PageContainerProps = {
  children: React.ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  disablePadding?: boolean;
};

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = "lg",
  disablePadding = false,
}) => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "rgba(251, 254, 255, 1)",
        py: disablePadding ? 0 : 2,
      }}
    >
      <Container maxWidth={maxWidth}>{children}</Container>
    </Box>
  );
};

export default React.memo(PageContainer);
