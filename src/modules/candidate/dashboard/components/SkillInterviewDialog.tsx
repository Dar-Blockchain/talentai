import React, { useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { Code2, Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildInterviewUrl } from "@/lib/interviewSession";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Input } from "@/modules/shared/ui/shadcn/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/modules/shared/ui/shadcn/dialog";

const POPULAR_SKILLS = ["React", "TypeScript", "Python", "Node.js", "Java", "SQL", "Docker", "AWS"];

interface Props {
  open:         boolean;
  onOpenChange: (open: boolean) => void;
}

const SkillInterviewDialog: React.FC<Props> = ({ open, onOpenChange }) => {
  const { t }  = useTranslation("dashboard");
  const router = useRouter();

  const [skillInput, setSkillInput] = useState("");

  const handleStart = () => {
    const skill = skillInput.trim();
    if (!skill) return;
    router.push(buildInterviewUrl({ type: "skill", skill }));
    onOpenChange(false);
    setSkillInput("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm gap-0 p-0 overflow-hidden rounded-2xl">

        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/15 border border-primary/25">
              <Code2 className="size-[18px] text-primary-dark" />
            </div>
            <div>
              <DialogTitle className="text-[0.95rem] font-bold text-foreground leading-tight">
                {t("candidate.skill_dialog.title")}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("candidate.skill_dialog.subtitle")}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 pb-6 flex flex-col gap-4">

          {/* Search input */}
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {t("candidate.skill_dialog.input_label")}
            </p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/60 pointer-events-none" />
              <Input
                autoFocus
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
                placeholder={t("candidate.skill_dialog.placeholder")}
                className="pl-8 h-10 text-sm focus-visible:ring-primary/20 focus-visible:border-primary/50"
              />
            </div>
          </div>

          {/* Popular skills */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {t("candidate.skill_dialog.popular_label")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_SKILLS.map((skill) => (
                <button
                  key={skill}
                  onClick={() => setSkillInput(skill)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all duration-150 cursor-pointer",
                    skillInput === skill
                      ? "bg-primary/10 border-primary/30 text-primary-dark"
                      : "bg-muted border-border text-muted-foreground hover:border-primary/25 hover:text-primary-dark hover:bg-primary/5",
                  )}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-1 gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              {t("candidate.skill_dialog.cancel")}
            </Button>
            <Button
              size="sm"
              disabled={!skillInput.trim()}
              onClick={handleStart}
              className="gap-1.5 rounded-full px-5 bg-primary-dark hover:bg-primary-dark/90 text-white cursor-pointer disabled:opacity-40"
            >
              <Sparkles className="size-3.5" />
              {t("candidate.skill_dialog.start")}
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SkillInterviewDialog;
