import React, { useEffect, useState } from "react";
import { Box, Button, Dialog, Typography } from "@mui/material";
import TranslateOutlined from "@mui/icons-material/Translate";
import CheckOutlined from "@mui/icons-material/CheckOutlined";
import ArrowForwardOutlined from "@mui/icons-material/ArrowForwardOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";
import { LANG_META } from "@/constants/languages";
import { useTranslation } from "react-i18next";
import { SX, TEAL } from "../../styles/interviewLanguageModal.styles";

// ─── Sub-components ───────────────────────────────────────────────────────────

const FlagImg: React.FC<{ flag: string; label: string; width: number; height: number; style?: React.CSSProperties }> = ({ flag, label, width, height, style }) => (
  <img
    src={`https://flagcdn.com/w40/${flag}.png`}
    srcSet={`https://flagcdn.com/w80/${flag}.png 2x`}
    width={width} height={height}
    alt={label}
    style={{ borderRadius: 4, display: "block", ...style }}
  />
);

interface LangCardProps { code: string; active: boolean; onSelect: () => void; }

const LangCard: React.FC<LangCardProps> = ({ code, active, onSelect }) => {
  const meta = LANG_META[code];
  if (!meta) return null;
  return (
    <Box onClick={onSelect} sx={active ? SX.langCardActive : SX.langCardInactive}>
      {active && (
        <Box sx={SX.checkBadge}>
          <CheckOutlined sx={{ fontSize: 11, color: "#fff" }} />
        </Box>
      )}
      <FlagImg flag={meta.flag} label={meta.label} width={36} height={26} style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }} />
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
};

// ─── Component ────────────────────────────────────────────────────────────────

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
    <Dialog open={open} onClose={onClose} slotProps={{ paper: { sx: SX.paper } }}>
      <Box sx={{ height: 4, background: `linear-gradient(90deg, ${TEAL}, #0891B2)` }} />

      <Box sx={{ p: 3 }}>
        {/* Icon + title */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Box sx={SX.iconBox}>
            <TranslateOutlined sx={{ fontSize: 24, color: TEAL }} />
          </Box>
          <Typography sx={SX.title}>
            {isMulti ? t("lang_modal.title_multi") : t("lang_modal.title_single")}
          </Typography>
          <Typography sx={SX.desc}>
            {isMulti ? t("lang_modal.desc_multi") : t("lang_modal.desc_single")}
          </Typography>
        </Box>

        {/* Multi: language picker */}
        {isMulti && (
          <>
            <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(languages.length, 3)}, 1fr)`, gap: 1.25, mb: 2 }}>
              {languages.map((code) => (
                <LangCard key={code} code={code} active={selected === code} onSelect={() => setSelected(code)} />
              ))}
            </Box>

            {selectedMeta && (
              <Box sx={SX.selectedBanner}>
                <FlagImg flag={selectedMeta.flag} label={selectedMeta.label} width={22} height={16} style={{ borderRadius: 2, flexShrink: 0 }} />
                <Typography sx={{ fontSize: "12px", color: "#374151", flex: 1 }}>
                  {t("lang_modal.interviewing_in", { language: selectedMeta.label })}
                </Typography>
                <LockOutlined sx={{ fontSize: 13, color: "#94A3B8", flexShrink: 0 }} />
              </Box>
            )}
          </>
        )}

        {/* Single: info card */}
        {!isMulti && singleLang && (
          <Box sx={SX.singleCard}>
            <FlagImg flag={singleLang.flag} label={singleLang.label} width={40} height={29} style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.12)", flexShrink: 0 }} />
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: "14px", fontWeight: 800, color: TEAL, lineHeight: 1.2 }}>
                {singleLang.label}
                <Box component="span" sx={{ fontWeight: 500, fontSize: "11.5px", color: "#0F766E", ml: 1 }}>
                  ({singleLang.englishLabel})
                </Box>
              </Typography>
              <Typography sx={{ fontSize: "11.5px", color: "#0F766E", mt: 0.4, lineHeight: 1.5 }}>
                {t("lang_modal.single_lang_note")}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Actions */}
        <Box sx={{ display: "flex", gap: 1.25 }}>
          <Button onClick={onClose} sx={SX.btnBack}>
            {t("lang_modal.btn_back")}
          </Button>
          <Button fullWidth variant="contained" endIcon={<ArrowForwardOutlined sx={{ fontSize: "15px !important" }} />}
            onClick={() => onConfirm(selected)} sx={SX.btnConfirm}>
            {isMulti ? t("lang_modal.btn_start_in", { language: selectedMeta?.label ?? selected }) : t("lang_modal.btn_start")}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default InterviewLanguageModal;