import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, Chip, CircularProgress } from "@mui/material";
import {
  Close as CloseIcon,
  CheckCircle as DoneIcon,
  HourglassEmpty as PendingIcon,
  Person as PersonIcon,
  BarChart as ScoreIcon,
} from "@mui/icons-material";
import { useWebinarSubmissionsQuery } from "../queries";
import type { WebinarSubmission, Webinar } from "../types";
import { ADMIN_ACCENT } from "@/modules/admin/shared";

// ── Tier badge ────────────────────────────────────────────────────────────────
const TIER_META: Record<string, { bg: string; text: string; border: string }> = {
  A: { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  B: { bg: "#EEF2FF", text: "#4338CA", border: "#C7D2FE" },
  C: { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" },
  D: { bg: "#F8FAFC", text: "#64748B", border: "#E2E8F0" },
};

function TierBadge({ tier }: { tier?: string }) {
  if (!tier) return null;
  const m = TIER_META[tier];
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-black border"
      style={{ background: m.bg, color: m.text, borderColor: m.border }}>
      {tier}
    </span>
  );
}

// ── Score bar ─────────────────────────────────────────────────────────────────
function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-[11px] font-bold tabular-nums shrink-0" style={{ color }}>{value}</span>
    </div>
  );
}

// ── Row detail drawer ─────────────────────────────────────────────────────────
function SubmissionRow({ sub, webinar }: { sub: WebinarSubmission; webinar: Webinar }) {
  const [open, setOpen] = useState(false);
  const nom    = sub.contact?.nom   || "—";
  const email  = sub.contact?.email || "—";
  const co     = sub.contact?.entreprise;
  const date   = new Date(sub.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  const time   = new Date(sub.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const mia    = sub.scoring?.maturite_ia;
  const pain   = sub.scoring?.intensite_pain;
  const mColor = mia == null ? "#94A3B8" : mia < 35 ? "#F59E0B" : mia < 65 ? "#6366F1" : "#10B981";

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="grid grid-cols-[1fr_160px_90px_90px_52px] gap-3 items-center px-5 py-3.5 hover:bg-slate-50/80 cursor-pointer transition-colors border-b border-slate-50 last:border-0 group"
      >
        {/* Name + email */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
              <PersonIcon sx={{ fontSize: 14, color: ADMIN_ACCENT }} />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-slate-800 truncate">{nom}</p>
              <p className="text-[11px] text-slate-400 truncate">{email}</p>
            </div>
          </div>
        </div>

        {/* Date */}
        <div className="text-right">
          <p className="text-[12px] text-slate-600">{date}</p>
          <p className="text-[11px] text-slate-400">{time}</p>
        </div>

        {/* Maturité IA */}
        <div>
          {mia != null
            ? <ScoreBar value={mia} color={mColor} />
            : <span className="text-[11px] text-slate-300">—</span>}
        </div>

        {/* Pain */}
        <div>
          {pain != null
            ? <ScoreBar value={pain} color="#6366F1" />
            : <span className="text-[11px] text-slate-300">—</span>}
        </div>

        {/* Status + tier */}
        <div className="flex items-center gap-1.5 justify-end">
          <TierBadge tier={sub.scoring?.tier} />
          {sub.completed
            ? <DoneIcon sx={{ fontSize: 15, color: "#10B981" }} />
            : <PendingIcon sx={{ fontSize: 15, color: "#94A3B8" }} />}
        </div>
      </div>

      {/* Detail dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: "16px" } }}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 700, fontSize: "0.95rem", pb: 1 }}>
          <span className="flex items-center gap-2">
            <span>{nom}</span>
            {sub.scoring?.tier && <TierBadge tier={sub.scoring.tier} />}
            {sub.completed
              ? <Chip label="Completed" size="small" color="success" sx={{ height: 18, fontSize: 10, fontWeight: 700 }} />
              : <Chip label="In progress" size="small" sx={{ height: 18, fontSize: 10, bgcolor: "#F1F5F9", color: "#64748B" }} />}
          </span>
          <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <CloseIcon sx={{ fontSize: 18 }} />
          </button>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {/* Contact */}
          <div className="px-5 py-4 space-y-1 border-b border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-slate-400 mb-2">Contact</p>
            <p className="text-[13px] text-slate-700"><span className="text-slate-400 w-24 inline-block">Email</span>{email}</p>
            {co && <p className="text-[13px] text-slate-700"><span className="text-slate-400 w-24 inline-block">Entreprise</span>{co}</p>}
            <p className="text-[13px] text-slate-700"><span className="text-slate-400 w-24 inline-block">Langue</span>{sub.lang?.toUpperCase()}</p>
            <p className="text-[13px] text-slate-700"><span className="text-slate-400 w-24 inline-block">Inscrit le</span>{date} à {time}</p>
            {sub.source?.utm_source && (
              <p className="text-[13px] text-slate-700"><span className="text-slate-400 w-24 inline-block">Source</span>{sub.source.utm_source}</p>
            )}
          </div>

          {/* Scores */}
          {sub.scoring && (
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-slate-400 mb-3">Scores</p>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="text-slate-500">Maturité IA</span>
                    <span className="font-bold" style={{ color: mColor }}>{mia}/100</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${mia}%`, background: mColor }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="text-slate-500">Intensité Pain</span>
                    <span className="font-bold text-indigo-500">{pain}/100</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${pain}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Answers */}
          {sub.answers && Object.keys(sub.answers).length > 0 && (
            <div className="px-5 py-4">
              <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-slate-400 mb-3">Réponses</p>
              <div className="space-y-2">
                {webinar.questions
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .filter(q => (sub.answers as any)[q.key] !== undefined)
                  .map(q => {
                    const raw = (sub.answers as any)[q.key];
                    const opt = q.options.find(o => o.key === raw);
                    const display = opt ? opt.label_fr : String(raw);
                    return (
                      <div key={q.key} className="flex items-start justify-between gap-3">
                        <p className="text-[12px] text-slate-500 flex-1 leading-snug">{q.label_fr}</p>
                        <span className="shrink-0 px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 text-[11px] font-semibold max-w-[160px] text-right leading-snug">
                          {q.type === "scale" ? `${raw}/5` : display.slice(0, 60)}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Main dialog ───────────────────────────────────────────────────────────────
interface Props { webinar: Webinar | null; open: boolean; onClose: () => void; }

const WebinarSubmissionsDialog: React.FC<Props> = ({ webinar, open, onClose }) => {
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all");

  const completed = filter === "all" ? undefined : filter === "completed";
  const { data, isLoading } = useWebinarSubmissionsQuery(
    webinar?._id ?? "",
    { limit: 200, completed },
  );

  const submissions = data?.data ?? [];
  const total = data?.total ?? 0;

  if (!webinar) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { borderRadius: "16px", maxHeight: "90vh" } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 700, fontSize: "1rem", borderBottom: "1px solid #F1F5F9", pb: 1.5 }}>
        <div className="flex items-center gap-3">
          <span>Registrants — {webinar.title}</span>
          <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[12px] font-bold border border-teal-100">
            {total}
          </span>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
          <CloseIcon sx={{ fontSize: 18 }} />
        </button>
      </DialogTitle>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 bg-slate-50/50">
        {(["all", "completed", "pending"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-lg text-[12px] font-semibold transition-colors border
              ${filter === f
                ? "bg-teal-600 text-white border-teal-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-teal-300"}`}>
            {f === "all" ? "Tous" : f === "completed" ? "✓ Complétés" : "⌛ En cours"}
          </button>
        ))}
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[1fr_160px_90px_90px_52px] gap-3 items-center px-5 py-2 bg-slate-50 border-b border-slate-100">
        <span className="text-[11px] font-bold uppercase tracking-[1.2px] text-slate-400">Contact</span>
        <span className="text-[11px] font-bold uppercase tracking-[1.2px] text-slate-400 text-right">Date</span>
        <span className="text-[11px] font-bold uppercase tracking-[1.2px] text-slate-400">Maturité IA</span>
        <span className="text-[11px] font-bold uppercase tracking-[1.2px] text-slate-400">Pain</span>
        <span className="text-[11px] font-bold uppercase tracking-[1.2px] text-slate-400 text-right">
          <ScoreIcon sx={{ fontSize: 13 }} />
        </span>
      </div>

      <DialogContent sx={{ p: 0, overflowY: "auto" }}>
        {isLoading ? (
          <div className="flex justify-center py-16">
            <CircularProgress size={28} sx={{ color: ADMIN_ACCENT }} />
          </div>
        ) : submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <PersonIcon sx={{ fontSize: 40, mb: 1, opacity: 0.3 }} />
            <p className="text-[14px]">No registrants yet</p>
          </div>
        ) : (
          submissions.map(sub => (
            <SubmissionRow key={sub._id} sub={sub} webinar={webinar} />
          ))
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WebinarSubmissionsDialog;
