import { useTranslation } from "react-i18next";
import { Input } from "@/modules/shared/ui/shadcn/input";

const PERCENTAGE_MIN = 1;
const PERCENTAGE_MAX = 100;

interface Props {
  value: number;
  onChange: (value: number) => void;
}

const PercentageField = ({ value, onChange }: Props) => {
  const { t } = useTranslation("posts");

  return (
    <div className="flex-1">
      <label className="block leading-[42px] text-[12px] font-medium text-[rgba(84,98,116,0.53)]">
        {t("create.post_form.labels.percentage")}
      </label>
      <Input
        type="number"
        value={value}
        min={PERCENTAGE_MIN}
        max={PERCENTAGE_MAX}
        inputMode="numeric"
        aria-label={t("create.post_form.labels.percentage")}
        onChange={(e) => {
          const val = Number(e.target.value);
          onChange(isNaN(val) ? PERCENTAGE_MIN : Math.max(PERCENTAGE_MIN, Math.min(PERCENTAGE_MAX, val)));
        }}
        className="h-10 text-[12px] font-medium"
      />
    </div>
  );
};

export default PercentageField;
