import React, { useMemo } from 'react';
import { Video, Timer } from 'lucide-react';
import { Button } from '@/modules/shared/ui/shadcn/button';
import InterviewTimer from './InterviewTimer';
import { useTranslation } from 'react-i18next';
import { type InterviewConfig } from '../../types/interview';

interface Props {
  jobData?: any;
  interviewConfig?: InterviewConfig | null;
  isActive: boolean;
  elapsedTime?: number;
  timeWarning?: boolean;
  coverage?: number | null;
  onEndInterview: () => void;
  endInterviewLabel: string;
}

export default function InterviewSessionHeader({
  jobData,
  interviewConfig,
  isActive,
  elapsedTime,
  timeWarning,
  coverage,
  onEndInterview,
  endInterviewLabel,
}: Props) {
  const coverageColor =
    coverage == null ? null
    : coverage >= 80 ? '#16a34a'
    : coverage >= 50 ? '#d97706'
    : '#dc2626';

  const coverageLabel =
    coverage == null ? ''
    : coverage >= 80 ? 'Strong'
    : coverage >= 50 ? 'Moderate'
    : 'Building';

  const ARC_R  = 9;
  const ARC_C  = 2 * Math.PI * ARC_R;
  const arcDash = coverageColor != null ? ARC_C * (1 - (coverage ?? 0) / 100) : ARC_C;
  const { t } = useTranslation('modules/interview/interview');

  const jobTitle = useMemo(() => {
    if (jobData?.jobDetails?.title) return jobData.jobDetails.title;
    if (jobData?.title)             return jobData.title;
    const type = interviewConfig?.interviewType;
    const role = interviewConfig?.context?.targetRole;
    if (type === 'TECHNICAL_SKILL' || type === 'ASSESSMENT' || type === 'EVALUATION') {
      return role ? `${role} Assessment` : 'Technical Assessment';
    }
    if (type === 'SOFT_SKILL') {
      return role ? `${role} Assessment` : 'Soft Skills Assessment';
    }
    return t('interview_types.hr');
  }, [jobData, interviewConfig, t]);

  const companyName = useMemo(
    () =>
      jobData?.createdBy?.name ||
      jobData?.companyName ||
      interviewConfig?.context?.targetCompany ||
      jobData?.user?.username ||
      '',
    [jobData, interviewConfig],
  );

  return (
    <div className="bg-white rounded-[20px] border border-[#c8eedd] px-4 md:px-5 py-2.5 md:py-3 mb-3">
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Left */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[8px] bg-[rgba(225,248,237,1)] border border-[rgba(106,211,156,0.35)] flex items-center justify-center shrink-0">
            <Video size={16} color="#6AD39C" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans font-bold text-[0.9rem] text-[#111827] leading-tight">{jobTitle}</span>
              {isActive && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[rgba(239,68,68,0.07)] border border-[rgba(239,68,68,0.18)]">
                  <div
                    className="w-1 h-1 rounded-full bg-[#ef4444]"
                    style={{ animation: 'iv-live-blink 1.6s ease-in-out infinite' }}
                  />
                  <span className="font-sans font-bold text-[0.58rem] text-[#ef4444] tracking-[0.1em]">LIVE</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Timer size={11} color="#6B7280" />
              <span className="font-sans text-[0.7rem] text-[#6B7280]">
                {companyName ? `${companyName} · ` : ''}AI-powered · Video & Voice
              </span>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3 flex-wrap">
          {isActive && coverageColor != null && (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-[12px] border"
              style={{ background: `${coverageColor}0d`, borderColor: `${coverageColor}28` }}
            >
              {/* Mini circular arc */}
              <div className="relative w-7 h-7 shrink-0">
                <svg width="30" height="30" viewBox="0 0 30 30">
                  <circle cx="15" cy="15" r={ARC_R} fill="none" stroke={`${coverageColor}22`} strokeWidth="2.5" />
                  <circle
                    cx="15" cy="15" r={ARC_R}
                    fill="none"
                    stroke={coverageColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={ARC_C}
                    strokeDashoffset={arcDash}
                    transform="rotate(-90 15 15)"
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-sans font-extrabold text-[0.5rem] leading-none" style={{ color: coverageColor }}>
                    {coverage}
                  </span>
                </div>
              </div>
              <div>
                <p className="font-sans font-bold text-[0.7rem] text-[#374151] leading-snug">{coverage}% covered</p>
                <p className="font-sans text-[0.6rem] text-[#9ca3af] leading-none">{coverageLabel}</p>
              </div>
            </div>
          )}
          {isActive && elapsedTime !== undefined && (
            <InterviewTimer elapsedTime={elapsedTime} timeWarning={timeWarning ?? false} />
          )}
          {isActive && (
            <Button
              onClick={onEndInterview}
              className="font-sans font-bold text-[0.78rem] rounded-[10px] px-4 py-1.5 h-auto border border-[rgba(239,68,68,0.2)] bg-[#fef2f2] text-[#ef4444] shadow-none hover:bg-[#fee2e2] hover:shadow-none"
            >
              {endInterviewLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
