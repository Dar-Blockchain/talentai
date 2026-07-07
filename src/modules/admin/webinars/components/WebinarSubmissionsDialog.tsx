import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, Chip, CircularProgress } from "@mui/material";
import { Button } from "@/modules/shared/ui/shadcn/button";
import {
  X as CloseIcon,
  CheckCircle2 as DoneIcon,
  Hourglass as PendingIcon,
  User as PersonIcon,
  BarChart3 as ScoreIcon,
  Lightbulb as InsightIcon,
  TrendingUp as ReadinessIcon,
  AlertTriangle as BlockerIcon,
  Star as StrengthIcon,
} from "lucide-react";
import { useWebinarSubmissionsQuery } from "../queries";
import type { WebinarSubmission, Webinar } from "../types";
import { ADMIN_ACCENT } from "@/modules/admin/shared";

// ── Tier badge ────────────────────────────────────────────────────────────────
const TIER_META: Record<string, { bg: string; text: string; border: string; label: string }> = {
  A: { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0", label: "Tier A — Priorité haute" },
  B: { bg: "#EEF2FF", text: "#4338CA", border: "#C7D2FE", label: "Tier B — Bon prospect" },
  C: { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A", label: "Tier C — À nurturer" },
  D: { bg: "#F8FAFC", text: "#64748B", border: "#E2E8F0", label: "Tier D — Hors cible" },
};

const ICP_META: Record<string, { label: string; color: string }> = {
  ok:     { label: "ICP ✓",    color: "#15803D" },
  faible: { label: "ICP ~",    color: "#B45309" },
  hors:   { label: "Hors ICP", color: "#DC2626" },
};

const THESE_META: Record<string, string> = {
  v1:          "Vitesse & efficacité",
  v2:          "Qualité & précision",
  v3:          "Confiance & preuve",
  indetermine: "Indéterminé",
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

function ScoreBar({ value, color, label }: { value: number; color: string; label: string }) {
  return (
    <div>
      <div className="flex justify-between text-[11.5px] mb-1">
        <span className="text-slate-500">{label}</span>
        <span className="font-bold tabular-nums" style={{ color }}>{value}<span className="text-[9px] text-slate-300 font-normal">/100</span></span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, background: color }} />
      </div>
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
  const ready  = sub.scoring?.readiness_score;
  const mColor = mia == null ? "#94A3B8" : mia < 35 ? "#F59E0B" : mia < 65 ? "#6366F1" : "#10B981";

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="grid grid-cols-[1fr_140px_80px_80px_60px] gap-3 items-center px-5 py-3.5 hover:bg-slate-50/80 cursor-pointer transition-colors border-b border-slate-50 last:border-0 group"
      >
        {/* Name + email */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
              <PersonIcon size={14} color={ADMIN_ACCENT} />
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
            ? <div className="flex items-center gap-1.5">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${mia}%`, background: mColor }} />
                </div>
                <span className="text-[11px] font-bold tabular-nums shrink-0" style={{ color: mColor }}>{mia}</span>
              </div>
            : <span className="text-[11px] text-slate-300">—</span>}
        </div>

        {/* Pain */}
        <div>
          {pain != null
            ? <div className="flex items-center gap-1.5">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-indigo-400" style={{ width: `${pain}%` }} />
                </div>
                <span className="text-[11px] font-bold tabular-nums shrink-0 text-indigo-500">{pain}</span>
              </div>
            : <span className="text-[11px] text-slate-300">—</span>}
        </div>

        {/* Tier + status */}
        <div className="flex items-center gap-1.5 justify-end">
          <TierBadge tier={sub.scoring?.tier} />
          {sub.completed
            ? <DoneIcon size={15} color="#10B981" />
            : <PendingIcon size={15} color="#94A3B8" />}
        </div>
      </div>

      {/* Detail dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: "16px", maxHeight: "90vh" } }}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 700, fontSize: "0.95rem", pb: 1, borderBottom: "1px solid #F1F5F9" }}>
          <span className="flex items-center gap-2 flex-wrap">
            <span>{nom}</span>
            {sub.scoring?.tier && <TierBadge tier={sub.scoring.tier} />}
            {sub.scoring?.icp_fit && (() => {
              const m = ICP_META[sub.scoring.icp_fit];
              return m ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border" style={{ color: m.color, borderColor: m.color + "40", background: m.color + "10" }}>{m.label}</span> : null;
            })()}
            {sub.completed
              ? <Chip label="Completed" size="small" color="success" sx={{ height: 18, fontSize: 10, fontWeight: 700 }} />
              : <Chip label="In progress" size="small" sx={{ height: 18, fontSize: 10, bgcolor: "#F1F5F9", color: "#64748B" }} />}
          </span>
          <Button variant="ghost" onClick={() => setOpen(false)} className="p-1 h-auto rounded-lg hover:bg-slate-100 text-slate-400">
            <CloseIcon size={18} />
          </Button>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          {/* Contact */}
          <div className="px-5 py-4 space-y-1 border-b border-slate-100">
            <p className="text-[10.5px] font-bold uppercase tracking-[2px] text-slate-400 mb-2">Contact</p>
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
              <p className="text-[10.5px] font-bold uppercase tracking-[2px] text-slate-400 mb-3">Scores IA</p>

              {/* Tags row */}
              <div className="flex flex-wrap gap-2 mb-4">
                {sub.scoring.tier && (() => { const m = TIER_META[sub.scoring.tier!]; return (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border" style={{ background: m.bg, color: m.text, borderColor: m.border }}>
                    {m.label}
                  </span>
                ); })()}
                {sub.scoring.these && sub.scoring.these !== "indetermine" && (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {THESE_META[sub.scoring.these]}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {mia   != null && <ScoreBar value={mia}   color={mColor}    label="Connaissance / Maturité" />}
                {pain  != null && <ScoreBar value={pain}  color="#6366F1"   label="Intensité Pain / Engagement" />}
                {ready != null && <ScoreBar value={ready} color="#0D9488"   label="Readiness — Disposition à agir" />}
              </div>
            </div>
          )}

          {/* AI insights */}
          {(sub.scoring?.key_insight || sub.scoring?.main_pain || sub.scoring?.recommended_action) && (
            <div className="px-5 py-4 border-b border-slate-100 space-y-3">
              <p className="text-[10.5px] font-bold uppercase tracking-[2px] text-slate-400">Analyse IA</p>

              {sub.scoring?.key_insight && (
                <div className="flex gap-2.5">
                  <InsightIcon size={16} color={ADMIN_ACCENT} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Insight clé</p>
                    <p className="text-[13px] text-slate-700 leading-relaxed">{sub.scoring.key_insight}</p>
                  </div>
                </div>
              )}

              {sub.scoring?.main_pain && (
                <div className="flex gap-2.5">
                  <BlockerIcon size={16} color="#EF4444" className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Douleur principale</p>
                    <p className="text-[13px] text-slate-700 leading-relaxed">{sub.scoring.main_pain}</p>
                  </div>
                </div>
              )}

              {sub.scoring?.recommended_action && (
                <div className="flex gap-2.5">
                  <ReadinessIcon size={16} color="#0D9488" className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Action recommandée</p>
                    <p className="text-[13px] text-slate-700 leading-relaxed font-medium">{sub.scoring.recommended_action}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Strengths & Blockers */}
          {((sub.scoring?.strengths?.length ?? 0) > 0 || (sub.scoring?.blockers?.length ?? 0) > 0) && (
            <div className="px-5 py-4 border-b border-slate-100">
              <div className="grid grid-cols-2 gap-4">
                {(sub.scoring?.strengths?.length ?? 0) > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <StrengthIcon size={13} color="#10B981" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Points forts</p>
                    </div>
                    <ul className="space-y-1.5">
                      {sub.scoring!.strengths!.map((s, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[12px] text-slate-600">
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {(sub.scoring?.blockers?.length ?? 0) > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <BlockerIcon size={13} color="#F59E0B" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Freins</p>
                    </div>
                    <ul className="space-y-1.5">
                      {sub.scoring!.blockers!.map((b, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[12px] text-slate-600">
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Answers */}
          {sub.answers && Object.keys(sub.answers).length > 0 && (
            <div className="px-5 py-4">
              <p className="text-[10.5px] font-bold uppercase tracking-[2px] text-slate-400 mb-3">Réponses</p>
              <div className="space-y-2.5">
                {webinar.questions
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .filter(q => (sub.answers as Record<string, unknown>)[q.key] !== undefined)
                  .map((q, i) => {
                    const raw = (sub.answers as Record<string, unknown>)[q.key];
                    const opt = q.options.find(o => o.key === raw);
                    const display = q.type === "scale"
                      ? `${raw}/5`
                      : opt
                        ? opt.label_fr
                        : String(raw ?? "").slice(0, 120);
                    return (
                      <div key={q.key} className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <span className="mt-0.5 w-4 h-4 rounded text-[9px] font-black flex items-center justify-center shrink-0 bg-teal-50 text-teal-600">{i + 1}</span>
                          <p className="text-[12px] text-slate-500 leading-snug">{q.label_fr}</p>
                        </div>
                        <span className="shrink-0 px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 text-[11px] font-semibold max-w-[160px] text-right leading-snug">
                          {display}
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
        <Button variant="ghost" onClick={onClose} className="p-1 h-auto rounded-lg hover:bg-slate-100 text-slate-400">
          <CloseIcon size={18} />
        </Button>
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
      <div className="grid grid-cols-[1fr_140px_80px_80px_60px] gap-3 items-center px-5 py-2 bg-slate-50 border-b border-slate-100">
        <span className="text-[11px] font-bold uppercase tracking-[1.2px] text-slate-400">Contact</span>
        <span className="text-[11px] font-bold uppercase tracking-[1.2px] text-slate-400 text-right">Date</span>
        <span className="text-[11px] font-bold uppercase tracking-[1.2px] text-slate-400">Maîtrise</span>
        <span className="text-[11px] font-bold uppercase tracking-[1.2px] text-slate-400">Pain</span>
        <span className="text-[11px] font-bold uppercase tracking-[1.2px] text-slate-400 text-right">
          <ScoreIcon size={13} />
        </span>
      </div>

      <DialogContent sx={{ p: 0, overflowY: "auto" }}>
        {isLoading ? (
          <div className="flex justify-center py-16">
            <CircularProgress size={28} sx={{ color: ADMIN_ACCENT }} />
          </div>
        ) : submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <PersonIcon size={40} className="mb-2 opacity-30" />
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
