import { Box, CircularProgress } from "@mui/material";

export const LoadingScreen: React.FC = () => (
  <Box
    sx={{
      minHeight: "100vh",
      background: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <CircularProgress size={60} sx={{ color: "#00FF9D" }} />
  </Box>
);
