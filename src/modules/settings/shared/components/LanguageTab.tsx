import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { CheckCircle2, Sparkles, HelpCircle } from "lucide-react";
import SectionTitle from "./SectionTitle";
import Spinner from "./Spinner";
import { useLanguage } from "@/hooks/useLanguage";
import { SUPPORTED_LANGS } from "@/modules/shared/constants/languages";
import { GENERATE_LANG_KEY } from "@/modules/company/posts/create/components/GenerateLanguageModal";
import type { SupportedLanguage } from "@/i18n/config";

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
      await changeLanguage(code as SupportedLanguage);
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

  const cardClass = (active: boolean) =>
    `relative w-[180px] rounded-2xl border-2 p-5 flex flex-col items-center gap-2 transition-colors ${
      saving ? "cursor-wait" : "cursor-pointer"
    } ${
      active
        ? "border-teal-600 bg-teal-50"
        : `border-gray-200 bg-white ${saving ? "" : "hover:border-teal-300 hover:bg-teal-50"}`
    }`;

  const centered = centerInterfaceVertically && !showGenerateLanguage;

  return (
    <div
      className={`p-5 md:p-6 bg-white rounded-[20px] border border-gray-200 shadow-[0_14px_32px_rgba(2,6,23,0.07)] bg-gradient-to-b from-white to-[#F8FCFC] ${
        centered ? "flex flex-col justify-center min-h-[55vh]" : ""
      }`}
    >
      <SectionTitle
        title={t("pages.settings.language.title")}
        subtitle={t("pages.settings.language.subtitle")}
      />

      <div className="flex flex-wrap gap-4 mt-1">
        {SUPPORTED_LANGS.map((lang) => {
          const active = selected === lang.code;
          const loading = saving === lang.code;
          return (
            <div key={lang.code} onClick={() => handleSelect(lang.code)} className={cardClass(active)}>
              <div className="absolute top-2.5 right-2.5">
                {loading ? (
                  <Spinner size={16} />
                ) : (
                  active && <CheckCircle2 size={18} className="text-teal-600" />
                )}
              </div>
              <Image
                src={`https://flagcdn.com/w80/${lang.flag}.png`}
                width={48}
                height={32}
                alt={lang.label}
                className="rounded block"
                unoptimized
              />
              <p className={`font-bold text-[0.95rem] ${active ? "text-teal-600" : "text-gray-900"}`}>
                {lang.label}
              </p>
              <p className="text-[0.72rem] text-gray-500 text-center">
                {t(`pages.settings.language.desc_${lang.code}`, { defaultValue: "" })}
              </p>
            </div>
          );
        })}
      </div>

      <p className="mt-5 text-[0.75rem] text-gray-400">
        {t("pages.settings.language.save_hint")}
      </p>

      {showGenerateLanguage && (
        <>
          <hr className="my-7 border-gray-200" />

          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center">
              <Sparkles size={15} className="text-teal-600" />
            </div>
            <p className="text-[0.9rem] font-bold text-gray-900">
              {t("pages.settings.generate_lang.title")}
            </p>
          </div>
          <p className="text-[0.78rem] text-gray-400 mb-5">
            {t("pages.settings.generate_lang.subtitle")}
          </p>

          <div className="flex flex-wrap gap-4">
            <div onClick={() => handleSetGenerateLang(null)} className={cardClass(generateLang === null)}>
              {generateLang === null && (
                <CheckCircle2 size={18} className="absolute top-2.5 right-2.5 text-teal-600" />
              )}
              <div
                className={`w-12 h-8 rounded border flex items-center justify-center transition-colors ${
                  generateLang === null ? "bg-teal-50 border-teal-200" : "bg-gray-100 border-gray-200"
                }`}
              >
                <HelpCircle size={18} className={generateLang === null ? "text-teal-600" : "text-gray-400"} />
              </div>
              <p
                className={`font-bold text-[0.95rem] text-center ${
                  generateLang === null ? "text-teal-600" : "text-gray-900"
                }`}
              >
                {t("pages.settings.generate_lang.always_ask_label")}
              </p>
              <p className="text-[0.72rem] text-gray-500 text-center">
                {t("pages.settings.generate_lang.always_ask_desc")}
              </p>
            </div>

            {SUPPORTED_LANGS.map((lang) => {
              const active = generateLang === lang.code;
              return (
                <div key={lang.code} onClick={() => handleSetGenerateLang(lang.code)} className={cardClass(active)}>
                  {active && (
                    <CheckCircle2 size={18} className="absolute top-2.5 right-2.5 text-teal-600" />
                  )}
                  <Image
                    src={`https://flagcdn.com/w80/${lang.flag}.png`}
                    width={48}
                    height={32}
                    alt={lang.label}
                    className="rounded block"
                    unoptimized
                  />
                  <p className={`font-bold text-[0.95rem] ${active ? "text-teal-600" : "text-gray-900"}`}>
                    {lang.label}
                  </p>
                  <p className="text-[0.72rem] text-gray-500 text-center">
                    {t(`pages.settings.generate_lang.lang_desc_${lang.code}`)}
                  </p>
                </div>
              );
            })}
          </div>

          <p className="mt-5 text-[0.75rem] text-gray-400">
            {t("pages.settings.generate_lang.save_hint")}
          </p>
        </>
      )}
    </div>
  );
};

export default LanguageTab;
