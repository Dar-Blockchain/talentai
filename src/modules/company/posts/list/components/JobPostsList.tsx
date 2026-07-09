import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Briefcase as WorkOutlined, Plus as AddOutlined } from "lucide-react";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Pagination } from "@/modules/shared/ui/shadcn/pagination";
import JobPostCard from "./JobPostCard";
import type { StatusFilter, SortOption, PaginationInfo } from "../types";

interface JobPostsListProps {
  jobs: any[];
  loading: boolean;
  error: string | null;
  hasFilters: boolean;
  page: number;
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onDelete: (id: string) => void;
  onViewDetails: (id: string) => void;
  onPublish?: (id: string) => void;
  onCreateClick: () => void;
  canCreate?: boolean;
  canDelete?: boolean;
}

const JobPostSkeletonCard: React.FC = () => (
  <div className="flex h-full flex-col overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
    <Skeleton className="h-[3px] rounded-none bg-[#F3F4F6]" />
    <div className="flex flex-col gap-4 p-5">
      <div className="flex items-start gap-3">
        <Skeleton className="h-[42px] w-[42px] shrink-0 rounded-[10px]" />
        <div className="flex-1">
          <Skeleton className="mb-1 h-5 w-3/5" />
          <div className="flex gap-1.5">
            <Skeleton className="h-[18px] w-[76px] rounded" />
            <Skeleton className="h-[18px] w-[52px] rounded" />
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-3.5 w-[90px] rounded" />
        <Skeleton className="h-3.5 w-[70px] rounded" />
      </div>
      <div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="mt-1 h-4 w-3/4" />
      </div>
      <div className="flex justify-between border-t border-[#F3F4F6] pt-3">
        <Skeleton className="h-3.5 w-20 rounded" />
        <Skeleton className="h-3.5 w-[70px] rounded" />
      </div>
    </div>
  </div>
);

const JobPostsList = memo<JobPostsListProps>(({
  jobs, loading, error, hasFilters, page, pagination,
  onPageChange, onDelete, onViewDetails, onPublish, onCreateClick,
}) => {
  const { t } = useTranslation("posts");

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => <JobPostSkeletonCard key={i} />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] p-6 text-[13px] text-[#DC2626]">
        {error}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="rounded-xl border-[1.5px] border-dashed border-[#E5E7EB] bg-[#FAFAFA] py-24 text-center">
        <WorkOutlined size={44} color="#D1D5DB" className="mb-3" />
        <p className="mb-1 text-sm font-semibold text-[#374151]">
          {hasFilters ? t("empty.no_match") : t("empty.no_posts")}
        </p>
        <p className={`text-[13px] text-[#9CA3AF] ${hasFilters ? "" : "mb-4"}`}>
          {hasFilters ? t("empty.no_match_hint") : t("empty.no_posts_hint")}
        </p>
        {!hasFilters && (
          <Button variant="default" onClick={onCreateClick}>
            <AddOutlined size={16} />
            {t("empty.create_btn")}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 ${pagination.totalPages > 1 ? "mb-6" : "mb-0"}`}>
        {jobs.map((job: any, i: number) => (
          <JobPostCard key={job._id} job={job} index={i} onDelete={onDelete} onViewDetails={onViewDetails} onPublish={onPublish} />
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <Pagination page={page} totalPages={pagination.totalPages} onPageChange={onPageChange} size="sm" />
      )}
    </div>
  );
});

JobPostsList.displayName = "JobPostsList";
export default JobPostsList;
