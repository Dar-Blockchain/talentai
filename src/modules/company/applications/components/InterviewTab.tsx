import React from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import TrendingUpOutlined from "@mui/icons-material/TrendingUpOutlined";
import LightbulbOutlined from "@mui/icons-material/LightbulbOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import ChatBubbleOutlineOutlined from "@mui/icons-material/ChatBubbleOutlineOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import type { CandidateDerived } from "../types";
import AppCard from "./AppCard";
import SectionLabel from "./SectionLabel";
import ScoreRing from "./ScoreRing";
import { scoreColor, fmtDuration } from "./constants";

interface Props { derived: CandidateDerived }

const InterviewTab: React.FC<Props> = ({ derived }) => {
  const { interviewScore, interviewAnalytics, finalReport, coverageAreas, hasCoverage, hasReport } = derived;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {interviewScore != null && (
        <AppCard sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
            <ScoreRing value={interviewScore} size={96} />
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: "1.1rem", fontWeight: 800, color: scoreColor(interviewScore), mb: 0.4 }}>
                {interviewScore >= 70 ? "Passed" : interviewScore >= 50 ? "In Review" : "Needs Work"}
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 1 }}>
                {interviewAnalytics.duration !== undefined && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <AccessTimeOutlined sx={{ fontSize: 14, color: "#9CA3AF" }} />
                    <Typography sx={{ fontSize: "0.78rem", color: "#6B7280" }}>
                      Duration: <strong style={{ color: "#374151" }}>{fmtDuration(interviewAnalytics.duration)}</strong>
                    </Typography>
                  </Box>
                )}
                {interviewAnalytics.messageCount !== undefined && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <ChatBubbleOutlineOutlined sx={{ fontSize: 14, color: "#9CA3AF" }} />
                    <Typography sx={{ fontSize: "0.78rem", color: "#6B7280" }}>
                      Responses: <strong style={{ color: "#374151" }}>{interviewAnalytics.messageCount}</strong>
                    </Typography>
                  </Box>
                )}
                {interviewAnalytics.coveragePercentage !== undefined && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <TrendingUpOutlined sx={{ fontSize: 14, color: "#9CA3AF" }} />
                    <Typography sx={{ fontSize: "0.78rem", color: "#6B7280" }}>
                      Coverage: <strong style={{ color: "#374151" }}>{interviewAnalytics.coveragePercentage}%</strong>
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </AppCard>
      )}

      {hasCoverage && (
        <AppCard sx={{ p: 3 }}>
          <SectionLabel icon={<TrendingUpOutlined sx={{ fontSize: 15, color: "#9CA3AF" }} />} title="Topic Coverage" />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {Object.entries(coverageAreas).map(([area, data]) => {
              const pct   = data.percentage ?? 0;
              const color = scoreColor(pct);
              return (
                <Box key={area}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75, alignItems: "center" }}>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", textTransform: "capitalize" }}>
                      {area.replace(/_/g, " ")}
                    </Typography>
                    <Typography sx={{ fontSize: "0.82rem", fontWeight: 800, color, ml: 2 }}>{pct}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={Math.min(pct, 100)}
                    sx={{ height: 7, borderRadius: 4, bgcolor: `${color}18`, "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 4 } }} />
                  {data.indicators && data.indicators.length > 0 && (
                    <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.4 }}>
                      {data.indicators.slice(0, 4).map((ind) => (
                        <Box key={ind.name} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, bgcolor: ind.covered ? "#10B981" : "#EF4444" }} />
                          <Typography sx={{ fontSize: "0.72rem", color: "#6B7280" }}>{ind.evidence?.[0] || ind.name}</Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </AppCard>
      )}

      {hasReport && (
        <AppCard sx={{ p: 3 }}>
          <SectionLabel icon={<LightbulbOutlined sx={{ fontSize: 15, color: "#9CA3AF" }} />} title="AI Report" />
          {finalReport.summary && (
            <Box sx={{ p: 2.5, borderRadius: "12px", bgcolor: "#F0FDF4", border: "1px solid #D1FAE5", mb: 2 }}>
              <Typography sx={{ fontSize: "0.85rem", color: "#374151", lineHeight: 1.8 }}>{finalReport.summary}</Typography>
            </Box>
          )}
          {(finalReport.recommendations ?? []).length > 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {finalReport.recommendations!.map((rec, i) => (
                <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, p: 1.5, borderRadius: "10px", bgcolor: "#FFFBEB", border: "1px solid #FDE68A" }}>
                  <CheckCircleOutlined sx={{ color: "#F59E0B", fontSize: 16, mt: 0.15, flexShrink: 0 }} />
                  <Typography sx={{ fontSize: "0.82rem", color: "#92400E", lineHeight: 1.65, textTransform: "capitalize" }}>{rec}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </AppCard>
      )}
    </Box>
  );
};

export default InterviewTab;
