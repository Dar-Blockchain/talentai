import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/modules/shared/ui/shadcn/dialog";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { X as CloseIcon } from "lucide-react";
import { webinarBasicsSchema, type WebinarBasicsForm } from "../schemas/webinarBasicsSchema";
import { EMPTY_FORM, STEPS, newQuestion, findInvalidQuestion, questionErrorMessage } from "../utils/webinarForm";
import { WebinarBasicsStep } from "./form/WebinarBasicsStep";
import { WebinarContentStep } from "./form/WebinarContentStep";
import { WebinarQuestionsStep } from "./form/WebinarQuestionsStep";
import type { WebinarFormValues, WebinarQuestionDraft } from "../types";

function basicsDefaults(f: WebinarFormValues) {
  return {
    title_fr: f.title_fr,
    title_en: f.title_en,
    description_fr: f.description_fr,
    description_en: f.description_en,
    about_fr: f.about_fr,
    about_en: f.about_en,
    highlights_fr: f.highlights_fr,
    highlights_en: f.highlights_en,
    highlights_enabled: f.highlights_enabled,
    date: f.date,
    start_time: f.start_time,
    end_time: f.end_time,
    lang: f.lang,
    webinar_link: f.webinar_link,
    target_min: f.target_min,
    target_max: f.target_max,
  };
}

// All fields collected on the Content step — every one of them is required
// (per the webinar's language) before the admin can move on to Questions.
const CONTENT_FIELDS = [
  "title_fr",
  "title_en",
  "description_fr",
  "description_en",
  "about_fr",
  "about_en",
  "highlights_fr",
  "highlights_en",
  "highlights_enabled",
] as const;

export function WebinarFormDialog({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: WebinarFormValues | null;
  onClose: () => void;
  onSave: (v: WebinarFormValues) => void;
  saving: boolean;
}) {
  const [form, setForm] = React.useState<WebinarFormValues>(initial ?? EMPTY_FORM);
  const [step, setStep] = React.useState(0);

  const {
    control: basicsControl,
    handleSubmit: handleBasicsSubmit,
    reset: resetBasics,
    trigger: triggerBasics,
    setValue: setBasicsValue,
    formState: { errors: basicsErrors },
  } = useForm<WebinarBasicsForm>({
    resolver: zodResolver(webinarBasicsSchema),
    mode: "onChange",
    defaultValues: basicsDefaults(initial ?? EMPTY_FORM),
  });

  React.useEffect(() => {
    const f = initial ?? EMPTY_FORM;
    setForm(f);
    setStep(0);
    resetBasics(basicsDefaults(f));
  }, [initial, open, resetBasics]);

  // The Content step's inputs aren't wired through RHF `Controller`s — mirror
  // every field the basics schema validates into the RHF form here so its
  // validation (Next/Publish) sees what was actually typed instead of the
  // stale value from when the dialog opened.
  const set = <K extends keyof WebinarFormValues>(k: K, v: WebinarFormValues[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if ((CONTENT_FIELDS as readonly string[]).includes(k)) {
      setBasicsValue(k as (typeof CONTENT_FIELDS)[number], v as never, { shouldValidate: true });
    }
  };

  const addQuestion = () => set("questions", [...form.questions, newQuestion(form.questions.length + 1)]);
  const updateQuestion = (idx: number, q: WebinarQuestionDraft) =>
    set("questions", form.questions.map((old, i) => (i === idx ? q : old)));
  const deleteQuestion = (idx: number) =>
    set(
      "questions",
      form.questions.filter((_, i) => i !== idx).map((q, i) => ({ ...q, order: i + 1 })),
    );
  const moveQuestion = (idx: number, dir: -1 | 1) => {
    const arr = [...form.questions];
    const swap = idx + dir;
    if (swap < 0 || swap >= arr.length) return;
    [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
    set("questions", arr.map((q, i) => ({ ...q, order: i + 1 })));
  };

  const invalid = findInvalidQuestion(form.questions);
  const invalidReason = invalid?.reason ?? null;
  const canSave = form.questions.length > 0 && !invalid;
  // Drafts otherwise only need a title, but a broken score split is never a
  // valid work-in-progress state — block it even before the module is finished.
  const hasScoreError = invalidReason === "score_total";

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-5xl p-0 gap-0 flex flex-col max-h-[92vh] overflow-hidden"
        style={{ borderRadius: "20px" }}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-0 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] font-bold text-teal-600 uppercase tracking-widest mb-0.5">
                Step {step + 1} of {STEPS.length}
              </p>
              <DialogTitle asChild>
                <h2 className="text-[17px] font-black text-slate-900">
                  {initial?.title_fr || initial?.title_en
                    ? `Edit — ${initial.title_fr || initial.title_en}`
                    : "New Webinar"}
                </h2>
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              className="p-1.5 h-auto rounded-lg hover:bg-slate-100 text-slate-400"
            >
              <CloseIcon size={18} />
            </Button>
          </div>

          {/* Stepper */}
          <div className="flex items-stretch gap-0 -mb-px">
            {STEPS.map((s, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <button
                  key={i}
                  onClick={() => (done || active) && setStep(i)}
                  disabled={!done && !active}
                  className={`flex-1 flex flex-col items-start px-4 py-2.5 border-b-2 transition-colors text-left
                    ${active ? "border-teal-500 bg-teal-50/60" : "border-transparent"}
                    ${done ? "cursor-pointer hover:bg-slate-50" : ""}
                    ${!active && !done ? "opacity-40 cursor-default" : ""}`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0
                      ${active ? "bg-teal-500 text-white" : done ? "bg-emerald-400 text-white" : "bg-slate-200 text-slate-400"}`}
                    >
                      {done ? "✓" : i + 1}
                    </span>
                    <span
                      className={`text-[12px] font-bold ${active ? "text-teal-700" : done ? "text-slate-700" : "text-slate-400"}`}
                    >
                      {s.label}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 pl-5">{s.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          <div className="px-6 py-5">
            {step === 0 && (
              <WebinarBasicsStep control={basicsControl} errors={basicsErrors} onFieldChange={set} />
            )}
            {step === 1 && (
              <WebinarContentStep form={form} set={set} errors={basicsErrors} />
            )}
            {step === 2 && (
              <WebinarQuestionsStep
                questions={form.questions}
                lang={form.lang}
                onAdd={addQuestion}
                onUpdate={updateQuestion}
                onDelete={deleteQuestion}
                onMove={moveQuestion}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/60">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl text-[13px] font-semibold text-slate-500"
          >
            Cancel
          </Button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button
                variant="outline"
                onClick={() => setStep((s) => s - 1)}
                className="rounded-xl text-[13px] font-semibold text-slate-600"
              >
                ← Back
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button
                variant="ghost"
                onClick={async () => {
                  const fields =
                    step === 0
                      ? (["date", "start_time", "end_time", "lang", "webinar_link", "target_min", "target_max"] as const)
                      : CONTENT_FIELDS;
                  if (await triggerBasics(fields)) setStep((s) => s + 1);
                }}
                className="rounded-xl bg-teal-600 hover:bg-teal-700 hover:text-white text-white text-[13px] font-bold"
              >
                Next →
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Draft is a work-in-progress save — only a title is needed,
                    // not the full Publish checklist (date/link/questions).
                    const hasTitle = form.title_fr.trim() || form.title_en.trim();
                    if (!hasTitle) {
                      setStep(1);
                      toast.error("Add a title first.");
                      return;
                    }
                    if (hasScoreError) {
                      setStep(2);
                      toast.error(questionErrorMessage("score_total"));
                      return;
                    }
                    onSave({ ...form, status: "draft" });
                  }}
                  disabled={hasScoreError}
                  title={hasScoreError ? questionErrorMessage("score_total") : undefined}
                  className="rounded-xl text-[13px] font-bold text-slate-600"
                >
                  Save as Draft
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleBasicsSubmit(
                    () => onSave({ ...form, status: "active" }),
                    (formErrors) => {
                      const hasContentError = CONTENT_FIELDS.some((f) => formErrors[f]);
                      setStep(hasContentError ? 1 : 0);
                      toast.error("Please check the highlighted fields.");
                    },
                  )}
                  disabled={!canSave}
                  title={
                    !canSave
                      ? invalidReason
                        ? questionErrorMessage(invalidReason)
                        : "Add at least one question"
                      : undefined
                  }
                  className="rounded-xl bg-teal-600 hover:bg-teal-700 hover:text-white text-white text-[13px] font-bold"
                >
                  Publish
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default WebinarFormDialog;
