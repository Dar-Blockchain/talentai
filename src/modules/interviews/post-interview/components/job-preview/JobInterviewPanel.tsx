import React, { useMemo } from "react";
import { getPostSkills, type Skill } from '@/modules/company/posts/utils/postHelpers';
import JobHeaderCard from "./JobHeaderCard";
import JobDetailsColumn from "./JobDetailsColumn";
import JobApplyPanel from "./JobApplyPanel";
import type { JobPost } from "../../types/api";

export interface JobPreviewPanelProps {
  jobData: JobPost | null;
  onStartInterview?: () => void;
  isConfigLoading?: boolean;
}

export default function JobInterviewPanel({ jobData, isConfigLoading, onStartInterview }: JobPreviewPanelProps) {
  const jd = jobData?.jobDetails || {};
  const companyName =
    jobData?.createdBy?.name ||
    jobData?.companyName ||
    jobData?.user?.username ||
    "Company";
  const jobTitle = jd.title || jobData?.title || "Open Position";

  const skills = useMemo(() => getPostSkills(jobData), [jobData]);
  const technicalSkills = useMemo(
    () => skills.filter((s: Skill) => s.type === "technical"),
    [skills],
  );
  const softSkills = useMemo(
    () => skills.filter((s: Skill) => s.type === "soft"),
    [skills],
  );

  return (
    <div className="bg-[#F8F9FA] min-h-[calc(100vh-56px)] py-8 md:py-12">
      <div className="max-w-[1100px] mx-auto px-4 md:px-8 flex gap-6 flex-col md:flex-row md:items-start">
        <div className="flex-1 flex flex-col gap-6">
          <JobHeaderCard
            jobTitle={jobTitle}
            companyName={companyName}
            jd={jd}
            createdAt={jobData?.createdAt}
            expirationDate={jobData?.expirationDate}
          />
          <JobDetailsColumn
            jd={jd}
            technicalSkills={technicalSkills}
            softSkills={softSkills}
          />
        </div>

        <JobApplyPanel jobTitle={jobTitle} isConfigLoading={isConfigLoading} onStartInterview={onStartInterview} />
      </div>
    </div>
  );
}
