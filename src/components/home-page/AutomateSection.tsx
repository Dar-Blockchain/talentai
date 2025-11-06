import React from "react";
import { Box, Typography } from "@mui/material";

const Card: React.FC<{ title: string; desc: string; img: string }> = ({
  title,
  desc,
  img,
}) => (
  <Box
    sx={{
      bgcolor: "#ffffff",
      borderRadius: 3,
      p: 0,
      border: "1px solid #E5E7EB",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      maxWidth: { xs: "100%", sm: "420px", md: "450px" },
      width: "100%",
    }}
  >
    <Box
      sx={{
        borderRadius: "12px 12px 0 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
        bgcolor: "transparent",
        minHeight: { xs: "220px", sm: "250px", md: "280px" },
        height: { xs: "220px", sm: "250px", md: "280px" },
      }}
    >
      <img
        src={img}
        alt={title}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: "12px 12px 0 0",
          display: "block",
        }}
      />
    </Box>
    <Box sx={{ p: 2.5, flex: 1, display: "flex", flexDirection: "column" }}>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          fontSize: { xs: "1rem", md: "1.125rem" },
          color: "#1F2937",
          mb: 1,
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: "#6B7280",
          fontSize: { xs: "0.875rem", md: "0.9rem" },
          lineHeight: 1.5,
        }}
      >
        {desc}
      </Typography>
    </Box>
  </Box>
);

const AutomateSection: React.FC = () => {
  return (
    <Box sx={{ py: { xs: 3, md: 5 }, px: 3 }}>
      <Box sx={{ maxWidth: 1400, width: "100%", mx: "auto" }}>
        <Typography
          variant="overline"
          sx={{
            color: "rgba(161, 48, 43, 1)",
            fontFamily: "Inter",
            fontWeight: 400,
            fontStyle: "normal",
            fontSize: "14px",
            lineHeight: "21px",
            letterSpacing: "0.8px",
            verticalAlign: "middle",
            textTransform: "uppercase",
          }}
        >
          AUTOMATE
        </Typography>
        <Typography
          variant="h5"
          sx={{
            fontFamily: "Inter",
            fontWeight: 400,
            fontStyle: "normal",
            fontSize: "36px",
            lineHeight: "43.2px",
            letterSpacing: "0",
            verticalAlign: "middle",
            color: "rgba(20, 20, 21, 1)",
            mt: 0.5,
          }}
        >
          Feature Deep Dive: Workflow Builder
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "rgba(56, 58, 61, 1)",
            fontFamily: "Fustat",
            fontWeight: 400,
            fontStyle: "normal",
            fontSize: "16px",
            lineHeight: "24px",
            letterSpacing: "0",
            verticalAlign: "middle",
            maxWidth: 720,
            mt: 1.5,
          }}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 3,
            mt: 4,
            alignItems: "stretch",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              width: { xs: "100%", sm: "420px", md: "450px" },
              maxWidth: { xs: "100%", md: "450px" },
            }}
          >
            <Card
              title="High-Volume Hiring Flow"
              desc="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
              img="/images/home/Recruit AI_ artificial intelligence recruitment tool.png"
            />
          </Box>
          <Box
            sx={{
              width: { xs: "100%", sm: "420px", md: "450px" },
              maxWidth: { xs: "100%", md: "450px" },
            }}
          >
            <Card
              title="Executive Search Flow"
              desc="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
              img="/images/home/Global HR Research and Reports.png"
            />
          </Box>
          <Box
            sx={{
              width: { xs: "100%", sm: "420px", md: "450px" },
              maxWidth: { xs: "100%", md: "450px" },
            }}
          >
            <Card
              title="Reference checks"
              desc="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
              img="/images/home/Employee Misclassification Risk Tool to Compare Contractor vs Employee Status..png"
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AutomateSection;