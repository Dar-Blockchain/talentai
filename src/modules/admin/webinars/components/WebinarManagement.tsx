import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { CircularProgress, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Menu, MenuItem, ListItemIcon, ListItemText, Divider } from "@mui/material";
import {
  Add as AddIcon,
  VideoLibrary as WebinarIcon,
  CheckCircle as VerifyIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  QuestionAnswer as QIcon,
  OpenInNew as OpenIcon,
  Close as CloseIcon,
  Send as SendIcon,
  PeopleAlt as PeopleIcon,
  Download as DownloadIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import WebinarSubmissionsDialog from "./WebinarSubmissionsDialog";
import { adminWebinarApi } from "../api";
import {
  AdminPageHeading, AdminQueryError, AdminChartCard,
  ADMIN_TABLE_HEAD_CELL_SX, ADMIN_TABLE_ROW_SX,
} from "@/modules/admin/shared";
import { ADMIN_ACCENT } from "@/modules/admin/shared";
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

// ── Status badge ───────────────────────────────────────────────────────────────
const STATUS_META: Record<string, { label: string; color: "success" | "warning" | "default" }> = {
  active:   { label: "Active",   color: "success" },
  draft:    { label: "Draft",    color: "warning" },
  archived: { label: "Archived", color: "default" },
};

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
  const setOpt = (i: number, field: "key" | "label_fr" | "label_en", val: string) => {
    const opts = q.options.map((o, j) => j === i ? { ...o, [field]: val } : o);
    onChange({ ...q, options: opts });
  };
  const delOpt = (i: number) => onChange({ ...q, options: q.options.filter((_, j) => j !== i) });

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-200">
        <span className="w-6 h-6 rounded-md bg-teal-100 text-teal-700 text-[11px] font-black flex items-center justify-center shrink-0">{idx + 1}</span>
        <span className="text-[12px] font-bold text-slate-600 flex-1 truncate">{q.label_fr || <span className="text-slate-300 font-normal">Question {idx + 1}</span>}</span>
        <div className="flex items-center gap-0.5">
          <button onClick={onMoveUp} disabled={isFirst} className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 text-slate-400 transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
          </button>
          <button onClick={onMoveDown} disabled={isLast} className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 text-slate-400 transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <button onClick={onDelete} className="p-1 rounded hover:bg-red-100 text-slate-300 hover:text-red-500 transition-colors ml-1">
            <CloseIcon sx={{ fontSize: 14 }} />
          </button>
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
            <select className={inp} value={q.type} onChange={e => onChange({ ...q, type: e.target.value as WebinarQuestionDraft["type"], options: [] })}>
              {QUESTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
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

        {/* Options — only for choice/select */}
        {(q.type === "choice" || q.type === "select") && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-semibold text-slate-400">Options</p>
              <button onClick={addOption} className="text-[10px] font-bold text-teal-600 hover:text-teal-700 flex items-center gap-0.5">
                <AddIcon sx={{ fontSize: 12 }} /> Add option
              </button>
            </div>
            <div className="space-y-1.5">
              {q.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <input className={inp + " flex-1"} value={opt.label_fr} onChange={e => setOpt(i, "label_fr", e.target.value)} placeholder={`Option ${i + 1} (FR)`} />
                  <input className={inp + " flex-1"} value={opt.label_en} onChange={e => setOpt(i, "label_en", e.target.value)} placeholder={`Option ${i + 1} (EN)`} />
                  <button onClick={() => delOpt(i)} className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors shrink-0">
                    <CloseIcon sx={{ fontSize: 13 }} />
                  </button>
                </div>
              ))}
              {q.options.length === 0 && (
                <p className="text-[11px] text-slate-300 italic">No options yet — click "Add option"</p>
              )}
            </div>
          </div>
        )}

        {q.type === "scale" && (
          <p className="text-[11px] text-slate-400 italic">1–5 scale (no options needed)</p>
        )}
        {q.type === "text" && (
          <p className="text-[11px] text-slate-400 italic">Free text input (no options needed)</p>
        )}
      </div>
    </div>
  );
}

const STEPS = [
  { label: "Basics",   desc: "Title, date & link" },
  { label: "Content",  desc: "Landing page copy" },
  { label: "Questions", desc: "Registration form" },
];

function WebinarFormDialog({
  open, initial, onClose, onSave,
}: {
  open: boolean;
  initial: WebinarFormValues | null;
  onClose: () => void;
  onSave: (v: WebinarFormValues) => void;
}) {
  const [form, setForm] = React.useState<WebinarFormValues>(initial ?? EMPTY_FORM);
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    setForm(initial ?? EMPTY_FORM);
    setStep(0);
  }, [initial, open]);

  const set = <K extends keyof WebinarFormValues>(k: K, v: WebinarFormValues[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const addQuestion = () => set("questions", [...form.questions, newQuestion(form.questions.length + 1)]);

  const updateQuestion = (idx: number, q: WebinarQuestionDraft) =>
    set("questions", form.questions.map((old, i) => i === idx ? q : old));

  const deleteQuestion = (idx: number) =>
    set("questions", form.questions.filter((_, i) => i !== idx).map((q, i) => ({ ...q, order: i + 1 })));

  const moveQuestion = (idx: number, dir: -1 | 1) => {
    const arr = [...form.questions];
    const swap = idx + dir;
    if (swap < 0 || swap >= arr.length) return;
    [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
    set("questions", arr.map((q, i) => ({ ...q, order: i + 1 })));
  };

  const inp = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[14px] text-slate-700 outline-none focus:border-teal-400 transition-colors bg-white";
  const lbl = "block text-[12px] font-semibold text-slate-600 mb-1.5";

  const canNext0 = form.title.trim().length > 0;
  const canSave  = form.title.trim().length > 0 && form.questions.length > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { borderRadius: "20px", display: "flex", flexDirection: "column", maxHeight: "92vh", overflow: "hidden" } }}>

      {/* ── Header ── */}
      <div className="px-6 pt-5 pb-0 border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] font-bold text-teal-600 uppercase tracking-widest mb-0.5">
              Step {step + 1} of {STEPS.length}
            </p>
            <h2 className="text-[17px] font-black text-slate-900">
              {initial?.title ? `Edit — ${initial.title}` : "New Webinar"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <CloseIcon sx={{ fontSize: 18 }} />
          </button>
        </div>

        {/* Stepper */}
        <div className="flex items-stretch gap-0 -mb-px">
          {STEPS.map((s, i) => {
            const done    = i < step;
            const active  = i === step;
            return (
              <button
                key={i}
                onClick={() => (done || active) && setStep(i)}
                disabled={!done && !active}
                className={`flex-1 flex flex-col items-start px-4 py-2.5 border-b-2 transition-colors text-left
                  ${active  ? "border-teal-500 bg-teal-50/60" : "border-transparent"}
                  ${done    ? "cursor-pointer hover:bg-slate-50" : ""}
                  ${!active && !done ? "opacity-40 cursor-default" : ""}`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0
                    ${active ? "bg-teal-500 text-white" : done ? "bg-emerald-400 text-white" : "bg-slate-200 text-slate-400"}`}>
                    {done ? "✓" : i + 1}
                  </span>
                  <span className={`text-[12px] font-bold ${active ? "text-teal-700" : done ? "text-slate-700" : "text-slate-400"}`}>
                    {s.label}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 pl-5">{s.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ── */}
      <DialogContent sx={{ p: 0, overflowY: "auto", flex: 1 }}>
        <div className="px-6 py-5">

          {/* Step 0 — Basics */}
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
                  <select className={inp} value={form.lang} onChange={e => set("lang", e.target.value as WebinarFormValues["lang"])}>
                    <option value="fr">French</option>
                    <option value="en">English</option>
                    <option value="both">Both</option>
                  </select>
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

          {/* Step 1 — Content */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>
                    About — FR
                    <span className="text-slate-400 font-normal text-[11px] ml-1">(landing page)</span>
                  </label>
                  <textarea className={inp} rows={6} value={form.about_fr} onChange={e => set("about_fr", e.target.value)} placeholder="Décrivez ce webinar en français…" style={{ resize: "vertical" }} />
                </div>
                <div>
                  <label className={lbl}>
                    About — EN
                    <span className="text-slate-400 font-normal text-[11px] ml-1">(landing page)</span>
                  </label>
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

          {/* Step 2 — Questions */}
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
              <button onClick={addQuestion}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-teal-200 text-teal-600 text-[13px] font-semibold hover:bg-teal-50 transition-colors">
                <AddIcon sx={{ fontSize: 16 }} /> Add question
              </button>
            </div>
          )}

        </div>
      </DialogContent>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/60">
        <button onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-500 hover:bg-slate-100 transition-colors">
          Cancel
        </button>
        <div className="flex items-center gap-2">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
              ← Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={step === 0 && !canNext0}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white disabled:text-slate-400 text-[13px] font-bold transition-colors">
              Next →
            </button>
          ) : (
            <button onClick={() => onSave(form)} disabled={!canSave}
              title={!canSave ? "Add a title and at least one question" : undefined}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white disabled:text-slate-400 text-[13px] font-bold transition-colors">
              Save webinar
            </button>
          )}
        </div>
      </div>
    </Dialog>
  );
}

// ── Questions preview dialog ───────────────────────────────────────────────────
function QuestionsDialog({ webinar, open, onClose }: {
  webinar: Webinar | null; open: boolean; onClose: () => void;
}) {
  if (!webinar) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { borderRadius: "16px" } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 700, fontSize: "1rem" }}>
        <span>Questions — {webinar.title}</span>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"><CloseIcon sx={{ fontSize: 18 }} /></button>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        {webinar.questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <QIcon sx={{ fontSize: 40, mb: 1 }} />
            <p className="text-[14px]">No questions yet. Edit the webinar to add questions.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {[...webinar.questions].sort((a, b) => a.order - b.order).map((q, i) => (
              <div key={q.key} className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 text-teal-600 text-[11px] font-black flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px] font-bold text-slate-800">{q.label_fr}</span>
                      <Chip label={q.type} size="small" sx={{ height: 18, fontSize: 10, bgcolor: "#F1F5F9", color: "#64748B" }} />
                    </div>
                    <p className="text-[12px] text-slate-400 italic">{q.label_en}</p>
                    {q.options.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {q.options.map(o => (
                          <span key={o.key} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px]">{o.label_fr}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Webinar card ─────────────────────────────────────────────────────────────
const TIER_COLORS: Record<string, string> = { A: "#059669", B: "#4338CA", C: "#B45309", D: "#94A3B8" };

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
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const meta = STATUS_META[w.status] ?? STATUS_META.draft;
  const publicUrl = `/webinar?id=${w._id}`;

  const statusDot: Record<string, string> = {
    active: "bg-emerald-400",
    draft: "bg-amber-400",
    archived: "bg-slate-300",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Top accent line — color by status */}
      <div className={`h-[3px] ${w.status === "active" ? "bg-gradient-to-r from-teal-500 to-emerald-400" : w.status === "draft" ? "bg-gradient-to-r from-amber-400 to-yellow-300" : "bg-slate-200"}`} />

      <div className="p-5">
        {/* ── Row 1: title + status + actions ── */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot[w.status] ?? "bg-slate-300"}`} />
              <h3 className="text-[15px] font-bold text-slate-900 truncate">{w.title}</h3>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 uppercase tracking-wide">{w.lang}</span>
            </div>
            {w.description && (
              <p className="text-[12px] text-slate-400 mt-0.5 truncate max-w-[520px] pl-4">{w.description}</p>
            )}
          </div>

          {/* Primary actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {w.status === "draft" && (
              <button onClick={onVerify} disabled={verifyPending}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[12px] font-bold transition-colors disabled:opacity-40">
                <VerifyIcon sx={{ fontSize: 13 }} /> Publish
              </button>
            )}
            {w.status === "active" && (
              <button onClick={onSendLink} disabled={sendLinkPending}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[12px] font-bold transition-colors disabled:opacity-40">
                {sendLinkPending ? <CircularProgress size={11} sx={{ color: "#fff" }} /> : <SendIcon sx={{ fontSize: 13 }} />}
                Send link
              </button>
            )}
            <button onClick={onEdit}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-[12px] font-semibold hover:bg-slate-50 transition-colors">
              <EditIcon sx={{ fontSize: 13 }} /> Edit
            </button>
            <button onClick={e => setMenuAnchor(e.currentTarget)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors">
              <MoreIcon sx={{ fontSize: 16 }} />
            </button>
            <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}
              PaperProps={{ sx: { borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", minWidth: 190 } }}>
              <MenuItem onClick={() => { onQuestions(); setMenuAnchor(null); }} sx={{ fontSize: 13, gap: 1 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><QIcon sx={{ fontSize: 16, color: "#64748B" }} /></ListItemIcon>
                <ListItemText primaryTypographyProps={{ fontSize: 13 }}>View questions</ListItemText>
              </MenuItem>
              <MenuItem component="a" href={publicUrl} target="_blank" rel="noopener noreferrer" onClick={() => setMenuAnchor(null)} sx={{ fontSize: 13 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><OpenIcon sx={{ fontSize: 16, color: "#64748B" }} /></ListItemIcon>
                <ListItemText primaryTypographyProps={{ fontSize: 13 }}>Preview page</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { onExport(); setMenuAnchor(null); }} disabled={exportPending} sx={{ fontSize: 13 }}>
                <ListItemIcon sx={{ minWidth: 28 }}>{exportPending ? <CircularProgress size={14} /> : <DownloadIcon sx={{ fontSize: 16, color: "#059669" }} />}</ListItemIcon>
                <ListItemText primaryTypographyProps={{ fontSize: 13 }}>Export Excel</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { onRefresh(); setMenuAnchor(null); }} disabled={refreshPending} sx={{ fontSize: 13 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><RefreshIcon sx={{ fontSize: 16, color: "#64748B" }} /></ListItemIcon>
                <ListItemText primaryTypographyProps={{ fontSize: 13 }}>Refresh stats</ListItemText>
              </MenuItem>
              {w.status === "active" && (
                <MenuItem onClick={() => { onArchive(); setMenuAnchor(null); }} disabled={archivePending} sx={{ fontSize: 13 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}><ArchiveIcon sx={{ fontSize: 16, color: "#B45309" }} /></ListItemIcon>
                  <ListItemText primaryTypographyProps={{ fontSize: 13 }}>Archive</ListItemText>
                </MenuItem>
              )}
              <Divider />
              <MenuItem onClick={() => { onDelete(); setMenuAnchor(null); }} sx={{ fontSize: 13, color: "#EF4444" }}>
                <ListItemIcon sx={{ minWidth: 28 }}><DeleteIcon sx={{ fontSize: 16, color: "#EF4444" }} /></ListItemIcon>
                <ListItemText primaryTypographyProps={{ fontSize: 13, color: "#EF4444" }}>Delete</ListItemText>
              </MenuItem>
            </Menu>
          </div>
        </div>

        {/* ── Row 2: stat pills ── */}
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          {w.date && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-500 font-medium">
              📅 {new Date(w.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
              {" · "}{new Date(w.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button onClick={onSubs}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-[11px] text-indigo-600 font-bold hover:bg-indigo-100 transition-colors">
            <PeopleIcon sx={{ fontSize: 11 }} /> {w.stats.total_registrations} inscrits
          </button>
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
          {/* Tier breakdown */}
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
  const [page] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data, isLoading, isError, refetch } = useAdminWebinarsQuery({ page, status: statusFilter || undefined });

  const createMut   = useCreateWebinarMutation();
  const updateMut   = useUpdateWebinarMutation();
  const deleteMut   = useDeleteWebinarMutation();
  const verifyMut   = useVerifyWebinarMutation();
  const archiveMut  = useArchiveWebinarMutation();
  const statsMut    = useRefreshStatsMutation();

  const [formOpen, setFormOpen]       = useState(false);
  const [editTarget, setEditTarget]   = useState<Webinar | null>(null);
  const [qTargetId, setQTargetId]     = useState<string | null>(null);
  const [subsTarget, setSubsTarget]   = useState<Webinar | null>(null);
  const [deleteTarget, setDeleteTarget]     = useState<string | null>(null);
  const [exportingId, setExportingId]       = useState<string | null>(null);
  const [reminderTarget, setReminderTarget] = useState<Webinar | null>(null);
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);

  const handleExport = async (w: Webinar) => {
    setExportingId(w._id);
    try {
      const result = await adminWebinarApi.listSubmissions(w._id, { limit: 5000 });
      const submissions = result?.data ?? [];
      const rows = submissions.map(s => ({
        Nom:              s.contact?.nom ?? "",
        Email:            s.contact?.email ?? "",
        Entreprise:       s.contact?.entreprise ?? "",
        Langue:           s.lang ?? "",
        "Complété":       s.completed ? "Oui" : "Non",
        "Maturité IA":    s.scoring?.maturite_ia ?? "",
        "Intensité Pain": s.scoring?.intensite_pain ?? "",
        Tier:             s.scoring?.tier ?? "",
        "ICP Fit":        s.scoring?.icp_fit ?? "",
        "UTM Source":     s.source?.utm_source ?? "",
        "UTM Campaign":   s.source?.utm_campaign ?? "",
        Date:             new Date(s.createdAt).toLocaleString("fr-FR"),
        ...Object.fromEntries(
          w.questions.slice().sort((a, b) => a.order - b.order).map(q => {
            const raw = (s.answers as Record<string, unknown>)?.[q.key];
            const opt = q.options.find(o => o.key === raw);
            return [q.label_fr.slice(0, 40), opt ? opt.label_fr : raw ?? ""];
          })
        ),
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

  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" as "success" | "error" });
  const ok  = (msg: string) => setSnack({ open: true, msg, sev: "success" });
  const err = (msg: string) => setSnack({ open: true, msg, sev: "error" });

  const handleSave = async (values: WebinarFormValues) => {
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

  const handleVerify = (w: Webinar) => {
    verifyMut.mutate(w._id, {
      onSuccess: () => ok(`"${w.title}" is now Active.`),
      onError:   () => err("Failed to verify webinar."),
    });
  };

  const handleArchive = (w: Webinar) => {
    archiveMut.mutate(w._id, {
      onSuccess: () => ok(`"${w.title}" archived.`),
      onError:   () => err("Failed to archive webinar."),
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMut.mutate(deleteTarget, {
      onSuccess: () => { ok("Webinar deleted."); setDeleteTarget(null); },
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

  const handleRefreshStats = (w: Webinar) => {
    statsMut.mutate(w._id, {
      onSuccess: () => ok("Stats refreshed."),
      onError:   () => err("Failed to refresh stats."),
    });
  };

  const webinars = data?.data ?? [];
  const qTarget = qTargetId ? (webinars.find(w => w._id === qTargetId) ?? null) : null;

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
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors border
                ${statusFilter === s
                  ? "bg-teal-600 border-teal-600 text-white"
                  : "border-slate-200 text-slate-600 hover:border-teal-300 bg-white"
                }`}
            >
              {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setEditTarget(null); setFormOpen(true); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-[13px] font-bold transition-colors shadow-sm"
        >
          <AddIcon sx={{ fontSize: 16 }} />
          New Webinar
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20"><CircularProgress sx={{ color: ADMIN_ACCENT }} /></div>
      ) : isError ? (
        <AdminQueryError message="Failed to load webinars." onRetry={refetch} />
      ) : webinars.length === 0 ? (
        <AdminChartCard>
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <WebinarIcon sx={{ fontSize: 48, mb: 2, opacity: 0.4 }} />
            <p className="text-[15px] font-medium">No webinars yet</p>
            <p className="text-[13px] mt-1">Create your first webinar to get started</p>
          </div>
        </AdminChartCard>
      ) : (
        <div className="grid gap-3">
          {webinars.map(w => <WebinarCard
            key={w._id} w={w}
            onEdit={() => { setEditTarget(w); setFormOpen(true); }}
            onSubs={() => setSubsTarget(w)}
            onQuestions={() => setQTargetId(w._id)}
            onVerify={() => handleVerify(w)} verifyPending={verifyMut.isPending}
            onArchive={() => handleArchive(w)} archivePending={archiveMut.isPending}
            onRefresh={() => handleRefreshStats(w)} refreshPending={statsMut.isPending}
            onExport={() => handleExport(w)} exportPending={exportingId === w._id}
            onSendLink={() => setReminderTarget(w)} sendLinkPending={sendingReminderId === w._id}
            onDelete={() => setDeleteTarget(w._id)}
          />)}
        </div>
      )}

      {/* Form dialog */}
      <WebinarFormDialog
        open={formOpen}
        initial={editTarget ? {
          title: editTarget.title,
          description: editTarget.description,
          about_fr: editTarget.about_fr ?? "",
          about_en: editTarget.about_en ?? "",
          webinar_link: editTarget.webinar_link ?? "",
          date: editTarget.date ? editTarget.date.slice(0, 16) : "",
          status: editTarget.status,
          lang: editTarget.lang,
          highlights: [...(editTarget.highlights ?? []), "", "", ""].slice(0, 3),
          questions: editTarget.questions.map(q => ({
            key: q.key, label_fr: q.label_fr, label_en: q.label_en,
            type: q.type, options: q.options, required: q.required,
            order: q.order,
          })),
        } : null}
        onClose={() => { setFormOpen(false); setEditTarget(null); }}
        onSave={handleSave}
      />

      {/* Questions dialog */}
      <QuestionsDialog
        webinar={qTarget}
        open={!!qTargetId}
        onClose={() => setQTargetId(null)}
      />

      {/* Registrants dialog */}
      <WebinarSubmissionsDialog
        webinar={subsTarget}
        open={!!subsTarget}
        onClose={() => setSubsTarget(null)}
      />

      {/* Confirm send link reminder */}
      <ConfirmDialog
        open={!!reminderTarget}
        title="Send webinar link to all participants?"
        description={`This will send the webinar join link to all completed participants of "${reminderTarget?.title}". The reminder email will be sent immediately to everyone.`}
        confirmLabel="Send now"
        loading={!!sendingReminderId}
        onConfirm={handleSendReminder}
        onCancel={() => setReminderTarget(null)}
      />

      {/* Confirm delete */}
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

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snack.sev} sx={{ borderRadius: "10px" }}>{snack.msg}</Alert>
      </Snackbar>
    </div>
  );
};

export default WebinarManagement;
