"use client";
import { Box, Typography } from "@mui/material";
import { usePreferences } from "../hooks/usePreferences";

type ReviewProps = {
  preferences: ReturnType<typeof usePreferences>;
};

const CandidateReview: React.FC<ReviewProps> = ({ preferences }: ReviewProps) => {
  const { candidateDetails, skills, skillProficiency } = preferences;

  const labelStyle = {
    fontFamily: "Poppins",
    fontWeight: 600,
    fontSize: "16px",
    lineHeight: "42.99px",
  };

  const valueStyle = {
    fontFamily: "Poppins",
    fontWeight: 500,
    fontSize: "16px",
    lineHeight: "42.99px",
  };

  // Map proficiency levels
  const proficiencyMap: { [key: string]: string } = {
    "1": "Entry Level",
    "2": "Junior",
    "3": "Mid Level",
    "4": "Senior",
    "5": "Expert"
  };

  // ⭐ Format salary field based on new model
// ⭐ Format salary field with /month
const salaryText =
  candidateDetails.salaryCurrency &&
  candidateDetails.salaryMin &&
  candidateDetails.salaryMax
    ? `${candidateDetails.salaryCurrency}${candidateDetails.salaryMin} – ${candidateDetails.salaryCurrency}${candidateDetails.salaryMax}/month`
    : "***";


  // Prepare fields for rendering
  const fields = [
    {
      label: "Name",
      value:
        `${candidateDetails.firstName || ""} ${candidateDetails.lastName || ""}`.trim() ||
        "***",
    },
    { label: "Age", value: candidateDetails.age ? `${candidateDetails.age} years` : "***" },
    { label: "Gender", value: candidateDetails.gender || "***" },
    { label: "Location", value: candidateDetails.location || "***" },
    { label: "Education Level", value: candidateDetails.educationLevel || "***" },

    // ⭐ Updated salary
    { label: "Salary Expectation", value: salaryText },

    { label: "Preferred Contract", value: candidateDetails.preferredContractType || "***" },
    { label: "Work Mode", value: candidateDetails.workModePreference || "***" },
    { label: "Selected Skill", value: skills?.[0] || "***" },
    { label: "Proficiency Level", value: proficiencyMap[skillProficiency] || "***" },

  ];

  return (
    <Box sx={{ width: "100%", py: 2 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          mb: 2,
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            color: "rgba(0, 0, 0, 1)",
            fontWeight: 600,
            fontSize: "18px",
            lineHeight: "42.99px",
          }}
        >
          Confirm your details before moving forward
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: "rgba(0, 0, 0, 1)",
            fontSize: "16px",
            lineHeight: "25px",
          }}
        >
          Here’s a summary of the information you’ve provided. Take a moment to
          review it to ensure everything is accurate.
        </Typography>
      </Box>

      {/* Summary */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {fields.map((item) => (
          <Box
            key={item.label}
            sx={{ display: "flex", flexDirection: "row", gap: 1 }}
          >
            <Typography sx={labelStyle}>{item.label}:</Typography>
            <Typography sx={valueStyle}>{item.value}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default CandidateReview;
