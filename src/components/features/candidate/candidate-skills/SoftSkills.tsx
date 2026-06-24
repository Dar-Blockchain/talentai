import React from "react";
import { useTranslation } from "react-i18next";
import { Search, ChevronDown, Loader2 } from "lucide-react";
import { Input } from "@/modules/shared/ui/shadcn/input";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { UseSkillsReturn } from "@/hooks/useSkills";
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
  skills, pagination, loading, loadingMore,
  search, setSearch, loadMore,
  levelFilter = null,
}: Props) {
  const { t } = useTranslation("dashboard");
  const s = (k: string, opts?: any) => t(`candidate.skills.${k}`, opts) as string;

  const filtered = levelFilter === null
    ? skills
    : skills.filter(sk => sk.levelConfirmed === levelFilter);

  return (
    <div className="p-3 flex flex-col gap-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={s("search_placeholder")}
          className="pl-8 h-8 text-[0.78rem] bg-gray-50 border-border focus-visible:ring-warning/30 focus-visible:border-warning"
        />
      </div>

      {/* Content */}
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

          {pagination?.hasNext && (
            <div className="flex justify-center pt-1">
              <Button
                size="sm"
                variant="outline"
                disabled={loadingMore}
                onClick={loadMore}
                className="text-[0.75rem] font-semibold border-warning-border text-warning hover:bg-warning-light gap-1.5"
              >
                {loadingMore ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <ChevronDown className="size-3.5" />
                )}
                {loadingMore
                  ? s("loading")
                  : s("show_more", { count: pagination.total - skills.length })}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SoftSkills;
