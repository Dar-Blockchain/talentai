import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Briefcase, Loader2 } from "lucide-react";
import { fetchJobInterviews } from "../api/interviews.api";
import JobInterviewCard from "./JobInterviewCard";
import type { CandidateApplication } from "../types/interview.types";

const JobInterviewsSection: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const s = (k: string) => t(`candidate.interviews.${k}`) as string;

  const [items,   setItems]   = useState<CandidateApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchJobInterviews()
      .then((data) => { if (active) { setItems(data); setLoading(false); } })
      .catch(() =>     { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {loading ? (
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
