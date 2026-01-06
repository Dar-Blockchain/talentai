import { Box, CircularProgress, Typography } from "@mui/material";

interface LoadingScreenProps {
  title?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ title }) => (
  <Box
    sx={{
      minHeight: "100vh",
      background: "white",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <CircularProgress size={60} sx={{ color: "#00FF9D" }} />
    {title && (
      <Typography
        sx={{
          mt: 2,
          fontSize: "16px",
          fontWeight: 500,
          lineHeight: "22px",
          color: "rgba(24, 25, 28, 1)",
        }}
      >
        {title}
      </Typography>
    )}
  </Box>
);

export default LoadingScreen;
