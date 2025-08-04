import React, { useState, useImperativeHandle, forwardRef } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Paper,
  Fade,
  Grow,
  IconButton,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import WorkIcon from "@mui/icons-material/Work";
import BoltIcon from "@mui/icons-material/Bolt";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import EditIcon from "@mui/icons-material/Edit";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import BusinessIcon from "@mui/icons-material/Business";
import PeopleIcon from "@mui/icons-material/People";
import StarIcon from "@mui/icons-material/Star";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DescriptionIcon from "@mui/icons-material/Description";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SparklesIcon from "@mui/icons-material/AutoFixHigh";
import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import ShareIcon from "@mui/icons-material/Share";
import VerifiedIcon from "@mui/icons-material/Verified";
import Cookies from "js-cookie";

// Update the JobPost interface
interface JobPost {
  jobDetails: {
    title: string;
    description: string;
    requirements: string[];
    responsibilities: string[];
    location: string;
    employmentType: string;
    experienceLevel: string;
    salary: {
      min: number;
      max: number;
      currency: string;
    };
  };
  skillAnalysis: {
    requiredSkills: Array<{
      name: string;
      level: string;
      importance: string;
      category: string;
      experienceLevel: string;
    }>;
    suggestedSkills: {
      technical: Array<{
        name: string;
        reason: string;
        category: string;
        priority: string;
      }>;
      frameworks: Array<{
        name: string;
        relatedTo: string;
        priority: string;
      }>;
      tools: Array<{
        name: string;
        purpose: string;
        category: string;
      }>;
    };
    skillSummary: {
      mainTechnologies: string[];
      complementarySkills: string[];
      learningPath: string[];
      stackComplexity: string;
    };
  };
  linkedinPost: {
    formattedContent: {
      headline: string;
      introduction: string;
      companyPitch: string;
      roleOverview: string;
      keyPoints: string[];
      skillsRequired: string;
      benefitsSection: string;
      callToAction: string;
    };
    hashtags: string[];
    formatting: {
      emojis: {
        company: string;
        location: string;
        salary: string;
        requirements: string;
        skills: string;
        benefits: string;
        apply: string;
      };
    };
    finalPost: string;
  };
}
// Types
export interface PostDetailsRef {
  saveJob: () => Promise<boolean>;
  canProceed: () => boolean;
}

// Constants
const GREEN_MAIN = "#00FF9D";
const BLUE_ACCENT = "#3B82F6";
const PURPLE_ACCENT = "#8B5CF6";
const GRADIENT_PRIMARY = "linear-gradient(135deg, #00FF9D 0%, #00E5FF 100%)";
const GRADIENT_SECONDARY = "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)";
const DARK_BG = "#1A1B23";
const CARD_BG = "#FFFFFF";
const TEXT_PRIMARY = "#0F172A";
const TEXT_SECONDARY = "#475569";

const PostDetails = forwardRef<PostDetailsRef>((props, ref) => {
  const [jobDescription, setJobDescription] = useState("");
  const [salaryRange, setSalaryRange] = useState({
    currency: "$",
    min: "",
    max: "",
  });
  const [isQuickGenerating, setIsQuickGenerating] = useState(false);
  const [isDetailedGenerating, setIsDetailedGenerating] = useState(false);
  const [generatedJob, setGeneratedJob] = useState<any>(null);
  const [jobPostError, setJobPostError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedJob, setEditedJob] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSharedToLinkedIn, setHasSharedToLinkedIn] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [linkedinCopySuccess, setLinkedinCopySuccess] = useState(false);
  const [updatedJobData, setUpdatedJobData] = useState<JobPost | undefined>(
    undefined
  );
  const [postedJobId, setPostedJobId] = useState<string | null>(null);
  const [jobPostDialog, setJobPostDialog] = useState(false);

  // Job Post Generator Helper Functions
  const isSalaryRangeValid = () => {
    return (
      salaryRange.min &&
      salaryRange.max &&
      parseInt(salaryRange.max) >= parseInt(salaryRange.min)
    );
  };

  const handleSalaryChange = (
    field: "min" | "max" | "currency",
    value: string
  ) => {
    setSalaryRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGenerateJob = async (type: "quick" | "detailed") => {
    try {
      if (type === "quick") {
        setIsQuickGenerating(true);
      } else {
        setIsDetailedGenerating(true);
      }
      setJobPostError("");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock generated job data
      const mockJob = {
        jobDetails: {
          title: "Senior Full Stack Developer",
          description:
            "We are seeking a talented Senior Full Stack Developer to join our dynamic team...",
          requirements: [
            "5+ years experience with React.js",
            "Strong TypeScript skills",
            "Experience with Node.js",
          ],
          responsibilities: [
            "Lead development of core features",
            "Mentor junior developers",
            "Design scalable services",
          ],
          location: "Remote",
          employmentType: "Full-time",
          experienceLevel: "Senior",
          salary: {
            min: parseInt(salaryRange.min),
            max: parseInt(salaryRange.max),
            currency: salaryRange.currency,
          },
        },
        skillAnalysis: {
          requiredSkills: [
            {
              name: "React.js",
              level: "5",
              importance: "Required",
              category: "Frontend",
            },
            {
              name: "TypeScript",
              level: "4",
              importance: "Required",
              category: "Language",
            },
            {
              name: "Node.js",
              level: "4",
              importance: "Required",
              category: "Backend",
            },
          ],
          suggestedSkills: {
            technical: [
              {
                name: "Docker",
                reason: "Containerization",
                category: "DevOps",
                priority: "High",
              },
            ],
            frameworks: [
              { name: "Next.js", relatedTo: "React", priority: "Medium" },
            ],
            tools: [
              {
                name: "Git",
                purpose: "Version Control",
                category: "Development",
              },
            ],
          },
          skillSummary: {
            mainTechnologies: ["React.js", "TypeScript", "Node.js"],
            complementarySkills: ["Docker", "Next.js"],
            learningPath: ["JavaScript", "React.js", "TypeScript"],
            stackComplexity: "Intermediate",
          },
        },
        linkedinPost: {
          formattedContent: {
            headline: "🌟 We're Hiring: Senior Full Stack Developer 🌟",
            introduction:
              "Are you passionate about building interactive web applications?",
            companyPitch: "Join a team where innovation drives us forward.",
            roleOverview:
              "As a Senior Full Stack Developer, you'll be at the heart of our engineering process.",
            keyPoints: [
              "🔹 Develop cutting-edge web applications",
              "🔹 Work with a team of talented developers",
              "🔹 Remote work",
              `🔹 Salary range: ${salaryRange.currency}${salaryRange.min}-${salaryRange.max}`,
            ],
            skillsRequired: "💻 Required Skills: React.js, TypeScript, Node.js",
            benefitsSection:
              "🎯 We offer a vibrant culture and mentorship opportunities.",
            callToAction: "✨ Ready to make a difference? Apply now!",
          },
          hashtags: ["#Hiring", "#TechJobs", "#RemoteWork"],
          formatting: {
            emojis: {
              company: "🏢",
              location: "🌍",
              salary: "💰",
              requirements: "📋",
              skills: "💻",
              benefits: "🎯",
              apply: "✨",
            },
          },
          finalPost:
            "🌟 We're Hiring: Senior Full Stack Developer 🌟\n\nAre you passionate about building interactive web applications? Join our dynamic team!",
        },
      };

      setGeneratedJob(mockJob);
      setEditedJob(mockJob);
    } catch (error) {
      setJobPostError("Failed to generate job post. Please try again.");
    } finally {
      setIsQuickGenerating(false);
      setIsDetailedGenerating(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedJob({ ...generatedJob });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedJob(null);
  };

  const handleSave = () => {
    setGeneratedJob(editedJob);
    setIsEditing(false);
    setEditedJob(null);
  };

  const handleInputChange = (field: string, value: any) => {
    if (!editedJob || !editedJob.jobDetails) return;

    if (field === "salary") {
      setEditedJob((prev: any) => ({
        ...prev,
        jobDetails: {
          ...prev.jobDetails,
          salary: {
            ...prev.jobDetails.salary,
            ...value,
          },
        },
      }));
    } else if (field === "requirements") {
      setEditedJob((prev: any) => ({
        ...prev,
        jobDetails: {
          ...prev.jobDetails,
          requirements: Array.isArray(value)
            ? value
            : value.split("\n").filter((item: string) => item.trim() !== ""),
        },
      }));
    } else if (field === "responsibilities") {
      setEditedJob((prev: any) => ({
        ...prev,
        jobDetails: {
          ...prev.jobDetails,
          responsibilities: Array.isArray(value)
            ? value
            : value.split("\n").filter((item: string) => item.trim() !== ""),
        },
      }));
    } else {
      // Handle direct jobDetails fields like title, description, location, employmentType, experienceLevel
      setEditedJob((prev: any) => ({
        ...prev,
        jobDetails: {
          ...prev.jobDetails,
          [field]: value,
        },
      }));
    }
  };

  const getExperienceLevelFromNumber = (level: string | number): string => {
    const numLevel = parseInt(level.toString());
    if (numLevel <= 1) return "Entry Level";
    if (numLevel <= 2) return "Junior";
    if (numLevel <= 3) return "Mid-Level";
    if (numLevel <= 4) return "Senior";
    return "Expert";
  };

  const handleShareLinkedIn = async () => {
    setIsPosting(true);
    // Simulate LinkedIn sharing
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setHasSharedToLinkedIn(true);
    setLinkedinCopySuccess(true);
    setIsPosting(false);

    setTimeout(() => setLinkedinCopySuccess(false), 3000);
  };

// Update the saveJob function to handle the job data properly
   const saveJob = async (): Promise<boolean> => {
    setIsSaving(true);
    try {
      // Use the updated job data if available, otherwise use the generated job
      const jobDataToUse = updatedJobData || generatedJob;

      if (!jobDataToUse) {
        throw new Error("No job data available");
      }

      const jobPostData = {
        jobDetails: {
          title: jobDataToUse.jobDetails.title,
          description: jobDataToUse.jobDetails.description,
          requirements: jobDataToUse.jobDetails.requirements,
          responsibilities: jobDataToUse.jobDetails.responsibilities,
          location: jobDataToUse.jobDetails.location,
          employmentType: jobDataToUse.jobDetails.employmentType,
          experienceLevel: jobDataToUse.jobDetails.experienceLevel,
          salary: jobDataToUse.jobDetails.salary,
        },
        skillAnalysis: {
          requiredSkills: jobDataToUse.skillAnalysis.requiredSkills || [],
          suggestedSkills: {
            technical: (
              jobDataToUse.skillAnalysis.suggestedSkills?.technical || []
            )
              .map((skill: any) => {
                console.log("Technical skill:", skill);
                const skillName =
                  typeof skill === "string" ? skill : skill?.name || "";
              if (!skillName) {
                  console.error("Invalid technical skill:", skill);
                return null;
              }
              return {
                name: skillName,
                reason: `Required ${skillName} knowledge`,
                  category: "Technical",
                  priority: "High",
                };
              })
              .filter(Boolean),
            frameworks: (
              jobDataToUse.skillAnalysis.suggestedSkills?.frameworks || []
            )
              .map((skill: any) => {
                console.log("Framework skill:", skill);
                const skillName =
                  typeof skill === "string" ? skill : skill?.name || "";
              if (!skillName) {
                  console.error("Invalid framework skill:", skill);
                return null;
              }
              return {
                name: skillName,
                  relatedTo: "Python",
                  priority: "Medium",
                };
              })
              .filter(Boolean),
            tools: (jobDataToUse.skillAnalysis.suggestedSkills?.tools || [])
              .map((skill: any) => {
                console.log("Tool skill:", skill);
                const skillName =
                  typeof skill === "string" ? skill : skill?.name || "";
              if (!skillName) {
                  console.error("Invalid tool skill:", skill);
                return null;
              }
              return {
                name: skillName,
                purpose: `Development tool: ${skillName}`,
                  category: "Development Tools",
              };
              })
              .filter(Boolean),
          },
          skillSummary: {
            mainTechnologies:
              jobDataToUse.skillAnalysis.skillSummary?.mainTechnologies || [],
            complementarySkills:
              jobDataToUse.skillAnalysis.skillSummary?.complementarySkills ||
              [],
            learningPath:
              jobDataToUse.skillAnalysis.skillSummary?.learningPath || [],
            stackComplexity:
              jobDataToUse.skillAnalysis.skillSummary?.stackComplexity ||
              "Moderate",
          },
        },
        linkedinPost: {
          formattedContent: {
            headline: `🌟 We're Hiring: ${jobDataToUse.jobDetails.title} 🌟`,
            introduction:
              "Are you passionate about building interactive web applications? We've got an exciting opportunity for you!",
            companyPitch:
              "Join a team where innovation, a dynamic culture, and a passion for technology drive us. We believe in empowering our developers and offering endless opportunities for growth.",
            roleOverview: `As a ${jobDataToUse.jobDetails.title}, you'll be at the heart of our engineering process, building software that matters.`,
            keyPoints: [
              "🔹 Develop cutting-edge web applications",
              "🔹 Work with a team of talented developers",
              `🔹 ${jobDataToUse.jobDetails.location} work`,
              `🔹 Salary range: ${jobDataToUse.jobDetails.salary.currency}${jobDataToUse.jobDetails.salary.min}-${jobDataToUse.jobDetails.salary.max}`,
            ],
            skillsRequired: `💻 Required Skills: ${jobDataToUse.skillAnalysis.requiredSkills
              .map(
                (skill: {
                  name: string;
                  level: string;
                  importance: string;
                  category: string;
                }) => skill.name
              )
              .join(", ")}.`,
            benefitsSection:
              "🎯 We offer a vibrant culture, mentorship from industry leaders, and the chance to work on projects that impact millions.",
            callToAction:
              "✨ Ready to make a difference? Pass the test and join our team at https://staging.talentai.bid/test",
          },
          hashtags: [
            "#Hiring",
            "#TechJobs",
            `#${jobDataToUse.jobDetails.title.replace(/\s+/g, "")}`,
            "#RemoteWork",
            "#TechCareers",
          ],
          formatting: {
            emojis: {
              company: "🏢",
              location: "📍",
              salary: "💰",
              requirements: "📋",
              skills: "💻",
              benefits: "🎯",
              apply: "✨",
            },
          },
          finalPost: `🌟 We're Hiring: ${jobDataToUse.jobDetails.title} 🌟

Are you passionate about building interactive web applications? We've got an exciting opportunity for you!

Join a team where innovation, a dynamic culture, and a passion for technology drive us. We believe in empowering our developers and offering endless opportunities for growth.

As a ${
            jobDataToUse.jobDetails.title
          }, you'll be at the heart of our engineering process, building software that matters.

🔹 Develop cutting-edge web applications
🔹 Work with a team of talented developers
🔹 ${jobDataToUse.jobDetails.location} work
🔹 Salary range: ${jobDataToUse.jobDetails.salary.currency}${
            jobDataToUse.jobDetails.salary.min
          }-${jobDataToUse.jobDetails.salary.max}

💻 Required Skills: ${jobDataToUse.skillAnalysis.requiredSkills
            .map(
              (skill: {
                name: string;
                level: string;
                importance: string;
                category: string;
              }) => skill.name
            )
            .join(", ")}.

🎯 We offer a vibrant culture, mentorship from industry leaders, and the chance to work on projects that impact millions.

✨ Ready to make a difference? Pass the test and join our team at https://staging.talentai.bid/test

#Hiring #TechJobs #${jobDataToUse.jobDetails.title.replace(
            /\s+/g,
            ""
          )} #RemoteWork #TechCareers`,
        },
      };

      // Log the complete job post data
      console.log("Job Post Data:", jobPostData);

      const token = Cookies.get("api_token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}post/save-post`,
        {
          method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
          body: JSON.stringify(jobPostData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save job");
      }

      const savedJob = await response.json();
      // Store the posted job ID for the success dialog
      setPostedJobId(savedJob.data?._id || savedJob._id);
      console.log("Job saved successfully:", savedJob);

      // Close the dialog after successful save
      setJobPostDialog(false);
             setJobDescription("");
      setGeneratedJob(undefined);
      setUpdatedJobData(undefined); // Reset updated job data
       return true;
    } catch (error) {
       console.error("Error saving job:", error);
       return false;
    } finally {
      setIsSaving(false);
    }
  };

   // Function to check if user can proceed to next step
   const canProceed = (): boolean => {
     return generatedJob !== null && !isSaving;
   };

   // Expose functions to parent component
   useImperativeHandle(ref, () => ({
     saveJob,
     canProceed
   }));

  const SkillChip = ({ label, onDelete, deleteIcon, onClick, sx }: any) => (
    <Chip
      label={label}
      onDelete={onDelete}
      deleteIcon={deleteIcon}
      onClick={onClick}
      sx={{
        backgroundColor: GREEN_MAIN,
        color: "black",
        fontSize: "0.75rem",
        height: "28px",
        "&:hover": {
          backgroundColor: "rgba(0, 255, 157, 0.8)",
        },
        ...sx,
      }}
    />
  );

  return (
    <Box
      sx={{
        flex: 1,
        height: "100%",
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        gap: 3,
        p: 3,
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        minHeight: "100vh",
      }}
    >
      {/* Left Panel - Job Description Input */}
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
          onChange={(e) => setJobDescription(e.target.value)}
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
    pointerEvents: "auto", // ✅ correct
    userSelect: "text",     // ✅ correct
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

          <Box sx={{ mt: 4 }}>
            <Typography
              variant="h6"
              sx={{
                color: TEXT_PRIMARY,
                mb: 2,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <AttachMoneyIcon sx={{ color: GREEN_MAIN, fontSize: 20 }} />
            Salary Range
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
            }}
          >
              <Box sx={{ flex: 1, minWidth: 120 }}>
              <FormControl fullWidth>
                  <InputLabel sx={{ color: "#475569", fontWeight: 600 }}>
                    Currency
                  </InputLabel>
                <Select
                  value={salaryRange.currency}
                  onChange={(e) =>
                    handleSalaryChange("currency", e.target.value)
                  }
                  sx={{
                      borderRadius: 2,
                    "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(0, 255, 157, 0.2)",
                        borderWidth: 2,
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: GREEN_MAIN,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: GREEN_MAIN,
                    },
                  }}
                >
                    <MenuItem value="$">$ (USD)</MenuItem>
                    <MenuItem value="€">€ (EUR)</MenuItem>
                    <MenuItem value="£">£ (GBP)</MenuItem>
                </Select>
              </FormControl>
            </Box>
              <Box sx={{ flex: 2 }}>
              <TextField
                fullWidth
                label="Minimum Salary"
                  type="number"
                value={salaryRange.min}
                onChange={(e) => handleSalaryChange("min", e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "& fieldset": {
                        borderColor: "rgba(0, 255, 157, 0.2)",
                        borderWidth: 2,
                      },
                      "&:hover fieldset": {
                      borderColor: GREEN_MAIN,
                    },
                      "&.Mui-focused fieldset": {
                      borderColor: GREEN_MAIN,
                    },
                  },
                }}
              />
            </Box>
              <Box sx={{ flex: 2 }}>
              <TextField
                fullWidth
                label="Maximum Salary"
                  type="number"
                value={salaryRange.max}
                onChange={(e) => handleSalaryChange("max", e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "& fieldset": {
                        borderColor: "rgba(0, 255, 157, 0.2)",
                        borderWidth: 2,
                      },
                      "&:hover fieldset": {
                      borderColor: GREEN_MAIN,
                    },
                      "&.Mui-focused fieldset": {
                      borderColor: GREEN_MAIN,
                    },
                  },
                }}
              />
            </Box>
          </Box>
        </Box>

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
            onClick={() => handleGenerateJob("quick")}
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
            onClick={() => handleGenerateJob("detailed")}
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

      {/* Right Panel - Generated Job Preview */}
      <Box
        sx={{
          width: { xs: "100%", md: "50%" },
          height: { xs: "50%", md: "auto" },
          p: { xs: 2, sm: 3 },
          overflowY: "auto",
        }}
      >
        {jobPostError ? (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              backgroundColor: "rgba(211,47,47,0.1)",
              color: "#ff8a80",
              border: "1px solid rgba(211,47,47,0.3)",
              "& .MuiAlert-icon": {
                color: "#ff8a80",
              },
            }}
          >
            {jobPostError}
          </Alert>
        ) : !generatedJob ? (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
              color: "rgba(255,255,255,0.5)",
              textAlign: "center",
              minHeight: { xs: "300px", md: "auto" },
            }}
          >
            <Box
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: "50%",
                backgroundColor: GREEN_MAIN,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              <WorkIcon sx={{ fontSize: { xs: 32, sm: 40 } }} />
            </Box>
            <Typography
              variant="h6"
              sx={{ fontSize: { xs: "1rem", sm: "1.25rem" }, color: "black" }}
            >
              Generated job post will appear here
            </Typography>
            <Typography
              variant="body2"
              sx={{
                maxWidth: "80%",
                fontSize: { xs: "0.875rem", sm: "1rem" },
                color: "black",
              }}
            >
              Enter your job description on the left and click "Generate" to
              create a professional job posting
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              color: "#fff",
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            <Box sx={{ mb: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                  gap: 2,
                }}
              >
                {isEditing ? (
                  <TextField
                    fullWidth
                    label="Job Title"
                    value={editedJob.jobDetails.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                     disabled={false}
                     inputProps={{
                       style: {
                         pointerEvents: "auto",
                         userSelect: "text",
                         cursor: "text",
                       },
                     }}
                    InputLabelProps={{
                      sx: {
                        color: GREEN_MAIN,
                        fontSize: "1rem",
                        fontWeight: 500,
                      },
                    }}
                    InputProps={{
                      sx: {
                         color: "#0F172A",
                        fontSize: "1.1rem",
                         pointerEvents: "auto",
                         cursor: "text",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: GREEN_MAIN,
                          borderWidth: "2px",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: GREEN_MAIN,
                          borderWidth: "2px",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: GREEN_MAIN,
                          borderWidth: "2px",
                        },
                      },
                    }}
                  />
                ) : (
                  <Typography
                    variant="h5"
                    sx={{
                      color: GREEN_MAIN,
                      fontSize: { xs: "1.25rem", sm: "1.5rem" },
                    }}
                  >
                    {generatedJob.jobDetails.title}
                  </Typography>
                )}
                <Box sx={{ display: "flex", gap: 1 }}>
                  {!isEditing ? (
                    <>
                      <Tooltip title="Edit job details" arrow>
                        <IconButton
                        onClick={handleEdit}
                        sx={{
                            background:
                              "linear-gradient(135deg, #00FF9D 0%, #00E5FF 100%)",
                            backdropFilter: "blur(15px)",
                            color: "#1E293B",
                            borderRadius: 2.5,
                            width: 48,
                            height: 48,
                            border: "2px solid rgba(255, 255, 255, 0.8)",
                            boxShadow:
                              "0 8px 32px rgba(0, 255, 157, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
                            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                            position: "relative",
                            overflow: "hidden",
                            "&::before": {
                              content: '""',
                              position: "absolute",
                              top: 0,
                              left: "-100%",
                              width: "100%",
                              height: "100%",
                              background:
                                "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)",
                              transition: "left 0.5s ease",
                            },
                          "&:hover": {
                              background:
                                "linear-gradient(135deg, #00E5FF 0%, #00FF9D 100%)",
                              transform: "translateY(-3px) scale(1.05)",
                              boxShadow:
                                "0 16px 48px rgba(0, 255, 157, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                              "&::before": {
                                left: "100%",
                              },
                            },
                            "&:active": {
                              transform: "translateY(-1px) scale(1.02)",
                          },
                        }}
                      >
                          <EditIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Share on LinkedIn" arrow>
                      <Button
                        variant="contained"
                          startIcon={
                            isPosting ? (
                              <CircularProgress
                                size={16}
                                sx={{ color: "white" }}
                              />
                            ) : (
                              <LinkedInIcon sx={{ fontSize: 18 }} />
                            )
                          }
                        onClick={handleShareLinkedIn}
                        disabled={isPosting}
                        sx={{
                          background: hasSharedToLinkedIn
                              ? "linear-gradient(135deg, #059669 0%, #047857 100%)"
                              : "linear-gradient(135deg, #0077B5 0%, #005885 100%)",
                            color: "white",
                            borderRadius: 3,
                            px: 3,
                            py: 1.2,
                            fontSize: "0.9rem",
                            fontWeight: 600,
                            textTransform: "none",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            boxShadow: hasSharedToLinkedIn
                              ? "0 8px 32px rgba(5, 150, 105, 0.3)"
                              : "0 8px 32px rgba(0, 119, 181, 0.3)",
                            transition: "all 0.3s ease",
                          "&:hover": {
                            background: hasSharedToLinkedIn
                                ? "linear-gradient(135deg, #047857 0%, #065f46 100%)"
                                : "linear-gradient(135deg, #005885 0%, #003d5c 100%)",
                              transform: "translateY(-2px)",
                              boxShadow: hasSharedToLinkedIn
                                ? "0 12px 40px rgba(5, 150, 105, 0.4)"
                                : "0 12px 40px rgba(0, 119, 181, 0.4)",
                            },
                            "&:disabled": {
                              background: "rgba(0, 119, 181, 0.5)",
                              color: "rgba(255, 255, 255, 0.7)",
                              transform: "none",
                          },
                        }}
                      >
                        {isPosting
                          ? "Sharing..."
                          : linkedinCopySuccess
                          ? "Shared!"
                          : hasSharedToLinkedIn
                            ? "Shared"
                            : "Share"}
                      </Button>
                      </Tooltip>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outlined"
                        startIcon={<CloseIcon sx={{ fontSize: 18 }} />}
                        onClick={handleCancel}
                        sx={{
                          borderColor: "rgba(255, 0, 0, 0.5)",
                          color: "rgba(255, 0, 0, 0.8)",
                          borderRadius: 3,
                          px: 3,
                          py: 1.2,
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          textTransform: "none",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            borderColor: "rgba(255, 0, 0, 0.9)",
                            backgroundColor: "rgba(255, 0, 0, 0.1)",
                            transform: "translateY(-1px)",
                          },
                        }}
                      >
                        Cancel
                      </Button>

                      <Button
                        variant="contained"
                        startIcon={<DoneIcon sx={{ fontSize: 18 }} />}
                        onClick={handleSave}
                        sx={{
                          background: "#00C853", // vivid green
                          color: "#fff",
                          borderRadius: 3,
                          px: 3,
                          py: 1.2,
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          textTransform: "none",
                          boxShadow: "0 8px 24px rgba(0, 200, 83, 0.4)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            background: "#00E676",
                            transform: "translateY(-2px)",
                            boxShadow: "0 12px 32px rgba(0, 230, 118, 0.5)",
                          },
                        }}
                      >
                        Save
                      </Button>
                    </>
                  )}
                </Box>
              </Box>

              {/* Job Details */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{ color: "#0F172A", mb: 2, fontWeight: 700 }}
                >
                  Job Details
                </Typography>
                {isEditing && editedJob && editedJob.jobDetails ? (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                <Box
                  sx={{
                        display: "flex",
                        gap: 2,
                        flexDirection: { xs: "column", sm: "row" },
                      }}
                    >
                      <TextField
                        fullWidth
                        label="Location"
                        value={editedJob.jobDetails.location}
                        onChange={(e) =>
                          handleInputChange("location", e.target.value)
                        }
                        InputLabelProps={{
                          sx: {
                            color: GREEN_MAIN,
                            fontSize: "1rem",
                            fontWeight: 600,
                          },
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOnIcon sx={{ color: GREEN_MAIN }} />
                            </InputAdornment>
                          ),
                          sx: {
                            color: "#0F172A",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: GREEN_MAIN,
                              borderWidth: "2px",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: GREEN_MAIN,
                              borderWidth: "2px",
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: GREEN_MAIN,
                              borderWidth: "2px",
                            },
                          },
                        }}
                      />
                      <FormControl fullWidth>
                        <InputLabel
                          sx={{
                            color: GREEN_MAIN,
                            fontSize: "1rem",
                            fontWeight: 600,
                          }}
                        >
                          Employment Type
                        </InputLabel>
                        <Select
                          value={editedJob.jobDetails.employmentType}
                          onChange={(e) =>
                            handleInputChange("employmentType", e.target.value)
                          }
                          label="Employment Type"
                          startAdornment={
                            <InputAdornment position="start">
                              <WorkIcon sx={{ color: GREEN_MAIN }} />
                            </InputAdornment>
                          }
                          sx={{
                            color: "#0F172A",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: GREEN_MAIN,
                              borderWidth: "2px",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: GREEN_MAIN,
                              borderWidth: "2px",
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: GREEN_MAIN,
                              borderWidth: "2px",
                            },
                            "& .MuiSelect-icon": {
                              color: GREEN_MAIN,
                            },
                          }}
                        >
                          <MenuItem value="Full-time">Full-time</MenuItem>
                          <MenuItem value="Part-time">Part-time</MenuItem>
                          <MenuItem value="Contract">Contract</MenuItem>
                          <MenuItem value="Freelance">Freelance</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        flexDirection: { xs: "column", sm: "row" },
                      }}
                    >
                      <FormControl sx={{ flex: 1, minWidth: 120 }}>
                        <InputLabel
                          sx={{
                            color: GREEN_MAIN,
                            fontSize: "1rem",
                            fontWeight: 600,
                          }}
                        >
                          Currency
                        </InputLabel>
                        <Select
                          value={editedJob.jobDetails.salary.currency}
                          onChange={(e) =>
                            handleInputChange("salary", {
                              ...editedJob.jobDetails.salary,
                              currency: e.target.value,
                            })
                          }
                          label="Currency"
                          startAdornment={
                            <InputAdornment position="start">
                              <AttachMoneyIcon sx={{ color: GREEN_MAIN }} />
                            </InputAdornment>
                          }
                          sx={{
                            color: "#0F172A",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: GREEN_MAIN,
                              borderWidth: "2px",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: GREEN_MAIN,
                              borderWidth: "2px",
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: GREEN_MAIN,
                              borderWidth: "2px",
                            },
                            "& .MuiSelect-icon": {
                              color: GREEN_MAIN,
                            },
                          }}
                        >
                          <MenuItem value="$">$ (USD)</MenuItem>
                          <MenuItem value="€">€ (EUR)</MenuItem>
                          <MenuItem value="£">£ (GBP)</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        sx={{ flex: 2 }}
                        label="Minimum Salary"
                        type="number"
                        value={editedJob.jobDetails.salary.min}
                        onChange={(e) =>
                          handleInputChange("salary", {
                            ...editedJob.jobDetails.salary,
                            min: parseInt(e.target.value) || 0,
                          })
                        }
                        InputLabelProps={{
                          sx: {
                            color: GREEN_MAIN,
                            fontSize: "1rem",
                            fontWeight: 600,
                          },
                        }}
                        InputProps={{
                          sx: {
                            color: "#0F172A",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: GREEN_MAIN,
                              borderWidth: "2px",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: GREEN_MAIN,
                              borderWidth: "2px",
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: GREEN_MAIN,
                              borderWidth: "2px",
                            },
                          },
                        }}
                      />
                      <TextField
                        sx={{ flex: 2 }}
                        label="Maximum Salary"
                        type="number"
                        value={editedJob.jobDetails.salary.max}
                        onChange={(e) =>
                          handleInputChange("salary", {
                            ...editedJob.jobDetails.salary,
                            max: parseInt(e.target.value) || 0,
                          })
                        }
                        InputLabelProps={{
                          sx: {
                            color: GREEN_MAIN,
                            fontSize: "1rem",
                            fontWeight: 600,
                          },
                        }}
                        InputProps={{
                          sx: {
                            color: "#0F172A",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: GREEN_MAIN,
                              borderWidth: "2px",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: GREEN_MAIN,
                              borderWidth: "2px",
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: GREEN_MAIN,
                              borderWidth: "2px",
                            },
                          },
                        }}
                      />
                    </Box>
                    <TextField
                      fullWidth
                      label="Experience Level"
                      value={editedJob.jobDetails.experienceLevel}
                      onChange={(e) =>
                        handleInputChange("experienceLevel", e.target.value)
                      }
                      InputLabelProps={{
                        sx: {
                          color: GREEN_MAIN,
                          fontSize: "1rem",
                          fontWeight: 600,
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <TrendingUpIcon sx={{ color: GREEN_MAIN }} />
                          </InputAdornment>
                        ),
                        sx: {
                          color: "#0F172A",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: GREEN_MAIN,
                            borderWidth: "2px",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: GREEN_MAIN,
                            borderWidth: "2px",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: GREEN_MAIN,
                            borderWidth: "2px",
                          },
                        },
                      }}
                    />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LocationOnIcon
                        sx={{ color: GREEN_MAIN, fontSize: 20 }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ color: "#1E293B", fontWeight: 600 }}
                      >
                      {generatedJob.jobDetails.location}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AttachMoneyIcon
                        sx={{ color: GREEN_MAIN, fontSize: 20 }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ color: "#1E293B", fontWeight: 600 }}
                      >
                      {generatedJob.jobDetails.salary.currency}
                      {generatedJob.jobDetails.salary.min.toLocaleString()} -{" "}
                      {generatedJob.jobDetails.salary.currency}
                      {generatedJob.jobDetails.salary.max.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <WorkIcon sx={{ color: GREEN_MAIN, fontSize: 20 }} />
                      <Typography
                        variant="body2"
                        sx={{ color: "#1E293B", fontWeight: 600 }}
                      >
                      {generatedJob.jobDetails.employmentType}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <TrendingUpIcon
                        sx={{ color: GREEN_MAIN, fontSize: 20 }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ color: "#1E293B", fontWeight: 600 }}
                      >
                      {generatedJob.jobDetails.experienceLevel}
                    </Typography>
                  </Box>
                </Box>
                )}
              </Box>

              {/* Required Skills */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{ color: "#0F172A", mb: 2, fontWeight: 700 }}
                >
                  Required Skills
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {generatedJob.skillAnalysis.requiredSkills.map(
                    (skill: any, index: number) => (
                      <SkillChip
                        key={index}
                        label={`${skill.name} (${getExperienceLevelFromNumber(
                          skill.level
                        )})`}
                        sx={{ mb: 1 }}
                      />
                    )
                  )}
                </Box>
              </Box>

              {/* Description */}
              <Box sx={{ mb: 3 }}>
                 <Typography
                   variant="h6"
                   sx={{ color: "#0F172A", mb: 2, fontWeight: 700 }}
                 >
                  Description
                </Typography>
                 {isEditing ? (
                   <TextField
                     fullWidth
                     multiline
                     rows={4}
                     value={editedJob.jobDetails.description}
                     onChange={(e) => handleInputChange('description', e.target.value)}
                     placeholder="Enter job description"
                     disabled={false}
                     inputProps={{
                       style: {
                         pointerEvents: "auto",
                         userSelect: "text",
                         cursor: "text",
                       },
                       autoComplete: "off",
                     }}
                     InputProps={{
                       sx: {
                         color: '#0F172A',
                         pointerEvents: "auto !important",
                         cursor: "text !important",
                         '& .MuiOutlinedInput-notchedOutline': {
                           borderColor: GREEN_MAIN,
                           borderWidth: '2px'
                         },
                         '&:hover .MuiOutlinedInput-notchedOutline': {
                           borderColor: GREEN_MAIN,
                           borderWidth: '2px'
                         },
                         '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                           borderColor: GREEN_MAIN,
                           borderWidth: '2px'
                         },
                         '& .MuiInputBase-input': {
                           pointerEvents: "auto !important",
                           cursor: "text !important",
                           userSelect: "text !important",
                         },
                         '& .MuiInputBase-inputMultiline': {
                           pointerEvents: "auto !important",
                           cursor: "text !important",
                           userSelect: "text !important",
                         },
                       },
                     }}
                   />
                 ) : (
                <Typography
                  variant="body2"
                  sx={{ color: "black", lineHeight: 1.6 }}
                >
                  {generatedJob.jobDetails.description}
                </Typography>
                 )}
              </Box>

              {/* Requirements */}
              <Box sx={{ mb: 3 }}>
                 <Typography
                   variant="h6"
                   sx={{ color: "#0F172A", mb: 2, fontWeight: 700 }}
                 >
                  Requirements
                </Typography>
                 {isEditing ? (
                                      <TextField
                     fullWidth
                     multiline
                     rows={4}
                     value={editedJob.jobDetails.requirements.join('\n')}
                     onChange={(e) => handleInputChange('requirements', e.target.value)}
                     placeholder="Enter each requirement on a new line"
                     disabled={false}
                     inputProps={{
                       style: {
                         pointerEvents: "auto",
                         userSelect: "text",
                         cursor: "text",
                       },
                       autoComplete: "off",
                     }}
                     InputProps={{
                       sx: {
                         color: '#0F172A',
                         pointerEvents: "auto !important",
                         cursor: "text !important",
                         '& .MuiOutlinedInput-notchedOutline': {
                           borderColor: GREEN_MAIN,
                           borderWidth: '2px'
                         },
                         '&:hover .MuiOutlinedInput-notchedOutline': {
                           borderColor: GREEN_MAIN,
                           borderWidth: '2px'
                         },
                         '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                           borderColor: GREEN_MAIN,
                           borderWidth: '2px'
                         },
                         '& .MuiInputBase-input': {
                           pointerEvents: "auto !important",
                           cursor: "text !important",
                           userSelect: "text !important",
                         },
                         '& .MuiInputBase-inputMultiline': {
                           pointerEvents: "auto !important",
                           cursor: "text !important",
                           userSelect: "text !important",
                         },
                       },
                     }}
                   />
                 ) : (
                <Box component="ul" sx={{ pl: 2, color: "black" }}>
                  {generatedJob.jobDetails.requirements.map(
                    (req: string, index: number) => (
                      <Typography
                        key={index}
                        component="li"
                        variant="body2"
                        sx={{ mb: 1 }}
                      >
                        {req}
                      </Typography>
                    )
                  )}
                </Box>
                 )}
              </Box>

              {/* Responsibilities */}
              <Box sx={{ mb: 3 }}>
                 <Typography
                   variant="h6"
                   sx={{ color: "#0F172A", mb: 2, fontWeight: 700 }}
                 >
                  Responsibilities
                </Typography>
                 {isEditing ? (
                   <TextField
                     fullWidth
                     multiline
                     rows={4}
                     value={editedJob.jobDetails.responsibilities.join('\n')}
                     onChange={(e) => handleInputChange('responsibilities', e.target.value)}
                     placeholder="Enter each responsibility on a new line"
                     disabled={false}
                     inputProps={{
                       style: {
                         pointerEvents: "auto",
                         userSelect: "text",
                         cursor: "text",
                       },
                       autoComplete: "off",
                     }}
                     InputProps={{
                       sx: {
                         color: '#0F172A',
                         pointerEvents: "auto !important",
                         cursor: "text !important",
                         '& .MuiOutlinedInput-notchedOutline': {
                           borderColor: GREEN_MAIN,
                           borderWidth: '2px'
                         },
                         '&:hover .MuiOutlinedInput-notchedOutline': {
                           borderColor: GREEN_MAIN,
                           borderWidth: '2px'
                         },
                         '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                           borderColor: GREEN_MAIN,
                           borderWidth: '2px'
                         },
                         '& .MuiInputBase-input': {
                           pointerEvents: "auto !important",
                           cursor: "text !important",
                           userSelect: "text !important",
                         },
                         '& .MuiInputBase-inputMultiline': {
                           pointerEvents: "auto !important",
                           cursor: "text !important",
                           userSelect: "text !important",
                         },
                       },
                     }}
                   />
                 ) : (
                <Box component="ul" sx={{ pl: 2, color: "black" }}>
                  {generatedJob.jobDetails.responsibilities.map(
                    (resp: string, index: number) => (
                      <Typography
                        key={index}
                        component="li"
                        variant="body2"
                        sx={{ mb: 1 }}
                      >
                        {resp}
                      </Typography>
                    )
                  )}
                </Box>
                 )}
              </Box>

              
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
 });
 
 PostDetails.displayName = "PostDetails";

export default PostDetails;
