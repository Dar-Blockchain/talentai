import { useState } from "react";
import { Slider } from "@/modules/shared/ui/shadcn/slider";
import { Target as TrackChangesOutlined } from "lucide-react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import type { RootState } from "@/store/store";
import { useTranslation } from "react-i18next";
import { HardSkill, SoftSkill, setThresholdScore } from "../store/createPostSlice";
import { normalizeEmploymentType, normalizeWorkMode } from "../utils";
import SkillEditorModal from "./SkillEditorModal";
import PreviewHeader from "./post-preview/PreviewHeader";
import { LoadingState, EmptyState } from "./post-preview/EmptyState";
import DetailsSection from "./post-preview/DetailsSection";
import SkillsSection from "./post-preview/SkillsSection";
import ContentSection from "./post-preview/ContentSection";
import { Card } from "@/modules/shared/ui/shadcn/card";

interface PostPreviewProps {
  generating?: boolean;
}

const THRESHOLD_MARKS = [
  { value: 0, label: "0%" },
  { value: 50, label: "50%" },
  { value: 100, label: "100%" },
];

const PostPreview = ({ generating = false }: PostPreviewProps) => {
  const { i18n } = useTranslation("posts");
  const dispatch = useDispatch();
  const { generatedPost, generatedLanguage, thresholdScore } = useSelector((state: RootState) => state.postGeneration, shallowEqual);

  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedSkill, setSelectedSkill] = useState<{ name: string; level: number; percentage: number } | null>(null);
  const [selectedType, setSelectedType] = useState<"soft" | "hard">("hard");

  if (generating) return <LoadingState />;
  if (!generatedPost) return <EmptyState />;

  const {
    title = "", description = "", experienceLevel = "",
    employmentType = "", workMode = "", department = "",
    salary = { min: "", max: "", currency: "USD" },
    requirements = [], responsibilities = [],
  } = generatedPost.jobDetails ?? {};

  const hardSkills: HardSkill[] = generatedPost.skillAnalysis?.requiredSkills || [];
  const softSkills: SoftSkill[] = generatedPost.skillAnalysis?.softSkills || [];
  const labelLanguage = generatedLanguage === "fr" ? "fr" : i18n.language;
  const labelT = i18n.getFixedT(labelLanguage, "posts");
  const sliderColor = thresholdScore >= 70 ? "#16A34A" : thresholdScore >= 40 ? "#D97706" : "#DC2626";

  const handleEdit = (skill: { name: string; level: number; percentage: number }, index: number, type: "hard" | "soft") => {
    setSelectedSkill(skill); setSelectedIndex(index); setSelectedType(type); setOpen(true);
  };
  const handleAdd = (type: "hard" | "soft") => {
    setSelectedSkill(null); setSelectedIndex(-1); setSelectedType(type); setOpen(true);
  };

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto">
      <PreviewHeader />

      <DetailsSection
        title={title}
        employmentType={normalizeEmploymentType(employmentType)}
        workMode={normalizeWorkMode(workMode)}
        department={department}
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

      <Card className="p-6 gap-0">
        <div className="mb-2 flex items-center gap-2">
          <TrackChangesOutlined size={16} color="#0D9488" />
          <p className="text-[16px] font-semibold" style={{ color: "rgba(84, 98, 116, 1)" }}>
            Threshold Score
          </p>
        </div>
        <p className="mb-4 text-xs" style={{ color: "rgba(84, 98, 116, 0.7)" }}>
          Candidates scoring below this threshold are automatically flagged for review.
        </p>
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <Slider
              value={[thresholdScore]}
              onValueChange={(v) => dispatch(setThresholdScore(v[0]))}
              min={0} max={100} step={5}
              aria-label="Threshold score"
              aria-valuetext={`${thresholdScore}%`}
              className="[&_[data-slot=slider-range]]:bg-[var(--threshold-color)] [&_[data-slot=slider-thumb]]:border-[var(--threshold-color)] [&_[data-slot=slider-thumb]]:size-[18px]"
              style={{ ["--threshold-color" as string]: sliderColor }}
            />
            <div className="mt-1.5 flex justify-between text-[11px] text-[#9CA3AF]">
              {THRESHOLD_MARKS.map((m) => <span key={m.value}>{m.label}</span>)}
            </div>
          </div>
          <div
            className="min-w-[52px] rounded-lg px-3 py-1.5 text-center"
            style={{ background: `${sliderColor}15`, border: `1px solid ${sliderColor}40` }}
          >
            <p className="text-[16px] font-extrabold" style={{ color: sliderColor }}>{thresholdScore}%</p>
          </div>
        </div>
      </Card>

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
    </div>
  );
};

export default PostPreview;
