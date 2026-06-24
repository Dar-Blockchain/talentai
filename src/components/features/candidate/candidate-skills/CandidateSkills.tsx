import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Code2, Users, Layers } from "lucide-react";
import {
  Card, CardHeader, CardTitle, CardDescription,
} from "@/modules/shared/ui/shadcn/card";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Separator } from "@/modules/shared/ui/shadcn/separator";
import { cn } from "@/lib/utils";
import { useSkills } from "@/hooks/useSkills";
import TechnicalSkills from "./TechnicalSkills";
import SoftSkills from "./SoftSkills";

// ─── Types ────────────────────────────────────────────────────────────────────

type TypeFilter  = "all" | "technical" | "soft";
type LevelFilter = null | 1 | 2 | 3 | 4 | 5;

// ─── Constants ────────────────────────────────────────────────────────────────

const LEVEL_LABELS: Record<number, string> = {
  1: "entry", 2: "junior", 3: "mid", 4: "senior", 5: "expert",
};

const LEVEL_ACTIVE: Record<number | "all", string> = {
  all: "bg-primary text-primary-foreground border-primary",
  1:   "bg-gray-200 text-gray-600 border-gray-300",
  2:   "bg-warning text-white border-warning",
  3:   "bg-info text-white border-info",
  4:   "bg-secondary text-white border-secondary",
  5:   "bg-primary-dark text-white border-primary-dark",
};

const TYPE_ACTIVE: Record<TypeFilter, string> = {
  all:       "bg-primary text-primary-foreground border-primary shadow-sm",
  technical: "bg-info text-white border-info shadow-sm",
  soft:      "bg-warning text-white border-warning shadow-sm",
};

const INACTIVE = "bg-card text-gray-500 border-border hover:border-primary/50 hover:text-primary-dark";

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon, label, count, loading, accentBg, accentText,
}: {
  icon: React.ElementType;
  label: string;
  count: number;
  loading: boolean;
  accentBg: string;
  accentText: string;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/80 border-b">
      <div className={cn("w-1 h-3.5 rounded-full shrink-0", accentBg)} />
      <Icon className={cn("size-3.5 shrink-0", accentText)} />
      <span className={cn("text-[0.7rem] font-bold uppercase tracking-widest", accentText)}>
        {label}
      </span>
      <div className="ml-1">
        {loading ? (
          <Skeleton className="h-4 w-6" />
        ) : (
          <span className={cn("text-[0.62rem] font-bold px-1.5 py-0.5 rounded-full text-white", accentBg)}>
            {count}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── CandidateSkills ─────────────────────────────────────────────────────────

function CandidateSkills() {
  const { t } = useTranslation("dashboard");
  const s = (k: string, opts?: any) => t(`candidate.skills.${k}`, opts) as string;

  const tech = useSkills({ kind: "technical", limit: 8 });
  const soft = useSkills({ kind: "soft",      limit: 8 });

  const techCount  = tech.pagination?.total ?? 0;
  const softCount  = soft.pagination?.total ?? 0;
  const totalCount = techCount + softCount;

  const [typeFilter,  setTypeFilter]  = useState<TypeFilter>("all");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>(null);

  const toggleLevel = (v: LevelFilter) => setLevelFilter(prev => prev === v ? null : v);

  const showTech = typeFilter === "all" || typeFilter === "technical";
  const showSoft = typeFilter === "all" || typeFilter === "soft";

  return (
    <Card className="gap-0 py-0 overflow-hidden">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <CardHeader className="flex-row items-center gap-2.5 px-3 py-2.5 border-b grid-rows-1 [&>div]:gap-0">
        <div className="size-8 rounded-lg bg-primary-light border border-primary-border flex items-center justify-center shrink-0">
          <Layers className="size-4 text-primary-dark" />
        </div>
        <div className="flex flex-col">
          <CardTitle className="text-[0.95rem] font-extrabold text-gray-900 leading-tight">
            {s("title")}
          </CardTitle>
          {tech.loading && soft.loading ? (
            <Skeleton className="h-3 w-20 mt-1" />
          ) : (
            <CardDescription className="text-[0.65rem]">
              {s("subtitle", { count: totalCount })}
            </CardDescription>
          )}
        </div>
      </CardHeader>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <div className="px-3 pt-2.5 pb-2 flex flex-col gap-2 border-b bg-gray-50/60">

        {/* Type */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(["all", "technical", "soft"] as TypeFilter[]).map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={cn(
                "flex items-center gap-1 text-[0.68rem] font-semibold px-2.5 py-1 rounded-full border transition-all duration-150",
                typeFilter === type ? TYPE_ACTIVE[type] : INACTIVE,
              )}
            >
              {type === "all"       && <Layers className="size-3" />}
              {type === "technical" && <Code2  className="size-3" />}
              {type === "soft"      && <Users  className="size-3" />}
              {s(`filter.${type}`)}
            </button>
          ))}
        </div>

        <Separator />

        {/* Level */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[0.62rem] text-muted-foreground font-medium mr-0.5">
            {s("filter.level")}
          </span>
          <button
            onClick={() => setLevelFilter(null)}
            className={cn(
              "text-[0.65rem] font-semibold px-2 py-0.5 rounded-full border transition-all duration-150",
              levelFilter === null ? LEVEL_ACTIVE.all : INACTIVE,
            )}
          >
            {s("filter.all_levels")}
          </button>
          {([1, 2, 3, 4, 5] as const).map(lvl => (
            <button
              key={lvl}
              onClick={() => toggleLevel(lvl)}
              className={cn(
                "text-[0.65rem] font-semibold px-2 py-0.5 rounded-full border transition-all duration-150",
                levelFilter === lvl ? LEVEL_ACTIVE[lvl] : INACTIVE,
              )}
            >
              {s(`levels.${LEVEL_LABELS[lvl]}`)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Technical ───────────────────────────────────────────────────── */}
      {showTech && (
        <div>
          <SectionHeader
            icon={Code2} label={s("technical")}
            count={techCount} loading={tech.loading}
            accentBg="bg-info" accentText="text-info"
          />
          <TechnicalSkills {...tech} levelFilter={levelFilter} />
        </div>
      )}

      {/* ── Soft ────────────────────────────────────────────────────────── */}
      {showSoft && (
        <div className={cn(showTech && "border-t")}>
          <SectionHeader
            icon={Users} label={s("soft")}
            count={softCount} loading={soft.loading}
            accentBg="bg-warning" accentText="text-warning"
          />
          <SoftSkills {...soft} levelFilter={levelFilter} />
        </div>
      )}

    </Card>
  );
}

export default CandidateSkills;
