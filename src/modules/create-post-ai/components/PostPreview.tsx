import { useState } from "react";
import { Box } from "@mui/material";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { HardSkill, SoftSkill } from "../store/createPostSlice";
import { normalizeEmploymentType, normalizeWorkMode } from "@/utils/postFormI18n";
import SkillEditorModal from "./SkillEditorModal";
import PreviewHeader from "./post-preview/PreviewHeader";
import { LoadingState, EmptyState } from "./post-preview/EmptyState";
import DetailsSection from "./post-preview/DetailsSection";
import SkillsSection from "./post-preview/SkillsSection";
import ContentSection from "./post-preview/ContentSection";

const PostPreview = () => {
  const { t, i18n } = useTranslation("posts");
  const { generatedPost, generatedLanguage, loading } = useSelector((state: any) => state.postGeneration);

  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedSkill, setSelectedSkill] = useState<any | null>(null);
  const [selectedType, setSelectedType] = useState<"soft" | "hard">("hard");

  if (loading) return <LoadingState />;
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
