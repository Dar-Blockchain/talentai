import React from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Input } from "@/modules/shared/ui/shadcn/input";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { SimplePagination } from "@/modules/shared/ui/shadcn/pagination-simple";
import { UseSkillsReturn } from "../hooks/useSkills";
import SkillCard from "./SkillCard";
import EmptySkills from "./EmptySkills";

type Props = UseSkillsReturn & { levelFilter?: number | null };

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-lg" />
      ))}
    </div>
  );
}

function SoftSkills({
  skills, loading,
  search, setSearch,
  currentPage, totalPages, goToPage,
  levelFilter = null,
}: Props) {
  const { t } = useTranslation("dashboard");
  const s = (k: string, opts?: any) => t(`candidate.skills.${k}`, opts) as string;

  const filtered = levelFilter === null
    ? skills
    : skills.filter(sk => sk.levelConfirmed === levelFilter);

  return (
    <div className="p-3 flex flex-col gap-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={s("search_placeholder")}
          className="pl-8 h-8 text-[0.78rem] bg-gray-50 border-border focus-visible:ring-warning/30 focus-visible:border-warning"
        />
      </div>

      {loading ? (
        <SkeletonGrid />
      ) : filtered.length === 0 ? (
        levelFilter !== null && skills.length > 0 ? (
          <p className="py-6 text-center text-[0.78rem] text-muted-foreground">
            {s("no_filter_results")}
          </p>
        ) : (
          <EmptySkills type="soft" />
        )
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2.5">
            {filtered.map(item => (
              <SkillCard key={item._id} skill={item} type="soft" last={false} />
            ))}
          </div>
          <SimplePagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            size="sm"
            className="pt-1"
          />
        </>
      )}
    </div>
  );
}

export default SoftSkills;
