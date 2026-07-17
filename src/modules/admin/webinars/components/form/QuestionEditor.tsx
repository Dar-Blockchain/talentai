import React from "react";
import { Button } from "@/modules/shared/ui/shadcn/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/shared/ui/shadcn/select";
import { Plus as AddIcon, X as CloseIcon } from "lucide-react";
import { QUESTION_TYPES } from "../../utils/webinarForm";
import { LangBox } from "./LangBox";
import type { WebinarFormValues, WebinarQuestionDraft } from "../../types";

export function QuestionEditor({
  q,
  idx,
  lang,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  q: WebinarQuestionDraft;
  idx: number;
  lang: WebinarFormValues["lang"];
  onChange: (q: WebinarQuestionDraft) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const inp =
    "w-full border border-slate-200 rounded-lg px-2.5 py-2 text-[13px] text-slate-700 outline-none focus:border-teal-400 transition-colors bg-white";
  const labelInp = `${inp} min-h-[52px] leading-relaxed resize-y`;

  // "select" is a legacy type predating the card-based questionnaire display —
  // it's grouped with "choice"/"multiselect" here so editing an old question
  // doesn't show a blank type dropdown, and saving normalizes it away.
  const isChoiceGroup = q.type === "choice" || q.type === "select" || q.type === "multiselect";

  const addOption = () =>
    onChange({
      ...q,
      options: [
        ...q.options,
        { key: `opt${q.options.length + 1}`, label_fr: "", label_en: "" },
      ],
    });
  const setOpt = (
    i: number,
    field: "key" | "label_fr" | "label_en",
    val: string,
  ) =>
    onChange({
      ...q,
      options: q.options.map((o, j) => (j === i ? { ...o, [field]: val } : o)),
    });
  // Single-language webinars only collect one label, but `label_fr` is treated
  // as the primary field everywhere else (previews, CSV export, funnel
  // fallback) — mirror it into both so those keep working either way.
  const setSingleLangLabel = (val: string) =>
    onChange({ ...q, label_fr: val, label_en: val });
  const setSingleLangOption = (i: number, val: string) =>
    onChange({
      ...q,
      options: q.options.map((o, j) =>
        j === i ? { ...o, label_fr: val, label_en: val } : o,
      ),
    });
  const delOpt = (i: number) =>
    onChange({ ...q, options: q.options.filter((_, j) => j !== i) });

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-200">
        <span className="w-6 h-6 rounded-md bg-teal-100 text-teal-700 text-[11px] font-black flex items-center justify-center shrink-0">
          {idx + 1}
        </span>
        <span className="text-[12px] font-bold text-slate-600 flex-1 truncate">
          {q.label_fr || (
            <span className="text-slate-300 font-normal">
              Question {idx + 1}
            </span>
          )}
        </span>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-1 h-auto rounded hover:bg-slate-200 text-slate-400"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </Button>
          <Button
            variant="ghost"
            onClick={onMoveDown}
            disabled={isLast}
            className="p-1 h-auto rounded hover:bg-slate-200 text-slate-400"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </Button>
          <Button
            variant="ghost"
            onClick={onDelete}
            className="p-1 h-auto rounded hover:bg-red-100 text-slate-300 hover:text-red-500 ml-1"
          >
            <CloseIcon size={14} />
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="p-3 space-y-2.5">
        {lang === "both" ? (
          <div className="grid grid-cols-2 gap-2">
            <LangBox flag="🇫🇷" name="French">
              <p className="text-[10px] font-semibold text-slate-400 mb-1">
                Label *
              </p>
              <textarea
                className={labelInp}
                rows={2}
                value={q.label_fr}
                onChange={(e) => onChange({ ...q, label_fr: e.target.value })}
                placeholder="Question en français"
              />
            </LangBox>
            <LangBox flag="🇬🇧" name="English">
              <p className="text-[10px] font-semibold text-slate-400 mb-1">
                Label
              </p>
              <textarea
                className={labelInp}
                rows={2}
                value={q.label_en}
                onChange={(e) => onChange({ ...q, label_en: e.target.value })}
                placeholder="Question in English"
              />
            </LangBox>
          </div>
        ) : (
          <div>
            <p className="text-[10px] font-semibold text-slate-400 mb-1">
              Label *
            </p>
            <textarea
              className={labelInp}
              rows={2}
              value={lang === "en" ? q.label_en : q.label_fr}
              onChange={(e) => setSingleLangLabel(e.target.value)}
              placeholder={lang === "en" ? "Question in English" : "Question en français"}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 mb-1">
              Type
            </p>
            <Select
              value={isChoiceGroup ? "choice" : q.type}
              onValueChange={(v) =>
                onChange({
                  ...q,
                  type: v as WebinarQuestionDraft["type"],
                  options: [],
                })
              }
            >
              <SelectTrigger size="sm" className="w-full text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer pb-1.5">
              <div
                onClick={() => onChange({ ...q, required: !q.required })}
                className={`w-8 h-4 rounded-full transition-colors relative ${q.required ? "bg-teal-500" : "bg-slate-200"}`}
              >
                <span
                  className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${q.required ? "left-4" : "left-0.5"}`}
                />
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                Required
              </span>
            </label>
            {isChoiceGroup && (
              <label className="flex items-center gap-1.5 cursor-pointer pb-1.5">
                <div
                  onClick={() =>
                    onChange({
                      ...q,
                      type: q.type === "multiselect" ? "choice" : "multiselect",
                    })
                  }
                  className={`w-8 h-4 rounded-full transition-colors relative ${q.type === "multiselect" ? "bg-teal-500" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${q.type === "multiselect" ? "left-4" : "left-0.5"}`}
                  />
                </div>
                <span className="text-[11px] font-semibold text-slate-500">
                  Multi-select
                </span>
              </label>
            )}
          </div>
        </div>

        {isChoiceGroup && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-semibold text-slate-400">
                Options
              </p>
              <Button
                variant="ghost"
                onClick={addOption}
                className="p-0 h-auto text-[10px] font-bold text-teal-600 hover:text-teal-700 hover:bg-transparent"
              >
                <AddIcon size={12} /> Add option
              </Button>
            </div>
            <div className="space-y-1.5">
              {q.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  {lang === "both" ? (
                    <>
                      <input
                        className={inp + " flex-1"}
                        value={opt.label_fr}
                        onChange={(e) => setOpt(i, "label_fr", e.target.value)}
                        placeholder={`Option ${i + 1} (FR)`}
                      />
                      <input
                        className={inp + " flex-1"}
                        value={opt.label_en}
                        onChange={(e) => setOpt(i, "label_en", e.target.value)}
                        placeholder={`Option ${i + 1} (EN)`}
                      />
                    </>
                  ) : (
                    <input
                      className={inp + " flex-1"}
                      value={lang === "en" ? opt.label_en : opt.label_fr}
                      onChange={(e) => setSingleLangOption(i, e.target.value)}
                      placeholder={`Option ${i + 1}`}
                    />
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => delOpt(i)}
                    className="p-1 h-auto rounded hover:bg-red-50 text-slate-300 hover:text-red-400 shrink-0"
                  >
                    <CloseIcon size={13} />
                  </Button>
                </div>
              ))}
              {q.options.length === 0 && (
                <p className="text-[11px] text-slate-300 italic">
                  No options yet — click "Add option"
                </p>
              )}
              {q.options.length === 1 && (
                <p className="text-[11px] text-amber-600 font-semibold">
                  Add at least one more option — 2 minimum
                </p>
              )}
            </div>
          </div>
        )}

        {q.type === "scale" && (
          <p className="text-[11px] text-slate-400 italic">
            1–5 scale (no options needed)
          </p>
        )}
        {q.type === "text" && (
          <p className="text-[11px] text-slate-400 italic">
            Free text input (no options needed)
          </p>
        )}
        {q.type === "multiselect" && (
          <p className="text-[11px] text-slate-400 italic">
            Registrant can pick more than one option
          </p>
        )}
      </div>
    </div>
  );
}

export default QuestionEditor;
