"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AppUserInfoProps {
  name: string;
  subtitle?: string;
  icon?: React.ReactNode;
  iconBgColor?: string;
  className?: string;
}

const AppUserInfo: React.FC<AppUserInfoProps> = ({ name, subtitle, icon, iconBgColor = "#F0FDFA", className }) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {icon && (
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: iconBgColor }}
        >
          {icon}
        </div>
      )}
      <div className="flex flex-col">
        <p className="text-[18px] font-bold leading-[1.3] text-gray-900">{name}</p>
        {subtitle && (
          <p className="text-xs font-normal leading-[1.4] text-gray-400">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default AppUserInfo;
