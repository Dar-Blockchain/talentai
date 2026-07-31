import React from 'react';
import { Building2, Briefcase, MapPin, Banknote, Calendar, CalendarX2 } from 'lucide-react';
import { formatSalary } from '@/modules/company/posts/utils/postHelpers';
import { fmtDate } from '@/utils/functions';
import { SectionCard, MetaBadge } from './JobPanelShared';
import type { JobDetails } from '../../types/api';

interface JobHeaderCardProps {
  jobTitle: string;
  companyName: string;
  jd: JobDetails;
  createdAt?: string;
  expirationDate?: string;
}

export default function JobHeaderCard({ jobTitle, companyName, jd, createdAt, expirationDate }: JobHeaderCardProps) {
  return (
    <SectionCard>
      <div className="flex items-start gap-4 mb-5">
        <div
          className="w-[52px] h-[52px] rounded-[14px] shrink-0 flex items-center justify-center border border-primary/20 bg-primary/8"
        >
          <Building2 size={24} className="text-primary" />
        </div>
        <div>
          <p className="font-[Poppins] font-extrabold text-[1.2rem] md:text-[1.45rem] text-[#111827] leading-[1.2]">
            {jobTitle}
          </p>
          <p className="font-[Poppins] text-[0.88rem] text-[#6B7280] mt-1">
            {companyName}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {jd.workMode       && <MetaBadge icon={<MapPin size={14} />}      label={jd.workMode}                              color="#2563EB" bg="#EFF6FF" border="#BFDBFE" />}
        {jd.employmentType && <MetaBadge icon={<Briefcase size={14} />}   label={jd.employmentType}                        color="#7C3AED" bg="#F5F3FF" border="#DDD6FE" />}
        {jd.salary && formatSalary(jd.salary) && <MetaBadge icon={<Banknote size={14} />} label={formatSalary(jd.salary)} color="#16A34A" bg="#F0FDF4" border="#BBF7D0" />}
        {createdAt         && <MetaBadge icon={<Calendar size={14} />}    label={fmtDate(createdAt)}                       color="#6B7280" bg="#F9FAFB" border="#E5E7EB" />}
        {expirationDate    && <MetaBadge icon={<CalendarX2 size={14} />}  label={`Expires ${fmtDate(expirationDate)}`}     color="#DC2626" bg="#FEF2F2" border="#FECACA" />}
      </div>
    </SectionCard>
  );
}
