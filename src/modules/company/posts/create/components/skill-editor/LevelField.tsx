import { TrendingUp as TrendingUpIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { hardSkillLevels, softSkillLevels } from "@/modules/shared/constants/skills";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/modules/shared/ui/shadcn/select";

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
      <Select value={value != null && value !== "" ? String(value) : undefined} onValueChange={onChange}>
        <SelectTrigger
          aria-label={t("create.post_form.skill_modal.experience_level")}
          className="w-full text-[12px] font-medium"
        >
          <TrendingUpIcon size={16} color="rgba(98, 111, 134, 1)" />
          <SelectValue placeholder={t("create.post_form.placeholders.select_skill_level")} />
        </SelectTrigger>
        <SelectContent>
          {levels.map((item) => (
            <SelectItem key={item.value} value={String(item.value)}>
              {levelMenuLabel(item.value)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LevelField;
