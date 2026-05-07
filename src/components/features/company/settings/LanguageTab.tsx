import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Divider, Typography, CircularProgress } from "@mui/material";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import AutoAwesomeOutlined from "@mui/icons-material/AutoAwesomeOutlined";
import HelpOutlineOutlined from "@mui/icons-material/HelpOutlineOutlined";
import { SectionTitle } from "./SettingsShared";
import { TEAL, TEAL_BG, TEAL_BORDER } from "./settingsConstants";
import { useLanguage } from "@/hooks/useLanguage";
import { SUPPORTED_LANGS } from "@/constants/languages";
import { GENERATE_LANG_KEY } from "@/components/features/company/posts/create/steps/post-details-step/GenerateLanguageModal";

interface Props {
  onInputChange: (key: string, value: string) => void;
  onSaveLanguage: (lang: string) => Promise<void>;
  showGenerateLanguage?: boolean;
  centerInterfaceVertically?: boolean;
}

const LanguageTab: React.FC<Props> = ({
  onInputChange,
  onSaveLanguage,
  showGenerateLanguage = true,
  centerInterfaceVertically = false,
}) => {
  const { t } = useTranslation("dashboard");
  const { currentLang, changeLanguage } = useLanguage();
  const [saving, setSaving] = useState<string | null>(null);

  const getGenerateLang = () =>
    typeof window !== "undefined" ? localStorage.getItem(GENERATE_LANG_KEY) : null;

  const [generateLang, setGenerateLang] = useState<string | null>(getGenerateLang);

  const selected = currentLang;

  const handleSelect = async (code: string) => {
    if (code === selected || saving) return;
    setSaving(code);
    try {
      onInputChange("language", code);
      await changeLanguage(code as any);
      await onSaveLanguage(code);
    } finally {
      setSaving(null);
    }
  };

  const handleSetGenerateLang = (code: string | null) => {
    if (code === null) {
      localStorage.removeItem(GENERATE_LANG_KEY);
    } else {
      localStorage.setItem(GENERATE_LANG_KEY, code);
    }
    setGenerateLang(code);
  };

  const cardSx = (active: boolean) => ({
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
  } as const);

  return (
    <Box
      sx={{
        p: { xs: 2, md: 2.5 },
        bgcolor: "#fff",
        borderRadius: "20px",
        border: "1px solid #E5E7EB",
        boxShadow: "0 14px 32px rgba(2,6,23,0.07)",
        background: "linear-gradient(180deg, #FFFFFF 0%, #F8FCFC 100%)",
        minHeight: centerInterfaceVertically && !showGenerateLanguage ? "55vh" : "auto",
        display: centerInterfaceVertically && !showGenerateLanguage ? "flex" : "block",
        flexDirection: centerInterfaceVertically && !showGenerateLanguage ? "column" : undefined,
        justifyContent: centerInterfaceVertically && !showGenerateLanguage ? "center" : undefined,
      }}
    >

      {/* ── UI Language ── */}
      <SectionTitle
        title={t("pages.settings.language.title")}
        subtitle={t("pages.settings.language.subtitle")}
      />

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 1 }}>
        {SUPPORTED_LANGS.map((lang) => {
          const active = selected === lang.code;
          const loading = saving === lang.code;
          return (
            <Box key={lang.code} onClick={() => handleSelect(lang.code)} sx={cardSx(active)}>
              <Box sx={{ position: "absolute", top: 10, right: 10 }}>
                {loading
                  ? <CircularProgress size={16} sx={{ color: TEAL }} />
                  : active && <CheckCircleOutlined sx={{ fontSize: 18, color: TEAL }} />}
              </Box>
              <img
                src={`https://flagcdn.com/w80/${lang.flag}.png`}
                srcSet={`https://flagcdn.com/w160/${lang.flag}.png 2x`}
                width={48} height={32} alt={lang.label}
                style={{ borderRadius: 4, display: "block" }}
              />
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

      {showGenerateLanguage && (
        <>
          <Divider sx={{ my: 3.5 }} />

          {/* ── AI Generate Language ── */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <Box sx={{
              width: 28, height: 28, borderRadius: "8px",
              bgcolor: TEAL_BG, border: `1px solid ${TEAL_BORDER}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <AutoAwesomeOutlined sx={{ fontSize: 15, color: TEAL }} />
            </Box>
            <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#111827" }}>
              {t("pages.settings.generate_lang.title")}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: "0.78rem", color: "#9CA3AF", mb: 2.5 }}>
            {t("pages.settings.generate_lang.subtitle")}
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {/* Always ask option */}
            <Box onClick={() => handleSetGenerateLang(null)} sx={cardSx(generateLang === null)}>
              {generateLang === null && (
                <CheckCircleOutlined sx={{ position: "absolute", top: 10, right: 10, fontSize: 18, color: TEAL }} />
              )}
              <Box sx={{
                width: 48, height: 32, borderRadius: "4px",
                bgcolor: generateLang === null ? TEAL_BG : "#F3F4F6",
                border: `1px solid ${generateLang === null ? TEAL_BORDER : "#E5E7EB"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
              }}>
                <HelpOutlineOutlined sx={{ fontSize: 18, color: generateLang === null ? TEAL : "#9CA3AF" }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: generateLang === null ? TEAL : "#111827", textAlign: "center" }}>
                {t("pages.settings.generate_lang.always_ask_label")}
              </Typography>
              <Typography sx={{ fontSize: "0.72rem", color: "#6B7280", textAlign: "center" }}>
                {t("pages.settings.generate_lang.always_ask_desc")}
              </Typography>
            </Box>

            {/* Language cards */}
            {SUPPORTED_LANGS.map((lang) => {
              const active = generateLang === lang.code;
              return (
                <Box key={lang.code} onClick={() => handleSetGenerateLang(lang.code)} sx={cardSx(active)}>
                  {active && (
                    <CheckCircleOutlined sx={{ position: "absolute", top: 10, right: 10, fontSize: 18, color: TEAL }} />
                  )}
                  <img
                    src={`https://flagcdn.com/w80/${lang.flag}.png`}
                    srcSet={`https://flagcdn.com/w160/${lang.flag}.png 2x`}
                    width={48} height={32} alt={lang.label}
                    style={{ borderRadius: 4, display: "block" }}
                  />
                  <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: active ? TEAL : "#111827" }}>
                    {lang.label}
                  </Typography>
                  <Typography sx={{ fontSize: "0.72rem", color: "#6B7280", textAlign: "center" }}>
                    {t(`pages.settings.generate_lang.lang_desc_${lang.code}`)}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          <Typography sx={{ mt: 2.5, fontSize: "0.75rem", color: "#9CA3AF" }}>
            {t("pages.settings.generate_lang.save_hint")}
          </Typography>
        </>
      )}
    </Box>
  );
};

export default LanguageTab;
