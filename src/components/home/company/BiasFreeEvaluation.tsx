import React from "react";
import { Box, Button, Checkbox, Stack, Typography } from "@mui/material";

const Bullet: React.FC<{ label: string }> = ({ label }) => (
  <Stack direction="row" spacing={1.5} alignItems="center">
    <img
      src="/images/home/icon.png"
      alt="Check icon"
      style={{
        width: 30,
        height: 30,
        objectFit: "contain",
      }}
    />
    <Typography
      variant="body2"
      sx={{
        fontFamily: "Poppins",
        fontWeight: 400,
        fontStyle: "normal",
        fontSize: "16px",
        lineHeight: "24px",
        letterSpacing: 0,
        verticalAlign: "middle",
      }}
    >
      {label}
    </Typography>
  </Stack>
);

const Pill: React.FC<{ label: string; color: string; icon: string }> = ({
  label,
  color,
  icon,
}) => (
  <Box
    sx={{
      p: 1.5,
      borderRadius: 2,
      bgcolor: "while",
      color: "#374151",
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      minHeight: "auto",
      cursor: "pointer",
      transition: "all 0.2s ease",
      boxShadow: "0px 0px 9.96px 0px rgba(0, 0, 0, 0.06)",
      border: "1.63px solid rgba(0, 0, 0, 0.06)",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      },
    }}
  >
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.1rem",
        pb: 1.2,
      }}
    >
      <Box
        component="img"
        src={icon}
        alt={`${label} icon`}
        sx={{
          width: 24,
          height: 24,
          objectFit: "contain",
        }}
      />
    </Box>
    <Typography
      variant="body2"
      sx={{
        color: "#374151",
        fontFamily: "Poppins",
        fontWeight: 500,
        fontStyle: "normal", // 'Medium' devient 'normal'
        fontSize: "16.33px",
        lineHeight: "100%",
        letterSpacing: "0%",
      }}
    >
      {label}
    </Typography>
  </Box>
);

const BiasFreeEvaluation: React.FC = () => {
  return (
    <Box id="features">
      {/* Floating Video Card Section */}
      <Box
        sx={{
          position: "relative",
          maxWidth: 1500,
          mx: "auto",
          mb: { xs: 2, md: 3 },
          mt: 10,
        }}
      >
        <Box sx={{ mx: 3 }}>
          <Typography
            variant="h5"
            sx={{
              fontFamily: "Poppins",
              fontWeight: 400,
              fontStyle: "normal",
              fontSize: "36px",
              lineHeight: "43.2px",
              letterSpacing: 0,
              verticalAlign: "middle",
              mb: 1,
            }}
          >
            The intelligent hiring platform you deserve
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontFamily: "Poppins",
              fontWeight: 400,
              fontStyle: "normal",
              fontSize: "16px",
              lineHeight: "24px",
              letterSpacing: 0,
              verticalAlign: "middle",
            }}
          >
            End-to-end recruitment automation powered by conversational AI and
            Hedera blockchain.
          </Typography>
        </Box>
        {/* Floating Blocks Row */}
        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 4,
            mt: { xs: 3, md: 5 },
            px: 3,
            gap: 4,
            maxWidth: 1400,
            mx: "auto",
          }}
        >
          {/* White Video Card - 60% */}
          <Box
            sx={{
              bgcolor: "#000",
              borderRadius: 3,
              p: 4,
              width: { xs: "90%", md: "70%" },
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
              border: "1px solid #000",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* Video iframe - Normal size */}
            <img
              src="/images/home/Iframe.png"
              alt="Video Feed"
              style={{
                width: "auto",

                height: "110%",
                maxWidth: "105%",
                maxHeight: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />
          </Box>

          {/* Promotional Banner - 35% */}
          <Box
            sx={{
              bgcolor: "#141415",
              borderRadius: "10px",
              p: 4,
              width: { xs: "90%", md: "35%" },
              maxWidth: "400px",
              height: "auto",
              minHeight: "236px",
              opacity: 1,
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
              border: "1px solid #E5E7EB",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              color: "#fff",
              position: "relative",
            }}
          >
            {/* Hiring time image on the right */}
            <Box
              sx={{
                position: "absolute",
                right: -22,
                top: "50%",
                transform: "translateY(-50%)",
                width: 80,
                height: 100,
                zIndex: 1,
              }}
            >
              <img src="/images/partners/hiring_time.png" alt="Hiring Time" />
            </Box>

            <Typography
              variant="h5"
              sx={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: 400,
                mb: 2,
                color: "#fff",
                textAlign: "left",
                fontSize: { xs: "1rem", md: "1.25rem" },
                lineHeight: 1.3,
                zIndex: 2,
                position: "relative",
              }}
            >
              Watch How We Cut Hiring Time by 75%
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: 400,
                fontStyle: "normal",
                color: "#D1D5DB",
                mb: 3,
                textAlign: "left",
                fontSize: "14px",
                lineHeight: "24px",
                letterSpacing: "0%",
                verticalAlign: "middle",
                zIndex: 2,
                position: "relative",
              }}
            >
              Transform weeks of manual work into minutes of intelligent
              automation.
            </Typography>
            <Button
              variant="contained"
              sx={{
                textTransform: "none",
                backgroundColor: "#10B981",
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontSize: "0.95rem",
                fontWeight: 500,
                zIndex: 2,
                position: "relative",
                "&:hover": { backgroundColor: "#059669" },
              }}
            >
              Request a Demo
            </Button>
          </Box>
        </Box>

        {/* Bias-Free Evaluation Section */}
        <Box
          sx={{
            backgroundColor: "rgba(20, 20, 21, 1)",
            color: "#fff",
            py: { xs: 6, md: 10 },
            px: 3,
            mb: { xs: 2, md: 3 },
            position: "relative",
            zIndex: 1,
            mt: { xs: -16, md: -20 },
          }}
        >
          <Box
            sx={{
              maxWidth: 1300,
              mx: "auto",
              display: "flex",
              alignItems: "center",
              gap: { xs: 4, md: 6 },
            }}
          >
            {/* Left side - Text content */}
            <Box sx={{ flex: 1, maxWidth: 500, ml: 6, mt: { xs: 8, md: 12 } }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 400,
                  fontStyle: "normal",
                  fontSize: "36px",
                  lineHeight: "43.2px",
                  letterSpacing: 0,
                  verticalAlign: "middle",
                  mb: 1,
                }}
              >
                Bias-Free Evaluation.
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 400,
                  fontStyle: "normal",
                  fontSize: "16px",
                  lineHeight: "24px",
                  letterSpacing: 0,
                  mb: 2,
                }}
              >
                Our platform ensures that every candidate is assessed
                objectively, using data-driven methods that eliminate
                unconscious bias in recruitment decisions. This leads to fairer
                outcomes and a more diverse, high-performing workforce.{" "}
              </Typography>

              <Stack spacing={2} sx={{ mb: 4 }}>
                <Bullet label="Conversational AI Interviews" />
                <Bullet label="Blockchain-Verified Credentials" />
                <Bullet label="Drag-&-Drop Pipeline Builder" />
                <Bullet label="Automated Decision-Making" />
                <Bullet label="Fair Credit Pricing" />
              </Stack>
              {/* 
              <Button
                variant="outlined"
                sx={{
                  textTransform: 'none',
                  color: '#fff',
                  borderColor: '#fff',
                  borderRadius: '2px',
                  maxWidth: 235,
                  height: 48,
                  fontFamily: 'Poppins',
                  fontWeight: 400,
                  fontStyle: 'normal',
                  fontSize: '16px',
                  lineHeight: '24px',
                  letterSpacing: 0,
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  '&:hover': {
                    borderColor: '#fff',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                Discover Recruitment Flow
              </Button> */}
            </Box>

            {/* Right side - White card with icon grid */}
            <Box
              sx={{
                flex: 1,
                display: { xs: "none", md: "flex" },
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  bgcolor: "rgba(251, 252, 254, 1)",
                  borderRadius: 3,
                  mt: 10,
                  p: 3,
                  width: 360,
                  height: "auto",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gridTemplateRows: "1fr 1fr 1fr",
                  gap: 2.5,
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
                  border: "1.97px solid rgba(98, 111, 134, 0.15)",
                }}
              >
                <Pill
                  label="Technical"
                  color="#8B5CF6"
                  icon="/icons/technical.svg"
                />
                <Pill label="Task" color="#EF4444" icon="/icons/task.svg" />
                <Pill label="Soft" color="#F59E0B" icon="/icons/soft.svg" />
                <Pill
                  label="Condition"
                  color="#3B82F6"
                  icon="/icons/condition.svg"
                />
                <Pill label="HR" color="#06B6D4" icon="/icons/hr.svg" />
                <Pill label="Email" color="#10B981" icon="/icons/email.svg" />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default BiasFreeEvaluation;