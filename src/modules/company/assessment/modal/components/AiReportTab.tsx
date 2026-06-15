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

// ── Config-driven bullet sections ──────────────────────────────────────────────

interface BulletSectionConfig {
  key:      keyof NonNullable<PostAssessmentData["aiAssessment"]>;
  title:    string;
  iconBg:   string;
  iconColor: string;
  cardBg:   string;
  cardBorder: string;
  textColor: string;
  Icon:     React.ComponentType<{ sx?: object }>;
}

const BULLET_SECTIONS: BulletSectionConfig[] = [
  {
    key: "strengths", title: "Strengths",
    iconBg: "#ECFDF5", iconColor: "#10B981",
    cardBg: "#F0FDF4", cardBorder: "#D1FAE5", textColor: "#064E3B",
    Icon: CheckCircleOutlined,
  },
  {
    key: "weaknesses", title: "Areas for Growth",
    iconBg: "#FFFBEB", iconColor: "#D97706",
    cardBg: "#FFFBEB", cardBorder: "#FDE68A", textColor: "#78350F",
    Icon: LightbulbOutlined,
  },
  {
    key: "keyDecisionFactors", title: "Key Decision Factors",
    iconBg: "#ECFDF5", iconColor: "#059669",
    cardBg: "#F0FDF4", cardBorder: "#D1FAE5", textColor: "#064E3B",
    Icon: KeyOutlined,
  },
  {
    key: "hiringRisks", title: "Hiring Risks",
    iconBg: "#FEF2F2", iconColor: "#DC2626",
    cardBg: "#FEF2F2", cardBorder: "#FECACA", textColor: "#7F1D1D",
    Icon: ReportProblemOutlined,
  },
  {
    key: "developmentAreas", title: "Development Areas",
    iconBg: "#F5F3FF", iconColor: "#7C3AED",
    cardBg: "#F5F3FF", cardBorder: "#DDD6FE", textColor: "#4C1D95",
    Icon: SchoolOutlined,
  },
];

// ── CandidateProfileSection ────────────────────────────────────────────────────

const CandidateProfileSection: React.FC<{ profile: NonNullable<PostAssessmentData["candidateProfile"]> }> = ({ profile }) => (
  <SectionBlock icon={<PersonOutlined sx={{ fontSize: 15 }} />} iconBg="#EFF6FF" iconColor="#3B82F6" title="Candidate Profile">
    <Box sx={{ borderRadius: "12px", bgcolor: "#F8FAFC", border: "1px solid #E9ECEF", p: 2.25, display: "flex", flexDirection: "column", gap: 1.5 }}>
      {(profile.communicationStyle?.verbosity || profile.communicationStyle?.confidenceLevel) && (
        <ProfileRow label="Communication">
          {profile.communicationStyle?.verbosity && (
            <Chip label={profile.communicationStyle.verbosity} size="small"
              sx={{ height: 20, fontSize: "0.7rem", fontWeight: 600, bgcolor: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }} />
          )}
          {profile.communicationStyle?.confidenceLevel && (
            <Chip label={profile.communicationStyle.confidenceLevel} size="small"
              sx={{ height: 20, fontSize: "0.7rem", fontWeight: 600, bgcolor: "#F5F3FF", color: "#6D28D9", border: "1px solid #DDD6FE" }} />
          )}
        </ProfileRow>
      )}
      {(profile.revealedExpertise?.length ?? 0) > 0 && (
        <ProfileRow label="Expertise">
          {profile.revealedExpertise!.slice(0, 6).map((e, i) => (
            <Chip key={i} label={e} size="small"
              sx={{ height: 20, fontSize: "0.7rem", fontWeight: 600, bgcolor: TEAL_BG, color: TEAL, border: `1px solid ${TEAL_BORDER}` }} />
          ))}
        </ProfileRow>
      )}
      {(profile.revealedGaps?.length ?? 0) > 0 && (
        <ProfileRow label="Gaps">
          {profile.revealedGaps!.slice(0, 6).map((g, i) => (
            <Chip key={i} label={g} size="small"
              sx={{ height: 20, fontSize: "0.7rem", fontWeight: 600, bgcolor: "#FFFBEB", color: "#D97706", border: "1px solid #FDE68A" }} />
          ))}
        </ProfileRow>
      )}
      {profile.difficultyLevel && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <ProfileLabel>Difficulty</ProfileLabel>
          <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", textTransform: "capitalize" }}>
            {profile.difficultyLevel}
          </Typography>
        </Box>
      )}
    </Box>
  </SectionBlock>
);

const ProfileLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", minWidth: 90 }}>
    {children}
  </Typography>
);

const ProfileRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
    <ProfileLabel>{label}</ProfileLabel>
    <Box sx={{ display: "flex", gap: 0.625, flexWrap: "wrap", pt: 0.25 }}>{children}</Box>
  </Box>
);

// ── Main component ─────────────────────────────────────────────────────────────

const AiReportTab: React.FC<Props> = ({ aiAssessment, candidateProfile, aiSummaryTitle }) => (
  <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>

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

    {BULLET_SECTIONS.map(({ key, title, iconBg, iconColor, cardBg, cardBorder, textColor, Icon }) => {
      const items = aiAssessment?.[key] as string[] | undefined;
      if (!items?.length) return null;
      return (
        <SectionBlock key={key} icon={<Icon sx={{ fontSize: 15 }} />} iconBg={iconBg} iconColor={iconColor} title={title}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            {items.map((text, i) => (
              <BulletCard key={i} icon={<Icon sx={{ fontSize: 14 }} />}
                text={text} bg={cardBg} border={cardBorder} iconColor={iconColor} textColor={textColor} />
            ))}
          </Box>
        </SectionBlock>
      );
    })}

    {candidateProfile && <CandidateProfileSection profile={candidateProfile} />}

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
