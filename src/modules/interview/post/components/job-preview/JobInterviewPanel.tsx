import React, { useMemo } from "react";
import { Box } from "@mui/material";
import { getPostSkills, type Skill } from "@/utils/postHelpers";
import JobHeaderCard from "./JobHeaderCard";
import JobDetailsColumn from "./JobDetailsColumn";
import JobApplyPanel from "./JobApplyPanel";

export interface JobPreviewPanelProps {
  jobData: any;
  onStartInterview?: () => void;
  isConfigLoading?: boolean;
}

export default function JobInterviewPanel({ jobData, isConfigLoading, onStartInterview }: JobPreviewPanelProps) {
  const jd = jobData?.jobDetails || {};
  const companyName =
    jobData?.user?.companyName || jobData?.companyName || "Company";
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
    <Box
      sx={{
        bgcolor: "#F8F9FA",
        minHeight: "calc(100vh - 56px)",
        py: { xs: 3, md: 5 },
      }}
    >
      <Box
        sx={{
          maxWidth: 1100,
          mx: "auto",
          px: { xs: 2, md: 4 },
          display: "flex",
          gap: 3,
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "stretch", md: "flex-start" },
        }}
      >
        <Box
          sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2.5 }}
        >
          <JobHeaderCard
            jobTitle={jobTitle}
            companyName={companyName}
            jd={jd}
            createdAt={jobData?.createdAt}
          />
          <JobDetailsColumn
            jd={jd}
            technicalSkills={technicalSkills}
            softSkills={softSkills}
          />
        </Box>

        <JobApplyPanel jobTitle={jobTitle} isConfigLoading={isConfigLoading} onStartInterview={onStartInterview} />
      </Box>
    </Box>
  );
}
