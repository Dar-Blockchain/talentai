"use client";
import * as React from "react";
import { Box, Typography, Button, Tooltip } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";

type RoleSelectionProps = {
  preferences: ReturnType<typeof import("./hooks/usePreferences").usePreferences>;
};
const RoleSelection: React.FC<RoleSelectionProps> =  ({ preferences }: RoleSelectionProps) => {
  const { userType, isTestJobReturnUrl, handleUserTypeSelect } =
    preferences;

  const handleCandidateClick = () => {
    handleUserTypeSelect("candidate");
  };

  const handleCompanyClick = () => {
    handleUserTypeSelect("company");
  };

  return (
    <Box sx={{ p: 2, textAlign: "center" }}>
      <Typography
        sx={{
          mb: 3,
          fontWeight: 500,
          fontSize: "20px",
          lineHeight: "43px",
          textAlign: "center",
        }}
      >
        Are you a candidate looking for opportunities or a company seeking
        talent?
      </Typography>

      {isTestJobReturnUrl && (
        <Typography
          sx={{
            mb: 2,
            fontSize: "16px",
            color: "rgba(154, 86, 234, 1)",
            fontWeight: 500,
          }}
        >
          Looks like you’re here for a job test! Only candidates can continue.
        </Typography>
      )}

      <Box sx={{ display: "flex", justifyContent: "center", gap: 3, mt: 2 }}>
        {/* Candidate Button */}
        <Button
          variant={userType === "candidate" ? "contained" : "outlined"}
          startIcon={<PersonIcon />}
          sx={{
            textTransform: "none",
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "18px",
            borderRadius: "50px",
            px: 4,
            color: userType === "candidate" ? "white" : "rgba(154, 86, 234, 1)",
            backgroundColor:
              userType === "candidate"
                ? "rgba(154, 86, 234, 1)"
                : "transparent",
            borderColor: "rgba(154, 86, 234, 1)",
            boxShadow:
              userType === "candidate"
                ? "0 4px 10px rgba(154, 86, 234, 0.3)"
                : "none",
            "&:hover": {
              backgroundColor:
                userType === "candidate"
                  ? "rgba(154, 86, 234, 0.9)"
                  : "rgba(154, 86, 234, 0.1)",
              boxShadow:
                userType === "candidate"
                  ? "0 6px 14px rgba(154, 86, 234, 0.4)"
                  : "0 4px 10px rgba(154, 86, 234, 0.2)",
            },
            transition: "all 0.2s ease-in-out",
          }}
          onClick={handleCandidateClick}
        >
          I’m a Candidate
        </Button>

        {/* Company Button */}
        {isTestJobReturnUrl ? (
          <Tooltip title="Only candidates can take this job test.">
            <span>
              <Button
                variant="outlined"
                startIcon={<BusinessIcon />}
                sx={{
                  textTransform: "none",
                  fontWeight: 500,
                  px: 4,
                  fontSize: "18px",
                  borderRadius: "50px",
                  borderColor: "rgba(12, 218, 139, 1)",
                  color: "rgba(12, 218, 139, 1)",
                  pointerEvents: "none",
                  opacity: 0.5,
                }}
              >
                I’m a Company
              </Button>
            </span>
          </Tooltip>
        ) : (
          <Button
            variant={userType === "company" ? "contained" : "outlined"}
            startIcon={<BusinessIcon />}
            sx={{
              textTransform: "none",
              fontFamily: "Poppins",
              fontWeight: 500,
              px: 4,
              fontSize: "18px",
              borderRadius: "50px",
              color: userType === "company" ? "white" : "rgba(12, 218, 139, 1)",
              backgroundColor:
                userType === "company" ? "rgba(12, 218, 139, 1)" : "transparent",
              borderColor: "rgba(12, 218, 139, 1)",
              boxShadow:
                userType === "company"
                  ? "0 4px 10px rgba(9, 178, 113, 0.3)"
                  : "none",
              "&:hover": {
                backgroundColor:
                  userType === "company"
                    ? "rgba(9, 178, 113, 0.9)"
                    : "rgba(9, 178, 113, 0.1)",
                boxShadow:
                  userType === "company"
                    ? "0 6px 14px rgba(9, 178, 113, 0.4)"
                    : "0 4px 10px rgba(9, 178, 113, 0.2)",
              },
              transition: "all 0.2s ease-in-out",
            }}
            onClick={handleCompanyClick}
          >
            I’m a Company
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default RoleSelection;
