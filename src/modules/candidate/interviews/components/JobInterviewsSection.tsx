import React from "react";
import { useTranslation } from "react-i18next";
import { Briefcase, Loader2 } from "lucide-react";
import { useJobInterviewsQuery } from "../queries/useInterviewsQuery";
import JobInterviewCard from "./JobInterviewCard";

const JobInterviewsSection: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const s = (k: string) => t(`candidate.interviews.${k}`) as string;

  const { data: items = [], isLoading } = useJobInterviewsQuery();

  return (
    <div className="flex flex-col gap-3">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[#9CA3AF]" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[#E2E8F0] bg-[#F8FAFC]">
            <Briefcase className="h-5 w-5 text-[#CBD5E1]" />
          </div>
          <p className="text-[0.8rem] font-semibold text-[#94A3B8]">{s("empty_job")}</p>
        </div>
      ) : (
        items.map((app) => <JobInterviewCard key={app._id} application={app} />)
      )}
    </div>
  );
};

export default JobInterviewsSection;
