import React from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Paper,
  Fade,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import SparklesIcon from "@mui/icons-material/AutoFixHigh";
import BoltIcon from "@mui/icons-material/Bolt";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SalaryRange from "./SalaryRange";

const GREEN_MAIN = "#00FF9D";
const PURPLE_ACCENT = "#8B5CF6";
const GRADIENT_PRIMARY = "linear-gradient(135deg, #00FF9D 0%, #00E5FF 100%)";
const GRADIENT_SECONDARY = "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)";
const CARD_BG = "#FFFFFF";

interface JobDescriptionInputProps {
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  salaryRange: {
    currency: string;
    min: string;
    max: string;
  };
  onSalaryChange: (field: "min" | "max" | "currency", value: string) => void;
  onGenerateJob: (type: "quick" | "detailed") => void;
  isQuickGenerating: boolean;
  isDetailedGenerating: boolean;
  isSalaryRangeValid: () => boolean;
}

const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({
  jobDescription,
  onJobDescriptionChange,
  salaryRange,
  onSalaryChange,
  onGenerateJob,
  isQuickGenerating,
  isDetailedGenerating,
  isSalaryRangeValid,
}) => {
  return (
    <Card
      sx={{
        width: { xs: "100%", lg: "50%" },
        height: "fit-content",
        background: CARD_BG,
        borderRadius: 4,
        boxShadow:
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        border: "1px solid rgba(0, 255, 157, 0.1)",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardHeader
        avatar={
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              background: GRADIENT_PRIMARY,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            <DescriptionIcon sx={{ fontSize: 24 }} />
          </Box>
        }
        title={
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: "#0F172A",
              background: GRADIENT_PRIMARY,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: "1.5rem",
            }}
          >
            Create Job Post
          </Typography>
        }
        subheader={
          <Typography
            variant="body2"
            sx={{ color: "#475569", mt: 0.5, fontWeight: 500 }}
          >
            Describe your ideal candidate and generate a professional job
            posting
          </Typography>
        }
        sx={{ pb: 1 }}
      />
      <Divider sx={{ borderColor: "rgba(0, 255, 157, 0.1)" }} />
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            sx={{
              color: "#0F172A",
              mb: 1,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <SparklesIcon sx={{ color: GREEN_MAIN, fontSize: 20 }} />
            Job Description
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#475569",
              mb: 2,
              lineHeight: 1.6,
              fontWeight: 500,
            }}
          >
            Provide a comprehensive description of the role, including
            responsibilities, requirements, and desired qualifications. The
            more detailed you are, the better our AI can craft your perfect
            job posting.
          </Typography>
        </Box>

        <TextField
          multiline
          rows={10}
          fullWidth
          value={jobDescription}
          onChange={(e) => onJobDescriptionChange(e.target.value)}
          placeholder="Example: 

We are seeking a Senior Full Stack Developer to join our dynamic team. The ideal candidate will have:

Technical Requirements:
- 5+ years of experience with React.js and Node.js
- Strong proficiency in TypeScript and modern JavaScript
- Experience with cloud platforms (AWS/Azure/GCP)
- Knowledge of microservices architecture
- Expertise in database design (SQL and NoSQL)

Responsibilities:
- Lead development of our core product features
- Mentor junior developers and conduct code reviews
- Design and implement scalable backend services
- Optimize application performance
- Collaborate with product and design teams

Additional Skills:
- Experience with CI/CD pipelines
- Knowledge of Docker and Kubernetes
- Strong problem-solving abilities
- Excellent communication skills

Benefits:
- Competitive salary range: $120,000 - $160,000
- Remote work options
- Health insurance
- 401(k) matching
- Professional development budget"
          variant="outlined"
          autoFocus={false}
          disabled={false}
          inputProps={{
            style: {
              pointerEvents: "auto",
              userSelect: "text",
              cursor: "text",
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              backgroundColor: "rgba(248, 250, 252, 0.8)",
              transition: "all 0.3s ease",
              "& fieldset": {
                borderColor: "rgba(0, 255, 157, 0.2)",
                borderWidth: 2,
              },
              "&:hover fieldset": {
                borderColor: GREEN_MAIN,
                backgroundColor: "rgba(0, 255, 157, 0.02)",
              },
              "&.Mui-focused fieldset": {
                borderColor: GREEN_MAIN,
                backgroundColor: "rgba(0, 255, 157, 0.05)",
                boxShadow: `0 0 0 3px rgba(0, 255, 157, 0.1)`,
              },
            },
            "& .MuiInputBase-input": {
              color: "#0F172A",
              fontSize: "0.95rem",
              lineHeight: 1.6,
              fontWeight: 500,
              "&:focus": {
                outline: "none",
              },
            },
            "& .MuiInputBase-input::placeholder": {
              color: "#64748B",
              opacity: 0.8,
            },
          }}
        />

        {!isSalaryRangeValid() && (
          <Fade in={!isSalaryRangeValid()}>
            <Alert
              severity="warning"
              sx={{
                mt: 2,
                borderRadius: 2,
                backgroundColor: "rgba(251, 146, 60, 0.1)",
                color: "#ea580c",
                border: "1px solid rgba(251, 146, 60, 0.2)",
                "& .MuiAlert-icon": {
                  color: "#ea580c",
                },
              }}
            >
              Please enter a valid salary range (minimum and maximum values
              required, maximum must be greater than or equal to minimum)
            </Alert>
          </Fade>
        )}

        <SalaryRange
          salaryRange={salaryRange}
          onSalaryChange={onSalaryChange}
        />

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            mt: 4,
          }}
        >
          <Button
            variant="contained"
            onClick={() => onGenerateJob("quick")}
            disabled={
              !jobDescription || isQuickGenerating || !isSalaryRangeValid()
            }
            startIcon={
              isQuickGenerating ? (
                <CircularProgress size={20} sx={{ color: "white" }} />
              ) : (
                <BoltIcon />
              )
            }
            sx={{
              flex: 1,
              background: GRADIENT_PRIMARY,
              borderRadius: 3,
              py: 1.5,
              fontSize: "1rem",
              fontWeight: 600,
              textTransform: "none",
              boxShadow: "0 8px 32px rgba(0, 255, 157, 0.3)",
              transition: "all 0.3s ease",
              "&:hover": {
                background: GRADIENT_PRIMARY,
                transform: "translateY(-2px)",
                boxShadow: "0 12px 40px rgba(0, 255, 157, 0.4)",
              },
              "&:disabled": {
                background: "rgba(0, 255, 157, 0.3)",
                color: "white",
              },
            }}
          >
            {isQuickGenerating ? "Generating..." : "Quick Generate"}
          </Button>
          <Button
            variant="outlined"
            onClick={() => onGenerateJob("detailed")}
            disabled={
              !jobDescription || isDetailedGenerating || !isSalaryRangeValid()
            }
            startIcon={
              isDetailedGenerating ? (
                <CircularProgress size={20} sx={{ color: PURPLE_ACCENT }} />
              ) : (
                <AutoAwesomeIcon />
              )
            }
            sx={{
              flex: 1,
              borderColor: PURPLE_ACCENT,
              color: PURPLE_ACCENT,
              borderRadius: 3,
              py: 1.5,
              fontSize: "1rem",
              fontWeight: 600,
              textTransform: "none",
              borderWidth: 2,
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: PURPLE_ACCENT,
                background: GRADIENT_SECONDARY,
                color: "white",
                transform: "translateY(-2px)",
                boxShadow: "0 12px 40px rgba(139, 92, 246, 0.3)",
              },
              "&:disabled": {
                borderColor: "rgba(139, 92, 246, 0.3)",
                color: "rgba(139, 92, 246, 0.5)",
              },
            }}
          >
            {isDetailedGenerating ? "Generating..." : "Detailed Generate"}
          </Button>
        </Box>

        {(isQuickGenerating || isDetailedGenerating) && (
          <Fade in={isQuickGenerating || isDetailedGenerating}>
            <Paper
              sx={{
                mt: 3,
                p: 2,
                borderRadius: 3,
                background:
                  "linear-gradient(135deg, rgba(0, 255, 157, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
                border: "1px solid rgba(0, 255, 157, 0.2)",
                textAlign: "center",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "#0F172A",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                }}
              >
                {isQuickGenerating
                  ? "🚀 Generating a concise job post..."
                  : "✨ Performing detailed analysis and generating comprehensive job post..."}
              </Typography>
            </Paper>
          </Fade>
        )}
      </CardContent>
    </Card>
  );
};

export default JobDescriptionInput;