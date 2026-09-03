import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Briefcase, ExternalLink, Search } from "lucide-react";
import dayjs from "@/lib/dayjs";
import { cn } from "@/lib/utils";
import { Card } from "@/modules/shared/ui/shadcn/card";
import { Input } from "@/modules/shared/ui/shadcn/input";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/modules/shared/ui/shadcn/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/modules/shared/ui/shadcn/select";
import { useJobInterviewsQuery } from "../queries/useInterviewsQuery";

type StatusFilter = "all" | "ongoing" | "completed";
type JobSort = "newest" | "oldest";

const jobDate = (a: any) => new Date(a.appliedAt || a.createdAt || 0).getTime();

const RowSkeleton = () => (
  <tr>
    <td className="py-3 px-3"><div className="flex items-center gap-2.5"><Skeleton className="size-8 rounded-lg shrink-0" /><Skeleton className="h-3.5 w-36" /></div></td>
    <td className="py-3 px-3 text-center"><Skeleton className="h-5 w-20 rounded-full mx-auto" /></td>
    <td className="py-3 px-3 text-center"><Skeleton className="h-3.5 w-16 mx-auto" /></td>
    <td className="py-3 px-3 text-right"><Skeleton className="h-7 w-20 ml-auto" /></td>
  </tr>
);

const JobInterviewsSection: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const s = (k: string) => t(`candidate.interviews.${k}`) as string;

  const { data: allItems = [], isLoading } = useJobInterviewsQuery();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [sort,   setSort]   = useState<JobSort>("newest");

  const items = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allItems
      .filter((a: any) => {
        if (statusFilter !== "all") {
          const completed = a.status === "interview_completed";
          if (statusFilter === "completed" ? !completed : completed) return false;
        }
        if (!q) return true;
        const title = (a.post?.jobDetails?.title ?? "").toLowerCase();
        const company = (a.company?.companyName ?? "").toLowerCase();
        return title.includes(q) || company.includes(q);
      })
      .sort((a: any, b: any) => sort === "newest" ? jobDate(b) - jobDate(a) : jobDate(a) - jobDate(b));
  }, [allItems, statusFilter, search, sort]);

  if (!isLoading && allItems.length === 0) {
    return (
      <Card className="py-12">
        <div className="flex flex-col items-center gap-2 text-center px-4">
          <div className="size-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center">
            <Briefcase className="size-4 text-gray-300" />
          </div>
          <p className="text-[0.82rem] font-semibold text-gray-400">{s("empty_job")}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[150px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={s("search_role")}
            className="pl-8 h-8 text-[0.75rem] border-gray-200 focus-visible:ring-gray-300/50 focus-visible:border-gray-400 rounded-lg"
          />
        </div>

        <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5 shrink-0">
          {(["all", "ongoing", "completed"] as StatusFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                "flex items-center justify-center text-[0.7rem] font-semibold px-2.5 py-1.5 rounded-md transition-all duration-200 cursor-pointer",
                statusFilter === f ? "bg-card shadow-sm text-gray-800" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f === "all" ? s("filter_all") : f === "ongoing" ? s("ongoing") : s("completed")}
            </button>
          ))}
        </div>

        <Select value={sort} onValueChange={(v) => setSort(v as JobSort)}>
          <SelectTrigger className="h-8 w-[110px] shrink-0 text-[0.72rem] border-gray-200 rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest" className="text-[0.75rem]">{s("sort_newest")}</SelectItem>
            <SelectItem value="oldest" className="text-[0.75rem]">{s("sort_oldest")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

    <Card className="gap-0 py-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px]">
          <thead>
            <tr className="bg-gray-50/80">
              <th className="text-left  py-2.5 px-3 text-[0.6rem] font-bold text-gray-400 uppercase tracking-wide border-b border-gray-100">{s("table_role")}</th>
              <th className="text-center py-2.5 px-3 text-[0.6rem] font-bold text-gray-400 uppercase tracking-wide border-b border-gray-100">{s("table_status")}</th>
              <th className="text-center py-2.5 px-3 text-[0.6rem] font-bold text-gray-400 uppercase tracking-wide border-b border-gray-100">{s("table_date")}</th>
              <th className="text-right py-2.5 px-3 text-[0.6rem] font-bold text-gray-400 uppercase tracking-wide border-b border-gray-100" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-10 text-[0.78rem] text-gray-400">
                  {s("no_filter_results")}
                </td>
              </tr>
            ) : (
              items.map((application: any) => {
                const completed  = application.status === "interview_completed";
                const jobTitle   = application.post?.jobDetails?.title ?? s("job_application");
                const company    = application.company;
                const logoUrl    = company?.logo
                  ? `${process.env.NEXT_PUBLIC_API_BASE_URL}uploads/images/${company.logo}`
                  : undefined;
                const dateStr    = application.appliedAt ?? application.createdAt;
                const timeAgo    = dateStr ? dayjs(dateStr).fromNow() : "—";

                return (
                  <tr key={application._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-2.5 px-3 border-b border-gray-50">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar className="size-8 rounded-lg border border-gray-200 bg-gray-50 shrink-0">
                          <AvatarImage src={logoUrl} alt={company?.companyName} className="object-contain p-1" />
                          <AvatarFallback className="rounded-lg bg-gray-50">
                            <Briefcase className="size-3.5 text-gray-400" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-[0.78rem] font-bold text-gray-900 truncate leading-tight">{jobTitle}</p>
                          <p className="text-[0.68rem] text-gray-400 truncate">{company?.companyName || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center border-b border-gray-50">
                      <span className={cn(
                        "text-[0.6rem] font-bold rounded-full px-2 py-0.5 whitespace-nowrap",
                        completed ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 border border-gray-200",
                      )}>
                        {completed ? s("completed") : s("ongoing")}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center border-b border-gray-50">
                      <span className="text-[0.7rem] text-gray-400 whitespace-nowrap">{timeAgo}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right border-b border-gray-50">
                      {application.interviewLink && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className={cn(
                            "group h-7 gap-1 px-2.5 text-[0.65rem] font-bold border",
                            completed
                              ? "border-gray-300 bg-transparent text-gray-700 hover:bg-gray-100"
                              : "border-gray-300 bg-gray-800 text-white hover:bg-gray-900",
                          )}
                          onClick={() => window.open(application.interviewLink, "_blank")}
                        >
                          {completed ? s("view_report") : s("continue")}
                          <ExternalLink className={cn("size-2.5", completed ? "text-gray-500 group-hover:text-gray-700" : "text-white")} />
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
    </div>
  );
};

export default JobInterviewsSection;
