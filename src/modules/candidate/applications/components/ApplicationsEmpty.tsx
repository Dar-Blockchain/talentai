import React from "react";
import { Briefcase } from "lucide-react";

interface Props {
  title: string;
  subtitle: string;
}

const ApplicationsEmpty: React.FC<Props> = ({ title, subtitle }) => (
  <div className="py-16 flex flex-col items-center text-center px-4">
    <div className="size-12 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center mb-3">
      <Briefcase className="size-5 text-gray-300" />
    </div>
    <p className="text-[0.88rem] font-semibold text-gray-800 mb-1">{title}</p>
    <p className="text-[0.78rem] text-gray-400 max-w-xs">{subtitle}</p>
  </div>
);

export default ApplicationsEmpty;
