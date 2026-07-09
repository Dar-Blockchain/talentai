import React, { memo, useMemo } from "react";
import { useRouter } from "next/router";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Badge } from "@/modules/shared/ui/shadcn/badge";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useQuery } from "@tanstack/react-query";
import { apiFetchEmployeeCampaigns, apiFetchEmployeeCampaignMetrics } from "@/modules/company/campaigns/api";
import {
  Megaphone as CampaignOutlined,
  CheckCircle2 as CheckCircleOutlined,
  Play as PlayArrowOutlined,
  ChevronRight as ChevronRightOutlined,
  Circle as RadioButtonUncheckedOutlined,
  Clock as AccessTimeOutlined,
  TrendingUp as TrendingUpOutlined,
  FileText as DescriptionOutlined,
  Brain as PsychologyOutlined,
  ClipboardCheck as AssignmentTurnedInOutlined,
  ArrowRight as ArrowForwardOutlined,
  Eye as VisibilityOutlined,
} from "lucide-react";
import { motion } from "framer-motion";
import { ModuleType, ParticipantStatus } from "@/modules/company/campaigns/types/campaign";
import { EmployeeCampaignEntry } from "@/modules/company/campaigns/types";
import { buildCampaignSessionUrl } from "@/lib/campaignSession";

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAL   = "#0D9488";
const PURPLE = "#8B5CF6";
const BLUE   = "#3B82F6";
const AMBER  = "#F59E0B";
const GREEN  = "#10B981";
const ROSE   = "#F43F5E";

const MODULE_META: Record<ModuleType, { label: string; icon: React.ElementType; color: string }> = {
  SKILL_TEST:    { label: "Skill Test",    icon: AssignmentTurnedInOutlined, color: GREEN  },
  AI_INTERVIEW:  { label: "AI Interview",  icon: PsychologyOutlined,         color: PURPLE },
  QUESTIONNAIRE: { label: "Questionnaire", icon: DescriptionOutlined,        color: BLUE   },
  TRAINING_PATH: { label: "Training Path", icon: CampaignOutlined,           color: AMBER  },
};

const PS_META: Record<ParticipantStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  INVITED:     { label: "Invited",     color: "#0891B2", bg: "#ECFDF5", icon: RadioButtonUncheckedOutlined },
  IN_PROGRESS: { label: "In Progress", color: AMBER,    bg: "#FFFBEB", icon: PlayArrowOutlined },
  COMPLETED:   { label: "Completed",   color: GREEN,    bg: "#F0FDF4", icon: CheckCircleOutlined },
  DROPPED:     { label: "Dropped",     color: ROSE,     bg: "#FEF2F2", icon: RadioButtonUncheckedOutlined },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

const daysLeft = (iso?: string) => {
  if (!iso) return null;
  const end = new Date(iso);
  end.setHours(23, 59, 59, 999);
  return Math.ceil((end.getTime() - Date.now()) / 86_400_000);
};

const scoreColor = (s: number) =>
  s >= 80 ? GREEN : s >= 60 ? TEAL : s >= 40 ? AMBER : ROSE;

// ─── Score Gauge ──────────────────────────────────────────────────────────────

const ScoreGauge: React.FC<{ score: number; size?: number }> = ({ score, size = 80 }) => {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const color = scoreColor(score);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F3F4F6" strokeWidth={8} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeLinecap="round" strokeDasharray={`${filled} ${circ - filled}`}
          style={{ transition: "stroke-dasharray 0.8s ease" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="font-extrabold leading-none text-[#111827]" style={{ fontSize: size < 80 ? "14px" : "18px" }}>{score}</p>
        <p className="text-[9px] font-semibold text-[#9CA3AF]">/100</p>
      </div>
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard: React.FC<{
  label: string; value: number; icon: React.ElementType;
  color: string; bg: string; active?: boolean; onClick?: () => void; delay?: number;
}> = ({ label, value, icon: Icon, color, bg, onClick, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.28 }}>
    <div
      onClick={onClick}
      className={`rounded-xl border border-[#E5E7EB] bg-white p-5 transition-all ${onClick ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)]" : "cursor-default"}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="rounded-lg p-[4.4px]" style={{ backgroundColor: bg }}>
          <Icon size={20} color={color} />
        </div>
        <p className="text-[28px] font-extrabold leading-none text-[#111827]">{value}</p>
      </div>
      <p className="text-[11px] font-bold uppercase tracking-[0.7px] text-[#9CA3AF]">
        {label}
      </p>
    </div>
  </motion.div>
);

// ─── Section Shell ────────────────────────────────────────────────────────────

const Section: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode }> = ({
  title, subtitle, action, children,
}) => (
  <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
    <div className="flex items-center justify-between px-6 pb-4 pt-5">
      <div>
        <p className="text-[15px] font-bold text-[#111827]">{title}</p>
        {subtitle && <p className="mt-0.5 text-xs text-[#9CA3AF]">{subtitle}</p>}
      </div>
      {action}
    </div>
    <div className="px-6 pb-6">{children}</div>
  </div>
);

const ViewAll: React.FC<{ color?: string; onClick: () => void }> = ({ color = TEAL, onClick }) => (
  <span onClick={onClick} className="flex cursor-pointer items-center gap-1 text-xs font-semibold hover:underline" style={{ color }}>
    View all <ChevronRightOutlined size={14} />
  </span>
);

const EmptyState: React.FC<{ text: string }> = ({ text }) => (
  <div className="py-10 text-center">
    <CampaignOutlined size={32} color="#E5E7EB" className="mb-2" />
    <p className="text-[13px] text-[#9CA3AF]">{text}</p>
  </div>
);

const RowSkeleton = () => (
  <div className="flex items-center gap-3 py-2">
    <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
    <div className="flex-1">
      <Skeleton className="h-4 w-3/5" />
      <Skeleton className="mt-1 h-3 w-2/5" />
    </div>
    <Skeleton className="h-[22px] w-[60px] rounded-full" />
  </div>
);

// ─── Campaign Row ─────────────────────────────────────────────────────────────

const CampaignRow: React.FC<{ campaign: EmployeeCampaignEntry; onAction: () => void }> = ({ campaign, onAction }) => {
  const ps      = PS_META[campaign.participantStatus ?? "INVITED"];
  const mm      = MODULE_META[campaign.module?.type];
  const PsIcon  = ps.icon;
  const ModIcon = mm?.icon;
  const remaining = daysLeft(campaign.deadline);
  const isCompleted = campaign.participantStatus === "COMPLETED";
  const score = campaign.score ?? null;

  return (
    <div
      onClick={onAction}
      className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#F3F4F6] p-3 transition-all hover:border-[#E5E7EB] hover:bg-[#F9FAFB]"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${PURPLE}10` }}>
        {ModIcon ? <ModIcon size={18} color={mm.color} /> : <CampaignOutlined size={18} color={PURPLE} />}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-[#111827]">
          {campaign.title}
        </p>
        <div className="mt-0.5 flex items-center gap-2">
          {mm && <span className="text-[11px] text-[#9CA3AF]">{mm.label}</span>}
          {!isCompleted && remaining !== null && remaining > 0 && (
            <>
              <span className="text-[11px] text-[#9CA3AF]">·</span>
              <div className="flex items-center gap-1">
                <AccessTimeOutlined size={11} color={remaining <= 7 ? ROSE : "#9CA3AF"} />
                <span className={`text-[11px] ${remaining <= 7 ? "font-semibold" : "font-normal"}`} style={{ color: remaining <= 7 ? ROSE : "#9CA3AF" }}>
                  {remaining}d left
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {isCompleted && score !== null && (
          <div className="rounded-md px-2.5 py-1" style={{ backgroundColor: `${scoreColor(score)}12`, border: `1px solid ${scoreColor(score)}25` }}>
            <span className="text-xs font-extrabold" style={{ color: scoreColor(score) }}>{score}</span>
          </div>
        )}
        <Badge className="h-5 gap-1 rounded-full border-transparent text-[10px] font-bold" style={{ backgroundColor: ps.bg, color: ps.color }}>
          <PsIcon size={10} />
          {ps.label}
        </Badge>
        {isCompleted
          ? <VisibilityOutlined   size={15} color="#9CA3AF" />
          : <ArrowForwardOutlined size={15} color="#9CA3AF" />
        }
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

const EmployeeDashboardOverview: React.FC = () => {
  const router   = useRouter();

  const userId            = useSelector((state: RootState) => state.user.connectedUser.user?._id);
  const user              = useSelector((state: RootState) => state.user.connectedUser.user);
  const profile           = useSelector((state: RootState) => state.user.connectedUser.profile);
  const companyMembership = useSelector((state: RootState) => state.user.connectedUser.companyMembership);

  const { data: campaignsData, isLoading: campaignsLoading } = useQuery({
    queryKey:  ['employee-campaigns-dashboard', userId],
    queryFn:   () => apiFetchEmployeeCampaigns({ userId: userId!, limit: 20 }),
    enabled:   !!userId,
    staleTime: 30_000,
  });
  const { data: metrics } = useQuery({
    queryKey:  ['employee-campaign-metrics', userId],
    queryFn:   () => apiFetchEmployeeCampaignMetrics(userId!),
    enabled:   !!userId,
    staleTime: 60_000,
  });
  const campaigns = campaignsData?.data ?? [];

  // Derived
  const pending    = useMemo(() => campaigns.filter(c => c.participantStatus === "INVITED" || c.participantStatus === "IN_PROGRESS").slice(0, 5), [campaigns]);
  const completed  = useMemo(() => campaigns.filter(c => c.participantStatus === "COMPLETED").slice(0, 5), [campaigns]);
  const scored     = useMemo(() => completed.filter(c => (c as any).score != null), [completed]);
  const avgScore   = useMemo(() => {
    if (!scored.length) return 0;
    return Math.round(scored.reduce((s, c) => s + (c as any).score, 0) / scored.length);
  }, [scored]);

  const fullName   = `${ profile?.firstName || ""} ${ profile?.lastName || ""}`.trim() || user?.username || "there";
  const companyName = companyMembership?.company?.profile?.companyDetails?.name || companyMembership?.company?.username || null;

  if (campaignsLoading && !campaigns.length) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-[110px] rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-[110px] rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[280px] rounded-xl" />
          <Skeleton className="h-[280px] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── Welcome Banner ─────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="relative overflow-hidden rounded-xl border border-[#E5E7EB] bg-white p-6 md:p-7">
          <div className="absolute left-0 top-0 h-full w-1 rounded-l-[3px]" style={{ backgroundColor: PURPLE }} />
          <div className="pointer-events-none absolute -top-6 right-10 h-[140px] w-[140px] rounded-full bg-[#F5F3FF]" />
          <div className="pointer-events-none absolute -bottom-[30px] -right-5 h-[100px] w-[100px] rounded-full bg-[#F0FDFA]" />

          <div className="relative z-[1] flex flex-wrap items-center justify-between gap-4">

            {/* Left: greeting */}
            <div>
              <p className="mb-1 text-xs font-medium text-[#9CA3AF]">{greeting()},</p>
              <p className="text-[20px] md:text-2xl font-extrabold text-[#111827] tracking-[-0.3px]">
                {fullName} 👋
              </p>
              <p className="mt-1.5 text-[13px] text-[#6B7280]">
                Here's your campaign progress for today.
              </p>
              {companyName && (
                <p className="mt-1.5 text-xs text-[#9CA3AF]">
                  Member of{" "}
                  <span className="font-semibold text-[#6B7280]">{companyName}</span>
                </p>
              )}
            </div>

            {/* Right: score gauge */}
            {avgScore > 0 && (
              <div className="flex items-center gap-4 rounded-xl border border-[#DDD6FE] bg-[#F5F3FF] px-5 py-3">
                <ScoreGauge score={avgScore} size={72} />
                <div>
                  <p className="text-xs font-semibold text-[#374151]">Avg. Score</p>
                  <p className="mt-1 text-[11px] text-[#9CA3AF]">Across {scored.length} assessment{scored.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Stat Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        <StatCard label="Total"       value={metrics?.total      ?? 0} icon={CampaignOutlined}            color={PURPLE}   bg={`${PURPLE}10`}   delay={0.05} onClick={() => router.push("/employee/campaigns")} />
        <StatCard label="Invited"     value={metrics?.invited    ?? 0} icon={RadioButtonUncheckedOutlined} color="#0891B2"  bg="#E0F7FA"          delay={0.08} onClick={() => router.push("/employee/campaigns")} />
        <StatCard label="In Progress" value={metrics?.inProgress ?? 0} icon={PlayArrowOutlined}            color={AMBER}    bg={`${AMBER}12`}    delay={0.11} onClick={() => router.push("/employee/campaigns")} />
        <StatCard label="Completed"   value={metrics?.completed  ?? 0} icon={CheckCircleOutlined}          color={GREEN}    bg={`${GREEN}10`}    delay={0.14} onClick={() => router.push("/employee/campaigns")} />
      </div>

      {/* ── Two columns: pending + completed ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Active / Invited */}
        <Section
          title="Active Campaigns"
          subtitle={`${pending.length} to complete`}
          action={<ViewAll color={PURPLE} onClick={() => router.push("/employee/campaigns")} />}
        >
          {campaignsLoading ? (
            [0, 1, 2, 3].map(i => <RowSkeleton key={i} />)
          ) : pending.length === 0 ? (
            <EmptyState text="No active campaigns right now" />
          ) : (
            <div className="flex flex-col gap-2">
              {pending.map(c => (
                <CampaignRow
                  key={c.campaignId}
                  campaign={c}
                  onAction={() => {
                    router.push(buildCampaignSessionUrl(c.campaignId));
                  }}
                />
              ))}
            </div>
          )}
        </Section>

        {/* Completed */}
        <Section
          title="Completed Campaigns"
          subtitle={`${metrics?.completed ?? 0} total`}
          action={<ViewAll color={GREEN} onClick={() => router.push("/employee/campaigns?participantStatus=COMPLETED")} />}
        >
          {campaignsLoading ? (
            [0, 1, 2, 3].map(i => <RowSkeleton key={i} />)
          ) : completed.length === 0 ? (
            <EmptyState text="No completed campaigns yet" />
          ) : (
            <div className="flex flex-col gap-2">
              {completed.map(c => (
                <CampaignRow
                  key={c.campaignId}
                  campaign={c}
                  onAction={() => router.push(buildCampaignSessionUrl(c.campaignId))}
                />
              ))}
            </div>
          )}
        </Section>

      </div>

      {/* ── Score breakdown (only if has scored assessments) ───────────────── */}
      {scored.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.3 }}>
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[15px] font-bold text-[#111827]">Score Breakdown</p>
                <p className="mt-0.5 text-xs text-[#9CA3AF]">Based on {scored.length} scored assessment{scored.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex items-center gap-2 rounded-lg px-4 py-1.5" style={{ backgroundColor: `${scoreColor(avgScore)}10` }}>
                <TrendingUpOutlined size={16} color={scoreColor(avgScore)} />
                <span className="text-[13px] font-bold" style={{ color: scoreColor(avgScore) }}>{avgScore} avg</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-8">
              <ScoreGauge score={avgScore} size={104} />

              <div className="flex min-w-[180px] flex-1 flex-col gap-4">
                {[
                  { label: "Excellent (≥80)", value: scored.filter(c => (c as any).score >= 80).length, color: GREEN },
                  { label: "Good (60–79)",    value: scored.filter(c => { const s = (c as any).score; return s >= 60 && s < 80; }).length, color: TEAL },
                  { label: "Below 60",        value: scored.filter(c => (c as any).score < 60).length, color: ROSE },
                ].map(row => (
                  <div key={row.label}>
                    <div className="mb-1 flex justify-between">
                      <span className="text-xs font-medium text-[#6B7280]">{row.label}</span>
                      <span className="text-xs font-bold text-[#374151]">{row.value}/{scored.length}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#F3F4F6] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${scored.length > 0 ? (row.value / scored.length) * 100 : 0}%`, backgroundColor: row.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden xl:flex min-w-[200px] flex-col gap-2">
                <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.6px] text-[#9CA3AF]">
                  Recent scores
                </p>
                {scored.slice(0, 5).map(c => (
                  <div key={c.campaignId} className="flex items-center gap-2.5">
                    <div className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: scoreColor((c as any).score) }} />
                    <p className="flex-1 truncate text-xs font-medium text-[#374151]">
                      {c.title}
                    </p>
                    <span className="text-xs font-bold" style={{ color: scoreColor((c as any).score) }}>{(c as any).score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
};

export default memo(EmployeeDashboardOverview);
