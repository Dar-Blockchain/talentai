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

const FindSection: React.FC = () => {
  return (
    <Box
      sx={{
        backgroundColor: "#EFF0F0",
        py: { xs: 2, md: 3 },
        px: 3,
        mb: { xs: 2, md: 3 },
      }}
    >
      <Box sx={{ maxWidth: 1400, width: "100%", mx: "auto" }}>
        <Typography
          variant="overline"
          sx={{
            color: "rgba(61, 0, 194, 1)",
            fontFamily: "Inter",
            fontWeight: 400,
            fontStyle: "normal",
            fontSize: "14px",
            lineHeight: "21px",
            letterSpacing: "0.8px",
            textTransform: "uppercase",
            verticalAlign: "middle",
          }}
        >
          FIND
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
          Cut Hiring Time in Half, Double Your Quality of Hire
        </Typography>
        <Typography
          variant="body2"
          sx={{
            maxWidth: 720,
            mt: 1.5,
            fontFamily: "Fustat",
            fontWeight: 400,
            fontStyle: "normal",
            fontSize: "16px",
            lineHeight: "24px",
            letterSpacing: "0",
            verticalAlign: "middle",
            color: "rgba(56, 58, 61, 1)",
          }}
        >
          Access a global talent pool and hire the best candidates, no matter
          where they are. Effortlessly connect with top talent for your open
          roles.
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
              title="Dramatic Time Savings"
              desc="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
              img="/images/home/Country Explorer_ Employment Guides for Global Teams.png"
            />
          </Box>
          <Box
            sx={{
              width: { xs: "100%", sm: "420px", md: "450px" },
              maxWidth: { xs: "100%", md: "450px" },
            }}
          >
            <Card
              title="Superior Candidate Quality"
              desc="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
              img="/images/home/Employee Cost Calculator.png"
            />
          </Box>
          <Box
            sx={{
              width: { xs: "100%", sm: "420px", md: "450px" },
              maxWidth: { xs: "100%", md: "450px" },
            }}
          >
            <Card
              title="Scalable Operations"
              desc="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
              img="/images/home/Remote Talent.png"
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default FindSection;
