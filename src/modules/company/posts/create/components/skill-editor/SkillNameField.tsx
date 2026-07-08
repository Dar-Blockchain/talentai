"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Popover, PopoverAnchor, PopoverContent } from "@/modules/shared/ui/shadcn/popover";
import { Badge } from "@/modules/shared/ui/shadcn/badge";
import { ALL_SKILLS, SOFT_SKILLS } from "@/modules/shared/constants/skills";

interface SkillOption {
  label: string;
  category?: string;
}

interface Props {
  skillType: "hard" | "soft";
  value: string;
  onChange: (value: string) => void;
}

const SkillNameField = ({ skillType, value, onChange }: Props) => {
  const { t } = useTranslation("posts");
  const [open, setOpen] = useState(false);
  const baseOptions: SkillOption[] = skillType === "hard" ? ALL_SKILLS : SOFT_SKILLS;

  const filtered = useMemo(() => {
    const q = value.toLowerCase().trim();
    return q ? baseOptions.filter((o) => o.label.toLowerCase().includes(q)) : baseOptions;
  }, [baseOptions, value]);

  const handleSelect = (option: SkillOption) => {
    onChange(option.label);
    setOpen(false);
  };

  return (
    <div className="mb-2 flex-1">
      <label className="block leading-[42px] text-[12px] font-medium text-[rgba(84,98,116,0.53)]">
        {t("create.post_form.labels.skill_name")}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <input
            value={value}
            onChange={(e) => { onChange(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={t("create.post_form.placeholders.skill_autocomplete")}
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-[12px] font-medium shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </PopoverAnchor>
        <PopoverContent
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="w-(--radix-popover-trigger-width) p-1.5"
        >
          {filtered.length === 0 ? (
            <p className="py-4 text-center text-[12px] text-gray-400">No options found</p>
          ) : (
            filtered.map((option) => (
              <button
                key={option.label}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(option)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-[#F9FAFB]"
              >
                <Badge
                  variant="outline"
                  className="h-4 rounded border-transparent bg-[#F3F4F6] px-1.5 text-[9px] font-normal text-[#6B7280]"
                >
                  {option.category}
                </Badge>
                <span className="text-[12.5px] text-[#111827]">{option.label}</span>
              </button>
            ))
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SkillNameField;
