import React, { useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/modules/shared/ui/shadcn/dialog";
import { Spinner } from "@/modules/shared/ui/shadcn/spinner";
import { Badge } from "@/modules/shared/ui/shadcn/badge";
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
  Archive as ArchiveIcon,
  MessageSquare as QIcon,
  ExternalLink as OpenIcon,
  X as CloseIcon,
  Send as SendIcon,
  Users as PeopleIcon,
  Download as DownloadIcon,
  MoreVertical as MoreIcon,
  Pencil as EditIcon,
} from "lucide-react";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/modules/shared/ui/shadcn/select";
import WebinarSubmissionsDialog from "./WebinarSubmissionsDialog";
import { adminWebinarApi } from "../api";
import { AdminPageHeading, AdminQueryError, AdminChartCard, ADMIN_ACCENT } from "@/modules/admin/shared";
import {
  useAdminWebinarsQuery,
  useCreateWebinarMutation,
  useUpdateWebinarMutation,
  useDeleteWebinarMutation,
  useVerifyWebinarMutation,
  useArchiveWebinarMutation,
  useRefreshStatsMutation,
} from "../queries";
import { ConfirmDialog } from "@/modules/admin/shared";
import type { Webinar, WebinarFormValues, WebinarQuestionDraft } from "../types";

// ── Module-level constants ─────────────────────────────────────────────────────
const ok  = (msg: string) => toast.success(msg);
const err = (msg: string) => toast.error(msg);

const STATUS_META: Record<string, { label: string; color: "success" | "warning" | "default" }> = {
  active:   { label: "Active",   color: "success" },
  draft:    { label: "Draft",    color: "warning" },
  archived: { label: "Archived", color: "default" },
};

const STATUS_DOT: Record<string, string> = {
  active:   "bg-emerald-400",
  draft:    "bg-amber-400",
  archived: "bg-slate-300",
};

const TIER_COLORS: Record<string, string> = { A: "#059669", B: "#4338CA", C: "#B45309", D: "#94A3B8" };

// ── Helpers ───────────────────────────────────────────────────────────────────
function toFormValues(w: Webinar): WebinarFormValues {
  return {
    title:        w.title,
    description:  w.description,
    about_fr:     w.about_fr     ?? "",
    about_en:     w.about_en     ?? "",
    webinar_link: w.webinar_link ?? "",
    date:         w.date ? w.date.slice(0, 16) : "",
    status:       w.status,
    lang:         w.lang,
    highlights:   [...(w.highlights ?? []), "", "", ""].slice(0, 3),
    questions:    w.questions.map(q => ({
      key: q.key, label_fr: q.label_fr, label_en: q.label_en,
      type: q.type, options: q.options, required: q.required, order: q.order,
    })),
  };
}

// ── Form dialog ───────────────────────────────────────────────────────────────
const EMPTY_FORM: WebinarFormValues = {
  title: "", description: "", about_fr: "", about_en: "", webinar_link: "", date: "", status: "draft",
  lang: "fr", highlights: ["", "", ""], questions: [],
};

const QUESTION_TYPES = ["choice", "scale", "text", "select"] as const;

function newQuestion(order: number): WebinarQuestionDraft {
  return { key: `q${order}_${Date.now()}`, label_fr: "", label_en: "", type: "choice", options: [], required: true, order };
}

function QuestionEditor({ q, idx, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast }: {
  q: WebinarQuestionDraft; idx: number;
  onChange: (q: WebinarQuestionDraft) => void;
  onDelete: () => void;
  onMoveUp: () => void; onMoveDown: () => void;
  isFirst: boolean; isLast: boolean;
}) {
  const inp = "w-full border border-slate-200 rounded-lg px-2.5 py-2 text-[13px] text-slate-700 outline-none focus:border-teal-400 transition-colors bg-white";

  const addOption = () => onChange({ ...q, options: [...q.options, { key: `opt${q.options.length + 1}`, label_fr: "", label_en: "" }] });
  const setOpt = (i: number, field: "key" | "label_fr" | "label_en", val: string) =>
    onChange({ ...q, options: q.options.map((o, j) => j === i ? { ...o, [field]: val } : o) });
  const delOpt = (i: number) => onChange({ ...q, options: q.options.filter((_, j) => j !== i) });

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-200">
        <span className="w-6 h-6 rounded-md bg-teal-100 text-teal-700 text-[11px] font-black flex items-center justify-center shrink-0">{idx + 1}</span>
        <span className="text-[12px] font-bold text-slate-600 flex-1 truncate">{q.label_fr || <span className="text-slate-300 font-normal">Question {idx + 1}</span>}</span>
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" onClick={onMoveUp} disabled={isFirst} className="p-1 h-auto rounded hover:bg-slate-200 text-slate-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
          </Button>
          <Button variant="ghost" onClick={onMoveDown} disabled={isLast} className="p-1 h-auto rounded hover:bg-slate-200 text-slate-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </Button>
          <Button variant="ghost" onClick={onDelete} className="p-1 h-auto rounded hover:bg-red-100 text-slate-300 hover:text-red-500 ml-1">
            <CloseIcon size={14} />
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="p-3 space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 mb-1">Label FR *</p>
            <input className={inp} value={q.label_fr} onChange={e => onChange({ ...q, label_fr: e.target.value })} placeholder="Question en français" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 mb-1">Label EN</p>
            <input className={inp} value={q.label_en} onChange={e => onChange({ ...q, label_en: e.target.value })} placeholder="Question in English" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 mb-1">Type</p>
            <Select value={q.type} onValueChange={v => onChange({ ...q, type: v as WebinarQuestionDraft["type"], options: [] })}>
              <SelectTrigger size="sm" className="w-full text-[13px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {QUESTION_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer pb-1.5">
              <div onClick={() => onChange({ ...q, required: !q.required })}
                className={`w-8 h-4 rounded-full transition-colors relative ${q.required ? "bg-teal-500" : "bg-slate-200"}`}>
                <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${q.required ? "left-4" : "left-0.5"}`} />
              </div>
              <span className="text-[11px] font-semibold text-slate-500">Required</span>
            </label>
          </div>
        </div>

        {(q.type === "choice" || q.type === "select") && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-semibold text-slate-400">Options</p>
              <Button variant="ghost" onClick={addOption} className="p-0 h-auto text-[10px] font-bold text-teal-600 hover:text-teal-700 hover:bg-transparent">
                <AddIcon size={12} /> Add option
              </Button>
            </div>
            <div className="space-y-1.5">
              {q.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <input className={inp + " flex-1"} value={opt.label_fr} onChange={e => setOpt(i, "label_fr", e.target.value)} placeholder={`Option ${i + 1} (FR)`} />
                  <input className={inp + " flex-1"} value={opt.label_en} onChange={e => setOpt(i, "label_en", e.target.value)} placeholder={`Option ${i + 1} (EN)`} />
                  <Button variant="ghost" onClick={() => delOpt(i)} className="p-1 h-auto rounded hover:bg-red-50 text-slate-300 hover:text-red-400 shrink-0">
                    <CloseIcon size={13} />
                  </Button>
                </div>
              ))}
              {q.options.length === 0 && (
                <p className="text-[11px] text-slate-300 italic">No options yet — click "Add option"</p>
              )}
            </div>
          </div>
        )}

        {q.type === "scale" && <p className="text-[11px] text-slate-400 italic">1–5 scale (no options needed)</p>}
        {q.type === "text"  && <p className="text-[11px] text-slate-400 italic">Free text input (no options needed)</p>}
      </div>
    </div>
  );
}

const STEPS = [
  { label: "Basics",    desc: "Title, date & link" },
  { label: "Content",   desc: "Landing page copy"  },
  { label: "Questions", desc: "Registration form"  },
];

function WebinarFormDialog({ open, initial, onClose, onSave }: {
  open: boolean; initial: WebinarFormValues | null;
  onClose: () => void; onSave: (v: WebinarFormValues) => void;
}) {
  const [form, setForm] = React.useState<WebinarFormValues>(initial ?? EMPTY_FORM);
  const [step, setStep] = React.useState(0);

  React.useEffect(() => { setForm(initial ?? EMPTY_FORM); setStep(0); }, [initial, open]);

  const set = <K extends keyof WebinarFormValues>(k: K, v: WebinarFormValues[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const addQuestion    = () => set("questions", [...form.questions, newQuestion(form.questions.length + 1)]);
  const updateQuestion = (idx: number, q: WebinarQuestionDraft) =>
    set("questions", form.questions.map((old, i) => i === idx ? q : old));
  const deleteQuestion = (idx: number) =>
    set("questions", form.questions.filter((_, i) => i !== idx).map((q, i) => ({ ...q, order: i + 1 })));
  const moveQuestion   = (idx: number, dir: -1 | 1) => {
    const arr  = [...form.questions];
    const swap = idx + dir;
    if (swap < 0 || swap >= arr.length) return;
    [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
    set("questions", arr.map((q, i) => ({ ...q, order: i + 1 })));
  };

  const inp    = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[14px] text-slate-700 outline-none focus:border-teal-400 transition-colors bg-white";
  const lbl    = "block text-[12px] font-semibold text-slate-600 mb-1.5";
  const canNext0 = form.title.trim().length > 0;
  const canSave  = canNext0 && form.questions.length > 0;

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent showCloseButton={false} className="sm:max-w-2xl p-0 gap-0 flex flex-col max-h-[92vh] overflow-hidden" style={{ borderRadius: "20px" }}>

        {/* Header */}
        <div className="px-6 pt-5 pb-0 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] font-bold text-teal-600 uppercase tracking-widest mb-0.5">Step {step + 1} of {STEPS.length}</p>
              <h2 className="text-[17px] font-black text-slate-900">{initial?.title ? `Edit — ${initial.title}` : "New Webinar"}</h2>
            </div>
            <Button variant="ghost" onClick={onClose} className="p-1.5 h-auto rounded-lg hover:bg-slate-100 text-slate-400">
              <CloseIcon size={18} />
            </Button>
          </div>

          {/* Stepper */}
          <div className="flex items-stretch gap-0 -mb-px">
            {STEPS.map((s, i) => {
              const done   = i < step;
              const active = i === step;
              return (
                <button key={i} onClick={() => (done || active) && setStep(i)} disabled={!done && !active}
                  className={`flex-1 flex flex-col items-start px-4 py-2.5 border-b-2 transition-colors text-left
                    ${active ? "border-teal-500 bg-teal-50/60" : "border-transparent"}
                    ${done   ? "cursor-pointer hover:bg-slate-50" : ""}
                    ${!active && !done ? "opacity-40 cursor-default" : ""}`}>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0
                      ${active ? "bg-teal-500 text-white" : done ? "bg-emerald-400 text-white" : "bg-slate-200 text-slate-400"}`}>
                      {done ? "✓" : i + 1}
                    </span>
                    <span className={`text-[12px] font-bold ${active ? "text-teal-700" : done ? "text-slate-700" : "text-slate-400"}`}>{s.label}</span>
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
              <div className="space-y-4">
                <div>
                  <label className={lbl}>Title <span className="text-red-400">*</span></label>
                  <input className={inp} value={form.title} onChange={e => set("title", e.target.value)} placeholder="Webinar title" autoFocus />
                </div>
                <div>
                  <label className={lbl}>Short description</label>
                  <textarea className={inp} rows={2} value={form.description} onChange={e => set("description", e.target.value)} placeholder="What's this webinar about?" style={{ resize: "none" }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Date & time</label>
                    <input type="datetime-local" className={inp} value={form.date} onChange={e => set("date", e.target.value)} />
                  </div>
                  <div>
                    <label className={lbl}>Language</label>
                    <Select value={form.lang} onValueChange={v => set("lang", v as WebinarFormValues["lang"])}>
                      <SelectTrigger className="w-full text-[14px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className={lbl}>Join link <span className="text-slate-400 font-normal text-[11px]">(Zoom / Teams / Meet)</span></label>
                  <input className={inp} type="url" value={form.webinar_link} onChange={e => set("webinar_link", e.target.value)} placeholder="https://zoom.us/j/..." />
                </div>
                <div>
                  <label className={lbl}>Status</label>
                  <div className="flex gap-2">
                    {(["draft", "active", "archived"] as const).map(s => (
                      <button key={s} onClick={() => set("status", s)}
                        className={`flex-1 py-2 rounded-xl border text-[12px] font-semibold transition-colors capitalize
                          ${form.status === s ? "bg-teal-600 border-teal-600 text-white" : "border-slate-200 text-slate-500 hover:border-teal-300 bg-white"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>About — FR <span className="text-slate-400 font-normal text-[11px] ml-1">(landing page)</span></label>
                    <textarea className={inp} rows={6} value={form.about_fr} onChange={e => set("about_fr", e.target.value)} placeholder="Décrivez ce webinar en français…" style={{ resize: "vertical" }} />
                  </div>
                  <div>
                    <label className={lbl}>About — EN <span className="text-slate-400 font-normal text-[11px] ml-1">(landing page)</span></label>
                    <textarea className={inp} rows={6} value={form.about_en} onChange={e => set("about_en", e.target.value)} placeholder="Describe this webinar in English…" style={{ resize: "vertical" }} />
                  </div>
                </div>
                <div>
                  <label className={lbl}>Highlights <span className="text-slate-400 font-normal text-[11px]">(up to 3 bullets on home page)</span></label>
                  <div className="space-y-2">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-[10px] font-black flex items-center justify-center shrink-0">{i + 1}</span>
                        <input className={inp} value={form.highlights[i] ?? ""} onChange={e => {
                          const next = [...form.highlights]; next[i] = e.target.value; set("highlights", next);
                        }} placeholder={`Benefit ${i + 1}`} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                {form.questions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2 opacity-40"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    <p className="text-[14px] font-medium">No questions yet</p>
                    <p className="text-[12px] mt-0.5">Add questions below</p>
                  </div>
                ) : form.questions.map((q, idx) => (
                  <QuestionEditor key={q.key} q={q} idx={idx}
                    onChange={nq => updateQuestion(idx, nq)}
                    onDelete={() => deleteQuestion(idx)}
                    onMoveUp={() => moveQuestion(idx, -1)}
                    onMoveDown={() => moveQuestion(idx, 1)}
                    isFirst={idx === 0} isLast={idx === form.questions.length - 1}
                  />
                ))}
                <Button variant="outline" onClick={addQuestion}
                  className="w-full rounded-xl border-2 border-dashed border-teal-200 text-teal-600 text-[13px] font-semibold hover:bg-teal-50">
                  <AddIcon size={16} /> Add question
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/60">
          <Button variant="outline" onClick={onClose} className="rounded-xl text-[13px] font-semibold text-slate-500">Cancel</Button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(s => s - 1)} className="rounded-xl text-[13px] font-semibold text-slate-600">← Back</Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button variant="ghost" onClick={() => setStep(s => s + 1)} disabled={step === 0 && !canNext0}
                className="rounded-xl bg-teal-600 hover:bg-teal-700 hover:text-white text-white text-[13px] font-bold">
                Next →
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => onSave(form)} disabled={!canSave}
                title={!canSave ? "Add a title and at least one question" : undefined}
                className="rounded-xl bg-teal-600 hover:bg-teal-700 hover:text-white text-white text-[13px] font-bold">
                Save webinar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Questions preview dialog ───────────────────────────────────────────────────
function QuestionsDialog({ webinar, open, onClose }: { webinar: Webinar | null; open: boolean; onClose: () => void }) {
  if (!webinar) return null;
  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent showCloseButton={false} className="sm:max-w-2xl p-0 gap-0 overflow-hidden" style={{ borderRadius: "16px" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 font-bold text-base">
          <span>Questions — {webinar.title}</span>
          <Button variant="ghost" onClick={onClose} className="p-1 h-auto rounded-lg hover:bg-slate-100 text-slate-400"><CloseIcon size={18} /></Button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto">
          {webinar.questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <QIcon size={40} className="mb-2" />
              <p className="text-[14px]">No questions yet. Edit the webinar to add questions.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {[...webinar.questions].sort((a, b) => a.order - b.order).map((q, i) => (
                <div key={q.key} className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 text-teal-600 text-[11px] font-black flex items-center justify-center mt-0.5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[13px] font-bold text-slate-800">{q.label_fr}</span>
                        <Badge variant="outline" className="h-[18px] rounded-md border-transparent bg-slate-100 px-1.5 text-[10px] font-normal text-slate-500">{q.type}</Badge>
                      </div>
                      <p className="text-[12px] text-slate-400 italic">{q.label_en}</p>
                      {q.options.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {q.options.map(o => <span key={o.key} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px]">{o.label_fr}</span>)}
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
function WebinarCard({ w, onEdit, onSubs, onQuestions, onVerify, verifyPending, onArchive, archivePending, onRefresh, refreshPending, onExport, exportPending, onSendLink, sendLinkPending, onDelete }: {
  w: Webinar;
  onEdit: () => void; onSubs: () => void; onQuestions: () => void;
  onVerify: () => void; verifyPending: boolean;
  onArchive: () => void; archivePending: boolean;
  onRefresh: () => void; refreshPending: boolean;
  onExport: () => void; exportPending: boolean;
  onSendLink: () => void; sendLinkPending: boolean;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const publicUrl = `/webinar?id=${w._id}`;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className={`h-[3px] ${w.status === "active" ? "bg-gradient-to-r from-teal-500 to-emerald-400" : w.status === "draft" ? "bg-gradient-to-r from-amber-400 to-yellow-300" : "bg-slate-200"}`} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[w.status] ?? "bg-slate-300"}`} />
              <h3 className="text-[15px] font-bold text-slate-900 truncate">{w.title}</h3>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 uppercase tracking-wide">{w.lang}</span>
            </div>
            {w.description && <p className="text-[12px] text-slate-400 mt-0.5 truncate max-w-[520px] pl-4">{w.description}</p>}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {w.status === "draft" && (
              <Button variant="ghost" onClick={onVerify} disabled={verifyPending}
                className="px-3 py-1.5 h-auto rounded-lg bg-teal-600 hover:bg-teal-700 hover:text-white text-white text-[12px] font-bold">
                <VerifyIcon size={13} /> Publish
              </Button>
            )}
            {w.status === "active" && (
              <Button variant="ghost" onClick={onSendLink} disabled={sendLinkPending}
                className="px-3 py-1.5 h-auto rounded-lg bg-teal-600 hover:bg-teal-700 hover:text-white text-white text-[12px] font-bold">
                {sendLinkPending ? <Spinner className="size-[11px] text-white" /> : <SendIcon size={13} />}
                Send link
              </Button>
            )}
            <Button variant="outline" onClick={onEdit} className="px-3 py-1.5 h-auto rounded-lg text-slate-600 text-[12px] font-semibold">
              <EditIcon size={13} /> Edit
            </Button>
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors">
                  <MoreIcon size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] min-w-[190px]">
                <DropdownMenuItem onClick={onQuestions} className="text-[13px] gap-2"><QIcon size={16} color="#64748B" /> View questions</DropdownMenuItem>
                <DropdownMenuItem asChild className="text-[13px] gap-2">
                  <a href={publicUrl} target="_blank" rel="noopener noreferrer"><OpenIcon size={16} color="#64748B" /> Preview page</a>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExport} disabled={exportPending} className="text-[13px] gap-2">
                  {exportPending ? <Spinner className="size-3.5" /> : <DownloadIcon size={16} color="#059669" />} Export Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onRefresh} disabled={refreshPending} className="text-[13px] gap-2">
                  <RefreshIcon size={16} color="#64748B" /> Refresh stats
                </DropdownMenuItem>
                {w.status === "active" && (
                  <DropdownMenuItem onClick={onArchive} disabled={archivePending} className="text-[13px] gap-2">
                    <ArchiveIcon size={16} color="#B45309" /> Archive
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} variant="destructive" className="text-[13px] gap-2">
                  <DeleteIcon size={16} /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 flex-wrap">
          {w.date && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-500 font-medium">
              📅 {new Date(w.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
              {" · "}{new Date(w.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <Button variant="outline" onClick={onSubs}
            className="px-2.5 py-1 h-auto rounded-lg bg-indigo-50 border-indigo-100 text-[11px] text-indigo-600 font-bold hover:bg-indigo-100">
            <PeopleIcon size={11} /> {w.stats.total_registrations} inscrits
          </Button>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-100 text-[11px] text-teal-600 font-bold">
            ✓ {w.stats.total_completions} completed
          </span>
          {w.stats.avg_maturite_ia != null && (
            <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-500 font-medium">
              avg <strong className="text-teal-600">{w.stats.avg_maturite_ia}</strong>/100
            </span>
          )}
          <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-400 font-medium">
            {w.questions.length} questions
          </span>
          {(["A","B","C","D"] as const).map(tier => {
            const count = (w.stats.tier_breakdown as Record<string,number>)?.[tier] ?? 0;
            if (!count) return null;
            return (
              <span key={tier} className="px-2 py-1 rounded-lg text-[11px] font-bold border"
                style={{ borderColor: `${TIER_COLORS[tier]}30`, background: `${TIER_COLORS[tier]}10`, color: TIER_COLORS[tier] }}>
                {tier} · {count}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
const WebinarManagement: React.FC = () => {
  const [page]         = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data, isLoading, isError, refetch } = useAdminWebinarsQuery({ page, status: statusFilter || undefined });

  const createMut  = useCreateWebinarMutation();
  const updateMut  = useUpdateWebinarMutation();
  const deleteMut  = useDeleteWebinarMutation();
  const verifyMut  = useVerifyWebinarMutation();
  const archiveMut = useArchiveWebinarMutation();
  const statsMut   = useRefreshStatsMutation();

  const [formOpen,          setFormOpen]          = useState(false);
  const [editTarget,        setEditTarget]         = useState<Webinar | null>(null);
  const [qTargetId,         setQTargetId]          = useState<string | null>(null);
  const [subsTarget,        setSubsTarget]         = useState<Webinar | null>(null);
  const [deleteTarget,      setDeleteTarget]       = useState<string | null>(null);
  const [exportingId,       setExportingId]        = useState<string | null>(null);
  const [reminderTarget,    setReminderTarget]     = useState<Webinar | null>(null);
  const [sendingReminderId, setSendingReminderId]  = useState<string | null>(null);

  const handleExport = async (w: Webinar) => {
    setExportingId(w._id);
    try {
      const result      = await adminWebinarApi.listSubmissions(w._id, { limit: 5000 });
      const submissions = result?.data ?? [];
      const sortedQs    = w.questions.slice().sort((a, b) => a.order - b.order);
      const rows = submissions.map(s => ({
        Nom:              s.contact?.nom        ?? "",
        Email:            s.contact?.email      ?? "",
        Entreprise:       s.contact?.entreprise ?? "",
        Langue:           s.lang               ?? "",
        "Complété":       s.completed ? "Oui" : "Non",
        "Maturité IA":    s.scoring?.maturite_ia    ?? "",
        "Intensité Pain": s.scoring?.intensite_pain ?? "",
        Tier:             s.scoring?.tier           ?? "",
        "ICP Fit":        s.scoring?.icp_fit        ?? "",
        "UTM Source":     s.source?.utm_source      ?? "",
        "UTM Campaign":   s.source?.utm_campaign    ?? "",
        Date:             new Date(s.createdAt).toLocaleString("fr-FR"),
        ...Object.fromEntries(sortedQs.map(q => {
          const raw = (s.answers as Record<string, unknown>)?.[q.key];
          const opt = q.options.find(o => o.key === raw);
          return [q.label_fr.slice(0, 40), opt ? opt.label_fr : raw ?? ""];
        })),
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Submissions");
      XLSX.writeFile(wb, `${w.title.replace(/[^a-z0-9]/gi, "_").slice(0, 30)}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch {
      err("Export failed.");
    } finally {
      setExportingId(null);
    }
  };

  const handleSave = (values: WebinarFormValues) => {
    if (editTarget) {
      updateMut.mutate({ id: editTarget._id, values }, {
        onSuccess: () => { ok("Webinar updated."); setFormOpen(false); setEditTarget(null); },
        onError:   () => err("Failed to update webinar."),
      });
    } else {
      createMut.mutate(values, {
        onSuccess: () => { ok("Webinar created."); setFormOpen(false); },
        onError:   () => err("Failed to create webinar."),
      });
    }
  };

  const handleVerify  = (w: Webinar) => verifyMut.mutate(w._id, {
    onSuccess: () => ok(`"${w.title}" is now Active.`),
    onError:   () => err("Failed to verify webinar."),
  });

  const handleArchive = (w: Webinar) => archiveMut.mutate(w._id, {
    onSuccess: () => ok(`"${w.title}" archived.`),
    onError:   () => err("Failed to archive webinar."),
  });

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMut.mutate(deleteTarget, {
      onSuccess: () => { ok("Webinar deleted.");    setDeleteTarget(null); },
      onError:   () => { err("Failed to delete."); setDeleteTarget(null); },
    });
  };

  const handleSendReminder = async () => {
    if (!reminderTarget) return;
    setSendingReminderId(reminderTarget._id);
    setReminderTarget(null);
    try {
      const result = await adminWebinarApi.sendLinkReminder(reminderTarget._id);
      ok(`Reminder sent to ${result.sent} participant${result.sent !== 1 ? "s" : ""}${result.failed ? ` (${result.failed} failed)` : ""}.`);
    } catch {
      err("Failed to send reminder.");
    } finally {
      setSendingReminderId(null);
    }
  };

  const webinars = data?.data ?? [];
  const qTarget  = qTargetId ? (webinars.find(w => w._id === qTargetId) ?? null) : null;

  return (
    <div>
      <AdminPageHeading
        title="Webinar Management"
        subtitle="Create webinars, let AI build the question set, then verify to publish"
      />

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-2">
          {["", "draft", "active", "archived"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors border
                ${statusFilter === s ? "bg-teal-600 border-teal-600 text-white" : "border-slate-200 text-slate-600 hover:border-teal-300 bg-white"}`}>
              {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <Button variant="ghost" onClick={() => { setEditTarget(null); setFormOpen(true); }}
          className="rounded-xl bg-teal-600 hover:bg-teal-700 hover:text-white text-white text-[13px] font-bold shadow-sm">
          <AddIcon size={16} /> New Webinar
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner style={{ color: ADMIN_ACCENT }} /></div>
      ) : isError ? (
        <AdminQueryError message="Failed to load webinars." onRetry={refetch} />
      ) : webinars.length === 0 ? (
        <AdminChartCard>
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <WebinarIcon size={48} className="mb-4 opacity-40" />
            <p className="text-[15px] font-medium">No webinars yet</p>
            <p className="text-[13px] mt-1">Create your first webinar to get started</p>
          </div>
        </AdminChartCard>
      ) : (
        <div className="grid gap-3">
          {webinars.map(w => (
            <WebinarCard key={w._id} w={w}
              onEdit={() => { setEditTarget(w); setFormOpen(true); }}
              onSubs={() => setSubsTarget(w)}
              onQuestions={() => setQTargetId(w._id)}
              onVerify={() => handleVerify(w)}   verifyPending={verifyMut.isPending}
              onArchive={() => handleArchive(w)} archivePending={archiveMut.isPending}
              onRefresh={() => statsMut.mutate(w._id, { onSuccess: () => ok("Stats refreshed."), onError: () => err("Failed to refresh stats.") })}
              refreshPending={statsMut.isPending}
              onExport={() => handleExport(w)}   exportPending={exportingId === w._id}
              onSendLink={() => setReminderTarget(w)} sendLinkPending={sendingReminderId === w._id}
              onDelete={() => setDeleteTarget(w._id)}
            />
          ))}
        </div>
      )}

      <WebinarFormDialog
        open={formOpen}
        initial={editTarget ? toFormValues(editTarget) : null}
        onClose={() => { setFormOpen(false); setEditTarget(null); }}
        onSave={handleSave}
      />

      <QuestionsDialog webinar={qTarget} open={!!qTargetId} onClose={() => setQTargetId(null)} />

      <WebinarSubmissionsDialog webinar={subsTarget} open={!!subsTarget} onClose={() => setSubsTarget(null)} />

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
