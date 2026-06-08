import React from "react";
import { Box, Typography, Chip, Divider } from "@mui/material";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutline";
import SchoolOutlined from "@mui/icons-material/SchoolOutlined";
import CodeOutlined from "@mui/icons-material/CodeOutlined";
import StarOutlineOutlined from "@mui/icons-material/StarOutlineOutlined";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import AppButton from "@/components/ui/AppButton";
import type { CandidateDerived } from "../types";
import AppCard from "./AppCard";
import SectionLabel from "./SectionLabel";
import { TEAL, TEAL_BORDER } from "./constants";

interface Props { derived: CandidateDerived }

const CvTab: React.FC<Props> = ({ derived }) => {
  const { cvUrl, experience, education, certifications, projects, softSkills } = derived;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {cvUrl ? (
        <AppCard sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <SectionLabel icon={<DescriptionOutlined sx={{ fontSize: 15, color: "#9CA3AF" }} />} title="Resume" />
            <AppButton
              label="Open PDF"
              variant="outlined"
              size="small"
              startIcon={<DownloadOutlined sx={{ fontSize: 14 }} />}
              onClick={() => window.open(cvUrl, "_blank")}
              sx={{ borderRadius: "8px", color: "#374151", borderColor: "#E5E7EB", boxShadow: "none", "&:hover": { bgcolor: "#F3F4F6", borderColor: "#D1D5DB" } }}
            />
          </Box>
          <Box sx={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #E5E7EB" }}>
            <iframe src={`${cvUrl}#toolbar=0`} width="100%" height="640" style={{ display: "block", border: "none" }} title="CV Preview" />
          </Box>
        </AppCard>
      ) : (
        <AppCard sx={{ p: 3, textAlign: "center", color: "#9CA3AF" }}>
          <DescriptionOutlined sx={{ fontSize: 36, mb: 1, opacity: 0.4 }} />
          <Typography sx={{ fontSize: "0.85rem" }}>No CV uploaded for this candidate.</Typography>
        </AppCard>
      )}

      {experience.length > 0 && (
        <AppCard sx={{ p: 3 }}>
          <SectionLabel icon={<WorkOutlineOutlined sx={{ fontSize: 15, color: "#9CA3AF" }} />} title="Experience" />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {experience.map((exp, j) => (
              <Box key={j}>
                {j > 0 && <Divider sx={{ mb: 2 }} />}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1 }}>
                  <Box>
                    <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#111827" }}>{exp.title || exp.role || exp.position || "—"}</Typography>
                    <Typography sx={{ fontSize: "0.82rem", color: "#6B7280" }}>{exp.company}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: "0.75rem", color: "#9CA3AF", whiteSpace: "nowrap" }}>
                    {exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : " – Present"}{exp.duration ? ` (${exp.duration})` : ""}
                  </Typography>
                </Box>
                {exp.description && (
                  <Typography sx={{ fontSize: "0.8rem", color: "#4B5563", mt: 0.75, lineHeight: 1.65 }}>{exp.description}</Typography>
                )}
              </Box>
            ))}
          </Box>
        </AppCard>
      )}

      {education.length > 0 && (
        <AppCard sx={{ p: 3 }}>
          <SectionLabel icon={<SchoolOutlined sx={{ fontSize: 15, color: "#9CA3AF" }} />} title="Education" />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {education.map((edu, j) => (
              <Box key={j}>
                {j > 0 && <Divider sx={{ mb: 1.5 }} />}
                <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                  <Box>
                    <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#111827" }}>{edu.degree}</Typography>
                    <Typography sx={{ fontSize: "0.82rem", color: "#6B7280" }}>{edu.institution}{edu.field ? ` · ${edu.field}` : ""}</Typography>
                  </Box>
                  {edu.year && <Typography sx={{ fontSize: "0.75rem", color: "#9CA3AF" }}>{edu.year}</Typography>}
                </Box>
              </Box>
            ))}
          </Box>
        </AppCard>
      )}

      {certifications.length > 0 && (
        <AppCard sx={{ p: 3 }}>
          <SectionLabel icon={<StarOutlineOutlined sx={{ fontSize: 15, color: "#9CA3AF" }} />} title="Certifications" />
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            {certifications.map((c) => (
              <Chip key={c} label={c} size="small"
                sx={{ height: 24, fontSize: "0.75rem", fontWeight: 500, bgcolor: "#EFF6FF", color: "#2563EB", borderRadius: "7px", border: "1px solid #BFDBFE" }} />
            ))}
          </Box>
        </AppCard>
      )}

      {projects.length > 0 && (
        <AppCard sx={{ p: 3 }}>
          <SectionLabel icon={<CodeOutlined sx={{ fontSize: 15, color: "#9CA3AF" }} />} title="Projects" />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {projects.map((proj, j) => (
              <Box key={j}>
                {j > 0 && <Divider sx={{ mb: 2 }} />}
                <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: "#111827", mb: 0.5 }}>{proj.name}</Typography>
                {proj.description && <Typography sx={{ fontSize: "0.8rem", color: "#4B5563", lineHeight: 1.65, mb: 0.75 }}>{proj.description}</Typography>}
                {proj.technologies && proj.technologies.length > 0 && (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {proj.technologies.map((t) => (
                      <Chip key={t} label={t} size="small"
                        sx={{ height: 20, fontSize: "0.7rem", bgcolor: "#F5F3FF", color: "#6D28D9", borderRadius: "6px", border: "1px solid #DDD6FE" }} />
                    ))}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </AppCard>
      )}

      {softSkills.length > 0 && (
        <AppCard sx={{ p: 3 }}>
          <SectionLabel icon={<PersonOutlined sx={{ fontSize: 15, color: "#9CA3AF" }} />} title="Soft Skills" />
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            {softSkills.map((s) => (
              <Chip
                key={s.name}
                label={s.name}
                size="small"
                sx={{ height: 24, fontSize: "0.75rem", fontWeight: 500, bgcolor: "#F0FDFA", color: TEAL, borderRadius: "7px", border: `1px solid ${TEAL_BORDER}` }}
              />
            ))}
          </Box>
        </AppCard>
      )}
    </Box>
  );
};

export default CvTab;
