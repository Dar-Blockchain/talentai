import React, { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/modules/shared/ui/shadcn/dialog";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Mic as MicOutlined, Check as CheckOutlined } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { SUPPORTED_LANGS } from "@/modules/shared/constants/languages";

const TEAL    = "#0D9488";

interface Props {
  open: boolean;
  onConfirm: (languages: string[]) => void;
  onClose: () => void;
  initialLanguages?: string[];
  isLoading?: boolean;
}

const InterviewLanguagesModal: React.FC<Props> = ({ open, isLoading, onConfirm, onClose, initialLanguages }) => {
  const [selected, setSelected] = useState<string[]>(initialLanguages ?? ["en"]);
  const { t } = useTranslation("posts");

  React.useEffect(() => {
    if (open) setSelected(initialLanguages ?? ["en"]);
  }, [open, initialLanguages]);

  const toggle = (code: string) => {
    setSelected((prev) =>
      prev.includes(code)
        ? prev.length > 1 ? prev.filter((c) => c !== code) : prev
        : [...prev, code]
    );
  };

  const handleConfirm = () => onConfirm(selected);
  const handleClose  = () => onClose();

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) handleClose(); }}>
      <DialogContent
        showCloseButton={false}
        className="w-[400px] max-w-[95vw] gap-0 rounded-[18px] p-0 shadow-[0_24px_64px_rgba(0,0,0,0.12)]"
      >
        <div className="p-6">
          {/* Title */}
          <div className="mb-5 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0FDFA]">
              <MicOutlined size={22} color={TEAL} />
            </div>
            <p className="text-[15px] font-bold text-[#111827]">
              {t("create.interview_lang_modal.title")}
            </p>
            <p className="mt-1 text-[12.5px] text-[#6B7280]">
              {t("create.interview_lang_modal.subtitle")}
            </p>
          </div>

          {/* Language grid — multi-select */}
          <p className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.07em] text-[#9CA3AF]">
            {t("create.interview_lang_modal.select_label")}
          </p>
          <div className="mb-4 grid grid-cols-2 gap-3">
            {SUPPORTED_LANGS.map((lang) => {
              const active = selected.includes(lang.code);
              return (
                <div
                  key={lang.code}
                  onClick={() => toggle(lang.code)}
                  className={cn(
                    "relative flex cursor-pointer flex-col items-center gap-1 rounded-xl border-[1.5px] p-3 transition-all duration-150",
                    active
                      ? "border-[#0D9488] bg-[#F0FDFA]"
                      : "border-[#E5E7EB] bg-[#FAFAFA] hover:border-[#0D9488] hover:bg-[#F0FDFA]",
                  )}
                >
                  {active && (
                    <div className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#0D9488]">
                      <CheckOutlined size={10} color="#fff" />
                    </div>
                  )}
                  <Image
                    src={`https://flagcdn.com/w80/${lang.flag}.png`}
                    unoptimized
                    width={28} height={20} alt={lang.label}
                    className="block rounded-[2px]"
                  />
                  <p
                    className={cn(
                      "text-center text-[11.5px] leading-[1.2]",
                      active ? "font-bold text-[#0D9488]" : "font-medium text-[#374151]",
                    )}
                  >
                    {lang.label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Hint */}
          <p
            className={cn(
              "mb-4 text-center text-[11px] leading-[1.5]",
              selected.length === 1 ? "font-medium text-[#D97706]" : "font-normal text-[#059669]",
            )}
          >
            {selected.length === 1
              ? t("create.interview_lang_modal.hint_one")
              : t("create.interview_lang_modal.hint_other", { count: selected.length })}
          </p>

          {/* Actions */}
          <div className="flex gap-2.5">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1"
            >
              {t("create.interview_lang_modal.btn_cancel")}
            </Button>

            <Button
              onClick={handleConfirm}
              className="flex-1"
              loading={isLoading}
            >
              {t("create.interview_lang_modal.btn_save")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InterviewLanguagesModal;
