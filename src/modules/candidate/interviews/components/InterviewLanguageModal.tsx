import React, { useState } from "react";
import { Box, Dialog, Typography } from "@mui/material";
import { Button } from "@/modules/shared/ui/shadcn/button";
import TranslateOutlined from "@mui/icons-material/Translate";
import CheckOutlined from "@mui/icons-material/CheckOutlined";
import ArrowForwardOutlined from "@mui/icons-material/ArrowForwardOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";
import { LANG_META } from "@/modules/shared/constants/languages";
import { useTranslation } from "react-i18next";

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
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { borderRadius: "20px", width: 420, maxWidth: "95vw", p: 0, overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.14)" },
      }}
    >
      <Box sx={{ height: 4, background: `linear-gradient(90deg, ${TEAL}, #0891B2)` }} />

      <Box sx={{ p: 3 }}>
        {/* Icon + title */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: "14px", background: `linear-gradient(135deg, ${TEAL_BG}, #E0F2FE)`, border: "1.5px solid #99F6E4", mx: "auto", mb: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TranslateOutlined sx={{ fontSize: 24, color: TEAL }} />
          </Box>

          <Typography sx={{ fontSize: "16px", fontWeight: 800, color: "#111827", letterSpacing: "-0.01em" }}>
            {isMulti ? t('lang_modal.title_multi') : t('lang_modal.title_single')}
          </Typography>

          <Typography sx={{ fontSize: "12.5px", color: "#6B7280", mt: 0.75, lineHeight: 1.65, px: 2 }}>
            {isMulti ? t('lang_modal.desc_multi') : t('lang_modal.desc_single')}
          </Typography>
        </Box>

        {/* ── Multi: language picker ── */}
        {isMulti && (
          <>
            <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(languages.length, 3)}, 1fr)`, gap: 1.25, mb: 2 }}>
              {languages.map((code) => {
                const meta = LANG_META[code];
                if (!meta) return null;
                const active = selected === code;
                return (
                  <Box
                    key={code}
                    onClick={() => setSelected(code)}
                    sx={{
                      cursor: "pointer",
                      border: `2px solid ${active ? TEAL : "#E5E7EB"}`,
                      borderRadius: "14px",
                      bgcolor: active ? TEAL_BG : "#FAFAFA",
                      p: "14px 10px",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 0.75,
                      position: "relative",
                      transition: "all 0.18s ease",
                      "&:hover": { borderColor: TEAL, bgcolor: TEAL_BG, transform: "translateY(-1px)" },
                    }}
                  >
                    {active && (
                      <Box sx={{ position: "absolute", top: 7, right: 7, width: 18, height: 18, borderRadius: "50%", bgcolor: TEAL, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(13,148,136,0.4)" }}>
                        <CheckOutlined sx={{ fontSize: 11, color: "#fff" }} />
                      </Box>
                    )}
                    <img
                      src={`https://flagcdn.com/w40/${meta.flag}.png`}
                      srcSet={`https://flagcdn.com/w80/${meta.flag}.png 2x`}
                      width={36} height={26}
                      alt={meta.label}
                      style={{ borderRadius: 4, display: "block", boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }}
                    />
                    <Box sx={{ textAlign: "center" }}>
                      <Typography sx={{ fontSize: "12.5px", fontWeight: active ? 800 : 600, color: active ? TEAL : "#111827", lineHeight: 1.2 }}>
                        {meta.label}
                      </Typography>
                      <Typography sx={{ fontSize: "10.5px", color: active ? "#0F766E" : "#9CA3AF", mt: 0.25 }}>
                        {meta.englishLabel}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {selectedMeta && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, px: 1.5, py: 1, borderRadius: "10px", bgcolor: "#F8FAFC", border: "1px solid #E2E8F0", mb: 2.5 }}>
                <img
                  src={`https://flagcdn.com/w40/${selectedMeta.flag}.png`}
                  srcSet={`https://flagcdn.com/w80/${selectedMeta.flag}.png 2x`}
                  width={22} height={16}
                  alt={selectedMeta.label}
                  style={{ borderRadius: 2, display: "block", flexShrink: 0 }}
                />
                <Typography sx={{ fontSize: "12px", color: "#374151", flex: 1 }}>
                  {t('lang_modal.interviewing_in', { language: selectedMeta.label })}
                </Typography>
                <LockOutlined sx={{ fontSize: 13, color: "#94A3B8", flexShrink: 0 }} />
              </Box>
            )}
          </>
        )}

        {/* ── Single: info card ── */}
        {!isMulti && singleLang && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 2, mb: 2.5, borderRadius: "14px", bgcolor: TEAL_BG, border: "1.5px solid #99F6E4" }}>
            <img
              src={`https://flagcdn.com/w40/${singleLang.flag}.png`}
              srcSet={`https://flagcdn.com/w80/${singleLang.flag}.png 2x`}
              width={40} height={29}
              alt={singleLang.label}
              style={{ borderRadius: 4, display: "block", flexShrink: 0, boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: "14px", fontWeight: 800, color: TEAL, lineHeight: 1.2 }}>
                {singleLang.label}
                <Box component="span" sx={{ fontWeight: 500, fontSize: "11.5px", color: "#0F766E", ml: 1 }}>
                  ({singleLang.englishLabel})
                </Box>
              </Typography>
              <Typography sx={{ fontSize: "11.5px", color: "#0F766E", mt: 0.4, lineHeight: 1.5 }}>
                {t('lang_modal.single_lang_note')}
              </Typography>
            </Box>
          </Box>
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
            <ArrowForwardOutlined sx={{ fontSize: "15px !important" }} />
          </Button>
        </div>
      </Box>
    </Dialog>
  );
};

export default InterviewLanguageModal;
