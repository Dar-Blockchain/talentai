"use client";

import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { setEmploymentType, setExpirationDate, setPromptDescription, setWorkMode, updateSalaryField, setGeneratedPost } from "../store/createPostSlice";
import { AppDispatch, RootState } from "@/store/store";
import GenerateLanguageModal, { GENERATE_LANG_KEY } from "./GenerateLanguageModal";
import CardHeader from "./post-description/CardHeader";
import PromptField from "./post-description/PromptField";
import RoleFields from "./post-description/RoleFields";
import SalaryFields from "./post-description/SalaryFields";
import GenerateButton from "./post-description/GenerateButton";
import { useGeneratePostMutation, postKeys, NormalizedGeneratedPost } from "../queries/useCreatePostQueries";
import { useToast } from "@/hooks/useToast";

interface PostDescriptionProps {
  onGeneratingChange?: (generating: boolean) => void;
}

const PostDescription = ({ onGeneratingChange }: PostDescriptionProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();
  const { promptDescription, salary, workMode, employmentType, expirationDate, interviewLanguages } = useSelector(
    (state: RootState) => state.postGeneration,
    shallowEqual
  );
  const { t } = useTranslation("posts");

  const { showToast } = useToast();
  const generateMutation = useGeneratePostMutation();
  const loading = generateMutation.isPending;
  const [errors, setErrors] = useState({ promptDescription: "", salary: "", employmentType: "", workMode: "" });
  const [langModalOpen, setLangModalOpen] = useState(false);
  const clear = (key: string) => setErrors((prev) => ({ ...prev, [key]: "" }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!promptDescription.trim()) e.promptDescription = t("create.form.error_prompt");
    const isInternship = employmentType === "Internship";
    const salaryMin = Number(salary.min);
    const salaryMax = Number(salary.max);
    if (!salary.currency || (!isInternship && (!salary.min || !salary.max))) {
      e.salary = t("create.form.error_salary_required");
    } else if (!isInternship && salaryMax <= salaryMin) {
      e.salary = t("create.form.error_salary_max");
    }
    if (!employmentType) e.employmentType = t("create.form.error_required");
    if (!workMode) e.workMode = t("create.form.error_required");
    setErrors((prev) => ({ ...prev, ...e }));
    return Object.keys(e).length === 0;
  };

  const handleConfirmLanguage = (language: string) => {
    onGeneratingChange?.(true);
    generateMutation.mutate(
      { jobDescription: promptDescription, salary, workMode, contractType: employmentType, language, interviewLanguages },
      {
        onSuccess: () => {
          // mutation's own onSuccess sets cache first; read the normalized result from it
          const cached = queryClient.getQueryData<NormalizedGeneratedPost>(postKeys.generated());
          if (cached) dispatch(setGeneratedPost({ post: cached.post, language: cached.language }));
        },
        onSettled: () => onGeneratingChange?.(false),
        onError: (err: unknown) => {
          const errorCode = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
          if (errorCode === "invalid_input") {
            setErrors((prev) => ({ ...prev, promptDescription: t("create.form.error_invalid_input") }));
          } else if (errorCode === "insufficient_detail") {
            setErrors((prev) => ({ ...prev, promptDescription: t("create.form.error_insufficient_detail") }));
          } else {
            const message = err instanceof Error ? err.message : "Failed to generate job post. Please try again.";
            showToast({ message, severity: "error" });
          }
        },
      }
    );
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
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
      <CardHeader />

      <div className="flex flex-col gap-3.5 px-5 pt-4 pb-0">
        <PromptField
          value={promptDescription}
          error={errors.promptDescription}
          onChange={(val) => { dispatch(setPromptDescription(val)); clear("promptDescription"); }}
        />

        <hr className="border-t border-[#F3F4F6]" />

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
          employmentType={employmentType}
        />
      </div>

      <GenerateButton loading={loading} onClick={handleGenerate} />

      <GenerateLanguageModal
        open={langModalOpen}
        loading={loading}
        onConfirm={handleConfirmLanguage}
        onClose={() => setLangModalOpen(false)}
      />
    </div>
  );
};

export default PostDescription;
