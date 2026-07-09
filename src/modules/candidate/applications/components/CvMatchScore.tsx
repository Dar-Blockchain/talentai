import React from "react";
import { Briefcase as BusinessCenterOutlined } from "lucide-react";
import Section from "./Section";
import { T, NAVY } from "../utils/constants";

interface CvMatchScoreProps {
  score: number;
  title: string;
  strongLabel: string;
  goodLabel: string;
  lowLabel: string;
  subtitle: (score: number) => string;
}

const CvMatchScore: React.FC<CvMatchScoreProps> = ({ score, title, strongLabel, goodLabel, lowLabel, subtitle }) => {
  const scoreColor = score >= 70 ? "#059669" : score >= 50 ? "#D97706" : "#DC2626";
  const r = 34;
  const circ = 2 * Math.PI * r;
  const filled = (Math.min(score, 100) / 100) * circ;

  return (
    <Section icon={<BusinessCenterOutlined size={14} color={T} />} title={title}>
      <div className="flex items-center gap-5">
        <div className="relative shrink-0" style={{ width: 80, height: 80 }}>
          <svg width={80} height={80} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={40} cy={40} r={r} fill="none" stroke={`${scoreColor}18`} strokeWidth={7} />
            <circle cx={40} cy={40} r={r} fill="none" stroke={scoreColor} strokeWidth={7}
              strokeDasharray={`${filled} ${circ}`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[1.1rem] font-black leading-none" style={{ color: scoreColor }}>{score}%</span>
          </div>
        </div>
        <div>
          <p className="text-[0.9rem] font-bold" style={{ color: NAVY }}>
            {score >= 70 ? strongLabel : score >= 50 ? goodLabel : lowLabel}
          </p>
          <p className="text-[0.8rem] text-[#6B7280] mt-1">
            {subtitle(score)}
          </p>
        </div>
      </div>
    </Section>
  );
};

export default CvMatchScore;
