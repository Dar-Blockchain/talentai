import { Box } from "@mui/material";

interface GradientCircleProps {
  variant?: "success" | "warning" | "danger";
  size?: number;
  borderSize?: number;
  children?: React.ReactNode;
}

export const GradientCircle: React.FC<GradientCircleProps> = ({
  variant = "danger",
  size = 150,
  borderSize = 10,
  children,
}) => {
  const gradients = {
    success: "linear-gradient(180deg, #50C878 0%, #3EB489 100%)",
    warning: "linear-gradient(180deg, #f9d976 0%, #f39c12 100%)",
    danger: "linear-gradient(180deg, #F9B16E 0%, #F68080 100%)",
  };

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        padding: `${borderSize}px`,
        background: gradients[variant],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: "#fff",
          overflow: "hidden",
          display: "flex",          // ➜ Centering
          alignItems: "center",     // ➜ Centering
          justifyContent: "center", // ➜ Centering
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
