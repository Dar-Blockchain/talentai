import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Avatar,
} from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import { styled } from "@mui/material/styles";
import Image from "next/image";
import {
  fetchUnlockedCandidates,
  resetUnlockedData,
} from "@/store/slices/candidateSlice";
import { AppDispatch, RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

const StyledCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  background: "white",
  borderRadius: "12px",
  border: "1px solid rgba(84,98,116,0.1)",
}));

const UnlockedCandidates: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, candidates } = useSelector(
    (state: RootState) => state.candidate.unlockedData
  );

  useEffect(() => {
    dispatch(fetchUnlockedCandidates());

    return () => {
      dispatch(resetUnlockedData());
    };
  }, [dispatch]);

  return (
    <StyledCard>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              color: "rgba(0, 0, 0, 1)",
              fontFamily: "Poppins",
              fontWeight: 600,
              fontStyle: "normal",
              fontSize: "20px",
              lineHeight: "100%",
              letterSpacing: "0",
              position: "relative",
              "&:after": {
                content: '""',
                position: "absolute",
                bottom: "-8px",
                left: 0,
                width: "40px",
                height: "5px",
                backgroundColor: "rgba(222, 147, 0, 1)",
                borderRadius: "2px",
              },
            }}
          >
            Unlocked Candidates
          </Typography>
        </Box>
      </Box>

      {/* Content Section */}
      {loading ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 8,
            backgroundColor: "rgba(62, 233, 167, 0.03)",
            borderRadius: "8px",
            border: "1px solid rgba(98, 111, 134, 0.18)",
          }}
        >
          <CircularProgress sx={{ color: "rgba(222, 147, 0, 1)", mb: 3 }} />
        </Box>
      ) : error ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 6,
            px: 4,
            backgroundColor: "#fef2f2",
            borderRadius: "12px",
            border: "1px solid #fecaca",
            textAlign: "center",
          }}
        >
          <ErrorIcon sx={{ fontSize: 48, color: "#dc2626", mb: 3 }} />
          <Typography
            variant="h6"
            sx={{ color: "#111827", fontWeight: 600, mb: 2 }}
          >
            Error Loading Unlocked Candidates
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#6b7280", maxWidth: "400px", mb: 3 }}
          >
            {error}
          </Typography>
        </Box>
      ) : !candidates || candidates.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 8,
            px: 4,
            backgroundColor: "rgba(62, 233, 167, 0.03)",
            borderRadius: "8px",
            border: "1px solid rgba(98, 111, 134, 0.18)",
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              mb: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(222, 147, 0, 0.16)",
              width: 100,
              height: 100,
              borderRadius: "50%",
            }}
          >
            <Image
              src="/icons/user-search-2.svg"
              alt="user-search"
              width={43}
              height={43}
            />{" "}
          </Box>
          <Typography
            variant="h5"
            sx={{
              color: "rgba(222, 147, 0, 1)",
              fontFamily: "Poppins",
              fontWeight: 500,
              fontStyle: "medium",
              fontSize: "20px",
              lineHeight: "28px",
              letterSpacing: "0",
              mb: 2,
            }}
          >
            No Unlocked Candidates Yet
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "rgba(147, 147, 147, 1)",
              maxWidth: "500px",
              mb: 4,
              fontFamily: "Poppins",
              fontWeight: 400,
              fontStyle: "normal", // "Regular" is not valid CSS → use "normal"
              fontSize: "14px",
              lineHeight: "25px",
              letterSpacing: "0px",
              textAlign: "center",
              verticalAlign: "middle",
            }}
          >
            We couldn't find any unlocked candidates.
            <br />
            Try unlocking candidates or adjusting your job requirements to get
            more matches.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Candidate Cards */}
          {candidates.map((candidate: any) => (
            <Box
              key={candidate?._id}
              sx={{
                background: "rgba(255, 251, 244, 1)",
                borderRadius: "12px",
                border: "1px solid rgba(222, 147, 0, 1)",
                px: 3,
                py: 2,
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                flex: 1,
                alignItems: "center",
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
                  {candidate?.firstName?.charAt(0)?.toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      alignItems: "center",
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: "rgba(24, 25, 28, 1)",
                        fontWeight: 500,
                        fontSize: "18px",
                        lineHeight: "28px",
                      }}
                    >
                      {candidate?.firstName + " " + candidate?.lastName}
                    </Typography>
                    {candidate?.targetRole && (
                      <Typography
                        variant="h6"
                        sx={{
                          color: "rgba(24, 25, 28, 1)",
                          fontWeight: 500,
                          fontSize: "18px",
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
                          fontSize: "18px",
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
                      userSelect: "none",
                      fontFamily: "Poppins",
                      fontWeight: 400,
                      fontStyle: "normal",
                      fontSize: "12px",
                      lineHeight: "23px",
                      letterSpacing: "0px",
                    }}
                  >
                    {candidate?.email}
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="outlined"
                fullWidth
                sx={{
                  height: "42px",
                  maxWidth: "200px",
                  backgroundColor: "rgba(224, 154, 16, 1)",
                  borderColor: "rgba(224, 154, 16, 1)",
                  color: "white",
                  fontWeight: 500,
                  borderRadius: "38px",
                  py: 1.5,
                  textTransform: "none",
                  fontSize: "0.875rem",
                  borderWidth: "1px",
                  "&:hover": {
                    backgroundColor: "rgba(224, 154, 16, 0.8)",
                  },
                }}
              >
                Contact Candidate
              </Button>
            </Box>
          ))}
        </Box>
      )}
    </StyledCard>
  );
};

export default UnlockedCandidates;
