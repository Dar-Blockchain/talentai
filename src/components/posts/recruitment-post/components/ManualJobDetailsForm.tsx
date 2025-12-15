import React, { useState, useImperativeHandle, forwardRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  InputAdornment,
} from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import Cookies from "js-cookie";

const GRADIENT_PRIMARY = "linear-gradient(135deg, #00FF9D 0%, #00E5FF 100%)";
const CARD_BG = "#FFFFFF";

const CONTRACT_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];
const WORK_MODES = ["Remote", "On-site", "Hybrid"];
const CURRENCIES = ["$", "€", "TND"];

export interface ManualJobDetails {
  title: string;
  salary: {
    currency: string;
    min: number;
    max: number;
  };
  employmentType: string;
  workMode: string;
}

export interface ManualJobDetailsRef {
  canProceed: () => boolean;
  getFormData: () => ManualJobDetails;
  saveJob: () => Promise<{ success: boolean; jobId?: string; jobData?: any }>;
  getJobTitle: () => string | undefined;
  getJobSkills: () => string[];
  getJobData: () => any;
}

interface ManualJobDetailsFormProps {
  onReadyChange?: (ready: boolean) => void;
}

const ManualJobDetailsForm = forwardRef<ManualJobDetailsRef, ManualJobDetailsFormProps>(
  ({ onReadyChange }, ref) => {
    const [title, setTitle] = useState("");
    const [currency, setCurrency] = useState("$");
    const [minSalary, setMinSalary] = useState("");
    const [maxSalary, setMaxSalary] = useState("");
    const [employmentType, setEmploymentType] = useState("");
    const [workMode, setWorkMode] = useState("");
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Check if form is complete
    const isFormComplete = (): boolean => {
      return (
        title.trim() !== "" &&
        employmentType !== "" &&
        workMode !== "" &&
        minSalary !== "" &&
        maxSalary !== "" &&
        parseInt(maxSalary) >= parseInt(minSalary)
      );
    };

    // Notify parent when form completion status changes
    React.useEffect(() => {
      onReadyChange?.(isFormComplete());
    }, [title, employmentType, workMode, minSalary, maxSalary, onReadyChange]);

    const canProceed = (): boolean => {
      return isFormComplete();
    };

    const getFormData = (): ManualJobDetails => {
      return {
        title: title.trim(),
        salary: {
          currency,
          min: parseInt(minSalary),
          max: parseInt(maxSalary),
        },
        employmentType,
        workMode,
      };
    };

    const saveJob = async (): Promise<{ success: boolean; jobId?: string; jobData?: any }> => {
      setIsSaving(true);
      setError("");

      try {
        if (!isFormComplete()) {
          throw new Error("Please fill in all required fields");
        }

        const formData = getFormData();

        // Create job post data structure matching the backend schema
        const jobPostData = {
          jobDetails: {
            title: formData.title,
            description: `${formData.title} - ${formData.employmentType} position. ${formData.workMode} work arrangement. Competitive salary package offered.`,
            requirements: [
              "Strong communication skills",
              "Team player with problem-solving abilities",
              "Relevant experience in the field"
            ],
            responsibilities: [
              "Collaborate with team members on projects",
              "Contribute to company goals and objectives",
              "Maintain professional standards"
            ],
            location: "To be determined",
            employmentType: formData.employmentType,
            workMode: formData.workMode,
            experienceLevel: "All levels",
            salary: {
              min: formData.salary.min,
              max: formData.salary.max,
              currency: formData.salary.currency,
            },
          },
          skillAnalysis: {
            requiredSkills: [
              { name: "Technical Skills", level: "Intermediate" },
              { name: "Problem Solving", level: "Intermediate" },
              { name: "Analytical Thinking", level: "Intermediate" }
            ],
            softSkills: [
              { name: "Communication", level: "Intermediate" },
              { name: "Teamwork", level: "Intermediate" },
              { name: "Adaptability", level: "Intermediate" }
            ],
            suggestedSkills: {
              technical: [],
              frameworks: [],
              tools: [],
            },
            skillSummary: {
              mainTechnologies: [],
              complementarySkills: [],
              learningPath: [],
              stackComplexity: "Moderate",
            },
          },
          linkedinPost: {
            formattedContent: {
              headline: `We're Hiring: ${formData.title}`,
              introduction: `Exciting opportunity for a ${formData.title}`,
              companyPitch: "Join our innovative team",
              roleOverview: `As a ${formData.title}, you'll be at the heart of our team`,
              keyPoints: [
                `${formData.workMode} work`,
                `${formData.employmentType} position`,
                `Salary: ${formData.salary.currency}${formData.salary.min.toLocaleString()} - ${formData.salary.currency}${formData.salary.max.toLocaleString()}`,
              ],
              skillsRequired: "To be defined in recruitment pipeline",
              benefitsSection: "Competitive salary and benefits package",
              callToAction: "Apply now to join our team!",
            },
            hashtags: ["#Hiring", "#JobOpening", `#${formData.title.replace(/\s+/g, "")}`],
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
            finalPost: `We're Hiring: ${formData.title}\n\n${formData.workMode} | ${formData.employmentType}\nSalary: ${formData.salary.currency}${formData.salary.min.toLocaleString()} - ${formData.salary.currency}${formData.salary.max.toLocaleString()}`,
          },
        };

        const token = Cookies.get("api_token");

        if (!token) {
          throw new Error("No authentication token found. Please log in again.");
        }

        console.log("Saving manual job post with data:", jobPostData);

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
          let errorMessage = "Failed to save job post";
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: ${errorMessage}`;
            console.error("API Error Response:", errorData);
          } catch (e) {
            errorMessage = `HTTP ${response.status}: ${response.statusText || errorMessage}`;
          }
          throw new Error(errorMessage);
        }

        const savedJob = await response.json();
        const jobId = savedJob.data?._id || savedJob._id;

        console.log("Manual job saved successfully:", savedJob);

        return {
          success: true,
          jobId,
          jobData: jobPostData,
        };
      } catch (error) {
        console.error("Error saving manual job:", error);
        setError(error instanceof Error ? error.message : "Failed to save job");
        return { success: false };
      } finally {
        setIsSaving(false);
      }
    };

    const getJobTitle = (): string | undefined => {
      return title.trim() || undefined;
    };

    const getJobSkills = (): string[] => {
      // For manual form, we don't have skills defined yet
      // They will be defined in the pipeline builder
      return [];
    };

    const getJobData = (): any => {
      const formData = getFormData();
      return {
        jobDetails: {
          title: formData.title,
          salary: formData.salary,
          employmentType: formData.employmentType,
          workMode: formData.workMode,
        },
      };
    };

    useImperativeHandle(ref, () => ({
      canProceed,
      getFormData,
      saveJob,
      getJobTitle,
      getJobSkills,
      getJobData,
    }));

    return (
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, sm: 3, md: 4 },
          minHeight: "100%",
        }}
      >
        <Card
          sx={{
            maxWidth: 700,
            width: "100%",
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
                <WorkIcon sx={{ fontSize: 24 }} />
              </Box>
            }
            title={
              <Typography variant="h5" fontWeight={700} color="#1f2937">
                Job Details
              </Typography>
            }
            subheader={
              <Typography variant="body2" color="#6b7280" sx={{ mt: 0.5 }}>
                Enter the basic details for your job post
              </Typography>
            }
            sx={{ pb: 2 }}
          />

          <CardContent sx={{ pt: 0 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Job Title */}
              <TextField
                label="Job Title"
                placeholder="e.g. Senior Frontend Developer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                fullWidth
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />

              {/* Salary Range */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1.5, fontWeight: 600, color: "#374151" }}
                >
                  Salary Range *
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr", gap: 2 }}>
                  {/* Currency */}
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      value={currency}
                      label="Currency"
                      onChange={(e) => setCurrency(e.target.value)}
                      sx={{ borderRadius: 2 }}
                    >
                      {CURRENCIES.map((curr) => (
                        <MenuItem key={curr} value={curr}>
                          {curr}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Min Salary */}
                  <TextField
                    label="Minimum"
                    type="number"
                    value={minSalary}
                    onChange={(e) => setMinSalary(e.target.value)}
                    required
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">{currency}</InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />

                  {/* Max Salary */}
                  <TextField
                    label="Maximum"
                    type="number"
                    value={maxSalary}
                    onChange={(e) => setMaxSalary(e.target.value)}
                    required
                    fullWidth
                    error={
                      maxSalary !== "" &&
                      minSalary !== "" &&
                      parseInt(maxSalary) < parseInt(minSalary)
                    }
                    helperText={
                      maxSalary !== "" &&
                      minSalary !== "" &&
                      parseInt(maxSalary) < parseInt(minSalary)
                        ? "Max must be greater than min"
                        : ""
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">{currency}</InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Box>
              </Box>

              {/* Contract Type */}
              <FormControl fullWidth required>
                <InputLabel>Contract Type</InputLabel>
                <Select
                  value={employmentType}
                  label="Contract Type"
                  onChange={(e) => setEmploymentType(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  {CONTRACT_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Work Mode */}
              <FormControl fullWidth required>
                <InputLabel>Work Mode</InputLabel>
                <Select
                  value={workMode}
                  label="Work Mode"
                  onChange={(e) => setWorkMode(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  {WORK_MODES.map((mode) => (
                    <MenuItem key={mode} value={mode}>
                      {mode}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Info Box */}
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "#f0fdf4",
                  border: "1px solid #86efac",
                }}
              >
                <Typography variant="body2" sx={{ color: "#166534", lineHeight: 1.6 }}>
                  💡 <strong>Next step:</strong> You'll configure your AI recruitment agent and
                  then design your custom recruitment pipeline with tests, interviews, and
                  evaluation steps.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }
);

ManualJobDetailsForm.displayName = "ManualJobDetailsForm";

export default ManualJobDetailsForm;
