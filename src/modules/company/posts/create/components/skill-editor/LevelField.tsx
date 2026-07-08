import { TrendingUp as TrendingUpIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { hardSkillLevels, softSkillLevels } from "@/modules/shared/constants/skills";

interface Props {
  skillType: "hard" | "soft";
  value: string | number | null;
  onChange: (value: string) => void;
}

const LevelField = ({ skillType, value, onChange }: Props) => {
  const { t } = useTranslation("posts");
  const levels = skillType === "hard" ? hardSkillLevels : softSkillLevels;

  const levelMenuLabel = (v: number) =>
    skillType === "hard"
      ? t(`create.post_form.hard_skill_levels.${v}`)
      : t(`create.post_form.soft_skill_levels.${v}`);

  return (
    <div className="flex-1">
      <label className="block leading-[42px] text-[12px] font-medium text-[rgba(84,98,116,0.53)]">
        {t("create.post_form.skill_modal.experience_level")}
      </label>
      <div className="relative">
        <TrendingUpIcon
          size={16}
          color="rgba(98, 111, 134, 1)"
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
        />
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          aria-label={t("create.post_form.skill_modal.experience_level")}
          className="h-10 w-full rounded-md border border-input pr-3 pl-9 text-[12px] font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <option disabled value="" className="text-[12px] font-medium">
            {t("create.post_form.placeholders.select_skill_level")}
          </option>
          {levels.map((item) => (
            <option key={item.value} value={item.value} className="text-[12px] font-medium">
              {levelMenuLabel(item.value)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default LevelField;
