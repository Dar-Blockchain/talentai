import React from "react";
import { Box, Chip, Divider, Typography } from "@mui/material";
import CheckCircleOutlined   from "@mui/icons-material/CheckCircleOutlined";
import KeyOutlined           from "@mui/icons-material/KeyOutlined";
import LightbulbOutlined     from "@mui/icons-material/LightbulbOutlined";
import PersonOutlined        from "@mui/icons-material/PersonOutlined";
import ReportProblemOutlined from "@mui/icons-material/ReportProblemOutlined";
import SchoolOutlined        from "@mui/icons-material/SchoolOutlined";
import TrendingUpOutlined    from "@mui/icons-material/TrendingUpOutlined";
import { PostAssessmentData } from "../types";
import { BulletCard, SectionBlock, TEAL, TEAL_BG, TEAL_BORDER } from "./assessmentAtoms";

interface Props {
  aiAssessment:     PostAssessmentData["aiAssessment"] | undefined;
  candidateProfile: PostAssessmentData["candidateProfile"];
  aiSummaryTitle:   string;
}

const AiReportTab: React.FC<Props> = ({ aiAssessment, candidateProfile, aiSummaryTitle }) => (
  <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>

    {/* Summary */}
    {aiAssessment?.summary && (
      <Box sx={{ pl: 2.5, borderLeft: "3px solid #10B981" }}>
        <Typography sx={{ fontSize: "0.63rem", fontWeight: 700, color: "#10B981", textTransform: "uppercase", letterSpacing: "0.09em", mb: 0.875 }}>
          {aiSummaryTitle}
        </Typography>
        <Typography sx={{ fontSize: "0.85rem", color: "#374151", lineHeight: 1.85, fontStyle: "italic" }}>
          {aiAssessment.summary}
        </Typography>
      </Box>
    )}

    {aiAssessment?.summary && <Divider sx={{ borderColor: "#F3F4F6" }} />}

    {/* Strengths */}
    {(aiAssessment?.strengths?.length ?? 0) > 0 && (
      <SectionBlock icon={<CheckCircleOutlined sx={{ fontSize: 15 }} />} iconBg="#ECFDF5" iconColor="#10B981" title="Strengths">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
          {aiAssessment!.strengths.map((s, i) => (
            <BulletCard key={i} icon={<CheckCircleOutlined sx={{ fontSize: 14 }} />}
              text={s} bg="#F0FDF4" border="#D1FAE5" iconColor="#10B981" textColor="#064E3B" />
          ))}
        </Box>
      </SectionBlock>
    )}

    {/* Areas for Growth */}
    {(aiAssessment?.weaknesses?.length ?? 0) > 0 && (
      <SectionBlock icon={<LightbulbOutlined sx={{ fontSize: 15 }} />} iconBg="#FFFBEB" iconColor="#D97706" title="Areas for Growth">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
          {aiAssessment!.weaknesses.map((w, i) => (
            <BulletCard key={i} icon={<LightbulbOutlined sx={{ fontSize: 14 }} />}
              text={w} bg="#FFFBEB" border="#FDE68A" iconColor="#D97706" textColor="#78350F" />
          ))}
        </Box>
      </SectionBlock>
    )}

    {/* Key Decision Factors */}
    {(aiAssessment?.keyDecisionFactors?.length ?? 0) > 0 && (
      <SectionBlock icon={<KeyOutlined sx={{ fontSize: 15 }} />} iconBg="#ECFDF5" iconColor="#059669" title="Key Decision Factors">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
          {aiAssessment!.keyDecisionFactors.map((f, i) => (
            <BulletCard key={i} icon={<KeyOutlined sx={{ fontSize: 14 }} />}
              text={f} bg="#F0FDF4" border="#D1FAE5" iconColor="#059669" textColor="#064E3B" />
          ))}
        </Box>
      </SectionBlock>
    )}

    {/* Hiring Risks */}
    {(aiAssessment?.hiringRisks?.length ?? 0) > 0 && (
      <SectionBlock icon={<ReportProblemOutlined sx={{ fontSize: 15 }} />} iconBg="#FEF2F2" iconColor="#DC2626" title="Hiring Risks">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
          {aiAssessment!.hiringRisks.map((r, i) => (
            <BulletCard key={i} icon={<ReportProblemOutlined sx={{ fontSize: 14 }} />}
              text={r} bg="#FEF2F2" border="#FECACA" iconColor="#DC2626" textColor="#7F1D1D" />
          ))}
        </Box>
      </SectionBlock>
    )}

    {/* Development Areas */}
    {(aiAssessment?.developmentAreas?.length ?? 0) > 0 && (
      <SectionBlock icon={<SchoolOutlined sx={{ fontSize: 15 }} />} iconBg="#F5F3FF" iconColor="#7C3AED" title="Development Areas">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
          {aiAssessment!.developmentAreas.map((d, i) => (
            <BulletCard key={i} icon={<SchoolOutlined sx={{ fontSize: 14 }} />}
              text={d} bg="#F5F3FF" border="#DDD6FE" iconColor="#7C3AED" textColor="#4C1D95" />
          ))}
        </Box>
      </SectionBlock>
    )}

    {/* Candidate Profile */}
    {candidateProfile && (
      <SectionBlock icon={<PersonOutlined sx={{ fontSize: 15 }} />} iconBg="#EFF6FF" iconColor="#3B82F6" title="Candidate Profile">
        <Box sx={{ borderRadius: "12px", bgcolor: "#F8FAFC", border: "1px solid #E9ECEF", p: 2.25, display: "flex", flexDirection: "column", gap: 1.5 }}>
          {(candidateProfile.communicationStyle?.verbosity || candidateProfile.communicationStyle?.confidenceLevel) && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", minWidth: 90 }}>
                Communication
              </Typography>
              <Box sx={{ display: "flex", gap: 0.625, flexWrap: "wrap" }}>
                {candidateProfile.communicationStyle?.verbosity && (
                  <Chip label={candidateProfile.communicationStyle.verbosity} size="small"
                    sx={{ height: 20, fontSize: "0.7rem", fontWeight: 600, bgcolor: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }} />
                )}
                {candidateProfile.communicationStyle?.confidenceLevel && (
                  <Chip label={candidateProfile.communicationStyle.confidenceLevel} size="small"
                    sx={{ height: 20, fontSize: "0.7rem", fontWeight: 600, bgcolor: "#F5F3FF", color: "#6D28D9", border: "1px solid #DDD6FE" }} />
                )}
              </Box>
            </Box>
          )}
          {(candidateProfile.revealedExpertise?.length ?? 0) > 0 && (
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", minWidth: 90, pt: 0.25 }}>
                Expertise
              </Typography>
              <Box sx={{ display: "flex", gap: 0.625, flexWrap: "wrap" }}>
                {candidateProfile.revealedExpertise!.slice(0, 6).map((e, i) => (
                  <Chip key={i} label={e} size="small"
                    sx={{ height: 20, fontSize: "0.7rem", fontWeight: 600, bgcolor: TEAL_BG, color: TEAL, border: `1px solid ${TEAL_BORDER}` }} />
                ))}
              </Box>
            </Box>
          )}
          {(candidateProfile.revealedGaps?.length ?? 0) > 0 && (
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", minWidth: 90, pt: 0.25 }}>
                Gaps
              </Typography>
              <Box sx={{ display: "flex", gap: 0.625, flexWrap: "wrap" }}>
                {candidateProfile.revealedGaps!.slice(0, 6).map((g, i) => (
                  <Chip key={i} label={g} size="small"
                    sx={{ height: 20, fontSize: "0.7rem", fontWeight: 600, bgcolor: "#FFFBEB", color: "#D97706", border: "1px solid #FDE68A" }} />
                ))}
              </Box>
            </Box>
          )}
          {candidateProfile.difficultyLevel && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", minWidth: 90 }}>
                Difficulty
              </Typography>
              <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", textTransform: "capitalize" }}>
                {candidateProfile.difficultyLevel}
              </Typography>
            </Box>
          )}
        </Box>
      </SectionBlock>
    )}

    {/* Recommended Focus */}
    {(aiAssessment?.recommendedFocus?.length ?? 0) > 0 && (
      <SectionBlock icon={<TrendingUpOutlined sx={{ fontSize: 15 }} />} iconBg="#FFFBEB" iconColor="#D97706" title="Recommended Focus">
        <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
          {aiAssessment!.recommendedFocus.map((f, i) => (
            <Chip key={i} label={f.replace(/_/g, " ")} size="small"
              sx={{ height: 24, fontSize: "0.73rem", fontWeight: 600, bgcolor: "#FFFBEB", color: "#D97706", border: "1px solid #FDE68A", textTransform: "capitalize" }} />
          ))}
        </Box>
      </SectionBlock>
    )}
  </Box>
);

export default AiReportTab;
