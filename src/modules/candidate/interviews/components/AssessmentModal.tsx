import React, { useEffect, useState } from "react";
import { Brain, Code2, ChevronLeft } from "lucide-react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { cn } from "@/lib/utils";
import { RootState } from "@/store/store";
import { skillCategories, softSkills } from "@/modules/shared/skills";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/modules/shared/ui/shadcn/dialog";
import { RadioGroup, RadioGroupItem } from "@/modules/shared/ui/shadcn/radio-group";
import { Label } from "@/modules/shared/ui/shadcn/label";
import { Button } from "@/modules/shared/ui/shadcn/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/modules/shared/ui/shadcn/select";

const LANGUAGES = [{ value: "English", label: "English" }];

// ─── Skill type card ──────────────────────────────────────────────────────────

interface SkillCardProps {
  value: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  selected: boolean;
}

const SkillCard: React.FC<SkillCardProps> = ({ value, icon, title, description, selected }) => (
  <Label
    htmlFor={value}
    className={cn(
      "flex cursor-pointer items-start gap-3.5 rounded-2xl border p-4 transition-all duration-150",
      selected
        ? "border-secondary-dark/40 bg-secondary-dark/5 shadow-sm"
        : "border-border bg-card hover:border-secondary-dark/20 hover:bg-secondary-dark/[0.02]",
    )}
  >
    <RadioGroupItem id={value} value={value} className="mt-0.5 shrink-0 border-secondary-dark text-secondary-dark" />
    <span className={cn(
      "flex size-9 shrink-0 items-center justify-center rounded-xl border transition-colors",
      selected ? "border-secondary-dark/30 bg-secondary-dark/10" : "border-border bg-muted",
    )}>
      {React.cloneElement(icon as React.ReactElement, {
        className: cn("size-[18px]", selected ? "text-secondary-dark" : "text-muted-foreground"),
      })}
    </span>
    <span className="flex flex-col gap-0.5">
      <span className={cn("text-sm font-semibold leading-tight", selected ? "text-secondary-dark" : "text-foreground")}>
        {title}
      </span>
      <span className="text-xs text-muted-foreground leading-snug">{description}</span>
    </span>
  </Label>
);

// ─── Main modal ───────────────────────────────────────────────────────────────

const AssessmentModal = ({ type, open, onClose }: any) => {
  const router  = useRouter();
  const profile = useSelector((state: RootState) => state.user.connectedUser.profile);

  const [step,                setStep]                = useState(1);
  const [skillType,           setSkillType]           = useState<"soft" | "technical" | "">("");
  const [selectedCategory,    setSelectedCategory]    = useState("");
  const [selectedSkill,       setSelectedSkill]       = useState("");
  const [softSkillType,       setSoftSkillType]       = useState("");
  const [softSkillLanguage,   setSoftSkillLanguage]   = useState("");
  const [softSkillSubcategory,setSoftSkillSubcategory]= useState("");

  useEffect(() => {
    if (open) {
      setSkillType(type ?? "");
      setStep(type ? 2 : 1);
    }
  }, [open, type]);

  const isStep1Invalid = !skillType;
  const isStep2Invalid =
    (skillType === "technical" && (!selectedCategory || !selectedSkill)) ||
    (skillType === "soft" &&
      (!softSkillType ||
        (softSkillType === "Communication" && !softSkillLanguage) ||
        (softSkillType !== "Communication" && !softSkillSubcategory)));

  const handleClose = () => {
    onClose();
    setStep(1);
    setSkillType("");
    setSelectedCategory("");
    setSelectedSkill("");
    setSoftSkillType("");
    setSoftSkillLanguage("");
    setSoftSkillSubcategory("");
  };

  const handleSubmit = () => {
    const query =
      skillType === "technical"
        ? { type: "technical", role: selectedSkill, proficiency: "Mid Level" }
        : {
            type:       "soft",
            skill:      softSkillType,
            category:   softSkillType === "Communication" ? softSkillLanguage : softSkillSubcategory,
            proficiency: "3",
          };
    handleClose();
    router.push(`/candidate/interview?${new URLSearchParams(query)}`);
  };

  const availableSkills = selectedCategory
    ? (skillCategories[selectedCategory] ?? []).filter(
        (s) => !profile?.skills?.some((p) => p.name === s),
      )
    : [];

  const subcategories = softSkillType !== "Communication"
    ? (softSkills.find((s) => s.name === softSkillType)?.subcategories ?? [])
    : [];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden rounded-2xl">

        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4">
          <DialogTitle className="text-base font-bold text-secondary-dark">
            Start New Test
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            {step === 1 ? "Choose what you want to practice" : "Configure your assessment"}
          </p>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4 min-h-[220px]">

          {/* STEP 1 — skill type */}
          {step === 1 && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground mb-1">
                Which skill do you want to master today?
              </p>
              <RadioGroup
                value={skillType}
                onValueChange={(v) => setSkillType(v as "soft" | "technical")}
                className="gap-2.5"
              >
                <SkillCard
                  value="technical"
                  icon={<Code2 />}
                  title="Technical Skills"
                  description="Coding, tools & domain knowledge"
                  selected={skillType === "technical"}
                />
                <SkillCard
                  value="soft"
                  icon={<Brain />}
                  title="Soft Skills"
                  description="Communication, leadership & more"
                  selected={skillType === "soft"}
                />
              </RadioGroup>
            </div>
          )}

          {/* STEP 2 — technical */}
          {step === 2 && skillType === "technical" && (
            <div className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Skill category
                </Label>
                <Select
                  value={selectedCategory || undefined}
                  onValueChange={(v) => { setSelectedCategory(v); setSelectedSkill(""); }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pick a category…" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(skillCategories).map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCategory && (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Specific skill
                  </Label>
                  <Select
                    value={selectedSkill || undefined}
                    onValueChange={setSelectedSkill}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pick a skill…" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSkills.length > 0
                        ? availableSkills.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))
                        : <SelectGroup>
                            <SelectLabel>No new skills to add</SelectLabel>
                          </SelectGroup>
                      }
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* STEP 2 — soft */}
          {step === 2 && skillType === "soft" && (
            <div className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Soft skill
                </Label>
                <Select
                  value={softSkillType || undefined}
                  onValueChange={(v) => { setSoftSkillType(v); setSoftSkillLanguage(""); setSoftSkillSubcategory(""); }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pick a soft skill…" />
                  </SelectTrigger>
                  <SelectContent>
                    {softSkills.map((s) => (
                      <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {softSkillType === "Communication" && (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Language
                  </Label>
                  <Select
                    value={softSkillLanguage || undefined}
                    onValueChange={setSoftSkillLanguage}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pick a language…" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((l) => (
                        <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {softSkillType && softSkillType !== "Communication" && (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Subcategory
                  </Label>
                  <Select
                    value={softSkillSubcategory || undefined}
                    onValueChange={setSoftSkillSubcategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pick a subcategory…" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/30">
          {step > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep(step - 1)}
              className="gap-1.5 text-secondary-dark hover:bg-secondary-dark/8 hover:text-secondary-dark mr-auto"
            >
              <ChevronLeft className="size-4" />
              Back
            </Button>
          )}

          {step === 1 && (
            <Button
              disabled={isStep1Invalid}
              onClick={() => setStep(2)}
              className="min-w-28 rounded-full bg-secondary-dark hover:bg-secondary-dark/90 text-white cursor-pointer disabled:opacity-40"
            >
              Next
            </Button>
          )}

          {step === 2 && (
            <Button
              disabled={isStep2Invalid}
              onClick={handleSubmit}
              className="min-w-28 rounded-full bg-secondary-dark hover:bg-secondary-dark/90 text-white cursor-pointer disabled:opacity-40"
            >
              Start Test
            </Button>
          )}
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};

export default React.memo(AssessmentModal);
