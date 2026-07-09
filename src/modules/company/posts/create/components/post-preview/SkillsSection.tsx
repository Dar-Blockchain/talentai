import { Info as InfoOutlined } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { HardSkill, SoftSkill, deleteHardSkill, deleteSoftSkill } from "../../store/createPostSlice";
import { hardSkillLevelLabel, softSkillLevelLabel } from "../../utils";
import { Card } from "@/modules/shared/ui/shadcn/card";
import SkillChip from "./SkillChip";
import AddSkillButton from "./AddSkillButton";

interface EditableSkill {
  name: string;
  level: number;
  percentage: number;
}

interface Props {
  hardSkills: HardSkill[];
  softSkills: SoftSkill[];
  onEdit: (skill: EditableSkill, index: number, type: "hard" | "soft") => void;
  onAdd: (type: "hard" | "soft") => void;
}

const SkillsSection = ({ hardSkills, softSkills, onEdit, onAdd }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation("posts");

  return (
    <Card className="p-6 gap-0">
      <p className="mb-3 text-[13px] font-bold text-[#111827]">{t("create.preview.section_skills")}</p>

      <div className="mb-4 flex gap-2 rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] p-3">
        <InfoOutlined size={16} color="#3B82F6" className="shrink-0 mt-px" />
        <p className="text-xs leading-relaxed text-[#1E40AF]">
          <Trans i18nKey="create.preview.skills_info" ns="posts" components={{ bold: <b /> }} />
        </p>
      </div>

      <div className="mb-4">
        <p className="mb-2 text-xs font-bold text-[#374151]">{t("create.preview.hard_skills")}</p>
        <div className="flex flex-wrap gap-2">
          {hardSkills.map((skill, index) => (
            <SkillChip
              key={`hard-${skill.name}-${index}`}
              label={`${skill.name} (${hardSkillLevelLabel(t, Number(skill.level))}) · ${skill.percentage}%`}
              onDelete={() => dispatch(deleteHardSkill(index))}
              onClick={() => onEdit({ name: skill.name, level: skill.level, percentage: skill.percentage }, index, "hard")}
            />
          ))}
          <AddSkillButton skillType="hard" onClick={() => onAdd("hard")} />
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold text-[#374151]">{t("create.preview.soft_skills")}</p>
        <div className="flex flex-wrap gap-2">
          {softSkills.map((skill, index) => (
            <SkillChip
              key={`soft-${skill.name}-${index}`}
              label={`${skill.name} (${softSkillLevelLabel(t, Number(skill.level))}) · ${skill.percentage}%`}
              onDelete={softSkills.length > 1 ? () => dispatch(deleteSoftSkill(index)) : undefined}
              onClick={() => onEdit({ name: skill.name, level: skill.level, percentage: skill.percentage }, index, "soft")}
            />
          ))}
          <AddSkillButton skillType="soft" onClick={() => onAdd("soft")} />
        </div>
      </div>
    </Card>
  );
};

export default SkillsSection;
