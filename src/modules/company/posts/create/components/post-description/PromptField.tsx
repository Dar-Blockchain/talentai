import { Textarea } from "@/modules/shared/ui/shadcn/textarea";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import FieldLabel from "./FieldLabel";
import HintChips from "./HintChips";

interface Props {
  value: string;
  error: string;
  onChange: (val: string) => void;
}

const PromptField = ({ value, error, onChange }: Props) => {
  const { t } = useTranslation("posts");
  return (
    <div>
      <FieldLabel label={t("create.form.prompt_label")} />
      <HintChips />
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("create.form.prompt_placeholder")}
        rows={5}
        aria-invalid={!!error}
        className={cn(
          "max-h-44 min-h-[120px] resize-y rounded-[10px] border-[#E5E7EB] bg-[#FAFAFA] text-[13px] leading-[1.75] hover:border-[#0D9488] focus-visible:border-[#0D9488] focus-visible:ring-[#0D9488]/20",
          error && "border-red-500",
        )}
      />
      {error && <p className="mt-1 text-[11px] text-[#EF4444]">{error}</p>}
      <div className="mt-1 flex items-center justify-between">
        <span className="text-[11px] text-[#9CA3AF]">{t("create.form.prompt_hint")}</span>
        <span className={cn("text-[11px] font-medium", value.length < 50 ? "text-[#F59E0B]" : "text-[#10B981]")}>
          {value.length} {t("create.form.prompt_chars")}
        </span>
      </div>
    </div>
  );
};

export default PromptField;
