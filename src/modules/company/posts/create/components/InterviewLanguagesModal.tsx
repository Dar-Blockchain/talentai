import React, { useState } from "react";
import { Box, Button, Dialog, Typography } from "@mui/material";
import MicOutlined from "@mui/icons-material/MicOutlined";
import CheckOutlined from "@mui/icons-material/CheckOutlined";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGS } from "@/constants/languages";

const TEAL    = "#0D9488";
const TEAL_BG = "#F0FDFA";


interface Props {
  open: boolean;
  onConfirm: (languages: string[]) => void;
  onClose: () => void;
  initialLanguages?: string[];
  confirmLabel?: string;
}

const InterviewLanguagesModal: React.FC<Props> = ({ open, onConfirm, onClose, initialLanguages, confirmLabel }) => {
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
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          borderRadius: "18px",
          width: 400,
          maxWidth: "95vw",
          p: 3,
          boxShadow: "0 24px 64px rgba(0,0,0,0.12)",
        },
      }}
    >
      {/* Title */}
      <Box sx={{ textAlign: "center", mb: 2.5 }}>
        <Box
          sx={{
            width: 44, height: 44, borderRadius: "12px",
            bgcolor: TEAL_BG, mx: "auto", mb: 1.5,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <MicOutlined sx={{ fontSize: 22, color: TEAL }} />
        </Box>
        <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
          {t("create.interview_lang_modal.title")}
        </Typography>
        <Typography sx={{ fontSize: "12.5px", color: "#6B7280", mt: 0.5 }}>
          {t("create.interview_lang_modal.subtitle")}
        </Typography>
      </Box>

      {/* Language grid — multi-select */}
      <Typography sx={{ fontSize: "10.5px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em", mb: 1 }}>
        {t("create.interview_lang_modal.select_label")}
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mb: 2 }}>
        {SUPPORTED_LANGS.map((lang) => {
          const active = selected.includes(lang.code);
          return (
            <Box
              key={lang.code}
              onClick={() => toggle(lang.code)}
              sx={{
                cursor: "pointer",
                border: `1.5px solid ${active ? TEAL : "#E5E7EB"}`,
                borderRadius: "12px",
                bgcolor: active ? TEAL_BG : "#FAFAFA",
                p: 1.5,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.5,
                position: "relative",
                transition: "all 0.15s",
                "&:hover": { borderColor: TEAL, bgcolor: TEAL_BG },
              }}
            >
              {active && (
                <Box
                  sx={{
                    position: "absolute", top: 6, right: 6,
                    width: 16, height: 16, borderRadius: "50%",
                    bgcolor: TEAL,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <CheckOutlined sx={{ fontSize: 10, color: "#fff" }} />
                </Box>
              )}
              <img src={`https://flagcdn.com/w40/${lang.flag}.png`} srcSet={`https://flagcdn.com/w80/${lang.flag}.png 2x`} width={28} height={20} alt={lang.label} style={{ borderRadius: 2, display: "block" }} />
              <Typography
                sx={{
                  fontSize: "11.5px", fontWeight: active ? 700 : 500,
                  color: active ? TEAL : "#374151",
                  textAlign: "center", lineHeight: 1.2,
                }}
              >
                {lang.label}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Hint */}
      <Typography sx={{
        fontSize: "11px", textAlign: "center", mb: 2, lineHeight: 1.5,
        color: selected.length === 1 ? "#D97706" : "#059669",
        fontWeight: selected.length === 1 ? 500 : 400,
      }}>
        {selected.length === 1
          ? t("create.interview_lang_modal.hint_one")
          : t("create.interview_lang_modal.hint_other", { count: selected.length })}
      </Typography>

      {/* Actions */}
      <Box sx={{ display: "flex", gap: 1.25 }}>
        <Button
          fullWidth
          onClick={handleClose}
          sx={{
            textTransform: "none", fontWeight: 600, fontSize: "13px",
            borderRadius: "10px", height: 42,
            color: "#6B7280", border: "1px solid #E5E7EB",
            "&:hover": { bgcolor: "#F9FAFB", borderColor: "#D1D5DB" },
          }}
        >
          {t("create.interview_lang_modal.btn_cancel")}
        </Button>

        <Button
          fullWidth
          variant="contained"
          onClick={handleConfirm}
          sx={{
            textTransform: "none", fontWeight: 700, fontSize: "13px",
            borderRadius: "10px", height: 42,
            bgcolor: TEAL, color: "#fff", boxShadow: "none",
            whiteSpace: "nowrap",
            "&:hover": { bgcolor: "#0F766E", boxShadow: "0 4px 12px rgba(13,148,136,0.25)" },
          }}
        >
          {confirmLabel ?? t("create.interview_lang_modal.btn_save")}
        </Button>
      </Box>
    </Dialog>
  );
};

export default InterviewLanguagesModal;
