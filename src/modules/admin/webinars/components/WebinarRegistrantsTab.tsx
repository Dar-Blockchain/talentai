import React, { useMemo, useState } from "react";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { Dialog, DialogContent, DialogTitle } from "@/modules/shared/ui/shadcn/dialog";
import { Spinner } from "@/modules/shared/ui/shadcn/spinner";
import { Button } from "@/modules/shared/ui/shadcn/button";
import {
  X as CloseIcon,
  CheckCircle2 as DoneIcon,
  Hourglass as PendingIcon,
  User as PersonIcon,
  Lightbulb as InsightIcon,
  TrendingUp as ReadinessIcon,
  AlertTriangle as BlockerIcon,
  Star as StrengthIcon,
  ShieldAlert as VigilanceIcon,
  Users as PeopleIcon,
  CheckCircle2 as CompletionIcon,
  Video as LiveIcon,
  Search as SearchIcon,
} from "lucide-react";
import { useWebinarSubmissionsQuery, useUpdateLiveAttendeesMutation } from "../queries";
import type {
  WebinarSubmission, Webinar, WebinarQualification,
  WebinarProfileType, WebinarMaturityLevel, WebinarScoreCategory, WebinarHrTeamSize,
  WebinarSector, WebinarSourceChannel,
} from "../types";
import { ADMIN_ACCENT } from "@/modules/admin/shared";
import { formatAnswerDisplay } from "../utils/formatAnswer";

// ── Meta maps — admin dashboard is English-only, independent of the
//    webinar's own authored language ──────────────────────────────────────
const QUALIFICATION_META: Record<WebinarQualification, { label: string; color: string; bg: string; border: string }> = {
  hot:  { label: "Hot",  color: "#B91C1C", bg: "#FEF2F2", border: "#FECACA" },
  warm: { label: "Warm", color: "#B45309", bg: "#FFFBEB", border: "#FDE68A" },
  cold: { label: "Cold", color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" },
};

const SEGMENT_META: Record<WebinarProfileType, { label: string; color: string }> = {
  staffing_bpo:    { label: "Staffing / BPO",     color: "#6366F1" },
  enterprise_chro: { label: "Enterprise / CHRO",  color: "#0EA5E9" },
  referrer:        { label: "Referrer",           color: "#94A3B8" },
};

const HR_TEAM_SIZE_LABEL: Record<WebinarHrTeamSize, string> = {
  lt10: "Under 10", "10_50": "10 – 50", "50_200": "50 – 200", gt200: "200+",
};

const SECTOR_LABEL: Record<WebinarSector, string> = {
  technology: "Technology", finance: "Finance", healthcare: "Healthcare",
  retail: "Retail", manufacturing: "Manufacturing", education: "Education",
  telecom: "Telecom", public_sector: "Public Sector", other: "Other",
};
const SECTORS: WebinarSector[] = [
  "technology", "finance", "healthcare", "retail", "manufacturing", "education", "telecom", "public_sector", "other",
];
const SECTOR_COLOR: Record<WebinarSector, string> = {
  technology: "#6366F1", finance: "#0EA5E9", healthcare: "#10B981",
  retail: "#F59E0B", manufacturing: "#EF4444", education: "#8B5CF6",
  telecom: "#EC4899", public_sector: "#64748B", other: "#94A3B8",
};

const SOURCE_CHANNEL_LABEL: Record<WebinarSourceChannel, string> = {
  linkedin: "LinkedIn", instagram: "Instagram", facebook: "Facebook",
  twitter_x: "X / Twitter", google_search: "Google Search",
  referral: "Referral", newsletter: "Newsletter", other: "Other",
};
const SOURCE_CHANNELS: WebinarSourceChannel[] = [
  "linkedin", "instagram", "facebook", "twitter_x", "google_search", "referral", "newsletter", "other",
];
const SOURCE_CHANNEL_COLOR: Record<WebinarSourceChannel, string> = {
  linkedin: "#0A66C2", instagram: "#E4405F", facebook: "#1877F2",
  twitter_x: "#111827", google_search: "#4285F4",
  referral: "#F59E0B", newsletter: "#8B5CF6", other: "#94A3B8",
};

const MATURITY_META: Record<WebinarMaturityLevel, { label: string; color: string }> = {
  beginner:     { label: "Beginner",     color: "#F59E0B" },
  explorer:     { label: "Explorer",     color: "#0EA5E9" },
  practitioner: { label: "Practitioner", color: "#6366F1" },
  pioneer:      { label: "Pioneer",      color: "#10B981" },
};
const MATURITY_ORDER: WebinarMaturityLevel[] = ["beginner", "explorer", "practitioner", "pioneer"];

const CATEGORY_META: Record<WebinarScoreCategory, { label: string; color: string }> = {
  adoption:   { label: "Adoption & tools",              color: "#10B981" },
  governance: { label: "Governance & compliance",        color: "#6366F1" },
  quality:    { label: "Quality & measurement",          color: "#0EA5E9" },
  antifraud:  { label: "Anti-fraud vigilance",           color: "#F59E0B" },
};
const CATEGORY_ORDER: WebinarScoreCategory[] = ["adoption", "governance", "quality", "antifraud"];

const SCRIPT_LABEL: Record<string, string> = { v1: "Script v1 — Speed & efficiency", v2: "Script v2 — Detection, no sales pitch" };

// `sector` used to be a single string before it became multi-select — old
// submissions read via .lean() aren't auto-cast by Mongoose, so this can
// still arrive as a bare string (or null/undefined) instead of an array.
function toSectorArray(v: unknown): WebinarSector[] {
  if (Array.isArray(v)) return v as WebinarSector[];
  if (typeof v === "string" && v) return [v as WebinarSector];
  return [];
}

function QualificationBadge({ status }: { status?: WebinarQualification }) {
  if (!status) return <span className="text-xs text-slate-300">—</span>;
  const m = QUALIFICATION_META[status];
  return (
    <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs font-bold border whitespace-nowrap"
      style={{ background: m.bg, color: m.color, borderColor: m.border }}>
      {m.label}
    </span>
  );
}

function ScoreBar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-0.5">
        <span className="text-slate-500">{label}</span>
        <span className="font-bold tabular-nums" style={{ color }}>{value}<span className="text-xs text-slate-300 font-normal">/{max}</span></span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${max > 0 ? (value / max) * 100 : 0}%`, background: color }} />
      </div>
    </div>
  );
}

function BreakdownList({ items }: { items: { key: string; label: string; count: number; color: string }[] }) {
  const total = items.reduce((s, i) => s + i.count, 0);
  if (total === 0) return <p className="text-xs text-slate-400 text-center py-3">No data yet</p>;
  return (
    <div className="space-y-1.5">
      {items.map((it) => (
        <div key={it.key}>
          <div className="flex justify-between text-xs mb-0.5">
            <span className="text-slate-600 font-medium">{it.label}</span>
            <span className="font-bold tabular-nums" style={{ color: it.color }}>
              {it.count} <span className="text-slate-400 font-medium">({total > 0 ? Math.round((it.count / total) * 100) : 0}%)</span>
            </span>
          </div>
          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${total > 0 ? (it.count / total) * 100 : 0}%`, background: it.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function DiscoveryChannelChart({ items }: { items: { key: string; label: string; count: number; color: string }[] }) {
  const total = items.reduce((s, i) => s + i.count, 0);
  if (total === 0) return <p className="text-xs text-slate-400 text-center py-3">No data yet</p>;
  return (
    <ResponsiveContainer width="100%" height={150}>
      <BarChart data={items} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: "#94A3B8" }}
          axisLine={false} tickLine={false}
          interval={0} angle={-30} textAnchor="end" height={44}
        />
        <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} allowDecimals={false} width={24} />
        <RechartsTooltip
          cursor={{ fill: "#F8FAFC" }}
          content={({ active, payload }) =>
            active && payload?.length ? (
              <div className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs shadow-lg">
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full shrink-0" style={{ background: payload[0].payload.color }} />
                  <span className="text-slate-500">{payload[0].payload.label}</span>
                  <span className="font-bold text-slate-800">{payload[0].value}</span>
                </div>
              </div>
            ) : null
          }
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={26}>
          {items.map((it) => <Cell key={it.key} fill={it.color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// Compact local card atoms — kept scoped to this file (not the shared
// AdminStatCard/AdminChartCard) so this tab can run tighter chrome without
// affecting the padding/sizing of every other admin page that reuses those.
function CompactStat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 py-2.5 px-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${ADMIN_ACCENT}14` }}>
          <Icon size={15} color={ADMIN_ACCENT} />
        </div>
        <div className="min-w-0">
          <div className="text-base font-bold text-slate-900 leading-none tabular-nums">{value}</div>
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wide mt-1 truncate">{label}</div>
        </div>
      </div>
    </div>
  );
}

function CompactCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white shadow-sm p-3">
      <p className="text-xs font-semibold text-slate-900 mb-2">{title}</p>
      {children}
    </div>
  );
}

// ── Overview strip ──────────────────────────────────────────────────────────
function OverviewStrip({ webinar }: { webinar: Webinar }) {
  const stats = webinar.stats;
  const [liveInput, setLiveInput] = useState(String(stats.live_attendees ?? 0));
  const updateLive = useUpdateLiveAttendeesMutation();

  const completionRate = stats.total_registrations > 0
    ? Math.round((stats.total_completions / stats.total_registrations) * 100)
    : 0;

  const targetMax = webinar.target_max || 0;
  const targetPct = targetMax > 0 ? Math.min(100, Math.round((stats.total_registrations / targetMax) * 100)) : 0;
  const inTarget = stats.total_registrations >= webinar.target_min;

  const maturityItems = MATURITY_ORDER.map((lvl) => ({
    key: lvl, label: MATURITY_META[lvl].label, color: MATURITY_META[lvl].color,
    count: stats.maturity_breakdown?.[lvl] ?? 0,
  }));
  const qualificationItems = (["hot", "warm", "cold"] as WebinarQualification[]).map((q) => ({
    key: q, label: QUALIFICATION_META[q].label, color: QUALIFICATION_META[q].color,
    count: stats.qualification_breakdown?.[q] ?? 0,
  }));
  const segmentItems = (["staffing_bpo", "enterprise_chro", "referrer"] as WebinarProfileType[]).map((s) => ({
    key: s, label: SEGMENT_META[s].label, color: SEGMENT_META[s].color,
    count: stats.segment_breakdown?.[s] ?? 0,
  }));
  const channelItems = SOURCE_CHANNELS
    .map((c) => ({ key: c, label: SOURCE_CHANNEL_LABEL[c], color: SOURCE_CHANNEL_COLOR[c], count: stats.channel_breakdown?.[c] ?? 0 }))
    .filter((it) => it.count > 0)
    .sort((a, b) => b.count - a.count);
  // Multi-select — one registrant can add to more than one sector, so these
  // counts don't have to sum to total_registrations.
  const sectorItems = SECTORS
    .map((s) => ({ key: s, label: SECTOR_LABEL[s], color: SECTOR_COLOR[s], count: stats.sector_breakdown?.[s] ?? 0 }))
    .filter((it) => it.count > 0)
    .sort((a, b) => b.count - a.count);

  const saveLive = () => {
    const n = Math.max(0, Math.round(Number(liveInput)) || 0);
    updateLive.mutate({ id: webinar._id, count: n });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <CompactStat icon={PeopleIcon} label="Registrants" value={stats.total_registrations} />
        <CompactStat icon={CompletionIcon} label="Completion rate" value={`${completionRate}%`} />

        {/* Live attendees — no video-platform integration, entered manually */}
        <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 py-2.5 px-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${ADMIN_ACCENT}14` }}>
              <LiveIcon size={15} color={ADMIN_ACCENT} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-0.5">Live attendees</p>
              <div className="flex items-center gap-1.5">
                <input
                  type="number" min={0} value={liveInput}
                  onChange={(e) => setLiveInput(e.target.value)}
                  onBlur={saveLive}
                  onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
                  className="w-14 text-xs font-bold text-slate-800 border border-slate-200 rounded-md px-1.5 py-0.5 outline-none focus:border-teal-400"
                />
                {updateLive.isPending && <Spinner className="size-3" />}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <CompactCard title="Maturity level distribution">
          <BreakdownList items={maturityItems} />
        </CompactCard>
        <CompactCard title="Lead qualification">
          <BreakdownList items={qualificationItems} />
        </CompactCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <CompactCard title="Segment breakdown">
          <BreakdownList items={segmentItems} />
        </CompactCard>
        <CompactCard title="Discovery channel">
          <DiscoveryChannelChart items={channelItems} />
        </CompactCard>
      </div>

      <CompactCard title="Registered per sector">
        <BreakdownList items={sectorItems} />
      </CompactCard>

      <CompactCard title="Registrant target">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-600">
            <strong className="text-slate-900">{stats.total_registrations}</strong> registrants — target {webinar.target_min}–{webinar.target_max}
          </span>
          <span className="text-xs font-bold" style={{ color: inTarget ? "#10B981" : "#F59E0B" }}>
            {inTarget ? "On track" : "Below target"}
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden relative">
          <div className="h-full rounded-full transition-all" style={{ width: `${targetPct}%`, background: inTarget ? "#10B981" : "#F59E0B" }} />
        </div>
      </CompactCard>
    </div>
  );
}

// ── Row + detail popup ─────────────────────────────────────────────────────────
const LOCALE = "en-GB";

function SubmissionRow({ sub, webinar }: { sub: WebinarSubmission; webinar: Webinar }) {
  const [open, setOpen] = useState(false);
  const nom     = sub.contact?.nom   || "—";
  const email   = sub.contact?.email || "—";
  const co      = sub.contact?.entreprise;
  const segment = sub.contact?.profile_type;
  const phone   = sub.contact?.phone;
  const position = sub.contact?.position;
  const sector  = toSectorArray(sub.contact?.sector);
  const hrTeamSize = sub.contact?.hr_team_size;
  const utmSource   = sub.source?.utm_source;
  const utmCampaign = sub.source?.utm_campaign;
  const channel     = sub.source?.channel;
  const d       = new Date(sub.createdAt);
  const date    = d.toLocaleDateString(LOCALE, { day: "numeric", month: "short", year: "numeric" });
  const time    = d.toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" });

  const scoring   = sub.scoring;
  const total100  = scoring?.total100;
  const maturity  = scoring?.maturityLevel;
  const maturityColor = maturity ? MATURITY_META[maturity].color : "#94A3B8";
  const qualification = scoring?.qualification?.status;
  const hasInsights = scoring?.key_insight || scoring?.main_pain || scoring?.recommended_action;

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="grid grid-cols-[1fr_120px_92px_78px_96px_28px] gap-2 items-center px-3 py-2 hover:bg-slate-50/80 cursor-pointer transition-colors border-b border-slate-50 last:border-0"
      >
        <div className="min-w-0 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
            <PersonIcon size={12} color={ADMIN_ACCENT} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">{nom}</p>
            <p className="text-xs text-slate-400 truncate">{email}</p>
          </div>
        </div>

        <div>
          {segment
            ? <span className="text-xs font-semibold" style={{ color: SEGMENT_META[segment].color }}>{SEGMENT_META[segment].label}</span>
            : <span className="text-xs text-slate-300">—</span>}
        </div>

        <div>
          {total100 != null
            ? (
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold tabular-nums" style={{ color: maturityColor }}>{total100}</span>
                {maturity && (
                  <span className="text-xs font-bold px-1 py-0.5 rounded whitespace-nowrap" style={{ background: `${maturityColor}18`, color: maturityColor }}>
                    {MATURITY_META[maturity].label}
                  </span>
                )}
              </div>
            )
            : <span className="text-xs text-slate-300">—</span>}
        </div>

        <div><QualificationBadge status={qualification} /></div>

        <div className="text-right">
          <p className="text-xs text-slate-600">{date}</p>
          <p className="text-xs text-slate-400">{time}</p>
        </div>

        <div className="flex justify-end">
          {sub.completed
            ? <DoneIcon size={14} color="#10B981" />
            : <PendingIcon size={14} color="#94A3B8" />}
        </div>
      </div>

      {/* Detail popup — contact + lead qualification + AI insights + answers */}
      <Dialog open={open} onOpenChange={(next) => { if (!next) setOpen(false); }}>
      <DialogContent showCloseButton={false} className="sm:max-w-2xl p-0 gap-0 flex flex-col max-h-[90vh] overflow-hidden" style={{ borderRadius: "14px" }}>
        <div className="flex items-center justify-between px-3 pb-2 pt-2.5 border-b border-slate-100 font-bold text-sm">
          <DialogTitle asChild>
          <span className="flex items-center gap-1.5 flex-wrap">
            <span>{nom}</span>
            <QualificationBadge status={qualification} />
            {sub.completed
              ? <span className="h-[17px] rounded-full border-transparent bg-emerald-50 px-1.5 text-xs font-bold text-emerald-700 inline-flex items-center">Completed</span>
              : <span className="h-[17px] rounded-full border-transparent bg-slate-100 px-1.5 text-xs font-bold text-slate-500 inline-flex items-center">In progress</span>}
          </span>
          </DialogTitle>
          <Button variant="ghost" onClick={() => setOpen(false)} className="p-1 h-auto rounded-lg hover:bg-slate-100 text-slate-400">
            <CloseIcon size={16} />
          </Button>
        </div>

        <div className="overflow-y-auto">
          {/* Contact */}
          <div className="px-3 py-2.5 space-y-0.5 border-b border-slate-100">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Contact</p>
            <p className="text-xs text-slate-700"><span className="text-slate-400 w-20 inline-block">Email</span>{email}</p>
            {phone && <p className="text-xs text-slate-700"><span className="text-slate-400 w-20 inline-block">Phone</span>{phone}</p>}
            {co && <p className="text-xs text-slate-700"><span className="text-slate-400 w-20 inline-block">Company</span>{co}</p>}
            {position && <p className="text-xs text-slate-700"><span className="text-slate-400 w-20 inline-block">Position</span>{position}</p>}
            {sector && sector.length > 0 && (
              <p className="text-xs text-slate-700"><span className="text-slate-400 w-20 inline-block">Sector</span>{sector.map((s) => SECTOR_LABEL[s]).join(", ")}</p>
            )}
            {hrTeamSize && <p className="text-xs text-slate-700"><span className="text-slate-400 w-20 inline-block">HR size</span>{HR_TEAM_SIZE_LABEL[hrTeamSize]}</p>}
            {segment && <p className="text-xs text-slate-700"><span className="text-slate-400 w-20 inline-block">Segment</span>{SEGMENT_META[segment].label}</p>}
            <p className="text-xs text-slate-700"><span className="text-slate-400 w-20 inline-block">Language</span>{sub.lang?.toUpperCase()}</p>
            <p className="text-xs text-slate-700"><span className="text-slate-400 w-20 inline-block">Registered</span>{date} at {time}</p>
            {utmSource && (
              <p className="text-xs text-slate-700"><span className="text-slate-400 w-20 inline-block">UTM Source</span>{utmSource}</p>
            )}
            {utmCampaign && (
              <p className="text-xs text-slate-700"><span className="text-slate-400 w-20 inline-block">UTM Campaign</span>{utmCampaign}</p>
            )}
            {channel && (
              <p className="text-xs text-slate-700"><span className="text-slate-400 w-20 inline-block">Discovery</span>{SOURCE_CHANNEL_LABEL[channel]}</p>
            )}
          </div>

          {/* Scores */}
          {scoring && (
            <div className="px-3 py-2.5 border-b border-slate-100">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Maturity Score</p>
                <span className="text-xs font-black tabular-nums" style={{ color: maturityColor }}>{total100}<span className="text-xs text-slate-300 font-normal">/100</span></span>
              </div>
              <div className="space-y-1.5">
                {CATEGORY_ORDER.map((cat) => (
                  <ScoreBar key={cat} value={scoring.subScores?.[cat] ?? 0} max={12} color={CATEGORY_META[cat].color} label={CATEGORY_META[cat].label} />
                ))}
              </div>
            </div>
          )}

          {/* Qualification & routing */}
          {scoring && (
            <div className="px-3 py-2.5 border-b border-slate-100 space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Qualification & Routing</p>
              <div className="flex flex-wrap gap-1.5">
                <QualificationBadge status={qualification} />
                {scoring.qualification?.painSignal && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">Active pain signal</span>
                )}
                {scoring.routing?.script && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {SCRIPT_LABEL[scoring.routing.script] ?? scoring.routing.script}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-700">
                <span className="text-slate-400 inline-block w-28">Recommend 1:1</span>
                {scoring.routing?.recommend1on1 ? "Yes" : "No"}
              </p>
              {scoring.routing?.followUpTimeframe && (
                <p className="text-xs text-slate-700">
                  <span className="text-slate-400 inline-block w-28">Follow-up</span>
                  {scoring.routing.followUpTimeframe}
                </p>
              )}
            </div>
          )}

          {/* AI insights — organizer-only, not shown to the participant */}
          {hasInsights && (
            <div className="px-3 py-2.5 border-b border-slate-100 space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Analysis</p>

              {scoring?.key_insight && (
                <div className="flex gap-2">
                  <InsightIcon size={14} color={ADMIN_ACCENT} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-0.5">Key insight</p>
                    <p className="text-xs text-slate-700 leading-snug">{scoring.key_insight}</p>
                  </div>
                </div>
              )}
              {scoring?.main_pain && (
                <div className="flex gap-2">
                  <BlockerIcon size={14} color="#EF4444" className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-0.5">Main pain point</p>
                    <p className="text-xs text-slate-700 leading-snug">{scoring.main_pain}</p>
                  </div>
                </div>
              )}
              {scoring?.recommended_action && (
                <div className="flex gap-2">
                  <ReadinessIcon size={14} color="#0D9488" className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-0.5">Recommended action</p>
                    <p className="text-xs text-slate-700 leading-snug font-medium">{scoring.recommended_action}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Strength & vigilance */}
          {(scoring?.strength || scoring?.vigilance) && (
            <div className="px-3 py-2.5 border-b border-slate-100">
              <div className="grid grid-cols-2 gap-3">
                {scoring?.strength && (
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <StrengthIcon size={12} color="#10B981" />
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Strength</p>
                    </div>
                    <p className="text-xs text-slate-600 leading-snug">
                      {scoring.strength.optionLabel} <span className="text-slate-400">— {scoring.strength.questionLabel}</span>
                    </p>
                  </div>
                )}
                {scoring?.vigilance && (
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <VigilanceIcon size={12} color="#F59E0B" />
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Vigilance</p>
                    </div>
                    <p className="text-xs text-slate-600 leading-snug">
                      {scoring.vigilance.optionLabel} <span className="text-slate-400">— {scoring.vigilance.questionLabel}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Answers — the admin dashboard is English-only, so these show in
              English regardless of the language the webinar was authored in. */}
          {sub.answers && Object.keys(sub.answers).length > 0 && (
            <div className="px-3 py-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Answers</p>
              <div className="space-y-1.5">
                {webinar.questions
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .filter(q => (sub.answers as Record<string, unknown>)[q.key] !== undefined)
                  .map((q, i) => {
                    const raw = (sub.answers as Record<string, unknown>)[q.key];
                    const qLabel  = q.label_en || q.label_fr;
                    const display = formatAnswerDisplay(q, raw).slice(0, 120);
                    return (
                      <div key={q.key} className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-1.5 flex-1 min-w-0">
                          <span className="mt-0.5 w-3.5 h-3.5 rounded text-[9px] font-black flex items-center justify-center shrink-0 bg-teal-50 text-teal-600">{i + 1}</span>
                          <p className="text-xs text-slate-500 leading-snug">{qLabel}</p>
                        </div>
                        <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-teal-50 text-teal-700 text-xs font-semibold max-w-[160px] text-right leading-snug">
                          {display}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
      </Dialog>
    </>
  );
}

// ── Tab body ─────────────────────────────────────────────────────────────────
const STATUS_FILTER_LABELS: Record<"all" | "completed" | "pending", string> = {
  all: "All",
  completed: "✓ Completed",
  pending: "⌛ In progress",
};
const QUAL_FILTERS = ["all", "hot", "warm", "cold"] as const;

export function WebinarRegistrantsTab({ webinar }: { webinar: Webinar }) {
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "pending">("all");
  const [qualFilter, setQualFilter] = useState<(typeof QUAL_FILTERS)[number]>("all");
  const [search, setSearch] = useState("");

  const completed = statusFilter === "all" ? undefined : statusFilter === "completed";
  const { data, isLoading } = useWebinarSubmissionsQuery(webinar._id, { limit: 200, completed });

  const allSubmissions = data?.data ?? [];
  const total = data?.total ?? 0;

  const submissions = useMemo(() => {
    let rows = allSubmissions;
    if (qualFilter !== "all") rows = rows.filter((s) => s.scoring?.qualification?.status === qualFilter);
    const q = search.trim().toLowerCase();
    if (q) rows = rows.filter((s) => (s.contact?.nom || "").toLowerCase().includes(q) || (s.contact?.email || "").toLowerCase().includes(q));
    return rows;
  }, [allSubmissions, qualFilter, search]);

  return (
    <div className="space-y-3">
      <OverviewStrip webinar={webinar} />

      <div className="rounded-xl border border-slate-100 bg-white overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
          <span className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
            Registrants
            <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-100">
              {total}
            </span>
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 border-b border-slate-100 bg-slate-50/50">
          {(["all", "completed", "pending"] as const).map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border
                ${statusFilter === f
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-teal-300"}`}>
              {STATUS_FILTER_LABELS[f]}
            </button>
          ))}
          <span className="w-px h-4 bg-slate-200 mx-0.5" />
          {QUAL_FILTERS.map((f) => (
            <button key={f} onClick={() => setQualFilter(f)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border capitalize
                ${qualFilter === f
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-teal-300"}`}>
              {f === "all" ? "All leads" : QUALIFICATION_META[f].label}
            </button>
          ))}
          <div className="relative ml-auto">
            <SearchIcon size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or email…"
              className="pl-6 pr-2.5 py-1 rounded-lg border border-slate-200 text-xs outline-none focus:border-teal-400 w-[180px]"
            />
          </div>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[1fr_120px_92px_78px_96px_28px] gap-2 items-center px-3 py-1.5 bg-slate-50 border-b border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Contact</span>
          <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Segment</span>
          <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Score</span>
          <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Lead</span>
          <span className="text-xs font-bold uppercase tracking-wide text-slate-400 text-right">Date</span>
          <span />
        </div>

        <div>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner className="size-6" style={{ color: ADMIN_ACCENT }} />
            </div>
          ) : submissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <PersonIcon size={32} className="mb-2 opacity-30" />
              <p className="text-xs">No registrants match these filters</p>
            </div>
          ) : (
            submissions.map(sub => (
              <SubmissionRow key={sub._id} sub={sub} webinar={webinar} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default WebinarRegistrantsTab;
