import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { WebinarQuestionSlide } from "./WebinarQuestionSlide";
import { WebinarSnapshot } from "../report/WebinarSnapshot";
import { ChevronIcon, CheckIcon } from "../shared/icons";
import { useSaveWebinarProgressMutation, useCompleteWebinarMutation } from "@/modules/webinar/queries";
import i18n from "@/i18n/config";
import type { WebinarContact, WebinarData, WebinarScoring } from "@/modules/webinar/types";

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
export function WebinarFunnel({ webinar, lang, initialContact, initialSubmissionId, initialConsent, welcomeBack }: {
  webinar: WebinarData;
  lang: "fr" | "en";
  initialContact: WebinarContact;
  initialSubmissionId: string;
  initialConsent: boolean;
  /** True when this submission already existed (matched by email) before this
   * session started it — shown as a one-time banner on the first question. */
  welcomeBack: boolean;
}) {
  const router = useRouter();
  const t = i18n.getFixedT(lang, "webinar");

  const questions = [...webinar.questions].sort((a, b) => a.order - b.order);
  const total     = questions.length;

  const [stepIdx,      setStepIdx]  = useState(0);
  const [consent,      setConsent]  = useState(initialConsent);
  const [contact,      setContact]  = useState(initialContact);
  const [submissionId, setSubId]    = useState(initialSubmissionId);
  const [answers,      setAnswers]  = useState<Record<string, unknown>>({});
  const [scoring,      setScoring]  = useState<WebinarScoring | null>(null);

  const saveProgress = useSaveWebinarProgressMutation();
  const complete     = useCompleteWebinarMutation();
  const saving       = saveProgress.isPending || complete.isPending;

  const firstName  = contact.nom?.trim().split(" ")[0];
  const isSnapshot = stepIdx === total;
  const isQuestion = !isSnapshot;
  const qIdx       = isQuestion ? stepIdx : -1;
  const currentQ   = qIdx >= 0 ? questions[qIdx] : null;

  const persistSubId = (id: string) => {
    setSubId(id);
    localStorage.setItem("webinar_submission_id", id);
  };

  const saveStep = useCallback(async (patch: Record<string, unknown> = {}): Promise<string | null> => {
    const merged = { ...answers, ...patch };
    const res = await saveProgress.mutateAsync({
      submissionId,
      webinarId: webinar._id, lang, consent,
      contact: contact.email.trim() ? contact : undefined,
      answers: merged as Record<string, string | number>,
      source: {
        utm_source:   (router.query.utm_source as string) || "",
        utm_campaign: (router.query.utm_campaign as string) || "",
      },
    });
    persistSubId(res.submissionId);
    setAnswers(merged);
    return res.submissionId;
  }, [webinar._id, submissionId, lang, consent, contact, answers, router.query, saveProgress]);

  // subId param lets callers pass the fresh ID returned by saveStep directly,
  // bypassing the stale React state closure (which still holds the pre-save value).
  const handleComplete = useCallback(async (subId?: string) => {
    const id = subId ?? submissionId;
    if (!id) return;
    const sub = await complete.mutateAsync({ submissionId: id, answers: answers as Record<string, string | number> });
    setScoring(sub.scoring ?? null);
    localStorage.removeItem("webinar_submission_id");
    sessionStorage.removeItem("webinar_contact");
    sessionStorage.removeItem("webinar_consent");
    setStepIdx(total);
  }, [submissionId, answers, total, complete]);

  const goTo   = useCallback((idx: number) => setStepIdx(idx), []);
  const goNext = useCallback(() => goTo(stepIdx + 1), [stepIdx, goTo]);
  const goBack = useCallback(() => goTo(Math.max(0, stepIdx - 1)), [stepIdx, goTo]);

  const saveAndNext = useCallback(async (patch: Record<string, unknown> = {}) => {
    await saveStep(patch);
    goNext();
  }, [saveStep, goNext]);

  const handleLastQuestion = useCallback(async () => {
    const freshId = currentQ ? await saveStep({ [currentQ.key]: answers[currentQ.key] }) : null;
    await handleComplete(freshId ?? undefined);
  }, [currentQ, saveStep, answers, handleComplete]);

  const handleNavNext = useCallback(() => {
    if (!currentQ) return;
    if (qIdx === total - 1) handleLastQuestion();
    else saveAndNext({ [currentQ.key]: answers[currentQ.key] });
  }, [currentQ, qIdx, total, handleLastQuestion, saveAndNext, answers]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || isSnapshot || !currentQ) return;
      // Auto-advancing choice questions don't need Enter — but a "choice"
      // question with no options defined renders as free text (see
      // WebinarQuestionSlide's hasChoiceOptions) and does need it.
      if (currentQ.type === "choice" && (currentQ.options?.length ?? 0) > 0) return;
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
              onNext={qIdx === total - 1 ? handleLastQuestion : () => saveAndNext({ [currentQ.key]: answers[currentQ.key] })}
              saving={saving} isLast={qIdx === total - 1} active
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop nav arrows */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-40 hidden md:flex">
        <button onClick={goBack} disabled={stepIdx <= 0}
          className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md text-slate-400 hover:text-slate-700 hover:border-slate-300 disabled:opacity-30 transition-all flex items-center justify-center">
          <ChevronIcon dir="up" />
        </button>
        <button onClick={handleNavNext}
          disabled={!!(currentQ?.required && !hasAnswer(answers[currentQ?.key]))}
          className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md text-slate-400 hover:text-slate-700 hover:border-slate-300 disabled:opacity-30 transition-all flex items-center justify-center">
          <ChevronIcon dir="down" />
        </button>
      </div>
    </div>
  );
}
