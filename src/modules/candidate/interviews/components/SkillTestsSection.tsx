import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Code2, Users, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppDispatch } from "@/store/store";
import {
  fetchSkillAssessmentsByType,
  selectTechnicalAssessments,
  selectSoftAssessments,
} from "@/store/slices/interviewSlice";
import SkillInterviewCard from "./SkillInterviewCard";

interface SectionProps {
  icon:        React.ElementType;
  label:       string;
  count:       number;
  accentBg:    string;
  accentBorder:string;
  accentText:  string;
  dotClass:    string;
  loading:     boolean;
  emptyText:   string;
  children:    React.ReactNode;
}

const Section: React.FC<SectionProps> = ({
  icon: Icon, label, count, accentBg, accentBorder, accentText, dotClass,
  loading, emptyText, children,
}) => (
  <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
    <div className="flex items-center gap-2.5 border-b border-[#F1F5F9] px-5 py-4">
      <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg border", accentBg, accentBorder)}>
        <Icon className={cn("h-4 w-4", accentText)} />
      </div>
      <span className="flex-1 text-[0.88rem] font-bold text-[#0D1B2A]">{label}</span>
      {count > 0 && (
        <span className={cn("rounded-full border px-2 py-0.5 text-[0.68rem] font-bold", accentBg, accentBorder, accentText)}>
          {count}
        </span>
      )}
    </div>

    {loading ? (
      <div className="flex items-center justify-center py-10">
        <Loader2 className={cn("h-5 w-5 animate-spin", accentText)} />
      </div>
    ) : count === 0 ? (
      <div className="flex flex-col items-center py-10 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[#E2E8F0] bg-[#F8FAFC]">
          <Icon className="h-5 w-5 text-[#CBD5E1]" />
        </div>
        <p className="text-[0.8rem] font-semibold text-[#94A3B8]">{emptyText}</p>
      </div>
    ) : (
      <div className="grid grid-cols-2 gap-3 p-4 max-sm:grid-cols-1">
        {children}
      </div>
    )}
  </div>
);

const SkillTestsSection: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const s = (k: string) => t(`candidate.interviews.${k}`) as string;

  const dispatch = useDispatch<AppDispatch>();
  const { data: techItems, loading: techLoading } = useSelector(selectTechnicalAssessments);
  const { data: softItems, loading: softLoading } = useSelector(selectSoftAssessments);

  useEffect(() => { dispatch(fetchSkillAssessmentsByType({ skillType: "technical" })); }, [dispatch]);
  useEffect(() => { dispatch(fetchSkillAssessmentsByType({ skillType: "soft" }));      }, [dispatch]);

  return (
    <div className="flex flex-col gap-4">
      <Section
        icon={Code2} label={s("technical")} count={techItems.length}
        accentBg="bg-info/10" accentBorder="border-info/20" accentText="text-info"
        dotClass="bg-info"
        loading={techLoading} emptyText={s("empty_technical")}
      >
        {techItems.map((a) => (
          <SkillInterviewCard
            key={a._id} assessment={a}
            accentBg="bg-info/10" accentBorder="border-info/20" accentText="text-info"
            icon={Code2} s={s}
          />
        ))}
      </Section>

      <Section
        icon={Users} label={s("soft_skills")} count={softItems.length}
        accentBg="bg-warning/10" accentBorder="border-warning/20" accentText="text-warning"
        dotClass="bg-warning"
        loading={softLoading} emptyText={s("empty_soft")}
      >
        {softItems.map((a) => (
          <SkillInterviewCard
            key={a._id} assessment={a}
            accentBg="bg-warning/10" accentBorder="border-warning/20" accentText="text-warning"
            icon={Users} s={s}
          />
        ))}
      </Section>
    </div>
  );
};

export default SkillTestsSection;
