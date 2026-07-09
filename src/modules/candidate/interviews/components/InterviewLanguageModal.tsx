import React, { useState } from "react";
import { Dialog, DialogContent } from "@/modules/shared/ui/shadcn/dialog";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Globe as TranslateOutlined, Check as CheckOutlined, ArrowRight as ArrowForwardOutlined, Lock as LockOutlined } from "lucide-react";
import { LANG_META } from "@/modules/shared/constants/languages";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const TEAL    = "#0D9488";
const TEAL_BG = "#F0FDFA";

interface Props {
  open: boolean;
  languages: string[];
  onConfirm: (lang: string) => void;
  onClose: () => void;
}

const InterviewLanguageModal: React.FC<Props> = ({ open, languages, onConfirm, onClose }) => {
  const [selected, setSelected] = useState<string>(languages[0] ?? "en");
  const { t } = useTranslation('interview');

  React.useEffect(() => {
    if (open) setSelected(languages[0] ?? "en");
  }, [open, languages]);

  const isMulti = languages.length > 1;
  const singleLang = LANG_META[languages[0]];
  const selectedMeta = LANG_META[selected];

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="w-[420px] max-w-[95vw] p-0 overflow-hidden rounded-[20px] shadow-[0_32px_80px_rgba(0,0,0,0.14)]">
        <div className="h-1" style={{ background: `linear-gradient(90deg, ${TEAL}, #0891B2)` }} />

        <div className="p-6">
          {/* Icon + title */}
          <div className="text-center mb-6">
            <div
              className="w-12 h-12 rounded-[14px] mx-auto mb-4 flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${TEAL_BG}, #E0F2FE)`, border: "1.5px solid #99F6E4" }}
            >
              <TranslateOutlined size={24} color={TEAL} />
            </div>

            <p className="text-[16px] font-extrabold text-[#111827] tracking-[-0.01em]">
              {isMulti ? t('lang_modal.title_multi') : t('lang_modal.title_single')}
            </p>

            <p className="text-[12.5px] text-[#6B7280] mt-1.5 leading-[1.65] px-4">
              {isMulti ? t('lang_modal.desc_multi') : t('lang_modal.desc_single')}
            </p>
          </div>

          {/* ── Multi: language picker ── */}
          {isMulti && (
            <>
              <div
                className="grid gap-2.5 mb-4"
                style={{ gridTemplateColumns: `repeat(${Math.min(languages.length, 3)}, 1fr)` }}
              >
                {languages.map((code) => {
                  const meta = LANG_META[code];
                  if (!meta) return null;
                  const active = selected === code;
                  return (
                    <div
                      key={code}
                      onClick={() => setSelected(code)}
                      className={cn(
                        "cursor-pointer rounded-[14px] flex flex-col items-center gap-1.5 relative transition-all duration-[180ms] ease-out border-2 hover:-translate-y-px",
                        active ? "border-teal-600 bg-[#F0FDFA]" : "border-[#E5E7EB] bg-[#FAFAFA] hover:border-teal-600 hover:bg-[#F0FDFA]",
                      )}
                      style={{ padding: "14px 10px" }}
                    >
                      {active && (
                        <div
                          className="absolute top-[7px] right-[7px] w-[18px] h-[18px] rounded-full flex items-center justify-center"
                          style={{ backgroundColor: TEAL, boxShadow: "0 2px 6px rgba(13,148,136,0.4)" }}
                        >
                          <CheckOutlined size={11} color="#fff" />
                        </div>
                      )}
                      <img
                        src={`https://flagcdn.com/w40/${meta.flag}.png`}
                        srcSet={`https://flagcdn.com/w80/${meta.flag}.png 2x`}
                        width={36} height={26}
                        alt={meta.label}
                        style={{ borderRadius: 4, display: "block", boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }}
                      />
                      <div className="text-center">
                        <p className="text-[12.5px] leading-tight" style={{ fontWeight: active ? 800 : 600, color: active ? TEAL : "#111827" }}>
                          {meta.label}
                        </p>
                        <p className="text-[10.5px] mt-0.5" style={{ color: active ? "#0F766E" : "#9CA3AF" }}>
                          {meta.englishLabel}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedMeta && (
                <div className="flex items-center gap-3 px-3 py-2 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] mb-5">
                  <img
                    src={`https://flagcdn.com/w40/${selectedMeta.flag}.png`}
                    srcSet={`https://flagcdn.com/w80/${selectedMeta.flag}.png 2x`}
                    width={22} height={16}
                    alt={selectedMeta.label}
                    style={{ borderRadius: 2, display: "block", flexShrink: 0 }}
                  />
                  <span className="text-[12px] text-[#374151] flex-1">
                    {t('lang_modal.interviewing_in', { language: selectedMeta.label })}
                  </span>
                  <LockOutlined size={13} color="#94A3B8" className="shrink-0" />
                </div>
              )}
            </>
          )}

          {/* ── Single: info card ── */}
          {!isMulti && singleLang && (
            <div className="flex items-center gap-4 p-4 mb-5 rounded-[14px]" style={{ backgroundColor: TEAL_BG, border: "1.5px solid #99F6E4" }}>
              <img
                src={`https://flagcdn.com/w40/${singleLang.flag}.png`}
                srcSet={`https://flagcdn.com/w80/${singleLang.flag}.png 2x`}
                width={40} height={29}
                alt={singleLang.label}
                style={{ borderRadius: 4, display: "block", flexShrink: 0, boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }}
              />
              <div className="flex-1">
                <p className="text-[14px] font-extrabold leading-tight" style={{ color: TEAL }}>
                  {singleLang.label}
                  <span className="font-medium text-[11.5px] ml-2" style={{ color: "#0F766E" }}>
                    ({singleLang.englishLabel})
                  </span>
                </p>
                <p className="text-[11.5px] mt-1 leading-relaxed" style={{ color: "#0F766E" }}>
                  {t('lang_modal.single_lang_note')}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2.5">
            <Button onClick={onClose} variant="outline" className="flex-1">
              {t('lang_modal.btn_back')}
            </Button>

            <Button
              onClick={() => onConfirm(selected)}
              variant="default"
              className="flex-1"
            >
              {isMulti
                ? t('lang_modal.btn_start_in', { language: selectedMeta?.label ?? selected })
                : t('lang_modal.btn_start')}
              <ArrowForwardOutlined size={15} />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InterviewLanguageModal;
