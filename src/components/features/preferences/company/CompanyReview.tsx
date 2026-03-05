"use client";
import { Box, Typography } from "@mui/material";

type ReviewProps = {
  preferences: ReturnType<
    typeof import("../hooks/usePreferences").usePreferences
  >;
};

const CompanyReview: React.FC<ReviewProps> = ({ preferences }: ReviewProps) => {
  const { companyDetails } = preferences;

  return (
    <Box sx={{ width: "100%", py: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
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
          Review Your Information
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: "rgba(0, 0, 0, 1)",
            fontWeight: 400,
            fontSize: "16px",
            lineHeight: "25px",
          }}
        >
          Take a moment to review your details below. You can go back to make
          changes.
        </Typography>
      </Box>

      {/* Section Title */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 2,
        }}
      >
        <Box
          component="img"
          src={"/icons/building2.svg"}
          alt="TalentAI Logo"
          sx={{ height: 18, width: 20 }}
        />
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: "16px",
            lineHeight: "42.99px",
          }}
        >
          Company & Skills
        </Typography>
      </Box>

      {/* Grid with max 2 columns */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 2,
        }}
      >
        {/* Company Name */}
        <Box>
          <Typography
            sx={{
              fontWeight: 500,
              fontSize: "16px",
              color: "rgba(106, 106, 106, 1)",
            }}
          >
            Company Name
          </Typography>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "16px",
              color: "rgba(25, 25, 25, 1)",
            }}
          >
            {companyDetails?.name || "---"}
          </Typography>
        </Box>

        {/* Industry */}
        <Box>
          <Typography
            sx={{
              fontWeight: 500,
              fontSize: "16px",
              color: "rgba(106, 106, 106, 1)",
            }}
          >
            Industry
          </Typography>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "16px",
              color: "rgba(25, 25, 25, 1)",
            }}
          >
            {companyDetails?.industry || "---"}
          </Typography>
        </Box>

        {/* Company Size */}
        <Box>
          <Typography
            sx={{
              fontWeight: 500,
              fontSize: "16px",
              color: "rgba(106, 106, 106, 1)",
            }}
          >
            Company Size
          </Typography>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "16px",
              color: "rgba(25, 25, 25, 1)",
            }}
          >
            {companyDetails?.size || "---"}
          </Typography>
        </Box>

        {/* Location */}
        <Box>
          <Typography
            sx={{
              fontWeight: 500,
              fontSize: "16px",
              color: "rgba(106, 106, 106, 1)",
            }}
          >
            Location
          </Typography>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "16px",
              color: "rgba(25, 25, 25, 1)",
            }}
          >
            {companyDetails?.location || "---"}
          </Typography>
        </Box>

        {/* Website (if provided) */}
        {companyDetails?.website && (
          <Box>
            <Typography
              sx={{
                fontWeight: 500,
                fontSize: "16px",
                color: "rgba(106, 106, 106, 1)",
              }}
            >
              Website
            </Typography>
            <Typography
              component="a"
              href={companyDetails.website}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                fontWeight: 600,
                fontSize: "16px",
                color: "rgba(25, 25, 25, 1)",
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {companyDetails.website}
            </Typography>
          </Box>
        )}

        {/* LinkedIn (if provided) */}
        {companyDetails?.linkedin && (
          <Box>
            <Typography
              sx={{
                fontWeight: 500,
                fontSize: "16px",
                color: "rgba(106, 106, 106, 1)",
              }}
            >
              LinkedIn
            </Typography>
            <Typography
              component="a"
              href={companyDetails.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                fontWeight: 600,
                fontSize: "16px",
                color: "rgba(25, 25, 25, 1)",
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {companyDetails.linkedin}
            </Typography>
          </Box>
        )}

        {/* Skills (span full width) */}
        <Box sx={{ gridColumn: "1 / -1" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 1,
              mb: 1,
            }}
          >
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "16px",
                color: "rgba(84, 98, 116, 1)",
              }}
            >
              Skills You Need:
            </Typography>
            <Typography
              sx={{
                fontWeight: 500,
                fontSize: "16px",
                color: "rgba(136, 176, 211, 1)",
                wordBreak: "break-word",
              }}
            >
              {preferences.skills.length > 0
                ? preferences.skills.join(", ")
                : "---"}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CompanyReview;
