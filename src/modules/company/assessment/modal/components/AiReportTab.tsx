import React from "react";
import {
  CheckCircle2 as CheckCircleOutlined,
  Key as KeyOutlined,
  Lightbulb as LightbulbOutlined,
  User as PersonOutlined,
  AlertTriangle as ReportProblemOutlined,
  GraduationCap as SchoolOutlined,
  TrendingUp as TrendingUpOutlined,
  Sparkles as AutoAwesomeOutlined,
} from "lucide-react";
import { PostAssessmentData } from "../types";

interface Props {
  aiAssessment:     PostAssessmentData["aiAssessment"] | undefined;
  candidateProfile: PostAssessmentData["candidateProfile"];
  aiSummaryTitle:   string;
}

interface SectionCfg {
  key:        keyof NonNullable<PostAssessmentData["aiAssessment"]>;
  title:      string;
  headerCls:  string;
  borderCls:  string;
  iconCls:    string;
  iconWrapCls: string;
  dotCls:     string;
  textCls:    string;
  countCls:   string;
  Icon:       React.ComponentType<{ size?: number; color?: string }>;
  iconColor:  string;
}

const SECTIONS: SectionCfg[] = [
  { key: "strengths",          title: "Strengths",            headerCls: "bg-emerald-50 border-emerald-100", borderCls: "border-emerald-100", iconWrapCls: "bg-emerald-100", iconCls: "text-emerald-600", dotCls: "bg-emerald-400", textCls: "text-emerald-900", countCls: "bg-emerald-100 text-emerald-700", Icon: CheckCircleOutlined,   iconColor: "#059669" },
  { key: "weaknesses",         title: "Areas for Growth",     headerCls: "bg-amber-50 border-amber-100",   borderCls: "border-amber-100",   iconWrapCls: "bg-amber-100",   iconCls: "text-amber-600",   dotCls: "bg-amber-400",   textCls: "text-amber-900",   countCls: "bg-amber-100 text-amber-700",   Icon: LightbulbOutlined,     iconColor: "#D97706" },
  { key: "keyDecisionFactors", title: "Key Decision Factors", headerCls: "bg-emerald-50 border-emerald-100", borderCls: "border-emerald-100", iconWrapCls: "bg-emerald-100", iconCls: "text-emerald-700", dotCls: "bg-emerald-500", textCls: "text-emerald-900", countCls: "bg-emerald-100 text-emerald-700", Icon: KeyOutlined,           iconColor: "#059669" },
  { key: "hiringRisks",        title: "Hiring Risks",         headerCls: "bg-red-50 border-red-100",       borderCls: "border-red-100",     iconWrapCls: "bg-red-100",     iconCls: "text-red-600",     dotCls: "bg-red-400",     textCls: "text-red-900",     countCls: "bg-red-100 text-red-700",       Icon: ReportProblemOutlined, iconColor: "#DC2626" },
  { key: "developmentAreas",   title: "Development Areas",    headerCls: "bg-violet-50 border-violet-100", borderCls: "border-violet-100", iconWrapCls: "bg-violet-100",  iconCls: "text-violet-600",  dotCls: "bg-violet-400",  textCls: "text-violet-900",  countCls: "bg-violet-100 text-violet-700",  Icon: SchoolOutlined,        iconColor: "#7C3AED" },
];

const AiReportTab: React.FC<Props> = ({ aiAssessment, candidateProfile, aiSummaryTitle }) => {
  const activeSections = SECTIONS.filter(({ key }) => {
    const items = aiAssessment?.[key] as string[] | undefined;
    return (items?.length ?? 0) > 0;
  });

  return (
    <div className="p-6 flex flex-col gap-5">

      {/* Summary */}
      {aiAssessment?.summary && (
        <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3 border-b border-slate-100 bg-slate-50">
            <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center">
              <AutoAwesomeOutlined size={13} color="#7C3AED" />
            </div>
            <span className="text-[0.78rem] font-bold text-slate-700">{aiSummaryTitle}</span>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm text-slate-700 leading-7 italic">{aiAssessment.summary}</p>
          </div>
        </div>
      )}

      {/* Sections grid */}
      {activeSections.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {activeSections.map(({ key, title, headerCls, borderCls, iconWrapCls, dotCls, textCls, countCls, Icon, iconColor }) => {
            const items = aiAssessment?.[key] as string[];
            return (
              <div key={key} className={`rounded-2xl border bg-white overflow-hidden ${borderCls}`}>
                <div className={`flex items-center gap-2.5 px-4 py-3 border-b ${headerCls}`}>
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${iconWrapCls}`}>
                    <Icon size={13} color={iconColor} />
                  </div>
                  <span className="text-[0.78rem] font-bold text-slate-800">{title}</span>
                  <span className={`ml-auto text-[0.65rem] font-bold px-1.5 py-0.5 rounded-full ${countCls}`}>
                    {items.length}
                  </span>
                </div>
                <div className="px-4 py-3 flex flex-col gap-2">
                  {items.map((text, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className={`w-1.5 h-1.5 rounded-full mt-[5px] shrink-0 ${dotCls}`} />
                      <span className={`text-sm leading-relaxed ${textCls}`}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Candidate profile */}
      {candidateProfile && (
        <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3 border-b border-slate-100 bg-slate-50">
            <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
              <PersonOutlined size={13} color="#3B82F6" />
            </div>
            <span className="text-[0.78rem] font-bold text-slate-700">Candidate Profile</span>
          </div>
          <div className="px-5 py-4 flex flex-col gap-4">
            {(candidateProfile.communicationStyle?.verbosity || candidateProfile.communicationStyle?.confidenceLevel) && (
              <div className="flex items-start gap-6">
                <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest min-w-[90px] pt-0.5">Communication</span>
                <div className="flex gap-1.5 flex-wrap">
                  {candidateProfile.communicationStyle?.verbosity && (
                    <span className="h-5 px-2 rounded-full text-[0.7rem] font-semibold flex items-center border bg-blue-50 text-blue-700 border-blue-200">
                      {candidateProfile.communicationStyle.verbosity}
                    </span>
                  )}
                  {candidateProfile.communicationStyle?.confidenceLevel && (
                    <span className="h-5 px-2 rounded-full text-[0.7rem] font-semibold flex items-center border bg-violet-50 text-violet-700 border-violet-200">
                      {candidateProfile.communicationStyle.confidenceLevel}
                    </span>
                  )}
                </div>
              </div>
            )}
            {(candidateProfile.revealedExpertise?.length ?? 0) > 0 && (
              <div className="flex items-start gap-6">
                <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest min-w-[90px] pt-0.5">Expertise</span>
                <div className="flex gap-1.5 flex-wrap">
                  {candidateProfile.revealedExpertise!.slice(0, 6).map((e, i) => (
                    <span key={i} className="h-5 px-2 rounded-full text-[0.7rem] font-semibold flex items-center border bg-teal-50 text-teal-700 border-teal-200">
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {(candidateProfile.revealedGaps?.length ?? 0) > 0 && (
              <div className="flex items-start gap-6">
                <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest min-w-[90px] pt-0.5">Gaps</span>
                <div className="flex gap-1.5 flex-wrap">
                  {candidateProfile.revealedGaps!.slice(0, 6).map((g, i) => (
                    <span key={i} className="h-5 px-2 rounded-full text-[0.7rem] font-semibold flex items-center border bg-amber-50 text-amber-700 border-amber-200">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {candidateProfile.difficultyLevel && (
              <div className="flex items-center gap-6">
                <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest min-w-[90px]">Difficulty</span>
                <span className="text-sm font-semibold text-slate-700 capitalize">{candidateProfile.difficultyLevel}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommended focus */}
      {(aiAssessment?.recommendedFocus?.length ?? 0) > 0 && (
        <div className="rounded-2xl border border-amber-100 bg-white overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3 border-b border-amber-100 bg-amber-50">
            <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center">
              <TrendingUpOutlined size={13} color="#D97706" />
            </div>
            <span className="text-[0.78rem] font-bold text-slate-700">Recommended Focus</span>
          </div>
          <div className="px-5 py-4 flex gap-1.5 flex-wrap">
            {aiAssessment!.recommendedFocus.map((f, i) => (
              <span key={i} className="h-6 px-2.5 rounded-full border text-[0.73rem] font-semibold capitalize flex items-center bg-amber-50 text-amber-700 border-amber-200">
                {f.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AiReportTab;
