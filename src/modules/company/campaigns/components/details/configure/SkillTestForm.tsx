import React, { memo, useState, useMemo, useCallback } from "react";
import { Search, CircleCheck, Code, GitBranch, Bot, Megaphone, Bug, Briefcase } from "lucide-react";
import { Label } from "@/modules/shared/ui/shadcn/label";
import {
  Select, SelectContent, SelectGroup, SelectLabel, SelectItem, SelectTrigger, SelectValue,
} from "@/modules/shared/ui/shadcn/select";
import { ALL_SKILLS } from "@/modules/shared/constants/skills";
import { useTranslation } from "react-i18next";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SkillTestConfig {
  skill: string;
}

interface Props {
  config: SkillTestConfig;
  onChange: (config: SkillTestConfig) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_META: Record<string, { icon: React.ElementType; color: string }> = {
  development: { icon: Code,      color: "#3B82F6" },
  web3:        { icon: GitBranch, color: "#8B5CF6" },
  ai:          { icon: Bot,       color: "#06B6D4" },
  marketing:   { icon: Megaphone, color: "#F59E0B" },
  qa:          { icon: Bug,       color: "#EF4444" },
  business:    { icon: Briefcase, color: "#10B981" },
};

const CATEGORY_ORDER = ["development", "web3", "ai", "marketing", "qa", "business"];

// ─── Component ────────────────────────────────────────────────────────────────

const SkillTestForm = memo<Props>(({ config, onChange }) => {
  const { t } = useTranslation("dashboard");
  const cf = "pages.campaigns.detail.configure_form.skill_test";
  const [skillSearch, setSkillSearch] = useState("");

  const categoryLabel = useCallback((catId: string) => t(`${cf}.category_${catId}`), [t, cf]);

  const filteredGroups = useMemo(() => {
    const q = skillSearch.trim().toLowerCase();
    return CATEGORY_ORDER.map((catId) => ({
      catId,
      meta: CATEGORY_META[catId],
      skills: ALL_SKILLS.filter(
        (s) => s.category === catId && (!q || s.label.toLowerCase().includes(q))
      ),
    })).filter((g) => g.skills.length > 0);
  }, [skillSearch]);

  const totalVisible = filteredGroups.reduce((n, g) => n + g.skills.length, 0);

  const selectedSkillCat = config.skill
    ? ALL_SKILLS.find((s) => s.label === config.skill)?.category
    : undefined;
  const selectedMeta = selectedSkillCat ? CATEGORY_META[selectedSkillCat] : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-bold text-foreground/80">
        {t(`${cf}.skill_to_assess`)}<span className="text-destructive ml-0.5">*</span>
      </Label>

      <Select
        value={config.skill || undefined}
        onValueChange={(val) => onChange({ ...config, skill: val })}
        onOpenChange={(open) => { if (!open) setSkillSearch(""); }}
      >
        <SelectTrigger className="bg-muted/30">
          <SelectValue placeholder={t(`${cf}.choose_skill`)}>
            {config.skill && (
              <span className="flex items-center gap-2.5">
                {selectedMeta && (
                  <span
                    className="flex items-center justify-center size-[26px] rounded-lg shrink-0"
                    style={{ background: `${selectedMeta.color}18` }}
                  >
                    <selectedMeta.icon className="!size-3.5" style={{ color: selectedMeta.color }} />
                  </span>
                )}
                <span className="text-[13.5px] font-semibold text-foreground">{config.skill}</span>
                {selectedMeta && selectedSkillCat && (
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md border"
                    style={{ background: `${selectedMeta.color}15`, color: selectedMeta.color, borderColor: `${selectedMeta.color}30` }}
                  >
                    {categoryLabel(selectedSkillCat)}
                  </span>
                )}
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[340px]">
          {/* Sticky search bar */}
          <div className="sticky top-0 z-10 bg-popover p-2 border-b border-border/60 mb-1">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-2.5 py-1.5">
              <Search className="size-4 text-muted-foreground shrink-0" />
              <input
                autoFocus
                placeholder={t(`${cf}.search_skills`)}
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                className="border-none outline-none bg-transparent text-[13px] w-full font-[inherit]"
              />
            </div>
          </div>

          {filteredGroups.map(({ catId, meta, skills }) => (
            <SelectGroup key={catId}>
              <SelectLabel className="flex items-center gap-1.5" style={{ color: meta.color }}>
                <meta.icon className="!size-3" />
                {categoryLabel(catId)}
              </SelectLabel>
              {skills.map((s) => {
                const isSelected = config.skill === s.label;
                return (
                  <SelectItem
                    key={s.label}
                    value={s.label}
                    className={isSelected ? "font-bold" : ""}
                    style={{ color: isSelected ? meta.color : undefined }}
                  >
                    <span className="flex-1">{s.label}</span>
                    {isSelected && <CircleCheck className="!size-3.5" style={{ color: meta.color }} />}
                  </SelectItem>
                );
              })}
            </SelectGroup>
          ))}

          {totalVisible === 0 && (
            <div className="py-8 flex flex-col items-center text-center">
              <Search className="size-7 text-muted-foreground/40 mb-1.5" />
              <p className="text-xs text-muted-foreground">{t(`${cf}.no_match`, { query: skillSearch })}</p>
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
});
SkillTestForm.displayName = "SkillTestForm";

export default SkillTestForm;
