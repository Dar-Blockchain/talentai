"use client";
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  CircularProgress,
  Box,
  Avatar,
  List,
  IconButton,
  Button,
  DialogActions,
} from "@mui/material";
import { useSelector } from "react-redux";
import { selectJobMatches } from "@/store/slices/postSlice";
import { MatchingCandidate } from "@/pages/dashboard/company";
import CloseIcon from "@mui/icons-material/Close";

const noCopyStyle = {
  userSelect: "none" as const,
  WebkitUserSelect: "none" as const,
  MozUserSelect: "none" as const,
  msUserSelect: "none" as const,
};
interface MatchingFlowModalProps {
  open: boolean;
  mode: "saving" | "matching" | "done";
  onClose?: () => void;
  onContinue?: (shouldContinue: boolean) => void;
}

const MatchingFlowModal: React.FC<MatchingFlowModalProps> = ({
  open,
  mode,
  onClose,
  onContinue,
}) => {
  const matchingProfiles = useSelector(selectJobMatches) as MatchingCandidate[];

  const PROFILE_UNLOCK_PACK_PRICE = 1500;

  const renderSaving = () => (
    <Box py={3} textAlign="center">
      <CircularProgress
        size={120}
        thickness={2}
        sx={{ color: "rgba(77, 217, 163, 1)" }}
      />
      <Typography
        sx={{
          mt: 2,
          fontSize: "16px",
          fontWeight: 400,
          lineHeight: "22px",
          color: "rgba(75, 85, 99, 1)",
        }}
      >
        Please wait while we prepare your job and create matching process.
      </Typography>
    </Box>
  );

  const renderMatching = () => (
    <Box py={3} textAlign="center">
      <CircularProgress size={50} />

      <Typography
        sx={{
          fontSize: "14px",
          fontWeight: 700,
          lineHeight: "34px",
          mt: 2,
          mb: 1,
        }}
      >
        Finding matching candidates…
      </Typography>

      <Typography
        sx={{
          fontSize: "14px",
          fontWeight: 400,
          lineHeight: "34px",
          color: "rgba(84,98,116,0.8)",
        }}
      >
        Analyzing skills and job requirements to get the best matches.
      </Typography>
    </Box>
  );

  const noCandidates = () => (
    <Typography
      variant="h6"
      my={2}
      sx={{ fontSize: "14px", fontWeight: 400, lineHeight: "34px" }}
    >
      Unfortunately, no matching candidates were found for this job.
      <br />
      You can continue setting up your recruitment workflow or adjust job
      requirements to improve matching.
    </Typography>
  );

  const renderCandidates = () => (
    <Box py={2}>
      <Typography
        variant="h6"
        mb={2}
        sx={{ fontSize: "14px", fontWeight: 400, lineHeight: "34px" }}
      >
        We've already found {matchingProfiles?.length} matching candidates for
        you.
        <br />
        You can start reviewing and contacting them immediately by unlocking
        their profiles for{" "}
        <b style={{ color: "rgba(222, 147, 0, 1)" }}>
          {PROFILE_UNLOCK_PACK_PRICE} tokens
        </b>{" "}
        , or you can continue setting up your recruitment workflow.
      </Typography>
      <Typography
        sx={{
          fontSize: "14px",
          fontWeight: 700,
          lineHeight: "34px",
          color: "rgba(222, 147, 0, 1)",
        }}
      >
        Candidates Found
      </Typography>

      <List sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {matchingProfiles.slice(0, 5).map((candidate, index) => (
          <Box
            key={candidate.candidateId}
            sx={{
              background: "rgba(222, 147, 0, 0.04)",
              borderRadius: "8px",
              border: "1px solid rgba(222, 147, 0, 1)",
              px: 3,
              py: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flex: 1,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 50,
                      height: 50,
                      backgroundColor: "#f3f4f6",
                      border: "2px solid #e5e7eb",
                      fontSize: "1.5rem",
                      fontWeight: 600,
                      color: "#6b7280",
                    }}
                  >
                    {candidate.name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: "rgba(24, 25, 28, 1)",
                          fontWeight: 500,
                          fontSize: "16px",
                          lineHeight: "28px",
                          filter: candidate?.unlocked ? "none" : "blur(6px)",
                          ...noCopyStyle,
                        }}
                      >
                        {candidate?.firstName + " " + candidate?.lastName ||
                          candidate?.name}
                      </Typography>
                      {candidate?.targetRole && (
                        <Typography
                          variant="h6"
                          sx={{
                            color: "rgba(24, 25, 28, 1)",
                            fontWeight: 500,
                            fontSize: "16px",
                            lineHeight: "28px",
                          }}
                        >
                          |
                        </Typography>
                      )}
                      {candidate?.targetRole && (
                        <Typography
                          variant="h6"
                          sx={{
                            color: "rgba(84, 98, 116, 0.53)",
                            fontWeight: 400,
                            fontSize: "16px",
                            lineHeight: "28px",
                          }}
                        >
                          {candidate?.targetRole}
                        </Typography>
                      )}
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(84, 98, 116, 0.53)",
                        filter: candidate?.unlocked ? "none" : "blur(4px)",
                        userSelect: "none",
                        fontFamily: "Poppins",
                        fontWeight: 400,
                        fontStyle: "normal",
                        fontSize: "12px",
                        lineHeight: "23px",
                        letterSpacing: "0px",
                        ...noCopyStyle,
                      }}
                    >
                      {candidate?.email}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    color: "rgba(32, 32, 32, 1)",
                    fontWeight: 600,
                    fontSize: "12px",
                    lineHeight: 1,
                  }}
                >
                  {candidate.score.toFixed(2)}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color:
                      candidate.score >= 70
                        ? "rgba(62, 180, 137, 0.42)"
                        : candidate.score >= 50
                        ? "rgba(255, 193, 7, 0.42)"
                        : "rgba(246, 128, 128, 0.42)",
                    fontWeight: 600,
                    fontSize: "12",
                    mt: 0.5,
                  }}
                >
                  Matching Score
                </Typography>
              </Box>
            </Box>
          </Box>
        ))}
      </List>
      <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>
        Go directly to your matches and unlock a profile to view contact details
        and full resumes.
      </Typography>
    </Box>
  );

  return (
    <Dialog
      open={open}
      fullWidth
      PaperProps={{
        sx: {
          maxWidth: "674px",
          width: "100%",
        },
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: "1px solid rgba(227, 229, 233, 1)",
          color: "black",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "rgba(41, 210, 145, 1)",
              fontFamily: "Poppins",
              fontWeight: 600,
              fontStyle: "normal",
              fontSize: "20px",
              lineHeight: "25px",
              letterSpacing: "0px",
            }}
          >
            {mode === "saving"
              ? "Saving Job"
              : mode === "matching"
              ? "Job created ! What's Next?"
              : "Job created ! What's Next?"}
          </Typography>
          {mode === "done" && (
            <IconButton onClick={onClose} sx={{ color: "black" }}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>

      <DialogContent>
        {mode === "saving" && renderSaving()}
        {mode === "matching" && renderMatching()}
        {mode === "done" && matchingProfiles?.length > 0 && renderCandidates()}
        {mode === "done" && matchingProfiles?.length === 0 && noCandidates()}
      </DialogContent>

      {mode === "done" && (
        <DialogActions
          sx={{
            p: 3,
            borderTop: "1px solid rgba(227, 229, 233, 1)",
          }}
        >
          <Button
            variant="outlined"
            onClick={() => onContinue(true)}
            sx={{
              border: "none",
              background: "none",
              color: "rgba(133, 169, 227, 1)",
              textDecoration: "none",
              "&:hover": {
                background: "none",
                textDecoration: "none",
                color: "rgba(133, 169, 227, 0.8)",
              },
            }}
          >
            Configure Hiring Agent
          </Button>
          {matchingProfiles?.length > 0 && (
            <Button
              variant="outlined"
              onClick={() => {}}
              sx={{
                borderColor: "rgba(222, 147, 0, 1)",
                color: "rgba(222, 147, 0, 1)",
                fontWeight: 600,
                borderRadius: "38px",
                py: 1.5,
                maxWidth: "300px",
                height: "42px",
                textTransform: "none",
                fontSize: "0.875rem",
                borderWidth: "1px",
                "&:hover": {
                  backgroundColor: "rgba(222, 147, 0, 0.08)",
                },
                "&.Mui-disabled": {
                  borderColor: "#e5e7eb",
                  color: "#9ca3af",
                },
              }}
            >
              Unlock Candidate Profiles
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default MatchingFlowModal;