import React from "react";
import { Box, Divider, Typography } from "@mui/material";
import { PostAssessmentData } from "../../types";

interface Props {
  aiAssessment:   PostAssessmentData["aiAssessment"] | undefined;
  strengthsLabel: string;
  weakAreasLabel: string;
}

const StrengthsWeaknessesSection: React.FC<Props> = ({ aiAssessment, strengthsLabel, weakAreasLabel }) => {
  const hasStrong = (aiAssessment?.strongestAreas?.length ?? 0) > 0;
  const hasWeak   = (aiAssessment?.weakestAreas?.length ?? 0) > 0;
  if (!hasStrong && !hasWeak) return null;
  return (
    <>
      <Divider sx={{ borderColor: "#F3F4F6" }} />
      <Box sx={{ display: "flex", gap: 1.5 }}>
        {hasStrong && (
          <Box sx={{ flex: 1, bgcolor: "#F0FDF4", borderRadius: "14px", border: "1px solid #BBF7D0", p: 2 }}>
            <Typography sx={{ fontSize: "0.63rem", fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.07em", mb: 1 }}>
              {strengthsLabel}
            </Typography>
            {aiAssessment!.strongestAreas.map((a, i) => (
              <Typography key={i} sx={{ fontSize: "0.8rem", color: "#065F46", textTransform: "capitalize", lineHeight: 1.8 }}>
                · {a.replace(/_/g, " ")}
              </Typography>
            ))}
          </Box>
        )}
        {hasWeak && (
          <Box sx={{ flex: 1, bgcolor: "#FFF7ED", borderRadius: "14px", border: "1px solid #FED7AA", p: 2 }}>
            <Typography sx={{ fontSize: "0.63rem", fontWeight: 700, color: "#D97706", textTransform: "uppercase", letterSpacing: "0.07em", mb: 1 }}>
              {weakAreasLabel}
            </Typography>
            {aiAssessment!.weakestAreas.map((a, i) => (
              <Typography key={i} sx={{ fontSize: "0.8rem", color: "#92400E", textTransform: "capitalize", lineHeight: 1.8 }}>
                · {a.replace(/_/g, " ")}
              </Typography>
            ))}
          </Box>
        )}
      </Box>
    </>
  );
};

export default StrengthsWeaknessesSection;
