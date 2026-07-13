import React, { useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  webinarBasicsSchema,
  type WebinarBasicsForm,
} from "../schemas/webinarBasicsSchema";
import { Dialog, DialogContent, DialogTitle } from "@/modules/shared/ui/shadcn/dialog";
import { Spinner } from "@/modules/shared/ui/shadcn/spinner";
import { Badge } from "@/modules/shared/ui/shadcn/badge";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/modules/shared/ui/shadcn/tooltip";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/modules/shared/ui/shadcn/popover";
import { Calendar } from "@/modules/shared/ui/shadcn/calendar";
import dayjs from "@/lib/dayjs";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/modules/shared/ui/shadcn/dropdown-menu";
import {
  Plus as AddIcon,
  Video as WebinarIcon,
  CheckCircle2 as VerifyIcon,
  RefreshCw as RefreshIcon,
  Trash2 as DeleteIcon,
  MessageSquare as QIcon,
  ExternalLink as OpenIcon,
  X as CloseIcon,
  Send as SendIcon,
  Users as PeopleIcon,
  Download as DownloadIcon,
  MoreVertical as MoreIcon,
  Pencil as EditIcon,
  Copy as CopyIcon,
  Check as CheckIcon,
  Calendar as CalendarGlyph,
  Clock as ClockIcon,
} from "lucide-react";
import { Button } from "@/modules/shared/ui/shadcn/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/shared/ui/shadcn/select";
import WebinarSubmissionsDialog from "./WebinarSubmissionsDialog";
import { adminWebinarApi } from "../api";
import {
  AdminPageHeading,
  AdminQueryError,
  AdminChartCard,
  ADMIN_ACCENT,
} from "@/modules/admin/shared";
import {
  useAdminWebinarsQuery,
  useCreateWebinarMutation,
  useUpdateWebinarMutation,
  useDeleteWebinarMutation,
  useVerifyWebinarMutation,
  useRefreshStatsMutation,
} from "../queries";
import { ConfirmDialog } from "@/modules/admin/shared";
import type {
  Webinar,
  WebinarFormValues,
  WebinarQuestionDraft,
} from "../types";

// ── Module-level constants ─────────────────────────────────────────────────────
const ok = (msg: string) => toast.success(msg);
const err = (msg: string) => toast.error(msg);

const CARD_STATUS_STYLES: Record<
  string,
  { label: string; color: string; bg: string; dot: string }
> = {
  active: { label: "Published", color: "#059669", bg: "#ECFDF5", dot: "#10B981" },
  draft: { label: "Draft", color: "#D97706", bg: "#FFFBEB", dot: "#F59E0B" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function toFormValues(w: Webinar): WebinarFormValues {
  return {
    // Pre-migration webinars only have the single `title`/`description`/`highlights`
    // fields — mirror them into both languages so nothing looks blank on edit.
    title_fr: w.title_fr || w.title || "",
    title_en: w.title_en || w.title || "",
    description_fr: w.description_fr || w.description || "",
    description_en: w.description_en || w.description || "",
    about_fr: w.about_fr ?? "",
    about_en: w.about_en ?? "",
    webinar_link: w.webinar_link ?? "",
    date: w.date ? w.date.slice(0, 16) : "",
    status: w.status,
    lang: w.lang,
    highlights_fr: [...(w.highlights_fr?.length ? w.highlights_fr : w.highlights ?? []), "", "", ""].slice(0, 3),
    highlights_en: [...(w.highlights_en?.length ? w.highlights_en : w.highlights ?? []), "", "", ""].slice(0, 3),
    questions: w.questions.map((q) => ({
      key: q.key,
      label_fr: q.label_fr,
      label_en: q.label_en,
      type: q.type,
      options: q.options,
      required: q.required,
      order: q.order,
    })),
  };
}

// ── Form dialog ───────────────────────────────────────────────────────────────
const EMPTY_FORM: WebinarFormValues = {
  title_fr: "",
  title_en: "",
  description_fr: "",
  description_en: "",
  about_fr: "",
  about_en: "",
  webinar_link: "",
  date: "",
  status: "draft",
  lang: "fr",
  highlights_fr: ["", "", ""],
  highlights_en: ["", "", ""],
  questions: [],
};

const QUESTION_TYPES = ["choice", "scale", "text", "select"] as const;

function newQuestion(order: number): WebinarQuestionDraft {
  return {
    key: `q${order}_${Date.now()}`,
    label_fr: "",
    label_en: "",
    type: "choice",
    options: [],
    required: true,
    order,
  };
}

function QuestionEditor({
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
              <input
                className={inp}
                value={q.label_fr}
                onChange={(e) => onChange({ ...q, label_fr: e.target.value })}
                placeholder="Question en français"
              />
            </LangBox>
            <LangBox flag="🇬🇧" name="English">
              <p className="text-[10px] font-semibold text-slate-400 mb-1">
                Label
              </p>
              <input
                className={inp}
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
            <input
              className={inp}
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
              value={q.type}
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
          <div className="flex items-end gap-3">
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
          </div>
        </div>

        {(q.type === "choice" || q.type === "select") && (
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
      </div>
    </div>
  );
}

const STEPS = [
  { label: "Basics", desc: "Language, date & link" },
  { label: "Content", desc: "Landing page copy" },
  { label: "Questions", desc: "Registration form" },
];

/** Bordered per-language card used to keep FR/EN content visually separate
 * whenever a webinar's language is set to "both". */
function LangBox({ flag, name, children }: { flag: string; name: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5">
      <div className="flex items-center gap-1.5 mb-2.5">
        <span className="text-[14px] leading-none">{flag}</span>
        <span className="text-[11px] font-black text-slate-600 uppercase tracking-wide">{name}</span>
      </div>
      {children}
    </div>
  );
}

// ── Date & time picker (calendar + styled time selects, single popover) ────────
const HOURS_12 = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0"),
);
const MINUTES = Array.from({ length: 12 }, (_, i) =>
  String(i * 5).padStart(2, "0"),
);
const PERIODS = ["AM", "PM"] as const;

/** Splits a 24h "HH:mm" string into 12h hour, minute, and AM/PM period. */
function to12h(timePart: string): {
  hh: string;
  mm: string;
  period: "AM" | "PM";
} {
  const [h24, mm] = timePart.split(":");
  const hourNum = parseInt(h24, 10);
  const period: "AM" | "PM" = hourNum >= 12 ? "PM" : "AM";
  const hour12 = hourNum % 12 === 0 ? 12 : hourNum % 12;
  return { hh: String(hour12).padStart(2, "0"), mm, period };
}

/** Combines 12h hour + minute + AM/PM back into a 24h "HH:mm" string. */
function to24h(hh: string, mm: string, period: "AM" | "PM") {
  let h = parseInt(hh, 10) % 12;
  if (period === "PM") h += 12;
  return `${String(h).padStart(2, "0")}:${mm}`;
}

function WebinarDateTimePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const datePart = value.slice(0, 10);
  const timePart = value.slice(11, 16) || "09:00";
  const { hh, mm, period } = to12h(timePart);
  const selectedDate = datePart
    ? dayjs(`${datePart}T00:00:00`).toDate()
    : undefined;

  const setTime = (nextHh: string, nextMm: string, nextPeriod: "AM" | "PM") =>
    onChange(
      `${datePart || dayjs().format("YYYY-MM-DD")}T${to24h(nextHh, nextMm, nextPeriod)}`,
    );

  const timeSelectTrigger =
    "h-9 w-[68px] px-2 gap-0.5 rounded-lg border-slate-200 text-[13px] font-semibold text-slate-700 focus:border-teal-400 focus:ring-teal-400/20";
  const periodSelectTrigger =
    "h-9 w-[76px] px-2 gap-0.5 rounded-lg border-slate-200 text-[13px] font-semibold text-slate-700 focus:border-teal-400 focus:ring-teal-400/20";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-state={open ? "open" : "closed"}
          className="group flex h-[42px] w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-700 outline-none transition-colors hover:border-teal-300 data-[state=open]:border-teal-400"
        >
          <CalendarGlyph size={15} className="shrink-0 text-slate-400" />
          {value ? (
            <span>
              {dayjs(`${datePart}T${timePart}`).format("MMM D, YYYY")}{" "}
              <span className="text-slate-400">·</span>{" "}
              {dayjs(`${datePart}T${timePart}`).format("h:mm A")}
            </span>
          ) : (
            <span className="text-slate-400">Pick a date & time</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) =>
            date && onChange(`${dayjs(date).format("YYYY-MM-DD")}T${timePart}`)
          }
        />
        <div className="flex items-center gap-2 border-t border-slate-100 px-3 py-3">
          <ClockIcon size={14} className="shrink-0 text-slate-400" />
          <Select value={hh} onValueChange={(v) => setTime(v, mm, period)}>
            <SelectTrigger size="sm" className={timeSelectTrigger}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-56">
              {HOURS_12.map((h) => (
                <SelectItem key={h} value={h} className="text-[13px]">
                  {h}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="font-bold text-slate-300">:</span>
          <Select value={mm} onValueChange={(v) => setTime(hh, v, period)}>
            <SelectTrigger size="sm" className={timeSelectTrigger}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-56">
              {MINUTES.map((m) => (
                <SelectItem key={m} value={m} className="text-[13px]">
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={period}
            onValueChange={(v) => setTime(hh, mm, v as "AM" | "PM")}
          >
            <SelectTrigger size="sm" className={periodSelectTrigger}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIODS.map((p) => (
                <SelectItem key={p} value={p} className="text-[13px]">
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function WebinarFormDialog({
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
  const [form, setForm] = React.useState<WebinarFormValues>(
    initial ?? EMPTY_FORM,
  );
  const [step, setStep] = React.useState(0);

  const {
    control: basicsControl,
    handleSubmit: handleBasicsSubmit,
    reset: resetBasics,
    trigger: triggerBasics,
    formState: { errors: basicsErrors },
  } = useForm<WebinarBasicsForm>({
    resolver: zodResolver(webinarBasicsSchema),
    mode: "onChange",
    defaultValues: {
      title_fr: (initial ?? EMPTY_FORM).title_fr,
      title_en: (initial ?? EMPTY_FORM).title_en,
      date: (initial ?? EMPTY_FORM).date,
      lang: (initial ?? EMPTY_FORM).lang,
      webinar_link: (initial ?? EMPTY_FORM).webinar_link,
    },
  });

  React.useEffect(() => {
    const f = initial ?? EMPTY_FORM;
    setForm(f);
    setStep(0);
    resetBasics({
      title_fr: f.title_fr,
      title_en: f.title_en,
      date: f.date,
      lang: f.lang,
      webinar_link: f.webinar_link,
    });
  }, [initial, open, resetBasics]);

  const set = <K extends keyof WebinarFormValues>(
    k: K,
    v: WebinarFormValues[K],
  ) => setForm((f) => ({ ...f, [k]: v }));

  const addQuestion = () =>
    set("questions", [
      ...form.questions,
      newQuestion(form.questions.length + 1),
    ]);
  const updateQuestion = (idx: number, q: WebinarQuestionDraft) =>
    set(
      "questions",
      form.questions.map((old, i) => (i === idx ? q : old)),
    );
  const deleteQuestion = (idx: number) =>
    set(
      "questions",
      form.questions
        .filter((_, i) => i !== idx)
        .map((q, i) => ({ ...q, order: i + 1 })),
    );
  const moveQuestion = (idx: number, dir: -1 | 1) => {
    const arr = [...form.questions];
    const swap = idx + dir;
    if (swap < 0 || swap >= arr.length) return;
    [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
    set(
      "questions",
      arr.map((q, i) => ({ ...q, order: i + 1 })),
    );
  };

  const inp =
    "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[14px] text-slate-700 outline-none focus:border-teal-400 transition-colors bg-white";
  const errTxt = "mt-1 text-[11px] text-red-500";
  const lbl = "block text-[12px] font-semibold text-slate-600 mb-1.5";
  const canSave = form.questions.length > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-3xl p-0 gap-0 flex flex-col max-h-[92vh] overflow-hidden"
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
                  <span className="text-[10px] text-slate-400 pl-5">
                    {s.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          <div className="px-6 py-5">
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <label className={lbl}>
                    Language <span className="text-red-400">*</span>
                  </label>
                  <Controller
                    name="lang"
                    control={basicsControl}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(v) => {
                          field.onChange(v);
                          set("lang", v as WebinarFormValues["lang"]);
                        }}
                      >
                        <SelectTrigger className="w-full text-[14px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {basicsErrors.lang && (
                    <p className={errTxt}>{basicsErrors.lang.message}</p>
                  )}
                </div>
                <div>
                  <label className={lbl}>
                    Date & time <span className="text-red-400">*</span>
                  </label>
                  <Controller
                    name="date"
                    control={basicsControl}
                    render={({ field }) => (
                      <WebinarDateTimePicker
                        value={field.value}
                        onChange={(v) => {
                          field.onChange(v);
                          set("date", v);
                        }}
                      />
                    )}
                  />
                  {basicsErrors.date && (
                    <p className={errTxt}>{basicsErrors.date.message}</p>
                  )}
                </div>
                <div>
                  <label className={lbl}>
                    Join link <span className="text-red-400">*</span>{" "}
                    <span className="text-slate-400 font-normal text-[11px]">
                      (Zoom / Teams / Meet)
                    </span>
                  </label>
                  <Controller
                    name="webinar_link"
                    control={basicsControl}
                    render={({ field }) => (
                      <input
                        {...field}
                        className={inp}
                        type="url"
                        onChange={(e) => {
                          field.onChange(e);
                          set("webinar_link", e.target.value);
                        }}
                        placeholder="https://zoom.us/j/..."
                        aria-invalid={!!basicsErrors.webinar_link}
                      />
                    )}
                  />
                  {basicsErrors.webinar_link && (
                    <p className={errTxt}>
                      {basicsErrors.webinar_link.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                {/* Title */}
                {form.lang === "both" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <LangBox flag="🇫🇷" name="French">
                      <label className={lbl}>
                        Title <span className="text-red-400">*</span>
                      </label>
                      <Controller
                        name="title_fr"
                        control={basicsControl}
                        render={({ field }) => (
                          <input
                            {...field}
                            className={inp}
                            onChange={(e) => {
                              field.onChange(e);
                              set("title_fr", e.target.value);
                            }}
                            placeholder="Titre du webinar"
                            autoFocus
                            aria-invalid={!!basicsErrors.title_fr}
                          />
                        )}
                      />
                      {basicsErrors.title_fr && (
                        <p className={errTxt}>{basicsErrors.title_fr.message}</p>
                      )}
                    </LangBox>
                    <LangBox flag="🇬🇧" name="English">
                      <label className={lbl}>
                        Title <span className="text-red-400">*</span>
                      </label>
                      <Controller
                        name="title_en"
                        control={basicsControl}
                        render={({ field }) => (
                          <input
                            {...field}
                            className={inp}
                            onChange={(e) => {
                              field.onChange(e);
                              set("title_en", e.target.value);
                            }}
                            placeholder="Webinar title"
                            aria-invalid={!!basicsErrors.title_en}
                          />
                        )}
                      />
                      {basicsErrors.title_en && (
                        <p className={errTxt}>{basicsErrors.title_en.message}</p>
                      )}
                    </LangBox>
                  </div>
                ) : (
                  <div>
                    <label className={lbl}>
                      Title <span className="text-red-400">*</span>
                    </label>
                    <Controller
                      name={form.lang === "fr" ? "title_fr" : "title_en"}
                      control={basicsControl}
                      render={({ field }) => (
                        <input
                          {...field}
                          className={inp}
                          onChange={(e) => {
                            field.onChange(e);
                            set(form.lang === "fr" ? "title_fr" : "title_en", e.target.value);
                          }}
                          placeholder={form.lang === "fr" ? "Titre du webinar" : "Webinar title"}
                          autoFocus
                          aria-invalid={!!(form.lang === "fr" ? basicsErrors.title_fr : basicsErrors.title_en)}
                        />
                      )}
                    />
                    {(form.lang === "fr" ? basicsErrors.title_fr : basicsErrors.title_en) && (
                      <p className={errTxt}>
                        {(form.lang === "fr" ? basicsErrors.title_fr : basicsErrors.title_en)?.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Short description */}
                {form.lang === "both" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <LangBox flag="🇫🇷" name="French">
                      <label className={lbl}>Short description</label>
                      <textarea
                        className={inp}
                        rows={2}
                        value={form.description_fr}
                        onChange={(e) => set("description_fr", e.target.value)}
                        placeholder="De quoi parle ce webinar ?"
                        style={{ resize: "none" }}
                      />
                    </LangBox>
                    <LangBox flag="🇬🇧" name="English">
                      <label className={lbl}>Short description</label>
                      <textarea
                        className={inp}
                        rows={2}
                        value={form.description_en}
                        onChange={(e) => set("description_en", e.target.value)}
                        placeholder="What's this webinar about?"
                        style={{ resize: "none" }}
                      />
                    </LangBox>
                  </div>
                ) : (
                  <div>
                    <label className={lbl}>Short description</label>
                    <textarea
                      className={inp}
                      rows={2}
                      value={form.lang === "fr" ? form.description_fr : form.description_en}
                      onChange={(e) =>
                        set(form.lang === "fr" ? "description_fr" : "description_en", e.target.value)
                      }
                      placeholder={form.lang === "fr" ? "De quoi parle ce webinar ?" : "What's this webinar about?"}
                      style={{ resize: "none" }}
                    />
                  </div>
                )}

                {/* About */}
                {form.lang === "both" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <LangBox flag="🇫🇷" name="French">
                      <label className={lbl}>
                        About{" "}
                        <span className="text-slate-400 font-normal text-[11px] ml-1">
                          (landing page)
                        </span>
                      </label>
                      <textarea
                        className={inp}
                        rows={6}
                        value={form.about_fr}
                        onChange={(e) => set("about_fr", e.target.value)}
                        placeholder="Décrivez ce webinar en français…"
                        style={{ resize: "vertical" }}
                      />
                    </LangBox>
                    <LangBox flag="🇬🇧" name="English">
                      <label className={lbl}>
                        About{" "}
                        <span className="text-slate-400 font-normal text-[11px] ml-1">
                          (landing page)
                        </span>
                      </label>
                      <textarea
                        className={inp}
                        rows={6}
                        value={form.about_en}
                        onChange={(e) => set("about_en", e.target.value)}
                        placeholder="Describe this webinar in English…"
                        style={{ resize: "vertical" }}
                      />
                    </LangBox>
                  </div>
                ) : (
                  <div>
                    <label className={lbl}>
                      About{" "}
                      <span className="text-slate-400 font-normal text-[11px] ml-1">
                        (landing page)
                      </span>
                    </label>
                    <textarea
                      className={inp}
                      rows={6}
                      value={form.lang === "fr" ? form.about_fr : form.about_en}
                      onChange={(e) => set(form.lang === "fr" ? "about_fr" : "about_en", e.target.value)}
                      placeholder={
                        form.lang === "fr"
                          ? "Décrivez ce webinar en français…"
                          : "Describe this webinar in English…"
                      }
                      style={{ resize: "vertical" }}
                    />
                  </div>
                )}

                {/* Highlights */}
                {form.lang === "both" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <LangBox flag="🇫🇷" name="French">
                      <label className={lbl}>
                        Highlights{" "}
                        <span className="text-slate-400 font-normal text-[11px]">
                          (up to 3 bullets)
                        </span>
                      </label>
                      <div className="space-y-2">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-[10px] font-black flex items-center justify-center shrink-0">
                              {i + 1}
                            </span>
                            <input
                              className={inp}
                              value={form.highlights_fr[i] ?? ""}
                              onChange={(e) => {
                                const next = [...form.highlights_fr];
                                next[i] = e.target.value;
                                set("highlights_fr", next);
                              }}
                              placeholder={`Bénéfice ${i + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                    </LangBox>
                    <LangBox flag="🇬🇧" name="English">
                      <label className={lbl}>
                        Highlights{" "}
                        <span className="text-slate-400 font-normal text-[11px]">
                          (up to 3 bullets)
                        </span>
                      </label>
                      <div className="space-y-2">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-[10px] font-black flex items-center justify-center shrink-0">
                              {i + 1}
                            </span>
                            <input
                              className={inp}
                              value={form.highlights_en[i] ?? ""}
                              onChange={(e) => {
                                const next = [...form.highlights_en];
                                next[i] = e.target.value;
                                set("highlights_en", next);
                              }}
                              placeholder={`Benefit ${i + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                    </LangBox>
                  </div>
                ) : (
                  <div>
                    <label className={lbl}>
                      Highlights{" "}
                      <span className="text-slate-400 font-normal text-[11px]">
                        (up to 3 bullets on home page)
                      </span>
                    </label>
                    <div className="space-y-2">
                      {[0, 1, 2].map((i) => {
                        const key = form.lang === "fr" ? "highlights_fr" : "highlights_en";
                        return (
                          <div key={i} className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-[10px] font-black flex items-center justify-center shrink-0">
                              {i + 1}
                            </span>
                            <input
                              className={inp}
                              value={form[key][i] ?? ""}
                              onChange={(e) => {
                                const next = [...form[key]];
                                next[i] = e.target.value;
                                set(key, next);
                              }}
                              placeholder={form.lang === "fr" ? `Bénéfice ${i + 1}` : `Benefit ${i + 1}`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                {form.questions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                    <svg
                      width="36"
                      height="36"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mb-2 opacity-40"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <p className="text-[14px] font-medium">No questions yet</p>
                    <p className="text-[12px] mt-0.5">Add questions below</p>
                  </div>
                ) : (
                  form.questions.map((q, idx) => (
                    <QuestionEditor
                      key={q.key}
                      q={q}
                      idx={idx}
                      lang={form.lang}
                      onChange={(nq) => updateQuestion(idx, nq)}
                      onDelete={() => deleteQuestion(idx)}
                      onMoveUp={() => moveQuestion(idx, -1)}
                      onMoveDown={() => moveQuestion(idx, 1)}
                      isFirst={idx === 0}
                      isLast={idx === form.questions.length - 1}
                    />
                  ))
                )}
                <Button
                  variant="outline"
                  onClick={addQuestion}
                  className="w-full rounded-xl border-2 border-dashed border-teal-200 text-teal-600 text-[13px] font-semibold hover:bg-teal-50"
                >
                  <AddIcon size={16} /> Add question
                </Button>
              </div>
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
                      ? (["date", "lang", "webinar_link"] as const)
                      : (["title_fr", "title_en"] as const);
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
                      err("Add a title first.");
                      return;
                    }
                    onSave({ ...form, status: "draft" });
                  }}
                  className="rounded-xl text-[13px] font-bold text-slate-600"
                >
                  Save as Draft
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleBasicsSubmit(
                    () => onSave({ ...form, status: "active" }),
                    (formErrors) => {
                      setStep(formErrors.title_fr || formErrors.title_en ? 1 : 0);
                      err("Please check the highlighted fields.");
                    },
                  )}
                  disabled={!canSave}
                  title={!canSave ? "Add at least one question" : undefined}
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

// ── Questions preview dialog ───────────────────────────────────────────────────
function QuestionsDialog({
  webinar,
  open,
  onClose,
}: {
  webinar: Webinar | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!webinar) return null;
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-2xl p-0 gap-0 overflow-hidden"
        style={{ borderRadius: "16px" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 font-bold text-base">
          <DialogTitle asChild>
            <span>Questions — {webinar.title}</span>
          </DialogTitle>
          <Button
            variant="ghost"
            onClick={onClose}
            className="p-1 h-auto rounded-lg hover:bg-slate-100 text-slate-400"
          >
            <CloseIcon size={18} />
          </Button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto">
          {webinar.questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <QIcon size={40} className="mb-2" />
              <p className="text-[14px]">
                No questions yet. Edit the webinar to add questions.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {[...webinar.questions]
                .sort((a, b) => a.order - b.order)
                .map((q, i) => (
                  <div key={q.key} className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <span className="shrink-0 w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 text-teal-600 text-[11px] font-black flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[13px] font-bold text-slate-800">
                            {q.label_fr}
                          </span>
                          <Badge
                            variant="outline"
                            className="h-[18px] rounded-md border-transparent bg-slate-100 px-1.5 text-[10px] font-normal text-slate-500"
                          >
                            {q.type}
                          </Badge>
                        </div>
                        <p className="text-[12px] text-slate-400 italic">
                          {q.label_en}
                        </p>
                        {q.options.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {q.options.map((o) => (
                              <span
                                key={o.key}
                                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px]"
                              >
                                {o.label_fr}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Webinar card ─────────────────────────────────────────────────────────────
function WebinarCard({
  w,
  onEdit,
  onSubs,
  onQuestions,
  onVerify,
  verifyPending,
  onRefresh,
  refreshPending,
  onExport,
  exportPending,
  onSendLink,
  sendLinkPending,
  onDelete,
}: {
  w: Webinar;
  onEdit: () => void;
  onSubs: () => void;
  onQuestions: () => void;
  onVerify: () => void;
  verifyPending: boolean;
  onRefresh: () => void;
  refreshPending: boolean;
  onExport: () => void;
  exportPending: boolean;
  onSendLink: () => void;
  sendLinkPending: boolean;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const publicUrl = `/webinar?id=${w._id}`;
  const statusStyle = CARD_STATUS_STYLES[w.status] ?? CARD_STATUS_STYLES.draft;

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    const fullUrl = `${window.location.origin}${publicUrl}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      ok("Link copied to clipboard.");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      err("Failed to copy link.");
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-[#E5E7EB] bg-white transition-all hover:-translate-y-px hover:border-[#D1D5DB] hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)]">
      <div
        className="h-[3px] shrink-0"
        style={{
          backgroundColor: w.status === "draft" ? "#F59E0B" : "#E5E7EB",
        }}
      />

      <div className="flex flex-1 flex-col gap-3.5 p-5">
        {/* Header */}
        <div className="flex items-start gap-2.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[11px] border border-[#E5E7EB] bg-[#F3F4F6]">
            <WebinarIcon size={20} color="#6B7280" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="mb-[5px] truncate text-[14.5px] font-bold leading-[1.3] text-[#111827]">
              {w.title}
            </p>
            <div
              className="inline-flex items-center gap-1 rounded-[5px] px-[7px] py-[3px]"
              style={{
                backgroundColor: statusStyle.bg,
                border: `1px solid ${statusStyle.color}28`,
              }}
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: statusStyle.dot }}
              />
              <span
                className="text-[10.5px] font-bold leading-none"
                style={{ color: statusStyle.color }}
              >
                {statusStyle.label}
              </span>
            </div>
          </div>

          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                className="shrink-0 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <MoreIcon size={15} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-[188px] rounded-xl border border-[#E5E7EB] p-1.5 shadow-lg"
            >
              <div className="px-1.5 pb-1 pt-0.5">
                <p className="truncate text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                  {w.title}
                </p>
              </div>

              {w.status === "draft" && (
                <DropdownMenuItem
                  onClick={onVerify}
                  disabled={verifyPending}
                  className="gap-2.5 rounded-lg py-[9px] px-[10px] focus:bg-[#ECFDF5]"
                >
                  <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[7px] bg-[#ECFDF5]">
                    <VerifyIcon size={13} color="#059669" />
                  </div>
                  <div>
                    <p className="text-[12.5px] font-semibold leading-[1.2] text-[#111827]">
                      Publish
                    </p>
                    <p className="text-[10px] leading-[1.2] text-[#9CA3AF]">
                      Make this webinar live
                    </p>
                  </div>
                </DropdownMenuItem>
              )}

              {w.status === "active" && (
                <DropdownMenuItem
                  onClick={onSendLink}
                  disabled={sendLinkPending}
                  className="gap-2.5 rounded-lg py-[9px] px-[10px]"
                >
                  <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[7px] bg-[#F3F4F6]">
                    <SendIcon size={13} color="#6B7280" />
                  </div>
                  <div>
                    <p className="text-[12.5px] font-semibold leading-[1.2] text-[#111827]">
                      Send link
                    </p>
                    <p className="text-[10px] leading-[1.2] text-[#9CA3AF]">
                      Email join link to participants
                    </p>
                  </div>
                </DropdownMenuItem>
              )}

              <DropdownMenuItem
                onClick={onEdit}
                className="gap-2.5 rounded-lg py-[9px] px-[10px]"
              >
                <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[7px] bg-[#F3F4F6]">
                  <EditIcon size={13} color="#6B7280" />
                </div>
                <div>
                  <p className="text-[12.5px] font-semibold leading-[1.2] text-[#111827]">
                    Edit
                  </p>
                  <p className="text-[10px] leading-[1.2] text-[#9CA3AF]">
                    Update details & questions
                  </p>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={onQuestions}
                className="gap-2.5 rounded-lg py-[9px] px-[10px]"
              >
                <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[7px] bg-[#F3F4F6]">
                  <QIcon size={13} color="#6B7280" />
                </div>
                <div>
                  <p className="text-[12.5px] font-semibold leading-[1.2] text-[#111827]">
                    View questions
                  </p>
                  <p className="text-[10px] leading-[1.2] text-[#9CA3AF]">
                    {w.questions.length} question
                    {w.questions.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                asChild
                className="gap-2.5 rounded-lg py-[9px] px-[10px]"
              >
                <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                  <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[7px] bg-[#F3F4F6]">
                    <OpenIcon size={13} color="#6B7280" />
                  </div>
                  <div>
                    <p className="text-[12.5px] font-semibold leading-[1.2] text-[#111827]">
                      Preview page
                    </p>
                    <p className="text-[10px] leading-[1.2] text-[#9CA3AF]">
                      Open the public landing page
                    </p>
                  </div>
                </a>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={onExport}
                disabled={exportPending}
                className="gap-2.5 rounded-lg py-[9px] px-[10px]"
              >
                <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[7px] bg-[#F3F4F6]">
                  {exportPending ? (
                    <Spinner className="size-3.5" />
                  ) : (
                    <DownloadIcon size={13} color="#6B7280" />
                  )}
                </div>
                <div>
                  <p className="text-[12.5px] font-semibold leading-[1.2] text-[#111827]">
                    Export Excel
                  </p>
                  <p className="text-[10px] leading-[1.2] text-[#9CA3AF]">
                    Download all submissions
                  </p>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={onRefresh}
                disabled={refreshPending}
                className="gap-2.5 rounded-lg py-[9px] px-[10px]"
              >
                <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[7px] bg-[#F3F4F6]">
                  <RefreshIcon size={13} color="#6B7280" />
                </div>
                <div>
                  <p className="text-[12.5px] font-semibold leading-[1.2] text-[#111827]">
                    Refresh stats
                  </p>
                  <p className="text-[10px] leading-[1.2] text-[#9CA3AF]">
                    Recompute registrations & scores
                  </p>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={onDelete}
                variant="destructive"
                className="gap-2.5 rounded-lg py-[9px] px-[10px]"
              >
                <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[7px] bg-[#F3F4F6]">
                  <DeleteIcon size={13} color="#6B7280" />
                </div>
                <div>
                  <p className="text-[12.5px] font-semibold leading-[1.2] text-[#374151]">
                    Delete
                  </p>
                  <p className="text-[10px] leading-[1.2] text-[#9CA3AF]">
                    Permanently remove this webinar
                  </p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-2">
          {w.date && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-[#9CA3AF]">
                {new Date(w.date).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
                {" · "}
                {new Date(w.date).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
          {w.lang === "both" ? (
            <span className="flex items-center gap-1">
              <span className="rounded-[5px] bg-[#F3F4F6] px-2 py-[3px] text-[11px] uppercase text-[#6B7280]">
                FR
              </span>
              <span className="rounded-[5px] bg-[#F3F4F6] px-2 py-[3px] text-[11px] uppercase text-[#6B7280]">
                EN
              </span>
            </span>
          ) : (
            <span className="rounded-[5px] bg-[#F3F4F6] px-2 py-[3px] text-[11px] uppercase text-[#6B7280]">
              {w.lang}
            </span>
          )}
          <span className="rounded-[5px] bg-[#F3F4F6] px-2 py-[3px] text-[11px] text-[#6B7280]">
            {w.questions.length} questions
          </span>
        </div>

        {/* Footer */}
        <TooltipProvider>
          <div className="mt-auto flex items-center justify-between border-t border-[#F3F4F6] pt-3">
            <div className="flex items-center gap-1.5">
              {w.stats.avg_maturite_ia != null && (
                <span className="text-[11.5px] text-[#9CA3AF]">
                  avg{" "}
                  <strong className="text-[#111827]">
                    {w.stats.avg_maturite_ia}
                  </strong>
                  /100
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onSubs}
                    className="flex items-center gap-1 rounded-lg border border-[#E5E7EB] px-2 py-1.5 text-[#6B7280] hover:bg-gray-50"
                  >
                    <PeopleIcon size={13} />
                    <span className="text-[11.5px] font-semibold">
                      {w.stats.total_registrations}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">Registrations</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 rounded-lg border border-[#E5E7EB] px-2 py-1.5 text-[#6B7280]">
                    <VerifyIcon size={13} />
                    <span className="text-[11.5px] font-semibold">
                      {w.stats.total_completions}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">Completions</TooltipContent>
              </Tooltip>

              {w.status === "active" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSendLink();
                      }}
                      disabled={sendLinkPending}
                      aria-label="Send webinar link"
                      className="border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    >
                      {sendLinkPending ? (
                        <Spinner className="size-3.5" />
                      ) : (
                        <SendIcon size={14} />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Send link</TooltipContent>
                </Tooltip>
              )}

              {w.status === "active" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={handleCopyLink}
                      aria-label="Copy webinar link"
                      className={
                        copied
                          ? "border-gray-200 bg-gray-100 text-gray-700"
                          : "border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      }
                    >
                      {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {copied ? "Copied" : "Copy link"}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
const WebinarManagement: React.FC = () => {
  const page = 1;
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data, isLoading, isError, refetch } = useAdminWebinarsQuery({
    page,
    status: statusFilter || undefined,
  });

  const createMut = useCreateWebinarMutation();
  const updateMut = useUpdateWebinarMutation();
  const deleteMut = useDeleteWebinarMutation();
  const verifyMut = useVerifyWebinarMutation();
  const statsMut = useRefreshStatsMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Webinar | null>(null);
  const [qTargetId, setQTargetId] = useState<string | null>(null);
  const [subsTarget, setSubsTarget] = useState<Webinar | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [reminderTarget, setReminderTarget] = useState<Webinar | null>(null);
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(
    null,
  );

  const handleExport = async (w: Webinar) => {
    setExportingId(w._id);
    try {
      const result = await adminWebinarApi.listSubmissions(w._id, {
        limit: 5000,
      });
      const submissions = result?.data ?? [];
      const sortedQs = w.questions.slice().sort((a, b) => a.order - b.order);
      const rows = submissions.map((s) => ({
        Nom: s.contact?.nom ?? "",
        Email: s.contact?.email ?? "",
        Entreprise: s.contact?.entreprise ?? "",
        Langue: s.lang ?? "",
        Complété: s.completed ? "Oui" : "Non",
        "Maturité IA": s.scoring?.maturite_ia ?? "",
        "Intensité Pain": s.scoring?.intensite_pain ?? "",
        Tier: s.scoring?.tier ?? "",
        "ICP Fit": s.scoring?.icp_fit ?? "",
        "UTM Source": s.source?.utm_source ?? "",
        "UTM Campaign": s.source?.utm_campaign ?? "",
        Date: new Date(s.createdAt).toLocaleString("fr-FR"),
        ...Object.fromEntries(
          sortedQs.map((q) => {
            const raw = (s.answers as Record<string, unknown>)?.[q.key];
            const opt = q.options.find((o) => o.key === raw);
            return [q.label_fr.slice(0, 40), opt ? opt.label_fr : (raw ?? "")];
          }),
        ),
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Submissions");
      XLSX.writeFile(
        wb,
        `${w.title.replace(/[^a-z0-9]/gi, "_").slice(0, 30)}_${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
    } catch {
      err("Export failed.");
    } finally {
      setExportingId(null);
    }
  };

  const handleRefresh = (id: string) =>
    statsMut.mutate(id, {
      onSuccess: () => ok("Stats refreshed."),
      onError: () => err("Failed to refresh stats."),
    });

  const handleSave = (values: WebinarFormValues) => {
    if (createMut.isPending || updateMut.isPending) return;
    if (editTarget) {
      updateMut.mutate(
        { id: editTarget._id, values },
        {
          onSuccess: () => {
            ok("Webinar updated.");
            setFormOpen(false);
            setEditTarget(null);
          },
          onError: () => err("Failed to update webinar."),
        },
      );
    } else {
      createMut.mutate(values, {
        onSuccess: () => {
          ok("Webinar created.");
          setFormOpen(false);
        },
        onError: () => err("Failed to create webinar."),
      });
    }
  };

  const handleVerify = (w: Webinar) =>
    verifyMut.mutate(w._id, {
      onSuccess: () => ok(`"${w.title}" is now Published.`),
      onError: () => err("Failed to publish webinar."),
    });

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMut.mutate(deleteTarget, {
      onSuccess: () => {
        ok("Webinar deleted.");
        setDeleteTarget(null);
      },
      onError: () => {
        err("Failed to delete.");
        setDeleteTarget(null);
      },
    });
  };

  const handleSendReminder = async () => {
    if (!reminderTarget) return;
    setSendingReminderId(reminderTarget._id);
    setReminderTarget(null);
    try {
      const result = await adminWebinarApi.sendLinkReminder(reminderTarget._id);
      ok(
        `Reminder sent to ${result.sent} participant${result.sent !== 1 ? "s" : ""}${result.failed ? ` (${result.failed} failed)` : ""}.`,
      );
    } catch {
      err("Failed to send reminder.");
    } finally {
      setSendingReminderId(null);
    }
  };

  const webinars = data?.data ?? [];
  const qTarget = qTargetId
    ? (webinars.find((w) => w._id === qTargetId) ?? null)
    : null;

  return (
    <div>
      <AdminPageHeading
        title="Webinar Management"
        subtitle="Create webinars, let AI build the question set, then verify to publish"
      />

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-2">
          {["", "draft", "active"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors border
                ${statusFilter === s ? "bg-teal-600 border-teal-600 text-white" : "border-slate-200 text-slate-600 hover:border-teal-300 bg-white"}`}
            >
              {s === "" ? "All" : s === "active" ? "Published" : "Draft"}
            </button>
          ))}
        </div>
        <Button
          variant="ghost"
          onClick={() => {
            setEditTarget(null);
            setFormOpen(true);
          }}
          className="rounded-xl bg-teal-600 hover:bg-teal-700 hover:text-white text-white text-[13px] font-bold shadow-sm"
        >
          <AddIcon size={16} /> New Webinar
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner style={{ color: ADMIN_ACCENT }} />
        </div>
      ) : isError ? (
        <AdminQueryError message="Failed to load webinars." onRetry={refetch} />
      ) : webinars.length === 0 ? (
        <AdminChartCard>
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <WebinarIcon size={48} className="mb-4 opacity-40" />
            <p className="text-[15px] font-medium">No webinars yet</p>
            <p className="text-[13px] mt-1">
              Create your first webinar to get started
            </p>
          </div>
        </AdminChartCard>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {webinars.map((w) => (
            <WebinarCard
              key={w._id}
              w={w}
              onEdit={() => {
                setEditTarget(w);
                setFormOpen(true);
              }}
              onSubs={() => setSubsTarget(w)}
              onQuestions={() => setQTargetId(w._id)}
              onVerify={() => handleVerify(w)}
              verifyPending={verifyMut.isPending}
              onRefresh={() => handleRefresh(w._id)}
              refreshPending={statsMut.isPending}
              onExport={() => handleExport(w)}
              exportPending={exportingId === w._id}
              onSendLink={() => setReminderTarget(w)}
              sendLinkPending={sendingReminderId === w._id}
              onDelete={() => setDeleteTarget(w._id)}
            />
          ))}
        </div>
      )}

      <WebinarFormDialog
        open={formOpen}
        initial={editTarget ? toFormValues(editTarget) : null}
        onClose={() => {
          setFormOpen(false);
          setEditTarget(null);
        }}
        onSave={handleSave}
        saving={editTarget ? updateMut.isPending : createMut.isPending}
      />

      <QuestionsDialog
        webinar={qTarget}
        open={!!qTargetId}
        onClose={() => setQTargetId(null)}
      />

      <WebinarSubmissionsDialog
        webinar={subsTarget}
        open={!!subsTarget}
        onClose={() => setSubsTarget(null)}
      />

      <ConfirmDialog
        open={!!reminderTarget}
        title="Send webinar link to all participants?"
        description={`This will send the webinar join link to all completed participants of "${reminderTarget?.title}". The reminder email will be sent immediately to everyone.`}
        confirmLabel="Send now"
        loading={!!sendingReminderId}
        onConfirm={handleSendReminder}
        onCancel={() => setReminderTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete webinar?"
        description="This will permanently delete the webinar. Submissions are not affected."
        confirmLabel="Delete"
        destructive
        loading={deleteMut.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default WebinarManagement;
