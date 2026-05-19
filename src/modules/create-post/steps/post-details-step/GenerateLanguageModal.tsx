import React, { useEffect, useState } from "react";
import { Box, Button, Dialog, Typography } from "@mui/material";
import AutoAwesomeOutlined from "@mui/icons-material/AutoAwesomeOutlined";
import CheckBoxOutlined from "@mui/icons-material/CheckBoxOutlined";
import CheckBoxOutlineBlankOutlined from "@mui/icons-material/CheckBoxOutlineBlank";
import CircularProgress from "@mui/material/CircularProgress";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGS } from "@/constants/languages";

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
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      PaperProps={{
        sx: {
          borderRadius: "18px",
          width: 360,
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
          <AutoAwesomeOutlined sx={{ fontSize: 22, color: TEAL }} />
        </Box>
        <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
          {t("create.lang_modal.title")}
        </Typography>
        <Typography sx={{ fontSize: "12.5px", color: "#6B7280", mt: 0.5 }}>
          {t("create.lang_modal.subtitle")}
        </Typography>
      </Box>

      {/* Language toggle */}
      <Box
        sx={{
          display: "flex",
          bgcolor: "#F3F4F6",
          borderRadius: "12px",
          p: "4px",
          mb: 2.5,
        }}
      >
        {SUPPORTED_LANGS.map((lang) => {
          const active = selected === lang.code;
          return (
            <Box
              key={lang.code}
              onClick={() => !loading && setSelected(lang.code)}
              sx={{
                flex: 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75,
                py: 1, borderRadius: "9px",
                cursor: loading ? "default" : "pointer",
                bgcolor: active ? "#fff" : "transparent",
                boxShadow: active ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.18s",
              }}
            >
              <img
                src={`https://flagcdn.com/w40/${lang.flag}.png`}
                srcSet={`https://flagcdn.com/w80/${lang.flag}.png 2x`}
                width={24} height={16} alt={lang.label}
                style={{ borderRadius: 2, display: "block" }}
              />
              <Typography sx={{ fontSize: "13px", fontWeight: active ? 700 : 500, color: active ? "#111827" : "#6B7280" }}>
                {lang.label}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Save as default checkbox */}
      <Box
        onClick={() => !loading && setSaveAsDefault((v) => !v)}
        sx={{
          display: "flex", alignItems: "center", gap: 1,
          cursor: loading ? "default" : "pointer",
          px: 1, py: 0.75, mb: 2.5,
          borderRadius: "10px",
          border: `1px solid ${saveAsDefault ? TEAL : "#E5E7EB"}`,
          bgcolor: saveAsDefault ? TEAL_BG : "#FAFAFA",
          transition: "all 0.15s",
          userSelect: "none",
        }}
      >
        {saveAsDefault
          ? <CheckBoxOutlined sx={{ fontSize: 18, color: TEAL, flexShrink: 0 }} />
          : <CheckBoxOutlineBlankOutlined sx={{ fontSize: 18, color: "#9CA3AF", flexShrink: 0 }} />}
        <Box>
          <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: saveAsDefault ? TEAL : "#374151", lineHeight: 1.3 }}>
            Always use this language
          </Typography>
          <Typography sx={{ fontSize: "11px", color: "#9CA3AF", lineHeight: 1.3 }}>
            Skip this dialog next time — change anytime in Settings
          </Typography>
        </Box>
      </Box>

      {/* Actions */}
      <Box sx={{ display: "flex", gap: 1.25 }}>
        <Button
          fullWidth
          onClick={onClose}
          disabled={loading}
          sx={{
            textTransform: "none", fontWeight: 600, fontSize: "13px",
            borderRadius: "10px", height: 42,
            color: "#6B7280", border: "1px solid #E5E7EB",
            "&:hover": { bgcolor: "#F9FAFB", borderColor: "#D1D5DB" },
          }}
        >
          {t("create.lang_modal.btn_cancel")}
        </Button>

        <Button
          fullWidth
          variant="contained"
          onClick={handleConfirm}
          disabled={loading}
          startIcon={
            loading
              ? <CircularProgress size={14} sx={{ color: "#fff" }} />
              : <AutoAwesomeOutlined sx={{ fontSize: 15 }} />
          }
          sx={{
            textTransform: "none", fontWeight: 700, fontSize: "13px",
            borderRadius: "10px", height: 42,
            bgcolor: TEAL, color: "#fff", boxShadow: "none",
            "&:hover": { bgcolor: "#0F766E", boxShadow: "0 4px 12px rgba(13,148,136,0.25)" },
            "&.Mui-disabled": { bgcolor: TEAL, opacity: 0.65, color: "#fff" },
          }}
        >
          {loading ? t("create.lang_modal.btn_generating") : t("create.lang_modal.btn_generate")}
        </Button>
      </Box>
    </Dialog>
  );
};

export default GenerateLanguageModal;
