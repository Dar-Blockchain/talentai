import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { Zap, Code2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import dayjs from "@/lib/dayjs";
import { buildInterviewUrl } from "@/lib/interviewSession";
import { RootState } from "@/store/store";
import { skillCategories, softSkills } from "@/modules/shared/constants/skills";
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
import { Progress } from "@/modules/shared/ui/shadcn/progress";
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
const MONTHLY_QUOTA = 5;

// Shared copy for the type-locked entry (opened from EmptySkills.tsx) — used
// by both the header (icon + title) and the quota-blocked message below, so
// the two stay in sync instead of duplicating conditionals.
const TYPE_COPY: Record<"technical" | "soft", { title: string; desc: string; icon: React.ElementType }> = {
  technical: { title: "Test a Technical Skill", desc: "Coding, tools & domain knowledge", icon: Code2 },
  soft:      { title: "Test a Soft Skill",      desc: "Communication, leadership & more", icon: MessageCircle },
};

// ─── Skill type card ──────────────────────────────────────────────────────────

interface SkillCardProps {
  value: string;
  title: string;
  description: string;
  selected: boolean;
}

const SkillCard: React.FC<SkillCardProps> = ({ value, title, description, selected }) => (
  <Label
    htmlFor={value}
    className={cn(
      "flex cursor-pointer items-start gap-3.5 rounded-2xl border p-4 transition-all duration-150",
      selected
        ? "border-gray-400 bg-gray-100 shadow-sm"
        : "border-border bg-card hover:border-gray-300 hover:bg-gray-50",
    )}
  >
    {/* RadioGroupItem's selected-state dot is hardcoded fill-primary (brand
        green) in the shared component with no prop to override it -- the
        [&_svg] selector here is scoped to just this instance, not a change
        to the shared radio-group.tsx used elsewhere in the app. */}
    <RadioGroupItem
      id={value} value={value}
      className="mt-0.5 shrink-0 size-[18px] border-gray-400 text-gray-800 [&_svg]:fill-gray-800 [&_svg]:size-2.5"
    />
    <span className="flex flex-col gap-0.5">
      <span className={cn("text-sm font-semibold leading-tight", selected ? "text-gray-900" : "text-foreground")}>
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
  const quotaUsed = Math.min(profile?.quota ?? 0, MONTHLY_QUOTA);
  const quotaFull = quotaUsed >= MONTHLY_QUOTA;
  // Computed server-side (profile.service.js) as first-test-of-cycle +
  // QUOTA_RESET_DAYS -- the reset is a rolling window, not a calendar month,
  // so this is the only accurate way to tell the candidate when it comes
  // back. Shown with the time too since the window can be as short as a day.
  // Only show it once it's actually in the future -- the cron that zeroes
  // the quota runs every 10 min, so a just-crossed threshold means "any
  // moment now", and a past date would read as a broken promise.
  const quotaResetLabel = profile?.quotaResetAt && dayjs(profile.quotaResetAt).isAfter(dayjs())
    ? dayjs(profile.quotaResetAt).format("MMM D, YYYY [at] h:mm A")
    : null;
  // Opened directly from the Technical/Soft Skills section (EmptySkills.tsx)
  // with a fixed type -- step 1's generic type picker is skipped entirely in
  // that case, so the header should say so explicitly instead of showing
  // the same "Start New Test" wording used for the generic entry point.
  const isTypeLocked = type === "technical" || type === "soft";

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
    // Same session route as the dashboard's "Skill Interview" modal
    // (SkillInterviewDialog) — /interviews/<encoded session>, not the old
    // /candidate/interview query-string route.
    const params =
      skillType === "technical"
        ? { type: "skill" as const, skill: selectedSkill, category: selectedCategory, skillType: "technical" as const }
        : softSkillType === "Communication"
          ? { type: "skill" as const, skill: softSkillType, language: softSkillLanguage, skillType: "soft" as const }
          : { type: "skill" as const, skill: softSkillType, category: softSkillSubcategory, skillType: "soft" as const };
    handleClose();
    router.push(buildInterviewUrl(params));
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
          <div className="flex items-center gap-2.5 min-w-0">
            {isTypeLocked && (
              <div className={cn(
                "size-8 rounded-lg border flex items-center justify-center shrink-0",
                quotaFull ? "bg-danger/10 border-danger/20" : "bg-gray-100 border-gray-200",
              )}>
                {(() => {
                  const TypeIcon = TYPE_COPY[type as "technical" | "soft"].icon;
                  return <TypeIcon className={cn("size-3.5", quotaFull ? "text-danger" : "text-gray-500")} />;
                })()}
              </div>
            )}
            <div className="min-w-0">
              <DialogTitle className="text-base font-bold text-foreground">
                {isTypeLocked ? TYPE_COPY[type as "technical" | "soft"].title : "Start New Test"}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {quotaFull
                  ? "Test quota reached"
                  : isTypeLocked
                    ? TYPE_COPY[type as "technical" | "soft"].desc
                    : step === 1 ? "Choose what you want to practice" : "Configure your assessment"}
              </p>
            </div>
          </div>

          {/* Step progress — only meaningful when the type picker (step 1) is
              actually part of the flow; locked-type entry starts straight on
              the single "configure" step, so there's nothing to progress through. */}
          {!isTypeLocked && !quotaFull && (
            <div className="flex items-center gap-1.5 mt-4">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors duration-200",
                    n <= step ? "bg-gray-700" : "bg-gray-200",
                  )}
                />
              ))}
            </div>
          )}
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4 min-h-[220px]">

          {/* Skill-test quota — its own clear section right under the header
              instead of a small chip crammed next to the title, matching the
              fuller quota-card style used in ConfirmTestDialog. Shown in
              every state (including quota-exhausted) so it's the one
              consistent place a candidate looks to check their usage. */}
          <div className={cn(
            "rounded-xl border p-3.5 flex flex-col gap-2 shrink-0",
            quotaFull ? "border-danger/20 bg-danger/5" : "border-gray-200 bg-gray-50",
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Zap className={cn("size-3.5 shrink-0", quotaFull ? "text-danger" : "text-gray-500")} />
                <span className={cn(
                  "text-[0.7rem] font-bold uppercase tracking-wide",
                  quotaFull ? "text-danger" : "text-gray-600",
                )}>
                  Skill Test Quota
                </span>
              </div>
              <span className={cn("text-[0.8rem] font-extrabold", quotaFull ? "text-danger" : "text-gray-800")}>
                {quotaUsed}/{MONTHLY_QUOTA}
              </span>
            </div>
            <Progress
              value={(quotaUsed / MONTHLY_QUOTA) * 100}
              className={cn(
                "h-1.5 bg-gray-200",
                quotaFull
                  ? "[&>[data-slot=progress-indicator]]:bg-danger"
                  : "[&>[data-slot=progress-indicator]]:bg-gray-700",
              )}
            />
            <p className={cn("text-[0.7rem] font-medium", quotaFull ? "text-danger" : "text-muted-foreground")}>
              {/* No hardcoded day count here -- the actual reset period is
                  configurable server-side (QUOTA_RESET_DAYS), so a fixed
                  "N days" claim in this fallback would go stale the moment
                  that value changes. quotaResetLabel (the real computed
                  date) is the only place a specific number should show. */}
              {quotaFull
                ? (quotaResetLabel ? `Limit reached — resets ${quotaResetLabel}` : "Limit reached — it resets automatically.")
                : `${MONTHLY_QUOTA - quotaUsed} test${MONTHLY_QUOTA - quotaUsed === 1 ? "" : "s"} left${quotaResetLabel ? ` · resets ${quotaResetLabel}` : ""}`}
            </p>
          </div>

          {/* Quota exhausted -- blocks the rest of the form instead of letting
              the candidate configure a test they can't submit, then hitting a
              silently-disabled button with no explanation. */}
          {quotaFull ? (
            <div className="flex flex-col items-center text-center gap-2 py-4 m-auto">
              <p className="text-sm font-bold text-foreground">You can't start a new test right now</p>
              <p className="text-xs text-muted-foreground max-w-[280px]">
                You've used every{isTypeLocked ? ` ${type === "technical" ? "technical" : "soft"} skill` : ""} test
                in your current quota.{" "}
                {quotaResetLabel ? `Your quota resets ${quotaResetLabel}.` : "Come back once your quota resets."}
              </p>
            </div>
          ) : (
          <>
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
                  title="Technical Skills"
                  description="Coding, tools & domain knowledge"
                  selected={skillType === "technical"}
                />
                <SkillCard
                  value="soft"
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
          </>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/30">
          {quotaFull ? (
            <Button
              onClick={handleClose}
              className="min-w-28 rounded-full bg-gray-800 hover:bg-gray-900 text-white cursor-pointer ml-auto"
            >
              Close
            </Button>
          ) : (
          <>
          {step > 1 && !isTypeLocked && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep(step - 1)}
              className="gap-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-800 mr-auto"
            >
              Back
            </Button>
          )}

          {step === 1 && (
            <Button
              disabled={isStep1Invalid}
              onClick={() => setStep(2)}
              className="min-w-28 rounded-full bg-gray-800 hover:bg-gray-900 text-white cursor-pointer disabled:opacity-40"
            >
              Next
            </Button>
          )}

          {step === 2 && (
            <Button
              disabled={isStep2Invalid}
              onClick={handleSubmit}
              className="min-w-28 rounded-full bg-gray-800 hover:bg-gray-900 text-white cursor-pointer disabled:opacity-40"
            >
              Start Test
            </Button>
          )}
          </>
          )}
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};

export default React.memo(AssessmentModal);
