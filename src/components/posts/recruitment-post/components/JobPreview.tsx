import React, {useEffect} from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import WorkIcon from "@mui/icons-material/Work";
import SkillsList from "./SkillsList";
import SoftSkillsList from "./SoftSkillsList";
import JobDetailsForm from "./JobDetailsForm";
import JobInfoDisplay from "./JobInfoDisplay";

const GREEN_MAIN = "#00FF9D";
const GRADIENT_PRIMARY = "linear-gradient(135deg, #00FF9D 0%, #00E5FF 100%)";

interface JobPreviewProps {
  generatedJob: any;
  editedJob: any;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onInputChange: (field: string, value: any) => void;
  onShareLinkedIn: () => void;
  isPosting: boolean;
  hasSharedToLinkedIn: boolean;
  linkedinCopySuccess: boolean;
  jobPostError: string;
}

const JobPreview: React.FC<JobPreviewProps> = ({
  generatedJob,
  editedJob,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  onInputChange,
  onShareLinkedIn,
  isPosting,
  hasSharedToLinkedIn,
  linkedinCopySuccess,
  jobPostError,
}) => {
  useEffect(()=> {console.log(editedJob, "editedJob")}, [editedJob])
  if (jobPostError) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error" sx={{ mb: 2 }}>
          {jobPostError}
        </Typography>
      </Box>
    );
  }

  if (!generatedJob) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          textAlign: "center",
          minHeight: { xs: "300px", md: "auto" },
          backgroundColor: "#f9fafb",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            backgroundColor: "#d1fae5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2,
          }}
        >
          <WorkIcon sx={{ fontSize: 40, color: "#10b981" }} />
        </Box>
        <Typography
          variant="h6"
          sx={{ 
            fontSize: "1rem", 
            color: "#6b7280",
            fontWeight: 500
          }}
        >
          Generated job post will appear here
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        p: { xs: 2, sm: 3 },
        color: "#111827",
        fontSize: { xs: "0.875rem", sm: "1rem" },
        width: "100%",
        maxWidth: "100%",
        overflow: "visible",
        minHeight: { xs: "auto", sm: "auto" },
      }}
    >
      <Box sx={{ mb: { xs: 2, sm: 4 } }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            mb: { xs: 1.5, sm: 2 },
            gap: { xs: 1, sm: 2 },
          }}
        >
          {isEditing ? (
            <TextField
              fullWidth
              label="Job Title"
              value={editedJob.jobDetails.title}
              onChange={(e) => onInputChange("title", e.target.value)}
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
          <Box sx={{ 
            display: "flex", 
            gap: { xs: 0.5, sm: 1 },
            flexWrap: { xs: "wrap", sm: "nowrap" },
            width: { xs: "100%", sm: "auto" },
            justifyContent: { xs: "flex-start", sm: "flex-end" },
          }}>
            {!isEditing ? (
              <>
                <Tooltip title="Edit job details" arrow>
                  <IconButton
                    onClick={onEdit}
                    sx={{
                      background: GRADIENT_PRIMARY,
                      backdropFilter: "blur(15px)",
                      color: "#1E293B",
                      borderRadius: 2.5,
                      width: { xs: 40, sm: 48 },
                      height: { xs: 40, sm: 48 },
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
                        <CircularProgress size={16} sx={{ color: "white" }} />
                      ) : (
                        <LinkedInIcon sx={{ fontSize: 18 }} />
                      )
                    }
                    onClick={onShareLinkedIn}
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
                  onClick={onCancel}
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
                  onClick={onSave}
                  sx={{
                    background: "#00C853",
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
        {((editedJob && editedJob.jobDetails) || (generatedJob && generatedJob.jobDetails)) && <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            sx={{ color: "#0F172A", mb: 2, fontWeight: 700 }}
          >
            Job Details
          </Typography>
          {isEditing && editedJob && editedJob.jobDetails ? (
            <JobDetailsForm
              editedJob={editedJob}
              onInputChange={onInputChange}
            />
          ) : (
            <JobInfoDisplay jobDetails={(editedJob || generatedJob)?.jobDetails} />
          )}
        </Box>}

        {/* Required Skills */}
        <SkillsList
          skills={editedJob?.skillAnalysis?.requiredSkills || generatedJob?.skillAnalysis?.requiredSkills || []}
          title="Required Skills"
          editable={isEditing}
          onSkillsChange={(updatedSkills) =>
            onInputChange("skills", updatedSkills)
          }
        />

        {/* Soft Skills */}
        {((editedJob?.skillAnalysis?.softSkills && editedJob.skillAnalysis.softSkills.length > 0) ||
          (generatedJob?.skillAnalysis?.softSkills && generatedJob.skillAnalysis.softSkills.length > 0)) && (
          <SoftSkillsList
            skills={editedJob?.skillAnalysis?.softSkills || generatedJob?.skillAnalysis?.softSkills || []}
            title="Soft Skills"
            editable={isEditing}
            onSkillsChange={(updatedSkills) =>
              onInputChange("softSkills", updatedSkills)
            }
          />
        )}

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
              onChange={(e) => onInputChange("description", e.target.value)}
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
                  color: "#0F172A",
                  pointerEvents: "auto !important",
                  cursor: "text !important",
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
                  "& .MuiInputBase-input": {
                    pointerEvents: "auto !important",
                    cursor: "text !important",
                    userSelect: "text !important",
                  },
                  "& .MuiInputBase-inputMultiline": {
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
              value={editedJob.jobDetails.requirements.join("\n")}
              onChange={(e) => onInputChange("requirements", e.target.value)}
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
                  color: "#0F172A",
                  pointerEvents: "auto !important",
                  cursor: "text !important",
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
                  "& .MuiInputBase-input": {
                    pointerEvents: "auto !important",
                    cursor: "text !important",
                    userSelect: "text !important",
                  },
                  "& .MuiInputBase-inputMultiline": {
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
              value={editedJob.jobDetails.responsibilities.join("\n")}
              onChange={(e) =>
                onInputChange("responsibilities", e.target.value)
              }
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
                  color: "#0F172A",
                  pointerEvents: "auto !important",
                  cursor: "text !important",
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
                  "& .MuiInputBase-input": {
                    pointerEvents: "auto !important",
                    cursor: "text !important",
                    userSelect: "text !important",
                  },
                  "& .MuiInputBase-inputMultiline": {
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
  );
};

export default JobPreview;