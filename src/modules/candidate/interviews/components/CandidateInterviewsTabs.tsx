import React from "react";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import { Briefcase, Brain, Video } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/modules/shared/ui/shadcn/tabs";
import JobInterviewsSection from "./JobInterviewsSection";
import SkillTestsSection    from "./SkillTestsSection";

const CandidateInterviewsTabs: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const s = (k: string) => t(`candidate.interviews.${k}`) as string;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
          <Video className="size-[18px] text-gray-500" />
        </div>
        <div>
          <p className="text-[0.92rem] font-extrabold text-foreground leading-tight">{s("page_title")}</p>
          <p className="text-[0.7rem] text-muted-foreground mt-0.5">{s("page_subtitle")}</p>
        </div>
      </div>

    <Tabs defaultValue="job" className="w-full">
      <TabsList className="mb-4 h-10 rounded-xl bg-gray-100 p-1">
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
    </div>
  );
};

export default dynamic(() => Promise.resolve(CandidateInterviewsTabs), { ssr: false });
