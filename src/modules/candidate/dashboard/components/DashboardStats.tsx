import React from "react";
import { useRouter } from "next/router";
import { Briefcase, Clock, GraduationCap, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/modules/shared/ui/shadcn/card";
import { useApplicationStatsQuery } from "@/modules/candidate/applications/queries/useApplicationsQuery";
import { useSkillAssessmentsQuery } from "@/modules/candidate/interviews/queries/useInterviewsQuery";

interface StatCardProps {
  icon:   React.ElementType;
  label:  string;
  value:  number | string;
  bg:     string;
  border: string;
  text:   string;
  href?:  string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, bg, border, text, href }) => {
  const router = useRouter();
  return (
    <Card
      className={cn("gap-0 py-0", href && "cursor-pointer hover:shadow-md hover:-translate-y-px transition-all duration-200")}
      onClick={href ? () => router.push(href) : undefined}
    >
      <CardContent className="flex items-center gap-3 px-4 py-3.5">
        <div className={cn("size-9 rounded-xl border flex items-center justify-center shrink-0", bg, border)}>
          <Icon className={cn("size-4", text)} />
        </div>
        <div className="min-w-0">
          <p className={cn("text-[1.15rem] font-extrabold leading-tight", text)}>{value}</p>
          <p className="text-[0.65rem] text-gray-400 font-medium truncate">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const DashboardStats: React.FC = () => {
  const { data: stats }    = useApplicationStatsQuery();
  const { data: techData } = useSkillAssessmentsQuery("technical", 3);
  const { data: softData } = useSkillAssessmentsQuery("soft", 3);

  const totalApps           = stats ? Object.values(stats.statusCounts).reduce((a, n) => a + n, 0) : 0;
  const pendingInterviews   = stats?.statusCounts["visited"] ?? 0;
  const completedInterviews = stats?.totalInterviews ?? 0;
  // .results is capped by the limit passed to the query (3, just enough to
  // know "is this list non-empty" for these two calls) -- .total is the
  // real, unbounded count and is what the stat card should show.
  const skillsCount         = (techData?.total ?? 0) + (softData?.total ?? 0);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard
        icon={Briefcase}     label="Applications"        value={totalApps}
        bg="bg-gray-100" border="border-gray-200" text="text-gray-700"
        href="/candidate/applications"
      />
      {/* "visited" = a recruiter unlocked the assessment and it's waiting on
          the candidate — the one status here that actually needs action, so
          it's the only card that gets color (amber), and a direct link to
          the filtered list. Every other card stays neutral gray. */}
      <StatCard
        icon={Clock}         label="Pending Interviews"  value={pendingInterviews}
        bg={pendingInterviews > 0 ? "bg-warning/10" : "bg-gray-100"}
        border={pendingInterviews > 0 ? "border-warning/20" : "border-gray-200"}
        text={pendingInterviews > 0 ? "text-warning" : "text-gray-400"}
        href="/candidate/applications?status=visited"
      />
      <StatCard
        icon={GraduationCap} label="Completed Interviews" value={completedInterviews}
        bg="bg-gray-100"        border="border-gray-200"        text="text-gray-700"
        href="/candidate/applications?status=interview_completed"
      />
      <StatCard
        icon={Brain}         label="Skills tested"       value={skillsCount}
        bg="bg-gray-100"      border="border-gray-200"       text="text-gray-700"
        href="/candidate/skills"
      />
    </div>
  );
};

export default DashboardStats;
