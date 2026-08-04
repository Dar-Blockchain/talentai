import { useTranslation } from "react-i18next";

const HINT_CHIPS = [
  { icon: "🏢", key: "hint_company" },
  { icon: "🎯", key: "hint_role" },
  { icon: "📋", key: "hint_requirements" },
  { icon: "✅", key: "hint_responsibilities" },
  { icon: "💰", key: "hint_benefits" },
] as const;

const HintChips = () => {
  const { t } = useTranslation("posts");
  return (
    <div className="mb-2.5 flex flex-wrap gap-1.5">
      {HINT_CHIPS.map(({ icon, key }) => (
        <div
          key={key}
          className="flex items-center gap-1 whitespace-nowrap rounded-[20px] border border-[#BBF7D0] bg-[#F0FDF4] px-2 py-[3.2px] text-[11px] font-medium text-[#166534]"
        >
          <span>{icon}</span> {t(`create.form.${key}`)}
        </div>
      ))}
    </div>
  );
};

export default HintChips;
