import React from "react";
import Link from "next/link";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  CircularProgress,
  Chip,
  Stack,
  Button,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import {
  selectProfile,
} from "@/store/slices/profileSlice";
import { useSelector } from "react-redux";

interface PostDetailsModalProps {
  open: boolean;
  selectedJob: any;
  handleClose: () => void;
}

const PostDetailsModal: React.FC<PostDetailsModalProps> = ({
  open,
  selectedJob,
  handleClose,
}) => {
      const { profile } = useSelector(selectProfile);
            const details = selectedJob?.jobDetails;
            const createdAt =
              selectedJob?.createdAt;

            const location = details?.location;
            const type =
              details?.employmentType;
            const experience =
              details?.experienceLevel

            const salaryRange =
              details?.salary;

            const salary =
              salaryRange && typeof salaryRange === "object"
                ? `${salaryRange?.currency || "$"} ${
                    salaryRange?.min?.toLocaleString() ?? ""
                  }${
                    salaryRange?.max != null
                      ? " - " + salaryRange.max.toLocaleString()
                      : ""
                  }`.trim()
                : typeof salaryRange === "string"
                ? salaryRange
                : undefined;

            const description =
              details?.description || "No description available.";

            const responsibilities: string[] = Array.isArray(
              details?.responsibilities
            )
              ? details?.responsibilities
              : [];

            const requirements: string[] = Array.isArray(
              details?.requirements
            )
              ? details?.requirements
              : [];

            const company =
              details?.company;

            const requiredSkills =
              selectedJob?.skillAnalysis?.requiredSkills?.map(
                (skill: any) => skill.name
              ) || [];
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: 400,
        },
      }}
    >
      {/* ---------- TITLE ---------- */}
      <DialogTitle
        sx={{ fontWeight: 700, pb: 2, borderBottom: "1px solid #E0E0E0" }}
      >
        {selectedJob?.jobDetails?.title}
      </DialogTitle>

      {/* ---------- CONTENT ---------- */}
      <DialogContent dividers sx={{ maxHeight: 600, minHeight: 300, py: 3 }}>

<Stack spacing={3}>

                {/* Company */}
                {company && (
                  <Box sx={{ pb: 2, borderBottom: "1px solid #E0E0E0" }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: "#666", mb: 0.5 }}
                    >
                      Company
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, color: "#000" }}
                    >
                      {company}
                    </Typography>
                  </Box>
                )}

                {/* JOB TAGS */}
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                  sx={{ gap: 1 }}
                >
                  {location && (
                    <Chip
                      icon={
                        <LocationOnIcon sx={{ fontSize: "16px !important" }} />
                      }
                      label={location}
                      size="small"
                      sx={{
                        bgcolor: "#F3E8FF",
                        color: "#6B21A8",
                        "& .MuiChip-icon": { color: "#6B21A8" },
                      }}
                    />
                  )}

                  {type && (
                    <Chip
                      label={type}
                      size="small"
                      sx={{ bgcolor: "#EEF2FF", color: "#4338CA" }}
                    />
                  )}

                  {experience && (
                    <Chip
                      label={experience}
                      size="small"
                      sx={{ bgcolor: "#ECFDF5", color: "#065F46" }}
                    />
                  )}

                  {salary && (
                    <Chip
                      label={salary}
                      size="small"
                      sx={{ bgcolor: "#FFF7ED", color: "#9A3412" }}
                    />
                  )}

                  {createdAt && (
                    <Typography
                      variant="caption"
                      sx={{ color: "#666", ml: "auto !important" }}
                    >
                      Posted{" "}
                      {(() => {
                        const d = new Date(createdAt);
                        return isNaN(d.getTime())
                          ? createdAt
                          : d.toLocaleDateString();
                      })()}
                    </Typography>
                  )}
                </Stack>

                {/* DESCRIPTION */}
                {description && (
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1, color: "#000" }}
                    >
                      About the role
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#333",
                        whiteSpace: "pre-line",
                        lineHeight: 1.6,
                      }}
                    >
                      {description}
                    </Typography>
                  </Box>
                )}

                {/* SKILLS */}
                {requiredSkills.length > 0 && (
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1.5, color: "#000" }}
                    >
                      Required Skills
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {requiredSkills.map((skill, index) => (
                        <Chip
                          key={index}
                          label={skill}
                          size="small"
                          sx={{
                            backgroundColor: "rgba(131, 16, 255, 0.1)",
                            color: "#8310FF",
                            fontWeight: 500,
                            fontSize: "0.8rem",
                            height: 28,
                            borderRadius: 1.5,
                            border: "1px solid rgba(131, 16, 255, 0.2)",
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* REQUIREMENTS & RESPONSIBILITIES */}
                {(requirements.length > 0 ||
                  responsibilities.length > 0) && (
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 3,
                    }}
                  >
                    {requirements.length > 0 && (
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 600,
                            mb: 1,
                            color: "#000",
                          }}
                        >
                          Requirements
                        </Typography>
                        <Stack spacing={0.5}>
                          {requirements.map((req, i) => (
                            <Typography
                              key={i}
                              variant="body2"
                              sx={{ color: "#333", lineHeight: 1.6 }}
                            >
                              • {req}
                            </Typography>
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {responsibilities.length > 0 && (
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 600,
                            mb: 1,
                            color: "#000",
                          }}
                        >
                          Responsibilities
                        </Typography>
                        <Stack spacing={0.5}>
                          {responsibilities.map((resp, i) => (
                            <Typography
                              key={i}
                              variant="body2"
                              sx={{ color: "#333", lineHeight: 1.6 }}
                            >
                              • {resp}
                            </Typography>
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Box>
                )}
              </Stack>
      </DialogContent>

      {/* ---------- ACTIONS ---------- */}
      <DialogActions>
        <Button onClick={handleClose} sx={{ textTransform: "none" }}>
          Close
        </Button>

        {
        selectedJob?.post_steps?.length > 0 &&  selectedJob?.post_steps[0]._id &&
        profile?.quota < 5 ? (
          <Link
            href={`/posts/${selectedJob?._id}/interview?stepId=${
              selectedJob?.post_steps[0]._id
            }`}
            passHref
            legacyBehavior
          >
            <Button
              variant="contained"
              sx={{ background: "#8310FF", textTransform: "none" }}
            >
              Proceed
            </Button>
          </Link>
        ) : (
          <Button
            variant="contained"
            disabled
            sx={{
              background: "#cccccc",
              textTransform: "none",
              "&.Mui-disabled": { color: "#666" },
            }}
          >
            Interview Not Available
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PostDetailsModal;
