import React from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { Briefcase } from "lucide-react";
import { buildInterviewUrl } from "@/lib/interviewSession";
import { Card, CardContent } from "@/modules/shared/ui/shadcn/card";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import ApplicationCard from "@/modules/candidate/applications/components/ApplicationCard";
import { useApplicationsQuery } from "@/modules/candidate/applications/queries/useApplicationsQuery";
import type { CandidateApplication } from "@/modules/candidate/applications/types/application.types";
import SectionHeader from "./SectionHeader";

const AppSkeleton = () => (
  <div className="rounded-xl border border-[#E8ECF2] bg-white overflow-hidden shadow-sm">
    <div className="h-0.5 bg-gray-100" />
    <div className="flex items-start gap-3 px-4 py-3">
      <Skeleton className="size-10 rounded-xl shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="flex justify-between gap-2">
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  </div>
);

const RecentApplications: React.FC = () => {
  const { t }    = useTranslation("dashboard");
  const router   = useRouter();

  const { data, isLoading } = useApplicationsQuery({ limit: 3 });
  const apps = data?.data ?? [];

  const statusLabel = (st: string) => {
    const key = `candidate.my_applications.status.${st}`;
    const res = t(key) as string;
    return res === key ? st : res;
  };

  const handleClick = (app: CandidateApplication) => {
    if ((app.status || "").toLowerCase() === "visited" && app.post?._id)
      router.push(buildInterviewUrl({ type: "post", jobId: app.post._id }));
    else
      router.push(`/candidate/applications/${app._id}`);
  };

  return (
    <div>
      <SectionHeader
        icon={Briefcase} iconClass="text-secondary-dark"
        title="Recent Applications" href="/candidate/applications"
      />
      <div className="flex flex-col gap-2">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <AppSkeleton key={i} />)
          : apps.length === 0
            ? (
              <Card className="py-8">
                <CardContent className="flex flex-col items-center gap-2 text-center px-4">
                  <div className="size-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center">
                    <Briefcase className="size-4 text-gray-300" />
                  </div>
                  <p className="text-[0.82rem] font-semibold text-gray-400">No applications yet</p>
                </CardContent>
              </Card>
            )
            : apps.map((app: CandidateApplication) => (
              <ApplicationCard
                key={app._id}
                app={app}
                statusLabel={statusLabel(app.status || "visited")}
                onClick={() => handleClick(app)}
              />
            ))
        }
      </div>
    </div>
  );
};

export default RecentApplications;
