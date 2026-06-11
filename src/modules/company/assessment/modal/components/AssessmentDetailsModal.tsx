import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Avatar, Box, CircularProgress, Dialog, DialogContent,
  IconButton, Typography,
} from "@mui/material";
import AssessmentOutlined from "@mui/icons-material/AssessmentOutlined";
import CloseOutlined      from "@mui/icons-material/CloseOutlined";
import { usePostAssessmentQuery } from "../queries";
import { useAssessmentModal }     from "../hooks/useAssessmentModal";
import { AssessmentTarget }       from "../types";
import AssessmentHero  from "./AssessmentHero";
import ScoresTab       from "./ScoresTab";
import CoverageTab     from "./CoverageTab";
import AiReportTab     from "./AiReportTab";
import TranscriptTab   from "./TranscriptTab";

interface AssessmentDetailsModalProps {
  open:    boolean;
  target:  AssessmentTarget | null;
  onClose: () => void;
}

const PILL_BASE = {
  px: 1.75, py: 0.625, borderRadius: "99px", border: "none", cursor: "pointer",
  fontSize: "0.78rem", fontWeight: 600, transition: "all 0.15s ease",
  fontFamily: "inherit",
} as const;

const AssessmentDetailsModal: React.FC<AssessmentDetailsModalProps> = ({ open, target, onClose }) => {
  const { t } = useTranslation("dashboard");
  const [tab, setTab] = useState(0);

  useEffect(() => { setTab(0); }, [target?.postId, target?.candidateUserId]);

  const { data: assessment, isLoading, isError, error } = usePostAssessmentQuery(
    open ? (target?.postId ?? null) : null,
    open ? (target?.candidateUserId ?? null) : null,
  );

  const {
    name, email, letter, g1, g2,
    verdict, overallScore,
    verdictColor, verdictBg, verdictBorder, verdictLabel,
    scores, coverage,
    aiAssessment, requiredSkills, candidateProfile, conversation,
    hasAreas, hasAiData, hasTranscript,
    TAB_SCORES, TAB_COVERAGE, TAB_REPORT, TAB_TRANSCRIPT,
  } = useAssessmentModal(assessment, target);

  if (!target) return null;

  const tabs = [
    { idx: TAB_SCORES,    label: t("pages.applications.assessment_modal.tab_scores"),    show: true },
    { idx: TAB_COVERAGE,  label: t("pages.applications.assessment_modal.tab_coverage"),  show: hasAreas },
    { idx: TAB_REPORT,    label: t("pages.applications.assessment_modal.tab_ai_report"), show: hasAiData },
    { idx: TAB_TRANSCRIPT,label: "Transcript",                                           show: hasTranscript },
  ].filter(t => t.show && t.idx >= 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: "20px", overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.15)", maxHeight: "92vh", display: "flex", flexDirection: "column" } } }}
    >
      {/* Header */}
      <Box sx={{ px: 3, pt: 2.25, pb: 2, display: "flex", alignItems: "center", gap: 2, borderBottom: "1px solid #F3F4F6", flexShrink: 0, bgcolor: "#fff" }}>
        <Avatar src={target.avatarUrl} sx={{ width: 36, height: 36, bgcolor: target.bgColor, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
          {letter}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>{name}</Typography>
          <Typography sx={{ fontSize: "0.68rem", color: "#9CA3AF", mt: 0.125 }}>{t("pages.applications.assessment_modal.subtitle")}</Typography>
        </Box>
        <IconButton size="small" onClick={onClose}
          sx={{ color: "#9CA3AF", borderRadius: "8px", width: 30, height: 30, "&:hover": { bgcolor: "#F3F4F6", color: "#374151" } }}>
          <CloseOutlined sx={{ fontSize: 15 }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 0, py: 0, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Loading */}
        {isLoading && (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 10, gap: 2 }}>
            <CircularProgress size={32} thickness={3.5} sx={{ color: "#7C3AED" }} />
            <Typography sx={{ fontSize: "0.8rem", color: "#9CA3AF" }}>{t("pages.applications.assessment_modal.loading")}</Typography>
          </Box>
        )}

        {/* Error */}
        {!isLoading && isError && (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 10, gap: 1 }}>
            <AssessmentOutlined sx={{ fontSize: 40, color: "#E5E7EB" }} />
            <Typography sx={{ fontSize: "0.88rem", fontWeight: 600, color: "#374151" }}>{t("pages.applications.assessment_modal.not_found")}</Typography>
            <Typography sx={{ fontSize: "0.73rem", color: "#9CA3AF" }}>{error instanceof Error ? error.message : ""}</Typography>
          </Box>
        )}

        {/* Content */}
        {!isLoading && assessment && (
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>

            <AssessmentHero
              g1={g1} g2={g2} letter={letter} name={name} email={email}
              avatarUrl={target.avatarUrl} bgColor={target.bgColor}
              assessment={assessment} overallScore={overallScore}
              verdictColor={verdictColor} verdictBg={verdictBg} verdictBorder={verdictBorder} verdictLabel={verdictLabel}
            />

            {/* Pill tab bar */}
            <Box sx={{ px: 3, py: 1.5, display: "flex", gap: 0.5, borderBottom: "1px solid #F3F4F6", bgcolor: "#FAFAFA", flexShrink: 0 }}>
              {tabs.map(({ idx, label }) => (
                <Box
                  key={idx}
                  component="button"
                  onClick={() => setTab(idx)}
                  sx={{
                    ...PILL_BASE,
                    bgcolor: tab === idx ? "#fff" : "transparent",
                    color:   tab === idx ? "#111827" : "#9CA3AF",
                    boxShadow: tab === idx ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
                    "&:hover": tab !== idx ? { color: "#374151", bgcolor: "#F3F4F6" } : {},
                  }}
                >
                  {label}
                </Box>
              ))}
            </Box>

            {/* Tab panels */}
            {tab === TAB_SCORES && (
              <ScoresTab
                verdict={verdict} overallScore={overallScore}
                scores={scores} analytics={assessment.analytics}
                requiredSkills={requiredSkills} aiAssessment={aiAssessment}
                verdictColor={verdictColor} verdictBg={verdictBg} verdictBorder={verdictBorder} verdictLabel={verdictLabel}
                scoreOverallLabel={t("pages.applications.assessment_modal.score_overall")}
                scoreCoverageLabel={t("pages.applications.assessment_modal.score_coverage")}
                scoreBreakdownLabel={t("pages.applications.assessment_modal.score_breakdown")}
                strengthsLabel={t("pages.applications.assessment_modal.strengths")}
                weakAreasLabel={t("pages.applications.assessment_modal.weak_areas")}
              />
            )}

            {tab === TAB_COVERAGE && hasAreas && (
              <CoverageTab
                coverage={coverage}
                overallCoverageLabel={t("pages.applications.assessment_modal.overall_coverage")}
              />
            )}

            {tab === TAB_REPORT && hasAiData && (
              <AiReportTab
                aiAssessment={aiAssessment}
                candidateProfile={candidateProfile}
                aiSummaryTitle={t("pages.applications.assessment_modal.ai_summary_title")}
              />
            )}

            {tab === TAB_TRANSCRIPT && hasTranscript && (
              <TranscriptTab conversation={conversation} />
            )}

          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AssessmentDetailsModal;
