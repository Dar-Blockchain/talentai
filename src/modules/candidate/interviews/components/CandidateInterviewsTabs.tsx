import React from "react";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import { Briefcase, Brain } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/modules/shared/ui/shadcn/tabs";
import JobInterviewsSection from "./JobInterviewsSection";
import SkillTestsSection    from "./SkillTestsSection";

const CandidateInterviewsTabs: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const s = (k: string) => t(`candidate.interviews.${k}`) as string;

  return (
    <Tabs defaultValue="job" className="w-full">
      <TabsList className="mb-4 h-10 rounded-xl bg-[#F3F4F6] p-1">
        <TabsTrigger
          value="job"
          className="flex items-center gap-2 rounded-lg px-4 text-[0.82rem] font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          <Briefcase className="h-3.5 w-3.5" />
          {s("job_interviews")}
        </TabsTrigger>
        <TabsTrigger
          value="skills"
          className="flex items-center gap-2 rounded-lg px-4 text-[0.82rem] font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          <Brain className="h-3.5 w-3.5" />
          {s("technical")} &amp; {s("soft_skills")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="job">
        <JobInterviewsSection />
      </TabsContent>

      <TabsContent value="skills">
        <SkillTestsSection />
      </TabsContent>
    </Tabs>
  );
};

export default dynamic(() => Promise.resolve(CandidateInterviewsTabs), { ssr: false });
