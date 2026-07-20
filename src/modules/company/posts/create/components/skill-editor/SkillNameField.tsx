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
            onClick={() => setOpen(true)}
            placeholder={t("create.post_form.placeholders.skill_autocomplete")}
            className="flex h-10 w-full cursor-pointer rounded-md border border-input bg-transparent px-3 py-1 text-[12px] font-medium shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </PopoverAnchor>
        <PopoverContent
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onWheel={(e) => {
            e.currentTarget.scrollTop += e.deltaY;
            e.stopPropagation();
          }}
          className="w-(--radix-popover-trigger-width) max-h-56 overflow-y-auto overscroll-contain p-1.5"
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
                className="group flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors duration-100 hover:bg-primary/[0.07]"
              >
                <Badge
                  variant="outline"
                  className="h-4 rounded border-transparent bg-[#F3F4F6] px-1.5 text-[9px] font-normal text-[#6B7280] transition-colors duration-100 group-hover:bg-primary/15 group-hover:text-primary"
                >
                  {option.category}
                </Badge>
                <span className="text-[12.5px] text-[#111827] transition-colors duration-100 group-hover:text-primary">{option.label}</span>
              </button>
            ))
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SkillNameField;
