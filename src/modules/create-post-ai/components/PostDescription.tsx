"use client";

import { Box, Divider } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { generatePost, setEmploymentType, setExpirationDate, setPromptDescription, setWorkMode, updateSalaryField } from "@/store/slices/postGenerationSlice";
import { AppDispatch } from "@/store/store";
import GenerateLanguageModal, { GENERATE_LANG_KEY } from "./GenerateLanguageModal";
import CardHeader from "./post-description/CardHeader";
import PromptField from "./post-description/PromptField";
import RoleFields from "./post-description/RoleFields";
import SalaryFields from "./post-description/SalaryFields";
import GenerateButton from "./post-description/GenerateButton";

const PostDescription = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { promptDescription, salary, workMode, employmentType, expirationDate, loading } = useSelector(
    (state: any) => state.postGeneration
  );
  const { t } = useTranslation("posts");

  const [errors, setErrors] = useState({ promptDescription: "", salary: "", employmentType: "", workMode: "" });
  const [langModalOpen, setLangModalOpen] = useState(false);

  const clear = (key: string) => setErrors((prev) => ({ ...prev, [key]: "" }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!promptDescription.trim()) e.promptDescription = t("create.form.error_prompt");
    if (!salary.min || !salary.max || !salary.currency) {
      e.salary = t("create.form.error_salary_required");
    } else if (Number(salary.max) <= Number(salary.min)) {
      e.salary = t("create.form.error_salary_max");
    }
    if (!employmentType) e.employmentType = t("create.form.error_required");
    if (!workMode) e.workMode = t("create.form.error_required");
    setErrors(e as any);
    return Object.keys(e).length === 0;
  };

  const handleConfirmLanguage = (language: string) => {
    dispatch(generatePost({ jobDescription: promptDescription, salary, workMode, contractType: employmentType, language }));
    setLangModalOpen(false);
  };

  const handleGenerate = () => {
    if (!validate()) return;
    const savedLang = typeof window !== "undefined" ? localStorage.getItem(GENERATE_LANG_KEY) : null;
    if (savedLang) handleConfirmLanguage(savedLang);
    else setLangModalOpen(true);
  };

  const handleSalaryChange = (field: "min" | "max" | "currency", raw: string) => {
    let value: string | number = raw;
    if (field === "min" || field === "max") {
      const digits = raw.replace(/\D/g, "").replace(/^0+/, "");
      value = digits === "" ? 0 : Number(digits);
    }
    dispatch(updateSalaryField({ field, value }));
    clear("salary");
  };

  return (
    <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
      <CardHeader />

      <Box sx={{ px: 2.5, pt: 2, pb: 0, display: "flex", flexDirection: "column", gap: 1.75 }}>
        <PromptField
          value={promptDescription}
          error={errors.promptDescription}
          onChange={(val) => { dispatch(setPromptDescription(val)); clear("promptDescription"); }}
        />

        <Divider sx={{ borderColor: "#F3F4F6" }} />

        <RoleFields
          employmentType={employmentType}
          workMode={workMode}
          expirationDate={expirationDate}
          errors={{ employmentType: errors.employmentType, workMode: errors.workMode }}
          onEmploymentChange={(val) => { dispatch(setEmploymentType(val)); clear("employmentType"); }}
          onWorkModeChange={(val) => { dispatch(setWorkMode(val)); clear("workMode"); }}
          onExpirationChange={(val) => dispatch(setExpirationDate(val))}
        />

        <SalaryFields
          salary={salary}
          error={errors.salary}
          onChange={handleSalaryChange}
        />
      </Box>

      <GenerateButton loading={loading} onClick={handleGenerate} />

      <GenerateLanguageModal
        open={langModalOpen}
        loading={loading}
        onConfirm={handleConfirmLanguage}
        onClose={() => setLangModalOpen(false)}
      />
    </Box>
  );
};

export default PostDescription;
