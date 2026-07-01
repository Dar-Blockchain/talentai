import React, { useState } from "react";
import { CircularProgress, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Chip } from "@mui/material";
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
  PeopleAlt as PeopleIcon,
} from "@mui/icons-material";
import WebinarSubmissionsDialog from "./WebinarSubmissionsDialog";
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
  title: "", description: "", date: "", status: "draft",
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

function WebinarFormDialog({
  open, initial, onClose, onSave,
}: {
  open: boolean;
  initial: WebinarFormValues | null;
  onClose: () => void;
  onSave: (v: WebinarFormValues) => void;
}) {
  const [form, setForm] = React.useState<WebinarFormValues>(initial ?? EMPTY_FORM);
  const [tab, setTab] = React.useState<"info" | "questions">("info");

  React.useEffect(() => {
    setForm(initial ?? EMPTY_FORM);
    setTab("info");
  }, [initial, open]);

  const set = <K extends keyof WebinarFormValues>(k: K, v: WebinarFormValues[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const addQuestion = () => {
    const next = [...form.questions, newQuestion(form.questions.length + 1)];
    set("questions", next);
  };

  const updateQuestion = (idx: number, q: WebinarQuestionDraft) => {
    const next = form.questions.map((old, i) => i === idx ? q : old);
    set("questions", next);
  };

  const deleteQuestion = (idx: number) => {
    const next = form.questions.filter((_, i) => i !== idx).map((q, i) => ({ ...q, order: i + 1 }));
    set("questions", next);
  };

  const moveQuestion = (idx: number, dir: -1 | 1) => {
    const arr = [...form.questions];
    const swap = idx + dir;
    if (swap < 0 || swap >= arr.length) return;
    [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
    set("questions", arr.map((q, i) => ({ ...q, order: i + 1 })));
  };

  const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[14px] text-slate-700 outline-none focus:border-teal-400 transition-colors bg-white";
  const labelCls = "block text-[12px] font-semibold text-slate-600 mb-1";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { borderRadius: "16px", display: "flex", flexDirection: "column", maxHeight: "90vh" } }}>
      <DialogTitle sx={{ fontWeight: 700, fontSize: "1.05rem", pb: 0, borderBottom: "1px solid #F1F5F9" }}>
        <div className="flex items-center justify-between">
          <span>{initial?.title ? `Edit — ${initial.title}` : "New Webinar"}</span>
          <div className="flex gap-1 p-0.5 bg-slate-100 rounded-lg">
            {(["info", "questions"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1 rounded-md text-[12px] font-semibold transition-colors ${tab === t ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                {t === "info" ? "Info" : `Questions ${form.questions.length > 0 ? `(${form.questions.length})` : ""}`}
              </button>
            ))}
          </div>
        </div>
      </DialogTitle>

      <DialogContent sx={{ pt: 2, overflowY: "auto", flex: 1 }}>
        {/* ── INFO TAB ── */}
        {tab === "info" && (
          <div className="space-y-4 pt-1">
            <div>
              <label className={labelCls}>Title *</label>
              <input className={inputCls} value={form.title} onChange={e => set("title", e.target.value)} placeholder="Webinar title" />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea className={inputCls} rows={3} value={form.description} onChange={e => set("description", e.target.value)} placeholder="What's this webinar about?" style={{ resize: "none" }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Date</label>
                <input type="datetime-local" className={inputCls} value={form.date} onChange={e => set("date", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Language</label>
                <select className={inputCls} value={form.lang} onChange={e => set("lang", e.target.value as WebinarFormValues["lang"])}>
                  <option value="fr">French</option>
                  <option value="en">English</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select className={inputCls} value={form.status} onChange={e => set("status", e.target.value as WebinarFormValues["status"])}>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Landing page highlights <span className="text-slate-400 font-normal">(up to 3 bullets shown on home page)</span></label>
              <div className="space-y-2">
                {[0, 1, 2].map(i => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-[10px] font-black flex items-center justify-center shrink-0">{i + 1}</span>
                    <input
                      className={inputCls}
                      value={form.highlights[i] ?? ""}
                      onChange={e => {
                        const next = [...form.highlights];
                        next[i] = e.target.value;
                        set("highlights", next);
                      }}
                      placeholder={`Benefit ${i + 1} (e.g. "Learn how AI cuts time-to-hire by 70%")`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── QUESTIONS TAB ── */}
        {tab === "questions" && (
          <div className="pt-1 space-y-3">
            {form.questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2 opacity-40"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <p className="text-[14px] font-medium">No questions yet</p>
                <p className="text-[12px] mt-0.5">Add questions manually or use AI generation</p>
              </div>
            ) : (
              form.questions.map((q, idx) => (
                <QuestionEditor key={q.key} q={q} idx={idx}
                  onChange={nq => updateQuestion(idx, nq)}
                  onDelete={() => deleteQuestion(idx)}
                  onMoveUp={() => moveQuestion(idx, -1)}
                  onMoveDown={() => moveQuestion(idx, 1)}
                  isFirst={idx === 0} isLast={idx === form.questions.length - 1}
                />
              ))
            )}
            <button
              onClick={addQuestion}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-teal-200 text-teal-600 text-[13px] font-semibold hover:bg-teal-50 transition-colors"
            >
              <AddIcon sx={{ fontSize: 16 }} /> Add question
            </button>
          </div>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, gap: 1, borderTop: "1px solid #F1F5F9" }}>
        <button onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
          Cancel
        </button>
        {tab === "info" && (
          <button onClick={() => setTab("questions")}
            className="px-4 py-2 rounded-xl border border-teal-200 text-teal-700 text-[13px] font-semibold hover:bg-teal-50 transition-colors">
            Questions →
          </button>
        )}
        <button
          onClick={() => onSave(form)}
          disabled={!form.title.trim() || form.questions.length === 0}
          title={form.questions.length === 0 ? "Add at least one question before saving" : undefined}
          className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white disabled:text-slate-400 text-[13px] font-bold transition-colors"
        >
          Save
        </button>
      </DialogActions>
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
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

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
        <div className="grid gap-4">
          {webinars.map(w => {
            const meta = STATUS_META[w.status] ?? STATUS_META.draft;
            const publicUrl = `/webinar?id=${w._id}`;
            return (
              <div key={w._id} className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.05)] p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  {/* Left info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-[15px] font-bold text-slate-900 truncate">{w.title}</h3>
                      <Chip label={meta.label} color={meta.color} size="small" sx={{ height: 20, fontSize: 11, fontWeight: 700 }} />
                      <Chip label={w.lang.toUpperCase()} size="small" sx={{ height: 20, fontSize: 11, bgcolor: "#F1F5F9", color: "#64748B" }} />
                    </div>
                    {w.description && <p className="text-[13px] text-slate-400 truncate max-w-[480px]">{w.description}</p>}
                    <div className="flex items-center gap-4 mt-2 text-[12px] text-slate-400">
                      {w.date && <span>📅 {new Date(w.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>}
                      <span>{w.questions.length} questions</span>
                      <span>{w.stats.total_registrations} registered</span>
                      <span>{w.stats.total_completions} completed</span>
                      {w.stats.avg_maturite_ia != null && (
                        <span>avg maturity <strong className="text-teal-600">{w.stats.avg_maturite_ia}</strong>/100</span>
                      )}
                    </div>

                    {/* Tier breakdown */}
                    {Object.keys(w.stats.tier_breakdown ?? {}).length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2">
                        {(["A","B","C","D"] as const).map(tier => {
                          const count = (w.stats.tier_breakdown as Record<string,number>)[tier] ?? 0;
                          if (!count) return null;
                          const colors: Record<string,string> = { A:"#059669", B:"#4338CA", C:"#B45309", D:"#94A3B8" };
                          return (
                            <span key={tier} className="px-2 py-0.5 rounded-md text-[11px] font-bold border"
                              style={{ borderColor: `${colors[tier]}30`, background: `${colors[tier]}12`, color: colors[tier] }}>
                              {tier}·{count}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                    {/* View public page */}
                    <a
                      href={publicUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-500 text-[12px] font-semibold hover:bg-slate-50 transition-colors"
                    >
                      <OpenIcon sx={{ fontSize: 13 }} /> Preview
                    </a>

                    {/* Registrants */}
                    <button
                      onClick={() => setSubsTarget(w)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-indigo-200 text-indigo-600 text-[12px] font-semibold hover:bg-indigo-50 transition-colors"
                    >
                      <PeopleIcon sx={{ fontSize: 13 }} />
                      {w.stats.total_registrations}
                    </button>

                    {/* Questions */}
                    <button
                      onClick={() => setQTargetId(w._id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-500 text-[12px] font-semibold hover:bg-slate-50 transition-colors"
                    >
                      <QIcon sx={{ fontSize: 13 }} /> Questions
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => {
                        setEditTarget(w);
                        setFormOpen(true);
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-500 text-[12px] font-semibold hover:bg-slate-50 transition-colors"
                    >
                      Edit
                    </button>

                    {/* Refresh stats */}
                    <button
                      onClick={() => handleRefreshStats(w)}
                      disabled={statsMut.isPending}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-500 text-[12px] font-semibold hover:bg-slate-50 transition-colors disabled:opacity-40"
                      title="Refresh stats"
                    >
                      <RefreshIcon sx={{ fontSize: 13 }} />
                    </button>

                    {/* Verify (draft only) */}
                    {w.status === "draft" && (
                      <button
                        onClick={() => handleVerify(w)}
                        disabled={verifyMut.isPending}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 text-[12px] font-bold hover:bg-teal-100 transition-colors disabled:opacity-40"
                      >
                        <VerifyIcon sx={{ fontSize: 13 }} /> Verify & Publish
                      </button>
                    )}

                    {/* Archive (active only) */}
                    {w.status === "active" && (
                      <button
                        onClick={() => handleArchive(w)}
                        disabled={archiveMut.isPending}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-amber-200 text-amber-600 text-[12px] font-semibold hover:bg-amber-50 transition-colors disabled:opacity-40"
                      >
                        <ArchiveIcon sx={{ fontSize: 13 }} /> Archive
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => setDeleteTarget(w._id)}
                      className="px-2.5 py-1.5 rounded-lg border border-red-200 text-red-500 text-[12px] font-semibold hover:bg-red-50 transition-colors"
                    >
                      <DeleteIcon sx={{ fontSize: 13 }} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form dialog */}
      <WebinarFormDialog
        open={formOpen}
        initial={editTarget ? {
          title: editTarget.title,
          description: editTarget.description,
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
