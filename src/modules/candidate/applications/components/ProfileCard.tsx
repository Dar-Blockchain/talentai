import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/modules/shared/ui/shadcn/avatar";
import { Badge } from "@/modules/shared/ui/shadcn/badge";
import { Trophy as EmojiEventsOutlined } from "lucide-react";
import { T, TL, TBG, TBRD, NAVY } from "../utils/constants";

interface StatPillProps {
  label: string;
  value: number | string;
  color: string;
  bg: string;
  border: string;
}

const StatPill: React.FC<StatPillProps> = ({ label, value, color, bg, border }) => (
  <div
    className="flex-1 px-3 py-2.5 rounded-[10px] text-center"
    style={{ backgroundColor: bg, border: `1px solid ${border}` }}
  >
    <p className="text-[1.3rem] font-black leading-none" style={{ color }}>{value}</p>
    <p className="text-[0.65rem] text-[#6B7280] font-medium mt-0.5">{label}</p>
  </div>
);

interface ProfileCardProps {
  displayName: string;
  email?: string;
  initial: string;
  avatarUrl?: string;
  targetRole?: string;
  experienceLevel?: string;
  stats: StatPillProps[];
}

const ProfileCard: React.FC<ProfileCardProps> = ({ displayName, email, initial, avatarUrl, targetRole, experienceLevel, stats }) => (
  <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
    <div className="h-14 relative" style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${T} 100%)` }}>
      <div
        className="absolute top-1/2 right-4 -translate-y-1/2 w-8 h-8 rounded-full"
        style={{ backgroundColor: `${TL}30`, border: `1px solid ${TL}40` }}
      />
    </div>
    <div className="px-4 pb-4">
      <div className="-mt-6 mb-2">
        <Avatar className="w-[52px] h-[52px] border-[2.5px] border-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback
            className="text-[1.2rem] font-bold text-white"
            style={{ backgroundColor: T }}
          >
            {initial}
          </AvatarFallback>
        </Avatar>
      </div>
      <p className="font-extrabold text-[0.95rem] leading-tight" style={{ color: NAVY }}>{displayName}</p>
      {email && <p className="text-[0.72rem] text-[#9CA3AF] mt-0.5 mb-2">{email}</p>}
      {targetRole && (
        <Badge
          variant="outline"
          className="text-[0.65rem] h-5 rounded-full font-semibold mb-2"
          style={{ backgroundColor: TBG, borderColor: TBRD, color: T }}
        >
          {targetRole}
        </Badge>
      )}
      {experienceLevel && (
        <div className="flex items-center gap-1">
          <EmojiEventsOutlined size={12} color="#D97706" />
          <span className="text-[0.7rem] text-[#6B7280] font-medium">{experienceLevel}</span>
        </div>
      )}
      <div className="border-t border-[#E5E7EB] my-3" />
      <div className="flex gap-2">
        {stats.map((stat) => (
          <StatPill key={stat.label} {...stat} />
        ))}
      </div>
    </div>
  </div>
);

export default ProfileCard;
