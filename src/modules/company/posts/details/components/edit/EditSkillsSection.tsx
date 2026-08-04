import React from "react";
import Image from "next/image";
import { getLevelFromNumber } from '@/modules/company/posts/utils/postHelpers';
import EditSkillChip from "./EditSkillChip";
import EditAddSkillButton from "./EditAddSkillButton";

interface Skill {
  name: string;
  level: number;
  percentage: number;
}

interface Props {
  requiredSkills: Skill[];
  softSkills: Skill[];
  onAdd: (type: "hard" | "soft") => void;
  onEdit: (index: number, type: "hard" | "soft") => void;
  onDelete: (index: number, type: "hard" | "soft") => void;
}

const sectionTitleClass = "text-[20px] font-semibold text-[rgba(84,98,116,1)]";

const EditSkillsSection: React.FC<Props> = ({
  requiredSkills, softSkills, onAdd, onEdit, onDelete,
}) => (
  <>
    {/* Info banner */}
    <div className="mb-2 flex items-center justify-between">
      <p className={sectionTitleClass}>Required Skills</p>
      <p className="text-[12px] text-[rgba(77,217,163,1)]">
        Total: 100%
      </p>
    </div>

    <div className="flex items-start gap-2 rounded-xl border p-2" style={{ background: "rgba(240,249,255,1)", borderColor: "rgba(122,200,240,1)" }}>
      <Image src="/icons/lightinfooutline.svg" alt="info" width={18} height={18} />
      <div className="grow">
        <p className="text-[13px] font-semibold text-[rgba(84,98,116,1)]">
          About Skill Percentages
        </p>
        <p className="text-[12px] font-normal text-[rgba(84,98,116,1)]">
          The percentages represent the <b>relative importance</b> of each skill for this role. These
          percentages will be used to <b>match candidates</b> to your job requirements.
        </p>
      </div>
    </div>

    {/* Hard skills */}
    <div className="mt-4">
      <p className={sectionTitleClass}>Hard Skills</p>
      <div className="mt-1 flex flex-wrap gap-2">
        {requiredSkills.map((skill, i) => (
          <EditSkillChip
            key={i}
            label={`${skill.name} (${getLevelFromNumber(skill.level)}) - ${skill.percentage}%`}
            onDelete={() => onDelete(i, "hard")}
            onClick={() => onEdit(i, "hard")}
          />
        ))}
        <EditAddSkillButton onClick={() => onAdd("hard")} />
      </div>
    </div>

    {/* Soft skills */}
    <div className="mt-4">
      <p className={sectionTitleClass}>Soft Skills</p>
      <div className="mt-1 flex flex-wrap gap-2">
        {softSkills.map((skill, i) => (
          <EditSkillChip
            key={i}
            label={`${skill.name} (${skill.level}/5) - ${skill.percentage}%`}
            onDelete={() => onDelete(i, "soft")}
            onClick={() => onEdit(i, "soft")}
          />
        ))}
        <EditAddSkillButton onClick={() => onAdd("soft")} />
      </div>
    </div>
  </>
);

export default EditSkillsSection;
