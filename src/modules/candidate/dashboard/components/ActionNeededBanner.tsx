import React from "react";
import { useRouter } from "next/router";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/modules/shared/ui/shadcn/card";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { buildInterviewUrl } from "@/lib/interviewSession";
import { useApplicationsQuery } from "@/modules/candidate/applications/queries/useApplicationsQuery";

// "visited" is the status the backend uses once a recruiter has reviewed the
// application and unlocked its assessment — from the candidate's point of
// view this is the one status that means "you have something to do," but
// elsewhere in the app it renders as a neutral gray badge buried in a list.
// This banner surfaces it at the top of the dashboard so it can't be missed.
const ActionNeededBanner: React.FC = () => {
  const router = useRouter();
  const { data, isLoading } = useApplicationsQuery({ status: "visited", limit: 3 });

  const pending = data?.data ?? [];
  const total   = data?.pagination?.totalCount ?? pending.length;

  if (isLoading || total === 0) return null;

  const single      = total === 1 ? pending[0] : null;
  const jobTitle    = single?.post?.jobDetails?.title;
  const companyName = single?.company?.companyName;

  const handlePrimaryAction = () => {
    if (single?.post?._id) {
      router.push(buildInterviewUrl({ type: "post", jobId: single.post._id }));
    } else {
      router.push("/candidate/applications?status=visited");
    }
  };

  return (
    <Card className="gap-0 py-0 overflow-hidden border-warning/30 bg-warning/5">
      <div className="h-0.5 bg-warning" />
      <CardContent className="px-4 py-3.5 flex items-center gap-3">
        <div className="size-10 rounded-xl bg-warning/15 border border-warning/25 flex items-center justify-center shrink-0">
          <AlertCircle className="size-5 text-warning" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[0.85rem] font-extrabold text-gray-900">
            {total === 1 ? "You have a pending interview" : `You have ${total} pending interviews`}
          </p>
          <p className="text-[0.72rem] text-gray-500 mt-0.5 truncate">
            {single
              ? `${jobTitle || "A role"}${companyName ? ` at ${companyName}` : ""} is waiting for you to complete your assessment`
              : "Complete these to keep your applications moving forward"}
          </p>
        </div>
        <Button
          size="sm"
          variant="warning"
          onClick={handlePrimaryAction}
          className="gap-1.5 shrink-0"
        >
          {total === 1 ? "Start now" : "Review all"}
          <ArrowRight className="size-3.5" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default ActionNeededBanner;
