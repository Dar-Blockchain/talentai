import { useState } from "react";
import { Box, Slider, Typography } from "@mui/material";
import { TrackChangesOutlined } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { HardSkill, SoftSkill, setThresholdScore } from "../store/createPostSlice";
import { normalizeEmploymentType, normalizeWorkMode } from "../utils";
import SkillEditorModal from "./SkillEditorModal";
import PreviewHeader from "./post-preview/PreviewHeader";
import { LoadingState, EmptyState } from "./post-preview/EmptyState";
import DetailsSection from "./post-preview/DetailsSection";
import SkillsSection from "./post-preview/SkillsSection";
import ContentSection from "./post-preview/ContentSection";
import SectionCard from "@/components/ui/SectionCard";

interface PostPreviewProps {
  generating?: boolean;
}

const PostPreview = ({ generating = false }: PostPreviewProps) => {
  const { t, i18n } = useTranslation("posts");
  const dispatch = useDispatch();
  const { generatedPost, generatedLanguage, thresholdScore } = useSelector((state: any) => state.postGeneration);

  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedSkill, setSelectedSkill] = useState<any | null>(null);
  const [selectedType, setSelectedType] = useState<"soft" | "hard">("hard");

  if (generating) return <LoadingState />;
  if (!generatedPost) return <EmptyState />;

  const {
    title = "", description = "", experienceLevel = "",
    employmentType = "", workMode = "",
    salary = { min: "", max: "", currency: "USD" },
    requirements = [], responsibilities = [],
  } = generatedPost.jobDetails ?? {};

  const hardSkills: HardSkill[] = generatedPost.skillAnalysis?.requiredSkills || [];
  const softSkills: SoftSkill[] = generatedPost.skillAnalysis?.softSkills || [];
  const labelLanguage = generatedLanguage === "fr" ? "fr" : i18n.language;
  const labelT = i18n.getFixedT(labelLanguage, "posts");

  const handleEdit = (skill: any, index: number, type: "hard" | "soft") => {
    setSelectedSkill(skill); setSelectedIndex(index); setSelectedType(type); setOpen(true);
  };
  const handleAdd = (type: "hard" | "soft") => {
    setSelectedSkill(null); setSelectedIndex(-1); setSelectedType(type); setOpen(true);
  };

  return (
    <Box sx={{ height: "100%", overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
      <PreviewHeader />

      <DetailsSection
        title={title}
        employmentType={normalizeEmploymentType(employmentType)}
        workMode={normalizeWorkMode(workMode)}
        experienceLevel={experienceLevel}
        salary={salary}
        labelT={labelT}
      />

      <SkillsSection
        hardSkills={hardSkills}
        softSkills={softSkills}
        onEdit={handleEdit}
        onAdd={handleAdd}
      />

      <SectionCard>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <TrackChangesOutlined sx={{ fontSize: 16, color: "#0D9488" }} />
          <Typography variant="subtitle2" sx={{ color: "rgba(84, 98, 116, 1)", fontSize: "16px", fontWeight: 600 }}>
            Threshold Score
          </Typography>
        </Box>
        <Typography sx={{ fontSize: "12px", color: "rgba(84, 98, 116, 0.7)", mb: 2 }}>
          Candidates scoring below this threshold are automatically flagged for review.
        </Typography>
        {(() => {
          const color = thresholdScore >= 70 ? "#16A34A" : thresholdScore >= 40 ? "#D97706" : "#DC2626";
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Slider
                  value={thresholdScore}
                  onChange={(_, v) => dispatch(setThresholdScore(v as number))}
                  min={0}
                  max={100}
                  step={5}
                  marks={[{ value: 0, label: "0%" }, { value: 50, label: "50%" }, { value: 100, label: "100%" }]}
                  sx={{
                    color,
                    "& .MuiSlider-thumb": { width: 18, height: 18 },
                    "& .MuiSlider-markLabel": { fontSize: "11px", color: "#9CA3AF" },
                  }}
                />
              </Box>
              <Box sx={{ minWidth: 52, textAlign: "center", bgcolor: `${color}15`, border: `1px solid ${color}40`, borderRadius: 2, px: 1.5, py: 0.75 }}>
                <Typography sx={{ fontSize: "16px", fontWeight: 800, color }}>{thresholdScore}%</Typography>
              </Box>
            </Box>
          );
        })()}
      </SectionCard>

      <ContentSection
        description={description}
        requirements={requirements}
        responsibilities={responsibilities}
      />

      {open && (
        <SkillEditorModal
          open={open}
          mode={selectedSkill ? "edit" : "add"}
          skill={selectedSkill}
          index={selectedIndex}
          skillType={selectedType}
          onClose={() => { setOpen(false); setSelectedSkill(null); }}
        />
      )}
    </Box>
  );
};

export default PostPreview;
