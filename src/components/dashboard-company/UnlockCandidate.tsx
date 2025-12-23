import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Button,
  Avatar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import Image from "next/image";
import { useSelector } from "react-redux";
import {
  fetchTokenBalance,
  selectTokenBalance,
} from "@/store/slices/tokenSlice";
import {
  resetCandidateState,
  unlockCandidate,
} from "@/store/slices/candidateSlice";
import { fetchJobMatches } from "@/store/slices/postSlice";

const noCopyStyle = {
  userSelect: "none" as const,
  WebkitUserSelect: "none" as const,
  MozUserSelect: "none" as const,
  msUserSelect: "none" as const,
};

interface UnlockCandidateProps {
  open: boolean;
  onClose: () => void;
  selectedCandidate: any;
  selectedJob: string;
  companyId: string;
}

const UnlockCandidate: React.FC<UnlockCandidateProps> = ({
  open,
  onClose,
  selectedCandidate,
  selectedJob,
  companyId,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const tokenBalance = useSelector(selectTokenBalance);
  const { walletInfo } = useSelector((state: RootState) => state.tokenPurchase);
  const { unlockResult, loading } = useSelector((state: RootState) => state.candidate);
  const hasInsufficientBalance =
    walletInfo && walletInfo.balance < selectedCandidate?.unlockPrice;
  const [isCandidateUnlocked, setIsCandidateUnlocked] = useState(false);
  const handleConfirmUnlock = async () => {
    const data = {
      candidateIds: [selectedCandidate.candidateId],
      idJob: selectedJob,
    };
    await dispatch(unlockCandidate(data));
  };

  const handleClose = () => {
    onClose();
    setIsCandidateUnlocked(false);
    dispatch(resetCandidateState());
  };

  useEffect(() => {
    if (unlockResult && unlockResult.success) {
      setIsCandidateUnlocked(true);
      dispatch(fetchTokenBalance());
      dispatch(fetchJobMatches(selectedJob));
    }
  }, [unlockResult, selectedJob]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: "white",
          backdropFilter: "blur(10px)",
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.1)",
          maxHeight: "98vh",
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
            View Full Candidate Profile
          </Typography>
          <IconButton onClick={handleClose} sx={{ color: "black" }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Box
          sx={{
            width: "100%",
            height: 100,
            borderRadius: "8px",
            border: "1px solid rgba(228, 229, 232, 1)",
            boxShadow: "0px 2px 18px 0px rgba(24, 25, 28, 0.03)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 2,
            px: 2.5,
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
              {selectedCandidate?.name?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  color: "rgba(24, 25, 28, 1)",
                  fontWeight: 500,
                  fontSize: "18px",
                  lineHeight: "28px",
                  filter: isCandidateUnlocked ? "none" : "blur(6px)",
                  ...( !isCandidateUnlocked && noCopyStyle),          
                }}
              >
                {selectedCandidate?.firstName +
                  " " +
                  selectedCandidate?.lastName || selectedCandidate?.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(84, 98, 116, 0.53)",
                  filter: isCandidateUnlocked ? "none" : "blur(4px)",
                  userSelect: "none",
                  fontFamily: "Poppins",
                  fontWeight: 400,
                  fontStyle: "normal",
                  fontSize: "12px",
                  lineHeight: "23px",
                  letterSpacing: "0px",
                  ...( !isCandidateUnlocked && noCopyStyle),
                }}
              >
                {selectedCandidate?.email}
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              py: 1,
              px: 1.5,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 31,
              borderRadius: "8px",
              border: "0.25px solid rgba(95, 168, 211, 1)",
              background: "rgba(95, 168, 211, 0.1)",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "rgba(95, 168, 211, 1)",
                fontFamily: "Poppins",
                fontWeight: 400,
                fontStyle: "normal",
                fontSize: "12px",
                lineHeight: "42.99px",
                letterSpacing: "0px",
                textAlign: "center",
                verticalAlign: "middle",
              }}
            >
              {selectedCandidate?.unlockPrice} tokens
            </Typography>
          </Box>
        </Box>
        {/* Insufficient Balance */}
        {hasInsufficientBalance && (
          <Alert severity="error">
            Insufficient balance. You need {selectedCandidate?.unlockPrice} HBAR
            but have {walletInfo.balance} HBAR.
          </Alert>
        )}
        {!hasInsufficientBalance && !isCandidateUnlocked && (
          <Typography
            variant="body2"
            sx={{
              mt: 2.5,
              color: "rgba(0, 0, 0, 1)",
              fontFamily: "Poppins",
              fontWeight: 400,
              fontStyle: "normal",
              fontSize: "14px",
              lineHeight: "34px",
              letterSpacing: "0px",
              verticalAlign: "middle",
            }}
          >
            You are about to use <b>{selectedCandidate?.unlockPrice} Tokens</b>{" "}
            to unlock the full profile for this candidate. This will grant you
            permanent access to their contact information and detailed resume.
            Your remaining balance will be{" "}
            <b>{tokenBalance - selectedCandidate?.unlockPrice} Tokens</b>.
          </Typography>
        )}
        {isCandidateUnlocked && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 3, mt: 2.5 }}>
            <Image src="/icons/check.svg" width={58} height={58} alt="token" />
            <Typography
              variant="body2"
              sx={{
                color: "rgba(0, 0, 0, 1)",
                fontFamily: "Poppins",
                fontWeight: 400,
                fontStyle: "normal",
                fontSize: "16px",
                lineHeight: "34px",
                letterSpacing: 0,
                verticalAlign: "middle",
              }}
            >
              Profile Unlocked! <br />
              You can now view the full details and contact
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions
        sx={{
          p: 3,
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Button
          variant="outlined"
          onClick={handleClose}
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
          Cancel
        </Button>
        {!isCandidateUnlocked && (
          <Button
            variant="outlined"
            onClick={handleConfirmUnlock}
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
            loading={loading}
          >
            Confirm Unlock
          </Button>
        )}

        {isCandidateUnlocked && (
          <Button
            variant="outlined"
            sx={{
              borderColor: "rgba(11, 82, 198, 1)",
              color: "rgba(11, 82, 198, 1)",
              fontWeight: 600,
              borderRadius: "38px",
              py: 1.5,
              maxWidth: "300px",
              height: "42px",
              textTransform: "none",
              fontSize: "0.875rem",
              borderWidth: "1px",
              "&:hover": {
                backgroundColor: "rgba(11, 82, 198, 0.08)",
              },
              "&.Mui-disabled": {
                borderColor: "#e5e7eb",
                color: "#9ca3af",
              },
            }}
          >
            View Full Profile
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default UnlockCandidate;
