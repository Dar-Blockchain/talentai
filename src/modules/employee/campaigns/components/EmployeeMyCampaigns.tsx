import React, { memo, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useQuery } from "@tanstack/react-query";
import { apiFetchEmployeeCampaigns, apiFetchEmployeeCampaignMetrics } from "@/modules/company/campaigns/api";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Alert, AlertDescription } from "@/modules/shared/ui/shadcn/alert";
import { Filter, Circle, Play, CircleCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Campaign, ParticipantStatus } from "@/modules/company/campaigns/types/campaign";
import { EmployeeCampaignEntry } from "@/modules/company/campaigns/types";
import { CampaignCard } from "@/modules/company/campaigns";
import CampaignsFilterBar from "@/modules/company/campaigns/components/list/CampaignsFilterBar";
import CampaignStatsRow, { CampaignStatItem } from "@/modules/company/campaigns/components/list/CampaignStatsRow";
import ParticipantResultsDialog from "@/modules/company/campaigns/components/details/ParticipantResultsDialog";
import { buildCampaignSessionUrl } from "@/lib/campaignSession";
import PageHeader from "@/modules/shared/layouts/dashboard/PageHeader";
import { useTranslation } from "react-i18next";

type EmployeeFilterTab = "ALL" | ParticipantStatus;

const TEAL  = "#0D9488";
const AMBER = "#F59E0B";
const GREEN = "#10B981";

// ─── Adapter: EmployeeCampaignEntry → Campaign (shape CampaignCard expects) ────

function toCardCampaign(e: EmployeeCampaignEntry): Campaign {
  return {
    _id: e.campaignId,
    company: typeof e.company === "string" ? e.company : e.company?._id ?? "",
    title: e.title,
    type: e.type,
    description: e.description,
    status: e.status,
    anonymityMode: e.anonymityMode,
    module: e.module,
    accessMethod: (e.accessMethod as Campaign["accessMethod"]) ?? "ACCOUNTS",
    deadline: e.deadline,
    targetEmployeeCount: e.totalParticipants,
    participantStatus: e.participantStatus,
    progress: e.progress,
    score: e.score,
    completedAt: e.completedAt,
    createdBy: "",
    createdAt: e.joinedAt ?? "",
    updatedAt: e.joinedAt ?? "",
  };
}

// ─── Main Component ────────────────────────────────────────────────────────────

const EmployeeMyCampaigns: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation("dashboard");
  const p = "pages.campaigns";

  const [activeFilter, setActiveFilter] = useState<EmployeeFilterTab>("ALL");
  const [search,       setSearch]       = useState("");
  const [period,       setPeriod]       = useState("");
  const [searchInput,  setSearchInput]  = useState("");
  const [resultsFor,   setResultsFor]   = useState<string | null>(null);

  const userId  = useSelector((state: RootState) => state.user.connectedUser.user?._id);
  const profile = useSelector((state: RootState) => state.user.connectedUser.profile);
  const myName  = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ");

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey:  ['employee-campaign-metrics', userId],
    queryFn:   () => apiFetchEmployeeCampaignMetrics(userId!),
    enabled:   !!userId,
    staleTime: 60_000,
  });

  const { data: campaignsData, isLoading: loading, error: queryError } = useQuery({
    queryKey:  ['employee-campaigns', userId, search, period, activeFilter],
    queryFn:   () => apiFetchEmployeeCampaigns({
      userId:            userId!,
      search:            search || undefined,
      participantStatus: activeFilter !== "ALL" ? activeFilter : undefined,
      period:            period || undefined,
    }),
    enabled:   !!userId,
    staleTime: 30_000,
  });
  const campaigns = campaignsData?.data ?? [];
  const error     = queryError ? ((queryError as Error).message ?? "An error occurred") : null;

  // debounce searchInput → search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handlePeriodChange = (val: string) => setPeriod(val);
  const clearFilters = () => { setSearchInput(""); setSearch(""); setPeriod(""); setActiveFilter("ALL"); };

  const hasActiveFilters = !!(search || period || activeFilter !== "ALL");

  const handleStart = (id: string) => {
    router.push(buildCampaignSessionUrl(id));
  };

  const handleShowResults = (id: string) => setResultsFor(id);

  const resultsParticipantId = resultsFor
    ? localStorage.getItem(`anon_token_${resultsFor}`) || localStorage.getItem(`link_token_${resultsFor}`) || userId || ""
    : "";

  const periodOptions = [
    { value: "",    label: t(`${p}.toolbar.period.all`) },
    { value: "7d",  label: t(`${p}.toolbar.period.7d`) },
    { value: "30d", label: t(`${p}.toolbar.period.30d`) },
    { value: "3m",  label: t(`${p}.toolbar.period.3m`) },
    { value: "6m",  label: t(`${p}.toolbar.period.6m`) },
    { value: "1y",  label: t(`${p}.toolbar.period.1y`) },
  ];

  const emptyHint =
    activeFilter === "INVITED" ? t(`${p}.my_campaigns.empty_invited`) :
    activeFilter === "IN_PROGRESS" ? t(`${p}.my_campaigns.empty_in_progress`) :
    t(`${p}.my_campaigns.empty_completed`);

  const sp = "pages.campaigns.employee_stats";
  const statItems: CampaignStatItem[] = [
    { key: "ALL",         icon: Filter,      color: TEAL,      value: metrics?.total      ?? 0, label: t(`${sp}.total`),       active: activeFilter === "ALL",         onClick: () => setActiveFilter("ALL") },
    { key: "INVITED",     icon: Circle,      color: "#0891B2", value: metrics?.invited    ?? 0, label: t(`${sp}.invited`),     active: activeFilter === "INVITED",     onClick: () => setActiveFilter("INVITED") },
    { key: "IN_PROGRESS", icon: Play,        color: AMBER,     value: metrics?.inProgress ?? 0, label: t(`${sp}.in_progress`), active: activeFilter === "IN_PROGRESS", onClick: () => setActiveFilter("IN_PROGRESS") },
    { key: "COMPLETED",   icon: CircleCheck, color: GREEN,     value: metrics?.completed  ?? 0, label: t(`${sp}.completed`),   active: activeFilter === "COMPLETED",   onClick: () => setActiveFilter("COMPLETED") },
  ];

  return (
    <div className="flex flex-col gap-6">

      <PageHeader
        title={t(`${p}.my_campaigns.title`)}
        subtitle={t(`${p}.my_campaigns.subtitle`)}
      />

      <CampaignStatsRow items={statItems} loading={metricsLoading} />

      <CampaignsFilterBar
        search={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder={t(`${p}.toolbar.search_placeholder`)}
        period={period}
        onPeriodChange={handlePeriodChange}
        periodOptions={periodOptions}
        periodPlaceholder={t(`${p}.toolbar.period_placeholder`)}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        clearLabel={t(`${p}.toolbar.clear_filters`)}
      />

      {/* ── Loading skeletons ─────────────────────────────────────────────────── */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[260px] rounded-xl" />
          ))}
        </div>
      )}

      {/* ── Error state ───────────────────────────────────────────────────────── */}
      {!loading && error && (
        <Alert variant="destructive" className="rounded-xl"><AlertDescription>{error}</AlertDescription></Alert>
      )}

      {/* ── Campaign Grid ─────────────────────────────────────────────────────── */}
      {!loading && !error && campaigns.length === 0 ? (
        <div className="bg-background border border-border rounded-2xl py-16 text-center">
          <CircleCheck className="size-10 text-muted mx-auto mb-3" />
          <p className="text-[15px] font-semibold text-foreground/80">{t(`${p}.my_campaigns.empty_title`)}</p>
          <p className="text-[13px] text-muted-foreground mt-1">{emptyHint}</p>
        </div>
      ) : !loading && !error ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {campaigns.map((campaign, i) => (
              <motion.div
                key={campaign.campaignId}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: i * 0.05, duration: 0.25 }}
                className="h-full"
              >
                <CampaignCard
                  campaign={toCardCampaign(campaign)}
                  variant="employee"
                  href={`/employee/campaigns/${campaign.campaignId}`}
                  onStart={handleStart}
                  onShowResults={handleShowResults}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : null}

      <ParticipantResultsDialog
        open={!!resultsFor}
        mode="self"
        campaignId={resultsFor ?? ""}
        participantId={resultsParticipantId || null}
        participantName={myName}
        onClose={() => setResultsFor(null)}
      />
    </div>
  );
};

export default memo(EmployeeMyCampaigns);
