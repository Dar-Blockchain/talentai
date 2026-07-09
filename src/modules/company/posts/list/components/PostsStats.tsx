import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { Briefcase as WorkOutlineOutlined, CheckCircle2 as CheckCircleOutline, FileEdit as EditNoteOutlined, Clock as AccessTimeOutlined } from "lucide-react";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { usePostMetricsQuery } from "../queries";

const CARD_DEFS = [
  { key: "total",  Icon: WorkOutlineOutlined, color: "#0D9488", bg: "#F0FDFA" },
  { key: "active", Icon: CheckCircleOutline,  color: "#10B981", bg: "#F0FDF4" },
  { key: "draft",  Icon: EditNoteOutlined,    color: "#D97706", bg: "#FFFBEB" },
  { key: "closed", Icon: AccessTimeOutlined,  color: "#DC2626", bg: "#FEF2F2" },
] as const;

const PostsStats: React.FC = memo(() => {
  const { t } = useTranslation("posts");
  const { data: metrics, isLoading } = usePostMetricsQuery();

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
      {CARD_DEFS.map(({ key, Icon, color, bg }) => (
        <div key={key} className="flex items-center gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-5">
          <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px]" style={{ backgroundColor: bg }}>
            <Icon size={20} color={color} />
          </div>
          <div>
            {isLoading
              ? <Skeleton className="h-7 w-[50px]" />
              : <p className="text-[1.4rem] leading-none font-extrabold text-[#111827]">{(metrics as any)?.[key] ?? 0}</p>
            }
            <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-wider text-[#9CA3AF]">{t(`stats.${key}`)}</p>
          </div>
        </div>
      ))}
    </div>
  );
});

PostsStats.displayName = "PostsStats";
export default PostsStats;
