import React, { useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { Code2, Search, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildInterviewUrl } from "@/lib/interviewSession";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Input } from "@/modules/shared/ui/shadcn/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
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
      <DialogContent className="max-w-sm p-0 overflow-hidden gap-0">

        <div className="px-5 pt-5 pb-4 bg-gradient-to-br from-gray-900 to-primary-dark">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="size-9 rounded-xl bg-primary-dark/30 border border-primary/30 flex items-center justify-center">
                <Code2 className="size-4 text-white" />
              </div>
              <div>
                <DialogTitle className="text-white text-[1rem]">
                  {t("candidate.skill_dialog.title")}
                </DialogTitle>
                <p className="text-[0.7rem] text-white/60 mt-0.5">
                  {t("candidate.skill_dialog.subtitle")}
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-5 pt-4 pb-2">
          <p className="text-[0.75rem] font-semibold text-gray-600 mb-1.5">
            {t("candidate.skill_dialog.input_label")}
          </p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-gray-400 pointer-events-none" />
            <Input
              autoFocus
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleStart()}
              placeholder={t("candidate.skill_dialog.placeholder")}
              className="pl-8 h-9 text-[0.85rem] focus-visible:ring-primary-dark/20 focus-visible:border-primary-dark/50"
            />
          </div>

          <p className="text-[0.68rem] font-semibold text-gray-400 mt-3 mb-2">
            {t("candidate.skill_dialog.popular_label")}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_SKILLS.map((skill) => (
              <button
                key={skill}
                onClick={() => setSkillInput(skill)}
                className={cn(
                  "px-2.5 py-1 rounded-lg border text-[0.68rem] font-semibold transition-all duration-150",
                  skillInput === skill
                    ? "bg-primary-dark/10 border-primary-dark/25 text-primary-dark"
                    : "bg-gray-50 border-gray-200 text-gray-500 hover:border-primary-dark/30 hover:text-primary-dark",
                )}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        <DialogFooter className="px-5 pb-5 pt-3 gap-2">
          <Button
            variant="ghost" size="sm"
            onClick={() => onOpenChange(false)}
            className="text-gray-500"
          >
            {t("candidate.skill_dialog.cancel")}
          </Button>
          <Button
            size="sm"
            disabled={!skillInput.trim()}
            onClick={handleStart}
            className="gap-1.5"
          >
            {t("candidate.skill_dialog.start")}
            <ArrowRight className="size-3.5" />
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};

export default SkillInterviewDialog;
