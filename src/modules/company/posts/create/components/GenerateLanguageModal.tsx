import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/modules/shared/ui/shadcn/dialog";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Sparkles as AutoAwesomeOutlined, CheckSquare as CheckBoxOutlined, Square as CheckBoxOutlineBlankOutlined } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { SUPPORTED_LANGS } from "@/modules/shared/constants/languages";

export const GENERATE_LANG_KEY = "talentai_generate_lang";

const TEAL    = "#0D9488";
const TEAL_BG = "#F0FDFA";

interface Props {
  open: boolean;
  loading: boolean;
  onConfirm: (language: string) => void;
  onClose: () => void;
}

const GenerateLanguageModal: React.FC<Props> = ({ open, loading, onConfirm, onClose }) => {
  const [selected, setSelected] = useState("en");
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const { t } = useTranslation("posts");

  useEffect(() => {
    if (!open) setSaveAsDefault(false);
  }, [open]);

  const handleConfirm = () => {
    if (saveAsDefault && typeof window !== "undefined") {
      localStorage.setItem(GENERATE_LANG_KEY, selected);
    }
    onConfirm(selected);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next && !loading) onClose(); }}>
      <DialogContent
        showCloseButton={false}
        className="w-[360px] max-w-[95vw] gap-0 rounded-[18px] p-0 shadow-[0_24px_64px_rgba(0,0,0,0.12)]"
      >
        <div className="p-6">
          {/* Title */}
          <div className="mb-5 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0FDFA]">
              <AutoAwesomeOutlined size={22} color={TEAL} />
            </div>
            <p className="text-[15px] font-bold text-[#111827]">
              {t("create.lang_modal.title")}
            </p>
            <p className="mt-1 text-[12.5px] text-[#6B7280]">
              {t("create.lang_modal.subtitle")}
            </p>
          </div>

          {/* Language toggle */}
          <div className="mb-5 flex rounded-xl bg-[#F3F4F6] p-1">
            {SUPPORTED_LANGS.map((lang) => {
              const active = selected === lang.code;
              return (
                <div
                  key={lang.code}
                  role="button"
                  tabIndex={loading ? -1 : 0}
                  aria-pressed={active}
                  aria-label={lang.label}
                  onClick={() => !loading && setSelected(lang.code)}
                  onKeyDown={(e) => { if (!loading && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); setSelected(lang.code); } }}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-[9px] py-2 transition-all duration-[180ms] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D9488]",
                    loading ? "cursor-default" : "cursor-pointer",
                    active ? "bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)]" : "bg-transparent",
                  )}
                >
                  <img
                    src={`https://flagcdn.com/w40/${lang.flag}.png`}
                    srcSet={`https://flagcdn.com/w80/${lang.flag}.png 2x`}
                    width={24} height={16} alt={lang.label}
                    className="block rounded-[2px]"
                  />
                  <span className={cn("text-[13px]", active ? "font-bold text-[#111827]" : "font-medium text-[#6B7280]")}>
                    {lang.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Save as default checkbox */}
          <div
            role="checkbox"
            tabIndex={loading ? -1 : 0}
            aria-checked={saveAsDefault}
            onClick={() => !loading && setSaveAsDefault((v) => !v)}
            onKeyDown={(e) => { if (!loading && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); setSaveAsDefault((v) => !v); } }}
            className={cn(
              "mb-5 flex items-center gap-2 rounded-[10px] border px-2 py-1.5 transition-all duration-150 select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D9488]",
              loading ? "cursor-default" : "cursor-pointer",
              saveAsDefault ? "border-[#0D9488] bg-[#F0FDFA]" : "border-[#E5E7EB] bg-[#FAFAFA]",
            )}
          >
            {saveAsDefault
              ? <CheckBoxOutlined size={18} color={TEAL} className="shrink-0" />
              : <CheckBoxOutlineBlankOutlined size={18} color="#9CA3AF" className="shrink-0" />}
            <div>
              <p className={cn("text-[12.5px] leading-[1.3] font-semibold", saveAsDefault ? "text-[#0D9488]" : "text-[#374151]")}>
                Always use this language
              </p>
              <p className="text-[11px] leading-[1.3] text-[#9CA3AF]">
                Skip this dialog next time — change anytime in Settings
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            <Button
              onClick={onClose}
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              {t("create.lang_modal.btn_cancel")}
            </Button>

            <Button
              variant="default"
              onClick={handleConfirm}
              disabled={loading}
              loading={loading}
              className="flex-1"
            >
              {!loading && <AutoAwesomeOutlined size={15} />}
              {loading ? t("create.lang_modal.btn_generating") : t("create.lang_modal.btn_generate")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateLanguageModal;
