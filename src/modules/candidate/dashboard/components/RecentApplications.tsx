import React from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { Briefcase, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtDate, scoreTier } from "@/utils/functions";
import { buildInterviewUrl } from "@/lib/interviewSession";
import { Card, CardContent } from "@/modules/shared/ui/shadcn/card";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Badge } from "@/modules/shared/ui/shadcn/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/modules/shared/ui/shadcn/avatar";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/modules/shared/ui/shadcn/tooltip";
import { STATUS_CLASSES, SCORE_CLASSES } from "@/modules/candidate/applications/constants";
import { useApplicationsQuery } from "@/modules/candidate/applications/queries/useApplicationsQuery";
import SectionHeader from "./SectionHeader";

const WIDGET_LIMIT = 5;
const FETCH_LIMIT  = 15;

// Pending ("visited" = interview unlocked, not yet completed) surfaces first
// since it's the one status that needs the candidate to act; completed and
// withdrawn are settled either way. Stable sort keeps recency order within
// each group intact.
const STATUS_PRIORITY: Record<string, number> = { visited: 0, interview_completed: 1, withdrawn: 2 };

const RowSkeleton = () => (
  <tr>
    <td className="py-3 px-3"><div className="flex items-center gap-2.5"><Skeleton className="size-8 rounded-lg shrink-0" /><div className="space-y-1.5"><Skeleton className="h-3.5 w-32" /><Skeleton className="h-3 w-20" /></div></div></td>
    <td className="py-3 px-3 text-center"><Skeleton className="h-5 w-16 rounded-full mx-auto" /></td>
    <td className="py-3 px-3 text-center"><Skeleton className="h-3.5 w-10 mx-auto" /></td>
    <td className="py-3 px-3 text-right"><Skeleton className="h-3.5 w-16 ml-auto" /></td>
  </tr>
);

const RecentApplications: React.FC = () => {
  const { t }    = useTranslation("dashboard");
  const router   = useRouter();

  const { data, isLoading } = useApplicationsQuery({ limit: FETCH_LIMIT });
  const apps = [...(data?.data ?? [])]
    .sort((a, b) => (STATUS_PRIORITY[(a.status || "").toLowerCase()] ?? 3) - (STATUS_PRIORITY[(b.status || "").toLowerCase()] ?? 3))
    .slice(0, WIDGET_LIMIT);

  const statusLabel = (st: string) => {
    const key = `candidate.my_applications.status.${st}`;
    const res = t(key) as string;
    return res === key ? st : res;
  };

  const handleClick = (app: any) => {
    if ((app.status || "").toLowerCase() === "visited" && app.post?._id)
      router.push(buildInterviewUrl({ type: "post", jobId: app.post._id }));
    else
      router.push(`/candidate/applications/${app._id}`);
  };

  return (
    <TooltipProvider delayDuration={150}>
    <div>
      <SectionHeader
        icon={Briefcase} iconClass="text-gray-500"
        title="Recent Applications" href="/candidate/applications"
      />

      {!isLoading && apps.length === 0 ? (
        <Card className="py-8">
          <CardContent className="flex flex-col items-center gap-2 text-center px-4">
            <div className="size-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center">
              <Briefcase className="size-4 text-gray-300" />
            </div>
            <p className="text-[0.82rem] font-semibold text-gray-400">No applications yet</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="gap-0 py-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px]">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="text-left  py-2.5 px-3 text-[0.6rem] font-bold text-gray-400 uppercase tracking-wide border-b border-gray-100">Role</th>
                  <th className="text-center py-2.5 px-3 text-[0.6rem] font-bold text-gray-400 uppercase tracking-wide border-b border-gray-100">Status</th>
                  <th className="text-center py-2.5 px-3 text-[0.6rem] font-bold text-gray-400 uppercase tracking-wide border-b border-gray-100">Match</th>
                  <th className="text-right py-2.5 px-3 text-[0.6rem] font-bold text-gray-400 uppercase tracking-wide border-b border-gray-100">Applied</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: WIDGET_LIMIT }).map((_, i) => <RowSkeleton key={i} />)
                ) : (
                  apps.map((app: any) => {
                    const jd = app.post?.jobDetails || {};
                    const company = app.company || {};
                    const rawStatus = (app.status || "visited").toLowerCase();
                    const sc = STATUS_CLASSES[rawStatus as keyof typeof STATUS_CLASSES] ?? STATUS_CLASSES.visited;
                    const matchScore = app.matchScore != null ? Math.round(app.matchScore) : null;
                    const matchReason = app.candidateReasoning ?? app.matchReasoning ?? null;
                    const threshold = app.post?.thresholdScore != null ? Math.round(app.post.thresholdScore) : null;
                    const hasThreshold = threshold !== null && threshold > 0;
                    const belowThreshold = matchScore !== null && hasThreshold && matchScore < (threshold as number);
                    const isExpired = !!app.post?.expirationDate && new Date(app.post.expirationDate).getTime() < Date.now();
                    const logoUrl = company.logo
                      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}uploads/images/${company.logo}`
                      : undefined;

                    return (
                      <tr
                        key={app._id}
                        onClick={() => handleClick(app)}
                        className="cursor-pointer hover:bg-gray-50/80 transition-colors"
                      >
                        <td className="py-2.5 px-3 border-b border-gray-50">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Avatar className="size-8 rounded-md border border-gray-200 bg-gray-50 shrink-0">
                              <AvatarImage src={logoUrl} alt={company.companyName} className="size-full object-cover" />
                              <AvatarFallback className="rounded-md bg-gray-50">
                                <Briefcase className="size-3.5 text-gray-400" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <p className="min-w-0 text-[0.78rem] font-bold text-gray-900 truncate leading-tight">
                                  {jd.title || "Untitled Position"}
                                </p>
                                {isExpired && (
                                  <span className="shrink-0 inline-flex items-center rounded border border-amber-200 bg-amber-50 px-1 py-px text-[0.5rem] font-bold uppercase tracking-wide text-amber-600">
                                    Expired
                                  </span>
                                )}
                              </div>
                              <p className="text-[0.68rem] text-gray-400 truncate">
                                {company.companyName || "—"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center border-b border-gray-50">
                          <Badge
                            variant="outline"
                            className={cn("text-[0.58rem] font-bold rounded-full px-2 py-0.5 gap-1 whitespace-nowrap", sc.badge)}
                          >
                            <span className={cn("size-1.5 rounded-full shrink-0", sc.dot)} />
                            {statusLabel(rawStatus)}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-center border-b border-gray-50">
                          <div className="inline-flex flex-col items-center leading-tight">
                            {matchScore === null ? (
                              <span className="text-[0.72rem] text-gray-300">—</span>
                            ) : matchReason ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className={cn("inline-flex items-center gap-0.5 text-[0.72rem] font-bold cursor-help underline decoration-dotted underline-offset-2", belowThreshold ? "text-red-500" : SCORE_CLASSES[scoreTier(matchScore)])}>
                                    <TrendingUp className="size-2.5" />
                                    {matchScore}%
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="max-w-64 text-left text-[0.7rem] leading-snug">
                                  {matchReason}
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <span className={cn("inline-flex items-center gap-0.5 text-[0.72rem] font-bold", belowThreshold ? "text-red-500" : SCORE_CLASSES[scoreTier(matchScore)])}>
                                <TrendingUp className="size-2.5" />
                                {matchScore}%
                              </span>
                            )}
                            {threshold !== null && (
                              <span className={cn("text-[0.58rem] font-medium", belowThreshold ? "text-red-400" : "text-gray-400")}>
                                {threshold === 0
                                  ? "No threshold"
                                  : belowThreshold
                                    ? `below ${threshold}% min`
                                    : `min ${threshold}%`}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right border-b border-gray-50">
                          <span className="text-[0.7rem] text-gray-400 whitespace-nowrap">
                            {fmtDate(app.appliedAt || app.createdAt)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
    </TooltipProvider>
  );
};

export default RecentApplications;
