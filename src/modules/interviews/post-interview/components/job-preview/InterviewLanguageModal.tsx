import React, { useEffect, useState } from "react";
import { Languages, Check, ArrowRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { LANG_META } from "@/modules/shared/constants/languages";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent } from "@/modules/shared/ui/shadcn/dialog";
import { Button } from "@/modules/shared/ui/shadcn/button";

const FlagImg: React.FC<{ flag: string; label: string; width: number; height: number; className?: string }> = ({ flag, label, width, height, className }) => (
  // eslint-disable-next-line @next/next/no-img-element -- external flagcdn.com host not in next/image remotePatterns
  <img
    src={`https://flagcdn.com/w40/${flag}.png`}
    srcSet={`https://flagcdn.com/w80/${flag}.png 2x`}
    width={width} height={height}
    alt={label}
    className={cn("rounded block", className)}
  />
);

interface LangCardProps { code: string; active: boolean; onSelect: () => void; }

const LangCard: React.FC<LangCardProps> = ({ code, active, onSelect }) => {
  const meta = LANG_META[code];
  if (!meta) return null;
  return (
    <div
      onClick={onSelect}
      className={cn(
        "cursor-pointer rounded-[14px] p-[14px_10px] flex flex-col items-center gap-[6px] relative transition-all duration-[180ms] hover:-translate-y-px border-2",
        active
          ? "border-primary bg-primary-light dark:bg-primary/10"
          : "border-border bg-muted/50 hover:border-primary hover:bg-primary-light dark:hover:bg-primary/10",
      )}
    >
      {active && (
        <div className="absolute top-[7px] right-[7px] w-[18px] h-[18px] rounded-full bg-primary flex items-center justify-center shadow-brand">
          <Check size={11} className="text-primary-foreground" strokeWidth={3} />
        </div>
      )}
      <FlagImg flag={meta.flag} label={meta.label} width={36} height={26} className="shadow-sm" />
      <div className="text-center">
        <p className={cn("text-[12.5px] leading-[1.2]", active ? "font-extrabold text-primary" : "font-semibold text-foreground")}>
          {meta.label}
        </p>
        <p className={cn("text-[10.5px] mt-[2px]", active ? "text-primary-dark" : "text-muted-foreground")}>
          {meta.englishLabel}
        </p>
      </div>
    </div>
  );
};

interface Props {
  open: boolean;
  languages: string[];
  onConfirm: (lang: string) => void;
  onClose: () => void;
}

const InterviewLanguageModal: React.FC<Props> = ({ open, languages, onConfirm, onClose }) => {
  const [selected, setSelected] = useState<string>(languages[0] ?? "en");
  const { t } = useTranslation("interview");

  useEffect(() => {
    if (open) setSelected(languages[0] ?? "en");
  }, [open, languages]);

  const isMulti      = languages.length > 1;
  const singleLang   = LANG_META[languages[0]];
  const selectedMeta = LANG_META[selected];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-[420px] max-w-[95vw] rounded-[20px] p-0 overflow-hidden shadow-lg dark:shadow-none"
      >
        {/* Accent bar */}
        <div className="h-1 bg-gradient-to-r from-primary to-accent" />

        <div className="p-6">
          {/* Icon + title */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-[14px] mx-auto mb-4 flex items-center justify-center border border-primary-border bg-primary-light dark:bg-primary/10">
              <Languages size={24} className="text-primary" />
            </div>
            <p className="text-[16px] font-extrabold text-foreground tracking-tight">
              {isMulti ? t("lang_modal.title_multi") : t("lang_modal.title_single")}
            </p>
            <p className="text-[12.5px] text-muted-foreground mt-[6px] leading-[1.65] px-4">
              {isMulti ? t("lang_modal.desc_multi") : t("lang_modal.desc_single")}
            </p>
          </div>

          {/* Multi: language picker */}
          {isMulti && (
            <>
              <div
                className="grid gap-[10px] mb-4"
                style={{ gridTemplateColumns: `repeat(${Math.min(languages.length, 3)}, 1fr)` }}
              >
                {languages.map((code) => (
                  <LangCard key={code} code={code} active={selected === code} onSelect={() => setSelected(code)} />
                ))}
              </div>

              {selectedMeta && (
                <div className="flex items-center gap-[10px] px-3 py-2 rounded-[10px] bg-muted border border-border mb-5">
                  <FlagImg flag={selectedMeta.flag} label={selectedMeta.label} width={22} height={16} className="shrink-0" />
                  <p className="text-[12px] text-foreground flex-1">
                    {t("lang_modal.interviewing_in", { language: selectedMeta.label })}
                  </p>
                  <Lock size={13} className="text-muted-foreground shrink-0" />
                </div>
              )}
            </>
          )}

          {/* Single: info card */}
          {!isMulti && singleLang && (
            <div className="flex items-center gap-4 p-4 mb-5 rounded-[14px] border border-primary-border bg-primary-light dark:bg-primary/10">
              <FlagImg flag={singleLang.flag} label={singleLang.label} width={40} height={29} className="shadow-sm shrink-0" />
              <div className="flex-1">
                <p className="text-[14px] font-extrabold leading-[1.2] text-primary">
                  {singleLang.label}
                  <span className="font-medium text-[11.5px] text-primary-dark ml-2">({singleLang.englishLabel})</span>
                </p>
                <p className="text-[11.5px] text-primary-dark mt-1 leading-[1.5]">
                  {t("lang_modal.single_lang_note")}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-[10px]">
            <Button
              variant="outline"
              size="lg"
              onClick={onClose}
              className="flex-1"
            >
              {t("lang_modal.btn_back")}
            </Button>
            <Button
              variant="default"
              size="lg"
              onClick={() => onConfirm(selected)}
              className="flex-1"
            >
              {isMulti ? t("lang_modal.btn_start_in", { language: selectedMeta?.label ?? selected }) : t("lang_modal.btn_start")}
              <ArrowRight size={15} />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InterviewLanguageModal;
