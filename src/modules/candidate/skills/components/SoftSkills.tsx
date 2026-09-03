import React from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Input } from "@/modules/shared/ui/shadcn/input";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Pagination } from "@/modules/shared/ui/shadcn/pagination";
import { UseSkillsReturn } from "../hooks/useSkills";
import type { Skill } from "../types/skill.types";
import SkillCard from "./SkillCard";
import EmptySkills from "./EmptySkills";

type Props = UseSkillsReturn & { levelFilter?: number | null; onTest?: (skill: Skill) => void };

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 p-2.5 rounded-xl bg-gray-100">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-20 rounded-lg" />
      ))}
    </div>
  );
}

function SoftSkills({
  skills, loading,
  search, setSearch,
  currentPage, totalPages, goToPage,
  levelFilter = null,
  onTest,
}: Props) {
  const { t } = useTranslation("dashboard");
  const s = (k: string, opts?: any) => t(`candidate.skills.${k}`, opts) as string;

  // Data is already filtered + paginated server-side (kind, search, level).
  const isFiltered = levelFilter !== null || search.trim() !== "";

  return (
    <div className="p-3 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={s("search_placeholder")}
            className="pl-8 h-8 text-[0.78rem] bg-gray-50 border-border focus-visible:ring-gray-300/50 focus-visible:border-gray-400"
          />
        </div>
        {!loading && skills.length > 0 && totalPages > 1 && (
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            size="sm"
            compact
          />
        )}
      </div>

      {loading ? (
        <SkeletonGrid />
      ) : skills.length === 0 ? (
        isFiltered ? (
          <p className="py-6 text-center text-[0.78rem] text-muted-foreground">
            {s("no_filter_results")}
          </p>
        ) : (
          <EmptySkills type="soft" />
        )
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 p-2.5 rounded-xl bg-gray-100">
          {skills.map(item => (
            <SkillCard key={item._id} skill={item} type="soft" last={false} onTest={onTest ? () => onTest(item) : undefined} />
          ))}
        </div>
      )}
    </div>
  );
}

export default SoftSkills;
