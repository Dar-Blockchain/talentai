import React from "react";
import { CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/modules/shared/ui/shadcn/dialog";

interface Props {
  open: boolean;
  progress: number;
}

const STEPS = [
  { key: "analyzing_reading", threshold: 0  },
  { key: "analyzing_skills",  threshold: 30 },
  { key: "analyzing_profile", threshold: 65 },
] as const;

const CvAnalysisDialog: React.FC<Props> = ({ open, progress }) => {
  const { t } = useTranslation("auth");

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        className="p-0 overflow-hidden max-w-xs sm:max-w-sm rounded-2xl gap-0 border-border/50 shadow-2xl"
      >
        {/* Top gradient progress strip */}
        <div className="h-1 w-full bg-primary/10">
          <div
            className="h-full bg-linear-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex flex-col gap-4 sm:gap-5 px-5 sm:px-7 py-5 sm:py-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <div className="w-5 h-5 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            </div>
            <div className="min-w-0">
              <p className="font-sans font-bold text-sm sm:text-base text-foreground leading-snug">
                {t("candidate_form.analyzing_title")}
              </p>
              <p className="font-sans text-xs text-muted-foreground mt-0.5">
                {t("candidate_form.analyzing_sub")}
              </p>
            </div>
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-2.5">
            {STEPS.map(({ key, threshold }) => {
              const done = progress > threshold;
              return (
                <div key={key} className="flex items-center gap-2.5">
                  <div className={cn(
                    "w-4.5 h-4.5 rounded-full shrink-0 flex items-center justify-center transition-all duration-300",
                    done ? "bg-primary/15" : "bg-muted",
                  )}>
                    {done
                      ? <CheckCircle2 className="size-3 text-primary" />
                      : <div className="w-2 h-2 rounded-full border border-t-primary border-border animate-spin" />}
                  </div>
                  <p className={cn(
                    "font-sans text-xs sm:text-[0.8125rem] transition-colors duration-300",
                    done ? "text-foreground font-semibold" : "text-muted-foreground font-normal",
                  )}>
                    {t(`candidate_form.${key}`)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Progress bar with % */}
          <div>
            <div className="flex justify-between mb-1.5">
              <p className="font-sans text-[0.625rem] sm:text-xs text-muted-foreground">
                {t("candidate_form.analyzing_processing")}
              </p>
              <p className="font-sans text-[0.625rem] sm:text-xs text-primary font-bold">
                {progress}%
              </p>
            </div>
            <div className="h-1.5 rounded-full bg-primary/10 overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-primary to-accent rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <p className="font-sans text-[0.625rem] sm:text-xs text-muted-foreground/60 text-center -mt-1">
            {t("candidate_form.analyzing_warning")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CvAnalysisDialog;
