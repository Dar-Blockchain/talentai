import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography, CircularProgress } from "@mui/material";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import { SectionTitle } from "./SettingsShared";
import { TEAL, TEAL_BG, TEAL_BORDER } from "./settingsConstants";
import { useLanguage, LANGUAGE_OPTIONS } from "@/hooks/useLanguage";

interface Props {
  onInputChange: (key: string, value: string) => void;
  onSaveLanguage: (lang: string) => Promise<void>;
}

const LanguageTab: React.FC<Props> = ({ onInputChange, onSaveLanguage }) => {
  const { t } = useTranslation("dashboard");
  const { currentLang, changeLanguage } = useLanguage();
  const [saving, setSaving] = useState<string | null>(null);

  const selected = currentLang;

  const handleSelect = async (code: string) => {
    if (code === selected || saving) return;
    setSaving(code);
    onInputChange("language", code);
    await changeLanguage(code as any);
    await onSaveLanguage(code);
    setSaving(null);
  };

  return (
    <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
      <SectionTitle
        title={t("pages.settings.language.title")}
        subtitle={t("pages.settings.language.subtitle")}
      />

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 1 }}>
        {LANGUAGE_OPTIONS.map((lang) => {
          const active = selected === lang.code;
          const loading = saving === lang.code;
          return (
            <Box
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              sx={{
                position: "relative",
                cursor: saving ? "wait" : "pointer",
                width: 180,
                border: active ? `2px solid ${TEAL}` : "2px solid #E5E7EB",
                borderRadius: "14px",
                bgcolor: active ? TEAL_BG : "#fff",
                p: 2.5,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
                transition: "border-color 0.15s, background 0.15s",
                "&:hover": saving ? {} : { borderColor: TEAL_BORDER, bgcolor: TEAL_BG },
              }}
            >
              <Box sx={{ position: "absolute", top: 10, right: 10 }}>
                {loading
                  ? <CircularProgress size={16} sx={{ color: TEAL }} />
                  : active && <CheckCircleOutlined sx={{ fontSize: 18, color: TEAL }} />
                }
              </Box>
              <img src={`https://flagcdn.com/w80/${lang.flag}.png`} srcSet={`https://flagcdn.com/w160/${lang.flag}.png 2x`} width={48} height={32} alt={lang.label} style={{ borderRadius: 4, display: 'block' }} />
              <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: active ? TEAL : "#111827" }}>
                {lang.label}
              </Typography>
              <Typography sx={{ fontSize: "0.72rem", color: "#6B7280", textAlign: "center" }}>
                {t(`pages.settings.language.desc_${lang.code}`, { defaultValue: "" })}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <Typography sx={{ mt: 2.5, fontSize: "0.75rem", color: "#9CA3AF" }}>
        {t("pages.settings.language.save_hint")}
      </Typography>
    </Box>
  );
};

export default LanguageTab;
