import React from "react";
import axiosInstance from "@/utils/axiosInstance";
import { UserPlus as UserPlusOutlined, FileText as FileTextOutlined, Pencil as PencilOutlined, Network as NetworkOutlined, Megaphone as MegaphoneOutlined } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TFunction } from "i18next";

const sel = (r: any) => r.data?.data ?? r.data;
export const fetchRecentActivity = (limit: number) =>
  axiosInstance.get("company-memberships/memberships/recent-activity", { params: { limit } }).then(sel);

export type ActivityType = "member_joined" | "post_created" | "post_edited" | "department_created" | "department_edited" | "campaign_created";
export interface Activity { type: ActivityType; name: string; userId: string; label: string | null; entityId: string | null; createdAt: string }

export const ICONS: Record<ActivityType, { icon: React.ElementType; color: string; bg: string }> = {
  member_joined:        { icon: UserPlusOutlined,  color: "#A855F7", bg: "#FDF4FF" },
  post_created:          { icon: FileTextOutlined,  color: "#0EA5E9", bg: "#F0F9FF" },
  post_edited:           { icon: PencilOutlined,     color: "#6366F1", bg: "#EEF2FF" },
  department_created:    { icon: NetworkOutlined,    color: "#0EA5E9", bg: "#F0F9FF" },
  department_edited:     { icon: PencilOutlined,     color: "#6366F1", bg: "#EEF2FF" },
  campaign_created:      { icon: MegaphoneOutlined, color: "#F59E0B", bg: "#FFFBEB" },
};

// Collapses the 6 granular activity types into the 4 categories the full
// activity page's summary strip counts by.
export type ActivityCategory = "members" | "posts" | "departments" | "campaigns";
export const CATEGORY: Record<ActivityType, ActivityCategory> = {
  member_joined:      "members",
  post_created:        "posts",
  post_edited:         "posts",
  department_created:  "departments",
  department_edited:   "departments",
  campaign_created:    "campaigns",
};

const TEXT: Record<ActivityType, { key: string; fallback: string }> = {
  member_joined:      { key: "team.recent_activity.member_joined",     fallback: "joined the team" },
  post_created:        { key: "team.recent_activity.post_created",       fallback: "created a post" },
  post_edited:         { key: "team.recent_activity.post_edited",        fallback: "edited a post" },
  department_created:  { key: "team.recent_activity.department_created", fallback: "created a department" },
  department_edited:   { key: "team.recent_activity.department_edited",  fallback: "edited a department" },
  campaign_created:    { key: "team.recent_activity.campaign_created",   fallback: "created a campaign" },
};

// Entity the label refers to, per activity type — where to send a click on it.
const ENTITY_ROUTE: Partial<Record<ActivityType, (id: string) => string>> = {
  post_created:        (id) => `/company/posts/${id}`,
  post_edited:         (id) => `/company/posts/${id}`,
  department_created:  (id) => `/company/departments/${id}`,
  department_edited:   (id) => `/company/departments/${id}`,
  campaign_created:    (id) => `/company/campaigns/${id}`,
};

export function formatRelative(dateStr: string, lang: string): { label: string; isRecent: boolean } {
  const d = new Date(dateStr);
  const diffMs = Date.now() - d.getTime();
  const hours = diffMs / (60 * 60 * 1000);
  if (hours < 1) return { label: "now", isRecent: true };
  if (hours < 24) return { label: `${Math.floor(hours)}h`, isRecent: false };
  const days = Math.floor(hours / 24);
  if (days < 7) return { label: `${days}d`, isRecent: false };
  return { label: d.toLocaleDateString(lang?.startsWith("fr") ? "fr-FR" : "en-US", { month: "short", day: "numeric" }), isRecent: false };
}

export interface ActivityRow {
  key: string;
  meta: { icon: React.ElementType; color: string; bg: string };
  name: string; userId: string;
  verb: string; label: string | null; entityHref?: string;
  time: string; isRecent: boolean;
  createdAt: string;
}

export function toActivityRows(activities: Activity[], t: TFunction, lang: string): ActivityRow[] {
  return activities.map((a, i) => {
    const meta = ICONS[a.type];
    const { key, fallback } = TEXT[a.type];
    const verb = t(key, fallback);
    const entityHref = a.entityId ? ENTITY_ROUTE[a.type]?.(a.entityId) : undefined;
    const { label: time, isRecent } = formatRelative(a.createdAt, lang);
    return {
      key: `${a.type}-${i}-${a.createdAt}`, meta,
      name: a.name, userId: a.userId,
      verb, label: a.label, entityHref,
      time, isRecent,
      createdAt: a.createdAt,
    };
  });
}

export const ActivityCard: React.FC<{ row: ActivityRow; onNavigate: (href: string) => void }> = ({ row, onNavigate }) => (
  <div
    className={cn(
      "flex gap-2 p-2 rounded-lg border border-slate-100 bg-white transition-all duration-150 hover:border-slate-200 hover:shadow-[0_2px_8px_-4px_rgba(15,23,42,0.10)]",
      row.label ? "items-start" : "items-center",
    )}
  >
    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: row.meta.bg }}>
      <row.meta.icon size={12} color={row.meta.color} />
    </div>

    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <div className="text-[11.5px] leading-snug truncate">
          <button
            type="button"
            onClick={() => onNavigate(`/company/employees/${row.userId}`)}
            className="cursor-pointer font-semibold text-slate-800 hover:text-indigo-600 hover:underline underline-offset-2 align-baseline"
          >
            {row.name}
          </button>
          {" "}
          <span className="text-slate-500">{row.verb}</span>
        </div>

        <span className="shrink-0 flex items-center gap-1 text-[10px] font-medium text-slate-400 mt-0.5">
          {row.isRecent && <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />}
          {row.time}
        </span>
      </div>

      {row.label && (
        row.entityHref ? (
          <button
            type="button"
            title={row.label}
            onClick={() => onNavigate(row.entityHref!)}
            className="cursor-pointer mt-1 inline-flex max-w-full items-center rounded border px-1 py-[0.5px] text-[10px] font-semibold hover:underline underline-offset-2"
            style={{ color: row.meta.color, borderColor: `${row.meta.color}33`, background: `${row.meta.color}0F` }}
          >
            <span className="truncate">{row.label}</span>
          </button>
        ) : (
          <div
            title={row.label}
            className="mt-1 inline-flex max-w-full items-center rounded border px-1 py-[0.5px] text-[10px] font-semibold"
            style={{ color: row.meta.color, borderColor: `${row.meta.color}33`, background: `${row.meta.color}0F` }}
          >
            <span className="truncate">{row.label}</span>
          </div>
        )
      )}
    </div>
  </div>
);
