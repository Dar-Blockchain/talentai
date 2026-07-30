import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { RootState } from "@/store/store";
import { useToast } from "@/hooks/useToast";
import { Sparkles, Brain as PsychologyOutlined, Code2 as CodeOutlined, Users as PeopleOutlined } from "lucide-react";

const T    = "#0D9488";
const TBG  = "#F0FDFA";
const TBD  = "#99F6E4";
const NAVY = "#0D1B2A";
const MONTHLY_TEST_QUOTA = 5;

const SkillsHeader: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const s = (k: string, opts?: any) => t(`candidate.skills.${k}`, opts) as string;
  const { showToast } = useToast();

  const profile = useSelector((state: RootState) => state.user.connectedUser.profile);
  const techSkills = profile?.skills?.length ?? 0;
  const softSkills = profile?.softSkills?.length ?? 0;
  const quota      = profile?.quota ?? 0;
  const isLimitReached = quota >= MONTHLY_TEST_QUOTA;

  const handleUpgradeClick = () => showToast({ message: s("upgrade_toast"), severity: "info" });

  return (
    <div className="bg-white rounded-[18px] border border-[#E5E7EB] p-6 mb-5 overflow-hidden relative">
      <div className="absolute -top-[50px] -right-[50px] w-[180px] h-[180px] rounded-full pointer-events-none" style={{ backgroundColor: `${T}07` }} />

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-[42px] h-[42px] rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: TBG, border: `1px solid ${TBD}` }}
          >
            <PsychologyOutlined size={22} color={T} />
          </div>
          <div>
            <p className="text-[1.2rem] font-black leading-none" style={{ color: NAVY }}>{s("title")}</p>
            <p className="text-[0.75rem] text-[#9CA3AF] mt-0.5">{s("subtitle", { count: techSkills + softSkills })}</p>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          {[
            { icon: CodeOutlined,   labelKey: "technical", value: techSkills, color: "#2563EB" },
            { icon: PeopleOutlined, labelKey: "soft",      value: softSkills, color: "#D97706" },
          ].map(({ icon: Icon, labelKey, value, color }) => (
            <div
              key={labelKey}
              className="text-center px-3.5 py-2 rounded-xl min-w-16"
              style={{ backgroundColor: `${color}0D`, border: `1px solid ${color}25` }}
            >
              <p className="text-[1.1rem] font-black leading-none" style={{ color }}>{value}</p>
              <p className="text-[0.62rem] text-[#9CA3AF] font-medium mt-0.5">{s(labelKey)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-[#F3F4F6]">
        <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-[0.72rem] text-[#6B7280] font-semibold">{s("monthly_quota")}</span>
            <span
              className="text-[0.58rem] font-bold uppercase tracking-wide px-1.5 py-[1px] rounded-full"
              style={{ backgroundColor: `${T}12`, color: T }}
            >
              {s("free_badge")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[0.72rem] font-extrabold" style={{ color: isLimitReached ? "#DC2626" : T }}>
              {s("quota_used", { used: quota })}
            </span>
            {isLimitReached && (
              <button
                type="button"
                onClick={handleUpgradeClick}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-[0.62rem] font-bold text-white cursor-pointer transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#DC2626" }}
              >
                <Sparkles size={10} />
                {s("upgrade")}
              </button>
            )}
          </div>
        </div>
        <p className="text-[0.68rem] text-[#9CA3AF] mb-1.5">{s("quota_subtitle")}</p>
        <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-[600ms] ease-out"
            style={{ width: `${Math.min(100, (quota / MONTHLY_TEST_QUOTA) * 100)}%`, backgroundColor: isLimitReached ? "#DC2626" : T }}
          />
        </div>
        {isLimitReached && (
          <p className="text-[0.67rem] text-[#DC2626] mt-1 font-medium">
            {s("quota_limit")}
          </p>
        )}
      </div>
    </div>
  );
};

export default SkillsHeader;
