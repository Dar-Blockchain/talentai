"use client";

import React from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Trophy, CheckCircle2, Circle, ArrowRight, FileEdit,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/modules/shared/ui/shadcn/avatar";
import { Badge } from "@/modules/shared/ui/shadcn/badge";
import { Separator } from "@/modules/shared/ui/shadcn/separator";
import { Card } from "@/modules/shared/ui/shadcn/card";
import { cn } from "@/lib/utils";
import { RootState } from "@/store/store";
import { useApplicationStatsQuery } from "@/modules/candidate/applications/queries/useApplicationsQuery";

// ─── ProfileCard ──────────────────────────────────────────────────────────────

interface ProfileCardProps {
  displayName: string;
  email?: string;
  initial: string;
  avatarUrl?: string;
  targetRole?: string;
  experienceLevel?: string;
  totalApplications: number;
  totalInterviews: number;
  labelApplications: string;
  labelInterviews: string;
  editProfileLabel: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  displayName, email, initial, avatarUrl,
  targetRole, experienceLevel,
  totalApplications, totalInterviews,
  labelApplications, labelInterviews,
  editProfileLabel,
}) => (
  <Card className="gap-0 py-0 overflow-hidden">

    <div className="p-3.5 flex flex-col gap-2.5">
      {/* Identity */}
      <div className="flex items-center gap-3">
        <Avatar className="size-11 rounded-xl border border-gray-200 shrink-0">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback className="rounded-xl bg-gray-100 text-gray-500 font-bold">
            {initial}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold leading-tight text-gray-900 truncate">{displayName}</p>
          {email && (
            <p className="text-[0.7rem] text-gray-400 mt-0.5 truncate">{email}</p>
          )}
        </div>
      </div>

      {(targetRole || experienceLevel) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {targetRole && (
            <Badge
              variant="outline"
              className="text-[0.65rem] h-5 px-2 font-semibold bg-gray-100 border-gray-200 text-gray-700"
            >
              {targetRole}
            </Badge>
          )}
          {experienceLevel && (
            <div className="flex items-center gap-1">
              <Trophy className="size-3 text-gray-400 shrink-0" />
              <span className="text-[0.68rem] text-gray-500 font-medium">{experienceLevel}</span>
            </div>
          )}
        </div>
      )}
    </div>

    <Separator />

    {/* Stats — plain figures, no per-stat color coding */}
    <div className="grid grid-cols-2 divide-x divide-gray-100">
      <div className="flex flex-col items-center justify-center gap-0.5 py-2.5">
        <span className="text-base font-extrabold text-gray-900 leading-none">{totalApplications}</span>
        <span className="text-[0.63rem] text-gray-400 font-medium">{labelApplications}</span>
      </div>
      <div className="flex flex-col items-center justify-center gap-0.5 py-2.5">
        <span className="text-base font-extrabold text-gray-900 leading-none">{totalInterviews}</span>
        <span className="text-[0.63rem] text-gray-400 font-medium">{labelInterviews}</span>
      </div>
    </div>

    <Separator />

    <Link
      href="/settings"
      className="group flex items-center gap-2 px-3.5 py-2.5 text-[0.72rem] font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
    >
      <FileEdit className="size-3.5 shrink-0" />
      <span className="flex-1">{editProfileLabel}</span>
      <ArrowRight className="size-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  </Card>
);

// ─── ProfileStrengthCard ──────────────────────────────────────────────────────

interface ChecklistItem { label: string; done: boolean; href?: string }

const RING_R = 27;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R;

interface ProfileStrengthCardProps {
  checklist: ChecklistItem[];
  label: string;
  completeLabel: string;
}

const ProfileStrengthCard: React.FC<ProfileStrengthCardProps> = ({ checklist, label, completeLabel }) => {
  const done  = checklist.filter(c => c.done).length;
  const total = checklist.length;
  const pct   = Math.round((done / total) * 100);
  const isComplete = done === total;

  // Outstanding items surface first -- once something is done it's no
  // longer actionable, so it fades to the bottom instead of competing for
  // attention with what's actually left to do.
  const ordered = [...checklist].sort((a, b) => Number(a.done) - Number(b.done));

  return (
    <Card className="gap-0 py-0 p-3.5">

      <p className="text-[0.8rem] font-bold text-gray-900 mb-3">{label}</p>

      <div className="flex items-center gap-3.5">
        {/* Progress ring — the logo's own mint-green fill on its light tint,
            percentage in the brand's deep-green (high-contrast, not the
            washed-out bright accent) so it reads clearly on white. */}
        <div className="relative shrink-0 size-16">
          <svg viewBox="0 0 64 64" className="size-16 -rotate-90">
            <circle cx="32" cy="32" r={RING_R} fill="none" strokeWidth="6" style={{ stroke: "var(--color-primary-light)" }} />
            <circle
              cx="32" cy="32" r={RING_R} fill="none" strokeWidth="6" strokeLinecap="round"
              style={{
                stroke: "var(--color-primary)",
                strokeDasharray: RING_CIRCUMFERENCE,
                strokeDashoffset: RING_CIRCUMFERENCE * (1 - pct / 100),
                transition: "stroke-dashoffset 300ms ease",
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[0.8rem] font-extrabold text-primary-dark">{pct}%</span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className={cn("text-[0.75rem] font-bold", isComplete ? "text-primary-dark" : "text-gray-700")}>
            {isComplete ? completeLabel : `${done}/${total}`}
          </p>
        </div>
      </div>

      <Separator className="my-3" />

      {/* Checklist — done items get the brand-green check; everything else
          stays neutral so it doesn't compete with the ring's color. */}
      <div className="flex flex-col gap-0.5">
        {ordered.map((item) => {
          const clickable = !item.done && !!item.href;
          const inner = (
            <>
              {item.done
                ? <CheckCircle2 className="size-4 text-primary-dark shrink-0" />
                : <Circle       className="size-4 text-gray-300 shrink-0" />}
              <span className="flex-1">
                {item.label}
              </span>
              {clickable && (
                <ArrowRight className="size-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              )}
            </>
          );
          const cls = cn(
            "group flex items-center gap-2 px-2 py-1 -mx-2 rounded-md text-[0.72rem] transition-colors duration-150",
            clickable ? "cursor-pointer hover:bg-gray-50" : "cursor-default",
            item.done ? "text-gray-400" : "font-semibold text-gray-700",
          );
          return clickable
            ? <Link key={item.label} href={item.href!} className={cls}>{inner}</Link>
            : <div  key={item.label} className={cls}>{inner}</div>;
        })}
      </div>
    </Card>
  );
};

// ─── CandidateProfilePanel (connected) ───────────────────────────────────────

const CandidateProfilePanel: React.FC = () => {
  const { t }   = useTranslation("dashboard");
  const profile = useSelector((state: RootState) => state.user.connectedUser.profile);
  const user    = useSelector((state: RootState) => state.user.connectedUser.user);

  const { data: stats } = useApplicationStatsQuery();

  const totalApplications = stats?.totalApplications ?? 0;
  const totalInterviews   = stats?.totalInterviews   ?? 0;

  const displayName = profile?.firstName
    ? `${profile.firstName}${profile.lastName ? ` ${profile.lastName}` : ""}`
    : user?.username || "Candidate";
  const initial   = displayName[0]?.toUpperCase() || "C";
  const avatarUrl = profile?.user_image
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}uploads/images/${profile.user_image}`
    : undefined;

  const checklist = [
    { label: t("candidate.checklist.complete_profile"), done: !!(profile?.firstName && profile?.lastName), href: "/settings" },
    { label: t("candidate.checklist.upload_resume"),    done: !!profile?.resume,                           href: "/settings" },
    { label: t("candidate.checklist.add_target_role"),  done: !!profile?.targetRole,                       href: "/settings" },
    { label: t("candidate.checklist.set_experience"),   done: !!profile?.requiredExperienceLevel,          href: "/settings" },
    { label: t("candidate.checklist.first_application"),done: totalApplications > 0,                       href: "/candidate/dashboard" },
  ];

  return (
    <>
      <ProfileCard
        displayName={displayName}
        email={user?.email}
        initial={initial}
        avatarUrl={avatarUrl}
        targetRole={profile?.targetRole}
        experienceLevel={profile?.requiredExperienceLevel}
        totalApplications={totalApplications}
        totalInterviews={totalInterviews}
        labelApplications={t("candidate.profile.applications")}
        labelInterviews={t("candidate.profile.interviews")}
        editProfileLabel={t("candidate.profile.edit_profile")}
      />
      <ProfileStrengthCard
        checklist={checklist}
        label={t("candidate.profile.profile_strength")}
        completeLabel={t("candidate.profile.profile_complete")}
      />
    </>
  );
};

export default CandidateProfilePanel;
