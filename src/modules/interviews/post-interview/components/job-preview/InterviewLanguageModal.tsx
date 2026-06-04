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
        <Typography sx={SX.langLabel(active)}>{meta.label}</Typography>
        <Typography sx={SX.langEnglishLabel(active)}>{meta.englishLabel}</Typography>
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
      <Box sx={SX.accentBar} />

      <Box sx={SX.body}>
        {/* Icon + title */}
        <Box sx={SX.headerBox}>
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
            <Box sx={SX.langGrid(languages.length)}>
              {languages.map((code) => (
                <LangCard key={code} code={code} active={selected === code} onSelect={() => setSelected(code)} />
              ))}
            </Box>

            {selectedMeta && (
              <Box sx={SX.selectedBanner}>
                <FlagImg flag={selectedMeta.flag} label={selectedMeta.label} width={22} height={16} style={{ borderRadius: 2, flexShrink: 0 }} />
                <Typography sx={SX.selectedText}>
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
              <Typography sx={SX.singleLangName}>
                {singleLang.label}
                <Box component="span" sx={SX.singleLangNameSpan}>
                  ({singleLang.englishLabel})
                </Box>
              </Typography>
              <Typography sx={SX.singleLangNote}>
                {t("lang_modal.single_lang_note")}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Actions */}
        <Box sx={SX.actionsRow}>
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
