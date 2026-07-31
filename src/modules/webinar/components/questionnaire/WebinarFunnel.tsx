import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WebinarQuestionSlide } from "./WebinarQuestionSlide";
import { WebinarSnapshot } from "../report/WebinarSnapshot";
import { CheckIcon } from "../shared/icons";
import { useCompleteWebinarMutation } from "@/modules/webinar/queries";
import i18n from "@/i18n/config";
import type { WebinarContact, WebinarData, WebinarScoring } from "@/modules/webinar/types";

const ANSWERS_STORAGE_KEY = "webinar_answers";

const loadStoredAnswers = (): Record<string, unknown> => {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem(ANSWERS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const EASE = [0.32, 0.72, 0, 1] as const;

/** A multiselect answer is an array — "answered" means at least one pick,
 * not just "the key exists", since an empty array is still truthy. */
const hasAnswer = (v: unknown) => (Array.isArray(v) ? v.length > 0 : v !== undefined && v !== "");

/**
 * The questionnaire itself — one question at a time, then the AI snapshot.
 * Registration (contact/consent/submissionId) already happened before this
 * mounts, either via the register form or a resumed submission, so this
 * component owns only the step-by-step progress through it.
 */
export function WebinarFunnel({ webinar, lang, initialContact, initialSubmissionId, welcomeBack }: {
  webinar: WebinarData;
  lang: "fr" | "en";
  initialContact: WebinarContact;
  initialSubmissionId: string;
  initialConsent: boolean;
  /** True when this submission already existed (matched by email) before this
   * session started it — shown as a one-time banner on the first question. */
  welcomeBack: boolean;
}) {
  const t = i18n.getFixedT(lang, "webinar");

  const questions = [...webinar.questions].sort((a, b) => a.order - b.order);
  const total     = questions.length;

  const [stepIdx,      setStepIdx]  = useState(0);
  const [answers,      setAnswers]  = useState<Record<string, unknown>>(loadStoredAnswers);
  const [scoring,      setScoring]  = useState<WebinarScoring | null>(null);

  const complete = useCompleteWebinarMutation();
  const saving   = complete.isPending;

  const firstName  = initialContact.nom?.trim().split(" ")[0];
  const isSnapshot = stepIdx === total;
  const isQuestion = !isSnapshot;
  const qIdx       = isQuestion ? stepIdx : -1;
  const currentQ   = qIdx >= 0 ? questions[qIdx] : null;

  // Answers only ever live in localStorage while the questionnaire is in
  // progress — nothing is sent to the backend per-question. The full set
  // goes out in one shot on the last question, via handleComplete below.
  useEffect(() => {
    if (Object.keys(answers).length === 0) return;
    localStorage.setItem(ANSWERS_STORAGE_KEY, JSON.stringify(answers));
  }, [answers]);

  const handleComplete = useCallback(async () => {
    if (!initialSubmissionId) return;
    const sub = await complete.mutateAsync({
      submissionId: initialSubmissionId,
      answers: answers as Record<string, string | number>,
    });
    setScoring(sub.scoring ?? null);
    localStorage.removeItem("webinar_submission_id");
    localStorage.removeItem(ANSWERS_STORAGE_KEY);
    sessionStorage.removeItem("webinar_contact");
    sessionStorage.removeItem("webinar_consent");
    setStepIdx(total);
  }, [initialSubmissionId, answers, total, complete]);

  const goTo   = useCallback((idx: number) => setStepIdx(idx), []);
  const goNext = useCallback(() => goTo(stepIdx + 1), [stepIdx, goTo]);
  const goBack = useCallback(() => goTo(Math.max(0, stepIdx - 1)), [stepIdx, goTo]);

  const handleLastQuestion = useCallback(() => {
    handleComplete();
  }, [handleComplete]);

  const handleNavNext = useCallback(() => {
    if (!currentQ) return;
    if (qIdx === total - 1) handleLastQuestion();
    else goNext();
  }, [currentQ, qIdx, total, handleLastQuestion, goNext]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || isSnapshot || !currentQ) return;
      const hasVal = hasAnswer(answers[currentQ.key]);
      if (currentQ.required && !hasVal) return;
      handleNavNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentQ, answers, isSnapshot, handleNavNext]);

  if (isSnapshot) {
    return scoring
      ? <WebinarSnapshot scoring={scoring} lang={lang} />
      : (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-slate-400">
          <div className="w-10 h-10 border-2 border-[#6AD39C]/30 border-t-[#10453F] rounded-full animate-spin" />
          <p className="text-[14px]">{t("funnel.analysing")}</p>
        </div>
      );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 pt-10 md:pt-14">

      {welcomeBack && stepIdx === 0 && (
        <div className="mb-6 mx-auto max-w-[560px] flex items-start gap-3 rounded-2xl border border-[#6AD39C]/30 bg-[#EAF6F0] px-5 py-4 text-left">
          <span className="mt-0.5 shrink-0 text-[#10453F]"><CheckIcon /></span>
          <p className="text-[13.5px] text-[#10453F] leading-relaxed">
            {t("funnel.welcomeBack")}
          </p>
        </div>
      )}

      <div className="text-center mb-2">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="w-6 h-px bg-[#6AD39C]" />
          <span className="text-[11px] font-semibold uppercase text-[#10453F]" style={{ letterSpacing: "0.16em" }}>
            {t("funnel.letsBegin")}
          </span>
          <span className="w-6 h-px bg-[#6AD39C]" />
        </div>
        <h2
          className="text-[1.9rem] sm:text-[2.3rem] text-slate-900 leading-[1.15]"
          style={{ fontFamily: "var(--font-fraunces)", fontWeight: 600 }}
        >
          {firstName
            ? t("funnel.readyName", { name: firstName })
            : t("funnel.readyGeneric")}
        </h2>
        <p className="text-[15px] text-slate-500 leading-relaxed mt-3 max-w-[480px] mx-auto">
          {t("funnel.questionProgress", { current: qIdx + 1, total })}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {currentQ && (
          <motion.div key={currentQ.key}
            initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.35, ease: EASE }}>
            <WebinarQuestionSlide
              q={currentQ} idx={qIdx} total={total} lang={lang}
              value={answers[currentQ.key]}
              onChange={v => setAnswers(prev => ({ ...prev, [currentQ.key]: v }))}
              onBack={goBack}
              onNext={qIdx === total - 1 ? handleLastQuestion : goNext}
              saving={saving} isLast={qIdx === total - 1} active
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
