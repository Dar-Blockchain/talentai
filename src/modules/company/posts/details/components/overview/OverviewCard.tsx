import React from "react";
import { useTranslation } from "react-i18next";
import { Briefcase as WorkOutlined, MapPin as LocationOnOutlined, Calendar as CalendarTodayOutlined, Mic as MicOutlined } from "lucide-react";
import { Card } from "@/modules/shared/ui/shadcn/card";
import { LANG_META } from "@/modules/shared/constants/languages";
import { formatSalary } from '@/modules/company/posts/utils/postHelpers';
import { formatDate } from "@/utils/functions";
import SectionTitle from "./SectionTitle";

interface Props {
  jd: any;
  createdAt?: string;
  interviewLanguages: string[];
}

const OverviewCard: React.FC<Props> = ({ jd, createdAt, interviewLanguages }) => {
  const { t } = useTranslation("posts");

  return (
    <Card className="p-6 gap-0">
      <SectionTitle icon={<WorkOutlined size={15} />} title={t("detail.details.overview")} />

      {/* Meta chips */}
      <div className="flex flex-wrap gap-3">
        {jd.workMode && (
          <div className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5" style={{ backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" }}>
            <LocationOnOutlined size={14} color="#2563EB" />
            <span className="text-[12px] font-semibold" style={{ color: "#2563EB" }}>{jd.workMode}</span>
          </div>
        )}
        {jd.employmentType && (
          <div className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5" style={{ backgroundColor: "#F5F3FF", borderColor: "#DDD6FE" }}>
            <WorkOutlined size={14} color="#7C3AED" />
            <span className="text-[12px] font-semibold" style={{ color: "#7C3AED" }}>{jd.employmentType}</span>
          </div>
        )}
        {jd.salary && (
          <div className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5" style={{ backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" }}>
            <span className="text-[12px] font-semibold" style={{ color: "#16A34A" }}>{formatSalary(jd.salary)}</span>
          </div>
        )}
        {createdAt && (
          <div className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5" style={{ backgroundColor: "#F9FAFB", borderColor: "#E5E7EB" }}>
            <CalendarTodayOutlined size={14} color="#6B7280" />
            <span className="text-[12px] font-semibold" style={{ color: "#6B7280" }}>{formatDate(createdAt)}</span>
          </div>
        )}
      </div>

      {/* Interview languages */}
      <div className="my-4 h-px bg-gray-200" />
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <MicOutlined size={15} color="#6B7280" />
          <span className="text-[12px] font-semibold" style={{ color: "#6B7280" }}>
            {t("detail.details.interview_languages")}
          </span>
        </div>
        <div className="flex gap-1.5">
          {interviewLanguages.map((code) => {
            const meta = LANG_META[code];
            if (!meta) return null;
            return (
              <div key={code} className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1" style={{ backgroundColor: "#F0FDFA", borderColor: "#99F6E4" }}>
                <img src={`https://flagcdn.com/w40/${meta.flag}.png`} srcSet={`https://flagcdn.com/w80/${meta.flag}.png 2x`} width={20} height={14} alt={meta.label} style={{ borderRadius: 2, display: "block" }} />
                <span className="text-[11.5px] font-semibold" style={{ color: "#0D9488" }}>{meta.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Description */}
      {jd.description && (
        <>
          <div className="my-5 h-px bg-gray-200" />
          <p className="mb-2 text-[13px] font-bold text-gray-700">{t("detail.details.description")}</p>
          <p className="text-[13px] leading-[1.8] text-gray-500">{jd.description}</p>
        </>
      )}
    </Card>
  );
};

export default OverviewCard;
