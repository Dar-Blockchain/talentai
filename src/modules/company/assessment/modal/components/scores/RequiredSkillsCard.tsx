import React from "react";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlined      from "@mui/icons-material/CancelOutlined";
import { PostAssessmentData } from "../../types";

interface Props {
  requiredSkills: PostAssessmentData["requiredSkills"];
}

const RequiredSkillsCard: React.FC<Props> = ({ requiredSkills }) => {
  if (!requiredSkills || requiredSkills.all.length === 0) return null;

  const met  = requiredSkills.all.filter(s => requiredSkills.demonstrated.includes(s));
  const pct  = Math.round((met.length / requiredSkills.all.length) * 100);
  const pctColor = pct >= 70 ? "bg-emerald-50 text-emerald-700" : pct >= 40 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700";

  return (
    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
      <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between">
        <span className="text-[0.78rem] font-bold text-slate-700">Required Skills</span>
        <span className={`text-[0.7rem] font-extrabold px-2 py-0.5 rounded-full ${pctColor}`}>
          {met.length}/{requiredSkills.all.length} met
        </span>
      </div>
      <div className="px-5 py-4 flex flex-wrap gap-1.5">
        {requiredSkills.all.map((skill, i) => {
          const ismet = requiredSkills.demonstrated.includes(skill);
          return (
            <span
              key={i}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[0.72rem] font-semibold ${
                ismet
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              {ismet
                ? <CheckCircleOutlined style={{ fontSize: 11, color: "#10B981" }} />
                : <CancelOutlined     style={{ fontSize: 11, color: "#EF4444" }} />}
              {skill}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default RequiredSkillsCard;
